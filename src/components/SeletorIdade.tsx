/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type OpcaoIdadeFiltro = 'todos' | 'menor' | 'maior';

export const OPCOES_IDADE_PADRAO: { id: OpcaoIdadeFiltro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'menor', label: 'Menor' },
  { id: 'maior', label: 'Maior' },
];

export function correspondeIdade(
  idadeLinha: string | null | undefined,
  filtroSelecionado: OpcaoIdadeFiltro
): boolean {
  if (filtroSelecionado === 'todos') return true;
  return idadeLinha === filtroSelecionado;
}

interface SeletorIdadeProps {
  valor: OpcaoIdadeFiltro;
  aoMudar: (val: OpcaoIdadeFiltro) => void;
  rotulo?: string;
  classeExtra?: string;
}

export const SeletorIdade: React.FC<SeletorIdadeProps> = ({
  valor,
  aoMudar,
  rotulo = 'Idade:',
  classeExtra = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${classeExtra}`}>
      {rotulo && <span className="text-[11px] text-slate-400 font-medium">{rotulo}</span>}
      <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0a1020] border border-[#223154] text-xs flex-wrap">
        {OPCOES_IDADE_PADRAO.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => aoMudar(op.id)}
            title={
              op.id === 'menor'
                ? 'Menor de 18 anos'
                : op.id === 'maior'
                ? 'Maior de idade (18 anos ou mais)'
                : 'Todas as idades'
            }
            className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
              valor === op.id
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
};
