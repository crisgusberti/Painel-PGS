/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChartCard } from '../ChartCard';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { formatarNumero } from '../../lib/formatters';
import { PALETA_ACESSIVEL, CORES_LIKERT } from '../../lib/chartTheme';

interface PageAmbienteViolenciasProps {
  dados: any;
  carregando: boolean;
}

type SegmentoOpcao = 'geral' | 'docentes' | 'tecnicos';
type GeneroOpcao = 'todos' | 'Mulheres' | 'Homens';

// Componentes Reutilizáveis de Seleção por Gráfico
const SeletorSegmento: React.FC<{
  valor: SegmentoOpcao;
  aoMudar: (val: SegmentoOpcao) => void;
}> = ({ valor, aoMudar }) => (
  <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0a1020] border border-[#223154] text-xs">
    <button
      type="button"
      onClick={() => aoMudar('geral')}
      className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
        valor === 'geral'
          ? 'bg-teal-500 text-slate-950 shadow-xs'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      Geral
    </button>
    <button
      type="button"
      onClick={() => aoMudar('docentes')}
      className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
        valor === 'docentes'
          ? 'bg-teal-500 text-slate-950 shadow-xs'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      Docentes
    </button>
    <button
      type="button"
      onClick={() => aoMudar('tecnicos')}
      className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
        valor === 'tecnicos'
          ? 'bg-teal-500 text-slate-950 shadow-xs'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      Técnicos (TAE)
    </button>
  </div>
);

const SeletorGenero: React.FC<{
  valor: GeneroOpcao;
  aoMudar: (val: GeneroOpcao) => void;
}> = ({ valor, aoMudar }) => (
  <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0a1020] border border-[#223154] text-xs">
    {(['todos', 'Mulheres', 'Homens'] as const).map((g) => (
      <button
        key={g}
        type="button"
        onClick={() => aoMudar(g)}
        className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
          valor === g
            ? 'bg-teal-500 text-slate-950 shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {g === 'todos' ? 'Todos' : g}
      </button>
    ))}
  </div>
);

// Perguntas oficiais e completas do Diagnóstico (Q24a a Q24f)
const PERGUNTAS_COMPLETAS_Q24 = [
  {
    codigo: 'Q24a',
    chave: 'seguranca_expressao_opiniao',
    rotuloCurto: 'Segurança para expressar opiniões',
    enunciado:
      'Sinto-me seguro(a/e) para expressar minhas opiniões sobre questões de diversidade e igualdade na instituição sem medo de retaliação',
    invertido: false,
  },
  {
    codigo: 'Q24b',
    chave: 'ambiente_seguro_respeitoso',
    rotuloCurto: 'Ambiente seguro e respeitoso',
    enunciado:
      'A instituição é um ambiente seguro, respeitoso e que busca ativamente eliminar comportamentos inaceitáveis (assédio, discriminação, etc.).',
    invertido: false,
  },
  {
    codigo: 'Q24c',
    chave: 'inclusao_pessoas_trans',
    rotuloCurto: 'Inclusão de pessoas trans',
    enunciado:
      'A instituição promove ativamente a inclusão de pessoas trans, travestis e não-binárias (ex: respeito ao nome social em sistemas, banheiros inclusivos, etc.);',
    invertido: false,
  },
  {
    codigo: 'Q24d',
    chave: 'maternidade_impacto_carreira',
    rotuloCurto: 'Maternidade impacta negativamente a carreira',
    enunciado:
      'A maternidade/paternidade/parentalidade é vista como um fator que pode impactar negativamente a carreira ou a trajetória acadêmica na instituição',
    invertido: true,
  },
  {
    codigo: 'Q24e',
    chave: 'iniciativas_celebrar_diversidade',
    rotuloCurto: 'Iniciativas de celebração da diversidade',
    enunciado:
      'A instituição oferece iniciativas para celebrar a diversidade e fortalecer redes de apoio entre grupos minorizados',
    invertido: false,
  },
  {
    codigo: 'Q24f',
    chave: 'curriculos_principios_igualdade',
    rotuloCurto: 'Currículos com igualdade de gênero',
    enunciado:
      'Os princípios de igualdade, diversidade e inclusão estão presentes nos currículos, nas práticas pedagógicas e nas formas de avaliação dos cursos.',
    invertido: false,
  },
];

export const PageAmbienteViolencias: React.FC<PageAmbienteViolenciasProps> = ({ dados, carregando }) => {
  const q24Itens = dados?.q24_itens || [];
  const violenciaCor = dados?.violencia_por_cor || [];
  const violenciaGenero = dados?.violencia_por_genero || [];
  const vitimizacaoIntersec = dados?.vitimizacao_interseccional || [];
  const funilDenuncia = dados?.funil_denuncia || [];

  // ==========================================
  // 1. SELETORES LOCAIS DO DIAGRAMA DIVERGENTE
  // ==========================================
  const [segmentoDivergente, setSegmentoDivergente] = useState<SegmentoOpcao>('geral');
  const [generoDivergente, setGeneroDivergente] = useState<GeneroOpcao>('todos');

  const q24ItensFiltrados = q24Itens.map((item: any) => {
    const dist = item.distribuicao || [];
    const filtrada = dist.filter((d: any) => {
      const matchSeg = segmentoDivergente === 'geral' ? true : d.segmento === segmentoDivergente;
      const matchGen = generoDivergente === 'todos' ? true : d.genero_grp === generoDivergente;
      return matchSeg && matchGen;
    });

    const mapaResp: Record<string, number> = {};
    filtrada.forEach((d: any) => {
      mapaResp[d.resposta] = (mapaResp[d.resposta] || 0) + Number(d.n || 0);
    });

    return {
      ...item,
      distribuicao: Object.entries(mapaResp).map(([resposta, n]) => ({ resposta, n })),
    };
  });

  const nTotalDivergente =
    q24ItensFiltrados[0]?.distribuicao?.reduce((acc: number, d: any) => acc + Number(d.n || 0), 0) || 0;

  // ==========================================
  // 2. SELETORES LOCAIS DA TAXA POR COR/RAÇA
  // ==========================================
  const [segmentoCor, setSegmentoCor] = useState<SegmentoOpcao>('geral');
  const [generoCor, setGeneroCor] = useState<GeneroOpcao>('todos');

  const violenciaCorFiltrada = (() => {
    const filtradas = violenciaCor.filter((r: any) => {
      const matchSeg = segmentoCor === 'geral' ? true : r.segmento === segmentoCor;
      const matchGen = generoCor === 'todos' ? true : r.genero_grp === generoCor;
      return matchSeg && matchGen;
    });

    const agrupado: Record<string, { n_total: number; n_sim: number }> = {};
    filtradas.forEach((r: any) => {
      if (!agrupado[r.cor_raca]) {
        agrupado[r.cor_raca] = { n_total: 0, n_sim: 0 };
      }
      agrupado[r.cor_raca].n_total += Number(r.n_total || 0);
      agrupado[r.cor_raca].n_sim += Number(r.n_sim || 0);
    });

    return Object.entries(agrupado)
      .map(([cor_raca, val]) => ({
        cor_raca,
        n_total: val.n_total,
        n_sim: val.n_sim,
        taxa_pct: val.n_total > 0 ? Number(((val.n_sim * 100) / val.n_total).toFixed(1)) : 0,
      }))
      .sort((a, b) => a.taxa_pct - b.taxa_pct); // Ordenação para barras horizontais
  })();

  const nTotalCor = violenciaCorFiltrada.reduce((acc, r) => acc + r.n_total, 0);

  // ==========================================
  // 3. SELETORES LOCAIS DA TAXA POR GÊNERO/ORIENTAÇÃO
  // ==========================================
  const [segmentoGen, setSegmentoGen] = useState<SegmentoOpcao>('geral');
  const [generoGen, setGeneroGen] = useState<GeneroOpcao>('todos');

  const violenciaGeneroFiltrada = (() => {
    const filtradas = violenciaGenero.filter((r: any) => {
      const matchSeg = segmentoGen === 'geral' ? true : r.segmento === segmentoGen;
      const matchGen = generoGen === 'todos' ? true : r.genero_grp === generoGen;
      return matchSeg && matchGen;
    });

    const agrupado: Record<string, { n_total: number; n_sim: number }> = {};
    filtradas.forEach((r: any) => {
      if (!agrupado[r.grupo_genero]) {
        agrupado[r.grupo_genero] = { n_total: 0, n_sim: 0 };
      }
      agrupado[r.grupo_genero].n_total += Number(r.n_total || 0);
      agrupado[r.grupo_genero].n_sim += Number(r.n_sim || 0);
    });

    return Object.entries(agrupado)
      .map(([grupo_genero, val]) => ({
        grupo_genero,
        n_total: val.n_total,
        n_sim: val.n_sim,
        taxa_pct: val.n_total > 0 ? Number(((val.n_sim * 100) / val.n_total).toFixed(1)) : 0,
      }))
      .sort((a, b) => a.taxa_pct - b.taxa_pct);
  })();

  const nTotalGen = violenciaGeneroFiltrada.reduce((acc, r) => acc + r.n_total, 0);

  // ==========================================
  // 4. MATRIZ INTERSECCIONAL (TABELA)
  // ==========================================
  const [filtroCorRaca, setFiltroCorRaca] = useState<string>('todos');
  const [filtroGenero, setFiltroGenero] = useState<string>('todos');

  const opcoesCorRaca = Array.from(new Set(vitimizacaoIntersec.map((r: any) => r.cor_raca))).filter(Boolean) as string[];
  const opcoesGeneroMatriz = Array.from(new Set(vitimizacaoIntersec.map((r: any) => r.genero_grp))).filter(Boolean) as string[];

  const matrizFiltrada = vitimizacaoIntersec.filter((row: any) => {
    const matchCor = filtroCorRaca === 'todos' || row.cor_raca === filtroCorRaca;
    const matchGen = filtroGenero === 'todos' || row.genero_grp === filtroGenero;
    return matchCor && matchGen;
  });

  const subtotalRespondentes = matrizFiltrada.reduce((acc: number, r: any) => acc + Number(r.n_total || 0), 0);
  const subtotalVitimas = matrizFiltrada.reduce((acc: number, r: any) => acc + Number(r.n_vitimas || 0), 0);
  const taxaPonderadaRecorte =
    subtotalRespondentes > 0 ? ((subtotalVitimas * 100) / subtotalRespondentes).toFixed(1) : '0.0';

  // Categorias Likert Q24
  const categoriasLikert = [
    'Discordo Totalmente',
    'Discordo',
    'Não concordo nem discordo',
    'Concordo',
    'Concordo Totalmente',
    'N/A - Não sei avaliar',
  ];

  // Configuração ECharts: Diagrama Divergente Q24a-f
  const optionDivergenteQ24 = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      enterable: false,
      extraCssText:
        'max-width: 340px; white-space: normal; word-break: break-word; overflow-wrap: break-word; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6); z-index: 60;',
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any[]) => {
        const itemLabel = params[0]?.axisValueLabel || '';
        const limpo = itemLabel.toLowerCase().replace('(*item invertido)', '').trim();
        const pergunta = PERGUNTAS_COMPLETAS_Q24.find((p) => {
          return (
            p.rotuloCurto.toLowerCase().includes(limpo) ||
            limpo.includes(p.rotuloCurto.toLowerCase()) ||
            p.chave.toLowerCase().includes(limpo) ||
            p.enunciado.toLowerCase().includes(limpo)
          );
        });

        let html = `<div style="max-width: 310px; white-space: normal; word-break: break-word; overflow-wrap: break-word;" class="mb-2">`;
        if (pergunta) {
          html += `
            <div class="flex items-center gap-1.5 text-xs font-bold text-teal-300">
              <span class="bg-teal-950/80 border border-teal-700/60 px-1.5 py-0.2 rounded font-mono text-[10px] text-teal-200">${pergunta.codigo}</span>
              <span>${pergunta.rotuloCurto}</span>
              ${pergunta.invertido ? '<span class="ml-auto text-[10px] px-1 py-0.2 rounded bg-amber-900/60 border border-amber-700 text-amber-300 font-semibold">*Item invertido</span>' : ''}
            </div>
            <div style="white-space: normal; word-break: break-word; overflow-wrap: break-word;" class="mt-1.5 text-[11px] text-slate-200 italic leading-snug p-2 rounded bg-[#090f1f] border border-[#1f2d4e]">
              "${pergunta.enunciado}"
            </div>
          `;
        } else {
          html += `<div style="white-space: normal; word-break: break-word;" class="font-bold text-slate-100 text-xs mb-1">${itemLabel}</div>`;
        }
        html += `</div>`;

        params.forEach((p) => {
          const val = Math.abs(Number(p.value || 0));
          html += `<div class="flex items-center justify-between gap-4 text-xs text-slate-300 py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-slate-100">${formatarNumero(val)}</span>
          </div>`;
        });
        return html;
      },
    },
    legend: {
      data: categoriasLikert,
      bottom: 0,
      textStyle: { fontSize: 10, color: '#cbd5e1' },
    },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => formatarNumero(Math.abs(v)),
        fontSize: 10,
        color: '#94a3b8',
      },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    yAxis: {
      type: 'category',
      data: q24ItensFiltrados.map((i: any) => {
        const cleanLabel = i.label.replace(/^Q[0-9]+[a-z]?:\s*/i, '');
        return i.invertido ? `${cleanLabel} (*item invertido)` : cleanLabel;
      }).reverse(),
      axisLabel: { fontSize: 10, width: 220, overflow: 'truncate', color: '#cbd5e1' },
    },
    series: [
      {
        name: 'Discordo Totalmente',
        type: 'bar',
        stack: 'divergente',
        itemStyle: { color: CORES_LIKERT.discordoTotalmente },
        data: q24ItensFiltrados.map((item: any) => {
          const v = item.distribuicao?.find((d: any) => d.resposta === 'Discordo Totalmente')?.n || 0;
          return -v;
        }).reverse(),
      },
      {
        name: 'Discordo',
        type: 'bar',
        stack: 'divergente',
        itemStyle: { color: CORES_LIKERT.discordo },
        data: q24ItensFiltrados.map((item: any) => {
          const v = item.distribuicao?.find((d: any) => d.resposta === 'Discordo')?.n || 0;
          return -v;
        }).reverse(),
      },
      {
        name: 'Não concordo nem discordo',
        type: 'bar',
        stack: 'neutro',
        itemStyle: { color: CORES_LIKERT.neutro },
        data: q24ItensFiltrados.map((item: any) => {
          return item.distribuicao?.find((d: any) => d.resposta === 'Não concordo nem discordo')?.n || 0;
        }).reverse(),
      },
      {
        name: 'Concordo',
        type: 'bar',
        stack: 'positivo',
        itemStyle: { color: CORES_LIKERT.concordo },
        data: q24ItensFiltrados.map((item: any) => {
          return item.distribuicao?.find((d: any) => d.resposta === 'Concordo')?.n || 0;
        }).reverse(),
      },
      {
        name: 'Concordo Totalmente',
        type: 'bar',
        stack: 'positivo',
        itemStyle: { color: CORES_LIKERT.concordoTotalmente },
        data: q24ItensFiltrados.map((item: any) => {
          return item.distribuicao?.find((d: any) => d.resposta === 'Concordo Totalmente')?.n || 0;
        }).reverse(),
      },
      {
        name: 'N/A - Não sei avaliar',
        type: 'bar',
        stack: 'neutro',
        itemStyle: { color: CORES_LIKERT.naoAplica },
        data: q24ItensFiltrados.map((item: any) => {
          return item.distribuicao?.find((d: any) => d.resposta === 'N/A - Não sei avaliar')?.n || 0;
        }).reverse(),
      },
    ],
  };

  // Configuração ECharts: Taxas de Discriminação Racial (Barras horizontais)
  const optionViolenciaCor = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (p: any[]) => {
        const item = p[0];
        const obj = violenciaCorFiltrada.find((r) => r.cor_raca === item.name);
        return `<div class="font-bold text-slate-100">${item.name}</div>
          <div class="text-xs mt-1 text-rose-300">Discriminação Racial: <strong>${item.value}%</strong></div>
          ${obj ? `<div class="text-[11px] text-slate-400 mt-0.5">Relatos Sim: <strong>${formatarNumero(obj.n_sim)}</strong> de ${formatarNumero(obj.n_total)}</div>` : ''}`;
      },
    },
    grid: { left: '3%', right: '12%', top: '6%', bottom: '6%', containLabel: true },
    xAxis: {
      type: 'value',
      max: Math.max(35, ...violenciaCorFiltrada.map((r) => r.taxa_pct + 5)),
      axisLabel: { formatter: '{value}%', color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    yAxis: {
      type: 'category',
      data: violenciaCorFiltrada.map((r: any) => r.cor_raca),
      axisLabel: { color: '#cbd5e1', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: violenciaCorFiltrada.map((r: any) => r.taxa_pct),
        itemStyle: { color: PALETA_ACESSIVEL[4] },
        label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11, color: '#f43f5e', fontWeight: 600 },
      },
    ],
  };

  // Configuração ECharts: Taxas de Discriminação de Gênero/Orientação
  const optionViolenciaGenero = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (p: any[]) => {
        const item = p[0];
        const obj = violenciaGeneroFiltrada.find((r) => r.grupo_genero === item.name);
        return `<div class="font-bold text-slate-100">${item.name}</div>
          <div class="text-xs mt-1 text-sky-300">Violência de Gênero/LGBTfobia: <strong>${item.value}%</strong></div>
          ${obj ? `<div class="text-[11px] text-slate-400 mt-0.5">Relatos Sim: <strong>${formatarNumero(obj.n_sim)}</strong> de ${formatarNumero(obj.n_total)}</div>` : ''}`;
      },
    },
    grid: { left: '3%', right: '12%', top: '6%', bottom: '6%', containLabel: true },
    xAxis: {
      type: 'value',
      max: Math.max(35, ...violenciaGeneroFiltrada.map((r) => r.taxa_pct + 5)),
      axisLabel: { formatter: '{value}%', color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    yAxis: {
      type: 'category',
      data: violenciaGeneroFiltrada.map((r: any) => r.grupo_genero),
      axisLabel: { color: '#cbd5e1', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: violenciaGeneroFiltrada.map((r: any) => r.taxa_pct),
        itemStyle: { color: PALETA_ACESSIVEL[0] },
        label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11, color: '#38bdf8', fontWeight: 600 },
      },
    ],
  };

  // Opção ECharts: Funil de Denúncia (3 Etapas)
  const optionFunil = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
    },
    legend: {
      data: ['1. Conhece Canais', '2. Considera Efetivos', '3. Resultados Justos'],
      bottom: 0,
      textStyle: { fontSize: 11, color: '#cbd5e1' },
    },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: funilDenuncia.map((r: any) => r.vinculo_grp),
      axisLabel: { color: '#cbd5e1', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    series: [
      {
        name: '1. Conhece Canais',
        type: 'bar',
        itemStyle: { color: PALETA_ACESSIVEL[0] },
        data: funilDenuncia.map((r: any) => r.etapa_1_conhece),
      },
      {
        name: '2. Considera Efetivos',
        type: 'bar',
        itemStyle: { color: PALETA_ACESSIVEL[1] },
        data: funilDenuncia.map((r: any) => r.etapa_2_efetivos),
      },
      {
        name: '3. Resultados Justos',
        type: 'bar',
        itemStyle: { color: PALETA_ACESSIVEL[2] },
        data: funilDenuncia.map((r: any) => r.etapa_3_justos),
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Título de Seção */}
      <div className="border-b border-[#1f2d4e] pb-3">
        <h2 className="text-xl font-bold text-slate-100">3. Ambiente, Segurança, Clima e Violências</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Percepção do clima de convivência, incidência de discriminação ou violência direta por raça e gênero,
          matriz interseccional de relatos e funcionamento dos mecanismos de denúncia e acolhimento.
        </p>
      </div>

      {/* 1. Diagrama Divergente com Seletores Internos no Cabeçalho do Card */}
      <ChartCard
        titulo="Diagrama Divergente de Percepção do Clima Institucional"
        subtitulo="Distribuição de concordância (azul) vs discordância (vermelho). O item de maternidade é invertido."
        n={nTotalDivergente > 0 ? nTotalDivergente : undefined}
        elementoCabecalho={
          <div className="flex items-center justify-between gap-3 flex-wrap w-full">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Segmento:</span>
              <SeletorSegmento valor={segmentoDivergente} aoMudar={setSegmentoDivergente} />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Gênero:</span>
              <SeletorGenero valor={generoDivergente} aoMudar={setGeneroDivergente} />
            </div>
          </div>
        }
        option={optionDivergenteQ24}
        altura={460}
        carregando={carregando}
        notaRodape="*Item invertido: para impacto da maternidade na carreira, concordar indica barreira de equidade."
        infoTitulo="Enunciados Completos das Questões"
        infoTooltip={
          <div className="space-y-3">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Consulte abaixo o <strong>enunciado completo</strong> de cada questão formulada na pesquisa para avaliar o clima institucional:
            </p>
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {PERGUNTAS_COMPLETAS_Q24.map((item) => (
                <div
                  key={item.codigo}
                  className={`p-2.5 rounded-lg border text-xs ${
                    item.invertido
                      ? 'bg-amber-950/30 border-amber-800/60'
                      : 'bg-[#101930] border-[#223154]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-teal-300 font-mono text-[11px]">
                      {item.codigo} • {item.rotuloCurto}
                    </span>
                    {item.invertido && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-700/80 text-amber-300">
                        *Item invertido
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed italic">
                    "{item.enunciado}"
                  </p>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-[#1f2d4e] text-[10px] text-slate-400">
              Escala Likert: Discordo Totalmente, Discordo, Não concordo nem discordo, Concordo, Concordo Totalmente e N/A.
            </div>
          </div>
        }
      />

      {/* 2. Gráficos de Discriminação Lado a Lado (Grid 2 colunas com seletores internos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taxa de Discriminação por Cor/Raça */}
        <ChartCard
          titulo="Taxa Direta de Discriminação por Cor/Raça (% Sim)"
          subtitulo="Proporção que já sofreu violência ou discriminação racial no IFRS (pergunta direta)"
          n={nTotalCor > 0 ? nTotalCor : undefined}
          elementoCabecalho={
            <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Segmento:</span>
                <SeletorSegmento valor={segmentoCor} aoMudar={setSegmentoCor} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Gênero:</span>
                <SeletorGenero valor={generoCor} aoMudar={setGeneroCor} />
              </div>
            </div>
          }
          option={optionViolenciaCor}
          altura={320}
          carregando={carregando}
          tabelaDados={{
            cabecalhos: ['Cor / Raça', 'Respondentes (n)', 'Relatos Sim (n)', 'Taxa (%)'],
            linhas: [...violenciaCorFiltrada].reverse().map((r) => [r.cor_raca, r.n_total, r.n_sim, `${r.taxa_pct}%`]),
          }}
        />

        {/* Taxa de Discriminação por Gênero e Orientação */}
        <ChartCard
          titulo="Taxa de Discriminação por Gênero e Orientação (% Sim)"
          subtitulo="Proporção que já sofreu LGBTfobia ou violência de gênero (pergunta direta)"
          n={nTotalGen > 0 ? nTotalGen : undefined}
          elementoCabecalho={
            <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Segmento:</span>
                <SeletorSegmento valor={segmentoGen} aoMudar={setSegmentoGen} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Gênero:</span>
                <SeletorGenero valor={generoGen} aoMudar={setGeneroGen} />
              </div>
            </div>
          }
          option={optionViolenciaGenero}
          altura={320}
          carregando={carregando}
          tabelaDados={{
            cabecalhos: ['Identidade de Gênero', 'Respondentes (n)', 'Relatos Sim (n)', 'Taxa (%)'],
            linhas: [...violenciaGeneroFiltrada].reverse().map((r) => [r.grupo_genero, r.n_total, r.n_sim, `${r.taxa_pct}%`]),
          }}
        />
      </div>

      {/* 3. Tabela de Matriz Interseccional com Filtros Integrados */}
      <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5 space-y-4">
        {/* Cabeçalho e Descrição */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-100">
              Matriz Interseccional de Relatos de Discriminação (Cor / Raça × Gênero)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Proporção que relatou situação de violência ou preconceito (raça ou gênero/orientação).
              Células com n &lt; 10 recebem nota informativa de amostra pequena.
            </p>
          </div>

          {/* Resumo do Recorte Ativo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] bg-[#0e162b] border border-[#223154] text-slate-300 px-2.5 py-1 rounded-lg">
              {matrizFiltrada.length} de {vitimizacaoIntersec.length} grupos • {formatarNumero(subtotalRespondentes)} respondentes
            </span>
          </div>
        </div>

        {/* Barra de Filtros Internos da Matriz */}
        <div className="p-3 rounded-lg bg-[#0e162b] border border-[#223154] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtrar Matriz:</span>
            </div>

            {/* Combo 1: Cor / Raça */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filtro-matriz-cor" className="text-[11px] text-slate-400 font-medium">
                Cor/Raça:
              </label>
              <select
                id="filtro-matriz-cor"
                value={filtroCorRaca}
                onChange={(e) => setFiltroCorRaca(e.target.value)}
                className="bg-[#131d36] border border-[#2b3e6c] rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="todos">Todas as Cores/Raças ({opcoesCorRaca.length})</option>
                {opcoesCorRaca.map((cor) => (
                  <option key={cor} value={cor}>
                    {cor}
                  </option>
                ))}
              </select>
            </div>

            {/* Combo 2: Identidade de Gênero */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filtro-matriz-genero" className="text-[11px] text-slate-400 font-medium">
                Gênero:
              </label>
              <select
                id="filtro-matriz-genero"
                value={filtroGenero}
                onChange={(e) => setFiltroGenero(e.target.value)}
                className="bg-[#131d36] border border-[#2b3e6c] rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="todos">Todos os Grupos de Gênero ({opcoesGeneroMatriz.length})</option>
                {opcoesGeneroMatriz.map((gen) => (
                  <option key={gen} value={gen}>
                    {gen}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão Reset dos Filtros */}
          {(filtroCorRaca !== 'todos' || filtroGenero !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setFiltroCorRaca('todos');
                setFiltroGenero('todos');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-950/60 border border-teal-700/80 text-teal-300 hover:bg-teal-900/80 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        {/* Tabela de Dados com Linha de Totais */}
        <div className="overflow-x-auto rounded-lg border border-[#223154]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0e162b] text-slate-200 font-semibold border-b border-[#223154]">
              <tr>
                <th className="px-4 py-3">Cor / Raça</th>
                <th className="px-4 py-3">Identidade de Gênero</th>
                <th className="px-4 py-3">Respondentes (n)</th>
                <th className="px-4 py-3">Relatos Registrados</th>
                <th className="px-4 py-3">Taxa de Ocorrência</th>
                <th className="px-4 py-3">Status Amostral</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d4e]">
              {matrizFiltrada.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Nenhum registro encontrado para a combinação selecionada ({filtroCorRaca} × {filtroGenero}).
                  </td>
                </tr>
              ) : (
                matrizFiltrada.map((row: any, idx: number) => {
                  const pequena = Number(row.n_total) < 10;
                  return (
                    <tr key={idx} className="hover:bg-[#1a2647] transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-200">{row.cor_raca}</td>
                      <td className="px-4 py-2.5 text-slate-300">{row.genero_grp}</td>
                      <td className="px-4 py-2.5 text-slate-400">{formatarNumero(row.n_total)}</td>
                      <td className="px-4 py-2.5 text-rose-400 font-bold">{formatarNumero(row.n_vitimas)}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-100">{row.taxa_pct}%</td>
                      <td className="px-4 py-2.5">
                        {pequena ? (
                          <span className="text-[10px] bg-amber-950/60 border border-amber-800/60 text-amber-300 px-2 py-0.5 rounded font-medium">
                            amostra pequena (n &lt; 10)
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-2 py-0.5 rounded font-medium">
                            estável
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {matrizFiltrada.length > 0 && (
              <tfoot className="bg-[#0e162b] border-t-2 border-[#2b3e6c] font-semibold text-slate-200">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-teal-300 font-bold">
                    Subtotal do Recorte Selecionado
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-100">{formatarNumero(subtotalRespondentes)}</td>
                  <td className="px-4 py-3 font-bold text-rose-300">{formatarNumero(subtotalVitimas)}</td>
                  <td className="px-4 py-3 font-bold text-teal-300">{taxaPonderadaRecorte}% (média ponderada)</td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">
                    {subtotalRespondentes >= 10 ? 'base consistente' : 'amostra reduzida'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 4. Funil de Mecanismos de Denúncia */}
      <ChartCard
        titulo="Funil dos Mecanismos de Denúncia e Acolhimento"
        subtitulo="Sequência: Conhece canais → Considera efetivos → Percebe resultados justos"
        option={optionFunil}
        altura={350}
        carregando={carregando}
      />
    </div>
  );
};
