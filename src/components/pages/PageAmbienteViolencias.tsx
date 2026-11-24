/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChartCard } from '../ChartCard';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { formatarNumero } from '../../lib/formatters';
import { PALETA_ACESSIVEL, CORES_LIKERT } from '../../lib/chartTheme';
import { CATEGORIAS_GENERO_OFICIAIS } from '../../lib/escalas';
import { SeletorGenero, OpcaoGeneroFiltro } from '../SeletorGenero';
import { SeletorSegmento, OpcaoSegmentoFiltro, correspondeSegmento } from '../SeletorSegmento';
import { SeletorRaca, OpcaoRacaFiltro } from '../SeletorRaca';
import { SeletorIdade, OpcaoIdadeFiltro, correspondeIdade } from '../SeletorIdade';

interface PageAmbienteViolenciasProps {
  dados: any;
  carregando: boolean;
}

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

const ORDEM_VINCULOS_FUNIL = ['Discentes', 'Docentes', 'Técnicos TAEs', 'Docentes Substitutos'];

export const PageAmbienteViolencias: React.FC<PageAmbienteViolenciasProps> = ({ dados, carregando }) => {
  const q24Itens = dados?.q24_itens || [];
  const violenciaCor = dados?.violencia_por_cor || [];
  const violenciaGenero = dados?.violencia_por_genero || [];
  const vitimizacaoIntersec = dados?.vitimizacao_interseccional || [];
  const funilDenuncia = dados?.funil_denuncia || [];

  // ==========================================
  // 1. SELETORES LOCAIS DO DIAGRAMA DIVERGENTE
  // ==========================================
  const [segmentoDivergente, setSegmentoDivergente] = useState<OpcaoSegmentoFiltro>('geral');
  const [generoDivergente, setGeneroDivergente] = useState<OpcaoGeneroFiltro>('todos');
  const [racaDivergente, setRacaDivergente] = useState<OpcaoRacaFiltro>('todos');
  const [idadeDivergente, setIdadeDivergente] = useState<OpcaoIdadeFiltro>('todos');

  const q24ItensFiltrados = q24Itens.map((item: any) => {
    const dist = item.distribuicao || [];
    const filtrada = dist.filter((d: any) => {
      const matchSeg = correspondeSegmento(d.segmento, segmentoDivergente);
      const matchGen = generoDivergente === 'todos' ? true : d.genero_grp === generoDivergente;
      const matchRaca = racaDivergente === 'todos' ? true : d.cor_raca === racaDivergente;
      const matchIdade = correspondeIdade(d.idade_grp, idadeDivergente);
      return matchSeg && matchGen && matchRaca && matchIdade;
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
  // 2. SELETORES LOCAIS DO PERCENTUAL POR COR/RAÇA
  // ==========================================
  const [segmentoCor, setSegmentoCor] = useState<OpcaoSegmentoFiltro>('geral');
  const [generoCor, setGeneroCor] = useState<OpcaoGeneroFiltro>('todos');
  const [idadeCor, setIdadeCor] = useState<OpcaoIdadeFiltro>('todos');

  const violenciaCorFiltrada = (() => {
    const filtradas = violenciaCor.filter((r: any) => {
      const matchSeg = correspondeSegmento(r.segmento, segmentoCor);
      const matchGen = generoCor === 'todos' ? true : r.genero_grp === generoCor;
      const matchIdade = correspondeIdade(r.idade_grp, idadeCor);
      return matchSeg && matchGen && matchIdade;
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
      .sort((a, b) => a.taxa_pct - b.taxa_pct);
  })();

  const nTotalCor = violenciaCorFiltrada.reduce((acc, r) => acc + r.n_total, 0);

  // ==========================================
  // 3. SELETORES LOCAIS DO PERCENTUAL POR GÊNERO/ORIENTAÇÃO
  // ==========================================
  const [segmentoGen, setSegmentoGen] = useState<OpcaoSegmentoFiltro>('geral');
  const [generoGen, setGeneroGen] = useState<OpcaoGeneroFiltro>('todos');
  const [idadeGen, setIdadeGen] = useState<OpcaoIdadeFiltro>('todos');

  const violenciaGeneroFiltrada = (() => {
    const filtradas = violenciaGenero.filter((r: any) => {
      const matchSeg = correspondeSegmento(r.segmento, segmentoGen);
      const matchGen = generoGen === 'todos' ? true : r.genero_grp === generoGen;
      const matchIdade = correspondeIdade(r.idade_grp, idadeGen);
      return matchSeg && matchGen && matchIdade;
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
  const opcoesGeneroMatriz = CATEGORIAS_GENERO_OFICIAIS.filter((cat) =>
    vitimizacaoIntersec.some((r: any) => r.genero_grp === cat)
  );

  const matrizFiltrada = vitimizacaoIntersec.filter((row: any) => {
    const matchCor = filtroCorRaca === 'todos' || row.cor_raca === filtroCorRaca;
    const matchGen = filtroGenero === 'todos' || row.genero_grp === filtroGenero;
    return matchCor && matchGen;
  });

  const subtotalRespondentes = matrizFiltrada.reduce((acc: number, r: any) => acc + Number(r.n_total || 0), 0);
  const subtotalRaca = matrizFiltrada.reduce((acc: number, r: any) => acc + Number(r.n_raca || 0), 0);
  const subtotalGen = matrizFiltrada.reduce((acc: number, r: any) => acc + Number(r.n_gen || 0), 0);
  const subtotalVitimas = matrizFiltrada.reduce((acc: number, r: any) => acc + Number(r.n_vitimas || 0), 0);
  const taxaPonderadaRecorte =
    subtotalRespondentes > 0 ? ((subtotalVitimas * 100) / subtotalRespondentes).toFixed(1) : '0.0';

  // ==========================================
  // 5. SELETORES LOCAIS DO FUNIL DE DENÚNCIA
  // ==========================================
  const [generoFunil, setGeneroFunil] = useState<OpcaoGeneroFiltro>('todos');
  const [racaFunil, setRacaFunil] = useState<OpcaoRacaFiltro>('todos');
  const [idadeFunil, setIdadeFunil] = useState<OpcaoIdadeFiltro>('todos');

  const funilFiltradoPorVinculo = ORDEM_VINCULOS_FUNIL.map((vinculo) => {
    const linhas = funilDenuncia.filter((r: any) => {
      const matchVinculo = r.vinculo_grp === vinculo;
      const matchGen = generoFunil === 'todos' ? true : r.genero_grp === generoFunil;
      const matchRaca = racaFunil === 'todos' ? true : r.cor_raca === racaFunil;
      const matchIdade = correspondeIdade(r.idade_grp, idadeFunil);
      return matchVinculo && matchGen && matchRaca && matchIdade;
    });

    const total = linhas.reduce((acc: number, r: any) => acc + Number(r.total_respondentes || r.base_total || 0), 0);
    const conhece = linhas.reduce((acc: number, r: any) => acc + Number(r.etapa_1_conhece || 0), 0);
    const efetivos = linhas.reduce((acc: number, r: any) => acc + Number(r.etapa_2_efetivos || 0), 0);
    const justos = linhas.reduce((acc: number, r: any) => acc + Number(r.etapa_3_justos || 0), 0);

    return {
      vinculo_grp: vinculo,
      total_respondentes: total,
      etapa_1_conhece: conhece,
      etapa_2_efetivos: efetivos,
      etapa_3_justos: justos,
      pct_conhece: total > 0 ? Number(((conhece * 100) / total).toFixed(1)) : 0,
      pct_efetivos: total > 0 ? Number(((efetivos * 100) / total).toFixed(1)) : 0,
      pct_justos: total > 0 ? Number(((justos * 100) / total).toFixed(1)) : 0,
    };
  });

  const nTotalFunil = funilFiltradoPorVinculo.reduce((acc, r) => acc + r.total_respondentes, 0);

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
      enterable: true,
      extraCssText:
        'max-width: 380px; white-space: normal; word-break: break-word; overflow-wrap: break-word; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6); z-index: 60;',
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

        let html = `<div style="max-width: 350px; white-space: normal; word-break: break-word; overflow-wrap: break-word;" class="mb-2">`;
        if (pergunta) {
          html += `
            <div class="flex items-center gap-1.5 text-xs font-bold text-teal-300">
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

  // Configuração ECharts: Percentual de Discriminação Racial (Barras horizontais)
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

  // Configuração ECharts: Percentual de Discriminação de Gênero/Orientação
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

  // Opção ECharts: Funil de Denúncia (3 Etapas sem numeração, Docentes e Técnicos TAEs separados)
  const optionFunil = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any[]) => {
        const vinc = params[0]?.axisValueLabel || '';
        const item = funilFiltradoPorVinculo.find((r) => r.vinculo_grp === vinc);
        let html = `<div class="font-bold text-slate-100 mb-1">${vinc}</div>`;
        if (item) {
          html += `<div class="text-[11px] text-slate-400 mb-2">Total no vínculo: <strong>${formatarNumero(item.total_respondentes)}</strong></div>`;
        }
        params.forEach((p) => {
          const val = Number(p.value || 0);
          const pct = item && item.total_respondentes > 0 ? ((val * 100) / item.total_respondentes).toFixed(1) : '0.0';
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-slate-100">${formatarNumero(val)} <span class="text-slate-400 font-normal">(${pct}%)</span></span>
          </div>`;
        });
        return html;
      },
    },
    legend: {
      data: ['Conhece Canais', 'Considera Efetivos', 'Considera os Resultados Justos'],
      bottom: 0,
      textStyle: { fontSize: 11, color: '#cbd5e1' },
    },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: funilFiltradoPorVinculo.map((r) => r.vinculo_grp),
      axisLabel: { color: '#cbd5e1', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    series: [
      {
        name: 'Conhece Canais',
        type: 'bar',
        itemStyle: { color: PALETA_ACESSIVEL[0] },
        data: funilFiltradoPorVinculo.map((r) => r.etapa_1_conhece),
      },
      {
        name: 'Considera Efetivos',
        type: 'bar',
        itemStyle: { color: PALETA_ACESSIVEL[1] },
        data: funilFiltradoPorVinculo.map((r) => r.etapa_2_efetivos),
      },
      {
        name: 'Considera os Resultados Justos',
        type: 'bar',
        itemStyle: { color: PALETA_ACESSIVEL[2] },
        data: funilFiltradoPorVinculo.map((r) => r.etapa_3_justos),
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
        key={`divergente_${segmentoDivergente}_${generoDivergente}_${racaDivergente}_${idadeDivergente}`}
        titulo="Diagrama Divergente de Percepção do Clima Institucional"
        subtitulo="Distribuição de concordância (azul) vs discordância (vermelho)."
        n={nTotalDivergente}
        elementoCabecalho={
          <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
            <div className="flex items-center gap-2.5 flex-wrap">
              <SeletorSegmento valor={segmentoDivergente} aoMudar={setSegmentoDivergente} />
              <SeletorRaca valor={racaDivergente} aoMudar={setRacaDivergente} />
              <SeletorIdade valor={idadeDivergente} aoMudar={setIdadeDivergente} />
            </div>
            <SeletorGenero valor={generoDivergente} aoMudar={setGeneroDivergente} />
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
                    <span className="font-bold text-teal-300 text-[11px]">
                      {item.rotuloCurto}
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
        {/* Percentual de Discriminação por Cor/Raça */}
        <ChartCard
          key={`violencia_cor_${segmentoCor}_${generoCor}_${idadeCor}`}
          titulo="Percentual de Discriminação por Cor/Raça"
          subtitulo="Proporção que já sofreu violência ou discriminação racial no IFRS"
          n={nTotalCor}
          elementoCabecalho={
            <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <SeletorSegmento valor={segmentoCor} aoMudar={setSegmentoCor} />
                <SeletorIdade valor={idadeCor} aoMudar={setIdadeCor} />
              </div>
              <SeletorGenero valor={generoCor} aoMudar={setGeneroCor} />
            </div>
          }
          option={optionViolenciaCor}
          altura={320}
          carregando={carregando}
          tabelaDados={{
            cabecalhos: ['Cor / Raça', 'Respondentes', 'Relatos Sim', 'Percentual (%)'],
            linhas: [...violenciaCorFiltrada].reverse().map((r) => [r.cor_raca, r.n_total, r.n_sim, `${r.taxa_pct}%`]),
          }}
        />

        {/* Percentual de Discriminação por Gênero e Orientação */}
        <ChartCard
          key={`violencia_gen_${segmentoGen}_${generoGen}_${idadeGen}`}
          titulo="Percentual de Discriminação por Gênero e Orientação"
          subtitulo="Proporção que já sofreu LGBTfobia ou violência de gênero nas 6 categorias oficiais de gênero"
          n={nTotalGen}
          elementoCabecalho={
            <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <SeletorSegmento valor={segmentoGen} aoMudar={setSegmentoGen} />
                <SeletorIdade valor={idadeGen} aoMudar={setIdadeGen} />
              </div>
              <SeletorGenero valor={generoGen} aoMudar={setGeneroGen} />
            </div>
          }
          option={optionViolenciaGenero}
          altura={320}
          carregando={carregando}
          tabelaDados={{
            cabecalhos: ['Identidade de Gênero', 'Respondentes', 'Relatos Sim', 'Percentual (%)'],
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
              Proporção que relatou situação de violência ou preconceito (raça ou gênero/orientação). O total de vítimas
              contabiliza a união sem dupla contagem de quem relatou ambos os tipos de violência.
            </p>
          </div>

          {/* Resumo do Recorte Ativo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] bg-[#0e162b] border border-[#223154] text-slate-300 px-2.5 py-1 rounded-lg">
              {matrizFiltrada.length} de {vitimizacaoIntersec.length} grupos • Total: {formatarNumero(subtotalRespondentes)} respondentes
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
                <option value="todos">Todos os Gêneros ({opcoesGeneroMatriz.length})</option>
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
                <th className="px-4 py-3">Respondentes</th>
                <th className="px-4 py-3">Discrim. Racial</th>
                <th className="px-4 py-3">Discrim. Gênero/Orient.</th>
                <th className="px-4 py-3">Total Vítimas (União)</th>
                <th className="px-4 py-3">Percentual (%)</th>
                <th className="px-4 py-3">Status Amostral</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d4e]">
              {matrizFiltrada.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
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
                      <td className="px-4 py-2.5 text-slate-300 font-medium">{formatarNumero(row.n_total)}</td>
                      <td className="px-4 py-2.5 text-amber-300">{formatarNumero(row.n_raca || 0)}</td>
                      <td className="px-4 py-2.5 text-sky-300">{formatarNumero(row.n_gen || 0)}</td>
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
              <tfoot className="bg-[#0b1222] font-semibold border-t-2 border-[#2b3e6c] text-slate-200">
                <tr>
                  <td className="px-4 py-3" colSpan={2}>
                    Total do Recorte ({matrizFiltrada.length} combinações)
                  </td>
                  <td className="px-4 py-3 text-slate-100">{formatarNumero(subtotalRespondentes)}</td>
                  <td className="px-4 py-3 text-amber-300">{formatarNumero(subtotalRaca)}</td>
                  <td className="px-4 py-3 text-sky-300">{formatarNumero(subtotalGen)}</td>
                  <td className="px-4 py-3 text-rose-400 font-bold">{formatarNumero(subtotalVitimas)}</td>
                  <td className="px-4 py-3 font-bold text-teal-300">{taxaPonderadaRecorte}%</td>
                  <td className="px-4 py-3 text-[11px] text-slate-400 font-normal">
                    Média ponderada do filtro
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 4. Funil de Denúncia e Confiança */}
      <ChartCard
        key={`funil_denuncia_${generoFunil}_${racaFunil}_${idadeFunil}`}
        titulo="Funil de Conhecimento, Efetividade e Justiça dos Canais de Denúncia"
        subtitulo="Número de pessoas que conhecem os canais formais de denúncia do IFRS, confiam em sua efetividade de apuração e avaliam seus resultados e encaminhamentos como justos, por vínculo institucional"
        n={nTotalFunil}
        elementoCabecalho={
          <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
            <div className="flex items-center gap-2.5 flex-wrap">
              <SeletorRaca valor={racaFunil} aoMudar={setRacaFunil} />
              <SeletorIdade valor={idadeFunil} aoMudar={setIdadeFunil} />
            </div>
            <SeletorGenero valor={generoFunil} aoMudar={setGeneroFunil} />
          </div>
        }
        option={optionFunil}
        altura={360}
        carregando={carregando}
        tabelaDados={{
          cabecalhos: [
            'Vínculo Institucional',
            'Respondentes',
            'Conhece Canais (total / %)',
            'Considera Efetivos (total / %)',
            'Considera os Resultados Justos (total / %)',
          ],
          linhas: funilFiltradoPorVinculo.map((r) => [
            r.vinculo_grp,
            r.total_respondentes,
            `${formatarNumero(r.etapa_1_conhece)} (${r.pct_conhece}%)`,
            `${formatarNumero(r.etapa_2_efetivos)} (${r.pct_efetivos}%)`,
            `${formatarNumero(r.etapa_3_justos)} (${r.pct_justos}%)`,
          ]),
        }}
      />
    </div>
  );
};
