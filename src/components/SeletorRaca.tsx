/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CATEGORIAS_COR_RACA_OFICIAIS, CategoriaCorRacaOficial } from '../lib/escalas';

export type OpcaoRacaFiltro = 'todos' | CategoriaCorRacaOficial;

interface SeletorRacaProps {
  valor: OpcaoRacaFiltro;
  aoMudar: (val: OpcaoRacaFiltro) => void;
  rotulo?: string;
  classeExtra?: string;
}

export const SeletorRaca: React.FC<SeletorRacaProps> = ({
  valor,
  aoMudar,
  rotulo = 'Raça:',
  classeExtra = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${classeExtra}`}>
      {rotulo && <span className="text-[11px] text-slate-400 font-medium">{rotulo}</span>}
      <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0a1020] border border-[#223154] text-xs flex-wrap">
        {(['todos', ...CATEGORIAS_COR_RACA_OFICIAIS] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => aoMudar(r)}
            className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
              valor === r
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {r === 'todos' ? 'Todos' : r}
          </button>
        ))}
      </div>
    </div>
  );
};
