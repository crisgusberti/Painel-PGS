/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CATEGORIAS_DEFICIENCIA_OFICIAIS, CategoriaDeficienciaOficial } from '../lib/escalas';

export type OpcaoDeficienciaFiltro = 'todos' | CategoriaDeficienciaOficial;

interface SeletorDeficienciaProps {
  valor: OpcaoDeficienciaFiltro;
  aoMudar: (val: OpcaoDeficienciaFiltro) => void;
  rotulo?: string;
  classeExtra?: string;
}

export const SeletorDeficiencia: React.FC<SeletorDeficienciaProps> = ({
  valor,
  aoMudar,
  rotulo = 'Deficiência:',
  classeExtra = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${classeExtra}`}>
      {rotulo && <span className="text-xs text-texto-3 font-medium">{rotulo}</span>}
      <div role="group" aria-label={(rotulo || 'Opções').replace(':', '')} className="inline-flex items-center p-0.5 rounded-lg bg-superficie-2 border border-borda text-xs flex-wrap">
        {(['todos', ...CATEGORIAS_DEFICIENCIA_OFICIAIS] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => aoMudar(d)}
            aria-pressed={valor === d}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              valor === d
                ? 'bg-marca text-white shadow-xs'
                : 'text-texto-3 hover:text-texto'
            }`}
          >
            {d === 'todos' ? 'Todos' : d}
          </button>
        ))}
      </div>
    </div>
  );
};
