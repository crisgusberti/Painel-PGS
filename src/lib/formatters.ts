/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatarNumero(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('pt-BR');
}

export function formatarPercentual(val: number | null | undefined, casas = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '0,0%';
  return `${Number(val).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}%`;
}

export function formatarNota(val: number | null | undefined, casas = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Number(val).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}
