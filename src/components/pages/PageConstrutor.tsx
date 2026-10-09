/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CATALOGO_CAMPOS } from '../../lib/catalogo';
import { CampoCatalogo, TipoMedida, RequisicaoConsulta, RespostaConsulta } from '../../lib/types';
import { ChartCard } from '../ChartCard';
import {
  Wand2,
  Plus,
  Trash2,
  Save,
  Download,
  RotateCcw,
  Sparkles,
  BarChart,
  PieChart,
  Layers,
  Grid,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { PALETA_ACESSIVEL, CORES_LIKERT } from '../../lib/chartTheme';
import { formatarNumero, formatarPercentual } from '../../lib/formatters';

export const PageConstrutor: React.FC = () => {
  // Estado do Construtor
  const [eixo1, setEixo1] = useState<string>('campus');
  const [eixo2, setEixo2] = useState<string>('');
  const [campoCor, setCampoCor] = useState<string>('genero_agrupado');
  const [tipoMedida, setTipoMedida] = useState<TipoMedida>('percentual_no_grupo');
  const [incluirPrefiroNao, setIncluirPrefiroNao] = useState<boolean>(true);
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'barra' | 'barra_empilhada' | 'rosca' | 'heatmap'>('barra_empilhada');

  // Filtros adicionais no construtor
  const [filtrosConstrutor, setFiltrosConstrutor] = useState<Array<{ campo: string; operador: 'in' | 'eq' | 'neq'; valores: string[] }>>([]);

  // Estado de dados e execução
  const [carregando, setCarregando] = useState<boolean>(false);
  const [resultado, setResultado] = useState<RespostaConsulta | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Painéis salvos no localStorage
  const [paineisSalvos, setPaineisSalvos] = useState<Array<{ id: string; nome: string; config: any }>>([]);
  const [nomeNovoPainel, setNomeNovoPainel] = useState<string>('');

  // Carregar painéis salvos
  useEffect(() => {
    try {
      const salvos = localStorage.getItem('paineis_salvos') || localStorage.getItem('pgs_paineis_salvos');
      if (salvos) setPaineisSalvos(JSON.parse(salvos));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Campos elegíveis do catálogo (dinamico: true)
  const camposCatalogo = Object.values(CATALOGO_CAMPOS).filter((c) => c.dinamico);
  const grupos = [
    { id: 'perfil', nome: 'Perfil Demográfico' },
    { id: 'diversidade', nome: 'Identidade e Diversidade' },
    { id: 'ambiente', nome: 'Clima Institucional' },
    { id: 'violencia', nome: 'Violências e Discriminação' },
    { id: 'denuncia', nome: 'Canais de Denúncia' },
    { id: 'politicas', nome: 'Núcleos e Políticas' },
    { id: 'cuidado', nome: 'Cuidado e Família' },
    { id: 'carreira', nome: 'Carreira e Gestão' },
  ];

  // Executar a consulta dinâmica
  const executarBusca = async () => {
    if (!eixo1) return;
    setCarregando(true);
    setErro(null);

    const payload: RequisicaoConsulta = {
      campos_eixo: eixo2 ? [eixo1, eixo2] : [eixo1],
      campos_cor: campoCor ? [campoCor] : undefined,
      medida: {
        tipo: tipoMedida,
        incluir_prefiro_nao_responder: incluirPrefiroNao,
      },
      filtros: filtrosConstrutor.length > 0 ? filtrosConstrutor : undefined,
    };

    try {
      const res = await fetch('/api/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.mensagem || errJson.erro || 'Erro ao executar consulta');
      }

      const data: RespostaConsulta = await res.json();
      setResultado(data);

      // Sugestão inteligente de gráfico baseado nos dados e parâmetros
      if (eixo2) {
        setTipoVisualizacao('heatmap');
      } else if (campoCor) {
        setTipoVisualizacao('barra_empilhada');
      } else {
        setTipoVisualizacao('barra');
      }
    } catch (err: any) {
      setErro(err.message || String(err));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    executarBusca();
  }, [eixo1, eixo2, campoCor, tipoMedida, incluirPrefiroNao]);

  // Salvar painel no localStorage
  const salvarPainelAtual = () => {
    if (!nomeNovoPainel.trim()) return;
    const novo = {
      id: String(Date.now()),
      nome: nomeNovoPainel.trim(),
      config: {
        eixo1,
        eixo2,
        campoCor,
        tipoMedida,
        incluirPrefiroNao,
        tipoVisualizacao,
        filtrosConstrutor,
      },
    };
    const atualizados = [...paineisSalvos, novo];
    setPaineisSalvos(atualizados);
    localStorage.setItem('paineis_salvos', JSON.stringify(atualizados));
    setNomeNovoPainel('');
  };

  const carregarPainel = (config: any) => {
    setEixo1(config.eixo1 || 'campus');
    setEixo2(config.eixo2 || '');
    setCampoCor(config.campoCor || '');
    setTipoMedida(config.tipoMedida || 'percentual_no_grupo');
    setIncluirPrefiroNao(config.incluirPrefiroNao ?? true);
    setTipoVisualizacao(config.tipoVisualizacao || 'barra');
    setFiltrosConstrutor(config.filtrosConstrutor || []);
  };

  const excluirPainel = (id: string) => {
    const atualizados = paineisSalvos.filter((p) => p.id !== id);
    setPaineisSalvos(atualizados);
    localStorage.setItem('paineis_salvos', JSON.stringify(atualizados));
  };

  // Exportar dados atuais em CSV
  const exportarCSV = () => {
    if (!resultado || !resultado.linhas) return;
    const cabecalhos = ['Eixo 1', 'Eixo 2', 'Cor/Série', 'Valor', 'Respondentes (n)', 'Base Grupo'];
    const linhasCsv = resultado.linhas.map((l) => [
      `"${l.eixo_1 || ''}"`,
      `"${l.eixo_2 || ''}"`,
      `"${l.cor || ''}"`,
      l.valor,
      l.n,
      l.n_grupo || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [cabecalhos.join(';'), ...linhasCsv.map((r) => r.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `consulta_genero_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Montar Opções do Apache ECharts dinamicamente
  const montarOpcaoEchart = () => {
    if (!resultado || !resultado.linhas || resultado.linhas.length === 0) {
      return {
        title: { text: 'Nenhum registro encontrado', left: 'center', top: 'center' },
      };
    }

    const linhas = resultado.linhas;
    const categoriasEixo1 = Array.from(new Set(linhas.map((l) => l.eixo_1 || 'Sem resposta')));
    const seriesCores = Array.from(new Set(linhas.map((l) => l.cor || 'Total')));

    if (tipoVisualizacao === 'barra_empilhada' && campoCor) {
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any[]) => {
            let html = `<div class="font-bold mb-1">${params[0]?.name}</div>`;
            params.forEach((p) => {
              html += `<div class="flex items-center justify-between gap-4 text-xs">
                <span>${p.marker} ${p.seriesName}</span>
                <span class="font-bold">${p.value}${tipoMedida.includes('percentual') ? '%' : ''}</span>
              </div>`;
            });
            return html;
          },
        },
        legend: { bottom: 0, textStyle: { fontSize: 11 } },
        grid: { left: '3%', right: '4%', top: '4%', bottom: '15%', containLabel: true },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: tipoMedida.includes('percentual') ? '{value}%' : '{value}',
          },
        },
        yAxis: {
          type: 'category',
          data: categoriasEixo1.slice(0, 30).reverse(),
          axisLabel: { fontSize: 11, width: 140, overflow: 'truncate' },
        },
        series: seriesCores.map((corName, idx) => ({
          name: corName,
          type: 'bar',
          stack: 'total',
          itemStyle: { color: PALETA_ACESSIVEL[idx % PALETA_ACESSIVEL.length] },
          data: categoriasEixo1.slice(0, 30).map((cat) => {
            const match = linhas.find((l) => l.eixo_1 === cat && (l.cor || 'Total') === corName);
            return match ? match.valor : 0;
          }).reverse(),
        })),
      };
    }

    if (tipoVisualizacao === 'rosca' && categoriasEixo1.length <= 10) {
      return {
        tooltip: {
          trigger: 'item',
          formatter: (p: any) =>
            `<div class="font-bold">${p.name}</div><div class="text-xs mt-1">Valor: <strong>${p.value}</strong> (${p.percent}%)</div>`,
        },
        legend: { bottom: 0 },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            color: PALETA_ACESSIVEL,
            data: categoriasEixo1.map((cat) => {
              const match = linhas.find((l) => l.eixo_1 === cat);
              return { name: cat, value: match ? match.valor : 0 };
            }),
          },
        ],
      };
    }

    // Padrão: Barra horizontal ordenada
    const linhasOrdenadas = [...linhas].sort((a, b) => b.valor - a.valor).slice(0, 30);
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          const p = params[0];
          const match = linhas.find((l) => l.eixo_1 === p.name);
          return `<div class="font-bold">${p.name}</div>
            <div class="text-xs mt-1">
              Valor: <strong>${p.value}${tipoMedida.includes('percentual') ? '%' : ''}</strong>
              ${match ? ` (n = ${formatarNumero(match.n)})` : ''}
            </div>`;
        },
      },
      grid: { left: '3%', right: '8%', top: '4%', bottom: '5%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: tipoMedida.includes('percentual') ? '{value}%' : '{value}',
        },
      },
      yAxis: {
        type: 'category',
        data: linhasOrdenadas.map((l) => l.eixo_1 || 'Sem resposta').reverse(),
        axisLabel: { fontSize: 11, width: 150, overflow: 'truncate' },
      },
      series: [
        {
          type: 'bar',
          data: linhasOrdenadas.map((l) => l.valor).reverse(),
          itemStyle: { color: PALETA_ACESSIVEL[0] },
          label: {
            show: true,
            position: 'right',
            formatter: (p: any) => `${p.value}${tipoMedida.includes('percentual') ? '%' : ''}`,
            fontSize: 10,
          },
        },
      ],
    };
  };

  const labelEixo1 = CATALOGO_CAMPOS[eixo1]?.label || eixo1;
  const labelCor = campoCor ? CATALOGO_CAMPOS[campoCor]?.label : null;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-[#1f2d4e] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold text-slate-100">7. Construtor Dinâmico de Gráficos</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure dimensões, séries e métricas em tempo real. O sistema consulta diretamente o banco de
            dados de forma segura e otimizada.
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2b3e6c] bg-[#131d36] text-xs font-semibold text-slate-200 hover:bg-[#1c2a4d] transition-colors"
          >
            <Download className="w-4 h-4 text-teal-400" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Grid Principal: Painel de Configuração vs Área de Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Catálogo e Seletores (4 colunas) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2d4e] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Parâmetros do Gráfico
              </span>
              <span className="text-[10px] bg-teal-950/70 border border-teal-700/60 text-teal-300 font-bold px-2 py-0.5 rounded-full">
                Dinâmico
              </span>
            </div>

            {/* Seletor Eixo X / Linhas */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Eixo Principal (Eixo X / Linhas) *
              </label>
              <select
                value={eixo1}
                onChange={(e) => setEixo1(e.target.value)}
                className="w-full text-xs rounded-lg border border-[#25355a] bg-[#0e162b] px-3 py-2 text-slate-100 focus:outline-teal-500 font-medium"
              >
                {camposCatalogo.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label} ({c.tipo})
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor Cor / Série */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Série / Cor (Opcional)
              </label>
              <select
                value={campoCor}
                onChange={(e) => setCampoCor(e.target.value)}
                className="w-full text-xs rounded-lg border border-[#25355a] bg-[#0e162b] px-3 py-2 text-slate-100 focus:outline-teal-500 font-medium"
              >
                <option value="">(Nenhuma série - série única)</option>
                {camposCatalogo.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Medida */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Métrica / Medida *
              </label>
              <select
                value={tipoMedida}
                onChange={(e) => setTipoMedida(e.target.value as TipoMedida)}
                className="w-full text-xs rounded-lg border border-[#25355a] bg-[#0e162b] px-3 py-2 text-slate-100 focus:outline-teal-500 font-medium"
              >
                <option value="percentual_no_grupo">% no Grupo (Eixo X)</option>
                <option value="percentual_do_total">% do Total Filtrado</option>
                <option value="contagem">Contagem Absoluta (n)</option>
                <option value="media">Média (Itens Likert / Escala 1 a 5)</option>
                <option value="mediana">Mediana (Itens Numéricos)</option>
                <option value="taxa_sim">Taxa de "Sim" (%)</option>
                <option value="percentual_concordancia">% Concordância</option>
              </select>
            </div>

            {/* Tipo de Visualização */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tipo de Visualização
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'barra_empilhada', rotulo: 'Empilhada 100%', icone: <Layers className="w-3.5 h-3.5" /> },
                  { id: 'barra', rotulo: 'Barras', icone: <BarChart className="w-3.5 h-3.5" /> },
                  { id: 'rosca', rotulo: 'Rosca', icone: <PieChart className="w-3.5 h-3.5" /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipoVisualizacao(t.id as any)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      tipoVisualizacao === t.id
                        ? 'bg-teal-600 border-teal-500 text-white shadow-xs'
                        : 'bg-[#0e162b] border-[#25355a] text-slate-300 hover:bg-[#162342]'
                    }`}
                  >
                    {t.icone}
                    <span>{t.rotulo}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Prefiro Não Responder */}
            <div className="pt-2 border-t border-[#1f2d4e]">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={incluirPrefiroNao}
                  onChange={(e) => setIncluirPrefiroNao(e.target.checked)}
                  className="rounded text-teal-500 focus:ring-teal-400 w-4 h-4 bg-[#0e162b] border-[#25355a]"
                />
                <span>Incluir "Prefiro não responder"</span>
              </label>
            </div>
          </div>

          {/* Seção de Salvar / Restaurar Painéis */}
          <div className="bg-[#131d36] border border-[#223154] rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Salvar Visão no Navegador (localStorage)
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome da visualização..."
                value={nomeNovoPainel}
                onChange={(e) => setNomeNovoPainel(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#25355a] bg-[#0e162b] text-slate-100"
              />
              <button
                type="button"
                onClick={salvarPainelAtual}
                disabled={!nomeNovoPainel.trim()}
                className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar
              </button>
            </div>

            {paineisSalvos.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block">Salvos:</span>
                {paineisSalvos.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs bg-[#0e162b] border border-[#25355a] px-2.5 py-1.5 rounded-lg"
                  >
                    <button
                      onClick={() => carregarPainel(p.config)}
                      className="text-left font-medium text-teal-300 hover:underline truncate mr-2"
                    >
                      {p.nome}
                    </button>
                    <button
                      onClick={() => excluirPainel(p.id)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Visualização do Gráfico e Tabela Pivô (8 colunas) */}
        <div className="lg:col-span-8 space-y-4">
          {erro && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              Falha ao processar consulta: {erro}
            </div>
          )}

          <ChartCard
            titulo={`${labelEixo1}${labelCor ? ` por ${labelCor}` : ''}`}
            subtitulo={`Métrica: ${tipoMedida.replace(/_/g, ' ')}`}
            n={resultado?.n_filtrado}
            baseDescricao="respondentes válidos"
            option={montarOpcaoEchart()}
            altura={480}
            carregando={carregando}
            avisoAmostraPequena={Boolean(resultado?.avisos && resultado.avisos.length > 0)}
            tabelaDados={
              resultado && resultado.linhas
                ? {
                    cabecalhos: ['Eixo Principal', 'Série / Cor', 'Valor Calculado', 'Amostra (n)', 'Base Grupo'],
                    linhas: resultado.linhas.map((l) => [
                      l.eixo_1 || 'Sem resposta',
                      l.cor || 'Total',
                      l.valor,
                      l.n,
                      l.n_grupo || resultado.n_filtrado,
                    ]),
                  }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
};
