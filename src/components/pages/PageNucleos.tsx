/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChartCard } from '../ChartCard';
import { CORES_QUALIDADE, PALETA_ACESSIVEL } from '../../lib/chartTheme';
import { formatarNumero, formatarPercentual, formatarNota } from '../../lib/formatters';

interface PageNucleosProps {
  dados: any;
  carregando: boolean;
}

export const PageNucleos: React.FC<PageNucleosProps> = ({ dados, carregando }) => {
  const distNucleos = dados?.distribuicao_nucleos || [];
  const heatmapData = dados?.heatmap_campus_nucleo || [];
  const campanhas = dados?.eficacia_campanhas || [];

  const nomesNucleos = [
    'NAAF (Ações Afirmativas)',
    'NEABI (Afro-brasileiro e Indígena)',
    'NEPG (Gênero)',
    'Assessoria Ações Afirmativas',
    'Assessoria de Gênero',
    'Assessoria Étnico-Raciais',
  ];

  // Opção ECharts: Diagrama Divergente de Avaliação dos Núcleos + Desconhecimento
  const optionAvaliacaoNucleos = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
    },
    legend: {
      data: ['Muito Boa', 'Boa', 'Regular', 'Ruim', 'Muito Ruim', 'Não conheço'],
      bottom: 0,
      textStyle: { color: '#cbd5e1', fontSize: 10 },
    },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    yAxis: {
      type: 'category',
      data: distNucleos.map((n: any) => n.nome).reverse(),
      axisLabel: { fontSize: 11, color: '#cbd5e1' },
    },
    series: [
      {
        name: 'Muito Boa',
        type: 'bar',
        stack: 'qualidade',
        itemStyle: { color: CORES_QUALIDADE.muitoBoa },
        data: distNucleos.map((nuc: any) => {
          return nuc.respostas.find((r: any) => r.avaliacao === 'Muito Boa')?.n || 0;
        }).reverse(),
      },
      {
        name: 'Boa',
        type: 'bar',
        stack: 'qualidade',
        itemStyle: { color: CORES_QUALIDADE.boa },
        data: distNucleos.map((nuc: any) => {
          return nuc.respostas.find((r: any) => r.avaliacao === 'Boa')?.n || 0;
        }).reverse(),
      },
      {
        name: 'Regular',
        type: 'bar',
        stack: 'qualidade',
        itemStyle: { color: CORES_QUALIDADE.regular },
        data: distNucleos.map((nuc: any) => {
          return nuc.respostas.find((r: any) => r.avaliacao === 'Regular')?.n || 0;
        }).reverse(),
      },
      {
        name: 'Ruim',
        type: 'bar',
        stack: 'qualidade',
        itemStyle: { color: CORES_QUALIDADE.ruim },
        data: distNucleos.map((nuc: any) => {
          return nuc.respostas.find((r: any) => r.avaliacao === 'Ruim')?.n || 0;
        }).reverse(),
      },
      {
        name: 'Muito Ruim',
        type: 'bar',
        stack: 'qualidade',
        itemStyle: { color: CORES_QUALIDADE.muitoRuim },
        data: distNucleos.map((nuc: any) => {
          return nuc.respostas.find((r: any) => r.avaliacao === 'Muito Ruim')?.n || 0;
        }).reverse(),
      },
      {
        name: 'Não conheço',
        type: 'bar',
        stack: 'desconhece',
        itemStyle: { color: CORES_QUALIDADE.desconheco },
        data: distNucleos.map((nuc: any) => {
          return nuc.respostas.find((r: any) => r.avaliacao === 'Não conheço')?.n || 0;
        }).reverse(),
      },
    ],
  };

  // Opção ECharts: Eficácia das Campanhas
  const respostasQ28 = Array.from(
    new Set(
      campanhas.map((r: any) =>
        r.resposta === 'Sim, muito eficazes' ? 'Muito eficazes' : r.resposta
      )
    )
  );
  const optionCampanhas = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
    },
    legend: { bottom: 0, textStyle: { color: '#cbd5e1', fontSize: 10 } },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Discente', 'Servidor Efetivo', 'Docente Substituto'],
      axisLabel: { color: '#cbd5e1' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    series: respostasQ28.map((resp: any, idx: number) => ({
      name: resp as string,
      type: 'bar',
      stack: 'total',
      itemStyle: { color: PALETA_ACESSIVEL[idx % PALETA_ACESSIVEL.length] },
      data: ['Discente', 'Servidor Efetivo', 'Docente Substituto'].map((vinc) => {
        const item = campanhas.find(
          (r: any) =>
            (r.resposta === resp || (resp === 'Muito eficazes' && r.resposta === 'Sim, muito eficazes')) &&
            r.vinculo_grp === vinc
        );
        return item ? item.n : 0;
      }),
    })),
  };

  return (
    <div className="space-y-6">
      {/* Título de Seção */}
      <div className="border-b border-[#1f2d4e] pb-3">
        <h2 className="text-xl font-bold text-slate-100">4. Núcleos, Assessorias e Políticas Institucionais</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Avaliação de desempenho dos núcleos de ações afirmativas (NAAF, NEABI, NEPG e Assessorias) e
          percepção de eficácia das campanhas e capacitações de diversidade.
        </p>
      </div>

      {/* Gráfico 1: Avaliação dos Núcleos com Desconhecimento em Barra Cinza */}
      <ChartCard
        titulo="Avaliação dos Núcleos e Assessorias Institucionais"
        subtitulo="Distribuição de Muito Boa a Muito Ruim (cores) e percentual 'Não conheço' (barra cinza à parte)"
        option={optionAvaliacaoNucleos}
        altura={400}
        carregando={carregando}
      />

      {/* Tabela Heatmap Campus × Núcleo */}
      <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-100">
            Matriz Campus × Núcleo: Média de Qualidade (Escala 1 a 5)
          </h3>
          <p className="text-xs text-slate-400">
            Média calculada exclusivamente sobre os respondentes válidos que conhecem o órgão
            (excluindo 'Não conheço', escala de 1 = muito ruim até 5 = muito bom). Apresenta "—" quando n = 0.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#223154] rounded-lg">
            <thead className="bg-[#0e162b] text-slate-200 font-semibold border-b border-[#223154]">
              <tr>
                <th className="px-3 py-2.5">Campus / Unidade</th>
                <th className="px-3 py-2.5">NAAF</th>
                <th className="px-3 py-2.5">NEABI</th>
                <th className="px-3 py-2.5">NEPG</th>
                <th className="px-3 py-2.5">Ass. Afirmativas</th>
                <th className="px-3 py-2.5">Ass. Gênero</th>
                <th className="px-3 py-2.5">Ass. Étnico-Raciais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d4e]">
              {heatmapData.map((row: any, idx: number) => {
                const getMediaDisplay = (m: any, v: any) => {
                  if (!v || v === 0 || m === null) return <span className="text-slate-500 font-normal">—</span>;
                  const num = Number(m);
                  let colorClass = 'text-slate-300';
                  if (num >= 4.0) colorClass = 'text-emerald-400 font-bold';
                  else if (num <= 2.5) colorClass = 'text-rose-400 font-bold';
                  return (
                    <span className={colorClass}>
                      {formatarNota(num)} <span className="text-[10px] text-slate-400 font-normal">(n={v})</span>
                    </span>
                  );
                };

                return (
                  <tr key={idx} className="hover:bg-[#1a2647] transition-colors">
                    <td className="px-3 py-2 font-medium text-slate-200">{row.campus}</td>
                    <td className="px-3 py-2">{getMediaDisplay(row.media_avaliacao_naaf, row.validos_avaliacao_naaf)}</td>
                    <td className="px-3 py-2">{getMediaDisplay(row.media_avaliacao_neabi, row.validos_avaliacao_neabi)}</td>
                    <td className="px-3 py-2">{getMediaDisplay(row.media_avaliacao_nepgs, row.validos_avaliacao_nepgs)}</td>
                    <td className="px-3 py-2">{getMediaDisplay(row.media_avaliacao_assessoria_afirmativas, row.validos_avaliacao_assessoria_afirmativas)}</td>
                    <td className="px-3 py-2">{getMediaDisplay(row.media_avaliacao_assessoria_genero, row.validos_avaliacao_assessoria_genero)}</td>
                    <td className="px-3 py-2">{getMediaDisplay(row.media_avaliacao_assessoria_etnico_raciais, row.validos_avaliacao_assessoria_etnico_raciais)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico de Eficácia de Campanhas */}
      <ChartCard
        titulo="Percepção sobre a Eficácia das Campanhas e Ações Formativas"
        subtitulo="Avaliação do impacto transformador das ações de conscientização promovidas pelo IFRS"
        option={optionCampanhas}
        altura={350}
        carregando={carregando}
      />
    </div>
  );
};
