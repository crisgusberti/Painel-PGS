/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Info } from 'lucide-react';
import { ChartCard } from '../ChartCard';
import { formatarNumero, formatarPercentual } from '../../lib/formatters';
import { PALETA_ACESSIVEL } from '../../lib/chartTheme';

const FONTE_SIG = 'Fonte: SIG (Sistema Integrado de Gestão) Oficial do IFRS • Dados referentes a novembro de 2026';

// Dicionário de nomes de campus (grafia oficial com acentuação) a partir das chaves exportadas do SIG
const NOMES_CAMPUS_DISCENTES: Record<string, string> = {
  'CAMPUS ALVORADA': 'Campus Alvorada',
  'CAMPUS BENTO GONCALVES': 'Campus Bento Gonçalves',
  'CAMPUS CANOAS': 'Campus Canoas',
  'CAMPUS CAXIAS DO SUL': 'Campus Caxias do Sul',
  'CAMPUS ERECHIM': 'Campus Erechim',
  'CAMPUS FARROUPILHA': 'Campus Farroupilha',
  'CAMPUS FELIZ': 'Campus Feliz',
  'CAMPUS GRAMADO': 'Campus Gramado',
  'CAMPUS IBIRUBA': 'Campus Ibirubá',
  'CAMPUS OSORIO': 'Campus Osório',
  'CAMPUS PORTO ALEGRE': 'Campus Porto Alegre',
  'CAMPUS RESTINGA': 'Campus Restinga',
  'CAMPUS RIO GRANDE': 'Campus Rio Grande',
  'CAMPUS ROLANTE': 'Campus Rolante',
  'CAMPUS SERTAO': 'Campus Sertão',
  'CAMPUS VACARIA': 'Campus Vacaria',
  'CAMPUS VERANOPOLIS': 'Campus Veranópolis',
  'CAMPUS VIAMAO': 'Campus Viamão',
  'CAMPUS ZONA NORTE': 'Campus Porto Alegre – Zona Norte',
};

type NivelDiscente = 'G' | 'N' | 'L' | 'T' | 'E';

const NOMES_NIVEL: Record<NivelDiscente, string> = {
  N: 'Integrado',
  T: 'Subsequente',
  G: 'Graduação',
  L: 'Especialização',
  E: 'Mestrado',
};

const OPCOES_NIVEL: { id: 'todos' | NivelDiscente; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'N', label: 'Integrado' },
  { id: 'T', label: 'Subsequente' },
  { id: 'G', label: 'Graduação' },
  { id: 'L', label: 'Especialização' },
  { id: 'E', label: 'Mestrado' },
];

const OPCOES_SEXO_DISCENTES: { id: 'todos' | 'feminino' | 'masculino'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'feminino', label: 'Feminino' },
  { id: 'masculino', label: 'Masculino' },
];

// Discentes matriculados(as) por campus, nível de ensino e sexo (dados institucionais do SIG, fora do universo da pesquisa)
const DISCENTES_POR_CAMPUS: { nivel: NivelDiscente; campus: string; feminino: number; masculino: number }[] = [
  { nivel: 'G', campus: 'CAMPUS ALVORADA', feminino: 164, masculino: 64 },
  { nivel: 'N', campus: 'CAMPUS ALVORADA', feminino: 205, masculino: 173 },
  { nivel: 'T', campus: 'CAMPUS ALVORADA', feminino: 98, masculino: 28 },
  { nivel: 'E', campus: 'CAMPUS BENTO GONCALVES', feminino: 19, masculino: 15 },
  { nivel: 'G', campus: 'CAMPUS BENTO GONCALVES', feminino: 351, masculino: 334 },
  { nivel: 'L', campus: 'CAMPUS BENTO GONCALVES', feminino: 7, masculino: 8 },
  { nivel: 'N', campus: 'CAMPUS BENTO GONCALVES', feminino: 305, masculino: 205 },
  { nivel: 'T', campus: 'CAMPUS BENTO GONCALVES', feminino: 9, masculino: 4 },
  { nivel: 'E', campus: 'CAMPUS CANOAS', feminino: 7, masculino: 16 },
  { nivel: 'G', campus: 'CAMPUS CANOAS', feminino: 159, masculino: 342 },
  { nivel: 'L', campus: 'CAMPUS CANOAS', feminino: 10, masculino: 17 },
  { nivel: 'N', campus: 'CAMPUS CANOAS', feminino: 188, masculino: 283 },
  { nivel: 'T', campus: 'CAMPUS CANOAS', feminino: 24, masculino: 19 },
  { nivel: 'G', campus: 'CAMPUS CAXIAS DO SUL', feminino: 175, masculino: 326 },
  { nivel: 'L', campus: 'CAMPUS CAXIAS DO SUL', feminino: 12, masculino: 11 },
  { nivel: 'N', campus: 'CAMPUS CAXIAS DO SUL', feminino: 312, masculino: 326 },
  { nivel: 'T', campus: 'CAMPUS CAXIAS DO SUL', feminino: 9, masculino: 23 },
  { nivel: 'G', campus: 'CAMPUS ERECHIM', feminino: 127, masculino: 171 },
  { nivel: 'L', campus: 'CAMPUS ERECHIM', feminino: 37, masculino: 17 },
  { nivel: 'N', campus: 'CAMPUS ERECHIM', feminino: 170, masculino: 160 },
  { nivel: 'T', campus: 'CAMPUS ERECHIM', feminino: 37, masculino: 50 },
  { nivel: 'E', campus: 'CAMPUS FARROUPILHA', feminino: 56, masculino: 45 },
  { nivel: 'G', campus: 'CAMPUS FARROUPILHA', feminino: 204, masculino: 304 },
  { nivel: 'L', campus: 'CAMPUS FARROUPILHA', feminino: 17, masculino: 9 },
  { nivel: 'N', campus: 'CAMPUS FARROUPILHA', feminino: 132, masculino: 195 },
  { nivel: 'T', campus: 'CAMPUS FARROUPILHA', feminino: 0, masculino: 52 },
  { nivel: 'G', campus: 'CAMPUS FELIZ', feminino: 125, masculino: 172 },
  { nivel: 'L', campus: 'CAMPUS FELIZ', feminino: 28, masculino: 38 },
  { nivel: 'N', campus: 'CAMPUS FELIZ', feminino: 326, masculino: 259 },
  { nivel: 'T', campus: 'CAMPUS GRAMADO', feminino: 21, masculino: 8 },
  { nivel: 'G', campus: 'CAMPUS IBIRUBA', feminino: 97, masculino: 292 },
  { nivel: 'L', campus: 'CAMPUS IBIRUBA', feminino: 4, masculino: 9 },
  { nivel: 'N', campus: 'CAMPUS IBIRUBA', feminino: 128, masculino: 136 },
  { nivel: 'T', campus: 'CAMPUS IBIRUBA', feminino: 6, masculino: 53 },
  { nivel: 'G', campus: 'CAMPUS OSORIO', feminino: 130, masculino: 152 },
  { nivel: 'L', campus: 'CAMPUS OSORIO', feminino: 8, masculino: 4 },
  { nivel: 'N', campus: 'CAMPUS OSORIO', feminino: 227, masculino: 228 },
  { nivel: 'T', campus: 'CAMPUS OSORIO', feminino: 28, masculino: 20 },
  { nivel: 'E', campus: 'CAMPUS PORTO ALEGRE', feminino: 79, masculino: 78 },
  { nivel: 'G', campus: 'CAMPUS PORTO ALEGRE', feminino: 206, masculino: 263 },
  { nivel: 'L', campus: 'CAMPUS PORTO ALEGRE', feminino: 30, masculino: 27 },
  { nivel: 'N', campus: 'CAMPUS PORTO ALEGRE', feminino: 57, masculino: 53 },
  { nivel: 'T', campus: 'CAMPUS PORTO ALEGRE', feminino: 526, masculino: 319 },
  { nivel: 'G', campus: 'CAMPUS RESTINGA', feminino: 186, masculino: 235 },
  { nivel: 'L', campus: 'CAMPUS RESTINGA', feminino: 5, masculino: 5 },
  { nivel: 'N', campus: 'CAMPUS RESTINGA', feminino: 155, masculino: 224 },
  { nivel: 'T', campus: 'CAMPUS RESTINGA', feminino: 91, masculino: 40 },
  { nivel: 'G', campus: 'CAMPUS RIO GRANDE', feminino: 75, masculino: 212 },
  { nivel: 'N', campus: 'CAMPUS RIO GRANDE', feminino: 204, masculino: 338 },
  { nivel: 'T', campus: 'CAMPUS RIO GRANDE', feminino: 94, masculino: 264 },
  { nivel: 'G', campus: 'CAMPUS ROLANTE', feminino: 25, masculino: 73 },
  { nivel: 'N', campus: 'CAMPUS ROLANTE', feminino: 398, masculino: 336 },
  { nivel: 'T', campus: 'CAMPUS ROLANTE', feminino: 13, masculino: 4 },
  { nivel: 'G', campus: 'CAMPUS SERTAO', feminino: 129, masculino: 193 },
  { nivel: 'L', campus: 'CAMPUS SERTAO', feminino: 82, masculino: 66 },
  { nivel: 'N', campus: 'CAMPUS SERTAO', feminino: 194, masculino: 275 },
  { nivel: 'T', campus: 'CAMPUS SERTAO', feminino: 3, masculino: 8 },
  { nivel: 'G', campus: 'CAMPUS VACARIA', feminino: 162, masculino: 177 },
  { nivel: 'L', campus: 'CAMPUS VACARIA', feminino: 3, masculino: 1 },
  { nivel: 'N', campus: 'CAMPUS VACARIA', feminino: 161, masculino: 167 },
  { nivel: 'T', campus: 'CAMPUS VACARIA', feminino: 1, masculino: 4 },
  { nivel: 'G', campus: 'CAMPUS VERANOPOLIS', feminino: 51, masculino: 93 },
  { nivel: 'N', campus: 'CAMPUS VERANOPOLIS', feminino: 114, masculino: 95 },
  { nivel: 'G', campus: 'CAMPUS VIAMAO', feminino: 126, masculino: 69 },
  { nivel: 'L', campus: 'CAMPUS VIAMAO', feminino: 37, masculino: 23 },
  { nivel: 'N', campus: 'CAMPUS VIAMAO', feminino: 339, masculino: 249 },
  { nivel: 'T', campus: 'CAMPUS VIAMAO', feminino: 38, masculino: 17 },
  { nivel: 'T', campus: 'CAMPUS ZONA NORTE', feminino: 28, masculino: 8 },
];

// Série auxiliar (invisível) que exibe o total de cada barra empilhada ao final dela,
// para que o total fique visível sem precisar passar o cursor sobre o gráfico.
const NOME_SERIE_TOTAL = 'Total';
const criarSerieTotal = (totais: number[]) => ({
  name: NOME_SERIE_TOTAL,
  type: 'bar',
  stack: 'total',
  data: totais.map(() => 0),
  itemStyle: { color: 'transparent' },
  tooltip: { show: false },
  emphasis: { disabled: true },
  label: {
    show: true,
    position: 'right',
    color: '#1f6d2b',
    fontSize: 13,
    fontWeight: 700,
    formatter: (p: any) => `Total: ${formatarNumero(totais[p.dataIndex])}`,
  },
});

export const PageIfrsNumeros: React.FC = () => {
  // Quadro de servidores do IFRS por sexo (dados institucionais do SIG, fora do universo da pesquisa)
  const quadroServidores = [
    { categoria: 'Docentes', homens: 798, mulheres: 714 },
    { categoria: 'Técnicos/as Administrativos/as', homens: 425, mulheres: 570 },
  ];
  const totalHomensServidores = quadroServidores.reduce((acc, c) => acc + c.homens, 0);
  const totalMulheresServidores = quadroServidores.reduce((acc, c) => acc + c.mulheres, 0);
  const totalGeralServidores = totalHomensServidores + totalMulheresServidores;

  const categoriasServidores = [
    { categoria: 'Total Geral', homens: totalHomensServidores, mulheres: totalMulheresServidores },
    ...quadroServidores,
  ];
  // Invertido: eixo Y do ECharts plota o índice 0 na base, então a maior categoria fica no topo
  const linhasServidores = [...categoriasServidores].reverse();

  const optionServidores = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#d3dbd6',
      textStyle: { color: '#14201a' },
      formatter: (params: any[]) => {
        const cNome = params[0]?.axisValueLabel || '';
        const row = linhasServidores.find((r) => r.categoria === cNome);
        const total = row ? row.homens + row.mulheres : 0;
        const diferenca = row ? Math.abs(row.homens - row.mulheres) : 0;
        const predominante = row && row.homens === row.mulheres ? null : row && row.homens > row.mulheres ? 'homens' : 'mulheres';
        let html = `<div class="font-bold mb-1 text-texto">${cNome}</div>`;
        params.filter((p) => p.seriesName !== NOME_SERIE_TOTAL).forEach((p) => {
          html += `<div class="flex items-center justify-between gap-4 text-xs text-texto-2">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-texto">${formatarNumero(p.value)} (${total > 0 ? ((p.value / total) * 100).toFixed(1) : '0,0'}%)</span>
          </div>`;
        });
        html += `<div class="mt-1 pt-1 border-t border-borda text-xs font-bold text-marca flex justify-between">
          <span>Total:</span>
          <span>${formatarNumero(total)}</span>
        </div>`;
        if (predominante) {
          html += `<div class="text-xs text-texto-3 mt-1">Diferença entre sexos: ${formatarNumero(diferenca)} a mais de ${predominante}</div>`;
        }
        return html;
      },
    },
    legend: {
      data: ['Homens', 'Mulheres'],
      bottom: 0,
      textStyle: { fontSize: 13, color: '#2f3b35' },
    },
    grid: {
      left: '3%',
      right: 90,
      top: '5%',
      bottom: '14%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 12, color: '#4d5a53' },
      splitLine: { lineStyle: { stroke: '#e3e8e5' } },
    },
    yAxis: {
      type: 'category',
      data: linhasServidores.map((c) => c.categoria),
      axisLabel: { fontSize: 13, color: '#2f3b35' },
    },
    series: [
      {
        name: 'Homens',
        type: 'bar',
        stack: 'total',
        data: linhasServidores.map((c) => c.homens),
        itemStyle: { color: PALETA_ACESSIVEL[0] },
        label: {
          show: true,
          position: 'inside',
          color: '#f8fafc',
          fontSize: 13,
          fontWeight: 600,
          formatter: (p: any) => {
            const row = linhasServidores[p.dataIndex];
            const total = row.homens + row.mulheres;
            const pct = total > 0 ? (p.value / total) * 100 : 0;
            return `${formatarNumero(p.value)}\n(${pct.toFixed(1)}%)`;
          },
        },
      },
      {
        name: 'Mulheres',
        type: 'bar',
        stack: 'total',
        data: linhasServidores.map((c) => c.mulheres),
        itemStyle: { color: PALETA_ACESSIVEL[4] },
        label: {
          show: true,
          position: 'inside',
          color: '#f8fafc',
          fontSize: 13,
          fontWeight: 600,
          formatter: (p: any) => {
            const row = linhasServidores[p.dataIndex];
            const total = row.homens + row.mulheres;
            const pct = total > 0 ? (p.value / total) * 100 : 0;
            return `${formatarNumero(p.value)}\n(${pct.toFixed(1)}%)`;
          },
        },
      },
      criarSerieTotal(linhasServidores.map((c) => c.homens + c.mulheres)),
    ],
  };

  // Distribuição atual geral da Tipologia de Função de Gestão por Sexo (dados institucionais do SIG, fora do universo da pesquisa)
  const tipologiaFuncaoSexo = [
    { codigo: 'CD-01', homens: 1, mulheres: 0 },
    { codigo: 'CD-02', homens: 15, mulheres: 8 },
    { codigo: 'CD-03', homens: 14, mulheres: 10 },
    { codigo: 'CD-04', homens: 26, mulheres: 26 },
    { codigo: 'FG-01', homens: 44, mulheres: 56 },
    { codigo: 'FG-02', homens: 58, mulheres: 67 },
    { codigo: 'FG-03', homens: 8, mulheres: 0 },
    { codigo: 'FG-04', homens: 11, mulheres: 6 },
    { codigo: 'FG-05', homens: 10, mulheres: 7 },
    { codigo: 'FG-06', homens: 0, mulheres: 1 },
    { codigo: 'FG-07', homens: 0, mulheres: 1 },
    { codigo: 'FUC-01', homens: 96, mulheres: 80 },
  ];
  const totalHomensTipologia = tipologiaFuncaoSexo.reduce((acc, c) => acc + c.homens, 0);
  const totalMulheresTipologia = tipologiaFuncaoSexo.reduce((acc, c) => acc + c.mulheres, 0);
  const totalGeralTipologia = totalHomensTipologia + totalMulheresTipologia;
  // Invertido: eixo Y do ECharts plota o índice 0 na base, então CD-01 fica no topo
  const linhasTipologiaFuncao = [...tipologiaFuncaoSexo].reverse();

  const optionTipologiaFuncao = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#d3dbd6',
      textStyle: { color: '#14201a' },
      formatter: (params: any[]) => {
        const codNome = params[0]?.axisValueLabel || '';
        const visiveis = params.filter((p) => p.seriesName !== NOME_SERIE_TOTAL);
        const totalCod = visiveis.reduce((acc, p) => acc + Number(p.value || 0), 0);
        let html = `<div class="font-bold text-texto mb-1">${codNome}</div>`;
        html += `<div class="text-xs text-texto-3 mb-2">Total na função: <strong>${formatarNumero(totalCod)}</strong></div>`;
        visiveis.forEach((p) => {
          const val = Number(p.value || 0);
          const pct = totalCod > 0 ? ((val / totalCod) * 100).toFixed(1) : '0.0';
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-texto">${formatarNumero(val)} <span class="text-texto-3 font-normal">(${pct}%)</span></span>
          </div>`;
        });
        return html;
      },
    },
    legend: { data: ['Homens', 'Mulheres'], bottom: 0, textStyle: { color: '#2f3b35', fontSize: 12 } },
    grid: { left: '3%', right: 90, top: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#4d5a53' },
      splitLine: { lineStyle: { stroke: '#e3e8e5' } },
    },
    yAxis: {
      type: 'category',
      data: linhasTipologiaFuncao.map((c) => c.codigo),
      axisLabel: { color: '#2f3b35', fontSize: 13 },
    },
    series: [
      {
        name: 'Homens',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: PALETA_ACESSIVEL[0] },
        data: linhasTipologiaFuncao.map((c) => c.homens),
      },
      {
        name: 'Mulheres',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: PALETA_ACESSIVEL[4] },
        data: linhasTipologiaFuncao.map((c) => c.mulheres),
      },
      criarSerieTotal(linhasTipologiaFuncao.map((c) => c.homens + c.mulheres)),
    ],
  };

  // Filtros locais: nível de ensino e sexo
  const [nivelDiscentes, setNivelDiscentes] = useState<'todos' | NivelDiscente>('todos');
  const [sexoDiscentes, setSexoDiscentes] = useState<'todos' | 'feminino' | 'masculino'>('todos');

  const discentesFiltrados = DISCENTES_POR_CAMPUS.filter(
    (r) => nivelDiscentes === 'todos' || r.nivel === nivelDiscentes
  );

  const campusTotaisDiscentes: Record<string, { feminino: number; masculino: number }> = {};
  discentesFiltrados.forEach((r) => {
    if (!campusTotaisDiscentes[r.campus]) campusTotaisDiscentes[r.campus] = { feminino: 0, masculino: 0 };
    campusTotaisDiscentes[r.campus].feminino += r.feminino;
    campusTotaisDiscentes[r.campus].masculino += r.masculino;
  });

  const campusOrdenadosDiscentes = Object.entries(campusTotaisDiscentes)
    .map(([campus, v]) => ({
      campus: NOMES_CAMPUS_DISCENTES[campus] || campus,
      feminino: v.feminino,
      masculino: v.masculino,
    }))
    .sort((a, b) => b.feminino + b.masculino - (a.feminino + a.masculino));

  const totalFemininoDiscentes = campusOrdenadosDiscentes.reduce((acc, c) => acc + c.feminino, 0);
  const totalMasculinoDiscentes = campusOrdenadosDiscentes.reduce((acc, c) => acc + c.masculino, 0);
  const totalGeralDiscentes = totalFemininoDiscentes + totalMasculinoDiscentes;

  const categoriasDiscentes = [
    { campus: 'Total Geral', feminino: totalFemininoDiscentes, masculino: totalMasculinoDiscentes },
    ...campusOrdenadosDiscentes,
  ];
  // Invertido: eixo Y do ECharts plota o índice 0 na base, então a maior categoria fica no topo
  const linhasDiscentes = [...categoriasDiscentes].reverse();

  const nDiscentesFiltrado =
    sexoDiscentes === 'todos'
      ? totalGeralDiscentes
      : sexoDiscentes === 'feminino'
      ? totalFemininoDiscentes
      : totalMasculinoDiscentes;

  const rotuloNivelAtivo = nivelDiscentes === 'todos' ? null : NOMES_NIVEL[nivelDiscentes];

  const optionDiscentes = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#d3dbd6',
      textStyle: { color: '#14201a' },
      formatter: (params: any[]) => {
        const cNome = params[0]?.axisValueLabel || '';
        const visiveis = params.filter((p) => p.seriesName !== NOME_SERIE_TOTAL);
        const total = visiveis.reduce((acc, p) => acc + Number(p.value || 0), 0);
        let html = `<div class="font-bold mb-1 text-texto">${cNome}</div>`;
        visiveis.forEach((p) => {
          const pct = total > 0 ? ((Number(p.value || 0) / total) * 100).toFixed(1) : '0.0';
          html += `<div class="flex items-center justify-between gap-4 text-xs text-texto-2">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-texto">${formatarNumero(p.value)} (${pct}%)</span>
          </div>`;
        });
        html += `<div class="mt-1 pt-1 border-t border-borda text-xs font-bold text-marca flex justify-between">
          <span>Total:</span>
          <span>${formatarNumero(total)}</span>
        </div>`;
        return html;
      },
    },
    legend: {
      data: sexoDiscentes === 'todos' ? ['Feminino', 'Masculino'] : undefined,
      show: sexoDiscentes === 'todos',
      bottom: 0,
      textStyle: { fontSize: 13, color: '#2f3b35' },
    },
    grid: {
      left: '3%',
      right: 90,
      top: '5%',
      bottom: sexoDiscentes === 'todos' ? '8%' : '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 12, color: '#4d5a53' },
      splitLine: { lineStyle: { stroke: '#e3e8e5' } },
    },
    yAxis: {
      type: 'category',
      data: linhasDiscentes.map((c) => c.campus.replace('Campus ', '')),
      axisLabel: { fontSize: 13, color: '#2f3b35' },
    },
    series:
      sexoDiscentes === 'todos'
        ? [
            {
              name: 'Feminino',
              type: 'bar',
              stack: 'total',
              data: linhasDiscentes.map((c) => c.feminino),
              itemStyle: { color: PALETA_ACESSIVEL[4] },
            },
            {
              name: 'Masculino',
              type: 'bar',
              stack: 'total',
              data: linhasDiscentes.map((c) => c.masculino),
              itemStyle: { color: PALETA_ACESSIVEL[0] },
            },
            criarSerieTotal(linhasDiscentes.map((c) => c.feminino + c.masculino)),
          ]
        : [
            {
              name: sexoDiscentes === 'feminino' ? 'Feminino' : 'Masculino',
              type: 'bar',
              data: linhasDiscentes.map((c) => (sexoDiscentes === 'feminino' ? c.feminino : c.masculino)),
              itemStyle: { color: sexoDiscentes === 'feminino' ? PALETA_ACESSIVEL[4] : PALETA_ACESSIVEL[0] },
              label: {
                show: true,
                position: 'right',
                color: '#1f6d2b',
                fontSize: 13,
                fontWeight: 700,
                formatter: (p: any) => `Total: ${formatarNumero(p.value)}`,
              },
            },
          ],
  };

  return (
    <div className="space-y-6">
      {/* Título e Texto Introdutório */}
      <div className="border-b border-borda pb-3">
        <div className="flex items-center gap-2.5">
          <Database className="w-6 h-6 text-marca" />
          <h2 className="text-xl font-bold text-texto">O IFRS em Números</h2>
        </div>
        <p className="text-xs sm:text-sm text-texto-3 mt-1.5">
          Abaixo estão os números atuais que dispomos no SIG (Sistema Integrado de Gestão) oficial do IFRS. Nossa
          pesquisa foi em busca de números e informações que não encontramos no sistema.
        </p>
      </div>

      {/* Aviso de Origem dos Dados */}
      <div className="bg-marca-fundo/30 border border-marca-borda/50 rounded-xl p-4 sm:p-5 text-marca text-xs sm:text-sm flex items-start gap-2.5 shadow-xs">
        <Info className="w-4 h-4 text-marca shrink-0 mt-0.5" />
        <div className="space-y-3 leading-relaxed">
          <p>
            Os números desta aba vêm do SIG — Sistema Integrado de Gestão do IFRS, com extração em novembro de
            2026. São totais dos registros institucionais apresentados em cada gráfico, e não os números da
            amostra que respondeu à pesquisa.
          </p>
          <p>
            Incluímos esses dados para que você possa conhecer a dimensão e a composição da comunidade
            registrada no sistema, além dos resultados obtidos pelo questionário.
          </p>
          <p>
            A coleta da pesquisa ocorreu entre 2025 e 2026, antes dessa extração do SIG. Como podem ter ocorrido
            mudanças na comunidade nesse intervalo, os totais aqui apresentados não correspondem necessariamente
            à população existente durante a coleta. Sua função é oferecer um panorama institucional
            complementar.
          </p>
          <p>
            Esses registros também têm limites: a classificação "homem/mulher" disponível no SIG não contempla
            a diversidade de identidades de gênero abordada na pesquisa. Nosso levantamento adota uma
            perspectiva interseccional, considerando como gênero, raça, orientação sexual, deficiência e outras
            características se articulam nas experiências de estudantes e servidores/as. Nas demais abas, as
            respostas das pessoas participantes ampliam esse retrato, trazendo informações e vivências que não
            constam nos cadastros administrativos.
          </p>
        </div>
      </div>

      {/* Painel: Quadro de Servidores do IFRS por Sexo */}
      <ChartCard
        titulo="Quadro de servidores/as do IFRS por sexo registrado no SIG"
        subtitulo="Docentes e Técnicos/as Administrativos/as, por sexo"
        n={totalGeralServidores}
        baseDescricao={`${formatarNumero(totalHomensServidores)} homens (${formatarPercentual((totalHomensServidores / totalGeralServidores) * 100)}) e ${formatarNumero(totalMulheresServidores)} mulheres (${formatarPercentual((totalMulheresServidores / totalGeralServidores) * 100)})`}
        infoTitulo="Sobre este painel"
        infoTooltip={
          <div className="space-y-1">
            <div>
              Dados do SIG Oficial do IFRS (docentes e técnicos/as administrativos/as em efetivo exercício, novembro de
              2026), e não do universo de respondentes da pesquisa.
            </div>
            <div>Cada barra é empilhada por sexo, exibindo a quantidade e o percentual de homens e mulheres dentro da própria categoria.</div>
          </div>
        }
        option={optionServidores}
        altura={300}
        fonte={FONTE_SIG}
        tabelaDados={{
          cabecalhos: ['Categoria', 'Total', 'Homens', '% Homens', 'Mulheres', '% Mulheres'],
          linhas: categoriasServidores.map((c) => {
            const total = c.homens + c.mulheres;
            return [
              c.categoria,
              total,
              c.homens,
              formatarPercentual(total > 0 ? (c.homens / total) * 100 : 0),
              c.mulheres,
              formatarPercentual(total > 0 ? (c.mulheres / total) * 100 : 0),
            ];
          }),
        }}
      />

      {/* Painel: Tipologia de Função de Gestão por Sexo */}
      <ChartCard
        titulo="Tipologia de Função de Gestão por Sexo (Distribuição Atual)"
        subtitulo="Cargos de Direção (CD), Funções Gratificadas (FG) e Função de Coordenação (FUC), detalhados por código e sexo"
        n={totalGeralTipologia}
        baseDescricao={`${formatarNumero(totalHomensTipologia)} homens (${formatarPercentual((totalHomensTipologia / totalGeralTipologia) * 100)}) e ${formatarNumero(totalMulheresTipologia)} mulheres (${formatarPercentual((totalMulheresTipologia / totalGeralTipologia) * 100)})`}
        infoTitulo="Sobre este painel"
        infoTooltip={
          <div className="space-y-1">
            <div>
              Dados do SIG Oficial do IFRS (ocupantes atuais de cada código de função de gestão, novembro de
              2026), e não do universo de respondentes da pesquisa.
            </div>
            <div>Cada barra é empilhada por sexo, exibindo a distribuição de homens e mulheres em cada código de função.</div>
          </div>
        }
        option={optionTipologiaFuncao}
        altura={460}
        fonte={FONTE_SIG}
        tabelaDados={{
          cabecalhos: ['Função', 'Sexo', 'Quantidade', '% na Função'],
          linhas: tipologiaFuncaoSexo.flatMap((c) => {
            const total = c.homens + c.mulheres;
            return [
              ['Homens', c.homens] as const,
              ['Mulheres', c.mulheres] as const,
            ]
              .filter(([, qtd]) => qtd > 0)
              .map(([sexo, qtd]) => [c.codigo, sexo, qtd, total > 0 ? formatarPercentual((qtd / total) * 100) : '0,0%']);
          }),
        }}
      />

      {/* Painel: Discentes Matriculados(as) por Campus, Nível e Sexo */}
      <ChartCard
        titulo="Discentes do IFRS por Campus e Sexo"
        subtitulo={`Estudantes matriculados/as, por campus e sexo${rotuloNivelAtivo ? ` • Nível: ${rotuloNivelAtivo}` : ' • Todos os níveis de ensino'}`}
        n={nDiscentesFiltrado}
        baseDescricao={
          sexoDiscentes === 'todos'
            ? `${formatarNumero(totalFemininoDiscentes)} do sexo feminino (${formatarPercentual(totalGeralDiscentes > 0 ? (totalFemininoDiscentes / totalGeralDiscentes) * 100 : 0)}) e ${formatarNumero(totalMasculinoDiscentes)} do sexo masculino (${formatarPercentual(totalGeralDiscentes > 0 ? (totalMasculinoDiscentes / totalGeralDiscentes) * 100 : 0)})`
            : `Exibindo somente o sexo ${sexoDiscentes}`
        }
        infoTitulo="Sobre este painel"
        infoTooltip={
          <div className="space-y-1">
            <div>
              Dados do SIG Oficial do IFRS (discentes com matrícula ativa, novembro de 2026), e não do universo
              de respondentes da pesquisa.
            </div>
            <div>
              Use os filtros de Nível e Sexo para explorar o total geral ou recortes específicos. Com "Todos" em
              Sexo, cada barra é empilhada por sexo.
            </div>
          </div>
        }
        elementoCabecalho={
          <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-texto-3 font-medium">Nível:</span>
              <div className="inline-flex items-center p-0.5 rounded-lg bg-superficie-2 border border-borda text-xs flex-wrap">
                {OPCOES_NIVEL.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setNivelDiscentes(op.id)}
                    aria-pressed={nivelDiscentes === op.id}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      nivelDiscentes === op.id ? 'bg-marca text-white shadow-xs' : 'text-texto-3 hover:text-texto'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-texto-3 font-medium">Sexo:</span>
              <div className="inline-flex items-center p-0.5 rounded-lg bg-superficie-2 border border-borda text-xs flex-wrap">
                {OPCOES_SEXO_DISCENTES.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setSexoDiscentes(op.id)}
                    aria-pressed={sexoDiscentes === op.id}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      sexoDiscentes === op.id ? 'bg-marca text-white shadow-xs' : 'text-texto-3 hover:text-texto'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        option={optionDiscentes}
        altura={520}
        fonte={FONTE_SIG}
        tabelaDados={{
          cabecalhos: ['Campus', 'Total', 'Feminino', '% Feminino', 'Masculino', '% Masculino'],
          linhas: categoriasDiscentes.map((c) => {
            const total = c.feminino + c.masculino;
            return [
              c.campus,
              total,
              c.feminino,
              formatarPercentual(total > 0 ? (c.feminino / total) * 100 : 0),
              c.masculino,
              formatarPercentual(total > 0 ? (c.masculino / total) * 100 : 0),
            ];
          }),
        }}
      />
    </div>
  );
};
