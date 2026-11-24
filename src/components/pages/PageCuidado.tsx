/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ChartCard } from '../ChartCard';
import { PALETA_ACESSIVEL, CORES_LIKERT } from '../../lib/chartTheme';
import { formatarNumero } from '../../lib/formatters';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { CATEGORIAS_GENERO_OFICIAIS } from '../../lib/escalas';
import { SeletorGenero, OpcaoGeneroFiltro } from '../SeletorGenero';
import { SeletorSegmento, OpcaoSegmentoFiltro, correspondeSegmento, obterRotuloSegmento } from '../SeletorSegmento';
import { SeletorRaca, OpcaoRacaFiltro } from '../SeletorRaca';
import { SeletorIdade, OpcaoIdadeFiltro, correspondeIdade } from '../SeletorIdade';

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

  // 1. Seletores do Gráfico: Responsabilidade Principal de Cuidado por Identidade de Gênero
  const [segmentoCuidadoGen, setSegmentoCuidadoGen] = useState<OpcaoSegmentoFiltro>('geral');
  const [idadeCuidadoGen, setIdadeCuidadoGen] = useState<OpcaoIdadeFiltro>('todos');

  // 2. Seletores do Gráfico: Suficiência das Licenças e Apoio a Estudantes com Filhos/as
  const [segmentoLicencas, setSegmentoLicencas] = useState<OpcaoSegmentoFiltro>('geral');
  const [generoLicencas, setGeneroLicencas] = useState<OpcaoGeneroFiltro>('todos');
  const [idadeLicencas, setIdadeLicencas] = useState<OpcaoIdadeFiltro>('todos');

  // 3. Seletores do Gráfico: Percepção sobre o Impacto da Maternidade na Carreira
  const [segmentoMaternidade, setSegmentoMaternidade] = useState<OpcaoSegmentoFiltro>('geral');
  const [racaMaternidade, setRacaMaternidade] = useState<OpcaoRacaFiltro>('todos');
  const [idadeMaternidade, setIdadeMaternidade] = useState<OpcaoIdadeFiltro>('todos');

  // 4. Filtros internos para a tabela de Estudantes com Responsabilidade de Cuidado
  const [filtroCampus, setFiltroCampus] = useState<string>('todos');
  const [filtroNivel, setFiltroNivel] = useState<string>('todos');
  const [idadeEstudantes, setIdadeEstudantes] = useState<OpcaoIdadeFiltro>('todos');

  const generosOficiais = [...CATEGORIAS_GENERO_OFICIAIS];

  // =========================================================================
  // 1. Gráfico Responsabilidade Principal de Cuidado por Identidade de Gênero
  // =========================================================================
  const categoriasCuidado = [
    'Sim',
    'Divido a responsabilidade igualmente com outra(s) pessoa(s)',
    'Não',
    'Não tenho responsabilidade de cuidado sobre ninguém',
    'Prefiro não responder',
  ];

  const respCuidadoFiltrado = respCuidado.filter((r: any) => {
    const matchSeg = correspondeSegmento(r.segmento, segmentoCuidadoGen);
    const matchIdade = correspondeIdade(r.idade_grp, idadeCuidadoGen);
    return matchSeg && matchIdade;
  });

  const nTotalCuidadoGen = respCuidadoFiltrado.reduce((acc: number, r: any) => acc + Number(r.n || 0), 0);

  const optionCuidadoGenero = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any[]) => {
        const gen = params[0]?.axisValueLabel || '';
        const totalGen = params.reduce((acc, p) => acc + Number(p.value || 0), 0);
        let html = `<div class="font-bold text-slate-100 mb-1">${gen} (${obterRotuloSegmento(segmentoCuidadoGen)})</div>`;
        html += `<div class="text-[11px] text-slate-400 mb-2">Total de respondentes: <strong>${formatarNumero(totalGen)}</strong></div>`;
        params.forEach((p) => {
          const val = Number(p.value || 0);
          const pct = totalGen > 0 ? ((val * 100) / totalGen).toFixed(1) : '0.0';
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span class="truncate max-w-[230px]">${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-slate-100 shrink-0">${formatarNumero(val)} <span class="text-slate-400 font-normal">(${pct}%)</span></span>
          </div>`;
        });
        return html;
      },
    },
    legend: { data: categoriasCuidado, bottom: 0, textStyle: { fontSize: 10, color: '#cbd5e1' } },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '18%', containLabel: true },
    xAxis: {
      type: 'category',
      data: generosOficiais,
      axisLabel: { color: '#cbd5e1', interval: 0, fontSize: 11 },
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
      data: generosOficiais.map((g) => {
        const itens = respCuidadoFiltrado.filter(
          (r: any) => r.responsabilidade_cuidado === cat && r.genero_grp === g
        );
        return itens.reduce((acc: number, item: any) => acc + Number(item.n || 0), 0);
      }),
    })),
  };

  // =========================================================================
  // 2. Gráfico Percepção Acerca da Suficiência das Licenças e Apoio
  // =========================================================================
  const obterTotalLicenca = (lista: any[], filtroResp: (r: string) => boolean) => {
    return lista
      .filter((item: any) => {
        const matchSeg = correspondeSegmento(item.segmento, segmentoLicencas);
        const matchGen = generoLicencas === 'todos' ? true : item.genero_grp === generoLicencas;
        const matchIdade = correspondeIdade(item.idade_grp, idadeLicencas);
        return matchSeg && matchGen && matchIdade && filtroResp(String(item.resposta || ''));
      })
      .reduce((acc: number, item: any) => acc + Number(item.n || 0), 0);
  };

  const nTotalLicencas = licMaternidade
    .filter((item: any) => {
      const matchSeg = correspondeSegmento(item.segmento, segmentoLicencas);
      const matchGen = generoLicencas === 'todos' ? true : item.genero_grp === generoLicencas;
      const matchIdade = correspondeIdade(item.idade_grp, idadeLicencas);
      return matchSeg && matchGen && matchIdade;
    })
    .reduce((acc: number, item: any) => acc + Number(item.n || 0), 0);

  const optionLicencas = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
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
        let res = `<div style="font-weight:600;margin-bottom:6px;color:#f1f5f9;font-size:12px;">${axisValue} <span style="font-size:11px;font-weight:normal;color:#94a3b8;">(Total: ${formatarNumero(total)})</span></div>`;
        params.forEach((p: any) => {
          const val = Number(p.value || 0);
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0,0';
          res += `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px;color:#cbd5e1;margin-top:3px;">
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px;"></span>${p.seriesName}</span>
            <span style="font-weight:600;color:#f8fafc;">${formatarNumero(val)} (${pct}%)</span>
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

  // =========================================================================
  // 3. Percepção sobre o Impacto da Maternidade na Carreira (em % com detalhes no tooltip igual à Página 2)
  // =========================================================================
  const maternidadeFiltrada = maternidadeImpacto.filter((r: any) => {
    const matchSeg = correspondeSegmento(r.segmento, segmentoMaternidade);
    const matchRaca = racaMaternidade === 'todos' ? true : r.cor_raca === racaMaternidade;
    const matchIdade = correspondeIdade(r.idade_grp, idadeMaternidade);
    return matchSeg && matchRaca && matchIdade;
  });

  const opcoesLikertMaternidade = [
    'Concordo Totalmente',
    'Concordo',
    'Não concordo nem discordo',
    'Discordo',
    'Discordo Totalmente',
    'N/A - Não sei avaliar',
  ];

  const dadosMaternidadePorGenero = generosOficiais.map((g) => {
    const itensG = maternidadeFiltrada.filter((r: any) => r.genero_grp === g);
    const contagens: Record<string, number> = {};
    opcoesLikertMaternidade.forEach((op) => {
      contagens[op] = itensG
        .filter((r: any) => r.maternidade_impacto_carreira === op)
        .reduce((acc: number, it: any) => acc + Number(it.n || 0), 0);
    });
    const total = Object.values(contagens).reduce((a, b) => a + b, 0);
    const percentuais: Record<string, number> = {};
    opcoesLikertMaternidade.forEach((op) => {
      percentuais[op] = total > 0 ? Number(((contagens[op] * 100) / total).toFixed(1)) : 0;
    });
    return {
      genero: g,
      total,
      contagens,
      percentuais,
      rotuloComN: `${g} (total: ${formatarNumero(total)})`,
    };
  });

  const nTotalMaternidade = dadosMaternidadePorGenero.reduce((acc, d) => acc + d.total, 0);
  const rotuloSegMaternidade = obterRotuloSegmento(segmentoMaternidade);

  const coresMaternidade = [
    CORES_LIKERT.discordoTotalmente, // Concordo Totalmente (vermelho = barreira)
    CORES_LIKERT.discordo, // Concordo
    CORES_LIKERT.neutro, // Neutro
    CORES_LIKERT.concordo, // Discordo
    CORES_LIKERT.concordoTotalmente, // Discordo Totalmente
    CORES_LIKERT.naoAplica, // N/A
  ];

  const optionMaternidade = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any[]) => {
        const rotulo = params[0]?.axisValueLabel || '';
        const itemObj = dadosMaternidadePorGenero.find(
          (d) => d.rotuloComN === rotulo || d.genero === rotulo
        );
        let html = `<div class="font-bold text-slate-100 mb-1">${itemObj?.genero || rotulo} (${rotuloSegMaternidade})</div>`;
        if (itemObj) {
          html += `<div class="text-[11px] text-slate-400 mb-2">Total de respondentes: <strong>${formatarNumero(itemObj.total)}</strong>${racaMaternidade !== 'todos' ? ` • Raça: <strong>${racaMaternidade}</strong>` : ''}</div>`;
        }
        params.forEach((p) => {
          const nAbsoluto = itemObj?.contagens[p.seriesName] || 0;
          const valPct = Number(p.value || 0).toFixed(1);
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-slate-100">${valPct}% <span class="text-slate-400 font-normal">(${formatarNumero(nAbsoluto)} resp.)</span></span>
          </div>`;
        });
        if (itemObj && itemObj.total === 0) {
          html += `<div class="mt-2 pt-1.5 border-t border-slate-700 text-[11px] text-slate-400 italic">
            Nenhum registro nesta categoria para o recorte selecionado.
          </div>`;
        }
        return html;
      },
    },
    legend: {
      data: opcoesLikertMaternidade,
      bottom: 0,
      textStyle: { fontSize: 10, color: '#cbd5e1' },
    },
    grid: { left: '3%', right: '4%', top: '6%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dadosMaternidadePorGenero.map((d) => d.rotuloComN),
      axisLabel: { color: '#cbd5e1', interval: 0, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    series: opcoesLikertMaternidade.map((resp, idx) => ({
      name: resp,
      type: 'bar',
      stack: 'maternidade_100',
      itemStyle: { color: coresMaternidade[idx] },
      label: {
        show: true,
        position: 'inside',
        formatter: (p: any) => (p.value >= 8 ? `${p.value}%` : ''),
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 10,
      },
      data: dadosMaternidadePorGenero.map((d) => d.percentuais[resp]),
    })),
  };

  // =========================================================================
  // 4. Tabela: Estudantes com Responsabilidade de Cuidado (Campus, Nível e Idade)
  // =========================================================================
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
    const filtradosBrutos = estudantesCuidado.filter((row: any) => {
      const matchCampus = filtroCampus === 'todos' || row.campus === filtroCampus;
      const matchNivel = filtroNivel === 'todos' || row.nivel_curso === filtroNivel;
      const matchIdade = correspondeIdade(row.idade_grp, idadeEstudantes);
      return matchCampus && matchNivel && matchIdade;
    });

    // Agrupar por (campus, nivel_curso) após aplicar os filtros
    const mapa = new Map<
      string,
      {
        campus: string;
        nivel_curso: string;
        total_estudantes: number;
        com_cuidado_principal: number;
        divide_cuidado: number;
      }
    >();

    filtradosBrutos.forEach((r: any) => {
      const chave = `${r.campus}|||${r.nivel_curso}`;
      const atual = mapa.get(chave) || {
        campus: r.campus,
        nivel_curso: r.nivel_curso,
        total_estudantes: 0,
        com_cuidado_principal: 0,
        divide_cuidado: 0,
      };
      atual.total_estudantes += Number(r.total_estudantes || 0);
      atual.com_cuidado_principal += Number(r.com_cuidado_principal || 0);
      atual.divide_cuidado += Number(r.divide_cuidado || 0);
      mapa.set(chave, atual);
    });

    return Array.from(mapa.values()).sort(
      (a, b) => a.campus.localeCompare(b.campus, 'pt-BR') || a.nivel_curso.localeCompare(b.nivel_curso, 'pt-BR')
    );
  }, [estudantesCuidado, filtroCampus, filtroNivel, idadeEstudantes]);

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
          key={`cuidado_gen_${segmentoCuidadoGen}_${idadeCuidadoGen}`}
          titulo="Responsabilidade Principal de Cuidado por Identidade de Gênero"
          subtitulo="Divisão do trabalho reprodutivo e de cuidado de dependentes nas 6 categorias oficiais de gênero"
          n={nTotalCuidadoGen}
          elementoCabecalho={
            <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
              <SeletorSegmento valor={segmentoCuidadoGen} aoMudar={setSegmentoCuidadoGen} />
              <SeletorIdade valor={idadeCuidadoGen} aoMudar={setIdadeCuidadoGen} />
            </div>
          }
          option={optionCuidadoGenero}
          altura={400}
          carregando={carregando}
          infoTitulo="Sobre as 5 Opções de Resposta da Questão 9"
          infoTooltip={
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                Na base oficial do questionário (<strong>Questão 9:</strong>{' '}
                <em>"Você é a principal pessoa responsável pelo cuidado de filhos, filhas ou outros dependentes?"</em>),
                existem <strong>5 opções distintas</strong> selecionadas pelos respondentes:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-200">
                <li><strong>Sim</strong> (786 resp.): é a principal pessoa responsável pelo cuidado.</li>
                <li><strong>Divido a responsabilidade igualmente com outra(s) pessoa(s)</strong> (938 resp.): compartilha o cuidado de dependentes.</li>
                <li><strong>Não</strong> (1.686 resp.): há dependentes no núcleo familiar, mas outra pessoa é a principal responsável pelo cuidado.</li>
                <li><strong>Não tenho responsabilidade de cuidado sobre ninguém</strong> (1.391 resp.): não possui filhos/as ou dependentes sob cuidado.</li>
                <li><strong>Prefiro não responder</strong> (56 resp.).</li>
              </ul>
            </div>
          }
          tabelaDados={{
            cabecalhos: ['Gênero', ...categoriasCuidado, 'Total'],
            linhas: generosOficiais.map((g) => {
              const vals = categoriasCuidado.map((cat) =>
                respCuidadoFiltrado
                  .filter((r: any) => r.responsabilidade_cuidado === cat && r.genero_grp === g)
                  .reduce((acc: number, it: any) => acc + Number(it.n || 0), 0)
              );
              return [g, ...vals, vals.reduce((a, b) => a + b, 0)];
            }),
          }}
        />

        <ChartCard
          key={`licencas_${segmentoLicencas}_${generoLicencas}_${idadeLicencas}`}
          titulo="Percepção Acerca da Suficiência das Licenças Maternidade e Paternidade e do Apoio a Estudantes com Filhos/as"
          subtitulo={`Percepção sobre adequação das políticas institucionais • Recorte: ${obterRotuloSegmento(
            segmentoLicencas
          )} / ${generoLicencas === 'todos' ? 'Todos os Gêneros' : generoLicencas}`}
          n={nTotalLicencas}
          elementoCabecalho={
            <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <SeletorSegmento valor={segmentoLicencas} aoMudar={setSegmentoLicencas} />
                <SeletorIdade valor={idadeLicencas} aoMudar={setIdadeLicencas} />
              </div>
              <SeletorGenero valor={generoLicencas} aoMudar={setGeneroLicencas} />
            </div>
          }
          option={optionLicencas}
          altura={400}
          carregando={carregando}
          infoTitulo="Origem das 3 Categorias do Gráfico (Questões 31, 32 e 33)"
          infoTooltip={
            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <p>
                As 3 barras comparam as respostas das <strong>3 perguntas consecutivas do Bloco de Cuidado</strong> no formulário aplicado:
              </p>
              <div className="p-2 rounded bg-[#101930] border border-[#223154] space-y-1.5 text-[11px]">
                <p>
                  <strong className="text-teal-300">Questão 31 (Licença Maternidade):</strong>{' '}
                  <em>"31. Em sua opinião, a política de licença maternidade para servidores(as) é suficiente para promover uma divisão mais equitativa das responsabilidades de cuidado?"</em>
                </p>
                <p>
                  <strong className="text-teal-300">Questão 32 (Licença Paternidade):</strong>{' '}
                  <em>"32. Em sua opinião, a política de licença paternidade para servidores(as) é suficiente para promover uma divisão mais equitativa das responsabilidades de cuidado?"</em>
                </p>
                <p>
                  <strong className="text-teal-300">Questão 33 (Apoio a Pais/Mães Estudantes):</strong>{' '}
                  <em>"33. Em sua opinião, a política de apoio para estudantes que são pais e mães é suficiente para promover uma divisão mais equitativa das responsabilidades de cuidado?"</em>
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Impacto da Maternidade na Carreira */}
      <ChartCard
        key={`maternidade_impacto_${segmentoMaternidade}_${racaMaternidade}_${idadeMaternidade}`}
        titulo="Percepção sobre o Impacto da Maternidade na Carreira"
        subtitulo="A maternidade/paternidade/parentalidade é vista como um fator que pode impactar negativamente a carreira ou a trajetória acadêmica na instituição (Proporção % por identidade de gênero)"
        n={nTotalMaternidade}
        elementoCabecalho={
          <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
            <div className="flex items-center gap-2.5 flex-wrap">
              <SeletorSegmento valor={segmentoMaternidade} aoMudar={setSegmentoMaternidade} />
              <SeletorRaca valor={racaMaternidade} aoMudar={setRacaMaternidade} />
            </div>
            <SeletorIdade valor={idadeMaternidade} aoMudar={setIdadeMaternidade} />
          </div>
        }
        option={optionMaternidade}
        altura={380}
        carregando={carregando}
        tabelaDados={{
          cabecalhos: ['Gênero', ...opcoesLikertMaternidade.map((op) => `${op} (total / %)`), 'Total'],
          linhas: dadosMaternidadePorGenero.map((d) => [
            d.genero,
            ...opcoesLikertMaternidade.map((op) => `${formatarNumero(d.contagens[op])} (${d.percentuais[op]}%)`),
            d.total,
          ]),
        }}
      />

      {/* Tabela: Estudantes com Responsabilidade de Cuidado com Filtros Integrados */}
      <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5 space-y-4">
        {/* Cabeçalho e Descrição */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-100">
              Estudantes com Responsabilidade de Cuidado por Campus, Nível de Curso e Idade
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Base discente. Dados contabilizam estudantes mães e pais conjuntamente por unidade de ensino e modalidade/nível.
            </p>
          </div>

          {/* Resumo do Recorte Ativo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] bg-[#0e162b] border border-[#223154] text-slate-300 px-2.5 py-1 rounded-lg">
              {estudantesFiltrados.length} linhas • Total: {formatarNumero(subtotalEstudantes)} estudantes
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
                Nível:
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

            {/* Seletor 3: Idade */}
            <SeletorIdade valor={idadeEstudantes} aoMudar={setIdadeEstudantes} />
          </div>

          {/* Botão Reset dos Filtros */}
          {(filtroCampus !== 'todos' || filtroNivel !== 'todos' || idadeEstudantes !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setFiltroCampus('todos');
                setFiltroNivel('todos');
                setIdadeEstudantes('todos');
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
                    Nenhum registro encontrado para os filtros selecionados.
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
