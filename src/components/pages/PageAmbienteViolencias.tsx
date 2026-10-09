/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChartCard } from '../ChartCard';
import { KpiCard } from '../KpiCard';
import { ShieldAlert, AlertTriangle, Scale, Filter, Info, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { formatarNumero, formatarPercentual } from '../../lib/formatters';
import { PALETA_ACESSIVEL, CORES_LIKERT } from '../../lib/chartTheme';

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

export const PageAmbienteViolencias: React.FC<PageAmbienteViolenciasProps> = ({ dados, carregando }) => {
  const q24Itens = dados?.q24_itens || [];
  const climaCampus = dados?.clima_por_campus || [];
  const violenciaCor = dados?.violencia_por_cor || [];
  const violenciaGenero = dados?.violencia_por_genero || [];
  const violenciaOrientacao = dados?.violencia_por_orientacao || [];
  const vitimizacaoIntersec = dados?.vitimizacao_interseccional || [];
  const desencorajamento = dados?.desencorajamento_estudantes || [];
  const funilDenuncia = dados?.funil_denuncia || [];

  // Estados para filtros da Matriz Interseccional
  const [filtroCorRaca, setFiltroCorRaca] = useState<string>('todos');
  const [filtroGenero, setFiltroGenero] = useState<string>('todos');

  // Opções únicas para os seletores da Matriz
  const opcoesCorRaca = Array.from(new Set(vitimizacaoIntersec.map((r: any) => r.cor_raca))).filter(Boolean) as string[];
  const opcoesGenero = Array.from(new Set(vitimizacaoIntersec.map((r: any) => r.genero_grp))).filter(Boolean) as string[];

  // Linhas filtradas da Matriz Interseccional
  const matrizFiltrada = vitimizacaoIntersec.filter((row: any) => {
    const matchCor = filtroCorRaca === 'todos' || row.cor_raca === filtroCorRaca;
    const matchGen = filtroGenero === 'todos' || row.genero_grp === filtroGenero;
    return matchCor && matchGen;
  });

  // Subtotais da Matriz no recorte ativo
  const subtotalRespondentes = matrizFiltrada.reduce((acc: number, r: any) => acc + Number(r.n_total || 0), 0);
  const subtotalVitimas = matrizFiltrada.reduce((acc: number, r: any) => acc + Number(r.n_vitimas || 0), 0);
  const taxaPonderadaRecorte =
    subtotalRespondentes > 0 ? ((subtotalVitimas * 100) / subtotalRespondentes).toFixed(1) : '0.0';

  // Média institucional ponderada de clima (com base no volume amostral de cada campus)
  const totalNClima = climaCampus.reduce((acc: number, r: any) => acc + Number(r.n || 0), 0);
  const mediaInstitucionalClima =
    totalNClima > 0
      ? (
          climaCampus.reduce((acc: number, r: any) => acc + Number(r.indice_100) * Number(r.n || 0), 0) /
          totalNClima
        ).toFixed(1)
      : '61.3';

  // Opção ECharts: Diagrama Divergente Q24a-f
  const categoriasLikert = [
    'Discordo Totalmente',
    'Discordo',
    'Não concordo nem discordo',
    'Concordo',
    'Concordo Totalmente',
    'N/A - Não sei avaliar',
  ];

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
      data: q24Itens.map((i: any) => {
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
        data: q24Itens.map((item: any) => {
          const v = item.distribuicao?.find((d: any) => d.resposta === 'Discordo Totalmente')?.n || 0;
          return -v;
        }).reverse(),
      },
      {
        name: 'Discordo',
        type: 'bar',
        stack: 'divergente',
        itemStyle: { color: CORES_LIKERT.discordo },
        data: q24Itens.map((item: any) => {
          const v = item.distribuicao?.find((d: any) => d.resposta === 'Discordo')?.n || 0;
          return -v;
        }).reverse(),
      },
      {
        name: 'Não concordo nem discordo',
        type: 'bar',
        stack: 'neutro',
        itemStyle: { color: CORES_LIKERT.neutro },
        data: q24Itens.map((item: any) => {
          return item.distribuicao?.find((d: any) => d.resposta === 'Não concordo nem discordo')?.n || 0;
        }).reverse(),
      },
      {
        name: 'Concordo',
        type: 'bar',
        stack: 'positivo',
        itemStyle: { color: CORES_LIKERT.concordo },
        data: q24Itens.map((item: any) => {
          return item.distribuicao?.find((d: any) => d.resposta === 'Concordo')?.n || 0;
        }).reverse(),
      },
      {
        name: 'Concordo Totalmente',
        type: 'bar',
        stack: 'positivo',
        itemStyle: { color: CORES_LIKERT.concordoTotalmente },
        data: q24Itens.map((item: any) => {
          return item.distribuicao?.find((d: any) => d.resposta === 'Concordo Totalmente')?.n || 0;
        }).reverse(),
      },
      {
        name: 'N/A - Não sei avaliar',
        type: 'bar',
        stack: 'neutro',
        itemStyle: { color: CORES_LIKERT.naoAplica },
        data: q24Itens.map((item: any) => {
          return item.distribuicao?.find((d: any) => d.resposta === 'N/A - Não sei avaliar')?.n || 0;
        }).reverse(),
      },
    ],
  };

  // Opção ECharts: Clima por Campus com Linha de Média Geral
  const optionClimaCampus = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any[]) => {
        const p = params[0];
        return `<div class="font-bold text-slate-100">${p.name}</div>
          <div class="text-xs mt-1 text-teal-300">Índice de Convivência: <strong>${p.value} / 100</strong></div>`;
      },
    },
    grid: { left: '3%', right: '8%', top: '5%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}', color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    yAxis: {
      type: 'category',
      data: climaCampus.map((c: any) => c.campus.replace('Campus ', '')).reverse(),
      axisLabel: { fontSize: 10, color: '#cbd5e1' },
    },
    series: [
      {
        type: 'bar',
        data: climaCampus.map((c: any) => c.indice_100).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[1] },
        markLine: {
          data: [{ xAxis: Number(mediaInstitucionalClima), name: 'Média Institucional' }],
          lineStyle: { color: '#f43f5e', type: 'dashed', width: 2 },
          label: { formatter: 'Média IFRS: {c}', position: 'end', fontSize: 10, color: '#fda4af' },
        },
      },
    ],
  };

  // Opção ECharts: Taxas de Violência Direta por Raça
  const optionViolenciaCor = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (p: any[]) => {
        const item = p[0];
        return `<div class="font-bold text-slate-100">${item.name}</div>
          <div class="text-xs mt-1 text-rose-300">Relatos de Discriminação Racial: <strong>${item.value}%</strong></div>`;
      },
    },
    grid: { left: '3%', right: '8%', top: '4%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 50,
      axisLabel: { formatter: '{value}%', color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    yAxis: {
      type: 'category',
      data: violenciaCor.map((r: any) => r.cor_raca).reverse(),
      axisLabel: { color: '#cbd5e1', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: violenciaCor.map((r: any) => r.taxa_pct).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[4] },
        label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11, color: '#f43f5e' },
      },
    ],
  };

  // Opção ECharts: Taxas de Violência por Gênero
  const optionViolenciaGenero = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (p: any[]) => {
        const item = p[0];
        return `<div class="font-bold text-slate-100">${item.name}</div>
          <div class="text-xs mt-1 text-sky-300">Relatos de Violência de Gênero/Orientação: <strong>${item.value}%</strong></div>`;
      },
    },
    grid: { left: '3%', right: '8%', top: '4%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 50,
      axisLabel: { formatter: '{value}%', color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    yAxis: {
      type: 'category',
      data: violenciaGenero.map((r: any) => r.grupo_genero).reverse(),
      axisLabel: { color: '#cbd5e1', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: violenciaGenero.map((r: any) => r.taxa_pct).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[0] },
        label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11, color: '#38bdf8' },
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

      {/* Diagrama Divergente */}
      <ChartCard
        titulo="Diagrama Divergente de Percepção do Clima Institucional"
        subtitulo="Distribuição de concordância (azul) vs discordância (vermelho). O item de maternidade é invertido."
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

      {/* Clima por Campus e Taxas Diretas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          titulo="Índice de Convivência Institucional por Campus (0 a 100)"
          subtitulo="Média normalizada das dimensões de convivência por unidade, comparada à média do IFRS"
          option={optionClimaCampus}
          altura={420}
          carregando={carregando}
          infoTitulo="Cálculo do Índice de Convivência Institucional"
          infoTooltip={
            <div className="space-y-3">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                O <strong>Índice de Convivência Institucional</strong> sintetiza a percepção geral sobre o clima de respeito, equidade e acolhimento no IFRS, calculado a partir das respostas válidas de discentes e servidores:
              </p>
              <div className="space-y-2.5 bg-[#090f1f] border border-[#1f2d4e] p-3 rounded-lg text-[11px]">
                <div>
                  <strong className="text-teal-300 block mb-0.5">1. Média das 6 Dimensões Psicométricas (Q24a a Q24f):</strong>
                  <span className="text-slate-300 leading-relaxed">
                    Cada respondente avalia 6 afirmações em escala Likert de 1 (Discordo Totalmente) a 5 (Concordo Totalmente).
                    O item <strong>Q24d (impacto da maternidade/parentalidade na carreira) é invertido</strong> matematicamente (6 − nota), pois concordar indica percepção de barreira à equidade.
                  </span>
                </div>
                <div>
                  <strong className="text-teal-300 block mb-0.5">2. Normalização Linear para Escala de 0 a 100:</strong>
                  <span className="text-slate-300 leading-relaxed">
                    A pontuação original (1 a 5) é convertida para a escala de 0 a 100 pela fórmula de interpolação linear:
                  </span>
                  <div className="my-1.5 p-1.5 bg-[#0a1224] rounded border border-teal-500/30 font-mono text-[11px] text-teal-200 text-center font-bold">
                    Índice = ((Média − 1) / 4) × 100
                  </div>
                  <span className="text-[10px] text-slate-400 block text-center">
                    (Ex.: Média 1,0 = 0 pts | Média 3,0 = 50 pts | Média 5,0 = 100 pts)
                  </span>
                </div>
                <div>
                  <strong className="text-teal-300 block mb-0.5">3. Média Geral do IFRS ({mediaInstitucionalClima} pts):</strong>
                  <span className="text-slate-300 leading-relaxed">
                    Representa a média ponderada de todos os {totalNClima.toLocaleString('pt-BR')} respondentes da instituição que avaliaram o bloco. É exibida no gráfico como linha de referência (baseline tracejada) para identificar quais unidades estão acima ou abaixo do patamar institucional.
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 border-t border-[#1f2d4e] pt-1.5">
                Para detalhes metodológicos completos e fórmulas, consulte a aba <strong>Metodologia</strong> (Seção 4: Construção de Índices e Escalas Normalizadas).
              </p>
            </div>
          }
        />

        <div className="space-y-6">
          <ChartCard
            titulo="Taxa Direta de Discriminação por Cor/Raça (% Sim)"
            subtitulo="Proporção que já sofreu violência ou discriminação racial no IFRS (pergunta direta)"
            option={optionViolenciaCor}
            altura={200}
            carregando={carregando}
          />

          <ChartCard
            titulo="Taxa de Discriminação por Gênero e Orientação (% Sim)"
            subtitulo="Proporção que já sofreu LGBTfobia ou violência de gênero (pergunta direta)"
            option={optionViolenciaGenero}
            altura={200}
            carregando={carregando}
          />
        </div>
      </div>

      {/* Tabela de Matriz Interseccional com Filtros Integrados */}
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
                <option value="todos">Todos os Grupos de Gênero ({opcoesGenero.length})</option>
                {opcoesGenero.map((gen) => (
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

      {/* Funil de Mecanismos de Denúncia */}
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
