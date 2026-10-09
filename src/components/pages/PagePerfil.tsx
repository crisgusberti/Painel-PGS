/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChartCard } from '../ChartCard';
import { KpiCard } from '../KpiCard';
import { Users, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { formatarNumero, formatarPercentual } from '../../lib/formatters';
import { PALETA_ACESSIVEL } from '../../lib/chartTheme';

interface PagePerfilProps {
  dados: any;
  carregando: boolean;
}

export const PagePerfil: React.FC<PagePerfilProps> = ({ dados, carregando }) => {
  const total = dados?.total || 0;
  const campus = dados?.campus || [];
  const vinculo = dados?.vinculo || [];
  const generoAgrup = dados?.genero_agrupado || [];
  const generoDet = dados?.genero_detalhado || [];
  const corRaca = dados?.cor_raca || [];
  const faixaEtaria = dados?.faixa_etaria || [];
  const pcd = dados?.pcd || [];
  const nomeSocial = dados?.nome_social || [];
  const orientacao = dados?.orientacao_sexual || [];
  const shannon = dados?.shannon_por_campus || {};
  const pluralidade = dados?.pluralidade || {};

  // Filtrar apenas respostas com mais de 1 ocorrência para Identidade de Gênero Detalhada e Orientação Sexual
  const generoDetFiltrado = generoDet.filter((g: any) => g.categoria && g.n > 1);
  const orientacaoFiltrada = orientacao.filter((o: any) => o.categoria && o.n > 1);

  // Função auxiliar para criar opção de barra horizontal ordenada
  const criarOpcaoBarra = (itens: { categoria: string; n: number }[], paletaCor = PALETA_ACESSIVEL[0]) => {
    const ordenados = [...itens].sort((a, b) => b.n - a.n);
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
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0,0';
          return `<div class="font-bold text-slate-100">${item.name}</div>
            <div class="text-xs text-slate-300 mt-1">
              Quantidade: <strong class="text-teal-300">${formatarNumero(val)}</strong> (${pct}%)
            </div>`;
        },
      },
      grid: { left: '3%', right: '8%', top: '4%', bottom: '5%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { stroke: '#1f2d4e' } },
      },
      yAxis: {
        type: 'category',
        data: ordenados.map((i) => i.categoria || 'Não informado').reverse(),
        axisLabel: { fontSize: 11, width: 140, overflow: 'truncate', color: '#cbd5e1' },
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
              const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : 0;
              return `${formatarNumero(p.value)} (${pct}%)`;
            },
            fontSize: 10,
            color: '#cbd5e1',
          },
        },
      ],
    };
  };

  // Gráfico de Rosca para Gênero Agrupado
  const optionRoscaGenero = {
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
        name: 'Gênero Agrupado',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#131d36', borderWidth: 2 },
        color: PALETA_ACESSIVEL,
        label: { show: false },
        data: generoAgrup.map((g: any) => ({ name: g.categoria || 'Não informado', value: g.n })),
      },
    ],
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
        label: { show: false },
        data: pcd.map((item: any) => ({ name: item.categoria || 'Não informado', value: item.n })),
      },
    ],
  };

  // Média do Índice de Shannon geral
  const valoresShannon = Object.values(shannon) as number[];
  const mediaShannon =
    valoresShannon.length > 0
      ? (valoresShannon.reduce((a, b) => a + b, 0) / valoresShannon.length).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Título de Seção */}
      <div className="border-b border-[#1f2d4e] pb-3">
        <h2 className="text-xl font-bold text-slate-100">1. Perfil Demográfico e Representatividade</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Caracterização demográfica da comunidade do IFRS: vínculo, identidade de gênero, autodeclaração
          étnico-racial, faixa etária, pessoas com deficiência e índices de diversidade.
        </p>
      </div>

      {/* Destaques de Pluralidade e Shannon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          titulo="Índice de Diversidade Médio (Shannon)"
          valorPrincipal={`${mediaShannon} / 100`}
          subvalor="equitabilidade"
          textoComplementar="Medida consolidada da diversidade demográfica nos campi"
          notaMetodologica="H' normalizado (−Σ pᵢ·ln(pᵢ) / ln k) sobre as categorias declaradas nos campi"
          icone={<Sparkles className="w-5 h-5 text-emerald-400" />}
          corDestaque="emerald"
        />

        <KpiCard
          titulo="Pluralidade de Gênero"
          valorPrincipal={`${generoDetFiltrado.length || pluralidade.genero || 0} identidades`}
          subvalor="com mais de 1 relato"
          textoComplementar="Expressões e identidades com mais de 1 ocorrência"
          notaMetodologica="Considera apenas identidades de gênero com mais de uma ocorrência (n > 1 respondentes). Respostas com ocorrência única foram desconsideradas."
          icone={<Users className="w-5 h-5 text-sky-400" />}
          corDestaque="blue"
        />

        <KpiCard
          titulo="Pluralidade Étnico-Racial"
          valorPrincipal={`${pluralidade.cor_raca || 0} categorias`}
          subvalor="autodeclaradas"
          textoComplementar="Representação de todos os grupos do censo nacional"
          notaMetodologica="Todas as 5 categorias do IBGE + Prefiro não responder presentes"
          icone={<Layers className="w-5 h-5 text-indigo-400" />}
          corDestaque="indigo"
        />

        <KpiCard
          titulo="Uso de Nome Social"
          valorPrincipal={formatarPercentual(
            total > 0
              ? (Number(nomeSocial.find((r: any) => r.categoria === 'Sim')?.n || 0) / total) * 100
              : 0
          )}
          subvalor={`${formatarNumero(nomeSocial.find((r: any) => r.categoria === 'Sim')?.n || 0)} pessoas`}
          textoComplementar={`${formatarNumero(nomeSocial.find((r: any) => r.categoria === 'Sim')?.n || 0)} pessoas utilizam nome social institucional`}
          notaMetodologica="Garantia e exercício do direito ao nome social institucional"
          icone={<ShieldCheck className="w-5 h-5 text-sky-400" />}
          corDestaque="blue"
        />
      </div>

      {/* Gráficos de Perfil: Campus e Vínculo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          titulo="Distribuição de Respondentes por Campus"
          subtitulo="Total de participações voluntárias em cada unidade"
          option={criarOpcaoBarra(campus, PALETA_ACESSIVEL[0])}
          altura={420}
          carregando={carregando}
          tabelaDados={{
            cabecalhos: ['Campus', 'Respondentes', '% Amostra'],
            linhas: campus.map((c: any) => [
              c.categoria,
              c.n,
              formatarPercentual(total > 0 ? (c.n / total) * 100 : 0),
            ]),
          }}
        />

        <ChartCard
          titulo="Distribuição por Vínculo Institucional"
          subtitulo="Segmentos da comunidade acadêmica do IFRS"
          option={criarOpcaoBarra(vinculo, PALETA_ACESSIVEL[1])}
          altura={420}
          carregando={carregando}
          tabelaDados={{
            cabecalhos: ['Vínculo', 'Respondentes', '% Amostra'],
            linhas: vinculo.map((v: any) => [
              v.categoria,
              v.n,
              formatarPercentual(total > 0 ? (v.n / total) * 100 : 0),
            ]),
          }}
        />
      </div>

      {/* Gráficos de Gênero e Cor/Raça */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          titulo="Gênero (Agrupado)"
          subtitulo="Distribuição agregada das identidades"
          option={optionRoscaGenero}
          altura={340}
          carregando={carregando}
          tabelaDados={{
            cabecalhos: ['Gênero', 'Respondentes', '% Amostra'],
            linhas: generoAgrup.map((g: any) => [
              g.categoria,
              g.n,
              formatarPercentual(total > 0 ? (g.n / total) * 100 : 0),
            ]),
          }}
        />

        <div className="lg:col-span-2">
          <ChartCard
            titulo="Identidade de Gênero Detalhada"
            subtitulo="Todas as autodeclarações de gênero fornecidas pelos respondentes"
            option={criarOpcaoBarra(generoDetFiltrado, PALETA_ACESSIVEL[3])}
            altura={340}
            carregando={carregando}
            avisoCustomizado="Nota informativa: são exibidas apenas categorias com mais de uma ocorrência (n > 1 respondentes). Respostas com ocorrência única foram desconsideradas."
            tabelaDados={{
              cabecalhos: ['Identidade Declarada', 'Respondentes', '% Amostra'],
              linhas: generoDetFiltrado.map((g: any) => [
                g.categoria,
                g.n,
                formatarPercentual(total > 0 ? (g.n / total) * 100 : 0),
              ]),
            }}
          />
        </div>
      </div>

      {/* Gráficos de Cor/Raça e Orientação Sexual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          titulo="Autodeclaração Étnico-Racial (Cor / Raça)"
          subtitulo="Categorias censitárias autodeclaradas"
          option={criarOpcaoBarra(corRaca, PALETA_ACESSIVEL[2])}
          altura={350}
          carregando={carregando}
          tabelaDados={{
            cabecalhos: ['Cor/Raça', 'Respondentes', '% Amostra'],
            linhas: corRaca.map((c: any) => [
              c.categoria,
              c.n,
              formatarPercentual(total > 0 ? (c.n / total) * 100 : 0),
            ]),
          }}
        />

        <ChartCard
          titulo="Orientação Sexual"
          subtitulo="Diversidade de orientações declaradas"
          option={criarOpcaoBarra(orientacaoFiltrada, PALETA_ACESSIVEL[6])}
          altura={350}
          carregando={carregando}
          avisoCustomizado="Nota informativa: são exibidas apenas categorias com mais de uma ocorrência (n > 1 respondentes). Respostas com ocorrência única foram desconsideradas."
          tabelaDados={{
            cabecalhos: ['Orientação Sexual', 'Respondentes', '% Amostra'],
            linhas: orientacaoFiltrada.map((o: any) => [
              o.categoria,
              o.n,
              formatarPercentual(total > 0 ? (o.n / total) * 100 : 0),
            ]),
          }}
        />
      </div>

      {/* Faixa Etária e PCD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            titulo="Distribuição por Faixa Etária"
            subtitulo="Estrutura etária dos respondentes"
            option={criarOpcaoBarra(faixaEtaria, PALETA_ACESSIVEL[4])}
            altura={320}
            carregando={carregando}
            tabelaDados={{
              cabecalhos: ['Faixa Etária', 'Respondentes', '% Amostra'],
              linhas: faixaEtaria.map((f: any) => [
                f.categoria,
                f.n,
                formatarPercentual(total > 0 ? (f.n / total) * 100 : 0),
              ]),
            }}
          />
        </div>

        <ChartCard
          titulo="Pessoas com Deficiência (PCD)"
          subtitulo="Proporção de pessoas autodeclaradas com deficiência"
          option={optionRoscaPcd}
          altura={320}
          carregando={carregando}
          tabelaDados={{
            cabecalhos: ['Declaração PCD', 'Respondentes', '% Amostra'],
            linhas: pcd.map((item: any) => [
              item.categoria,
              item.n,
              formatarPercentual(total > 0 ? (item.n / total) * 100 : 0),
            ]),
          }}
        />
      </div>
    </div>
  );
};
