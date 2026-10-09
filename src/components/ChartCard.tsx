/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
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
}) => {
  const chartRef = useRef<any>(null);
  const [mostrarTabela, setMostrarTabela] = useState(false);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const rotuloInfo = infoTitulo || 'Informações e Metodologia';

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
        backgroundColor: '#131d36',
      });
      const link = document.createElement('a');
      link.download = `${titulo.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
      link.href = base64;
      link.click();
    }
  };

  return (
    <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5 flex flex-col justify-between">
      {/* Cabeçalho */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-100 leading-snug">{titulo}</h3>
              {infoTooltip && (
                <div
                  className="relative inline-block"
                  onMouseEnter={() => setMostrarInfo(true)}
                  onMouseLeave={() => setMostrarInfo(false)}
                >
                  <button
                    type="button"
                    onClick={() => setMostrarInfo(!mostrarInfo)}
                    title={rotuloInfo}
                    aria-label={rotuloInfo}
                    className={`p-1 rounded-full border transition-all ${
                      mostrarInfo
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-xs'
                        : 'bg-[#0e162b] text-teal-400 border-[#25355a] hover:bg-[#1a264a] hover:text-teal-300'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {/* Popover / Tooltip ao passar o cursor ou clicar */}
                  {mostrarInfo && (
                    <div
                      className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-50 w-72 sm:w-96 md:w-[460px] max-w-[90vw] p-4 bg-[#0a1020]/95 backdrop-blur-md border border-teal-500/50 rounded-xl shadow-2xl text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1f2d4e]">
                        <span className="font-bold text-teal-300 text-xs flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-teal-400" />
                          {rotuloInfo}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMostrarInfo(false)}
                          className="p-0.5 rounded text-slate-400 hover:text-slate-200 transition-colors"
                          title="Fechar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {infoTooltip}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {(subtitulo || n !== undefined) && (
              <p className="text-xs text-slate-400 mt-0.5">
                {subtitulo} {n !== undefined && `• n = ${n.toLocaleString('pt-BR')}`}{' '}
                {baseDescricao && `(${baseDescricao})`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {tabelaDados && (
              <button
                type="button"
                onClick={() => setMostrarTabela(!mostrarTabela)}
                title={mostrarTabela ? 'Exibir Gráfico' : 'Exibir Tabela'}
                className="p-1.5 rounded-lg border border-[#2b3d68] text-slate-300 hover:bg-[#1c2a4d] transition-colors"
              >
                {mostrarTabela ? <BarChart3 className="w-4 h-4" /> : <Table className="w-4 h-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={baixarImagemPng}
              title="Baixar imagem em PNG"
              className="p-1.5 rounded-lg border border-[#2b3d68] text-slate-300 hover:bg-[#1c2a4d] transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Linha dedicada de seletores e filtros (sem vazar para fora do card) */}
        {elementoCabecalho && (
          <div className="mt-2 mb-3 pt-2 border-t border-[#1f2d4e]/60 flex items-center justify-between gap-2 flex-wrap w-full">
            {elementoCabecalho}
          </div>
        )}

        {(avisoCustomizado || avisoAmostraPequena) && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{avisoCustomizado || 'Nota informativa: algumas categorias possuem amostra pequena (n < 10 respondentes).'}</span>
          </div>
        )}
      </div>

      {/* Conteúdo: Gráfico ou Tabela */}
      <div className="relative my-2 w-full">
        {carregando ? (
          <div
            style={{ height: `${altura}px` }}
            className="flex flex-col items-center justify-center bg-[#0e162b]/60 border border-[#223154] rounded-lg animate-pulse"
          >
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs text-slate-400">Calculando indicadores...</span>
          </div>
        ) : mostrarTabela && tabelaDados ? (
          <div style={{ maxHeight: `${altura}px` }} className="overflow-auto border border-[#223154] rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0e162b] sticky top-0 text-slate-200 font-semibold border-b border-[#223154]">
                <tr>
                  {tabelaDados.cabecalhos.map((c, i) => (
                    <th key={i} className="px-3 py-2">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2d4e]">
                {tabelaDados.linhas.map((l, idx) => (
                  <tr key={idx} className="hover:bg-[#1a2647] transition-colors">
                    {l.map((val, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 text-slate-300">
                        {typeof val === 'number' ? val.toLocaleString('pt-BR') : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="chart-animate-in w-full">
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
              }}
              style={{ height: `${altura}px`, width: '100%' }}
              opts={{ renderer: 'canvas' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        )}
      </div>

      {/* Rodapé institucional com Fonte */}
      <div className="mt-2 pt-2 border-t border-[#1f2d4e] flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 gap-1">
        <span>Fonte: Questionário aplicado com 4878 respondentes</span>
        {notaRodape && <span className="text-slate-400 italic">{notaRodape}</span>}
      </div>
    </div>
  );
};
