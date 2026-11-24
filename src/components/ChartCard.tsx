/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Download, Table, BarChart3, AlertCircle, Info, X } from 'lucide-react';

interface ChartCardProps {
  titulo: string;
  subtitulo?: string;
  n?: number;
  baseDescricao?: string;
  option: any;
  altura?: number;
  carregando?: boolean;
  avisoAmostraPequena?: boolean;
  avisoCustomizado?: string;
  elementoCabecalho?: React.ReactNode;
  infoTooltip?: React.ReactNode;
  infoTitulo?: string;
  tabelaDados?: { cabecalhos: string[]; linhas: (string | number)[][] };
  notaRodape?: string;
  fonte?: string;
  classeExtra?: string;
  /** Callback de clique num elemento do gráfico (ex: barra), repassado ao evento 'click' do ECharts. */
  aoClicarGrafico?: (params: any) => void;
}

type TabelaGrafico = { cabecalhos: string[]; linhas: (string | number)[][] };

const comoLista = (v: any): any[] => (Array.isArray(v) ? v : v ? [v] : []);

/** Lê o valor numérico de um item de série do ECharts (número, objeto {value} ou par [x, y]). */
function valorDoItem(item: any): string | number {
  if (item === null || item === undefined || item === '-') return '';
  if (typeof item === 'number' || typeof item === 'string') return item;
  if (Array.isArray(item)) return valorDoItem(item[item.length - 1]);
  if (typeof item === 'object' && 'value' in item) return valorDoItem(item.value);
  return '';
}

/**
 * Monta uma tabela com os mesmos dados do gráfico, a partir das opções do ECharts.
 * Cobre gráficos de barras/linhas com eixo de categorias e gráficos de pizza/rosca;
 * para outros tipos retorna null (nesse caso a página deve informar `tabelaDados`).
 */
export function extrairTabelaDoGrafico(option: any): TabelaGrafico | null {
  if (!option) return null;
  const series = comoLista(option.series).filter(
    // ignora séries auxiliares invisíveis (ex.: a que só escreve o total na ponta da barra)
    (s: any) => s && s.itemStyle?.color !== 'transparent'
  );
  if (series.length === 0) return null;

  // Pizza / rosca
  if (series.every((s: any) => s.type === 'pie')) {
    const linhas: (string | number)[][] = [];
    series.forEach((s: any) =>
      comoLista(s.data).forEach((d: any) => linhas.push([String(d?.name ?? ''), valorDoItem(d)]))
    );
    return linhas.length ? { cabecalhos: ['Categoria', 'Valor'], linhas } : null;
  }

  // Barras / linhas com eixo de categorias
  const eixoX = comoLista(option.xAxis)[0];
  const eixoY = comoLista(option.yAxis)[0];
  const eixoCat = eixoX?.type === 'category' && eixoX.data ? eixoX : eixoY?.type === 'category' && eixoY.data ? eixoY : null;
  if (!eixoCat || !series.every((s: any) => s.type === 'bar' || s.type === 'line')) return null;

  const categorias: string[] = comoLista(eixoCat.data).map((c: any) => String(c?.value ?? c));
  let linhas = categorias.map((cat, i) => [cat.replace(/\n/g, ' '), ...series.map((s: any) => valorDoItem(comoLista(s.data)[i]))]);
  // No eixo vertical o ECharts desenha o índice 0 embaixo: invertemos para a tabela seguir a ordem visual
  if (eixoCat === eixoY) linhas = linhas.reverse();
  return {
    cabecalhos: [eixoCat.name || 'Categoria', ...series.map((s: any, i: number) => s.name || `Série ${i + 1}`)],
    linhas,
  };
}

function TabelaDados({ titulo, tabela }: { titulo: string; tabela: TabelaGrafico }) {
  return (
    <table className="w-full text-left text-sm border-collapse">
      <caption className="sr-only">{titulo}</caption>
      <thead className="bg-superficie-2 sticky top-0 text-texto font-semibold border-b border-borda">
        <tr>
          {tabela.cabecalhos.map((c, i) => (
            <th key={i} scope="col" className="px-3 py-2">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-borda">
        {tabela.linhas.map((l, idx) => (
          <tr key={idx} className="hover:bg-realce transition-colors">
            {l.map((val, cellIdx) => {
              const conteudo = typeof val === 'number' ? val.toLocaleString('pt-BR') : val;
              return cellIdx === 0 ? (
                <th key={cellIdx} scope="row" className="px-3 py-2 font-medium text-texto">
                  {conteudo}
                </th>
              ) : (
                <td key={cellIdx} className="px-3 py-2 text-texto-2">
                  {conteudo}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const ChartCard: React.FC<ChartCardProps> = ({
  titulo,
  subtitulo,
  n,
  baseDescricao,
  option,
  altura = 350,
  carregando = false,
  avisoAmostraPequena = false,
  avisoCustomizado,
  elementoCabecalho,
  infoTooltip,
  infoTitulo,
  tabelaDados,
  notaRodape,
  fonte = 'Fonte: Questionário aplicado com 4.857 respondentes',
  classeExtra = '',
  aoClicarGrafico,
}) => {
  const chartRef = useRef<any>(null);
  const [mostrarTabela, setMostrarTabela] = useState(false);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const rotuloInfo = infoTitulo || 'Informações e Metodologia';
  // Tabela informada pela página ou, na falta dela, extraída das próprias opções do gráfico
  const tabela = useMemo(() => tabelaDados ?? extrairTabelaDoGrafico(option), [tabelaDados, option]);

  // Garantir redimensionamento correto do ECharts quando os dados mudam ou a tela é redimensionada
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        const echartInstance = chartRef.current.getEchartsInstance?.();
        if (echartInstance) {
          echartInstance.resize();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    const timeout = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [option, carregando, mostrarTabela]);

  const baixarImagemPng = () => {
    if (chartRef.current) {
      const echartInstance = chartRef.current.getEchartsInstance();
      const base64 = echartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${titulo.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
      link.href = base64;
      link.click();
    }
  };

  return (
    <div className={`bg-superficie rounded-xl border border-borda shadow-sm p-5 flex flex-col justify-between ${classeExtra}`}>
      {/* Cabeçalho */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-texto leading-snug">{titulo}</h3>
              {infoTooltip && (
                <div
                  className="relative inline-block"
                  onMouseEnter={() => setMostrarInfo(true)}
                  onMouseLeave={() => setMostrarInfo(false)}
                >
                  <button
                    type="button"
                    onClick={() => setMostrarInfo(!mostrarInfo)}
                    onKeyDown={(e) => e.key === 'Escape' && setMostrarInfo(false)}
                    title={rotuloInfo}
                    aria-label={rotuloInfo}
                    aria-expanded={mostrarInfo}
                    className={`flex items-center justify-center w-7 h-7 rounded-full border transition-all ${
                      mostrarInfo
                        ? 'bg-marca/20 text-marca border-marca/60 shadow-xs'
                        : 'bg-superficie-2 text-marca border-borda hover:bg-realce hover:text-marca'
                    }`}
                  >
                    <Info className="w-4 h-4" aria-hidden="true" />
                  </button>

                  {/* Popover / Tooltip ao passar o cursor ou clicar */}
                  {mostrarInfo && (
                    <div
                      role="dialog"
                      aria-label={rotuloInfo}
                      className="absolute left-0 top-full mt-2 z-50 w-72 sm:w-96 md:w-[440px] max-w-[calc(100vw-2.5rem)] p-4 bg-superficie border border-marca-borda rounded-xl shadow-2xl text-sm text-texto animate-in fade-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.key === 'Escape' && setMostrarInfo(false)}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-borda">
                        <span className="font-bold text-marca text-xs flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-marca" />
                          {rotuloInfo}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMostrarInfo(false)}
                          className="flex items-center justify-center w-7 h-7 rounded text-texto-3 hover:text-texto transition-colors"
                          title="Fechar"
                          aria-label="Fechar informações"
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="text-sm text-texto-2 leading-relaxed">
                        {infoTooltip}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {(subtitulo || n !== undefined) && (
              <p className="text-sm text-texto-3 mt-0.5">
                {subtitulo}
                {n !== undefined && (
                  <>
                    {subtitulo ? ' • ' : ''}
                    <strong className="font-semibold text-texto-2">Total: {n.toLocaleString('pt-BR')}</strong>
                  </>
                )}{' '}
                {baseDescricao && `(${baseDescricao})`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {tabela && (
              <button
                type="button"
                onClick={() => setMostrarTabela(!mostrarTabela)}
                aria-pressed={mostrarTabela}
                title={mostrarTabela ? 'Exibir gráfico' : 'Exibir os dados em tabela'}
                className="flex items-center gap-1.5 min-h-9 px-2.5 rounded-lg border border-borda-forte text-sm font-medium text-texto-2 hover:bg-realce transition-colors"
              >
                {mostrarTabela ? <BarChart3 className="w-4 h-4" aria-hidden="true" /> : <Table className="w-4 h-4" aria-hidden="true" />}
                <span>{mostrarTabela ? 'Gráfico' : 'Tabela'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={baixarImagemPng}
              title="Baixar imagem em PNG"
              aria-label={`Baixar imagem do gráfico "${titulo}" em PNG`}
              className="flex items-center justify-center min-h-9 min-w-9 rounded-lg border border-borda-forte text-texto-2 hover:bg-realce transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Linha dedicada de seletores e filtros (sem vazar para fora do card) */}
        {elementoCabecalho && (
          <div className="mt-2 mb-3 pt-2 border-t border-borda/60 flex items-center justify-between gap-2 flex-wrap w-full">
            {elementoCabecalho}
          </div>
        )}

        {(avisoCustomizado || avisoAmostraPequena) && (
          <div className="mb-3 flex items-center gap-1.5 text-sm text-alerta bg-alerta-fundo border border-alerta-borda px-2.5 py-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-alerta" aria-hidden="true" />
            <span>{avisoCustomizado || 'Nota informativa: algumas categorias possuem amostra pequena (menos de 10 respondentes).'}</span>
          </div>
        )}
      </div>

      {/* Conteúdo: Gráfico ou Tabela */}
      <div className="relative my-2 w-full">
        {carregando ? (
          <div
            style={{ height: `${altura}px` }}
            className="flex flex-col items-center justify-center bg-superficie-2/60 border border-borda rounded-lg animate-pulse"
          >
            <div className="w-8 h-8 border-3 border-marca border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-sm text-texto-3" role="status">Calculando indicadores...</span>
          </div>
        ) : mostrarTabela && tabela ? (
          <div
            style={{ maxHeight: `${altura}px` }}
            className="overflow-auto border border-borda rounded-lg"
            tabIndex={0}
            role="region"
            aria-label={`Tabela de dados: ${titulo}`}
          >
            <TabelaDados titulo={titulo} tabela={tabela} />
          </div>
        ) : (
          <div className="chart-animate-in w-full">
            {/* O gráfico é desenhado em canvas: para leitores de tela, descrevemos o gráfico
                e oferecemos os mesmos dados numa tabela oculta visualmente. */}
            {tabela && (
              <div className="sr-only">
                <TabelaDados titulo={titulo} tabela={tabela} />
              </div>
            )}
            <div role="img" aria-label={`Gráfico: ${titulo}.${tabela ? ' Os dados estão na tabela acima.' : ''}`}>
            <ReactECharts
              ref={chartRef}
              option={{
                animation: true,
                animationDuration: 1100,
                animationEasing: 'cubicOut',
                animationDelay: (idx: number) => (idx || 0) * 60,
                animationDurationUpdate: 800,
                animationEasingUpdate: 'cubicOut',
                ...option,
                tooltip: option?.tooltip
                  ? {
                      confine: true,
                      extraCssText: 'max-width: 92vw; white-space: normal; word-break: break-word;',
                      ...option.tooltip,
                    }
                  : undefined,
              }}
              style={{ height: `${altura}px`, width: '100%' }}
              opts={{ renderer: 'canvas' }}
              notMerge={true}
              lazyUpdate={true}
              onEvents={aoClicarGrafico ? { click: aoClicarGrafico } : undefined}
            />
            </div>
          </div>
        )}
      </div>

      {/* Rodapé institucional com Fonte */}
      <div className="mt-2 pt-2 border-t border-borda flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-texto-3 gap-1">
        <span>{fonte}</span>
        {notaRodape && <span className="text-texto-3 italic">{notaRodape}</span>}
      </div>
    </div>
  );
};
