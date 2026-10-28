/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ChartCard } from '../ChartCard';
import { KpiCard } from '../KpiCard';
import { GraduationCap, AlertCircle, Search, Filter } from 'lucide-react';
import { PALETA_ACESSIVEL } from '../../lib/chartTheme';
import { formatarNumero } from '../../lib/formatters';
import { SeletorGenero, OpcaoGeneroFiltro } from '../SeletorGenero';
import { SeletorRaca, OpcaoRacaFiltro } from '../SeletorRaca';
import { SeletorDeficiencia, OpcaoDeficienciaFiltro } from '../SeletorDeficiencia';
import { SeletorIdade, OpcaoIdadeFiltro, correspondeIdade } from '../SeletorIdade';

interface PageStemProps {
  dados: any;
  carregando: boolean;
}

const GRANDES_AREAS_VALIDAS = [
  'Ciências Agrárias',
  'Ciências Biológicas',
  'Ciências da Saúde',
  'Ciências Exatas e da Terra',
  'Ciências Humanas',
  'Ciências Sociais Aplicadas',
  'Engenharias e Tecnologia',
  'Linguística, Letras e Artes',
];

export const PageStem: React.FC<PageStemProps> = ({ dados, carregando }) => {
  const desencorajamento = dados?.desencorajamento_stem || {};
  const cobertura = dados?.cobertura || [];
  const registrosDetalhados = dados?.registros_detalhados || [];

  // =========================================================================
  // 1. Seletores do Gráfico: Participação Discente por Grande Área (CNPq)
  // =========================================================================
  const [generoArea, setGeneroArea] = useState<OpcaoGeneroFiltro>('todos');
  const [racaArea, setRacaArea] = useState<OpcaoRacaFiltro>('todos');
  const [idadeArea, setIdadeArea] = useState<OpcaoIdadeFiltro>('todos');
  const [pcdArea, setPcdArea] = useState<OpcaoDeficienciaFiltro>('todos');

  // =========================================================================
  // 2. Seletores do Novo Gráfico: Desencorajamento em STEM (1.556 discentes)
  // =========================================================================
  const [generoStem, setGeneroStem] = useState<OpcaoGeneroFiltro>('todos');
  const [racaStem, setRacaStem] = useState<OpcaoRacaFiltro>('todos');
  const [pcdStem, setPcdStem] = useState<OpcaoDeficienciaFiltro>('todos');
  const [idadeStem, setIdadeStem] = useState<OpcaoIdadeFiltro>('todos');

  // Filtros internos da tabela de auditoria
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'nao_classificada' | 'padronizada'>('todos');
  const [buscaTexto, setBuscaTexto] = useState<string>('');

  const coberturaFiltrada = useMemo(() => {
    return (cobertura as any[]).filter((row) => {
      const matchStatus =
        filtroStatus === 'todos'
          ? true
          : filtroStatus === 'nao_classificada'
          ? row.grandeArea === 'Não classificada'
          : row.grandeArea !== 'Não classificada';

      const matchBusca =
        !buscaTexto ||
        String(row.textoOriginal || '').toLowerCase().includes(buscaTexto.toLowerCase()) ||
        String(row.grandeArea || '').toLowerCase().includes(buscaTexto.toLowerCase());

      return matchStatus && matchBusca;
    });
  }, [cobertura, filtroStatus, buscaTexto]);

  const totalRespondentesCobertura = useMemo(() => {
    return coberturaFiltrada.reduce((acc, r) => acc + Number(r.n || 0), 0);
  }, [coberturaFiltrada]);

  const totalNaoClassificadosGeral = useMemo(() => {
    return (cobertura as any[])
      .filter((r) => r.grandeArea === 'Não classificada')
      .reduce((acc, r) => acc + Number(r.n || 0), 0);
  }, [cobertura]);

  const totalTermosNaoClassificados = useMemo(() => {
    return (cobertura as any[]).filter((r) => r.grandeArea === 'Não classificada').length;
  }, [cobertura]);

  // =========================================================================
  // Cálculo do Gráfico 1: Grande Área do Conhecimento (CNPq) sem "Não classificada"
  // =========================================================================
  const temFiltroAtivoArea =
    generoArea !== 'todos' || racaArea !== 'todos' || idadeArea !== 'todos' || pcdArea !== 'todos';

  const registrosClassificados = useMemo(() => {
    return (registrosDetalhados as any[]).filter((r) => {
      const ga = r.grande_area || r.grandeArea;
      return ga && ga !== 'Não classificada' && ga !== 'Prefiro não responder' && GRANDES_AREAS_VALIDAS.includes(ga);
    });
  }, [registrosDetalhados]);

  const dadosGrandesAreas = useMemo(() => {
    const totalGeralClassificados = registrosClassificados.reduce((acc, r) => acc + Number(r.n || 0), 0);

    return GRANDES_AREAS_VALIDAS.map((area) => {
      const todosDaArea = registrosClassificados.filter((r) => (r.grande_area || r.grandeArea) === area);
      const totalArea = todosDaArea.reduce((acc, r) => acc + Number(r.n || 0), 0);

      const filtradosDaArea = todosDaArea.filter((r) => {
        const matchGen = generoArea === 'todos' ? true : r.genero_grp === generoArea;
        const matchRaca = racaArea === 'todos' ? true : r.cor_raca === racaArea;
        const matchIdade = correspondeIdade(r.idade_grp, idadeArea);
        const matchPcd = pcdArea === 'todos' ? true : r.pcd === pcdArea;
        return matchGen && matchRaca && matchIdade && matchPcd;
      });

      const nRecorte = filtradosDaArea.reduce((acc, r) => acc + Number(r.n || 0), 0);
      // Se há filtro ativo, mostra o % de participação do perfil dentro daquela Grande Área;
      // se todos estão em "Todos", mostra a participação (%) da Grande Área no total classificado.
      const pct = temFiltroAtivoArea
        ? totalArea > 0
          ? Number(((nRecorte * 100) / totalArea).toFixed(1))
          : 0
        : totalGeralClassificados > 0
        ? Number(((nRecorte * 100) / totalGeralClassificados).toFixed(1))
        : 0;

      return {
        area,
        nRecorte,
        totalArea,
        pct,
      };
    }).sort((a, b) => b.pct - a.pct || b.nRecorte - a.nRecorte);
  }, [registrosClassificados, generoArea, racaArea, idadeArea, pcdArea, temFiltroAtivoArea]);

  const nTotalGrandesAreas = useMemo(() => {
    return dadosGrandesAreas.reduce((acc, r) => acc + r.nRecorte, 0);
  }, [dadosGrandesAreas]);

  const optionGrandesAreas = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (p: any[]) => {
        const item = p[0];
        const areaData = dadosGrandesAreas.find((r) => r.area === item.name);
        if (!areaData) return '';
        return `<div class="font-bold text-slate-100 mb-1">${areaData.area}</div>
          <div class="text-xs text-teal-300">Discentes no recorte: <strong>${formatarNumero(areaData.nRecorte)}</strong> (${areaData.pct}%)</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Total da Grande Área: <strong>${formatarNumero(areaData.totalArea)}</strong> discentes</div>`;
      },
    },
    grid: { left: '3%', right: '10%', top: '4%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 0,
      max: Math.max(40, ...dadosGrandesAreas.map((r) => Math.ceil(r.pct + 5))),
      axisLabel: { formatter: '{value}%', color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    yAxis: {
      type: 'category',
      data: dadosGrandesAreas.map((r) => r.area).reverse(),
      axisLabel: { fontSize: 11, color: '#cbd5e1' },
    },
    series: [
      {
        type: 'bar',
        data: dadosGrandesAreas.map((r) => r.pct).reverse(),
        itemStyle: { color: PALETA_ACESSIVEL[0] },
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => {
            const areaObj = [...dadosGrandesAreas].reverse()[params.dataIndex];
            return areaObj ? `${params.value}% (n=${formatarNumero(areaObj.nRecorte)})` : `${params.value}%`;
          },
          fontSize: 11,
          color: '#38bdf8',
          fontWeight: 600,
        },
      },
    ],
  };

  // =========================================================================
  // Cálculo do Novo Gráfico 2: Desencorajamento entre os 1.556 discentes em STEM
  // =========================================================================
  const registrosStemBase = useMemo(() => {
    return (registrosDetalhados as any[]).filter((r) => r.is_stem === true || r.ehStem === true);
  }, [registrosDetalhados]);

  const nTotalStemBase = useMemo(() => {
    return registrosStemBase.reduce((acc, r) => acc + Number(r.n || 0), 0);
  }, [registrosStemBase]);

  const registrosStemFiltrados = useMemo(() => {
    return registrosStemBase.filter((r) => {
      const matchGen = generoStem === 'todos' ? true : r.genero_grp === generoStem;
      const matchRaca = racaStem === 'todos' ? true : r.cor_raca === racaStem;
      const matchPcd = pcdStem === 'todos' ? true : r.pcd === pcdStem;
      const matchIdade = correspondeIdade(r.idade_grp, idadeStem);
      return matchGen && matchRaca && matchPcd && matchIdade;
    });
  }, [registrosStemBase, generoStem, racaStem, pcdStem, idadeStem]);

  const nTotalStemFiltrado = useMemo(() => {
    return registrosStemFiltrados.reduce((acc, r) => acc + Number(r.n || 0), 0);
  }, [registrosStemFiltrados]);

  const ehDesencorajado = (r: any) => {
    const val = r.desencorajado_participacao || r.resposta_desencorajamento;
    return r.desencorajado === true || val === 'Sim, frequentemente' || val === 'Sim, algumas vezes';
  };

  const nDesencorajadosStemFiltrado = useMemo(() => {
    return registrosStemFiltrados
      .filter(ehDesencorajado)
      .reduce((acc, r) => acc + Number(r.n || 0), 0);
  }, [registrosStemFiltrados]);

  const pctDesencorajadosStemFiltrado =
    nTotalStemFiltrado > 0 ? Number(((nDesencorajadosStemFiltrado * 100) / nTotalStemFiltrado).toFixed(1)) : 0;

  const categoriasDesencorajamentoStem = [
    {
      rotulo: 'Enfrentaram Desencorajamento (Total Sim)',
      cor: '#f43f5e',
      filtro: ehDesencorajado,
    },
    {
      rotulo: 'Sim, frequentemente',
      cor: '#e11d48',
      filtro: (r: any) => (r.desencorajado_participacao || r.resposta_desencorajamento) === 'Sim, frequentemente',
    },
    {
      rotulo: 'Sim, algumas vezes',
      cor: '#f59e0b',
      filtro: (r: any) => (r.desencorajado_participacao || r.resposta_desencorajamento) === 'Sim, algumas vezes',
    },
    {
      rotulo: 'Raramente',
      cor: '#38bdf8',
      filtro: (r: any) => (r.desencorajado_participacao || r.resposta_desencorajamento) === 'Raramente',
    },
    {
      rotulo: 'Nunca',
      cor: '#10b981',
      filtro: (r: any) => (r.desencorajado_participacao || r.resposta_desencorajamento) === 'Nunca',
    },
    {
      rotulo: 'Prefiro não responder',
      cor: '#64748b',
      filtro: (r: any) => (r.desencorajado_participacao || r.resposta_desencorajamento) === 'Prefiro não responder',
    },
  ];

  const dadosGraficoDesencStem = categoriasDesencorajamentoStem.map((cat) => {
    const n = registrosStemFiltrados
      .filter(cat.filtro)
      .reduce((acc, r) => acc + Number(r.n || 0), 0);
    const pct = nTotalStemFiltrado > 0 ? Number(((n * 100) / nTotalStemFiltrado).toFixed(1)) : 0;
    return {
      rotulo: cat.rotulo,
      cor: cat.cor,
      n,
      pct,
    };
  });

  const optionDesencorajamentoStemDetalhado = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0e162b',
      borderColor: '#223154',
      textStyle: { color: '#f1f5f9' },
      formatter: (p: any[]) => {
        const item = p[0];
        const obj = dadosGraficoDesencStem.find((d) => d.rotulo === item.name);
        if (!obj) return '';
        return `<div class="font-bold text-slate-100 mb-1">${obj.rotulo}</div>
          <div class="text-xs text-amber-300">Discentes: <strong>${formatarNumero(obj.n)}</strong> (${obj.pct}%)</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Base STEM filtrada: <strong>${formatarNumero(nTotalStemFiltrado)}</strong> de ${formatarNumero(nTotalStemBase)} discentes</div>`;
      },
    },
    grid: { left: '3%', right: '14%', top: '4%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { stroke: '#1f2d4e' } },
    },
    yAxis: {
      type: 'category',
      data: dadosGraficoDesencStem.map((d) => d.rotulo).reverse(),
      axisLabel: { fontSize: 11, color: '#cbd5e1' },
    },
    series: [
      {
        type: 'bar',
        data: [...dadosGraficoDesencStem].reverse().map((d) => ({
          value: d.n,
          itemStyle: { color: d.cor },
        })),
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => {
            const obj = [...dadosGraficoDesencStem].reverse()[params.dataIndex];
            return obj ? `${formatarNumero(obj.n)} (${obj.pct}%)` : '';
          },
          fontSize: 11,
          color: '#f1f5f9',
          fontWeight: 600,
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Título de Seção */}
      <div className="border-b border-[#1f2d4e] pb-3">
        <h2 className="text-xl font-bold text-slate-100">6. STEM e Masculinização das Áreas do Conhecimento</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Análise da representatividade discente em Ciências Exatas, Engenharias e Computação (STEM) em comparação às
          demais áreas do conhecimento, diversidade étnico-racial, deficiência e barreiras acadêmicas na formação.
        </p>
      </div>

      {/* KPIs de Desencorajamento em STEM e Não STEM (2 colunas, removido Áreas Mapeadas Deterministicamente) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          titulo="Desencorajamento na Participação Acadêmica em Áreas STEM"
          valorPrincipal={`${desencorajamento.stem_pct ?? 0}%`}
          subvalor="estudantes em STEM"
          textoComplementar={`${formatarNumero(desencorajamento.stem_desencorajados ?? 187)} de ${formatarNumero(desencorajamento.stem_n)} discentes em Exatas e Tecnologia`}
          notaMetodologica="Estudantes em cursos STEM que relataram ter sido desencorajados(as) a participar com frequência ou algumas vezes"
          icone={<AlertCircle className="w-5 h-5 text-amber-400" />}
          corDestaque="amber"
        />

        <KpiCard
          titulo="Desencorajamento na Participação Acadêmica em Áreas Não STEM"
          valorPrincipal={`${desencorajamento.nao_stem_pct ?? 0}%`}
          subvalor="demais áreas"
          textoComplementar={`${formatarNumero(desencorajamento.nao_stem_n)} discentes em cursos não-STEM`}
          notaMetodologica="Comparativo com cursos de Humanas, Sociais, Linguagens, Biológicas, Agrárias e Saúde"
          icone={<GraduationCap className="w-5 h-5 text-sky-400" />}
          corDestaque="blue"
        />
      </div>

      {/* Gráfico 1 (Largura Total): Distribuição e Participação Discente por Grande Área do Conhecimento (CNPq) */}
      <ChartCard
        key={`grandes_areas_${generoArea}_${racaArea}_${idadeArea}_${pcdArea}`}
        titulo="Distribuição e Participação Discente por Grande Área do Conhecimento (CNPq)"
        subtitulo={
          temFiltroAtivoArea
            ? 'Proporção (%) e número de discentes do perfil selecionado dentro de cada Grande Área do Conhecimento (excluindo não classificadas)'
            : 'Distribuição percentual e absoluta do corpo discente entre as Grandes Áreas do Conhecimento CNPq (excluindo não classificadas)'
        }
        n={nTotalGrandesAreas}
        elementoCabecalho={
          <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
            <div className="flex items-center gap-2.5 flex-wrap">
              <SeletorRaca valor={racaArea} aoMudar={setRacaArea} />
              <SeletorDeficiencia valor={pcdArea} aoMudar={setPcdArea} />
              <SeletorIdade valor={idadeArea} aoMudar={setIdadeArea} />
            </div>
            <SeletorGenero valor={generoArea} aoMudar={setGeneroArea} />
          </div>
        }
        option={optionGrandesAreas}
        altura={380}
        carregando={carregando}
        tabelaDados={{
          cabecalhos: ['Grande Área (CNPq)', 'Discentes no Recorte (n)', 'Total da Área (n)', 'Participação (%)'],
          linhas: dadosGrandesAreas.map((r) => [r.area, r.nRecorte, r.totalArea, `${r.pct}%`]),
        }}
      />

      {/* Novo Gráfico 2: Desencorajamento Acadêmico entre os 1.556 Discentes de Exatas e Tecnologia (STEM) */}
      <ChartCard
        key={`stem_desenc_${generoStem}_${racaStem}_${pcdStem}_${idadeStem}`}
        titulo="Desencorajamento na Participação Acadêmica em Cursos STEM (Exatas e Tecnologia)"
        subtitulo={`Incidência de desencorajamento entre os 1.556 discentes de Exatas e Tecnologia • No recorte atual: ${formatarNumero(
          nDesencorajadosStemFiltrado
        )} de ${formatarNumero(nTotalStemFiltrado)} discentes (${pctDesencorajadosStemFiltrado}%) enfrentaram desencorajamento`}
        n={nTotalStemFiltrado}
        elementoCabecalho={
          <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
            <div className="flex items-center gap-2.5 flex-wrap">
              <SeletorRaca valor={racaStem} aoMudar={setRacaStem} />
              <SeletorDeficiencia valor={pcdStem} aoMudar={setPcdStem} />
              <SeletorIdade valor={idadeStem} aoMudar={setIdadeStem} />
            </div>
            <SeletorGenero valor={generoStem} aoMudar={setGeneroStem} />
          </div>
        }
        option={optionDesencorajamentoStemDetalhado}
        altura={360}
        carregando={carregando}
        tabelaDados={{
          cabecalhos: ['Frequência de Desencorajamento Relatada', 'Discentes (n)', 'Proporção no Recorte (%)'],
          linhas: dadosGraficoDesencStem.map((d) => [d.rotulo, d.n, `${d.pct}%`]),
        }}
      />

      {/* Tabela de Auditoria e Cobertura da Normalização */}
      <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Tabela de Auditoria e Cobertura da Normalização de Áreas
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Mapeamento de todos os {cobertura.length} termos declarados no formulário para as Grandes Áreas CNPq ({totalNaoClassificadosGeral} respondentes em {totalTermosNaoClassificados} termos não classificados).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-[#0e162b] border border-[#223154] text-slate-300 px-2.5 py-1 rounded-lg">
              {coberturaFiltrada.length} de {cobertura.length} termos • n = {formatarNumero(totalRespondentesCobertura)} respondentes
            </span>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="p-3 rounded-lg bg-[#0e162b] border border-[#223154] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-teal-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filtrar:
            </span>

            <div className="inline-flex items-center p-0.5 rounded-lg bg-[#131d36] border border-[#223154] text-xs">
              <button
                type="button"
                onClick={() => setFiltroStatus('todos')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  filtroStatus === 'todos'
                    ? 'bg-teal-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({cobertura.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('nao_classificada')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  filtroStatus === 'nao_classificada'
                    ? 'bg-rose-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                Não classificadas ({totalNaoClassificadosGeral} resp.)
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('padronizada')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  filtroStatus === 'padronizada'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                Padronizadas
              </button>
            </div>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Buscar termo ou área..."
              className="w-full bg-[#131d36] border border-[#2b3e6c] rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 rounded-lg border border-[#223154]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0e162b] text-slate-200 font-semibold border-b border-[#223154] sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5">Texto Declarado no Formulário</th>
                <th className="px-3 py-2.5">Grande Área Atribuída (CNPq)</th>
                <th className="px-3 py-2.5">Respondentes (n)</th>
                <th className="px-3 py-2.5">Classificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d4e]">
              {coberturaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    Nenhum termo encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                coberturaFiltrada.map((row: any, idx: number) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
