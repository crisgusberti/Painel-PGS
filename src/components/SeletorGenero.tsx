/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CATEGORIAS_GENERO_OFICIAIS, CategoriaGeneroOficial } from '../lib/escalas';

export type OpcaoGeneroFiltro = 'todos' | CategoriaGeneroOficial;

interface SeletorGeneroProps {
  valor: OpcaoGeneroFiltro;
  aoMudar: (val: OpcaoGeneroFiltro) => void;
  rotulo?: string;
  classeExtra?: string;
}

export const SeletorGenero: React.FC<SeletorGeneroProps> = ({
  valor,
  aoMudar,
  rotulo = 'Gênero:',
  classeExtra = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${classeExtra}`}>
      {rotulo && <span className="text-[11px] text-slate-400 font-medium">{rotulo}</span>}
      <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0a1020] border border-[#223154] text-xs flex-wrap">
        {(['todos', ...CATEGORIAS_GENERO_OFICIAIS] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => aoMudar(g)}
            className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
              valor === g
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {g === 'todos' ? 'Todos' : g}
          </button>
        ))}
      </div>
    </div>
  );
};
