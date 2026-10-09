/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ESCALA_CONCORDANCIA_Q24: Record<string, number> = {
  'Concordo Totalmente': 5,
  'Concordo': 4,
  'Não concordo nem discordo': 3,
  'Discordo': 2,
  'Discordo Totalmente': 1,
};

export const SEM_PONTUACAO_CONCORDANCIA_Q24 = ['N/A - Não sei avaliar'];

export const ESCALA_QUALIDADE_Q29: Record<string, number> = {
  'Muito Boa': 5,
  'Boa': 4,
  'Regular': 3,
  'Ruim': 2,
  'Muito Ruim': 1,
};

export const SEM_PONTUACAO_QUALIDADE_Q29 = ['Não conheço'];

export const ESCALA_EFETIVIDADE_Q26: Record<string, number> = {
  'Sim, são muito efetivos': 5,
  'São parcialmente efetivos': 3,
  'São pouco efetivos': 2,
  'Não são efetivos': 1,
};

export const SEM_PONTUACAO_EFETIVIDADE_Q26 = ['Não sei avaliar', 'Prefiro não responder'];

export const ESCALA_RESULTADOS_JUSTOS_Q27: Record<string, number> = {
  'Sim, geram resultados justos': 4,
  'Sim, geram resultados parcialmente justos': 3,
  'Sim, geram poucos resultados justos': 2,
  'Não geram resultados justos': 1,
};

export const SEM_PONTUACAO_RESULTADOS_JUSTOS_Q27 = ['Não sei avaliar', 'Prefiro não responder'];

export const ESCALA_ACESSO_Q23: Record<string, number> = {
  'Muito equitativo': 5,
  'Equitativo': 4,
  'Pouco equitativo': 2,
  'Nada equitativo': 1,
};

export const SEM_PONTUACAO_ACESSO_Q23 = ['Não sei avaliar', 'Prefiro não responder'];

/**
 * Normaliza uma nota em escala 1..max para o índice sintético de 0 a 100
 * Fórmula: (média − min) / (max − min) × 100
 */
export function normalizarIndice100(media: number, min = 1, max = 5): number {
  if (isNaN(media) || max <= min) return 0;
  const clamped = Math.max(min, Math.min(max, media));
  return ((clamped - min) / (max - min)) * 100;
}

/**
 * Calcula o Índice de Diversidade de Shannon (H' normalizado entre 0 e 1, ou 0 e 100)
 * H' = - sum(p_i * ln(p_i)) / ln(k)
 * onde k = número de categorias possíveis com p_i > 0
 */
export function calcularIndiceShannon(contagens: Record<string, number>): number {
  const valores = Object.values(contagens).filter((c) => c > 0);
  const total = valores.reduce((acc, v) => acc + v, 0);
  const k = valores.length;
  if (total === 0 || k <= 1) return 0;

  let H = 0;
  for (const v of valores) {
    const p = v / total;
    H -= p * Math.log(p);
  }
  const maxH = Math.log(k);
  if (maxH === 0) return 0;
  return Math.min(100, Math.max(0, (H / maxH) * 100));
}
