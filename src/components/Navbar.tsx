/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldAlert,
  Building2,
  HeartHandshake,
  Cpu,
  Wand2,
  BookOpen,
  Filter,
  RotateCcw,
  X,
} from 'lucide-react';
import { FiltrosGlobaisState } from '../lib/types';
import { formatarNumero } from '../lib/formatters';

export interface TabItem {
  id: string;
  label: string;
  icone: React.ReactNode;
}

export const ABAS_PAINEL: TabItem[] = [
  { id: 'visao_geral', label: 'Visão Geral', icone: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'perfil', label: '1. Perfil e Representatividade', icone: <Users className="w-4 h-4" /> },
  { id: 'carreira', label: '2. Carreira e Gestão', icone: <Briefcase className="w-4 h-4" /> },
  { id: 'ambiente_violencias', label: '3. Clima e Violências', icone: <ShieldAlert className="w-4 h-4" /> },
  { id: 'nucleos', label: '4. Núcleos e Políticas', icone: <Building2 className="w-4 h-4" /> },
  { id: 'cuidado', label: '5. Cuidado e Parentalidade', icone: <HeartHandshake className="w-4 h-4" /> },
  { id: 'stem', label: '6. Áreas e STEM', icone: <Cpu className="w-4 h-4" /> },
  { id: 'construtor', label: '7. Construtor Dinâmico', icone: <Wand2 className="w-4 h-4 text-emerald-600" /> },
  { id: 'metodologia', label: '8. Metodologia e Dicionário', icone: <BookOpen className="w-4 h-4" /> },
];

interface NavbarProps {
  abaAtiva: string;
  aoMudarAba: (aba: string) => void;
  filtros: FiltrosGlobaisState;
  aoAbrirFiltros: () => void;
  aoLimparFiltros: () => void;
  aoRemoverFiltro: (chave: keyof FiltrosGlobaisState, valor?: string) => void;
  nFiltrado?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  abaAtiva,
  aoMudarAba,
  filtros,
  aoAbrirFiltros,
  aoLimparFiltros,
  aoRemoverFiltro,
  nFiltrado = 4878,
}) => {
  // Contar filtros ativos
  const listaFiltrosAtivos: { chave: keyof FiltrosGlobaisState; label: string; valor: string }[] = [];
  if (filtros.vinculo) filtros.vinculo.forEach((v) => listaFiltrosAtivos.push({ chave: 'vinculo', label: 'Vínculo', valor: v }));
  if (filtros.campus) filtros.campus.forEach((v) => listaFiltrosAtivos.push({ chave: 'campus', label: 'Campus', valor: v }));
  if (filtros.genero_agrupado) filtros.genero_agrupado.forEach((v) => listaFiltrosAtivos.push({ chave: 'genero_agrupado', label: 'Gênero', valor: v }));
  if (filtros.cor_raca) filtros.cor_raca.forEach((v) => listaFiltrosAtivos.push({ chave: 'cor_raca', label: 'Cor/Raça', valor: v }));
  if (filtros.faixa_etaria) filtros.faixa_etaria.forEach((v) => listaFiltrosAtivos.push({ chave: 'faixa_etaria', label: 'Faixa', valor: v }));
  if (filtros.pcd) filtros.pcd.forEach((v) => listaFiltrosAtivos.push({ chave: 'pcd', label: 'PCD', valor: v }));
  if (filtros.orientacao_sexual) filtros.orientacao_sexual.forEach((v) => listaFiltrosAtivos.push({ chave: 'orientacao_sexual', label: 'Orientação', valor: v }));
  if (filtros.responsabilidade_cuidado) filtros.responsabilidade_cuidado.forEach((v) => listaFiltrosAtivos.push({ chave: 'responsabilidade_cuidado', label: 'Cuidado', valor: v }));
  if (filtros.area_stem && filtros.area_stem !== 'todos') {
    listaFiltrosAtivos.push({
      chave: 'area_stem',
      label: 'Área',
      valor: filtros.area_stem === 'stem' ? 'Apenas STEM' : 'Não-STEM',
    });
  }

  const temFiltroAtivo = listaFiltrosAtivos.length > 0;

  return (
    <header className="bg-[#0e162b] border-b border-[#1f2d4e] sticky top-0 z-40 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Identidade Institucional */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0c1a30] to-[#081224] border border-teal-500/40 p-2 flex items-center justify-center shadow-md shadow-teal-950/40 shrink-0 group hover:border-teal-400 hover:scale-105 transition-all">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_0_8px_rgba(20,184,166,0.35)]"
              aria-label="Logo Instituto Federal"
            >
              {/* Coluna 1 */}
              <rect x="2" y="2" width="7" height="7" rx="1.8" fill="#10b981" />
              <rect x="2" y="12.5" width="7" height="7" rx="1.8" fill="#10b981" />
              <rect x="2" y="23" width="7" height="7" rx="1.8" fill="#10b981" />
              {/* Coluna 2 */}
              <circle cx="16" cy="5.5" r="3.8" fill="#ef4444" />
              <rect x="12.5" y="12.5" width="7" height="7" rx="1.8" fill="#10b981" />
              <rect x="12.5" y="23" width="7" height="7" rx="1.8" fill="#10b981" />
              {/* Coluna 3 */}
              <rect x="23" y="2" width="7" height="7" rx="1.8" fill="#10b981" />
              <rect x="23" y="12.5" width="7" height="7" rx="1.8" fill="#10b981" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
                Painel de Indicadores de Igualdade de Gênero e Diversidade no IFRS
              </h1>
            </div>
          </div>
        </div>

        {/* Indicadores de Amostra e Gatilho de Filtros */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Botão de Filtros Globais */}
          <button
            type="button"
            onClick={aoAbrirFiltros}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              temFiltroAtivo
                ? 'bg-teal-600 border-teal-500 text-white shadow-sm hover:bg-teal-500'
                : 'bg-[#131d36] border-[#25355a] text-slate-200 hover:bg-[#1a284a]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros Globais</span>
            {temFiltroAtivo && (
              <span className="bg-white/20 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                {listaFiltrosAtivos.length}
              </span>
            )}
          </button>

          {temFiltroAtivo && (
            <button
              type="button"
              onClick={aoLimparFiltros}
              title="Limpar todos os filtros"
              className="p-1.5 rounded-lg border border-[#25355a] text-slate-400 hover:text-slate-200 hover:bg-[#131d36] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Faixa de chips de filtros ativos */}
      {temFiltroAtivo && (
        <div className="bg-[#101b33] border-t border-[#1f2d4e] px-4 sm:px-6 lg:px-8 py-1.5 text-xs flex items-center gap-1.5 overflow-x-auto">
          <span className="font-semibold text-teal-300 shrink-0 mr-1">Filtros ativos:</span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {listaFiltrosAtivos.map((fa, i) => (
              <span
                key={i}
                className="bg-[#162342] text-teal-200 border border-[#2b3e6c] rounded-md px-2 py-0.5 text-[11px] font-medium flex items-center gap-1 shrink-0 shadow-xs"
              >
                <span className="text-slate-400 font-normal">{fa.label}:</span>
                <span className="max-w-40 truncate">{fa.valor}</span>
                <button
                  type="button"
                  onClick={() => aoRemoverFiltro(fa.chave, fa.valor)}
                  className="text-slate-400 hover:text-rose-400 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navegação por Abas */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto border-t border-[#1a2647] no-scrollbar">
        {ABAS_PAINEL.map((aba) => {
          const ativa = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              type="button"
              onClick={() => aoMudarAba(aba.id)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                ativa
                  ? 'border-teal-400 text-teal-300 bg-[#162342]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600 hover:bg-[#131d36]/40'
              }`}
            >
              {aba.icone}
              <span>{aba.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
