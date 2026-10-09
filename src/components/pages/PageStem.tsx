/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChartCard } from '../ChartCard';
import { KpiCard } from '../KpiCard';
import { Cpu, Users, GraduationCap, AlertCircle } from 'lucide-react';
import { PALETA_ACESSIVEL } from '../../lib/chartTheme';
import { formatarNumero, formatarPercentual } from '../../lib/formatters';

interface PageStemProps {
  dados: any;
  carregando: boolean;
}

export const PageStem: React.FC<PageStemProps> = ({ dados, carregando }) => {
  const ranking = dados?.areas_ranking_mulheres || [];
  const desencorajamento = dados?.desencorajamento_stem || {};
  const cobertura = dados?.cobertura || [];

  // Opção ECharts: Participação Feminina por Grande Área Ordenada
  const optionRankingMulheres = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (p: any[]) => {
        const item = p[0];
        const areaData = ranking.find((r: any) => r.area === item.name);
        return `<div class="font-bold text-slate-100">${item.name}</div>
          <div class="text-xs mt-1 text-teal-300">Participação Feminina: <strong>${item.value}%</strong></div>
          <div class="text-xs text-slate-400">Total respondentes: ${formatarNumero(areaData?.total)} (${formatarNumero(areaData?.mulheres)} mulheres)</div>`;
      },
    },
    grid: { left: '3%', right: '8%', top: '4%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    yAxis: {
      type: 'category',
      data: ranking.map((r: any) => r.area).reverse(),
      axisLabel: { fontSize: 11, color: '#cbd5e1' },
    },
    series: [
      {
        type: 'bar',
        data: ranking.map((r: any) => r.pct_mulheres).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[0] },
        label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11, color: '#38bdf8' },
      },
    ],
  };

  // Opção ECharts: Comparativo de Desencorajamento STEM vs Não-STEM
  const optionDesencorajamento = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
    },
    grid: { left: '3%', right: '8%', top: '4%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Áreas STEM (Exatas e Tecnologia)', 'Demais Grandes Áreas'],
      axisLabel: { color: '#cbd5e1', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      max: 50,
      axisLabel: { formatter: '{value}%', color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    series: [
      {
        type: 'bar',
        data: [
          desencorajamento.stem_pct || 0,
          desencorajamento.nao_stem_pct || 0,
        ],
        itemStyle: { color: '#f59e0b' },
        label: { show: true, position: 'top', formatter: '{c}%', fontSize: 12, fontWeight: 'bold', color: '#fbbf24' },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Título de Seção */}
      <div className="border-b border-[#1f2d4e] pb-3">
        <h2 className="text-xl font-bold text-slate-100">6. STEM e Masculinização das Áreas do Conhecimento</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Análise da representação feminina em Ciências Exatas, Engenharias e Computação (STEM) em comparação às
          demais áreas do conhecimento, diversidade racial e barreiras acadêmicas na formação discente.
        </p>
      </div>

      {/* KPIs de Desencorajamento e Presença em STEM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          titulo="Desencorajamento em STEM"
          valorPrincipal={`${desencorajamento.stem_pct ?? 0}%`}
          subvalor="estudantes em STEM"
          textoComplementar={`${formatarNumero(desencorajamento.stem_n)} discentes em Exatas e Tecnologia`}
          notaMetodologica="Estudantes que relataram ter sido desencorajados(as) a participar com frequência ou ocasionalmente"
          icone={<AlertCircle className="w-5 h-5 text-amber-400" />}
          corDestaque="amber"
        />

        <KpiCard
          titulo="Desencorajamento em Outras Áreas"
          valorPrincipal={`${desencorajamento.nao_stem_pct ?? 0}%`}
          subvalor="demais áreas"
          textoComplementar={`${formatarNumero(desencorajamento.nao_stem_n)} discentes em cursos não-STEM`}
          notaMetodologica="Comparativo com cursos de Humanas, Sociais, Agrárias e Saúde"
          icone={<GraduationCap className="w-5 h-5 text-sky-400" />}
          corDestaque="blue"
        />

        <KpiCard
          titulo="Áreas Mapeadas Deterministicamente"
          valorPrincipal={`${ranking.length} áreas`}
          subvalor="Grandes Áreas CNPq"
          textoComplementar="Classificação padronizada para comparabilidade estatística"
          notaMetodologica="Normalização determinística sobre todos os textos declarados pelos respondentes"
          icone={<Cpu className="w-5 h-5 text-emerald-400" />}
          corDestaque="emerald"
        />
      </div>

      {/* Gráficos de Ranking Feminino e Desencorajamento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            titulo="Participação Feminina por Grande Área do Conhecimento (CNPq)"
            subtitulo="Ordenada da maior para a menor proporção de mulheres no corpo discente"
            option={optionRankingMulheres}
            altura={380}
            carregando={carregando}
          />
        </div>

        <ChartCard
          titulo="Desencorajamento Acadêmico: STEM vs Outras"
          subtitulo="Comparação do percentual de estudantes que relataram desencorajamento a participar"
          option={optionDesencorajamento}
          altura={380}
          carregando={carregando}
        />
      </div>

      {/* Tabela de Auditoria e Cobertura da Normalização */}
      <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-100">
            Tabela de Auditoria e Cobertura da Normalização de Áreas
          </h3>
          <p className="text-xs text-slate-400">
            Mapeamento dos textos declarados pelos respondentes para as Grandes Áreas oficiais do CNPq.
          </p>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs border border-[#223154] rounded-lg">
            <thead className="bg-[#0e162b] text-slate-200 font-semibold border-b border-[#223154] sticky top-0">
              <tr>
                <th className="px-3 py-2.5">Texto Declarado no Formulário</th>
                <th className="px-3 py-2.5">Grande Área Atribuída (CNPq)</th>
                <th className="px-3 py-2.5">Respondentes (n)</th>
                <th className="px-3 py-2.5">Classificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d4e]">
              {cobertura.slice(0, 50).map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#1a2647] transition-colors">
                  <td className="px-3 py-2 font-mono text-slate-300 text-[11px]">{row.textoOriginal}</td>
                  <td className="px-3 py-2 font-medium text-teal-300">{row.grandeArea}</td>
                  <td className="px-3 py-2 text-slate-300">{formatarNumero(row.n)}</td>
                  <td className="px-3 py-2">
                    {row.grandeArea === 'Não classificada' ? (
                      <span className="text-[10px] bg-rose-950/60 border border-rose-800/60 text-rose-300 px-2 py-0.5 rounded font-medium">
                        Não classificada
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-2 py-0.5 rounded font-medium">
                        Padronizada
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
