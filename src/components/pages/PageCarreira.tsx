/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { ChartCard } from '../ChartCard';
import { KpiCard } from '../KpiCard';
import { Briefcase, Award, TrendingUp, Info, Download, BarChart3, Table, Layers, AlertCircle } from 'lucide-react';
import { formatarNumero, formatarPercentual, formatarNota } from '../../lib/formatters';
import { PALETA_ACESSIVEL } from '../../lib/chartTheme';
import { CATEGORIAS_GENERO_OFICIAIS, CategoriaGeneroOficial } from '../../lib/escalas';
import { SeletorGenero } from '../SeletorGenero';
import { SeletorSegmento, OpcaoSegmentoFiltro, correspondeSegmento, obterRotuloSegmento } from '../SeletorSegmento';
import { SeletorRaca, OpcaoRacaFiltro } from '../SeletorRaca';
import { SeletorDeficiencia, OpcaoDeficienciaFiltro } from '../SeletorDeficiencia';

interface PageCarreiraProps {
  dados: any;
  carregando: boolean;
}

export const PageCarreira: React.FC<PageCarreiraProps> = ({ dados, carregando }) => {
  const funilCargo = dados?.funil_cargo || [];
  const gestaoIntersec = dados?.gestao_interseccional || [];
  const funcoesGestao = dados?.funcoes_gestao || [];
  const progressaoDist = dados?.progressao_distribuicao || [];
  const progressaoMedias = dados?.progressao_medias || [];
  const acessoOportunidades = dados?.acesso_oportunidades || [];
  const evitouCuidado = dados?.evitou_candidatura_cuidado || [];
  const adesaoPgd = dados?.adesao_pgd || [];

  // Estados dos seletores de segmento (Geral | Docente | Técnico TAE | Discentes) para os 4 gráficos solicitados
  const [segmentoProgressao, setSegmentoProgressao] = useState<OpcaoSegmentoFiltro>('geral');
  const [segmentoAcesso, setSegmentoAcesso] = useState<OpcaoSegmentoFiltro>('geral');
  const [segmentoFuncoes, setSegmentoFuncoes] = useState<OpcaoSegmentoFiltro>('geral');
  const [segmentoCuidado, setSegmentoCuidado] = useState<OpcaoSegmentoFiltro>('geral');

  // Estados de modo de visualização (comparativo aglutinado dos 3 universos vs detalhado por gênero)
  const [modoProgressao, setModoProgressao] = useState<'comparativo' | 'detalhado'>('comparativo');
  const [modoAcesso, setModoAcesso] = useState<'comparativo' | 'detalhado'>('comparativo');

  // Seletores independentes de gênero, raça, deficiência e modo de visão para o bloco integrado de Responsabilidade de Cuidado
  const [generoCuidado, setGeneroCuidado] = useState<'todos' | CategoriaGeneroOficial>('todos');
  const [racaCuidado, setRacaCuidado] = useState<OpcaoRacaFiltro>('todos');
  const [pcdCuidado, setPcdCuidado] = useState<OpcaoDeficienciaFiltro>('todos');
  const [visaoCuidado, setVisaoCuidado] = useState<'integrada' | 'grafico' | 'tabela'>('integrada');
  const chartCuidadoRef = useRef<any>(null);

  const baixarCuidadoPng = () => {
    if (chartCuidadoRef.current) {
      const echartInstance = chartCuidadoRef.current.getEchartsInstance();
      const base64 = echartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `cruzamento_cuidado_gestao_${segmentoCuidado}_${generoCuidado}_${racaCuidado}_${pcdCuidado}.png`;
      link.href = base64;
      link.click();
    }
  };

  // Filtros aplicados por segmento
  const funcoesFiltradas = funcoesGestao.filter((r: any) =>
    correspondeSegmento(r.segmento, segmentoFuncoes)
  );
  const progressaoFiltrada = progressaoDist.filter((r: any) =>
    correspondeSegmento(r.segmento, segmentoProgressao)
  );
  const mediasFiltradas = progressaoMedias.filter((r: any) =>
    correspondeSegmento(r.segmento, segmentoProgressao)
  );
  const acessoFiltrado = acessoOportunidades.filter((r: any) =>
    correspondeSegmento(r.segmento, segmentoAcesso)
  );
  const evitouCuidadoFiltrado = evitouCuidado.filter((r: any) => {
    const matchSegmento = correspondeSegmento(r.segmento, segmentoCuidado);
    const matchGenero = generoCuidado === 'todos' ? true : r.genero_grp === generoCuidado;
    const matchRaca = racaCuidado === 'todos' ? true : r.cor_raca === racaCuidado;
    const matchPcd = pcdCuidado === 'todos' ? true : r.pcd === pcdCuidado;
    return matchSegmento && matchGenero && matchRaca && matchPcd;
  });

  // ========================================================
  // COMPARAÇÃO DOS 3 UNIVERSOS AGLUTINADA (100% EMPILHADO): PROGRESSÃO POR MÉRITO
  // Aglutina: Positivo (Notas 4 e 5: Concordo), Neutro (Nota 3), Negativo (Notas 1 e 2: Discordo)
  // Sem separar por sexo, comparando Geral x Docentes x Técnicos de forma 100% proporcional
  // ========================================================
  const universosProgressao = [
    { id: 'geral', nome: 'Geral (Todos)', itens: progressaoDist },
    { id: 'docentes', nome: 'Docentes', itens: progressaoDist.filter((r: any) => r.segmento === 'docentes') },
    { id: 'tecnicos', nome: 'Técnicos/as (TAE)', itens: progressaoDist.filter((r: any) => r.segmento === 'tecnicos') },
  ];

  const dadosAglutinadosProgressao = universosProgressao.map((u) => {
    const pos = u.itens
      .filter((r: any) => Number(r.nota) >= 4)
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const neu = u.itens
      .filter((r: any) => Number(r.nota) === 3)
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const neg = u.itens
      .filter((r: any) => Number(r.nota) <= 2)
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const total = pos + neu + neg;
    return {
      universo: u.nome,
      pos,
      neu,
      neg,
      total,
      pctPos: total > 0 ? Number(((pos / total) * 100).toFixed(1)) : 0,
      pctNeu: total > 0 ? Number(((neu / total) * 100).toFixed(1)) : 0,
      pctNeg: total > 0 ? Number(((neg / total) * 100).toFixed(1)) : 0,
    };
  });

  const optionComparativoProgressao = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#d3dbd6',
      textStyle: { color: '#14201a' },
      formatter: (params: any[]) => {
        const uniNome = params[0]?.axisValueLabel || '';
        const itemObj = dadosAglutinadosProgressao.find((d) => d.universo === uniNome);
        let html = `<div class="font-bold text-texto mb-1">${uniNome}</div>`;
        if (itemObj) {
          html += `<div class="text-xs text-texto-3 mb-2">Total de respondentes: <strong>${formatarNumero(itemObj.total)}</strong></div>`;
        }
        params.forEach((p) => {
          let nAbsoluto = 0;
          if (itemObj) {
            if (p.seriesName.includes('Concordo')) nAbsoluto = itemObj.pos;
            else if (p.seriesName.includes('Neutro')) nAbsoluto = itemObj.neu;
            else if (p.seriesName.includes('Discordo')) nAbsoluto = itemObj.neg;
          }
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-texto">${Number(p.value || 0).toFixed(1)}% <span class="text-texto-3 font-normal">(${formatarNumero(nAbsoluto)} resp.)</span></span>
          </div>`;
        });
        return html;
      },
    },
    legend: {
      data: [
        'Concordo (Concordo totalmente + Concordo)',
        'Neutro',
        'Discordo (Discordo totalmente + Discordo)',
      ],
      bottom: 0,
      textStyle: { color: '#2f3b35', fontSize: 13 },
    },
    grid: { left: '3%', right: '4%', top: '6%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dadosAglutinadosProgressao.map((d) => d.universo),
      axisLabel: { color: '#14201a', fontWeight: 'bold' },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#4d5a53' },
      splitLine: { lineStyle: { stroke: '#e3e8e5' } },
    },
    series: [
      {
        name: 'Concordo (Concordo totalmente + Concordo)',
        type: 'bar',
        stack: 'sentimento',
        itemStyle: { color: '#0d9488' }, // Teal
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: 13,
        },
        data: dadosAglutinadosProgressao.map((d) => d.pctPos),
      },
      {
        name: 'Neutro',
        type: 'bar',
        stack: 'sentimento',
        itemStyle: { color: '#64748b' }, // Slate
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#14201a',
          fontSize: 12,
        },
        data: dadosAglutinadosProgressao.map((d) => d.pctNeu),
      },
      {
        name: 'Discordo (Discordo totalmente + Discordo)',
        type: 'bar',
        stack: 'sentimento',
        itemStyle: { color: '#e11d48' }, // Rose
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: 12,
        },
        data: dadosAglutinadosProgressao.map((d) => d.pctNeg),
      },
    ],
  };

  // ========================================================
  // COMPARAÇÃO DOS 3 UNIVERSOS AGLUTINADA (100% EMPILHADO): ACESSO A OPORTUNIDADES
  // Aglutina: "Muito equitativo" + "Equitativo" vs "Pouco equitativo" + "Nada equitativo"
  // e "Não sei avaliar / Prefiro não responder"
  // ========================================================
  const universosAcesso = [
    { id: 'geral', nome: 'Geral (Todos)', itens: acessoOportunidades },
    { id: 'docentes', nome: 'Docentes', itens: acessoOportunidades.filter((r: any) => r.segmento === 'docentes') },
    { id: 'tecnicos', nome: 'Técnicos/as (TAE)', itens: acessoOportunidades.filter((r: any) => r.segmento === 'tecnicos') },
  ];

  const dadosAglutinadosAcesso = universosAcesso.map((u) => {
    const pos = u.itens
      .filter((r: any) => ['Muito equitativo', 'Equitativo'].includes(r.acesso_oportunidades))
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const neg = u.itens
      .filter((r: any) => ['Pouco equitativo', 'Nada equitativo'].includes(r.acesso_oportunidades))
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const neutro = u.itens
      .filter((r: any) =>
        ['Não sei avaliar', 'Prefiro não responder'].includes(r.acesso_oportunidades) ||
        !['Muito equitativo', 'Equitativo', 'Pouco equitativo', 'Nada equitativo'].includes(r.acesso_oportunidades)
      )
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const total = pos + neg + neutro;
    return {
      universo: u.nome,
      pos,
      neg,
      neutro,
      total,
      pctPos: total > 0 ? Number(((pos / total) * 100).toFixed(1)) : 0,
      pctNeg: total > 0 ? Number(((neg / total) * 100).toFixed(1)) : 0,
      pctNeu: total > 0 ? Number(((neutro / total) * 100).toFixed(1)) : 0,
    };
  });

  const optionComparativoAcesso = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#d3dbd6',
      textStyle: { color: '#14201a' },
      formatter: (params: any[]) => {
        const uniNome = params[0]?.axisValueLabel || '';
        const itemObj = dadosAglutinadosAcesso.find((d) => d.universo === uniNome);
        let html = `<div class="font-bold text-texto mb-1">${uniNome}</div>`;
        if (itemObj) {
          html += `<div class="text-xs text-texto-3 mb-2">Total de respondentes: <strong>${formatarNumero(itemObj.total)}</strong></div>`;
        }
        params.forEach((p) => {
          let nAbsoluto = 0;
          if (itemObj) {
            if (p.seriesName.includes('Equitativo')) nAbsoluto = itemObj.pos;
            else if (p.seriesName.includes('Pouco ou nada')) nAbsoluto = itemObj.neg;
            else if (p.seriesName.includes('Não sei avaliar')) nAbsoluto = itemObj.neutro;
          }
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-texto">${Number(p.value || 0).toFixed(1)}% <span class="text-texto-3 font-normal">(${formatarNumero(nAbsoluto)} resp.)</span></span>
          </div>`;
        });
        return html;
      },
    },
    legend: {
      data: ['Equitativo (Muito equitativo + Equitativo)', 'Pouco ou nada equitativo', 'Não sei avaliar / Sem resposta'],
      bottom: 0,
      textStyle: { color: '#2f3b35', fontSize: 13 },
    },
    grid: { left: '3%', right: '4%', top: '6%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dadosAglutinadosAcesso.map((d) => d.universo),
      axisLabel: { color: '#14201a', fontWeight: 'bold' },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#4d5a53' },
      splitLine: { lineStyle: { stroke: '#e3e8e5' } },
    },
    series: [
      {
        name: 'Equitativo (Muito equitativo + Equitativo)',
        type: 'bar',
        stack: 'acesso',
        itemStyle: { color: '#0d9488' }, // Teal
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: 13,
        },
        data: dadosAglutinadosAcesso.map((d) => d.pctPos),
      },
      {
        name: 'Pouco ou nada equitativo',
        type: 'bar',
        stack: 'acesso',
        itemStyle: { color: '#e11d48' }, // Rose
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: 12,
        },
        data: dadosAglutinadosAcesso.map((d) => d.pctNeg),
      },
      {
        name: 'Não sei avaliar / Sem resposta',
        type: 'bar',
        stack: 'acesso',
        itemStyle: { color: '#64748b' }, // Slate
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#14201a',
          fontSize: 12,
        },
        data: dadosAglutinadosAcesso.map((d) => d.pctNeu),
      },
    ],
  };

  // Médias dinâmicas da progressão por mérito
  const mediaMulher = mediasFiltradas.find((r: any) => r.genero_grp === 'Mulher')?.media;
  const mediaHomem = mediasFiltradas.find((r: any) => r.genero_grp === 'Homem')?.media;
  const mediaGeralSeg =
    mediasFiltradas.length > 0
      ? (
          mediasFiltradas.reduce((acc: number, r: any) => acc + Number(r.media) * Number(r.n), 0) /
          mediasFiltradas.reduce((acc: number, r: any) => acc + Number(r.n), 0)
        ).toFixed(2)
      : '—';
  const rotuloSegProgressao = obterRotuloSegmento(segmentoProgressao);
  const notaRodapeProgressao =
    mediaMulher && mediaHomem
      ? `Médias (${rotuloSegProgressao}): Geral (${mediaGeralSeg.replace('.', ',')}) | Mulher (${String(mediaMulher).replace('.', ',')}) | Homem (${String(mediaHomem).replace('.', ',')})`
      : `Médias calculadas sobre o segmento: ${rotuloSegProgressao}`;

  // 1. Proporção em cargos de gestão
  const totalGestores = gestaoIntersec
    .filter((r: any) => r.ocupa_cargo_gestao === 'Sim')
    .reduce((acc: number, r: any) => acc + Number(r.n), 0);

  const mulheresGestoras = gestaoIntersec
    .filter((r: any) => r.ocupa_cargo_gestao === 'Sim' && (r.genero_grp === 'Mulher' || r.genero_grp === 'Mulher Trans'))
    .reduce((acc: number, r: any) => acc + Number(r.n), 0);

  const negrosGestores = gestaoIntersec
    .filter((r: any) => r.ocupa_cargo_gestao === 'Sim' && r.raca_grp.includes('Negra'))
    .reduce((acc: number, r: any) => acc + Number(r.n), 0);

  // Média Q22 Geral
  const mediaQ22Total =
    progressaoMedias.length > 0
      ? (
          progressaoMedias.reduce((acc: number, r: any) => acc + Number(r.media) * Number(r.n), 0) /
          progressaoMedias.reduce((acc: number, r: any) => acc + Number(r.n), 0)
        ).toFixed(2)
      : '—';

  // Opção ECharts: Composição de Servidores por Cargo e Gênero (6 categorias oficiais da Regra de Ouro)
  const ordemCargosPreferencial = [
    'Docente',
    'Técnico-Administrativo Nível E',
    'Técnico-Administrativo Nível D',
    'Técnico-Administrativo Nível C',
    'Prefiro não responder',
  ];
  const cargosUnicos: string[] = Array.from(new Set<string>(funilCargo.map((r: any) => String(r.cargo)))).sort((a: string, b: string) => {
    const idxA = ordemCargosPreferencial.indexOf(a);
    const idxB = ordemCargosPreferencial.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return a.localeCompare(b);
  });

  const cargosYAxis = [...cargosUnicos].reverse();
  const totalFunilCargo = funilCargo.reduce((acc: number, r: any) => acc + Number(r.n || 0), 0);

  const optionFunilCargo = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#d3dbd6',
      textStyle: { color: '#14201a' },
      formatter: (params: any[]) => {
        const cargoNome = params[0]?.axisValueLabel || '';
        const totalCargo = params.reduce((acc, p) => acc + Number(p.value || 0), 0);
        let html = `<div class="font-bold text-texto mb-1">${cargoNome}</div>`;
        html += `<div class="text-xs text-texto-3 mb-2">Total no cargo: <strong>${formatarNumero(totalCargo)}</strong></div>`;
        params.forEach((p) => {
          const val = Number(p.value || 0);
          const pct = totalCargo > 0 ? ((val / totalCargo) * 100).toFixed(1) : '0.0';
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-texto">${formatarNumero(val)} <span class="text-texto-3 font-normal">(${pct}%)</span></span>
          </div>`;
        });
        return html;
      },
    },
    legend: { data: [...CATEGORIAS_GENERO_OFICIAIS], bottom: 0, textStyle: { color: '#2f3b35', fontSize: 12 } },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '14%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#4d5a53' },
      splitLine: { lineStyle: { stroke: '#e3e8e5' } },
    },
    yAxis: { type: 'category', data: cargosYAxis, axisLabel: { color: '#2f3b35', fontSize: 13 } },
    series: CATEGORIAS_GENERO_OFICIAIS.map((g, idx) => ({
      name: g,
      type: 'bar',
      stack: 'total',
      itemStyle: { color: PALETA_ACESSIVEL[idx % PALETA_ACESSIVEL.length] },
      data: cargosYAxis.map((cargo) => {
        return funilCargo
          .filter((r: any) => r.cargo === cargo && r.genero_grp === g)
          .reduce((acc: number, it: any) => acc + Number(it.n || 0), 0);
      }),
    })),
  };

  // Opção ECharts: Funções de Gestão (CD, FG, FCC) com filtro de segmento (6 categorias oficiais da Regra de Ouro)
  const ordemFuncoesPreferencial = [
    'FG (Gratificada)',
    'CD (Direção)',
    'FCC/FUC (Coordenação)',
    'Prefiro não responder',
  ];
  const funcoesUnicas: string[] = Array.from(new Set<string>(funcoesFiltradas.map((r: any) => String(r.funcao)))).sort((a: string, b: string) => {
    const idxA = ordemFuncoesPreferencial.indexOf(a);
    const idxB = ordemFuncoesPreferencial.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return a.localeCompare(b);
  });
  const funcoesYAxis = [...funcoesUnicas].reverse();
  const totalFuncoesFiltradas = funcoesFiltradas.reduce((acc: number, r: any) => acc + Number(r.n || 0), 0);

  const optionFuncoes = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#d3dbd6',
      textStyle: { color: '#14201a' },
      formatter: (params: any[]) => {
        const funcNome = params[0]?.axisValueLabel || '';
        const totalFunc = params.reduce((acc, p) => acc + Number(p.value || 0), 0);
        let html = `<div class="font-bold text-texto mb-1">${funcNome}</div>`;
        html += `<div class="text-xs text-texto-3 mb-2">Total na função: <strong>${formatarNumero(totalFunc)}</strong></div>`;
        params.forEach((p) => {
          const val = Number(p.value || 0);
          const pct = totalFunc > 0 ? ((val / totalFunc) * 100).toFixed(1) : '0.0';
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-texto">${formatarNumero(val)} <span class="text-texto-3 font-normal">(${pct}%)</span></span>
          </div>`;
        });
        return html;
      },
    },
    legend: { data: [...CATEGORIAS_GENERO_OFICIAIS], bottom: 0, textStyle: { color: '#2f3b35', fontSize: 12 } },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '14%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#4d5a53' },
      splitLine: { lineStyle: { stroke: '#e3e8e5' } },
    },
    yAxis: {
      type: 'category',
      data: funcoesYAxis.length > 0 ? funcoesYAxis : ['Nenhum registro'],
      axisLabel: { color: '#2f3b35', fontSize: 13 },
    },
    series: CATEGORIAS_GENERO_OFICIAIS.map((g, idx) => ({
      name: g,
      type: 'bar',
      stack: 'total',
      itemStyle: { color: PALETA_ACESSIVEL[idx % PALETA_ACESSIVEL.length] },
      data: funcoesYAxis.map((func) => {
        const itens = funcoesFiltradas.filter((r: any) => r.funcao === func && r.genero_grp === g);
        return itens.reduce((acc: number, it: any) => acc + Number(it.n || 0), 0);
      }),
    })),
  };

  // Rótulos descritivos dos segmentos
  const rotuloSegAcesso = obterRotuloSegmento(segmentoAcesso);
  const rotuloSegCuidado = obterRotuloSegmento(segmentoCuidado);

  // ========================================================
  // DETALHADO POR GÊNERO: PROGRESSÃO POR MÉRITO (BARRAS HORIZONTAIS 100% EMPILHADAS)
  // Escala normalizada de 0% a 100% para comparação visual justa independente do tamanho da amostra
  // ========================================================
  const generosDetalhado = [...CATEGORIAS_GENERO_OFICIAIS];
  const dadosDetalhadoProgressao = generosDetalhado.map((g) => {
    const itensG = progressaoFiltrada.filter((r: any) => r.genero_grp === g);
    const pos = itensG
      .filter((r: any) => Number(r.nota) >= 4)
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const neu = itensG
      .filter((r: any) => Number(r.nota) === 3)
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const neg = itensG
      .filter((r: any) => Number(r.nota) <= 2)
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const total = pos + neu + neg;
    return {
      genero: g,
      pos,
      neu,
      neg,
      total,
      pctPos: total > 0 ? Number(((pos / total) * 100).toFixed(1)) : 0,
      pctNeu: total > 0 ? Number(((neu / total) * 100).toFixed(1)) : 0,
      pctNeg: total > 0 ? Number(((neg / total) * 100).toFixed(1)) : 0,
      rotuloComN: `${g} (total: ${formatarNumero(total)})`,
    };
  });

  // Inverte a ordem das categorias para que a primeira oficial ('Mulher') apareça no topo das barras horizontais
  const dadosOrdenadosProg = [...dadosDetalhadoProgressao].reverse();

  const optionDetalhadoProgressao = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#d3dbd6',
      textStyle: { color: '#14201a' },
      formatter: (params: any[]) => {
        const rotulo = String(params[0]?.axisValue ?? params[0]?.axisValueLabel ?? '');
        const itemObj = dadosDetalhadoProgressao.find(
          (d) => d.rotuloComN === rotulo || d.genero === rotulo
        );
        let html = `<div class="font-bold text-texto mb-1">${itemObj?.genero || rotulo} (${rotuloSegProgressao})</div>`;
        if (itemObj) {
          html += `<div class="text-xs text-texto-3 mb-2">Total de respondentes: <strong>${formatarNumero(itemObj.total)}</strong></div>`;
        }
        params.forEach((p) => {
          let nAbsoluto = 0;
          if (itemObj) {
            if (p.seriesName.includes('Concordo')) nAbsoluto = itemObj.pos;
            else if (p.seriesName.includes('Neutro')) nAbsoluto = itemObj.neu;
            else if (p.seriesName.includes('Discordo')) nAbsoluto = itemObj.neg;
          }
          const valPct = Number(p.value || 0).toFixed(1);
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-texto">${valPct}% <span class="text-texto-3 font-normal">(${formatarNumero(nAbsoluto)} resp.)</span></span>
          </div>`;
        });
        if (itemObj && itemObj.total === 0) {
          html += `<div class="mt-2 pt-1.5 border-t border-borda-forte text-xs text-texto-3 italic">
            Nenhum registro nesta categoria para este segmento.
          </div>`;
        }
        return html;
      },
    },
    legend: {
      data: [
        'Concordo (Concordo totalmente + Concordo)',
        'Neutro',
        'Discordo (Discordo totalmente + Discordo)',
      ],
      bottom: 0,
      textStyle: { color: '#2f3b35', fontSize: 13 },
    },
    grid: { left: '3%', right: '5%', top: '6%', bottom: '14%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#4d5a53' },
      splitLine: { lineStyle: { stroke: '#e3e8e5' } },
    },
    yAxis: {
      type: 'category',
      data: dadosOrdenadosProg.map((d) => d.rotuloComN),
      axisLabel: { color: '#14201a', fontWeight: 'bold', fontSize: 13 },
    },
    series: [
      {
        name: 'Concordo (Concordo totalmente + Concordo)',
        type: 'bar',
        stack: 'det_prog_100',
        itemStyle: { color: '#0d9488' }, // Teal
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: 12,
        },
        data: dadosOrdenadosProg.map((d) => d.pctPos),
      },
      {
        name: 'Neutro',
        type: 'bar',
        stack: 'det_prog_100',
        itemStyle: { color: '#64748b' }, // Slate
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#14201a',
          fontSize: 12,
        },
        data: dadosOrdenadosProg.map((d) => d.pctNeu),
      },
      {
        name: 'Discordo (Discordo totalmente + Discordo)',
        type: 'bar',
        stack: 'det_prog_100',
        itemStyle: { color: '#e11d48' }, // Rose
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: 12,
        },
        data: dadosOrdenadosProg.map((d) => d.pctNeg),
      },
    ],
  };

  // ========================================================
  // DETALHADO POR GÊNERO: ACESSO A OPORTUNIDADES (BARRAS HORIZONTAIS 100% EMPILHADAS)
  // Escala normalizada de 0% a 100% para comparação visual justa independente do tamanho da amostra
  // ========================================================
  const dadosDetalhadoAcesso = generosDetalhado.map((g) => {
    const itensG = acessoFiltrado.filter((r: any) => r.genero_grp === g);
    const pos = itensG
      .filter((r: any) => ['Muito equitativo', 'Equitativo'].includes(r.acesso_oportunidades))
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const neg = itensG
      .filter((r: any) => ['Pouco equitativo', 'Nada equitativo'].includes(r.acesso_oportunidades))
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const neutro = itensG
      .filter((r: any) =>
        ['Não sei avaliar', 'Prefiro não responder'].includes(r.acesso_oportunidades) ||
        !['Muito equitativo', 'Equitativo', 'Pouco equitativo', 'Nada equitativo'].includes(r.acesso_oportunidades)
      )
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const total = pos + neg + neutro;
    return {
      genero: g,
      pos,
      neg,
      neutro,
      total,
      pctPos: total > 0 ? Number(((pos / total) * 100).toFixed(1)) : 0,
      pctNeg: total > 0 ? Number(((neg / total) * 100).toFixed(1)) : 0,
      pctNeu: total > 0 ? Number(((neutro / total) * 100).toFixed(1)) : 0,
      rotuloComN: `${g} (total: ${formatarNumero(total)})`,
    };
  });

  const dadosOrdenadosAcesso = [...dadosDetalhadoAcesso].reverse();

  const optionDetalhadoAcesso = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#d3dbd6',
      textStyle: { color: '#14201a' },
      formatter: (params: any[]) => {
        const rotulo = String(params[0]?.axisValue ?? params[0]?.axisValueLabel ?? '');
        const itemObj = dadosDetalhadoAcesso.find(
          (d) => d.rotuloComN === rotulo || d.genero === rotulo
        );
        let html = `<div class="font-bold text-texto mb-1">${itemObj?.genero || rotulo} (${rotuloSegAcesso})</div>`;
        if (itemObj) {
          html += `<div class="text-xs text-texto-3 mb-2">Total de respondentes: <strong>${formatarNumero(itemObj.total)}</strong></div>`;
        }
        params.forEach((p) => {
          let nAbsoluto = 0;
          if (itemObj) {
            if (p.seriesName.includes('Equitativo')) nAbsoluto = itemObj.pos;
            else if (p.seriesName.includes('Pouco ou nada')) nAbsoluto = itemObj.neg;
            else if (p.seriesName.includes('Não sei avaliar')) nAbsoluto = itemObj.neutro;
          }
          const valPct = Number(p.value || 0).toFixed(1);
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-texto">${valPct}% <span class="text-texto-3 font-normal">(${formatarNumero(nAbsoluto)} resp.)</span></span>
          </div>`;
        });
        if (itemObj && itemObj.total === 0) {
          html += `<div class="mt-2 pt-1.5 border-t border-borda-forte text-xs text-texto-3 italic">
            Nenhum registro nesta categoria para este segmento.
          </div>`;
        }
        return html;
      },
    },
    legend: {
      data: [
        'Equitativo (Muito equitativo + Equitativo)',
        'Pouco ou nada equitativo',
        'Não sei avaliar / Sem resposta',
      ],
      bottom: 0,
      textStyle: { color: '#2f3b35', fontSize: 13 },
    },
    grid: { left: '3%', right: '5%', top: '6%', bottom: '14%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#4d5a53' },
      splitLine: { lineStyle: { stroke: '#e3e8e5' } },
    },
    yAxis: {
      type: 'category',
      data: dadosOrdenadosAcesso.map((d) => d.rotuloComN),
      axisLabel: { color: '#14201a', fontWeight: 'bold', fontSize: 13 },
    },
    series: [
      {
        name: 'Equitativo (Muito equitativo + Equitativo)',
        type: 'bar',
        stack: 'det_acesso_100',
        itemStyle: { color: '#0d9488' },
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: 12,
        },
        data: dadosOrdenadosAcesso.map((d) => d.pctPos),
      },
      {
        name: 'Pouco ou nada equitativo',
        type: 'bar',
        stack: 'det_acesso_100',
        itemStyle: { color: '#e11d48' },
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: 12,
        },
        data: dadosOrdenadosAcesso.map((d) => d.pctNeg),
      },
      {
        name: 'Não sei avaliar / Sem resposta',
        type: 'bar',
        stack: 'det_acesso_100',
        itemStyle: { color: '#64748b' },
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => (p.value >= 7 ? `${p.value}%` : ''),
          color: '#14201a',
          fontSize: 12,
        },
        data: dadosOrdenadosAcesso.map((d) => d.pctNeu),
      },
    ],
  };

  // ========================================================
  // GRÁFICO INTERATIVO: RESPONSABILIDADE DE CUIDADO × DEIXOU DE SE CANDIDATAR A GESTÃO
  // ========================================================
  const categoriasCuidado = [
    'Sim',
    'Divido a responsabilidade igualmente com outra(s) pessoa(s)',
    'Não',
    'Não tenho responsabilidade de cuidado sobre ninguém',
  ];
  if (evitouCuidadoFiltrado.some((r: any) => r.responsabilidade_cuidado === 'Prefiro não responder')) {
    categoriasCuidado.push('Prefiro não responder');
  }

  const dadosCuidadoGrafico = categoriasCuidado.map((rc) => {
    const subRows = evitouCuidadoFiltrado.filter((r: any) => r.responsabilidade_cuidado === rc);
    const sim = subRows
      .filter((r: any) => r.evitou_candidatura_cuidado === 'Sim')
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const nao = subRows
      .filter((r: any) => r.evitou_candidatura_cuidado === 'Não')
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const naoAplica = subRows
      .filter((r: any) => r.evitou_candidatura_cuidado === 'Não se aplica')
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const prefiroNao = subRows
      .filter((r: any) => r.evitou_candidatura_cuidado === 'Prefiro não responder')
      .reduce((acc: number, it: any) => acc + Number(it.n), 0);
    const total = sim + nao + naoAplica + prefiroNao;
    const taxaImpacto = total > 0 ? ((sim / total) * 100).toFixed(1) : '0,0';

    // Rótulos descritivos a partir da pergunta do formulário:
    // "Você é a principal pessoa responsável pelo cuidado de filhos, filhas ou outros dependentes?"
    const rotuloCurto =
      rc === 'Sim'
        ? 'É a principal pessoa responsável pelo cuidado de dependentes'
        : rc === 'Divido a responsabilidade igualmente com outra(s) pessoa(s)'
        ? 'Divide igualmente com outra pessoa o cuidado de dependentes'
        : rc === 'Não'
        ? 'Tem dependentes, mas outra pessoa é a principal responsável'
        : rc === 'Não tenho responsabilidade de cuidado sobre ninguém'
        ? 'Não tem responsabilidade de cuidado (sem dependentes)'
        : 'Preferiu não responder';

    return {
      categoriaOriginal: rc,
      rotuloCurto,
      sim,
      nao,
      naoAplica,
      prefiroNao,
      total,
      taxaImpacto,
    };
  }).sort((a, b) => b.total - a.total);

  const optionCuidadoGestao = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#d3dbd6',
      textStyle: { color: '#14201a' },
      formatter: (params: any[]) => {
        const rotulo = String(params[0]?.axisValue ?? params[0]?.axisValueLabel ?? '');
        const itemObj = dadosCuidadoGrafico.find((d) => d.rotuloCurto === rotulo);
        let html = `<div class="font-bold text-texto mb-1">${itemObj?.categoriaOriginal || rotulo}</div>`;
        if (itemObj) {
          html += `<div class="text-xs text-texto-3 mb-2">Segmento: <strong>${rotuloSegCuidado}</strong> | Gênero: <strong>${generoCuidado === 'todos' ? 'Todos' : generoCuidado}</strong> (Total: ${formatarNumero(itemObj.total)})</div>`;
        }
        params.forEach((p) => {
          const val = Number(p.value || 0);
          const pct =
            itemObj && itemObj.total > 0 ? ((val / itemObj.total) * 100).toFixed(1) : '0,0';
          html += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
            <span>${p.marker} ${p.seriesName}</span>
            <span class="font-bold text-texto">${formatarNumero(val)} (${pct}%)</span>
          </div>`;
        });
        return html;
      },
    },
    legend: {
      data: [
        'Deixou de se candidatar à gestão: Sim',
        'Deixou de se candidatar à gestão: Não',
        'Não se aplica',
        'Prefiro não responder',
      ],
      bottom: 0,
      textStyle: { color: '#2f3b35', fontSize: 13 },
    },
    grid: { left: '3%', right: '5%', top: '6%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#4d5a53' },
      splitLine: { lineStyle: { stroke: '#e3e8e5' } },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: dadosCuidadoGrafico.map((d) => d.rotuloCurto),
      axisLabel: { color: '#14201a', fontWeight: 'bold', fontSize: 13, width: 300, overflow: 'break', lineHeight: 17 },
    },
    series: [
      {
        name: 'Deixou de se candidatar à gestão: Sim',
        type: 'bar',
        stack: 'cuidado_gestao',
        itemStyle: { color: '#f43f5e' }, // Rose 500
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => {
            const itemObj = dadosCuidadoGrafico[p.dataIndex];
            return itemObj && itemObj.sim > 0 && Number(itemObj.taxaImpacto) >= 8
              ? `${itemObj.taxaImpacto}%`
              : '';
          },
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: 12,
        },
        data: dadosCuidadoGrafico.map((d) => d.sim),
      },
      {
        name: 'Deixou de se candidatar à gestão: Não',
        type: 'bar',
        stack: 'cuidado_gestao',
        itemStyle: { color: '#0d9488' }, // Teal 600
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => {
            const itemObj = dadosCuidadoGrafico[p.dataIndex];
            const pctNao = itemObj && itemObj.total > 0 ? ((itemObj.nao / itemObj.total) * 100).toFixed(1) : '0';
            return itemObj && itemObj.nao > 0 && Number(pctNao) >= 12 ? `${pctNao}%` : '';
          },
          color: '#ffffff',
          fontSize: 12,
        },
        data: dadosCuidadoGrafico.map((d) => d.nao),
      },
      {
        name: 'Não se aplica',
        type: 'bar',
        stack: 'cuidado_gestao',
        itemStyle: { color: '#64748b' }, // Slate 500
        data: dadosCuidadoGrafico.map((d) => d.naoAplica),
      },
      {
        name: 'Prefiro não responder',
        type: 'bar',
        stack: 'cuidado_gestao',
        itemStyle: { color: '#334155' }, // Slate 700
        data: dadosCuidadoGrafico.map((d) => d.prefiroNao),
      },
    ],
  };

  // Indicadores de impacto de cuidado na renúncia à gestão
  const totalCuidadoDeclarado = evitouCuidadoFiltrado
    .filter((r: any) =>
      ['Sim', 'Divido a responsabilidade igualmente com outra(s) pessoa(s)'].includes(r.responsabilidade_cuidado)
    )
    .reduce((acc: number, r: any) => acc + Number(r.n), 0);

  const evitouComCuidado = evitouCuidadoFiltrado
    .filter((r: any) =>
      ['Sim', 'Divido a responsabilidade igualmente com outra(s) pessoa(s)'].includes(r.responsabilidade_cuidado) &&
      r.evitou_candidatura_cuidado === 'Sim'
    )
    .reduce((acc: number, r: any) => acc + Number(r.n), 0);

  const taxaRenunciaCuidado =
    totalCuidadoDeclarado > 0 ? ((evitouComCuidado / totalCuidadoDeclarado) * 100).toFixed(1) : '0,0';

  const totalRespondentesCuidadoBloco = evitouCuidadoFiltrado.reduce(
    (acc: number, r: any) => acc + Number(r.n || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Título de Seção com Aviso Obrigatório de Base */}
      <div className="border-b border-borda pb-3">
        <h2 className="text-xl font-bold text-texto">2. Carreira, Progressão e Equidade Institucional</h2>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-marca bg-superficie border border-borda px-3 py-1.5 rounded-lg">
          <Info className="w-4 h-4 text-marca shrink-0" />
          <span>
            Servidores/as efetivos/as e docentes substitutos/as (docentes e TAEs).
            Estudantes e trabalhadores/as terceirizados/as não integram os blocos de carreira funcional.
          </span>
        </div>
      </div>

      {/* KPIs de Liderança e Mérito */}
      <div className="grid grid-cols-1 @lg:grid-cols-2 @4xl:grid-cols-4 gap-4">
        <KpiCard
          titulo="Servidores/as em Gestão (Total)"
          valorPrincipal={formatarNumero(totalGestores)}
          subvalor="cargos/funções ativas"
          textoComplementar="Servidores/as ocupantes de cargos de direção ou funções gratificadas"
          notaMetodologica="Respondem 'Sim' para ocupação de cargo/função de gestão"
          icone={<Briefcase className="w-5 h-5 text-info" />}
          corDestaque="emerald"
        />

        <KpiCard
          titulo="Mulheres em Cargos de Gestão"
          valorPrincipal={formatarPercentual(totalGestores > 0 ? (mulheresGestoras / totalGestores) * 100 : 0)}
          subvalor={`${formatarNumero(mulheresGestoras)} gestoras`}
          textoComplementar={`${formatarNumero(mulheresGestoras)} de ${formatarNumero(totalGestores)} cargos de gestão`}
          notaMetodologica="Participação feminina (Mulher e Mulher Trans) nos postos de direção e chefia"
          icone={<Award className="w-5 h-5 text-marca" />}
          corDestaque="emerald"
        />

        <KpiCard
          titulo="Pessoas Negras em Gestão"
          valorPrincipal={formatarPercentual(totalGestores > 0 ? (negrosGestores / totalGestores) * 100 : 0)}
          subvalor={`${formatarNumero(negrosGestores)} gestores/as`}
          textoComplementar={`${formatarNumero(negrosGestores)} de ${formatarNumero(totalGestores)} cargos de gestão`}
          notaMetodologica="Servidores/as pretos/as e pardos/as em funções de liderança"
          icone={<Briefcase className="w-5 h-5 text-roxo" />}
          corDestaque="emerald"
        />

        <KpiCard
          titulo="Percepção de Progressão na Carreira"
          valorPrincipal={`${mediaQ22Total} / 5`}
          subvalor="média geral"
          textoComplementar="Avaliação dos/as servidores/as sobre a imparcialidade nas progressões"
          notaMetodologica="Escala 1 (Discordo totalmente) a 5 (Concordo totalmente)"
          icone={<TrendingUp className="w-5 h-5 text-marca" />}
          corDestaque="emerald"
        />
      </div>

      {/* Gráficos de Funil: Cargos e Funções */}
      <div className="grid grid-cols-1 @4xl:grid-cols-2 gap-6">
        <ChartCard
          titulo="Composição de Servidores/as por Cargo e Gênero"
          subtitulo="Distribuição entre docentes e níveis de técnicos/as administrativos/as (TAE) pelas 6 categorias oficiais de gênero"
          n={totalFunilCargo}
          option={optionFunilCargo}
          altura={360}
          carregando={carregando}
          tabelaDados={{
            cabecalhos: ['Cargo', 'Gênero', 'Quantidade', '% no Cargo'],
            linhas: cargosUnicos.flatMap((cargo) => {
              const totalCargo = funilCargo
                .filter((r: any) => r.cargo === cargo)
                .reduce((acc: number, it: any) => acc + Number(it.n || 0), 0);
              return CATEGORIAS_GENERO_OFICIAIS.map((g) => {
                const qtd = funilCargo
                  .filter((r: any) => r.cargo === cargo && r.genero_grp === g)
                  .reduce((acc: number, it: any) => acc + Number(it.n || 0), 0);
                const pct = totalCargo > 0 ? formatarPercentual((qtd / totalCargo) * 100) : '0,0%';
                return [cargo, g, qtd, pct];
              }).filter(([, , qtd]) => Number(qtd) > 0);
            }),
          }}
        />

        <ChartCard
          titulo="Tipologia de Função de Gestão (CD, FG, FCC)"
          subtitulo="Cargos de Direção (CD), Funções Gratificadas (FG) e Funções de Coordenação (FCC/FUC) pelas 6 categorias oficiais de gênero"
          n={totalFuncoesFiltradas}
          option={optionFuncoes}
          altura={360}
          carregando={carregando}
          elementoCabecalho={
            <SeletorSegmento valor={segmentoFuncoes} aoMudar={setSegmentoFuncoes} apenasServidores={true} />
          }
          tabelaDados={{
            cabecalhos: ['Função', 'Gênero', 'Quantidade', '% na Função'],
            linhas: funcoesUnicas.flatMap((func) => {
              const totalFunc = funcoesFiltradas
                .filter((r: any) => r.funcao === func)
                .reduce((acc: number, it: any) => acc + Number(it.n || 0), 0);
              return CATEGORIAS_GENERO_OFICIAIS.map((g) => {
                const total = funcoesFiltradas
                  .filter((r: any) => r.funcao === func && r.genero_grp === g)
                  .reduce((acc: number, it: any) => acc + Number(it.n || 0), 0);
                const pct = totalFunc > 0 ? formatarPercentual((total / totalFunc) * 100) : '0,0%';
                return [func, g, total, pct];
              }).filter(([, , total]) => Number(total) > 0);
            }),
          }}
        />
      </div>

      {/* Progressão e Acesso a Bolsas com modo Comparativo Aglutinado e Detalhado */}
      <div className="grid grid-cols-1 @4xl:grid-cols-2 gap-6">
        <ChartCard
          titulo="Avaliação da Progressão por Mérito"
          subtitulo={
            modoProgressao === 'comparativo'
              ? 'Avalia se os/as servidores/as consideram os critérios de progressão na carreira justos, transparentes e baseados no mérito entre Docentes e Técnicos/as (TAE)'
              : `Avalia se os/as servidores/as (${rotuloSegProgressao}) consideram a progressão na carreira justa, transparente e livre de desigualdades por identidade de gênero`
          }
          n={
            modoProgressao === 'comparativo'
              ? dadosAglutinadosProgressao[0]?.total || 0
              : progressaoFiltrada.reduce((acc: number, r: any) => acc + Number(r.n || 0), 0)
          }
          option={modoProgressao === 'comparativo' ? optionComparativoProgressao : optionDetalhadoProgressao}
          altura={380}
          carregando={carregando}
          elementoCabecalho={
            <div className="flex items-center justify-between gap-2 flex-wrap w-full">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-texto-3 font-medium">Modo:</span>
                <div className="inline-flex items-center p-0.5 rounded-lg bg-superficie-2 border border-borda text-xs">
                  <button
                    type="button"
                    onClick={() => setModoProgressao('comparativo')}
                    aria-pressed={modoProgressao === 'comparativo'}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      modoProgressao === 'comparativo'
                        ? 'bg-marca text-white shadow-xs'
                        : 'text-texto-3 hover:text-texto'
                    }`}
                  >
                    Comparativo (3 Universos)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoProgressao('detalhado')}
                    aria-pressed={modoProgressao === 'detalhado'}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      modoProgressao === 'detalhado'
                        ? 'bg-marca text-white shadow-xs'
                        : 'text-texto-3 hover:text-texto'
                    }`}
                  >
                    Detalhado por Categoria
                  </button>
                </div>
              </div>
              {modoProgressao === 'detalhado' && (
                <SeletorSegmento valor={segmentoProgressao} aoMudar={setSegmentoProgressao} apenasServidores={true} />
              )}
            </div>
          }
          tabelaDados={
            modoProgressao === 'comparativo'
              ? {
                  cabecalhos: [
                    'Segmento',
                    'Concordo (Totalmente + Concordo)',
                    'Neutro',
                    'Discordo (Totalmente + Discordo)',
                    'Total',
                    '% Concordância',
                  ],
                  linhas: dadosAglutinadosProgressao.map((d) => [
                    d.universo,
                    d.pos,
                    d.neu,
                    d.neg,
                    d.total,
                    `${d.pctPos}%`,
                  ]),
                }
              : {
                  cabecalhos: [
                    'Gênero',
                    'Concordo (Totalmente + Concordo)',
                    'Neutro',
                    'Discordo (Totalmente + Discordo)',
                    'Total',
                    '% Concordância',
                  ],
                  linhas: dadosDetalhadoProgressao.map((d) => [
                    d.genero,
                    d.pos,
                    d.neu,
                    d.neg,
                    d.total,
                    `${d.pctPos}%`,
                  ]),
                }
          }
        />

        <ChartCard
          titulo="Equidade no Acesso a Oportunidades e Bolsas"
          subtitulo={
            modoAcesso === 'comparativo'
              ? 'Avalia se os/as servidores/as percebem igualdade de condições no acesso a editais de pesquisa, extensão, capacitação, bolsas e comissões entre Docentes e Técnicos/as (TAE)'
              : `Avalia se os/as servidores/as (${rotuloSegAcesso}) percebem igualdade de oportunidades por identidade de gênero no acesso a editais, bolsas, projetos e espaços de representação`
          }
          n={
            modoAcesso === 'comparativo'
              ? dadosAglutinadosAcesso[0]?.total || 0
              : acessoFiltrado.reduce((acc: number, r: any) => acc + Number(r.n || 0), 0)
          }
          option={modoAcesso === 'comparativo' ? optionComparativoAcesso : optionDetalhadoAcesso}
          altura={380}
          carregando={carregando}
          elementoCabecalho={
            <div className="flex items-center justify-between gap-2 flex-wrap w-full">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-texto-3 font-medium">Modo:</span>
                <div className="inline-flex items-center p-0.5 rounded-lg bg-superficie-2 border border-borda text-xs">
                  <button
                    type="button"
                    onClick={() => setModoAcesso('comparativo')}
                    aria-pressed={modoAcesso === 'comparativo'}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      modoAcesso === 'comparativo'
                        ? 'bg-marca text-white shadow-xs'
                        : 'text-texto-3 hover:text-texto'
                    }`}
                  >
                    Comparativo (3 Universos)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoAcesso('detalhado')}
                    aria-pressed={modoAcesso === 'detalhado'}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      modoAcesso === 'detalhado'
                        ? 'bg-marca text-white shadow-xs'
                        : 'text-texto-3 hover:text-texto'
                    }`}
                  >
                    Detalhado por Categoria
                  </button>
                </div>
              </div>
              {modoAcesso === 'detalhado' && (
                <SeletorSegmento valor={segmentoAcesso} aoMudar={setSegmentoAcesso} apenasServidores={true} />
              )}
            </div>
          }
          tabelaDados={
            modoAcesso === 'comparativo'
              ? {
                  cabecalhos: [
                    'Segmento',
                    'Equitativo (Muito equitativo + Equitativo)',
                    'Pouco ou nada equitativo',
                    'Não sei avaliar / Sem resposta',
                    'Total',
                    '% Equitativo',
                  ],
                  linhas: dadosAglutinadosAcesso.map((d) => [
                    d.universo,
                    d.pos,
                    d.neg,
                    d.neutro,
                    d.total,
                    `${d.pctPos}%`,
                  ]),
                }
              : {
                  cabecalhos: [
                    'Gênero',
                    'Equitativo (Muito equitativo + Equitativo)',
                    'Pouco ou nada equitativo',
                    'Não sei avaliar / Sem resposta',
                    'Total',
                    '% Equitativo',
                  ],
                  linhas: dadosDetalhadoAcesso.map((d) => [
                    d.genero,
                    d.pos,
                    d.neg,
                    d.neutro,
                    d.total,
                    `${d.pctPos}%`,
                  ]),
                }
          }
        />
      </div>

      {/* Bloco Unificado: Cruzamento Responsabilidade de Cuidado × Deixou de se Candidatar a Gestão (Gráfico e Tabela Integrados) */}
      <div className="bg-superficie rounded-xl border border-borda shadow-sm p-5 space-y-5">
        {/* Cabeçalho Unificado com Título, Subtítulo, Badges e Seletores Compartilhados */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-texto leading-snug">
                  Cruzamento: Responsabilidade de Cuidado × Deixou de se Candidatar a Gestão
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-perigo-fundo/60 border border-perigo-borda/80 text-xs font-semibold text-perigo">
                  Taxa de renúncia com cuidado: {taxaRenunciaCuidado}%
                </span>
              </div>
              <p className="text-xs text-texto-3 mt-1">
                Análise integrada do impacto do trabalho de cuidado na renúncia a pleitear posições de liderança e gestão institucional • Total: {formatarNumero(totalRespondentesCuidadoBloco)}
              </p>
              <p className="text-xs text-texto-3 mt-1">
                Cada barra agrupa as respostas à pergunta{' '}
                <em>“Você é a principal pessoa responsável pelo cuidado de filhos, filhas ou outros dependentes?”</em>{' '}
                e mostra quantas dessas pessoas deixaram de se candidatar a cargos ou funções de gestão por causa do cuidado.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {/* Seletor de visualização dentro do mesmo card */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-superficie-2 border border-borda text-xs">
                <button
                  type="button"
                  onClick={() => setVisaoCuidado('integrada')}
                  title="Exibir Gráfico e Tabela Juntos"
                  aria-pressed={visaoCuidado === 'integrada'}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    visaoCuidado === 'integrada'
                      ? 'bg-marca text-white shadow-xs'
                      : 'text-texto-3 hover:text-texto'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Gráfico + Tabela</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisaoCuidado('grafico')}
                  title="Exibir apenas o Gráfico"
                  aria-pressed={visaoCuidado === 'grafico'}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    visaoCuidado === 'grafico'
                      ? 'bg-marca text-white shadow-xs'
                      : 'text-texto-3 hover:text-texto'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Gráfico</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisaoCuidado('tabela')}
                  title="Exibir apenas a Tabela"
                  aria-pressed={visaoCuidado === 'tabela'}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    visaoCuidado === 'tabela'
                      ? 'bg-marca text-white shadow-xs'
                      : 'text-texto-3 hover:text-texto'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Tabela</span>
                </button>
              </div>

              <button
                type="button"
                onClick={baixarCuidadoPng}
                title="Baixar imagem em PNG"
                className="p-1.5 rounded-lg border border-borda-forte text-texto-2 hover:bg-realce transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Seletores Compartilhados de Segmento, Gênero, Raça e Deficiência */}
          <div className="mt-3 pt-2.5 border-t border-borda/70 flex items-center justify-between gap-3 flex-wrap w-full">
            <div className="flex items-center gap-3 flex-wrap">
              <SeletorSegmento valor={segmentoCuidado} aoMudar={setSegmentoCuidado} apenasServidores={true} />
              <SeletorRaca valor={racaCuidado} aoMudar={setRacaCuidado} />
              <SeletorDeficiencia valor={pcdCuidado} aoMudar={setPcdCuidado} />
            </div>
            <SeletorGenero valor={generoCuidado} aoMudar={setGeneroCuidado} />
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-alerta bg-alerta-fundo/40 border border-alerta-borda/60 px-2.5 py-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-alerta" />
            <span>
              Nota metodológica: contempla estritamente as 6 categorias oficiais de gênero (Mulher, Homem, Mulher Trans, Homem Trans, Travesti e Não-binários). Respostas inválidas e 'Prefiro não responder' são desconsideradas.
            </span>
          </div>
        </div>

        {/* Parte 1: Gráfico Interativo */}
        {(visaoCuidado === 'integrada' || visaoCuidado === 'grafico') && (
          <div className="w-full">
            {visaoCuidado === 'integrada' && (
              <div className="flex items-center justify-between text-xs font-semibold text-texto-2 mb-1.5">
                <span className="flex items-center gap-1.5 text-marca">
                  <BarChart3 className="w-4 h-4" />
                  Visualização Gráfica das Respostas
                </span>
              </div>
            )}
            {carregando ? (
              <div
                style={{ height: '300px' }}
                className="flex flex-col items-center justify-center bg-superficie-2/60 border border-borda rounded-lg animate-pulse"
              >
                <div className="w-8 h-8 border-3 border-marca border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-texto-3">Atualizando cruzamento...</span>
              </div>
            ) : (
              <div className="chart-animate-in w-full">
                <ReactECharts
                  ref={chartCuidadoRef}
                  option={{
                    animation: true,
                    animationDuration: 1000,
                    animationEasing: 'cubicOut',
                    ...optionCuidadoGestao,
                  }}
                  style={{ height: '440px', width: '100%' }}
                  opts={{ renderer: 'canvas' }}
                  notMerge={true}
                  lazyUpdate={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Parte 2: Tabela de Cruzamento Detalhada */}
        {(visaoCuidado === 'integrada' || visaoCuidado === 'tabela') && (
          <div className={visaoCuidado === 'integrada' ? 'pt-4 border-t border-borda/70' : ''}>
            {visaoCuidado === 'integrada' && (
              <div className="flex items-center justify-between text-xs font-semibold text-texto-2 mb-2">
                <span className="flex items-center gap-1.5 text-marca">
                  <Table className="w-4 h-4" />
                  Tabela Detalhada por Nível de Cuidado
                </span>
                <span className="text-xs text-texto-3 font-normal">
                  Segmento <strong>{rotuloSegCuidado}</strong> • Gênero <strong>{generoCuidado === 'todos' ? 'Todos' : generoCuidado}</strong>
                </span>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-borda">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-superficie-2 text-texto font-semibold border-b border-borda">
                  <tr>
                    <th className="px-4 py-3">Responsabilidade de cuidado declarada</th>
                    <th className="px-4 py-3 text-perigo font-bold">Deixou de se candidatar à gestão: Sim</th>
                    <th className="px-4 py-3 text-texto-2">Deixou de se candidatar à gestão: Não</th>
                    <th className="px-4 py-3 text-texto-3">Não se aplica</th>
                    <th className="px-4 py-3 text-texto-3">Prefiro não responder</th>
                    <th className="px-4 py-3 font-bold text-texto">Total</th>
                    <th className="px-4 py-3 text-perigo font-bold">% Renúncia (Sim)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borda">
                  {dadosCuidadoGrafico.map((d) => (
                    <tr key={d.categoriaOriginal} className="hover:bg-realce transition-colors">
                      <th scope="row" className="px-4 py-2.5 font-medium text-texto">
                        {d.rotuloCurto}
                        <span className="block text-xs font-normal text-texto-3">Resposta no formulário: “{d.categoriaOriginal}”</span>
                      </th>
                      <td className="px-4 py-2.5 text-perigo font-bold">
                        {formatarNumero(d.sim)}
                      </td>
                      <td className="px-4 py-2.5 text-texto-2">{formatarNumero(d.nao)}</td>
                      <td className="px-4 py-2.5 text-texto-3">{formatarNumero(d.naoAplica)}</td>
                      <td className="px-4 py-2.5 text-texto-3">{formatarNumero(d.prefiroNao)}</td>
                      <td className="px-4 py-2.5 font-bold text-texto">{formatarNumero(d.total)}</td>
                      <td className="px-4 py-2.5 font-bold text-perigo">{d.taxaImpacto}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rodapé Integrado */}
        <div className="pt-3 border-t border-borda flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-texto-3 gap-1.5">
          <span>Fonte: Questionário aplicado com 4.857 respondentes</span>
          <span className="italic text-texto-3">
            Recorte ativo: {rotuloSegCuidado} • {generoCuidado === 'todos' ? 'Todos os gêneros válidos' : generoCuidado} • {formatarNumero(evitouComCuidado)} de {formatarNumero(totalCuidadoDeclarado)} respondentes com cuidado declararam renúncia à gestão ({taxaRenunciaCuidado}%).
          </span>
        </div>
      </div>
    </div>
  );
};
