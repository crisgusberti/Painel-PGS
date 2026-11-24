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
      {rotulo && <span className="text-xs text-texto-3 font-medium">{rotulo}</span>}
      <div role="group" aria-label={(rotulo || 'Opções').replace(':', '')} className="inline-flex items-center p-0.5 rounded-lg bg-superficie-2 border border-borda text-xs flex-wrap">
        {(['todos', ...CATEGORIAS_COR_RACA_OFICIAIS] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => aoMudar(r)}
            aria-pressed={valor === r}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              valor === r
                ? 'bg-marca text-white shadow-xs'
                : 'text-texto-3 hover:text-texto'
            }`}
          >
            {r === 'todos' ? 'Todos' : r}
          </button>
        ))}
      </div>
    </div>
  );
};
