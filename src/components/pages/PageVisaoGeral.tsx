/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { KpiCard } from '../KpiCard';
import { ChartCard } from '../ChartCard';
import {
  Users,
  ShieldAlert,
  Building,
  HeartHandshake,
  AlertTriangle,
  GraduationCap,
  Scale,
} from 'lucide-react';
import { formatarNumero, formatarPercentual } from '../../lib/formatters';
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

  // Preparar dados do gráfico por campus ordenado
  const campusTotals: Record<string, { total: number; discente: number; efetivo: number; substituto: number; terceirizado: number }> = {};

  campusDist.forEach((r: any) => {
    const c = r.campus || 'Não informado';
    if (!campusTotals[c]) {
      campusTotals[c] = { total: 0, discente: 0, efetivo: 0, substituto: 0, terceirizado: 0 };
    }
    const cnt = Number(r.total || 0);
    campusTotals[c].total += cnt;
    if (r.vinculo_simplificado === 'Discente') campusTotals[c].discente += cnt;
    else if (r.vinculo_simplificado === 'Servidor Efetivo') campusTotals[c].efetivo += cnt;
    else if (r.vinculo_simplificado === 'Docente Substituto') campusTotals[c].substituto += cnt;
    else campusTotals[c].terceirizado += cnt;
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
      data: ['Discente', 'Servidor Efetivo', 'Docente Substituto', 'Terceirizado'],
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
        name: 'Discente',
        type: 'bar',
        stack: 'total',
        data: campusOrdenados.map((c) => c.discente).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[0] },
      },
      {
        name: 'Servidor Efetivo',
        type: 'bar',
        stack: 'total',
        data: campusOrdenados.map((c) => c.efetivo).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[1] },
      },
      {
        name: 'Docente Substituto',
        type: 'bar',
        stack: 'total',
        data: campusOrdenados.map((c) => c.substituto).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[2] },
      },
      {
        name: 'Terceirizado',
        type: 'bar',
        stack: 'total',
        data: campusOrdenados.map((c) => c.terceirizado).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[9] },
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
          dados sobre composição da comunidade, clima institucional, segurança e acolhimento em todas as unidades.
        </p>
      </div>

      {/* Grid de KPIs Centrais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total de Respondentes */}
        <KpiCard
          titulo="Total de Respondentes"
          valorPrincipal={formatarNumero(kpis.total_respondentes || 4878)}
          subvalor="respostas validadas"
          textoComplementar="19 unidades (18 Campi e Reitoria)"
          notaMetodologica="Discentes: 65,9% • Servidores: 34,1% (participação voluntária)"
          icone={<Users className="w-5 h-5 text-slate-300" />}
          corDestaque="slate"
        />

        {/* KPI 2: Vínculo Discente e Servidores */}
        <KpiCard
          titulo="Composição da Amostra"
          valorPrincipal={formatarPercentual(kpis.discentes?.pct)}
          subvalor="estudantes"
          textoComplementar={`${formatarNumero(kpis.discentes?.n)} discentes de ${formatarNumero(kpis.total_respondentes)} respondentes`}
          notaMetodologica={`Servidores efetivos: ${formatarPercentual(kpis.servidores_efetivos?.pct)} (${formatarNumero(kpis.servidores_efetivos?.n)})`}
          icone={<GraduationCap className="w-5 h-5 text-sky-400" />}
          corDestaque="blue"
          aoClicar={() => aoNavegarAba('perfil')}
          rotuloClique="Ver perfil completo"
        />

        {/* KPI 3: Ocorrência de Discriminação ou Violência */}
        <KpiCard
          titulo="Ocorrência de Discriminação ou Violência"
          valorPrincipal={formatarPercentual(kpis.taxa_vitimizacao?.pct)}
          subvalor="da amostra total"
          textoComplementar={`${formatarNumero(kpis.taxa_vitimizacao?.n_sim)} pessoas relataram situações vivenciadas ou presenciadas`}
          notaMetodologica="Relatos diretos sobre discriminação ou violência por raça, cor, gênero ou orientação"
          icone={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          corDestaque="rose"
          aoClicar={() => aoNavegarAba('ambiente_violencias')}
          rotuloClique="Ver violências e clima"
        />

        {/* KPI 4: Índice de Convivência e Clima Institucional */}
        <KpiCard
          titulo="Índice de Convivência e Clima Institucional"
          valorPrincipal={`${kpis.indice_clima?.score ?? 0} / 100`}
          subvalor={`Média: ${kpis.indice_clima?.media_escala ?? 0} de 5`}
          textoComplementar="Mede a percepção de respeito, segurança e acolhimento no ambiente institucional"
          notaMetodologica="Escala consolidada de 6 dimensões de convivência (respeito, segurança, pertencimento e parentalidade)"
          icone={<Scale className="w-5 h-5 text-emerald-400" />}
          corDestaque="emerald"
          aoClicar={() => aoNavegarAba('ambiente_violencias')}
          rotuloClique="Ver detalhes do clima"
        />

        {/* KPI 5: Conhecimento dos Mecanismos de Denúncia */}
        <KpiCard
          titulo="Conhece Canais de Denúncia"
          valorPrincipal={formatarPercentual(kpis.conhece_mecanismos?.pct)}
          subvalor="respostas afirmativas"
          textoComplementar={`${formatarNumero(kpis.conhece_mecanismos?.n_sim)} de ${formatarNumero(kpis.total_respondentes)} respondentes`}
          notaMetodologica="Conhecimento declarado dos canais de ouvidoria e acolhimento institucional"
          icone={<ShieldAlert className="w-5 h-5 text-sky-400" />}
          corDestaque="blue"
        />

        {/* KPI 6: Efetividade dos Canais de Denúncia */}
        <KpiCard
          titulo="Efetividade dos Canais de Denúncia"
          valorPrincipal={formatarPercentual(kpis.confia_mecanismos?.pct)}
          subvalor="avaliam como resolutivos"
          textoComplementar={`${formatarNumero(kpis.confia_mecanismos?.n_sim)} de ${formatarNumero(kpis.confia_mecanismos?.n_base)} que opinaram sobre os canais`}
          notaMetodologica="Respostas válidas: considera apenas quem opinou sobre os canais (exclui quem não conhecia ou não soube avaliar)"
          icone={<Building className="w-5 h-5 text-indigo-400" />}
          corDestaque="indigo"
        />

        {/* KPI 7: Desencorajamento na Participação Acadêmica */}
        <KpiCard
          titulo="Desencorajamento na Participação Acadêmica"
          valorPrincipal={formatarPercentual(kpis.desencorajado_estudantes?.pct)}
          subvalor="dos estudantes"
          textoComplementar={`${formatarNumero(kpis.desencorajado_estudantes?.n_sim)} de ${formatarNumero(kpis.desencorajado_estudantes?.n_base)} discentes relataram inibição`}
          notaMetodologica="Estudantes que se sentiram desestimulados(as) a falar em aula, integrar projetos ou assumir lideranças"
          icone={<GraduationCap className="w-5 h-5 text-amber-400" />}
          corDestaque="amber"
          aoClicar={() => aoNavegarAba('stem')}
          rotuloClique="Ver recorte STEM"
        />

        {/* KPI 8: Responsabilidade Principal de Cuidado */}
        <KpiCard
          titulo="Responsabilidade Principal de Cuidado"
          valorPrincipal={formatarPercentual(kpis.responsabilidade_cuidado?.pct)}
          subvalor="cuidadores principais"
          textoComplementar={`${formatarNumero(kpis.responsabilidade_cuidado?.n_sim)} de ${formatarNumero(kpis.total_respondentes)} pessoas na comunidade`}
          notaMetodologica="Pessoas responsáveis prioritárias pelo cuidado de dependentes (filhos, idosos ou familiares)"
          icone={<HeartHandshake className="w-5 h-5 text-emerald-400" />}
          corDestaque="emerald"
          aoClicar={() => aoNavegarAba('cuidado')}
          rotuloClique="Ver parentalidade e cuidado"
        />
      </div>

      {/* Gráfico Principal: Respondentes por Campus e Vínculo Empilhado */}
      <ChartCard
        titulo="Distribuição de Respondentes por Campus e Vínculo Institucional"
        subtitulo="Quantidade de respondentes em cada unidade de ensino e Reitoria, categorizados por segmento"
        option={optionCampus}
        altura={500}
        carregando={carregando}
        tabelaDados={{
          cabecalhos: ['Campus', 'Total', 'Discentes', 'Servidores Efetivos', 'Substitutos', 'Terceirizados'],
          linhas: campusOrdenados.map((c) => [
            c.nome,
            c.total,
            c.discente,
            c.efetivo,
            c.substituto,
            c.terceirizado,
          ]),
        }}
      />
    </div>
  );
};
