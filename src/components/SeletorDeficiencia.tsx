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
      {rotulo && <span className="text-[11px] text-slate-400 font-medium">{rotulo}</span>}
      <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0a1020] border border-[#223154] text-xs flex-wrap">
        {(['todos', ...CATEGORIAS_DEFICIENCIA_OFICIAIS] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => aoMudar(d)}
            className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
              valor === d
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {d === 'todos' ? 'Todos' : d}
          </button>
        ))}
      </div>
    </div>
  );
};
