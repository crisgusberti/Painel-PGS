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
      {rotulo && <span className="text-xs text-texto-3 font-medium">{rotulo}</span>}
      <div role="group" aria-label={(rotulo || 'Opções').replace(':', '')} className="inline-flex items-center p-0.5 rounded-lg bg-superficie-2 border border-borda text-xs flex-wrap">
        {(['todos', ...CATEGORIAS_GENERO_OFICIAIS] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => aoMudar(g)}
            aria-pressed={valor === g}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              valor === g
                ? 'bg-marca text-white shadow-xs'
                : 'text-texto-3 hover:text-texto'
            }`}
          >
            {g === 'todos' ? 'Todos' : g}
          </button>
        ))}
      </div>
    </div>
  );
};
