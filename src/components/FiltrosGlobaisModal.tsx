/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw, Check } from 'lucide-react';
import { FiltrosGlobaisState } from '../lib/types';

interface FiltrosGlobaisModalProps {
  aberto: boolean;
  aoFechar: () => void;
  filtrosAtivos: FiltrosGlobaisState;
  aoAplicar: (novosFiltros: FiltrosGlobaisState) => void;
  aoLimpar: () => void;
  nTotalFiltrado?: number;
}

export const FiltrosGlobaisModal: React.FC<FiltrosGlobaisModalProps> = ({
  aberto,
  aoFechar,
  filtrosAtivos,
  aoAplicar,
  aoLimpar,
  nTotalFiltrado,
}) => {
  const [localFiltros, setLocalFiltros] = useState<FiltrosGlobaisState>(filtrosAtivos);
  const [opcoes, setOpcoes] = useState<any>({
    campus: [],
    cor_raca: [],
    faixa_etaria: [],
    orientacao_sexual: [],
    vinculo: [],
    genero_agrupado: [],
    pcd: [],
    responsabilidade_cuidado: [],
    ocupa_cargo_gestao: [],
  });

  useEffect(() => {
    setLocalFiltros(filtrosAtivos);
  }, [filtrosAtivos]);

  useEffect(() => {
    fetch('/api/filtros-opcoes')
      .then((res) => res.json())
      .then((data) => setOpcoes(data))
      .catch((err) => console.error('Erro ao carregar opções de filtros:', err));
  }, []);

  if (!aberto) return null;

  const toggleArrayItem = (campo: keyof FiltrosGlobaisState, valor: string) => {
    const atual = (localFiltros[campo] as string[]) || [];
    let novo: string[];
    if (atual.includes(valor)) {
      novo = atual.filter((v) => v !== valor);
    } else {
      novo = [...atual, valor];
    }
    setLocalFiltros({
      ...localFiltros,
      [campo]: novo.length > 0 ? novo : undefined,
    });
  };

  const handleAplicar = () => {
    aoAplicar(localFiltros);
    aoFechar();
  };

  const handleLimpar = () => {
    setLocalFiltros({});
    aoLimpar();
    aoFechar();
  };

  // Contar quantos filtros estão ativos
  const totalFiltrosAtivos = Object.entries(localFiltros).reduce((acc, [k, v]) => {
    if (k === 'area_stem' && v && v !== 'todos') return acc + 1;
    if (Array.isArray(v) && v.length > 0) return acc + v.length;
    return acc;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#0e162b] rounded-2xl shadow-2xl border border-[#1f2d4e] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-[#1f2d4e] flex items-center justify-between bg-[#111a33]">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100">Filtros Globais da Amostra</h2>
              <p className="text-xs text-slate-400">
                Os filtros são combinados com "E" entre dimensões e "OU" dentro da mesma dimensão.
              </p>
            </div>
          </div>
          <button
            onClick={aoFechar}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1a284c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com grupos de filtros */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm bg-[#0b1329]">
          {/* Seletor rápido de STEM */}
          <div className="bg-[#111c38] border border-[#233560] rounded-xl p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-2">
              Recorte por Grande Área (STEM vs Não-STEM)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'todos', rotulo: 'Todas as Áreas' },
                { id: 'stem', rotulo: 'Apenas STEM (Exatas, TI e Engenharias)' },
                { id: 'nao_stem', rotulo: 'Demais Áreas (Humanas, Sociais, Agrárias, etc.)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setLocalFiltros({
                      ...localFiltros,
                      area_stem: opt.id as any,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    (localFiltros.area_stem || 'todos') === opt.id
                      ? 'bg-teal-600 border-teal-500 text-white shadow-xs'
                      : 'bg-[#152140] border-[#25355a] text-slate-300 hover:bg-[#1b2b52]'
                  }`}
                >
                  {opt.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vínculo */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Vínculo Institucional
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-[#22335a] rounded-lg bg-[#0e172e]">
                {(opcoes.vinculo || []).map((v: string) => {
                  const sel = (localFiltros.vinculo || []).includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => toggleArrayItem('vinculo', v)}
                      className={`text-xs px-2.5 py-1 rounded-md border text-left transition-all ${
                        sel
                          ? 'bg-teal-600 border-teal-500 text-white font-medium'
                          : 'bg-[#152140] border-[#25355a] text-slate-300 hover:border-slate-500 hover:bg-[#1a294e]'
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gênero Agrupado */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Gênero (Agrupado)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-[#22335a] rounded-lg bg-[#0e172e]">
                {(opcoes.genero_agrupado || []).map((g: string) => {
                  const sel = (localFiltros.genero_agrupado || []).includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleArrayItem('genero_agrupado', g)}
                      className={`text-xs px-2.5 py-1 rounded-md border text-left transition-all ${
                        sel
                          ? 'bg-teal-600 border-teal-500 text-white font-medium'
                          : 'bg-[#152140] border-[#25355a] text-slate-300 hover:border-slate-500 hover:bg-[#1a294e]'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cor / Raça */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Cor / Autodeclaração Étnico-Racial
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-[#22335a] rounded-lg bg-[#0e172e]">
                {(opcoes.cor_raca || []).map((c: string) => {
                  const sel = (localFiltros.cor_raca || []).includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleArrayItem('cor_raca', c)}
                      className={`text-xs px-2.5 py-1 rounded-md border text-left transition-all ${
                        sel
                          ? 'bg-teal-600 border-teal-500 text-white font-medium'
                          : 'bg-[#152140] border-[#25355a] text-slate-300 hover:border-slate-500 hover:bg-[#1a294e]'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campus */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Campus / Reitoria (18 unidades)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-[#22335a] rounded-lg bg-[#0e172e]">
                {(opcoes.campus || []).map((camp: string) => {
                  const sel = (localFiltros.campus || []).includes(camp);
                  return (
                    <button
                      key={camp}
                      type="button"
                      onClick={() => toggleArrayItem('campus', camp)}
                      className={`text-xs px-2.5 py-1 rounded-md border text-left transition-all ${
                        sel
                          ? 'bg-teal-600 border-teal-500 text-white font-medium'
                          : 'bg-[#152140] border-[#25355a] text-slate-300 hover:border-slate-500 hover:bg-[#1a294e]'
                      }`}
                    >
                      {camp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Faixa Etária */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Faixa Etária
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-[#22335a] rounded-lg bg-[#0e172e]">
                {(opcoes.faixa_etaria || []).map((f: string) => {
                  const sel = (localFiltros.faixa_etaria || []).includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleArrayItem('faixa_etaria', f)}
                      className={`text-xs px-2.5 py-1 rounded-md border text-left transition-all ${
                        sel
                          ? 'bg-teal-600 border-teal-500 text-white font-medium'
                          : 'bg-[#152140] border-[#25355a] text-slate-300 hover:border-slate-500 hover:bg-[#1a294e]'
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PCD */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Pessoa com Deficiência (PCD)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-[#22335a] rounded-lg bg-[#0e172e]">
                {(opcoes.pcd || []).map((p: string) => {
                  const sel = (localFiltros.pcd || []).includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleArrayItem('pcd', p)}
                      className={`text-xs px-2.5 py-1 rounded-md border text-left transition-all ${
                        sel
                          ? 'bg-teal-600 border-teal-500 text-white font-medium'
                          : 'bg-[#152140] border-[#25355a] text-slate-300 hover:border-slate-500 hover:bg-[#1a294e]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orientação Sexual */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Orientação Sexual
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-[#22335a] rounded-lg bg-[#0e172e]">
                {(opcoes.orientacao_sexual || []).map((o: string) => {
                  const sel = (localFiltros.orientacao_sexual || []).includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => toggleArrayItem('orientacao_sexual', o)}
                      className={`text-xs px-2.5 py-1 rounded-md border text-left transition-all ${
                        sel
                          ? 'bg-teal-600 border-teal-500 text-white font-medium'
                          : 'bg-[#152140] border-[#25355a] text-slate-300 hover:border-slate-500 hover:bg-[#1a294e]'
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Responsabilidade de Cuidado */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Responsabilidade de Cuidado
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-[#22335a] rounded-lg bg-[#0e172e]">
                {(opcoes.responsabilidade_cuidado || []).map((rc: string) => {
                  const sel = (localFiltros.responsabilidade_cuidado || []).includes(rc);
                  return (
                    <button
                      key={rc}
                      type="button"
                      onClick={() => toggleArrayItem('responsabilidade_cuidado', rc)}
                      className={`text-xs px-2.5 py-1 rounded-md border text-left transition-all ${
                        sel
                          ? 'bg-teal-600 border-teal-500 text-white font-medium'
                          : 'bg-[#152140] border-[#25355a] text-slate-300 hover:border-slate-500 hover:bg-[#1a294e]'
                      }`}
                    >
                      {rc}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="px-6 py-4 border-t border-[#1f2d4e] bg-[#111a33] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLimpar}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-[#1b2b52] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar todos
            </button>
            {totalFiltrosAtivos > 0 && (
              <span className="text-xs text-teal-300 font-medium">
                {totalFiltrosAtivos} seleção(ões) ativa(s)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={aoFechar}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#1b2b52] hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAplicar}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
