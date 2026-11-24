/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChartCard } from '../ChartCard';
import { CORES_QUALIDADE, PALETA_ACESSIVEL } from '../../lib/chartTheme';
import { formatarNumero, formatarNota } from '../../lib/formatters';
import { SeletorSegmento, OpcaoSegmentoFiltro, correspondeSegmento } from '../SeletorSegmento';
import { SeletorIdade, OpcaoIdadeFiltro, correspondeIdade } from '../SeletorIdade';

interface PageNucleosProps {
  dados: any;
  carregando: boolean;
}

const ORDEM_VINCULOS_CAMPANHAS = ['Discentes', 'Docentes', 'Técnicos TAEs', 'Docentes Substitutos'];

export const PageNucleos: React.FC<PageNucleosProps> = ({ dados, carregando }) => {
  const distNucleos = dados?.distribuicao_nucleos || [];
  const heatmapData = (dados?.heatmap_campus_nucleo || []).filter(
    (row: any) => row.campus && row.campus !== 'Prefiro não responder'
  );
  const campanhas = dados?.eficacia_campanhas || [];

  // Seletores do Gráfico 1: Avaliação dos Núcleos e Assessorias Institucionais
  const [segmentoNucleos, setSegmentoNucleos] = useState<OpcaoSegmentoFiltro>('geral');
  const [idadeNucleos, setIdadeNucleos] = useState<OpcaoIdadeFiltro>('todos');

  // Seletor do Gráfico 2: Percepção sobre a Eficácia das Campanhas e Ações Formativas
  const [idadeCampanhas, setIdadeCampanhas] = useState<OpcaoIdadeFiltro>('todos');

  // Filtrar e agregar respostas de cada núcleo conforme Segmento e Idade
  const distNucleosFiltrada = distNucleos.map((nuc: any) => {
    const respostasBrutas = nuc.respostas || [];
    const filtradas = respostasBrutas.filter((r: any) => {
      const matchSeg = correspondeSegmento(r.segmento, segmentoNucleos);
      const matchIdade = correspondeIdade(r.idade_grp, idadeNucleos);
      return matchSeg && matchIdade;
    });

    const mapaAvaliacao: Record<string, number> = {};
    filtradas.forEach((r: any) => {
      mapaAvaliacao[r.avaliacao] = (mapaAvaliacao[r.avaliacao] || 0) + Number(r.n || 0);
    });

    return {
      ...nuc,
      respostas: Object.entries(mapaAvaliacao).map(([avaliacao, n]) => ({ avaliacao, n })),
      total: Object.values(mapaAvaliacao).reduce((acc, v) => acc + v, 0),
    };
  });

  const nTotalNucleos = distNucleosFiltrada[0]?.total || 0;

  // Opção ECharts: Diagrama de Avaliação dos Núcleos + Desconhecimento
  const optionAvaliacaoNucleos = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any[]) => {
        const nomeNuc = params[0]?.axisValueLabel || '';
        const totalNuc = params.reduce((acc, p) => acc + Number(p.value || 0), 0);
        let html = `<div class="font-bold text-slate-100 mb-1">${nomeNuc}</div>`;
        html += `<div class="text-[11px] text-slate-400 mb-2">Total de respondentes: <strong>${formatarNumero(totalNuc)}</strong></div>`;
        params.forEach((p) => {
          const val = Number(p.value || 0);
          const pct = totalNuc > 0 ? ((val * 100) / totalNuc).toFixed(1) : '0.0';
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-slate-100">${formatarNumero(val)} <span class="text-slate-400 font-normal">(${pct}%)</span></span>
          </div>`;
        });
        return html;
      },
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
      data: distNucleosFiltrada.map((n: any) => n.nome).reverse(),
      axisLabel: { fontSize: 11, color: '#cbd5e1', width: 260, overflow: 'break' },
    },
    series: [
      {
        name: 'Muito Boa',
        type: 'bar',
        stack: 'qualidade',
        itemStyle: { color: CORES_QUALIDADE.muitoBoa },
        data: distNucleosFiltrada
          .map((nuc: any) => nuc.respostas.find((r: any) => r.avaliacao === 'Muito Boa')?.n || 0)
          .reverse(),
      },
      {
        name: 'Boa',
        type: 'bar',
        stack: 'qualidade',
        itemStyle: { color: CORES_QUALIDADE.boa },
        data: distNucleosFiltrada
          .map((nuc: any) => nuc.respostas.find((r: any) => r.avaliacao === 'Boa')?.n || 0)
          .reverse(),
      },
      {
        name: 'Regular',
        type: 'bar',
        stack: 'qualidade',
        itemStyle: { color: CORES_QUALIDADE.regular },
        data: distNucleosFiltrada
          .map((nuc: any) => nuc.respostas.find((r: any) => r.avaliacao === 'Regular')?.n || 0)
          .reverse(),
      },
      {
        name: 'Ruim',
        type: 'bar',
        stack: 'qualidade',
        itemStyle: { color: CORES_QUALIDADE.ruim },
        data: distNucleosFiltrada
          .map((nuc: any) => nuc.respostas.find((r: any) => r.avaliacao === 'Ruim')?.n || 0)
          .reverse(),
      },
      {
        name: 'Muito Ruim',
        type: 'bar',
        stack: 'qualidade',
        itemStyle: { color: CORES_QUALIDADE.muitoRuim },
        data: distNucleosFiltrada
          .map((nuc: any) => nuc.respostas.find((r: any) => r.avaliacao === 'Muito Ruim')?.n || 0)
          .reverse(),
      },
      {
        name: 'Não conheço',
        type: 'bar',
        stack: 'desconhece',
        itemStyle: { color: CORES_QUALIDADE.desconheco },
        data: distNucleosFiltrada
          .map((nuc: any) => nuc.respostas.find((r: any) => r.avaliacao === 'Não conheço')?.n || 0)
          .reverse(),
      },
    ],
  };

  // Opção ECharts: Eficácia das Campanhas (Docentes e Técnicos TAEs separados + Filtro de Idade)
  const campanhasFiltradas = campanhas.filter((r: any) => correspondeIdade(r.idade_grp, idadeCampanhas));
  const nTotalCampanhas = campanhasFiltradas.reduce((acc: number, r: any) => acc + Number(r.n || 0), 0);

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
      formatter: (params: any[]) => {
        const vinc = params[0]?.axisValueLabel || '';
        const totalVinc = params.reduce((acc, p) => acc + Number(p.value || 0), 0);
        let html = `<div class="font-bold text-slate-100 mb-1">${vinc}</div>`;
        html += `<div class="text-[11px] text-slate-400 mb-2">Total no vínculo: <strong>${formatarNumero(totalVinc)}</strong></div>`;
        params.forEach((p) => {
          const val = Number(p.value || 0);
          const pct = totalVinc > 0 ? ((val * 100) / totalVinc).toFixed(1) : '0.0';
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-slate-100">${formatarNumero(val)} <span class="text-slate-400 font-normal">(${pct}%)</span></span>
          </div>`;
        });
        return html;
      },
    },
    legend: { bottom: 0, textStyle: { color: '#cbd5e1', fontSize: 10 } },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ORDEM_VINCULOS_CAMPANHAS,
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
      data: ORDEM_VINCULOS_CAMPANHAS.map((vinc) => {
        return campanhasFiltradas
          .filter(
            (r: any) =>
              (r.resposta === resp || (resp === 'Muito eficazes' && r.resposta === 'Sim, muito eficazes')) &&
              r.vinculo_grp === vinc
          )
          .reduce((acc: number, it: any) => acc + Number(it.n || 0), 0);
      }),
    })),
  };

  return (
    <div className="space-y-6">
      {/* Título de Seção */}
      <div className="border-b border-[#1f2d4e] pb-3">
        <h2 className="text-xl font-bold text-slate-100">4. Núcleos, Assessorias e Políticas Institucionais</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Avaliação de desempenho dos núcleos de ações afirmativas (NAAFs, NEABIs, NEPGSs e Assessorias) e percepção de eficácia das campanhas e capacitações de diversidade.
        </p>
      </div>

      {/* Gráfico 1: Avaliação dos Núcleos com Desconhecimento em Barra Cinza */}
      <ChartCard
        key={`avaliacao_nucleos_${segmentoNucleos}_${idadeNucleos}`}
        titulo="Avaliação dos Núcleos e Assessorias Institucionais"
        subtitulo="Distribuição de Muito Boa a Muito Ruim (cores) e percentual 'Não conheço' (barra cinza à parte)"
        n={nTotalNucleos}
        elementoCabecalho={
          <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
            <SeletorSegmento valor={segmentoNucleos} aoMudar={setSegmentoNucleos} />
            <SeletorIdade valor={idadeNucleos} aoMudar={setIdadeNucleos} />
          </div>
        }
        option={optionAvaliacaoNucleos}
        altura={420}
        carregando={carregando}
        tabelaDados={{
          cabecalhos: ['Núcleo / Assessoria', 'Muito Boa', 'Boa', 'Regular', 'Ruim', 'Muito Ruim', 'Não conheço', 'Total'],
          linhas: distNucleosFiltrada.map((nuc: any) => [
            nuc.nome,
            nuc.respostas.find((r: any) => r.avaliacao === 'Muito Boa')?.n || 0,
            nuc.respostas.find((r: any) => r.avaliacao === 'Boa')?.n || 0,
            nuc.respostas.find((r: any) => r.avaliacao === 'Regular')?.n || 0,
            nuc.respostas.find((r: any) => r.avaliacao === 'Ruim')?.n || 0,
            nuc.respostas.find((r: any) => r.avaliacao === 'Muito Ruim')?.n || 0,
            nuc.respostas.find((r: any) => r.avaliacao === 'Não conheço')?.n || 0,
            nuc.total,
          ]),
        }}
      />

      {/* Tabela Heatmap Campus × Núcleo */}
      <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Matriz Campus × Núcleo: Média de Qualidade (Escala 1 a 5)
            </h3>
            <p className="text-xs text-slate-400">
              Média calculada exclusivamente sobre os respondentes válidos que conhecem o órgão
              (excluindo 'Não conheço', escala de 1 = muito ruim até 5 = muito bom).
            </p>
          </div>
          <span className="text-[11px] bg-[#0e162b] border border-[#223154] text-slate-300 px-2.5 py-1 rounded-lg shrink-0">
            {heatmapData.length} unidades • total informado por célula
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#223154] rounded-lg">
            <thead className="bg-[#0e162b] text-slate-200 font-semibold border-b border-[#223154]">
              <tr>
                <th className="px-3 py-2.5">Campus / Unidade</th>
                <th className="px-3 py-2.5">NAAF</th>
                <th className="px-3 py-2.5">NEABI</th>
                <th className="px-3 py-2.5">NEPGS</th>
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
                      {formatarNota(num)} <span className="text-[10px] text-slate-400 font-normal">(total: {v})</span>
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
        key={`campanhas_eficacia_${idadeCampanhas}`}
        titulo="Percepção sobre a Eficácia das Campanhas e Ações Formativas"
        subtitulo="Avaliação do impacto transformador das ações de conscientização promovidas pelo IFRS"
        n={nTotalCampanhas}
        elementoCabecalho={
          <div className="flex items-center justify-end w-full">
            <SeletorIdade valor={idadeCampanhas} aoMudar={setIdadeCampanhas} />
          </div>
        }
        option={optionCampanhas}
        altura={360}
        carregando={carregando}
        tabelaDados={{
          cabecalhos: ['Vínculo Institucional', ...respostasQ28.map(String), 'Total'],
          linhas: ORDEM_VINCULOS_CAMPANHAS.map((vinc) => {
            const vals = respostasQ28.map((resp) =>
              campanhasFiltradas
                .filter(
                  (r: any) =>
                    (r.resposta === resp || (resp === 'Muito eficazes' && r.resposta === 'Sim, muito eficazes')) &&
                    r.vinculo_grp === vinc
                )
                .reduce((acc: number, it: any) => acc + Number(it.n || 0), 0)
            );
            const tot = vals.reduce((a, b) => a + b, 0);
            return [vinc, ...vals, tot];
          }),
        }}
      />
    </div>
  );
};
