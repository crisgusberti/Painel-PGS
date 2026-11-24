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
    emerald: 'border-marca/30 hover:border-marca/60 bg-marca-fundo',
    blue: 'border-info/30 hover:border-info/60 bg-realce',
    amber: 'border-alerta-borda/30 hover:border-alerta-borda/60 bg-alerta-fundo',
    rose: 'border-perigo/30 hover:border-perigo/60 bg-perigo-fundo',
    indigo: 'border-roxo/30 hover:border-roxo/60 bg-realce',
    slate: 'border-borda hover:border-borda-forte bg-superficie',
  };

  const textColors = {
    emerald: 'text-marca',
    blue: 'text-info',
    amber: 'text-alerta',
    rose: 'text-perigo',
    indigo: 'text-roxo',
    slate: 'text-texto',
  };

  return (
    <div
      className={`rounded-xl border p-4.5 shadow-sm transition-all flex flex-col justify-between h-full ${
        borderColors[corDestaque]
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-texto-3 leading-snug">
            {titulo}
          </span>
          {icone && <div className="text-texto-3 shrink-0">{icone}</div>}
        </div>

        <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
          <span className={`text-2xl lg:text-3xl font-bold tracking-tight ${textColors[corDestaque]}`}>
            {valorPrincipal}
          </span>
          {subvalor && <span className="text-xs font-medium text-texto-3">{subvalor}</span>}
        </div>

        {textoComplementar ? (
          <div className="text-xs text-texto-2 font-medium mb-2.5 leading-snug">
            {textoComplementar}
          </div>
        ) : (
          (n !== undefined || baseTotal !== undefined) && (
            <div className="text-xs text-texto-2 font-medium mb-2.5 leading-snug">
              {n !== undefined ? `${n.toLocaleString('pt-BR')}` : ''}
              {baseTotal !== undefined && ` de ${baseTotal.toLocaleString('pt-BR')}`} ({baseDescricao})
            </div>
          )
        )}
      </div>

      <div>
        {notaMetodologica && (
          <div className="flex items-start gap-1.5 text-xs text-texto-2 bg-superficie-2/70 rounded-md px-2.5 py-2 border border-borda mt-1 leading-snug">
            <Info className="w-3.5 h-3.5 text-marca/80 shrink-0 mt-0.5" />
            <div className="whitespace-normal break-words flex-1">
              {notaMetodologica}
            </div>
          </div>
        )}

        {aoClicar && rotuloClique && (
          <button
            onClick={aoClicar}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-marca hover:text-marca transition-colors"
          >
            {rotuloClique}
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
