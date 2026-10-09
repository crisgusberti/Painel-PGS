/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChartCard } from '../ChartCard';
import { PALETA_ACESSIVEL, CORES_LIKERT } from '../../lib/chartTheme';
import { formatarNumero, formatarPercentual } from '../../lib/formatters';

interface PageCuidadoProps {
  dados: any;
  carregando: boolean;
}

export const PageCuidado: React.FC<PageCuidadoProps> = ({ dados, carregando }) => {
  const respCuidado = dados?.responsabilidade_cuidado || [];
  const licMaternidade = dados?.licenca_maternidade || [];
  const licPaternidade = dados?.licenca_paternidade || [];
  const apoioPais = dados?.apoio_pais_estudantes || [];
  const maternidadeImpacto = dados?.maternidade_carreira_q24d || [];
  const estudantesCuidado = dados?.estudantes_cuidado || [];

  // 1. Gráfico Responsabilidade de Cuidado por Gênero
  const categoriasCuidado = [
    'Sim',
    'Divido a responsabilidade igualmente com outra(s) pessoa(s)',
    'Não',
    'Não tenho responsabilidade de cuidado sobre ninguém',
    'Prefiro não responder',
  ];

  const optionCuidadoGenero = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
    },
    legend: { data: categoriasCuidado, bottom: 0, textStyle: { fontSize: 10, color: '#cbd5e1' } },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Mulher', 'Homem', 'Não-binária / Outras'],
      axisLabel: { color: '#cbd5e1' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    series: categoriasCuidado.map((cat, idx) => ({
      name: cat,
      type: 'bar',
      stack: 'total',
      itemStyle: { color: PALETA_ACESSIVEL[idx % PALETA_ACESSIVEL.length] },
      data: ['Mulher', 'Homem', 'Não-binária / Outras'].map((g) => {
        const item = respCuidado.find((r: any) => r.responsabilidade_cuidado === cat && r.genero_grp === g);
        return item ? item.n : 0;
      }),
    })),
  };

  // 2. Gráfico Licenças e Apoio aos Pais
  const optionLicencas = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
    },
    legend: { bottom: 0, textStyle: { fontSize: 10, color: '#cbd5e1' } },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Licença Maternidade', 'Licença Paternidade', 'Apoio a Pais/Mães Estudantes'],
      axisLabel: { color: '#cbd5e1' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    series: [
      {
        name: 'Suficiente',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#059669' },
        data: [
          licMaternidade.find((r: any) => r.resposta === 'Sim, é suficiente')?.n || 0,
          licPaternidade.find((r: any) => r.resposta === 'Sim, é suficiente')?.n || 0,
          apoioPais.find((r: any) => r.resposta === 'Sim, é suficiente')?.n || 0,
        ],
      },
      {
        name: 'Poderia ser melhor / mais longa',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#f59e0b' },
        data: [
          licMaternidade.find((r: any) => r.resposta?.includes('melhor'))?.n || 0,
          licPaternidade.find((r: any) => r.resposta?.includes('melhor'))?.n || 0,
          apoioPais.find((r: any) => r.resposta?.includes('melhor'))?.n || 0,
        ],
      },
      {
        name: 'Não é suficiente',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#e11d48' },
        data: [
          licMaternidade.find((r: any) => r.resposta === 'Não é suficiente')?.n || 0,
          licPaternidade.find((r: any) => r.resposta === 'Não é suficiente')?.n || 0,
          apoioPais.find((r: any) => r.resposta === 'Não é suficiente')?.n || 0,
        ],
      },
      {
        name: 'Desconheço / Não sei avaliar',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#64748b' },
        data: [
          licMaternidade.find((r: any) => r.resposta?.includes('Não sei'))?.n || 0,
          licPaternidade.find((r: any) => r.resposta?.includes('Não sei'))?.n || 0,
          (apoioPais.find((r: any) => r.resposta === 'Desconheço')?.n || 0) +
            (apoioPais.find((r: any) => r.resposta?.includes('Não sei'))?.n || 0),
        ],
      },
    ],
  };

  // 3. Maternidade e Carreira
  const optionMaternidade = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
    },
    legend: {
      data: ['Concordo Totalmente', 'Concordo', 'Não concordo nem discordo', 'Discordo', 'Discordo Totalmente'],
      bottom: 0,
      textStyle: { fontSize: 10, color: '#cbd5e1' },
    },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Mulher', 'Homem', 'Não-binária / Outras'],
      axisLabel: { color: '#cbd5e1' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    series: [
      'Concordo Totalmente',
      'Concordo',
      'Não concordo nem discordo',
      'Discordo',
      'Discordo Totalmente',
    ].map((resp, idx) => ({
      name: resp,
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: [
          CORES_LIKERT.discordoTotalmente,
          CORES_LIKERT.discordo,
          CORES_LIKERT.neutro,
          CORES_LIKERT.concordo,
          CORES_LIKERT.concordoTotalmente,
        ][idx],
      },
      data: ['Mulher', 'Homem', 'Não-binária / Outras'].map((g) => {
        const item = maternidadeImpacto.find((r: any) => r.maternidade_impacto_carreira === resp && r.genero_grp === g);
        return item ? item.n : 0;
      }),
    })),
  };

  return (
    <div className="space-y-6">
      {/* Título de Seção */}
      <div className="border-b border-[#1f2d4e] pb-3">
        <h2 className="text-xl font-bold text-slate-100">5. Cuidado, Parentalidade e Permanência</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Distribuição da responsabilidade de cuidado de dependentes, avaliação sobre prazos de licenças e
          apoio para permanência de estudantes pais/mães, além da percepção sobre o impacto da maternidade na carreira.
        </p>
      </div>

      {/* Gráficos de Cuidado e Licenças */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          titulo="Responsabilidade Principal de Cuidado por Identidade de Gênero"
          subtitulo="Divisão do trabalho reprodutivo e de cuidado de dependentes entre mulheres e homens"
          option={optionCuidadoGenero}
          altura={380}
          carregando={carregando}
        />

        <ChartCard
          titulo="Suficiência das Licenças e Apoio a Estudantes com Filhos"
          subtitulo="Percepção sobre adequação dos prazos de licença maternidade/paternidade e suporte institucional"
          option={optionLicencas}
          altura={380}
          carregando={carregando}
        />
      </div>

      {/* Impacto da Maternidade na Carreira */}
      <ChartCard
        titulo="Percepção sobre o Impacto da Maternidade na Carreira"
        subtitulo="'A maternidade impacta negativamente o desenvolvimento profissional/acadêmico' (Concordar indica barreira de gênero)"
        option={optionMaternidade}
        altura={360}
        carregando={carregando}
      />

      {/* Tabela: Estudantes com Responsabilidade de Cuidado */}
      <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-100">
            Estudantes com Responsabilidade de Cuidado por Campus e Nível de Curso
          </h3>
          <p className="text-xs text-slate-400">
            Base discente. Dados contabilizam estudantes mães e pais conjuntamente por unidade de ensino.
          </p>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border border-[#223154] rounded-lg">
            <thead className="bg-[#0e162b] text-slate-200 font-semibold border-b border-[#223154] sticky top-0">
              <tr>
                <th className="px-3 py-2.5">Campus</th>
                <th className="px-3 py-2.5">Nível do Curso</th>
                <th className="px-3 py-2.5">Total Estudantes</th>
                <th className="px-3 py-2.5">Cuidado Principal (Sim)</th>
                <th className="px-3 py-2.5">Divide Cuidado</th>
                <th className="px-3 py-2.5 font-bold">% com Cuidado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d4e]">
              {estudantesCuidado.map((row: any, idx: number) => {
                const comCuidado = Number(row.com_cuidado_principal) + Number(row.divide_cuidado);
                const pct = Number(row.total_estudantes) > 0 ? ((comCuidado / Number(row.total_estudantes)) * 100).toFixed(1) : '0,0';
                return (
                  <tr key={idx} className="hover:bg-[#1a2647] transition-colors">
                    <td className="px-3 py-2 font-medium text-slate-200">{row.campus}</td>
                    <td className="px-3 py-2 text-slate-300">{row.nivel_curso}</td>
                    <td className="px-3 py-2 text-slate-400">{formatarNumero(row.total_estudantes)}</td>
                    <td className="px-3 py-2 text-rose-400 font-semibold">{formatarNumero(row.com_cuidado_principal)}</td>
                    <td className="px-3 py-2 text-amber-400">{formatarNumero(row.divide_cuidado)}</td>
                    <td className="px-3 py-2 font-bold text-slate-100">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
