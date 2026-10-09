/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ChartCard } from '../ChartCard';
import { PALETA_ACESSIVEL, CORES_LIKERT } from '../../lib/chartTheme';
import { formatarNumero } from '../../lib/formatters';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

type SegmentoLicencas = 'geral' | 'homens' | 'mulheres';

const SeletorSegmento: React.FC<{
  valor: SegmentoLicencas;
  aoMudar: (val: SegmentoLicencas) => void;
}> = ({ valor, aoMudar }) => (
  <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0a1020] border border-[#223154] text-xs">
    <button
      type="button"
      onClick={() => aoMudar('geral')}
      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
        valor === 'geral'
          ? 'bg-teal-500 text-slate-950 shadow-xs'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      Geral
    </button>
    <button
      type="button"
      onClick={() => aoMudar('homens')}
      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
        valor === 'homens'
          ? 'bg-teal-500 text-slate-950 shadow-xs'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      Homens
    </button>
    <button
      type="button"
      onClick={() => aoMudar('mulheres')}
      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
        valor === 'mulheres'
          ? 'bg-teal-500 text-slate-950 shadow-xs'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      Mulheres
    </button>
  </div>
);

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

  // Seletor de segmento de gênero para o gráfico de Licenças
  const [segmentoLicencas, setSegmentoLicencas] = useState<SegmentoLicencas>('geral');

  // Filtros internos para a tabela de Estudantes com Responsabilidade de Cuidado
  const [filtroCampus, setFiltroCampus] = useState<string>('todos');
  const [filtroNivel, setFiltroNivel] = useState<string>('todos');

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

  // 2. Gráfico Licenças e Apoio aos Pais com filtro por recorte (Geral, Homens, Mulheres)
  const obterTotalLicenca = (
    lista: any[],
    filtroResp: (r: string) => boolean
  ) => {
    return lista
      .filter((item: any) => {
        const matchGen =
          segmentoLicencas === 'geral'
            ? true
            : item.genero_grp === segmentoLicencas;
        return matchGen && filtroResp(String(item.resposta || ''));
      })
      .reduce((acc: number, item: any) => acc + Number(item.n || 0), 0);
  };

  const optionLicencas = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any) => {
        if (!params || !params.length) return '';
        const axisValue = String(params[0].axisValue || '').replace('\n', ' ');
        let total = 0;
        params.forEach((p: any) => {
          total += Number(p.value || 0);
        });
        let res = `<div style="font-weight:600;margin-bottom:6px;color:#f1f5f9;font-size:12px;">${axisValue} <span style="font-size:11px;font-weight:normal;color:#94a3b8;">(Total: ${total})</span></div>`;
        params.forEach((p: any) => {
          const val = Number(p.value || 0);
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0,0';
          res += `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px;color:#cbd5e1;margin-top:3px;">
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px;"></span>${p.seriesName}</span>
            <span style="font-weight:600;color:#f8fafc;">${val} (${pct}%)</span>
          </div>`;
        });
        return res;
      },
    },
    legend: {
      bottom: 2,
      textStyle: { fontSize: 10, color: '#cbd5e1' },
    },
    grid: { left: '3%', right: '4%', top: '6%', bottom: '18%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Licença Maternidade', 'Licença Paternidade', 'Apoio a Pais/Mães Estudantes'],
      axisLabel: {
        color: '#cbd5e1',
        interval: 0,
        fontSize: 11,
        formatter: (val: string) => {
          if (val === 'Licença Maternidade') return 'Licença\nMaternidade';
          if (val === 'Licença Paternidade') return 'Licença\nPaternidade';
          if (val === 'Apoio a Pais/Mães Estudantes') return 'Apoio a Pais/Mães\nEstudantes';
          return val;
        },
      },
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
          obterTotalLicenca(licMaternidade, (r) => r === 'Sim, é suficiente'),
          obterTotalLicenca(licPaternidade, (r) => r === 'Sim, é suficiente'),
          obterTotalLicenca(apoioPais, (r) => r === 'Sim, é suficiente'),
        ],
      },
      {
        name: 'Poderia ser melhor / mais longa',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#f59e0b' },
        data: [
          obterTotalLicenca(licMaternidade, (r) => r.includes('melhor')),
          obterTotalLicenca(licPaternidade, (r) => r.includes('melhor')),
          obterTotalLicenca(apoioPais, (r) => r.includes('melhor')),
        ],
      },
      {
        name: 'Não é suficiente',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#e11d48' },
        data: [
          obterTotalLicenca(licMaternidade, (r) => r === 'Não é suficiente'),
          obterTotalLicenca(licPaternidade, (r) => r === 'Não é suficiente'),
          obterTotalLicenca(apoioPais, (r) => r === 'Não é suficiente'),
        ],
      },
      {
        name: 'Desconheço / Não sei avaliar',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#64748b' },
        data: [
          obterTotalLicenca(licMaternidade, (r) => r.includes('Não sei') || r.includes('Prefiro')),
          obterTotalLicenca(licPaternidade, (r) => r.includes('Não sei') || r.includes('Prefiro')),
          obterTotalLicenca(apoioPais, (r) => r === 'Desconheço' || r.includes('Não sei') || r.includes('Prefiro')),
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

  // Opções e dados filtrados para a tabela de Estudantes com Responsabilidade de Cuidado
  const opcoesCampus = useMemo<string[]>(() => {
    return Array.from(new Set(estudantesCuidado.map((r: any) => String(r.campus || ''))))
      .filter((c): c is string => Boolean(c))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [estudantesCuidado]);

  const opcoesNivel = useMemo<string[]>(() => {
    return Array.from(new Set(estudantesCuidado.map((r: any) => String(r.nivel_curso || ''))))
      .filter((n): n is string => Boolean(n))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [estudantesCuidado]);

  const estudantesFiltrados = useMemo(() => {
    return estudantesCuidado.filter((row: any) => {
      const matchCampus = filtroCampus === 'todos' || row.campus === filtroCampus;
      const matchNivel = filtroNivel === 'todos' || row.nivel_curso === filtroNivel;
      return matchCampus && matchNivel;
    });
  }, [estudantesCuidado, filtroCampus, filtroNivel]);

  // Totais agregados da tabela filtrada
  const subtotalEstudantes = useMemo(() => {
    return estudantesFiltrados.reduce((acc: number, r: any) => acc + Number(r.total_estudantes || 0), 0);
  }, [estudantesFiltrados]);

  const subtotalPrincipal = useMemo(() => {
    return estudantesFiltrados.reduce((acc: number, r: any) => acc + Number(r.com_cuidado_principal || 0), 0);
  }, [estudantesFiltrados]);

  const subtotalDivide = useMemo(() => {
    return estudantesFiltrados.reduce((acc: number, r: any) => acc + Number(r.divide_cuidado || 0), 0);
  }, [estudantesFiltrados]);

  const subtotalComCuidado = subtotalPrincipal + subtotalDivide;
  const pctGeralComCuidado = subtotalEstudantes > 0 ? ((subtotalComCuidado / subtotalEstudantes) * 100).toFixed(1) : '0,0';

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
          subtitulo={`Percepção sobre adequação dos prazos de licença maternidade/paternidade e suporte institucional • Recorte: ${
            segmentoLicencas === 'geral' ? 'Geral' : segmentoLicencas === 'homens' ? 'Homens' : 'Mulheres'
          }`}
          elementoCabecalho={<SeletorSegmento valor={segmentoLicencas} aoMudar={setSegmentoLicencas} />}
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

      {/* Tabela: Estudantes com Responsabilidade de Cuidado com Filtros Integrados */}
      <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5 space-y-4">
        {/* Cabeçalho e Descrição */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-100">
              Estudantes com Responsabilidade de Cuidado por Campus e Nível de Curso
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Base discente. Dados contabilizam estudantes mães e pais conjuntamente por unidade de ensino.
            </p>
          </div>

          {/* Resumo do Recorte Ativo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] bg-[#0e162b] border border-[#223154] text-slate-300 px-2.5 py-1 rounded-lg">
              {estudantesFiltrados.length} de {estudantesCuidado.length} linhas • {formatarNumero(subtotalEstudantes)} estudantes
            </span>
          </div>
        </div>

        {/* Barra de Filtros Internos da Tabela */}
        <div className="p-3 rounded-lg bg-[#0e162b] border border-[#223154] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtrar Tabela:</span>
            </div>

            {/* Combo 1: Campus */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filtro-cuidado-campus" className="text-[11px] text-slate-400 font-medium">
                Campus:
              </label>
              <select
                id="filtro-cuidado-campus"
                value={filtroCampus}
                onChange={(e) => setFiltroCampus(e.target.value)}
                className="bg-[#131d36] border border-[#2b3e6c] rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="todos">Todos os Campi ({opcoesCampus.length})</option>
                {opcoesCampus.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Combo 2: Nível do Curso */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filtro-cuidado-nivel" className="text-[11px] text-slate-400 font-medium">
                Nível do Curso:
              </label>
              <select
                id="filtro-cuidado-nivel"
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value)}
                className="bg-[#131d36] border border-[#2b3e6c] rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="todos">Todos os Níveis ({opcoesNivel.length})</option>
                {opcoesNivel.map((niv) => (
                  <option key={niv} value={niv}>
                    {niv}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão Reset dos Filtros */}
          {(filtroCampus !== 'todos' || filtroNivel !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setFiltroCampus('todos');
                setFiltroNivel('todos');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-950/60 border border-teal-700/80 text-teal-300 hover:bg-teal-900/80 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        {/* Tabela de Dados */}
        <div className="overflow-x-auto max-h-96 rounded-lg border border-[#223154]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0e162b] text-slate-200 font-semibold border-b border-[#223154] sticky top-0 z-10">
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
              {estudantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Nenhum registro encontrado para os filtros selecionados ({filtroCampus} × {filtroNivel}).
                  </td>
                </tr>
              ) : (
                estudantesFiltrados.map((row: any, idx: number) => {
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
                })
              )}
            </tbody>
            {estudantesFiltrados.length > 0 && (
              <tfoot className="bg-[#0b1222] font-semibold border-t-2 border-[#2b3e6c] text-slate-200">
                <tr>
                  <td className="px-3 py-2.5" colSpan={2}>
                    Total Filtrado ({estudantesFiltrados.length} linhas)
                  </td>
                  <td className="px-3 py-2.5 text-slate-100">{formatarNumero(subtotalEstudantes)}</td>
                  <td className="px-3 py-2.5 text-rose-400">{formatarNumero(subtotalPrincipal)}</td>
                  <td className="px-3 py-2.5 text-amber-400">{formatarNumero(subtotalDivide)}</td>
                  <td className="px-3 py-2.5 font-bold text-teal-300">{pctGeralComCuidado}%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

