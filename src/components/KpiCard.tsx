/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

interface KpiCardProps {
  titulo: string;
  valorPrincipal: string;
  subvalor?: string;
  n?: number;
  baseTotal?: number;
  baseDescricao?: string;
  textoComplementar?: React.ReactNode;
  notaMetodologica?: React.ReactNode;
  icone?: React.ReactNode;
  corDestaque?: 'emerald' | 'blue' | 'amber' | 'rose' | 'indigo' | 'slate';
  aoClicar?: () => void;
  rotuloClique?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  titulo,
  valorPrincipal,
  subvalor,
  n,
  baseTotal,
  baseDescricao = 'respondentes',
  textoComplementar,
  notaMetodologica,
  icone,
  corDestaque = 'blue',
  aoClicar,
  rotuloClique,
}) => {
  const borderColors = {
    emerald: 'border-emerald-500/30 hover:border-emerald-500/60 bg-[#10232a]',
    blue: 'border-sky-500/30 hover:border-sky-500/60 bg-[#11213b]',
    amber: 'border-amber-500/30 hover:border-amber-500/60 bg-[#251f18]',
    rose: 'border-rose-500/30 hover:border-rose-500/60 bg-[#281724]',
    indigo: 'border-indigo-500/30 hover:border-indigo-500/60 bg-[#1a1c3b]',
    slate: 'border-[#24345c] hover:border-slate-500 bg-[#141e37]',
  };

  const textColors = {
    emerald: 'text-emerald-400',
    blue: 'text-sky-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    indigo: 'text-indigo-400',
    slate: 'text-slate-100',
  };

  return (
    <div
      className={`rounded-xl border p-4.5 shadow-sm transition-all flex flex-col justify-between h-full ${
        borderColors[corDestaque]
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 leading-snug">
            {titulo}
          </span>
          {icone && <div className="text-slate-400 shrink-0">{icone}</div>}
        </div>

        <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
          <span className={`text-2xl lg:text-3xl font-bold tracking-tight ${textColors[corDestaque]}`}>
            {valorPrincipal}
          </span>
          {subvalor && <span className="text-xs font-medium text-slate-400">{subvalor}</span>}
        </div>

        {textoComplementar ? (
          <div className="text-xs text-slate-300 font-medium mb-2.5 leading-snug">
            {textoComplementar}
          </div>
        ) : (
          (n !== undefined || baseTotal !== undefined) && (
            <div className="text-xs text-slate-300 font-medium mb-2.5 leading-snug">
              {n !== undefined ? `${n.toLocaleString('pt-BR')}` : ''}
              {baseTotal !== undefined && ` de ${baseTotal.toLocaleString('pt-BR')}`} ({baseDescricao})
            </div>
          )
        )}
      </div>

      <div>
        {notaMetodologica && (
          <div className="flex items-start gap-1.5 text-[11px] text-slate-300 bg-[#0a1020]/70 rounded-md px-2.5 py-2 border border-[#223154] mt-1 leading-snug">
            <Info className="w-3.5 h-3.5 text-teal-400/80 shrink-0 mt-0.5" />
            <div className="whitespace-normal break-words flex-1">
              {notaMetodologica}
            </div>
          </div>
        )}

        {aoClicar && rotuloClique && (
          <button
            onClick={aoClicar}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            {rotuloClique}
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
