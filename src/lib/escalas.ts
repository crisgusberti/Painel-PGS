/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Regra de Ouro de Classificação e Normalização de Gênero em todo o Painel:
 * Contém estritamente as 6 categorias válidas. Qualquer outra resposta (zueras,
 * orientações sexuais preenchidas no campo de gênero ou 'Prefiro não responder')
 * retorna NULL e é desconsiderada nos gráficos e filtros de gênero.
 */
export const CATEGORIAS_GENERO_OFICIAIS = [
  'Mulher',
  'Homem',
  'Mulher Trans',
  'Homem Trans',
  'Travesti',
  'Não-binárias',
] as const;

export type CategoriaGeneroOficial = (typeof CATEGORIAS_GENERO_OFICIAIS)[number];

export const SQL_GENERO_NORMALIZADO = `(
  CASE
    WHEN genero ILIKE '%travesti%' THEN 'Travesti'
    WHEN genero ILIKE '%não-binár%' OR genero ILIKE '%nao-binar%'
      OR genero ILIKE '%agênero%' OR genero ILIKE '%alexigênero%'
      OR genero ILIKE '%fluido%' OR genero ILIKE '%fluído%'
      OR genero ILIKE '%demigirl%' OR genero ILIKE '%multigênero%' THEN 'Não-binárias'
    WHEN genero ILIKE '%mulher%' AND genero ILIKE '%trans%' THEN 'Mulher Trans'
    WHEN genero ILIKE '%homem%' AND genero ILIKE '%trans%' THEN 'Homem Trans'
    WHEN genero ILIKE '%mulher%' OR genero ILIKE '%femin%' THEN 'Mulher'
    WHEN genero ILIKE '%homem%' OR genero ILIKE '%masculin%' OR genero ILIKE '%cromossomo%xy%' THEN 'Homem'
    ELSE NULL
  END
)`;

/**
 * Regra Global de Escopo Institucional:
 * Trabalhadores terceirizados são removidos de todas as análises e gráficos do painel.
 */
export const SQL_FILTRO_SEM_TERCEIRIZADOS = `(
  (vinculo IS NULL OR vinculo NOT ILIKE '%Terceirizado%')
  AND (cargo IS NULL OR cargo NOT ILIKE '%Terceirizado%')
)`;

/**
 * Normalização de Orientação Sexual (consolida termos com grafia variante como Demisexual/Demissexual,
 * Hetero/Heterossexual, Gay/Homossexual, etc. e expurga respostas inválidas de ocorrência única).
 */
export const SQL_ORIENTACAO_NORMALIZADA = `(
  CASE
    WHEN trim(orientacao_sexual) ILIKE 'demissexual%' OR trim(orientacao_sexual) ILIKE 'demisexual%' THEN 'Demissexual'
    WHEN trim(orientacao_sexual) ILIKE 'heterossexual%' OR trim(orientacao_sexual) ILIKE 'hetero' THEN 'Heterossexual'
    WHEN trim(orientacao_sexual) ILIKE 'homossexual%' OR trim(orientacao_sexual) ILIKE 'gay%' THEN 'Homossexual (Gay/Lésbica)'
    WHEN trim(orientacao_sexual) ILIKE 'bissexual%' THEN 'Bissexual'
    WHEN trim(orientacao_sexual) ILIKE 'pansexual%' OR trim(orientacao_sexual) ILIKE 'pan %' THEN 'Pansexual'
    WHEN trim(orientacao_sexual) ILIKE 'assexual%' OR trim(orientacao_sexual) ILIKE 'aroace%' OR trim(orientacao_sexual) ILIKE 'graysexual%' OR trim(orientacao_sexual) ILIKE 'arromântic%' THEN 'Assexual'
    WHEN trim(orientacao_sexual) = 'Prefiro não responder' THEN 'Prefiro não responder'
    ELSE NULL
  END
)`;

/**
 * Classificação de segmento da comunidade acadêmica (Docente, Técnico TAE, Discente)
 */
export const SQL_SEGMENTO_COMUNIDADE = `(
  CASE
    WHEN vinculo ILIKE '%Discente%' THEN 'discente'
    WHEN vinculo ILIKE '%Substituto%' OR cargo ILIKE '%Docente%' THEN 'docente'
    WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnico_tae'
    ELSE 'outro'
  END
)`;

/**
 * Categorias oficiais de Cor / Raça (IBGE + Prefiro não responder)
 */
export const CATEGORIAS_COR_RACA_OFICIAIS = [
  'Branca',
  'Parda',
  'Preta',
  'Amarela',
  'Indígena',
  'Prefiro não responder',
] as const;

export type CategoriaCorRacaOficial = (typeof CATEGORIAS_COR_RACA_OFICIAIS)[number];

/**
 * Categorias de Pessoa com Deficiência (PCD) para filtro rápido
 */
export const CATEGORIAS_DEFICIENCIA_OFICIAIS = ['Sim', 'Não'] as const;

export type CategoriaDeficienciaOficial = (typeof CATEGORIAS_DEFICIENCIA_OFICIAIS)[number];

/**
 * Agrupamento de Idade: Menor (< 18 anos) vs Maior (18+ anos)
 */
export const SQL_IDADE_AGRUPADA = `(
  CASE
    WHEN faixa_etaria = 'Menor de 18 anos' THEN 'menor'
    WHEN faixa_etaria IN ('18 a 29 anos', '30 a 39 anos', '40 a 49 anos', '50 a 59 anos', '60 anos ou mais') THEN 'maior'
    ELSE NULL
  END
)`;

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
