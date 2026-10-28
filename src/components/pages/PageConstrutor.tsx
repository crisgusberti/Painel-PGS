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
  { id: 'carreira', nome: 'Carreira e Gestão (Servidores)' },
] as const;

const METRICAS_VALIDAS: Array<{ id: TipoMedida; label: string }> = [
  { id: 'percentual_no_grupo', label: '% no Grupo (Eixo Principal soma 100%)' },
  { id: 'percentual_do_total', label: '% do Total Geral de Respondentes' },
  { id: 'contagem', label: 'Contagem Absoluta (n)' },
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
    const cabecalhos = ['Eixo Principal', 'Série / Cor', 'Valor', 'Respondentes (n)', 'Base Grupo'];
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
          textStyle: { color: '#94a3b8', fontSize: 14 },
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
          backgroundColor: '#0e162b',
          borderColor: '#223154',
          textStyle: { color: '#f1f5f9' },
          formatter: (params: any[]) => {
            const catName = params[0]?.name || '';
            let html = `<div class="font-bold text-slate-100 mb-1.5 border-b border-slate-700 pb-1">${catName}</div>`;
            params.forEach((p) => {
              const match = linhas.find((l) => l.eixo_1 === catName && (l.cor || 'Total') === p.seriesName);
              const nTxt = match ? ` <span class="text-slate-400">(n=${formatarNumero(match.n)})</span>` : '';
              html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
                <span>${p.marker} ${p.seriesName}</span>
                <span class="font-bold text-teal-300">${p.value}${sufixoUnidade}${nTxt}</span>
              </div>`;
            });
            return html;
          },
        },
        legend: {
          bottom: 0,
          type: 'scroll',
          textStyle: { fontSize: 11, color: '#cbd5e1' },
          pageTextStyle: { color: '#cbd5e1' },
        },
        grid: { left: '3%', right: '5%', top: '4%', bottom: '14%', containLabel: true },
        xAxis: {
          type: 'value',
          max: ehEmpilhada && tipoMedida === 'percentual_no_grupo' ? 100 : undefined,
          axisLabel: {
            color: '#94a3b8',
            formatter: `{value}${sufixoUnidade}`,
          },
          splitLine: { lineStyle: { color: '#1f2d4e' } },
        },
        yAxis: {
          type: 'category',
          data: categoriasEixo1.slice(0, 30).reverse(),
          axisLabel: { fontSize: 11, width: 155, overflow: 'truncate', color: '#cbd5e1' },
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
          backgroundColor: '#0e162b',
          borderColor: '#223154',
          textStyle: { color: '#f1f5f9' },
          formatter: (p: any) => {
            const item = dadosFinais.find((d) => d.name === p.name);
            const nInfo = item?.n ? ` <span style="color:#94a3b8;">(n = ${formatarNumero(item.n)})</span>` : '';
            return `<div style="font-weight:600;color:#f1f5f9;">${p.name}</div>
              <div style="font-size:12px;margin-top:4px;color:#cbd5e1;">
                Proporção: <strong style="color:#2dd4bf;">${p.percent}%</strong>${nInfo}
              </div>`;
          },
        },
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          bottom: 4,
          textStyle: { fontSize: 11, color: '#cbd5e1' },
          pageTextStyle: { color: '#cbd5e1' },
          pageIconColor: '#2dd4bf',
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
              borderColor: '#0e162b',
              borderWidth: 2,
            },
            label: {
              show: true,
              formatter: '{b}: {d}%',
              color: '#e2e8f0',
              fontSize: 11,
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
        backgroundColor: '#0e162b',
        borderColor: '#223154',
        textStyle: { color: '#f1f5f9' },
        formatter: (params: any[]) => {
          const p = params[0];
          const match = linhas.find((l) => l.eixo_1 === p.name);
          return `<div class="font-bold text-slate-100">${p.name}</div>
            <div class="text-xs mt-1 text-teal-300">
              Valor: <strong>${p.value}${sufixoUnidade}</strong>
              ${match ? ` <span class="text-slate-400">(n = ${formatarNumero(match.n)})</span>` : ''}
            </div>`;
        },
      },
      grid: { left: '3%', right: '10%', top: '4%', bottom: '5%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: '#94a3b8',
          formatter: `{value}${sufixoUnidade}`,
        },
        splitLine: { lineStyle: { color: '#1f2d4e' } },
      },
      yAxis: {
        type: 'category',
        data: linhasOrdenadas.map((l) => l.eixo_1 || 'Sem resposta').reverse(),
        axisLabel: { fontSize: 11, width: 165, overflow: 'truncate', color: '#cbd5e1' },
      },
      series: [
        {
          type: 'bar',
          data: linhasOrdenadas.map((l) => l.valor).reverse(),
          itemStyle: { color: PALETA_ACESSIVEL[0] },
          label: {
            show: true,
            position: 'right',
            color: '#e2e8f0',
            formatter: (p: any) => `${p.value}${sufixoUnidade}`,
            fontSize: 11,
          },
        },
      ],
    };
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-[#1f2d4e] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold text-slate-100">7. Construtor Dinâmico de Gráficos</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Cruze dimensões demográficas e indicadores do diagnóstico em tempo real com filtragem inteligente de combinações compatíveis.
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2b3e6c] bg-[#131d36] text-xs font-semibold text-slate-200 hover:bg-[#1c2a4d] transition-colors"
          >
            <Download className="w-4 h-4 text-teal-400" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Grid Principal: Painel de Configuração vs Área de Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Catálogo e Seletores (4 colunas) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2d4e] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Parâmetros do Gráfico
              </span>
              <span className="text-[10px] bg-teal-950/70 border border-teal-700/60 text-teal-300 font-bold px-2 py-0.5 rounded-full">
                Cruzamento Validado
              </span>
            </div>

            {/* Seletor Eixo X / Linhas agrupado por tema */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Eixo Principal (Eixo X / Categorias) *
              </label>
              <select
                value={eixo1}
                onChange={(e) => setEixo1(e.target.value)}
                className="w-full text-xs rounded-lg border border-[#25355a] bg-[#0e162b] px-3 py-2 text-slate-100 focus:outline-teal-500 font-medium"
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
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Série / Cor (Cruzamento Opcional)
              </label>
              <select
                value={campoCor}
                onChange={(e) => setCampoCor(e.target.value)}
                className="w-full text-xs rounded-lg border border-[#25355a] bg-[#0e162b] px-3 py-2 text-slate-100 focus:outline-teal-500 font-medium"
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
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-start gap-1.5 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  {campoEixoObj?.papel === 'indicador'
                    ? 'Para indicadores temáticos no Eixo Principal, as séries exibem apenas recortes demográficos e funcionais compatíveis.'
                    : campoEixoObj?.escopo === 'discentes'
                    ? 'Exibindo apenas séries aplicáveis ao universo discente.'
                    : campoEixoObj?.escopo === 'servidores'
                    ? 'Exibindo apenas séries aplicáveis ao universo de servidores.'
                    : 'Opções incompatíveis ou com excesso de categorias são ocultadas automaticamente.'}
                </span>
              </p>
            </div>

            {/* Seletor de Medida */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Métrica / Medida *
              </label>
              <select
                value={tipoMedida}
                onChange={(e) => setTipoMedida(e.target.value as TipoMedida)}
                className="w-full text-xs rounded-lg border border-[#25355a] bg-[#0e162b] px-3 py-2 text-slate-100 focus:outline-teal-500 font-medium"
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
              <label className="block text-xs font-bold text-slate-300 mb-1">
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
                        ? 'bg-[#0a1020] border-[#1a2642] text-slate-600 cursor-not-allowed'
                        : tipoVisualizacao === t.id
                        ? 'bg-teal-600 border-teal-500 text-white shadow-xs'
                        : 'bg-[#0e162b] border-[#25355a] text-slate-300 hover:bg-[#162342]'
                    }`}
                  >
                    {t.icone}
                    <span>{t.rotulo}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Prefiro Não Responder */}
            <div className="pt-2 border-t border-[#1f2d4e]">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={incluirPrefiroNao}
                  onChange={(e) => setIncluirPrefiroNao(e.target.checked)}
                  className="rounded text-teal-500 focus:ring-teal-400 w-4 h-4 bg-[#0e162b] border-[#25355a]"
                />
                <span>Incluir "Prefiro não responder"</span>
              </label>
            </div>
          </div>

          {/* Seção de Salvar / Restaurar Painéis */}
          <div className="bg-[#131d36] border border-[#223154] rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Salvar Visão no Navegador
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome da visualização..."
                value={nomeNovoPainel}
                onChange={(e) => setNomeNovoPainel(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#25355a] bg-[#0e162b] text-slate-100"
              />
              <button
                type="button"
                onClick={salvarPainelAtual}
                disabled={!nomeNovoPainel.trim()}
                className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar
              </button>
            </div>

            {paineisSalvos.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block">Salvos:</span>
                {paineisSalvos.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs bg-[#0e162b] border border-[#25355a] px-2.5 py-1.5 rounded-lg"
                  >
                    <button
                      onClick={() => carregarPainel(p.config)}
                      className="text-left font-medium text-teal-300 hover:underline truncate mr-2"
                    >
                      {p.nome}
                    </button>
                    <button
                      onClick={() => excluirPainel(p.id)}
                      className="text-slate-400 hover:text-rose-400"
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
        <div className="lg:col-span-8 space-y-4">
          {erro && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
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
                      tipoMedida.includes('percentual') ? 'Proporção (%)' : 'Contagem (n)',
                      'Amostra (n)',
                      'Base do Grupo (n)',
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
