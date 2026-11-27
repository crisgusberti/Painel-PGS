/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CATALOGO_CAMPOS, obterOpcoesSerieCompativeis } from '../../lib/catalogo';
import { TipoMedida, RequisicaoConsulta, RespostaConsulta } from '../../lib/types';
import { ChartCard } from '../ChartCard';
import {
  Wand2,
  Trash2,
  Save,
  Download,
  BarChart,
  PieChart,
  Layers,
  Info,
} from 'lucide-react';
import { PALETA_ACESSIVEL } from '../../lib/chartTheme';
import { formatarNumero } from '../../lib/formatters';

const GRUPOS_CATALOGO = [
  { id: 'perfil', nome: 'Perfil Institucional e Demográfico' },
  { id: 'diversidade', nome: 'Identidade e Diversidade' },
  { id: 'ambiente', nome: 'Clima Institucional e Ensino' },
  { id: 'violencia', nome: 'Violências e Discriminação' },
  { id: 'denuncia', nome: 'Canais de Denúncia' },
  { id: 'politicas', nome: 'Núcleos e Ações Afirmativas' },
  { id: 'cuidado', nome: 'Cuidado e Parentalidade' },
  { id: 'carreira', nome: 'Carreira e Gestão (Servidores/as)' },
] as const;

const METRICAS_VALIDAS: Array<{ id: TipoMedida; label: string }> = [
  { id: 'percentual_no_grupo', label: '% no Grupo (Eixo Principal soma 100%)' },
  { id: 'percentual_do_total', label: '% do Total Geral de Respondentes' },
  { id: 'contagem', label: 'Contagem Absoluta' },
];

export const PageConstrutor: React.FC = () => {
  // Estado do Construtor
  const [eixo1, setEixo1] = useState<string>('campus');
  const [eixo2, setEixo2] = useState<string>('');
  const [campoCor, setCampoCor] = useState<string>('genero_agrupado');
  const [tipoMedida, setTipoMedida] = useState<TipoMedida>('percentual_no_grupo');
  const [incluirPrefiroNao, setIncluirPrefiroNao] = useState<boolean>(true);
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'barra' | 'barra_empilhada' | 'rosca' | 'heatmap'>('barra_empilhada');

  // Filtros adicionais no construtor
  const [filtrosConstrutor, setFiltrosConstrutor] = useState<Array<{ campo: string; operador: 'in' | 'eq' | 'neq'; valores: string[] }>>([]);

  // Estado de dados e execução
  const [carregando, setCarregando] = useState<boolean>(false);
  const [resultado, setResultado] = useState<RespostaConsulta | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Painéis salvos no localStorage
  const [paineisSalvos, setPaineisSalvos] = useState<Array<{ id: string; nome: string; config: any }>>([]);
  const [nomeNovoPainel, setNomeNovoPainel] = useState<string>('');

  // Carregar painéis salvos
  useEffect(() => {
    try {
      const salvos = localStorage.getItem('paineis_salvos') || localStorage.getItem('pgs_paineis_salvos');
      if (salvos) setPaineisSalvos(JSON.parse(salvos));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Campos elegíveis para o Eixo Principal
  const camposEixoPrincipal = useMemo(
    () => Object.values(CATALOGO_CAMPOS).filter((c) => c.dinamico),
    []
  );

  // Opções de Série / Cor compatíveis com o Eixo Principal selecionado
  const opcoesSerieCompativeis = useMemo(
    () => obterOpcoesSerieCompativeis(eixo1),
    [eixo1]
  );

  // Ajustar automaticamente Série / Cor caso o usuário mude o Eixo Principal para uma combinação incompatível
  useEffect(() => {
    if (!campoCor) return;
    const aindaValido = opcoesSerieCompativeis.some((c) => c.key === campoCor);
    if (!aindaValido) {
      const substitutoPadrao =
        opcoesSerieCompativeis.find((c) => c.key === 'genero_agrupado') ||
        opcoesSerieCompativeis.find((c) => c.key === 'cor_raca') ||
        opcoesSerieCompativeis[0];
      setCampoCor(substitutoPadrao ? substitutoPadrao.key : '');
    }
  }, [eixo1, opcoesSerieCompativeis, campoCor]);

  // Se o usuário remover a Série / Cor e estiver em "barra_empilhada", mudar para "barra"
  useEffect(() => {
    if (!campoCor && tipoVisualizacao === 'barra_empilhada') {
      setTipoVisualizacao('barra');
    }
  }, [campoCor, tipoVisualizacao]);

  // Executar a consulta dinâmica
  const executarBusca = async () => {
    if (!eixo1) return;
    const serieEfetiva =
      campoCor && opcoesSerieCompativeis.some((c) => c.key === campoCor)
        ? campoCor
        : '';

    setCarregando(true);
    setErro(null);

    const payload: RequisicaoConsulta = {
      campos_eixo: eixo2 ? [eixo1, eixo2] : [eixo1],
      campos_cor: serieEfetiva ? [serieEfetiva] : undefined,
      medida: {
        tipo: tipoMedida,
        incluir_prefiro_nao_responder: incluirPrefiroNao,
      },
      filtros: filtrosConstrutor.length > 0 ? filtrosConstrutor : undefined,
    };

    try {
      const res = await fetch('/api/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.mensagem || errJson.erro || 'Erro ao executar consulta');
      }

      const data: RespostaConsulta = await res.json();
      setResultado(data);
    } catch (err: any) {
      setErro(err.message || String(err));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    executarBusca();
  }, [eixo1, eixo2, campoCor, tipoMedida, incluirPrefiroNao]);

  // Salvar painel no localStorage
  const salvarPainelAtual = () => {
    if (!nomeNovoPainel.trim()) return;
    const novo = {
      id: String(Date.now()),
      nome: nomeNovoPainel.trim(),
      config: {
        eixo1,
        eixo2,
        campoCor,
        tipoMedida,
        incluirPrefiroNao,
        tipoVisualizacao,
        filtrosConstrutor,
      },
    };
    const atualizados = [...paineisSalvos, novo];
    setPaineisSalvos(atualizados);
    localStorage.setItem('paineis_salvos', JSON.stringify(atualizados));
    setNomeNovoPainel('');
  };

  const carregarPainel = (config: any) => {
    const eixoSalvo = CATALOGO_CAMPOS[config.eixo1]?.dinamico ? config.eixo1 : 'campus';
    setEixo1(eixoSalvo);
    setEixo2(config.eixo2 || '');
    setCampoCor(config.campoCor || '');
    const medSalva = METRICAS_VALIDAS.some((m) => m.id === config.tipoMedida)
      ? config.tipoMedida
      : 'percentual_no_grupo';
    setTipoMedida(medSalva);
    setIncluirPrefiroNao(config.incluirPrefiroNao ?? true);
    setTipoVisualizacao(config.tipoVisualizacao || 'barra_empilhada');
    setFiltrosConstrutor(config.filtrosConstrutor || []);
  };

  const excluirPainel = (id: string) => {
    const atualizados = paineisSalvos.filter((p) => p.id !== id);
    setPaineisSalvos(atualizados);
    localStorage.setItem('paineis_salvos', JSON.stringify(atualizados));
  };

  // Exportar dados atuais em CSV
  const exportarCSV = () => {
    if (!resultado || !resultado.linhas) return;
    const cabecalhos = ['Eixo Principal', 'Série / Cor', 'Valor', 'Respondentes', 'Base Grupo'];
    const linhasCsv = resultado.linhas.map((l) => [
      `"${l.eixo_1 || ''}"`,
      `"${l.cor || 'Total'}"`,
      l.valor,
      l.n,
      l.n_grupo || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [cabecalhos.join(';'), ...linhasCsv.map((r) => r.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `consulta_pgs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const labelEixo1 = CATALOGO_CAMPOS[eixo1]?.label || eixo1;
  const labelCor = campoCor ? CATALOGO_CAMPOS[campoCor]?.label : null;
  const campoEixoObj = CATALOGO_CAMPOS[eixo1];

  // Montar Opções do Apache ECharts dinamicamente
  const montarOpcaoEchart = () => {
    if (!resultado || !resultado.linhas || resultado.linhas.length === 0) {
      return {
        title: {
          text: 'Nenhum registro encontrado para esta combinação',
          left: 'center',
          top: 'center',
          textStyle: { color: '#4d5a53', fontSize: 14 },
        },
      };
    }

    const linhas = resultado.linhas;
    const categoriasEixo1 = Array.from(new Set(linhas.map((l) => l.eixo_1 || 'Sem resposta')));
    const seriesCores = Array.from(new Set(linhas.map((l) => l.cor || 'Total')));
    const sufixoUnidade = tipoMedida.includes('percentual') ? '%' : '';

    // 1. Visualização em Barras (Empilhadas ou Agrupadas) com Série / Cor ativa
    if ((tipoVisualizacao === 'barra_empilhada' || tipoVisualizacao === 'barra') && campoCor && seriesCores.length > 0) {
      const ehEmpilhada = tipoVisualizacao === 'barra_empilhada';
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#ffffff',
          borderColor: '#d3dbd6',
          textStyle: { color: '#14201a' },
          formatter: (params: any[]) => {
            const catName = params[0]?.name || '';
            let html = `<div class="font-bold text-texto mb-1.5 border-b border-borda-forte pb-1">${catName}</div>`;
            params.forEach((p) => {
              const match = linhas.find((l) => l.eixo_1 === catName && (l.cor || 'Total') === p.seriesName);
              const nTxt = match ? ` <span class="text-texto-3">(total: ${formatarNumero(match.n)})</span>` : '';
              html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
                <span>${p.marker} ${p.seriesName}</span>
                <span class="font-bold text-marca">${p.value}${sufixoUnidade}${nTxt}</span>
              </div>`;
            });
            return html;
          },
        },
        legend: {
          bottom: 0,
          type: 'scroll',
          textStyle: { fontSize: 13, color: '#2f3b35' },
          pageTextStyle: { color: '#2f3b35' },
        },
        grid: { left: '3%', right: '5%', top: '4%', bottom: '14%', containLabel: true },
        xAxis: {
          type: 'value',
          max: ehEmpilhada && tipoMedida === 'percentual_no_grupo' ? 100 : undefined,
          axisLabel: {
            color: '#4d5a53',
            formatter: `{value}${sufixoUnidade}`,
          },
          splitLine: { lineStyle: { color: '#e3e8e5' } },
        },
        yAxis: {
          type: 'category',
          data: categoriasEixo1.slice(0, 30).reverse(),
          axisLabel: { fontSize: 13, width: 155, overflow: 'truncate', color: '#2f3b35' },
        },
        series: seriesCores.map((corName, idx) => ({
          name: corName,
          type: 'bar',
          stack: ehEmpilhada ? 'total' : undefined,
          itemStyle: { color: PALETA_ACESSIVEL[idx % PALETA_ACESSIVEL.length] },
          data: categoriasEixo1
            .slice(0, 30)
            .map((cat) => {
              const match = linhas.find((l) => l.eixo_1 === cat && (l.cor || 'Total') === corName);
              return match ? match.valor : 0;
            })
            .reverse(),
        })),
      };
    }

    // 2. Visualização em Rosca
    if (tipoVisualizacao === 'rosca') {
      let dadosRosca: Array<{ name: string; value: number; n?: number }> = [];

      if (campoCor && seriesCores.length > 1) {
        if (linhas.length <= 10) {
          dadosRosca = linhas.map((l) => ({
            name: `${l.eixo_1} • ${l.cor}`,
            value: Number(l.valor) || Number(l.n) || 0,
            n: Number(l.n) || 0,
          }));
        } else {
          dadosRosca = seriesCores.map((corName) => {
            const linhasCor = linhas.filter((l) => (l.cor || 'Total') === corName);
            const somaN = linhasCor.reduce((acc, l) => acc + (Number(l.n) || 0), 0);
            const somaValor =
              tipoMedida === 'percentual_no_grupo'
                ? somaN
                : linhasCor.reduce((acc, l) => acc + (Number(l.valor) || 0), 0);
            return {
              name: corName,
              value: Number(somaValor.toFixed(1)),
              n: somaN,
            };
          });
        }
      } else {
        dadosRosca = categoriasEixo1.map((cat) => {
          const linhasCat = linhas.filter((l) => (l.eixo_1 || 'Sem resposta') === cat);
          const somaN = linhasCat.reduce((acc, l) => acc + (Number(l.n) || 0), 0);
          const somaValor =
            tipoMedida === 'percentual_no_grupo'
              ? somaN
              : linhasCat.reduce((acc, l) => acc + (Number(l.valor) || 0), 0);
          return {
            name: cat,
            value: Number(somaValor.toFixed(1)),
            n: somaN,
          };
        });
      }

      dadosRosca.sort((a, b) => b.value - a.value);

      let dadosFinais = dadosRosca;
      if (dadosRosca.length > 10) {
        const top9 = dadosRosca.slice(0, 9);
        const restantes = dadosRosca.slice(9);
        const somaRestantes = restantes.reduce((acc, d) => acc + d.value, 0);
        const somaNRestantes = restantes.reduce((acc, d) => acc + (d.n || 0), 0);
        dadosFinais = [
          ...top9,
          {
            name: `Outras (${restantes.length} categorias)`,
            value: Number(somaRestantes.toFixed(1)),
            n: somaNRestantes,
          },
        ];
      }

      return {
        color: PALETA_ACESSIVEL,
        tooltip: {
          trigger: 'item',
          backgroundColor: '#ffffff',
          borderColor: '#d3dbd6',
          textStyle: { color: '#14201a' },
          formatter: (p: any) => {
            const item = dadosFinais.find((d) => d.name === p.name);
            const nInfo = item?.n ? ` <span style="color:#4d5a53;">(total: ${formatarNumero(item.n)})</span>` : '';
            return `<div style="font-weight:600;color:#14201a;">${p.name}</div>
              <div style="font-size:12px;margin-top:4px;color:#2f3b35;">
                Proporção: <strong style="color:#1f6d2b;">${p.percent}%</strong>${nInfo}
              </div>`;
          },
        },
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          bottom: 4,
          textStyle: { fontSize: 13, color: '#2f3b35' },
          pageTextStyle: { color: '#2f3b35' },
          pageIconColor: '#1f6d2b',
          pageIconInactiveColor: '#475569',
        },
        series: [
          {
            name: labelEixo1,
            type: 'pie',
            radius: ['42%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#ffffff',
              borderWidth: 2,
            },
            label: {
              show: true,
              formatter: '{b}: {d}%',
              color: '#2f3b35',
              fontSize: 13,
            },
            labelLine: {
              show: true,
              smooth: 0.2,
              length: 10,
              length2: 15,
              lineStyle: { color: '#475569' },
            },
            data: dadosFinais,
          },
        ],
      };
    }

    // 3. Padrão (Série Única): Barra horizontal ordenada
    const linhasOrdenadas = [...linhas].sort((a, b) => b.valor - a.valor).slice(0, 30);
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#d3dbd6',
        textStyle: { color: '#14201a' },
        formatter: (params: any[]) => {
          const p = params[0];
          const match = linhas.find((l) => l.eixo_1 === p.name);
          return `<div class="font-bold text-texto">${p.name}</div>
            <div class="text-xs mt-1 text-marca">
              Valor: <strong>${p.value}${sufixoUnidade}</strong>
              ${match ? ` <span class="text-texto-3">(total: ${formatarNumero(match.n)})</span>` : ''}
            </div>`;
        },
      },
      grid: { left: '3%', right: '10%', top: '4%', bottom: '5%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: '#4d5a53',
          formatter: `{value}${sufixoUnidade}`,
        },
        splitLine: { lineStyle: { color: '#e3e8e5' } },
      },
      yAxis: {
        type: 'category',
        data: linhasOrdenadas.map((l) => l.eixo_1 || 'Sem resposta').reverse(),
        axisLabel: { fontSize: 13, width: 165, overflow: 'truncate', color: '#2f3b35' },
      },
      series: [
        {
          type: 'bar',
          data: linhasOrdenadas.map((l) => l.valor).reverse(),
          itemStyle: { color: PALETA_ACESSIVEL[0] },
          label: {
            show: true,
            position: 'right',
            color: '#2f3b35',
            formatter: (p: any) => `${p.value}${sufixoUnidade}`,
            fontSize: 13,
          },
        },
      ],
    };
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-borda pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-marca" />
            <h2 className="text-xl font-bold text-texto">8. Construtor Dinâmico de Gráficos</h2>
          </div>
          <p className="text-xs sm:text-sm text-texto-3 mt-0.5">
            Cruze dimensões demográficas e indicadores do diagnóstico em tempo real com filtragem inteligente de combinações compatíveis.
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borda-forte bg-superficie text-xs font-semibold text-texto hover:bg-realce transition-colors"
          >
            <Download className="w-4 h-4 text-marca" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Grid Principal: Painel de Configuração vs Área de Gráfico */}
      <div className="grid grid-cols-1 @4xl:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Catálogo e Seletores (4 colunas) */}
        <div className="@4xl:col-span-4 space-y-4">
          <div className="bg-superficie rounded-xl border border-borda shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-borda pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-texto-2">
                Parâmetros do Gráfico
              </span>
              <span className="text-xs bg-marca-fundo/70 border border-marca-borda/60 text-marca font-bold px-2 py-0.5 rounded-full">
                Cruzamento Validado
              </span>
            </div>

            {/* Seletor Eixo X / Linhas agrupado por tema */}
            <div>
              <label className="block text-xs font-bold text-texto-2 mb-1">
                Eixo Principal (Eixo X / Categorias) *
              </label>
              <select
                value={eixo1}
                onChange={(e) => setEixo1(e.target.value)}
                className="w-full text-xs rounded-lg border border-borda bg-superficie-2 px-3 py-2 text-texto focus:outline-marca font-medium"
              >
                {GRUPOS_CATALOGO.map((grp) => {
                  const itens = camposEixoPrincipal.filter((c) => c.grupo === grp.id);
                  if (itens.length === 0) return null;
                  return (
                    <optgroup key={grp.id} label={grp.nome}>
                      {itens.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            {/* Seletor Cor / Série filtrado dinamicamente pela compatibilidade com o Eixo Principal */}
            <div>
              <label className="block text-xs font-bold text-texto-2 mb-1">
                Série / Cor (Cruzamento Opcional)
              </label>
              <select
                value={campoCor}
                onChange={(e) => setCampoCor(e.target.value)}
                className="w-full text-xs rounded-lg border border-borda bg-superficie-2 px-3 py-2 text-texto focus:outline-marca font-medium"
              >
                <option value="">(Nenhuma série - exibir distribuição simples)</option>
                {GRUPOS_CATALOGO.map((grp) => {
                  const itens = opcoesSerieCompativeis.filter((c) => c.grupo === grp.id);
                  if (itens.length === 0) return null;
                  return (
                    <optgroup key={grp.id} label={grp.nome}>
                      {itens.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              <p className="text-xs text-texto-3 mt-1.5 flex items-start gap-1.5 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-marca shrink-0 mt-0.5" />
                <span>
                  {campoEixoObj?.papel === 'indicador'
                    ? 'Para indicadores temáticos no Eixo Principal, as séries exibem apenas recortes demográficos e funcionais compatíveis.'
                    : campoEixoObj?.escopo === 'discentes'
                    ? 'Exibindo apenas séries aplicáveis ao universo discente.'
                    : campoEixoObj?.escopo === 'servidores'
                    ? 'Exibindo apenas séries aplicáveis ao universo de servidores/as.'
                    : 'Opções incompatíveis ou com excesso de categorias são ocultadas automaticamente.'}
                </span>
              </p>
            </div>

            {/* Seletor de Medida */}
            <div>
              <label className="block text-xs font-bold text-texto-2 mb-1">
                Métrica / Medida *
              </label>
              <select
                value={tipoMedida}
                onChange={(e) => setTipoMedida(e.target.value as TipoMedida)}
                className="w-full text-xs rounded-lg border border-borda bg-superficie-2 px-3 py-2 text-texto focus:outline-marca font-medium"
              >
                {METRICAS_VALIDAS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Visualização */}
            <div>
              <label className="block text-xs font-bold text-texto-2 mb-1">
                Tipo de Visualização
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'barra_empilhada',
                    rotulo: 'Empilhada',
                    icone: <Layers className="w-3.5 h-3.5" />,
                    desabilitado: !campoCor,
                  },
                  {
                    id: 'barra',
                    rotulo: 'Barras',
                    icone: <BarChart className="w-3.5 h-3.5" />,
                    desabilitado: false,
                  },
                  {
                    id: 'rosca',
                    rotulo: 'Rosca',
                    icone: <PieChart className="w-3.5 h-3.5" />,
                    desabilitado: false,
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    disabled={t.desabilitado}
                    onClick={() => setTipoVisualizacao(t.id as any)}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      t.desabilitado
                        ? 'bg-superficie-2 border-borda text-texto-3 cursor-not-allowed'
                        : tipoVisualizacao === t.id
                        ? 'bg-marca border-marca text-white shadow-xs'
                        : 'bg-superficie-2 border-borda text-texto-2 hover:bg-realce'
                    }`}
                  >
                    {t.icone}
                    <span>{t.rotulo}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Prefiro Não Responder */}
            <div className="pt-2 border-t border-borda">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-texto-2">
                <input
                  type="checkbox"
                  checked={incluirPrefiroNao}
                  onChange={(e) => setIncluirPrefiroNao(e.target.checked)}
                  className="rounded text-marca focus:ring-marca w-4 h-4 bg-superficie-2 border-borda"
                />
                <span>Incluir "Prefiro não responder"</span>
              </label>
            </div>
          </div>

          {/* Seção de Salvar / Restaurar Painéis */}
          <div className="bg-superficie border border-borda rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-texto-2 block">
              Salvar Visão no Navegador
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome da visualização..."
                value={nomeNovoPainel}
                onChange={(e) => setNomeNovoPainel(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-borda bg-superficie-2 text-texto"
              />
              <button
                type="button"
                onClick={salvarPainelAtual}
                disabled={!nomeNovoPainel.trim()}
                className="px-3 py-1.5 rounded-lg bg-marca text-white text-xs font-bold hover:bg-marca-escura disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar
              </button>
            </div>

            {paineisSalvos.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-2">
                <span className="text-xs font-semibold text-texto-3 block">Salvos:</span>
                {paineisSalvos.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs bg-superficie-2 border border-borda px-2.5 py-1.5 rounded-lg"
                  >
                    <button
                      onClick={() => carregarPainel(p.config)}
                      className="text-left font-medium text-marca hover:underline truncate mr-2"
                    >
                      {p.nome}
                    </button>
                    <button
                      onClick={() => excluirPainel(p.id)}
                      className="text-texto-3 hover:text-perigo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Visualização do Gráfico e Tabela Pivô (8 colunas) */}
        <div className="@4xl:col-span-8 space-y-4">
          {erro && (
            <div className="p-4 rounded-xl bg-perigo-fundo border border-perigo-borda text-perigo text-xs font-medium">
              Falha ao processar consulta: {erro}
            </div>
          )}

          <ChartCard
            titulo={`${labelEixo1}${labelCor ? ` × ${labelCor}` : ''}`}
            subtitulo={
              METRICAS_VALIDAS.find((m) => m.id === tipoMedida)?.label ||
              `Métrica: ${tipoMedida}`
            }
            n={resultado?.n_filtrado}
            baseDescricao="respondentes válidos no recorte"
            option={montarOpcaoEchart()}
            altura={480}
            carregando={carregando}
            avisoAmostraPequena={Boolean(resultado?.avisos && resultado.avisos.length > 0)}
            tabelaDados={
              resultado && resultado.linhas
                ? {
                    cabecalhos: [
                      labelEixo1,
                      labelCor || 'Série',
                      tipoMedida.includes('percentual') ? 'Proporção (%)' : 'Contagem',
                      'Total da amostra',
                      'Total do grupo',
                    ],
                    linhas: resultado.linhas.map((l) => [
                      l.eixo_1 || 'Sem resposta',
                      l.cor || 'Total',
                      tipoMedida.includes('percentual') ? `${l.valor}%` : l.valor,
                      l.n,
                      l.n_grupo || resultado.n_filtrado,
                    ]),
                  }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
};
