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
      {rotulo && <span className="text-xs text-texto-3 font-medium">{rotulo}</span>}
      <div role="group" aria-label={(rotulo || 'Opções').replace(':', '')} className="inline-flex items-center p-0.5 rounded-lg bg-superficie-2 border border-borda text-xs flex-wrap">
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
            aria-pressed={valor === op.id}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              valor === op.id
                ? 'bg-marca text-white shadow-xs'
                : 'text-texto-3 hover:text-texto'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
};
