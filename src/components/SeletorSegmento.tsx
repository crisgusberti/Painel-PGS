/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type OpcaoSegmentoFiltro = 'geral' | 'docente' | 'tecnico_tae' | 'discente';

export const OPCOES_SEGMENTO_PADRAO: { id: OpcaoSegmentoFiltro; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'docente', label: 'Docente' },
  { id: 'tecnico_tae', label: 'Técnico TAE' },
  { id: 'discente', label: 'Discentes' },
];

/**
 * Utilitário que verifica se o segmento de uma linha do banco corresponde ao filtro selecionado,
 * compatível tanto com a nomenclatura singular ('docente', 'tecnico_tae', 'discente') quanto plural ('docentes', 'tecnicos', 'discentes').
 */
export function correspondeSegmento(
  segmentoLinha: string | null | undefined,
  filtroSelecionado: OpcaoSegmentoFiltro
): boolean {
  if (filtroSelecionado === 'geral') return true;
  const seg = String(segmentoLinha || '').toLowerCase();
  if (filtroSelecionado === 'docente') return seg === 'docente' || seg === 'docentes';
  if (filtroSelecionado === 'tecnico_tae') return seg === 'tecnico_tae' || seg === 'tecnicos';
  if (filtroSelecionado === 'discente') return seg === 'discente' || seg === 'discentes';
  return seg === filtroSelecionado;
}

export function obterRotuloSegmento(filtro: OpcaoSegmentoFiltro): string {
  const encontrado = OPCOES_SEGMENTO_PADRAO.find((op) => op.id === filtro);
  return encontrado ? encontrado.label : 'Geral';
}

interface SeletorSegmentoProps {
  valor: OpcaoSegmentoFiltro;
  aoMudar: (val: OpcaoSegmentoFiltro) => void;
  rotulo?: string;
  classeExtra?: string;
  apenasServidores?: boolean;
}

export const SeletorSegmento: React.FC<SeletorSegmentoProps> = ({
  valor,
  aoMudar,
  rotulo = 'Segmento:',
  classeExtra = '',
  apenasServidores = false,
}) => {
  const opcoes = apenasServidores
    ? OPCOES_SEGMENTO_PADRAO.filter((op) => op.id !== 'discente')
    : OPCOES_SEGMENTO_PADRAO;

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${classeExtra}`}>
      {rotulo && <span className="text-[11px] text-slate-400 font-medium">{rotulo}</span>}
      <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0a1020] border border-[#223154] text-xs flex-wrap">
        {opcoes.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => aoMudar(op.id)}
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
