/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KpiCard } from '../KpiCard';
import { ChartCard } from '../ChartCard';
import { SeletorGenero, OpcaoGeneroFiltro } from '../SeletorGenero';
import {
  Users,
  ShieldAlert,
  Building,
  HeartHandshake,
  AlertTriangle,
  GraduationCap,
  Scale,
} from 'lucide-react';
import { formatarNumero, formatarPercentual, formatarNota } from '../../lib/formatters';
import { PALETA_ACESSIVEL } from '../../lib/chartTheme';

interface PageVisaoGeralProps {
  dados: any;
  carregando: boolean;
  aoNavegarAba: (aba: string) => void;
}

export const PageVisaoGeral: React.FC<PageVisaoGeralProps> = ({
  dados,
  carregando,
  aoNavegarAba,
}) => {
  const kpis = dados?.kpis || {};
  const campusDist = dados?.campus_distribuicao || [];
  const [generoCampus, setGeneroCampus] = useState<OpcaoGeneroFiltro>('todos');

  // Preparar dados do gráfico por campus ordenado (separando Servidor Efetivo em Docentes e Técnicos TAEs, sem Terceirizados)
  const campusTotals: Record<
    string,
    {
      total: number;
      discente: number;
      docente: number;
      tecnico_tae: number;
      substituto: number;
    }
  > = {};

  campusDist.forEach((r: any) => {
    const c = r.campus;
    if (!c || c === 'Prefiro não responder') return;
    if (generoCampus !== 'todos' && r.genero !== generoCampus) return;
    if (!campusTotals[c]) {
      campusTotals[c] = { total: 0, discente: 0, docente: 0, tecnico_tae: 0, substituto: 0 };
    }
    const cnt = Number(r.total || 0);
    if (r.vinculo_simplificado === 'Discente') {
      campusTotals[c].discente += cnt;
      campusTotals[c].total += cnt;
    } else if (r.vinculo_simplificado === 'Docente') {
      campusTotals[c].docente += cnt;
      campusTotals[c].total += cnt;
    } else if (r.vinculo_simplificado === 'Técnico TAE') {
      campusTotals[c].tecnico_tae += cnt;
      campusTotals[c].total += cnt;
    } else if (r.vinculo_simplificado === 'Docente Substituto') {
      campusTotals[c].substituto += cnt;
      campusTotals[c].total += cnt;
    }
  });

  const campusOrdenados = Object.entries(campusTotals)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([nome, v]) => ({ nome, ...v }));

  const optionCampus = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any[]) => {
        const cNome = params[0]?.axisValueLabel || '';
        let html = `<div class="font-bold mb-1 text-slate-100">${cNome}</div>`;
        let total = 0;
        params.forEach((p) => {
          total += Number(p.value || 0);
          html += `<div class="flex items-center justify-between gap-4 text-xs text-slate-300">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-slate-100">${formatarNumero(p.value)}</span>
          </div>`;
        });
        html += `<div class="mt-1 pt-1 border-t border-[#223154] text-xs font-bold text-teal-300 flex justify-between">
          <span>Total:</span>
          <span>${formatarNumero(total)}</span>
        </div>`;
        return html;
      },
    },
    legend: {
      data: ['Discentes', 'Docentes', 'Técnicos TAEs', 'Docentes Substitutos'],
      bottom: 0,
      textStyle: { fontSize: 11, color: '#cbd5e1' },
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '5%',
      bottom: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    yAxis: {
      type: 'category',
      data: campusOrdenados.map((c) => c.nome.replace('Campus ', '')).reverse(),
      axisLabel: { fontSize: 11, color: '#cbd5e1' },
    },
    series: [
      {
        name: 'Discentes',
        type: 'bar',
        stack: 'total',
        data: campusOrdenados.map((c) => c.discente).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[0] },
      },
      {
        name: 'Docentes',
        type: 'bar',
        stack: 'total',
        data: campusOrdenados.map((c) => c.docente).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[1] },
      },
      {
        name: 'Técnicos TAEs',
        type: 'bar',
        stack: 'total',
        data: campusOrdenados.map((c) => c.tecnico_tae).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[3] },
      },
      {
        name: 'Docentes Substitutos',
        type: 'bar',
        stack: 'total',
        data: campusOrdenados.map((c) => c.substituto).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[2] },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Título e Resumo Introdutório */}
      <div className="border-b border-[#1f2d4e] pb-3">
        <h2 className="text-xl font-bold text-slate-100">Visão Geral dos Indicadores</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Panorama consolidado dos principais indicadores de igualdade e diversidade no IFRS, reunindo
          dados sobre composição da comunidade, clima institucional, segurança e acolhimento nas 18 unidades (17 Campi e Reitoria).
        </p>
      </div>

      {/* Grid de KPIs Centrais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* KPI 1: Total de Respondentes */}
        <KpiCard
          titulo="Total de Respondentes"
          valorPrincipal={formatarNumero(kpis.total_respondentes || 4857)}
          subvalor="respostas validadas"
          textoComplementar={`${kpis.unidades_validas || 18} unidades (17 Campi e Reitoria)`}
          notaMetodologica={`Discentes: ${formatarPercentual(kpis.discentes?.pct)} (${formatarNumero(kpis.discentes?.n)}) • Servidores: ${formatarPercentual(kpis.servidores_total?.pct)} (${formatarNumero(kpis.servidores_total?.n)}). Não contabiliza 'Prefiro não responder' em unidades nem terceirizados.`}
          icone={<Users className="w-5 h-5 text-slate-300" />}
          corDestaque="slate"
        />

        {/* KPI 2: Vínculo Discente e Servidores */}
        <KpiCard
          titulo="Composição da Amostra"
          valorPrincipal={formatarPercentual(kpis.discentes?.pct)}
          subvalor="estudantes"
          textoComplementar={`${formatarNumero(kpis.discentes?.n)} discentes de ${formatarNumero(kpis.total_respondentes)} respondentes`}
          notaMetodologica={`Servidores: ${formatarPercentual(kpis.servidores_total?.pct)} (${formatarNumero(kpis.servidores_total?.n)} no total: ${formatarNumero(kpis.docentes_efetivos?.n)} docentes efetivos, ${formatarNumero(kpis.taes_efetivos?.n)} técnicos TAE e ${formatarNumero(kpis.docentes_substitutos?.n)} substitutos)`}
          icone={<GraduationCap className="w-5 h-5 text-sky-400" />}
          corDestaque="blue"
          aoClicar={() => aoNavegarAba('perfil')}
          rotuloClique="Ver perfil completo"
        />

        {/* KPI 3: Ocorrência de Assédios e Violências */}
        <KpiCard
          titulo="Ocorrência de Assédios e Violências"
          valorPrincipal={formatarPercentual(kpis.taxa_vitimizacao?.pct)}
          subvalor="da amostra total"
          textoComplementar={`${formatarNumero(kpis.taxa_vitimizacao?.n_sim)} de ${formatarNumero(kpis.total_respondentes)} pessoas relataram ocorrências`}
          notaMetodologica={`Relatos diretos de assédios, discriminações ou violências vivenciadas/presenciadas: ${formatarNumero(kpis.taxa_vitimizacao?.genero_sim)} por gênero/orientação e ${formatarNumero(kpis.taxa_vitimizacao?.raca_sim)} por raça/cor.`}
          icone={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          corDestaque="rose"
          aoClicar={() => aoNavegarAba('ambiente_violencias')}
          rotuloClique="Ver violências e clima"
        />

        {/* KPI 4: Índice de Convivência e Clima Institucional */}
        <KpiCard
          titulo="Índice de Convivência e Clima Institucional"
          valorPrincipal={formatarPercentual(kpis.indice_clima?.score)}
          subvalor={`aprovação (média ${formatarNota(kpis.indice_clima?.media_escala)} de 5)`}
          textoComplementar="Grau de satisfação da comunidade com o respeito, a segurança e o acolhimento no IFRS"
          notaMetodologica="Escala pedagógica de 0% (totalmente desfavorável) a 100% (totalmente favorável), consolidando 6 dimensões: segurança para opinar, respeito no ambiente, inclusão trans, apoio à parentalidade, celebração da diversidade e igualdade nos currículos."
          icone={<Scale className="w-5 h-5 text-emerald-400" />}
          corDestaque="emerald"
          aoClicar={() => aoNavegarAba('ambiente_violencias')}
          rotuloClique="Ver detalhes do clima"
        />

        {/* KPI 5: Conhece Canais de Denúncia */}
        <KpiCard
          titulo="Conhece Canais de Denúncia"
          valorPrincipal={formatarPercentual(kpis.conhece_mecanismos?.pct)}
          subvalor="conhecem (Sim + Em parte)"
          textoComplementar={`${formatarNumero(kpis.conhece_mecanismos?.n_sim_total)} conhecem vs ${formatarNumero(kpis.conhece_mecanismos?.n_nao_total)} não conhecem (${formatarPercentual(kpis.conhece_mecanismos?.pct_nao_total)})`}
          notaMetodologica={
            <div className="space-y-1">
              <div>
                <strong className="text-sky-300">
                  Conhecem ({formatarNumero(kpis.conhece_mecanismos?.n_sim_total)} • {formatarPercentual(kpis.conhece_mecanismos?.pct)}):
                </strong>{' '}
                Sim, conheço ({formatarNumero(kpis.conhece_mecanismos?.n_sim)}) + Conheço em parte ({formatarNumero(kpis.conhece_mecanismos?.n_em_parte)})
              </div>
              <div>
                <strong className="text-slate-200">
                  Não conhecem ({formatarNumero(kpis.conhece_mecanismos?.n_nao_total)} • {formatarPercentual(kpis.conhece_mecanismos?.pct_nao_total)}):
                </strong>{' '}
                Não conheço ({formatarNumero(kpis.conhece_mecanismos?.n_nao)}) + Não sei ({formatarNumero(kpis.conhece_mecanismos?.n_nao_sei)})
              </div>
            </div>
          }
          icone={<ShieldAlert className="w-5 h-5 text-sky-400" />}
          corDestaque="blue"
        />

        {/* KPI 6: Efetividade dos Canais de Denúncia */}
        <KpiCard
          titulo="Efetividade dos Canais de Denúncia"
          valorPrincipal={formatarPercentual(kpis.confia_mecanismos?.pct)}
          subvalor={`dos ${formatarNumero(kpis.confia_mecanismos?.n_base)} que avaliaram`}
          textoComplementar={`${formatarNumero(kpis.confia_mecanismos?.n_sim)} avaliam como efetivos vs ${formatarNumero(kpis.confia_mecanismos?.n_negativo)} pouco/não efetivos (${formatarPercentual(kpis.confia_mecanismos?.pct_negativo)})`}
          notaMetodologica={
            <div className="space-y-1">
              <div>
                <strong className="text-indigo-300">
                  Efetivos ({formatarNumero(kpis.confia_mecanismos?.n_sim)} • {formatarPercentual(kpis.confia_mecanismos?.pct)}):
                </strong>{' '}
                Muito efetivos ({formatarNumero(kpis.confia_mecanismos?.n_muito)}) + Parcialmente efetivos ({formatarNumero(kpis.confia_mecanismos?.n_parcial)})
              </div>
              <div>
                <strong className="text-rose-300">
                  Pouco/Não efetivos ({formatarNumero(kpis.confia_mecanismos?.n_negativo)} • {formatarPercentual(kpis.confia_mecanismos?.pct_negativo)}):
                </strong>{' '}
                Pouco efetivos ({formatarNumero(kpis.confia_mecanismos?.n_pouco)}) + Não são efetivos ({formatarNumero(kpis.confia_mecanismos?.n_nao)})
              </div>
            </div>
          }
          icone={<Building className="w-5 h-5 text-indigo-400" />}
          corDestaque="indigo"
        />

        {/* KPI 7: Desencorajamento na Participação Acadêmica */}
        <KpiCard
          titulo="Desencorajamento na Participação Acadêmica por Gênero, Raça, Orientação Sexual ou Outras Características"
          valorPrincipal={formatarPercentual(kpis.desencorajado_estudantes?.pct)}
          subvalor="dos estudantes"
          textoComplementar={`${formatarNumero(kpis.desencorajado_estudantes?.n_sim)} de ${formatarNumero(kpis.desencorajado_estudantes?.n_base)} discentes relataram inibição`}
          notaMetodologica="13% dos estudantes sentiram-se desencorajados a participar de pesquisa, extensão ou eventos acadêmicos por gênero, raça, orientação sexual ou outras características pessoais."
          icone={<GraduationCap className="w-5 h-5 text-amber-400" />}
          corDestaque="amber"
          aoClicar={() => aoNavegarAba('stem')}
          rotuloClique="Ver recorte STEM"
        />

        {/* KPI 8: Responsabilidade de Cuidado */}
        <KpiCard
          titulo="Responsabilidade de Cuidado"
          valorPrincipal={formatarPercentual(kpis.responsabilidade_cuidado?.pct)}
          subvalor="exercem cuidado"
          textoComplementar={`${formatarNumero(kpis.responsabilidade_cuidado?.n_total_cuidado)} de ${formatarNumero(kpis.total_respondentes)} pessoas na comunidade`}
          notaMetodologica={
            <div className="space-y-1">
              <div>
                <strong className="text-emerald-300">
                  Total com cuidado ({formatarNumero(kpis.responsabilidade_cuidado?.n_total_cuidado)} • {formatarPercentual(kpis.responsabilidade_cuidado?.pct)}):
                </strong>
              </div>
              <div>
                • Responsáveis principais (Sim): <strong>{formatarNumero(kpis.responsabilidade_cuidado?.n_principal)}</strong> ({formatarPercentual(kpis.responsabilidade_cuidado?.pct_principal)})
              </div>
              <div>
                • Dividem igualmente o cuidado: <strong>{formatarNumero(kpis.responsabilidade_cuidado?.n_dividido)}</strong> ({formatarPercentual(kpis.responsabilidade_cuidado?.pct_dividido)})
              </div>
            </div>
          }
          icone={<HeartHandshake className="w-5 h-5 text-emerald-400" />}
          corDestaque="emerald"
          aoClicar={() => aoNavegarAba('cuidado')}
          rotuloClique="Ver parentalidade e cuidado"
        />
      </div>

      {/* Gráfico Principal: Respondentes por Campus e Vínculo Empilhado */}
      <ChartCard
        titulo="Distribuição de Respondentes por Campus e Vínculo Institucional"
        subtitulo="Quantidade de respondentes nas 18 unidades (17 Campi e Reitoria), separando servidores efetivos em Docentes e Técnicos TAEs"
        n={campusOrdenados.reduce((acc, c) => acc + c.total, 0)}
        elementoCabecalho={
          <SeletorGenero valor={generoCampus} aoMudar={setGeneroCampus} />
        }
        option={optionCampus}
        altura={500}
        carregando={carregando}
        tabelaDados={{
          cabecalhos: ['Campus / Unidade', 'Total', 'Discentes', 'Docentes', 'Técnicos TAEs', 'Docentes Substitutos'],
          linhas: campusOrdenados.map((c) => [
            c.nome,
            c.total,
            c.discente,
            c.docente,
            c.tecnico_tae,
            c.substituto,
          ]),
        }}
      />
    </div>
  );
};
