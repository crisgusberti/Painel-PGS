/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChartCard } from '../ChartCard';
import { SeletorGenero, OpcaoGeneroFiltro } from '../SeletorGenero';
import { SeletorSegmento, OpcaoSegmentoFiltro, correspondeSegmento } from '../SeletorSegmento';
import { SeletorIdade, OpcaoIdadeFiltro, correspondeIdade } from '../SeletorIdade';
import { formatarNumero, formatarPercentual } from '../../lib/formatters';
import { PALETA_ACESSIVEL } from '../../lib/chartTheme';
import { CATEGORIAS_GENERO_OFICIAIS } from '../../lib/escalas';

interface PagePerfilProps {
  dados: any;
  carregando: boolean;
}

const ORDEM_FAIXA_ETARIA = [
  'Menor de 18 anos',
  '18 a 29 anos',
  '30 a 39 anos',
  '40 a 49 anos',
  '50 a 59 anos',
  '60 anos ou mais',
  'Prefiro não responder',
];

export const PagePerfil: React.FC<PagePerfilProps> = ({ dados, carregando }) => {
  const generoDetRaw = dados?.genero_detalhado || [];
  const corRacaRaw = dados?.cor_raca || [];
  const orientacaoRaw = dados?.orientacao_sexual || [];
  const faixaEtariaRaw = dados?.faixa_etaria || [];
  const pcdRaw = dados?.pcd || [];

  // Estados independentes de filtro de segmento ("Geral", "Docente", "Técnico TAE", "Discentes") para cada gráfico
  const [segGenero, setSegGenero] = useState<OpcaoSegmentoFiltro>('geral');
  const [segCorRaca, setSegCorRaca] = useState<OpcaoSegmentoFiltro>('geral');
  const [segOrientacao, setSegOrientacao] = useState<OpcaoSegmentoFiltro>('geral');
  const [segFaixaEtaria, setSegFaixaEtaria] = useState<OpcaoSegmentoFiltro>('geral');
  const [segPcd, setSegPcd] = useState<OpcaoSegmentoFiltro>('geral');

  // Estados independentes de filtro de gênero ("Todos", "Mulher", "Homem", etc.) para os 4 gráficos sociodemográficos
  const [genCorRaca, setGenCorRaca] = useState<OpcaoGeneroFiltro>('todos');
  const [genOrientacao, setGenOrientacao] = useState<OpcaoGeneroFiltro>('todos');
  const [genFaixaEtaria, setGenFaixaEtaria] = useState<OpcaoGeneroFiltro>('todos');
  const [genPcd, setGenPcd] = useState<OpcaoGeneroFiltro>('todos');

  // Estados independentes de filtro de idade ("Todos", "Menor", "Maior") para cada gráfico
  const [idadeGenero, setIdadeGenero] = useState<OpcaoIdadeFiltro>('todos');
  const [idadeCorRaca, setIdadeCorRaca] = useState<OpcaoIdadeFiltro>('todos');
  const [idadeOrientacao, setIdadeOrientacao] = useState<OpcaoIdadeFiltro>('todos');
  const [idadeFaixaEtaria, setIdadeFaixaEtaria] = useState<OpcaoIdadeFiltro>('todos');
  const [idadePcd, setIdadePcd] = useState<OpcaoIdadeFiltro>('todos');

  // Função utilitária que filtra por segmento, gênero e idade e soma quantidades por categoria
  const agregarPorCategoria = (
    rows: any[],
    segmentoSelecionado: OpcaoSegmentoFiltro,
    generoSelecionado: OpcaoGeneroFiltro = 'todos',
    idadeSelecionada: OpcaoIdadeFiltro = 'todos',
    categoriasFixas?: readonly string[]
  ): { itens: { categoria: string; n: number }[]; totalSegmento: number } => {
    const filtrados = rows.filter((r: any) => {
      const matchSegmento = correspondeSegmento(r.segmento, segmentoSelecionado);
      const matchGenero =
        generoSelecionado === 'todos' ? true : r.genero === generoSelecionado;
      const matchIdade = correspondeIdade(r.idade_grp, idadeSelecionada);
      return matchSegmento && matchGenero && matchIdade;
    });

    const mapa: Record<string, number> = {};
    if (categoriasFixas) {
      categoriasFixas.forEach((c) => {
        mapa[c] = 0;
      });
    }

    filtrados.forEach((r: any) => {
      if (!r.categoria) return;
      mapa[r.categoria] = (mapa[r.categoria] || 0) + Number(r.n || 0);
    });

    const itens = Object.entries(mapa)
      .map(([categoria, n]) => ({ categoria, n }))
      .filter((item) => (categoriasFixas ? true : item.n > 0));

    const totalSegmento = itens.reduce((acc, i) => acc + i.n, 0);
    return { itens, totalSegmento };
  };

  // 1. Identidade de Gênero Detalhada (6 categorias oficiais da Regra de Ouro)
  const { itens: generoItens, totalSegmento: totalGenero } = agregarPorCategoria(
    generoDetRaw,
    segGenero,
    'todos',
    idadeGenero,
    CATEGORIAS_GENERO_OFICIAIS
  );

  // 2. Cor / Raça
  const { itens: corRacaItens, totalSegmento: totalCorRaca } = agregarPorCategoria(
    corRacaRaw,
    segCorRaca,
    genCorRaca,
    idadeCorRaca
  );

  // 3. Orientação Sexual (termos normalizados e grafias unificadas)
  const { itens: orientacaoItens, totalSegmento: totalOrientacao } = agregarPorCategoria(
    orientacaoRaw,
    segOrientacao,
    genOrientacao,
    idadeOrientacao
  );

  // 4. Faixa Etária
  const { itens: faixaItensBrutos, totalSegmento: totalFaixa } = agregarPorCategoria(
    faixaEtariaRaw,
    segFaixaEtaria,
    genFaixaEtaria,
    idadeFaixaEtaria
  );
  const faixaItens = [...faixaItensBrutos].sort((a, b) => {
    const idxA = ORDEM_FAIXA_ETARIA.indexOf(a.categoria);
    const idxB = ORDEM_FAIXA_ETARIA.indexOf(b.categoria);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return b.n - a.n;
  });

  // 5. PCD
  const { itens: pcdItens, totalSegmento: totalPcd } = agregarPorCategoria(
    pcdRaw,
    segPcd,
    genPcd,
    idadePcd
  );

  // Função auxiliar para criar opção de barra horizontal
  const criarOpcaoBarra = (
    itens: { categoria: string; n: number }[],
    paletaCor = PALETA_ACESSIVEL[0],
    denominadorBase = 0,
    manterOrdem = false
  ) => {
    const ordenados = manterOrdem ? [...itens] : [...itens].sort((a, b) => b.n - a.n);
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0e162b',
        borderColor: '#223154',
        textStyle: { color: '#f1f5f9' },
        formatter: (params: any[]) => {
          const item = params[0];
          const val = Number(item.value || 0);
          const pct = denominadorBase > 0 ? ((val / denominadorBase) * 100).toFixed(1) : '0,0';
          return `<div class="font-bold text-slate-100">${item.name}</div>
            <div class="text-xs text-slate-300 mt-1">
              Quantidade: <strong class="text-teal-300">${formatarNumero(val)}</strong> (${pct}%)
            </div>`;
        },
      },
      grid: { left: '3%', right: '12%', top: '4%', bottom: '5%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { stroke: '#1f2d4e' } },
      },
      yAxis: {
        type: 'category',
        data: ordenados.map((i) => i.categoria || 'Não informado').reverse(),
        axisLabel: { fontSize: 11, width: 160, overflow: 'truncate', color: '#cbd5e1' },
      },
      series: [
        {
          type: 'bar',
          data: ordenados.map((i) => i.n).reverse(),
          itemStyle: { color: paletaCor },
          label: {
            show: true,
            position: 'right',
            formatter: (p: any) => {
              const pct = denominadorBase > 0 ? ((p.value / denominadorBase) * 100).toFixed(1) : '0.0';
              return `${formatarNumero(p.value)} (${pct}%)`;
            },
            fontSize: 10,
            color: '#cbd5e1',
          },
        },
      ],
    };
  };

  // Gráfico de Rosca para PCD
  const optionRoscaPcd = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (p: any) => {
        return `<div class="font-bold text-slate-100">${p.name}</div>
          <div class="text-xs mt-1 text-slate-300">Respondentes: <strong class="text-teal-300">${formatarNumero(p.value)}</strong> (${p.percent}%)</div>`;
      },
    },
    legend: { bottom: '0', textStyle: { fontSize: 11, color: '#cbd5e1' } },
    series: [
      {
        name: 'PCD',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#131d36', borderWidth: 2 },
        color: [PALETA_ACESSIVEL[1], PALETA_ACESSIVEL[0], PALETA_ACESSIVEL[9]],
        label: {
          show: true,
          formatter: '{b}: {d}%',
          color: '#cbd5e1',
          fontSize: 11,
        },
        data: pcdItens.map((item) => ({ name: item.categoria || 'Não informado', value: item.n })),
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Título de Seção */}
      <div className="border-b border-[#1f2d4e] pb-3">
        <h2 className="text-xl font-bold text-slate-100">1. Perfil Demográfico e Representatividade</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Caracterização sociodemográfica da comunidade do IFRS por identidade de gênero, autodeclaração
          étnico-racial, orientação sexual, faixa etária e pessoas com deficiência, com filtro individual por segmento (Geral, Docente, Técnico TAE e Discente).
        </p>
      </div>

      {/* Gráfico 1: Identidade de Gênero Detalhada (Largura Completa) */}
      <ChartCard
        titulo="Identidade de Gênero Detalhada"
        subtitulo="Classificação padronizada nas 6 categorias oficiais: Mulher, Homem, Mulher Trans, Homem Trans, Travesti e Não-binários"
        n={totalGenero}
        elementoCabecalho={
          <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
            <SeletorSegmento valor={segGenero} aoMudar={setSegGenero} />
            <SeletorIdade valor={idadeGenero} aoMudar={setIdadeGenero} />
          </div>
        }
        option={criarOpcaoBarra(generoItens, PALETA_ACESSIVEL[3], totalGenero)}
        altura={340}
        carregando={carregando}
        avisoCustomizado="Nota metodológica: contempla estritamente as 6 categorias oficiais de gênero (Mulher, Homem, Mulher Trans, Homem Trans, Travesti e Não-binários). Respostas inválidas e 'Prefiro não responder' são desconsideradas."
        tabelaDados={{
          cabecalhos: ['Identidade de Gênero', 'Respondentes', '% Válidos no Segmento'],
          linhas: [...generoItens]
            .sort((a, b) => b.n - a.n)
            .map((g) => [
              g.categoria,
              g.n,
              formatarPercentual(totalGenero > 0 ? (g.n / totalGenero) * 100 : 0),
            ]),
        }}
      />

      {/* Gráficos 2 e 3: Cor/Raça e Orientação Sexual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          titulo="Autodeclaração Étnico-Racial (Cor / Raça)"
          subtitulo="Categorias censitárias autodeclaradas (IBGE)"
          n={totalCorRaca}
          elementoCabecalho={
            <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
              <SeletorSegmento valor={segCorRaca} aoMudar={setSegCorRaca} />
              <SeletorGenero valor={genCorRaca} aoMudar={setGenCorRaca} />
              <SeletorIdade valor={idadeCorRaca} aoMudar={setIdadeCorRaca} />
            </div>
          }
          option={criarOpcaoBarra(corRacaItens, PALETA_ACESSIVEL[2], totalCorRaca)}
          altura={350}
          carregando={carregando}
          tabelaDados={{
            cabecalhos: ['Cor/Raça', 'Respondentes', '% no Segmento/Gênero'],
            linhas: [...corRacaItens]
              .sort((a, b) => b.n - a.n)
              .map((c) => [
                c.categoria,
                c.n,
                formatarPercentual(totalCorRaca > 0 ? (c.n / totalCorRaca) * 100 : 0),
              ]),
          }}
        />

        <ChartCard
          titulo="Orientação Sexual"
          subtitulo="Diversidade de orientações sexuais declaradas (com termos equivalentes e variações de grafia consolidados)"
          n={totalOrientacao}
          elementoCabecalho={
            <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
              <SeletorSegmento valor={segOrientacao} aoMudar={setSegOrientacao} />
              <SeletorGenero valor={genOrientacao} aoMudar={setGenOrientacao} />
              <SeletorIdade valor={idadeOrientacao} aoMudar={setIdadeOrientacao} />
            </div>
          }
          option={criarOpcaoBarra(orientacaoItens, PALETA_ACESSIVEL[6], totalOrientacao)}
          altura={350}
          carregando={carregando}
          avisoCustomizado="Nota metodológica: grafias equivalentes (como 'Demissexual' e 'Demisexual', 'Heterossexual' e 'Hetero', 'Homossexual' e 'Gay') foram consolidadas. Respostas satíricas ou inválidas foram desconsideradas."
          tabelaDados={{
            cabecalhos: ['Orientação Sexual', 'Respondentes', '% no Segmento/Gênero'],
            linhas: [...orientacaoItens]
              .sort((a, b) => b.n - a.n)
              .map((o) => [
                o.categoria,
                o.n,
                formatarPercentual(totalOrientacao > 0 ? (o.n / totalOrientacao) * 100 : 0),
              ]),
          }}
        />
      </div>

      {/* Gráficos 4 e 5: Faixa Etária e PCD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
          <ChartCard
            titulo="Distribuição por Faixa Etária"
            subtitulo="Estrutura etária dos respondentes"
            n={totalFaixa}
            elementoCabecalho={
              <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
                <SeletorSegmento valor={segFaixaEtaria} aoMudar={setSegFaixaEtaria} />
                <SeletorGenero valor={genFaixaEtaria} aoMudar={setGenFaixaEtaria} />
                <SeletorIdade valor={idadeFaixaEtaria} aoMudar={setIdadeFaixaEtaria} />
              </div>
            }
            option={criarOpcaoBarra(faixaItens, PALETA_ACESSIVEL[4], totalFaixa, true)}
            altura={420}
            carregando={carregando}
            classeExtra="h-full"
            tabelaDados={{
              cabecalhos: ['Faixa Etária', 'Respondentes', '% no Segmento/Gênero'],
              linhas: faixaItens.map((f) => [
                f.categoria,
                f.n,
                formatarPercentual(totalFaixa > 0 ? (f.n / totalFaixa) * 100 : 0),
              ]),
            }}
          />
        </div>

        <ChartCard
          titulo="Pessoas com Deficiência (PCD)"
          subtitulo="Proporção de pessoas autodeclaradas com deficiência"
          n={totalPcd}
          elementoCabecalho={
            <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
              <SeletorSegmento valor={segPcd} aoMudar={setSegPcd} />
              <SeletorGenero valor={genPcd} aoMudar={setGenPcd} />
              <SeletorIdade valor={idadePcd} aoMudar={setIdadePcd} />
            </div>
          }
          option={optionRoscaPcd}
          altura={340}
          carregando={carregando}
          classeExtra="h-full"
          tabelaDados={{
            cabecalhos: ['Declaração PCD', 'Respondentes', '% no Segmento/Gênero'],
            linhas: [...pcdItens]
              .sort((a, b) => b.n - a.n)
              .map((item) => [
                item.categoria,
                item.n,
                formatarPercentual(totalPcd > 0 ? (item.n / totalPcd) * 100 : 0),
              ]),
          }}
        />
      </div>
    </div>
  );
};
