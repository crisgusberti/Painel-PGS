// src/server/app.ts
import express from "express";

// src/server/db.ts
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
var connectionString = process.env.DATABASE_URL;
var poolInstance = null;
function getDbPool() {
  if (!poolInstance) {
    if (!connectionString) {
      throw new Error("A vari\xE1vel de ambiente DATABASE_URL n\xE3o est\xE1 configurada.");
    }
    poolInstance = new pg.Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      // Configuração para transaction pooler (porta 6543)
      max: 10,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 8e3,
      statement_timeout: 8e3
      // 8 segundos conforme especificação 2.2
    });
    poolInstance.on("error", (err) => {
      console.error("Erro inesperado no cliente de conex\xE3o PostgreSQL:", err);
    });
  }
  return poolInstance;
}
async function testDbConnection() {
  try {
    if (!connectionString) {
      return { ok: false, error: "Vari\xE1vel de ambiente DATABASE_URL n\xE3o configurada no servidor." };
    }
    const pool = getDbPool();
    const result = await pool.query("SELECT count(*)::int as total FROM public.respostas_pgs");
    return { ok: true, count: result.rows[0]?.total ?? 0 };
  } catch (err) {
    console.error("Falha ao conectar no banco Supabase:", err);
    return { ok: false, error: "Falha de comunica\xE7\xE3o com o banco de dados." };
  }
}

// src/lib/escalas.ts
var SQL_GENERO_NORMALIZADO = `(
  CASE
    WHEN genero ILIKE '%travesti%' THEN 'Travesti'
    WHEN genero ILIKE '%n\xE3o-bin\xE1r%' OR genero ILIKE '%nao-binar%'
      OR genero ILIKE '%ag\xEAnero%' OR genero ILIKE '%alexig\xEAnero%'
      OR genero ILIKE '%fluido%' OR genero ILIKE '%flu\xEDdo%'
      OR genero ILIKE '%demigirl%' OR genero ILIKE '%multig\xEAnero%' THEN 'N\xE3o-bin\xE1rios'
    WHEN genero ILIKE '%mulher%' AND genero ILIKE '%trans%' THEN 'Mulher Trans'
    WHEN genero ILIKE '%homem%' AND genero ILIKE '%trans%' THEN 'Homem Trans'
    WHEN genero ILIKE '%mulher%' OR genero ILIKE '%femin%' THEN 'Mulher'
    WHEN genero ILIKE '%homem%' OR genero ILIKE '%masculin%' OR genero ILIKE '%cromossomo%xy%' THEN 'Homem'
    ELSE NULL
  END
)`;
var SQL_FILTRO_SEM_TERCEIRIZADOS = `(
  (vinculo IS NULL OR vinculo NOT ILIKE '%Terceirizado%')
  AND (cargo IS NULL OR cargo NOT ILIKE '%Terceirizado%')
)`;
var SQL_ORIENTACAO_NORMALIZADA = `(
  CASE
    WHEN trim(orientacao_sexual) ILIKE 'demissexual%' OR trim(orientacao_sexual) ILIKE 'demisexual%' THEN 'Demissexual'
    WHEN trim(orientacao_sexual) ILIKE 'heterossexual%' OR trim(orientacao_sexual) ILIKE 'hetero' THEN 'Heterossexual'
    WHEN trim(orientacao_sexual) ILIKE 'homossexual%' OR trim(orientacao_sexual) ILIKE 'gay%' THEN 'Homossexual (Gay/L\xE9sbica)'
    WHEN trim(orientacao_sexual) ILIKE 'bissexual%' THEN 'Bissexual'
    WHEN trim(orientacao_sexual) ILIKE 'pansexual%' OR trim(orientacao_sexual) ILIKE 'pan %' THEN 'Pansexual'
    WHEN trim(orientacao_sexual) ILIKE 'assexual%' OR trim(orientacao_sexual) ILIKE 'aroace%' OR trim(orientacao_sexual) ILIKE 'graysexual%' OR trim(orientacao_sexual) ILIKE 'arrom\xE2ntic%' THEN 'Assexual'
    WHEN trim(orientacao_sexual) = 'Prefiro n\xE3o responder' THEN 'Prefiro n\xE3o responder'
    ELSE NULL
  END
)`;
var SQL_SEGMENTO_COMUNIDADE = `(
  CASE
    WHEN vinculo ILIKE '%Discente%' THEN 'discente'
    WHEN vinculo ILIKE '%Substituto%' OR cargo ILIKE '%Docente%' THEN 'docente'
    WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnico_tae'
    ELSE 'outro'
  END
)`;
var SQL_IDADE_AGRUPADA = `(
  CASE
    WHEN faixa_etaria = 'Menor de 18 anos' THEN 'menor'
    WHEN faixa_etaria IN ('18 a 29 anos', '30 a 39 anos', '40 a 49 anos', '50 a 59 anos', '60 anos ou mais') THEN 'maior'
    ELSE NULL
  END
)`;
var ESCALA_CONCORDANCIA_Q24 = {
  "Concordo Totalmente": 5,
  "Concordo": 4,
  "N\xE3o concordo nem discordo": 3,
  "Discordo": 2,
  "Discordo Totalmente": 1
};
var SEM_PONTUACAO_CONCORDANCIA_Q24 = ["N/A - N\xE3o sei avaliar"];
var ESCALA_QUALIDADE_Q29 = {
  "Muito Boa": 5,
  "Boa": 4,
  "Regular": 3,
  "Ruim": 2,
  "Muito Ruim": 1
};
var SEM_PONTUACAO_QUALIDADE_Q29 = ["N\xE3o conhe\xE7o"];
var ESCALA_EFETIVIDADE_Q26 = {
  "Sim, s\xE3o muito efetivos": 5,
  "S\xE3o parcialmente efetivos": 3,
  "S\xE3o pouco efetivos": 2,
  "N\xE3o s\xE3o efetivos": 1
};
var SEM_PONTUACAO_EFETIVIDADE_Q26 = ["N\xE3o sei avaliar", "Prefiro n\xE3o responder"];
var ESCALA_RESULTADOS_JUSTOS_Q27 = {
  "Sim, geram resultados justos": 4,
  "Sim, geram resultados parcialmente justos": 3,
  "Sim, geram poucos resultados justos": 2,
  "N\xE3o geram resultados justos": 1
};
var SEM_PONTUACAO_RESULTADOS_JUSTOS_Q27 = ["N\xE3o sei avaliar", "Prefiro n\xE3o responder"];
var ESCALA_ACESSO_Q23 = {
  "Muito equitativo": 5,
  "Equitativo": 4,
  "Pouco equitativo": 2,
  "Nada equitativo": 1
};
var SEM_PONTUACAO_ACESSO_Q23 = ["N\xE3o sei avaliar", "Prefiro n\xE3o responder"];
function normalizarIndice100(media, min = 1, max = 5) {
  if (isNaN(media) || max <= min) return 0;
  const clamped = Math.max(min, Math.min(max, media));
  return (clamped - min) / (max - min) * 100;
}

// src/lib/catalogo.ts
var CATALOGO_CAMPOS = {
  // === Eixo 1: Perfil e Representatividade ===
  campus: {
    key: "campus",
    label: "Campus / Unidade",
    tipo: "nominal",
    grupo: "perfil",
    dinamico: true,
    escopo: "geral",
    papel: "perfil",
    permitirComoSerie: false,
    // 18 unidades torna ilegível como série de cor/legenda; ideal apenas no Eixo Principal
    descricao: "Unidade ou Reitoria do IFRS de lota\xE7\xE3o ou estudo (18 unidades)."
  },
  vinculo: {
    key: "vinculo",
    label: "Segmento / V\xEDnculo Institucional",
    tipo: "nominal",
    grupo: "perfil",
    dinamico: true,
    escopo: "geral",
    papel: "perfil",
    permitirComoSerie: true,
    descricao: "Segmento institucional no IFRS (Discentes, Docentes, T\xE9cnicos/as TAEs, Docentes Substitutos)."
  },
  genero: {
    key: "genero",
    label: "Identidade de G\xEAnero (Detalhada)",
    tipo: "nominal",
    grupo: "diversidade",
    dinamico: false,
    // Desativado no construtor por ser duplicado em relação a genero_agrupado
    escopo: "geral",
    papel: "perfil",
    permitirComoSerie: false,
    descricao: "Identidade de g\xEAnero declarada pelo respondente."
  },
  genero_agrupado: {
    key: "genero_agrupado",
    label: "Identidade de G\xEAnero",
    tipo: "nominal",
    grupo: "diversidade",
    dinamico: true,
    escopo: "geral",
    papel: "perfil",
    permitirComoSerie: true,
    descricao: "Classifica\xE7\xE3o oficial normalizada nas 6 categorias de g\xEAnero: Mulher, Homem, Mulher Trans, Homem Trans, Travesti e N\xE3o-bin\xE1rios."
  },
  cor_raca: {
    key: "cor_raca",
    label: "Autodeclara\xE7\xE3o \xC9tnico-Racial (Cor / Ra\xE7a)",
    tipo: "nominal",
    grupo: "diversidade",
    dinamico: true,
    escopo: "geral",
    papel: "perfil",
    permitirComoSerie: true,
    descricao: "Autodeclara\xE7\xE3o \xE9tnico-racial (Branca, Parda, Preta, Ind\xEDgena, Amarela, Prefiro n\xE3o responder)."
  },
  faixa_etaria: {
    key: "faixa_etaria",
    label: "Faixa Et\xE1ria",
    tipo: "ordinal_faixa",
    grupo: "perfil",
    dinamico: true,
    escopo: "geral",
    papel: "perfil",
    permitirComoSerie: true,
    ordem: ["Menor de 18 anos", "De 18 a 24 anos", "De 25 a 34 anos", "De 35 a 44 anos", "De 45 a 54 anos", "De 55 a 64 anos", "65 anos ou mais", "Prefiro n\xE3o responder"],
    descricao: "Faixa de idade do respondente."
  },
  pcd: {
    key: "pcd",
    label: "Pessoa com Defici\xEAncia (PCD)",
    tipo: "binario_sim_nao",
    grupo: "diversidade",
    dinamico: true,
    escopo: "geral",
    papel: "perfil",
    permitirComoSerie: true,
    descricao: "Declara\xE7\xE3o de condi\xE7\xE3o de pessoa com defici\xEAncia."
  },
  nome_social: {
    key: "nome_social",
    label: "Uso de Nome Social",
    tipo: "binario_sim_nao",
    grupo: "diversidade",
    dinamico: false,
    // Removido do construtor dinâmico por não compor os eixos analíticos do relatório
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: false,
    descricao: "Utiliza\xE7\xE3o de nome social no ambiente institucional."
  },
  orientacao_sexual: {
    key: "orientacao_sexual",
    label: "Orienta\xE7\xE3o Sexual",
    tipo: "nominal",
    grupo: "diversidade",
    dinamico: true,
    escopo: "geral",
    papel: "perfil",
    permitirComoSerie: true,
    descricao: "Orienta\xE7\xE3o sexual declarada (Heterossexual, Bissexual, Homossexual, Pansexual, Assexual, Demissexual)."
  },
  // === Eixo 2: Ambiente, Segurança e Clima ===
  seguranca_expressao_opiniao: {
    key: "seguranca_expressao_opiniao",
    label: "Seguran\xE7a para Expressar Opini\xF5es",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "Sinto-me seguro/a para expressar minhas opini\xF5es no IFRS sem medo de retalia\xE7\xE3o."
  },
  ambiente_seguro_respeitoso: {
    key: "ambiente_seguro_respeitoso",
    label: "Ambiente Seguro e Respeitoso",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "Considero o IFRS um ambiente seguro e respeitoso para todas as pessoas."
  },
  inclusao_pessoas_trans: {
    key: "inclusao_pessoas_trans",
    label: "Inclus\xE3o de Pessoas Trans e Travestis",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "O IFRS \xE9 acolhedor e inclusivo para pessoas trans e travestis."
  },
  maternidade_impacto_carreira: {
    key: "maternidade_impacto_carreira",
    label: "Impacto da Maternidade na Carreira",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    invertido: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "Percep\xE7\xE3o sobre se a maternidade impacta negativamente o desenvolvimento profissional/acad\xEAmico."
  },
  iniciativas_celebrar_diversidade: {
    key: "iniciativas_celebrar_diversidade",
    label: "Iniciativas de Celebra\xE7\xE3o da Diversidade",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "O IFRS promove a\xE7\xF5es e eventos que valorizam a diversidade."
  },
  curriculos_principios_igualdade: {
    key: "curriculos_principios_igualdade",
    label: "Curr\xEDculos com Princ\xEDpios de Igualdade",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "Os curr\xEDculos e pr\xE1ticas pedag\xF3gicas incorporam igualdade de g\xEAnero e diversidade."
  },
  // === Eixo 3: Violências e Discriminações ===
  violencia_raca: {
    key: "violencia_raca",
    label: "Sofreu Discrimina\xE7\xE3o por Cor / Ra\xE7a",
    tipo: "binario_sim_nao",
    grupo: "violencia",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Relato de j\xE1 ter vivenciado discrimina\xE7\xE3o ou viol\xEAncia por motivo de cor/ra\xE7a no IFRS."
  },
  violencia_orientacao_genero: {
    key: "violencia_orientacao_genero",
    label: "Sofreu Discrimina\xE7\xE3o por G\xEAnero ou Orienta\xE7\xE3o",
    tipo: "binario_sim_nao",
    grupo: "violencia",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Relato de discrimina\xE7\xE3o ou viol\xEAncia por orienta\xE7\xE3o sexual ou identidade de g\xEAnero no IFRS."
  },
  desencorajado_participacao: {
    key: "desencorajado_participacao",
    label: "Desencorajamento de Participa\xE7\xE3o Acad\xEAmica (Discentes)",
    tipo: "ordinal_faixa",
    grupo: "ambiente",
    dinamico: true,
    escopo: "discentes",
    papel: "indicador",
    permitirComoSerie: true,
    ordem: ["Nunca", "Raramente", "Sim, algumas vezes", "Sim, frequentemente", "Prefiro n\xE3o responder"],
    descricao: "Frequ\xEAncia com que o estudante se sentiu desencorajado a participar de atividades acad\xEAmicas."
  },
  // === Eixo 4: Mecanismos de Denúncia ===
  conhece_mecanismos_denuncia: {
    key: "conhece_mecanismos_denuncia",
    label: "Conhecimento dos Canais de Den\xFAncia",
    tipo: "nominal",
    grupo: "denuncia",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Conhecimento dos canais institucionais para encaminhamento de den\xFAncias (Sim, Em parte, N\xE3o)."
  },
  mecanismos_efetivos: {
    key: "mecanismos_efetivos",
    label: "Efetividade dos Mecanismos de Den\xFAncia",
    tipo: "likert",
    grupo: "denuncia",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_EFETIVIDADE_Q26,
    categoriasSemPontuacao: SEM_PONTUACAO_EFETIVIDADE_Q26,
    descricao: "Percep\xE7\xE3o sobre a efetividade dos canais e procedimentos de den\xFAncia do IFRS."
  },
  mecanismos_resultados_justos: {
    key: "mecanismos_resultados_justos",
    label: "Gera\xE7\xE3o de Resultados Justos nas Den\xFAncias",
    tipo: "likert",
    grupo: "denuncia",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_RESULTADOS_JUSTOS_Q27,
    categoriasSemPontuacao: SEM_PONTUACAO_RESULTADOS_JUSTOS_Q27,
    descricao: "Percep\xE7\xE3o sobre se as den\xFAncias apuradas resultam em desfechos justos e adequados."
  },
  eficacia_capacitacoes: {
    key: "eficacia_capacitacoes",
    label: "Efic\xE1cia de Campanhas e A\xE7\xF5es Formativas",
    tipo: "nominal",
    grupo: "politicas",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Avalia\xE7\xE3o do impacto formativo das campanhas e capacita\xE7\xF5es de diversidade."
  },
  // === Eixo 5: Avaliação dos Núcleos e Assessorias ===
  avaliacao_naaf: {
    key: "avaliacao_naaf",
    label: "Avalia\xE7\xE3o do NAAF",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da atua\xE7\xE3o do N\xFAcleo de A\xE7\xF5es Afirmativas."
  },
  avaliacao_neabi: {
    key: "avaliacao_neabi",
    label: "Avalia\xE7\xE3o do NEABI",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da atua\xE7\xE3o do N\xFAcleo de Estudos Afro-brasileiros e Ind\xEDgenas."
  },
  avaliacao_nepgs: {
    key: "avaliacao_nepgs",
    label: "Avalia\xE7\xE3o do NEPGS",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da atua\xE7\xE3o do N\xFAcleo de Estudos e Pesquisas em G\xEAnero e Sexualidade."
  },
  avaliacao_assessoria_afirmativas: {
    key: "avaliacao_assessoria_afirmativas",
    label: "Assessoria de A\xE7\xF5es Afirmativas, Inclusivas e Diversidade",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da Assessoria de A\xE7\xF5es Afirmativas, Inclusivas e Diversidade."
  },
  avaliacao_assessoria_genero: {
    key: "avaliacao_assessoria_genero",
    label: "Assessoria de G\xEAnero e Sexualidade",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da Assessoria de G\xEAnero e Sexualidade."
  },
  avaliacao_assessoria_etnico_raciais: {
    key: "avaliacao_assessoria_etnico_raciais",
    label: "Assessoria de Rela\xE7\xF5es \xC9tnico-raciais",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da Assessoria de Rela\xE7\xF5es \xC9tnico-raciais."
  },
  // === Eixo 6: Cuidado, Parentalidade e Permanência ===
  responsabilidade_cuidado: {
    key: "responsabilidade_cuidado",
    label: "Responsabilidade de Cuidado",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    escopo: "geral",
    papel: "perfil",
    // Permite cruzar indicadores de carreira/clima/permanência por responsabilidade de cuidado
    permitirComoSerie: true,
    descricao: "Exerc\xEDcio de cuidado com dependentes, crian\xE7as, idosos ou pessoas com defici\xEAncia."
  },
  evitou_candidatura_cuidado: {
    key: "evitou_candidatura_cuidado",
    label: "Deixou de se Candidatar \xE0 Gest\xE3o por Cuidado (Servidores/as)",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    escopo: "servidores",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Se o/a servidor/a j\xE1 deixou de pleitear cargo/fun\xE7\xE3o devido a demandas de cuidado."
  },
  politica_apoio_cuidado: {
    key: "politica_apoio_cuidado",
    label: "Pol\xEDticas de Apoio ao Cuidado no IFRS",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Avalia\xE7\xE3o da exist\xEAncia e sufici\xEAncia de pol\xEDticas de concilia\xE7\xE3o trabalho/estudo e cuidado."
  },
  licenca_maternidade_suficiente: {
    key: "licenca_maternidade_suficiente",
    label: "Sufici\xEAncia da Licen\xE7a Maternidade",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Percep\xE7\xE3o sobre a adequa\xE7\xE3o dos prazos e condi\xE7\xF5es da licen\xE7a maternidade."
  },
  licenca_paternidade_suficiente: {
    key: "licenca_paternidade_suficiente",
    label: "Sufici\xEAncia da Licen\xE7a Paternidade",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Percep\xE7\xE3o sobre a adequa\xE7\xE3o dos prazos e condi\xE7\xF5es da licen\xE7a paternidade."
  },
  apoio_pais_estudantes_suficiente: {
    key: "apoio_pais_estudantes_suficiente",
    label: "Sufici\xEAncia do Apoio a Estudantes com Filhos/as",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    escopo: "geral",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Avalia\xE7\xE3o sobre infraestrutura e suporte para estudantes com filhos/dependentes."
  },
  // === Eixo 7: Carreira, Progressão e Gestão (Servidores) ===
  cargo: {
    key: "cargo",
    label: "Cargo / Carreira do/a Servidor/a (Servidores/as)",
    tipo: "nominal",
    grupo: "carreira",
    dinamico: true,
    escopo: "servidores",
    papel: "perfil",
    permitirComoSerie: true,
    descricao: "Carreira e n\xEDvel do/a servidor/a efetivo/a (Docente, TAE N\xEDveis C, D, E)."
  },
  ocupa_cargo_gestao: {
    key: "ocupa_cargo_gestao",
    label: "Ocupa Cargo de Gest\xE3o (Servidores/as)",
    tipo: "binario_sim_nao",
    grupo: "carreira",
    dinamico: true,
    escopo: "servidores",
    papel: "perfil",
    permitirComoSerie: true,
    descricao: "Declara\xE7\xE3o se o/a servidor/a ocupa cargo de dire\xE7\xE3o ou fun\xE7\xE3o gratificada/comissionada."
  },
  funcao_gestao: {
    key: "funcao_gestao",
    label: "Fun\xE7\xE3o de Gest\xE3o (CD / FG / FCC)",
    tipo: "nominal",
    grupo: "carreira",
    dinamico: false,
    // Sub-pergunta restrita apenas a gestores (n=390), gerando células esparsas em cruzamentos
    escopo: "servidores",
    papel: "indicador",
    permitirComoSerie: false,
    descricao: "Tipologia de fun\xE7\xE3o comissionada exercida (CD, FG, FCC/FUC)."
  },
  adesao_pgd: {
    key: "adesao_pgd",
    label: "Ades\xE3o ao PGD / Teletrabalho (Servidores/as)",
    tipo: "nominal",
    grupo: "carreira",
    dinamico: true,
    escopo: "servidores",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Participa\xE7\xE3o no Programa de Gest\xE3o e Desempenho."
  },
  progressao_merito_nota: {
    key: "progressao_merito_nota",
    label: "Percep\xE7\xE3o de Justi\xE7a na Progress\xE3o (Servidores/as)",
    tipo: "numerico",
    grupo: "carreira",
    dinamico: true,
    escopo: "servidores",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Avalia\xE7\xE3o de 1 (Discordo totalmente) a 5 (Concordo totalmente) sobre equidade na progress\xE3o por m\xE9rito."
  },
  acesso_oportunidades: {
    key: "acesso_oportunidades",
    label: "Acesso Equitativo a Projetos e Bolsas (Servidores/as)",
    tipo: "likert",
    grupo: "carreira",
    dinamico: true,
    escopo: "servidores",
    papel: "indicador",
    permitirComoSerie: true,
    escala: ESCALA_ACESSO_Q23,
    categoriasSemPontuacao: SEM_PONTUACAO_ACESSO_Q23,
    descricao: "Percep\xE7\xE3o sobre equidade na distribui\xE7\xE3o de bolsas, projetos e editais entre servidores/as."
  },
  // === Eixo 8: Estudantes e STEM ===
  nivel_curso: {
    key: "nivel_curso",
    label: "N\xEDvel do Curso (Discentes)",
    tipo: "nominal",
    grupo: "perfil",
    dinamico: true,
    escopo: "discentes",
    papel: "perfil",
    permitirComoSerie: true,
    descricao: "N\xEDvel acad\xEAmico do estudante: T\xE9cnico Integrado, Subsequente, PROEJA, Gradua\xE7\xE3o, P\xF3s-gradua\xE7\xE3o."
  },
  politica_assistencia_estudantil: {
    key: "politica_assistencia_estudantil",
    label: "Efetividade da Assist\xEAncia Estudantil (Discentes)",
    tipo: "nominal",
    grupo: "politicas",
    dinamico: true,
    escopo: "discentes",
    papel: "indicador",
    permitirComoSerie: true,
    descricao: "Avalia\xE7\xE3o discente sobre a efetividade das pol\xEDticas de assist\xEAncia estudantil."
  },
  area_conhecimento: {
    key: "area_conhecimento",
    label: "Grande \xC1rea do Conhecimento CNPq (Discentes)",
    tipo: "nominal",
    grupo: "perfil",
    dinamico: true,
    escopo: "discentes",
    papel: "perfil",
    permitirComoSerie: true,
    descricao: "Grande \xE1rea do curso discente segundo a classifica\xE7\xE3o do CNPq."
  }
};
var CAMPOS_PERMITIDOS_CONSULTA = Object.keys(CATALOGO_CAMPOS);

// src/server/consultaEngine.ts
import { z } from "zod";
var RequisicaoConsultaSchema = z.object({
  campos_eixo: z.array(z.string().refine((k) => CAMPOS_PERMITIDOS_CONSULTA.includes(k), {
    message: "Campo de eixo n\xE3o permitido ou inv\xE1lido"
  })).min(1).max(2),
  campos_cor: z.array(z.string().refine((k) => CAMPOS_PERMITIDOS_CONSULTA.includes(k), {
    message: "Campo de cor n\xE3o permitido ou inv\xE1lido"
  })).max(1).optional(),
  medida: z.object({
    tipo: z.enum([
      "contagem",
      "percentual_no_grupo",
      "percentual_do_total",
      "media",
      "mediana",
      "taxa_sim",
      "percentual_concordancia"
    ]),
    incluir_prefiro_nao_responder: z.boolean().optional().default(true)
  }),
  filtros: z.array(
    z.object({
      campo: z.string().refine((k) => CAMPOS_PERMITIDOS_CONSULTA.includes(k) || k === "area_stem", {
        message: "Campo de filtro n\xE3o permitido"
      }),
      operador: z.enum(["in", "eq", "neq"]),
      valores: z.array(z.string())
    })
  ).max(8).optional()
});
var cacheConsulta = /* @__PURE__ */ new Map();
function expressaoCampoSql(campoKey) {
  if (campoKey === "genero_agrupado" || campoKey === "genero") {
    return SQL_GENERO_NORMALIZADO;
  }
  if (campoKey === "orientacao_sexual") {
    return SQL_ORIENTACAO_NORMALIZADA;
  }
  if (campoKey === "vinculo") {
    return `(
      CASE
        WHEN vinculo ILIKE '%Discente%' THEN 'Discentes'
        WHEN vinculo ILIKE '%Substituto%' THEN 'Docentes Substitutos'
        WHEN vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%' THEN 'Docentes'
        WHEN vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%') THEN 'T\xE9cnicos/as TAEs'
        WHEN vinculo = 'Prefiro n\xE3o responder' THEN 'Prefiro n\xE3o responder'
        ELSE NULL
      END
    )`;
  }
  if (campoKey === "responsabilidade_cuidado") {
    return `(
      CASE
        WHEN responsabilidade_cuidado IN ('N\xE3o', 'N\xE3o tenho responsabilidade de cuidado sobre ningu\xE9m') THEN 'N\xE3o'
        ELSE responsabilidade_cuidado
      END
    )`;
  }
  if (campoKey === "progressao_merito_nota") {
    return `(
      CASE
        WHEN progressao_merito_nota = 5 THEN '5 - Concordo totalmente'
        WHEN progressao_merito_nota = 4 THEN '4 - Concordo parcialmente'
        WHEN progressao_merito_nota = 3 THEN '3 - Neutro'
        WHEN progressao_merito_nota = 2 THEN '2 - Discordo parcialmente'
        WHEN progressao_merito_nota = 1 THEN '1 - Discordo totalmente'
        ELSE NULL
      END
    )`;
  }
  if (campoKey === "area_conhecimento") {
    return `(
      CASE
        WHEN TRIM(LOWER(area_conhecimento)) IN ('todos', 'sei l\xE1', 'nenhuma \xE1rea ainda', 'ensino m\xE9dio', 'eja', 'mestrado', 'multidisciplinar', 'exatas e humanas') THEN NULL
        WHEN area_conhecimento ILIKE '%engenharia%' OR area_conhecimento ILIKE '%computa%' OR area_conhecimento ILIKE '%inform%' OR area_conhecimento ILIKE '%ti%' OR area_conhecimento ILIKE '%ads%' OR area_conhecimento ILIKE '%eletro%' OR area_conhecimento ILIKE '%mec\xE2nica%' OR area_conhecimento ILIKE '%mecanica%' OR area_conhecimento ILIKE '%pol\xEDmero%' OR area_conhecimento ILIKE '%polimero%' OR area_conhecimento ILIKE '%pl\xE1stico%' OR area_conhecimento ILIKE '%seguran\xE7a do trabalho%' OR area_conhecimento ILIKE '%sistemas%' OR area_conhecimento ILIKE '%tecnolog%' OR area_conhecimento ILIKE '%inova\xE7\xE3o%' THEN 'Engenharias e Tecnologia'
        WHEN area_conhecimento ILIKE '%exata%' OR area_conhecimento ILIKE '%f\xEDsica%' OR area_conhecimento ILIKE '%fisica%' OR area_conhecimento ILIKE '%qu\xEDmica%' OR area_conhecimento ILIKE '%quimica%' OR area_conhecimento ILIKE '%matem\xE1t%' OR area_conhecimento ILIKE '%matemat%' OR area_conhecimento ILIKE '%ci\xEAncias da natureza%' OR area_conhecimento ILIKE '%ciencias da natureza%' OR area_conhecimento ILIKE '%ci\xEAncias da natura%' OR area_conhecimento ILIKE '%ci\xEAncias naturais%' THEN 'Ci\xEAncias Exatas e da Terra'
        WHEN area_conhecimento ILIKE '%agr\xE1r%' OR area_conhecimento ILIKE '%agrar%' OR area_conhecimento ILIKE '%agro%' OR area_conhecimento ILIKE '%zootec%' OR area_conhecimento ILIKE '%viticult%' OR area_conhecimento ILIKE '%meio ambiente%' OR area_conhecimento ILIKE '%meia ambiente%' OR area_conhecimento ILIKE '%ambiental%' OR area_conhecimento ILIKE '%panifica%' THEN 'Ci\xEAncias Agr\xE1rias'
        WHEN area_conhecimento ILIKE '%administra%' OR area_conhecimento ILIKE '%adm%' OR area_conhecimento ILIKE '%gest\xE3o%' OR area_conhecimento ILIKE '%gestao%' OR area_conhecimento ILIKE '%processo%' OR area_conhecimento ILIKE '%com\xE9rcio%' OR area_conhecimento ILIKE '%comercio%' OR area_conhecimento ILIKE '%vendas%' OR area_conhecimento ILIKE '%log\xEDstica%' OR area_conhecimento ILIKE '%logistica%' OR area_conhecimento ILIKE '%marketing%' OR area_conhecimento ILIKE '%secretariado%' OR area_conhecimento ILIKE '%informa\xE7\xE3o%' OR area_conhecimento ILIKE '%biblioteconomia%' OR area_conhecimento ILIKE '%neg\xF3cio%' OR area_conhecimento ILIKE '%negocio%' OR TRIM(LOWER(area_conhecimento)) IN ('tpg', 'lazer') THEN 'Ci\xEAncias Sociais Aplicadas'
        WHEN area_conhecimento ILIKE '%human%' OR area_conhecimento ILIKE '%pedagog%' OR area_conhecimento ILIKE '%educa%' OR area_conhecimento ILIKE '%profept%' OR area_conhecimento ILIKE '%ensino%' THEN 'Ci\xEAncias Humanas'
        WHEN area_conhecimento ILIKE '%letras%' OR area_conhecimento ILIKE '%artes%' OR area_conhecimento ILIKE '%design%' OR area_conhecimento ILIKE '%moda%' OR area_conhecimento ILIKE '%modelagem%' OR area_conhecimento ILIKE '%cinema%' OR area_conhecimento ILIKE '%multim\xEDdia%' OR area_conhecimento ILIKE '%multimidia%' OR area_conhecimento ILIKE '%audiovisual%' THEN 'Lingu\xEDstica, Letras e Artes'
        WHEN area_conhecimento ILIKE '%biolog%' OR area_conhecimento ILIKE '%biotec%' OR area_conhecimento ILIKE '%boitec%' THEN 'Ci\xEAncias Biol\xF3gicas'
        WHEN area_conhecimento ILIKE '%sa\xFAde%' OR area_conhecimento ILIKE '%saude%' OR area_conhecimento ILIKE '%enferm%' OR area_conhecimento ILIKE '%idoso%' THEN 'Ci\xEAncias da Sa\xFAde'
        WHEN area_conhecimento = 'Prefiro n\xE3o responder' THEN 'Prefiro n\xE3o responder'
        ELSE NULL
      END
    )`;
  }
  return `"${campoKey}"`;
}
function expressaoNotaLikert(campoKey) {
  const campo = CATALOGO_CAMPOS[campoKey];
  if (!campo) return null;
  if (campo.key === "progressao_merito_nota") {
    return "progressao_merito_nota::float";
  }
  if (campo.escala) {
    const cases = Object.entries(campo.escala).map(([val, nota]) => `WHEN ${expressaoCampoSql(campoKey)} = '${val.replace(/'/g, "''")}' THEN ${nota}`).join(" ");
    return `(CASE ${cases} ELSE NULL END)::float`;
  }
  return null;
}
async function executarConsulta(req) {
  const cacheKey = JSON.stringify(req);
  const now = Date.now();
  const cached = cacheConsulta.get(cacheKey);
  if (cached && cached.expira > now) {
    return cached.data;
  }
  const pool = getDbPool();
  const params = [];
  const whereClauses = [SQL_FILTRO_SEM_TERCEIRIZADOS];
  if (req.filtros && req.filtros.length > 0) {
    for (const f of req.filtros) {
      if (f.campo === "area_stem") {
        const areaSql = expressaoCampoSql("area_conhecimento");
        if (f.valores.includes("stem")) {
          whereClauses.push(`${areaSql} IN ('Engenharias e Tecnologia', 'Ci\xEAncias Exatas e da Terra')`);
        } else if (f.valores.includes("nao_stem")) {
          whereClauses.push(`${areaSql} NOT IN ('Engenharias e Tecnologia', 'Ci\xEAncias Exatas e da Terra') AND ${areaSql} IS NOT NULL`);
        }
        continue;
      }
      const colExpr = expressaoCampoSql(f.campo);
      if (f.operador === "in" && f.valores.length > 0) {
        const placeholders = f.valores.map((v) => {
          params.push(v);
          return `$${params.length}`;
        });
        whereClauses.push(`${colExpr} IN (${placeholders.join(", ")})`);
      } else if (f.operador === "eq" && f.valores.length > 0) {
        params.push(f.valores[0]);
        whereClauses.push(`${colExpr} = $${params.length}`);
      } else if (f.operador === "neq" && f.valores.length > 0) {
        params.push(f.valores[0]);
        whereClauses.push(`${colExpr} != $${params.length}`);
      }
    }
  }
  const campoEixo1 = req.campos_eixo[0];
  const campoEixo2 = req.campos_eixo[1] || null;
  const campoCor = req.campos_cor?.[0] || null;
  const camposEnvolvidos = [campoEixo1, campoEixo2, campoCor].filter(Boolean);
  for (const c of camposEnvolvidos) {
    const colExpr = expressaoCampoSql(c);
    whereClauses.push(`${colExpr} IS NOT NULL`);
  }
  if (req.medida.incluir_prefiro_nao_responder === false) {
    for (const c of camposEnvolvidos) {
      const colExpr = expressaoCampoSql(c);
      whereClauses.push(`${colExpr} != 'Prefiro n\xE3o responder'`);
    }
  }
  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const exprEixo1 = expressaoCampoSql(campoEixo1);
  const exprEixo2 = campoEixo2 ? expressaoCampoSql(campoEixo2) : "NULL";
  const exprCor = campoCor ? expressaoCampoSql(campoCor) : "NULL";
  const selectCols = [
    `${exprEixo1} AS eixo_1`,
    campoEixo2 ? `${exprEixo2} AS eixo_2` : "NULL::text AS eixo_2",
    campoCor ? `${exprCor} AS cor` : "NULL::text AS cor"
  ];
  const groupByCols = [`${exprEixo1}`];
  if (campoEixo2) groupByCols.push(`${exprEixo2}`);
  if (campoCor) groupByCols.push(`${exprCor}`);
  let metricExpr = "count(*)::int AS n, count(*)::float AS valor";
  let innerWhere = whereSql;
  if (req.medida.tipo === "media") {
    const likertExpr = expressaoNotaLikert(campoEixo1);
    if (!likertExpr) {
      throw new Error(`O campo ${campoEixo1} n\xE3o possui escala num\xE9rica/likert para m\xE9dia.`);
    }
    metricExpr = `count(*)::int AS n, coalesce(round(avg(${likertExpr})::numeric, 2), 0)::float AS valor`;
  } else if (req.medida.tipo === "mediana") {
    const likertExpr = expressaoNotaLikert(campoEixo1);
    if (!likertExpr) {
      throw new Error(`O campo ${campoEixo1} n\xE3o possui escala para c\xE1lculo de mediana.`);
    }
    metricExpr = `count(*)::int AS n, coalesce(round(percentile_cont(0.5) within group (order by ${likertExpr})::numeric, 2), 0)::float AS valor`;
  } else if (req.medida.tipo === "taxa_sim") {
    metricExpr = `count(*)::int AS n, round((count(*) filter (where ${exprEixo1} = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float AS valor`;
  } else if (req.medida.tipo === "percentual_concordancia") {
    metricExpr = `count(*)::int AS n, round((count(*) filter (where ${exprEixo1} IN ('Concordo', 'Concordo Totalmente')) * 100.0 / nullif(count(*), 0))::numeric, 1)::float AS valor`;
  }
  const sql = `
    SELECT
      ${selectCols.join(", ")},
      ${metricExpr}
    FROM public.respostas_pgs
    ${innerWhere}
    GROUP BY ${groupByCols.join(", ")}
    ORDER BY valor DESC, n DESC
    LIMIT 120
  `;
  const totalSql = `
    SELECT
      count(*)::int as n_filtrado
    FROM public.respostas_pgs
    ${innerWhere}
  `;
  const [resLinhas, resTotal] = await Promise.all([
    pool.query(sql, params),
    pool.query(totalSql, params)
  ]);
  const nFiltrado = resTotal.rows[0]?.n_filtrado ?? 0;
  const avisos = [];
  const totaisGrupo = {};
  for (const r of resLinhas.rows) {
    const gKey = String(r.eixo_1 ?? "");
    totaisGrupo[gKey] = (totaisGrupo[gKey] || 0) + Number(r.n || 0);
  }
  let pequenasAmostras = 0;
  const linhas = resLinhas.rows.map((row) => {
    const n = Number(row.n || 0);
    const nGrupo = totaisGrupo[String(row.eixo_1 ?? "")] || nFiltrado;
    let valor = Number(row.valor || 0);
    let percentual = nFiltrado > 0 ? Number((n / nFiltrado * 100).toFixed(1)) : 0;
    if (req.medida.tipo === "percentual_no_grupo") {
      valor = nGrupo > 0 ? Number((n / nGrupo * 100).toFixed(1)) : 0;
      percentual = valor;
    } else if (req.medida.tipo === "percentual_do_total") {
      valor = percentual;
    }
    if (n > 0 && n < 10) {
      pequenasAmostras++;
    }
    return {
      eixo_1: row.eixo_1 != null ? String(row.eixo_1) : null,
      eixo_2: row.eixo_2 != null ? String(row.eixo_2) : null,
      cor: row.cor != null ? String(row.cor) : null,
      valor,
      n,
      n_grupo: nGrupo,
      percentual
    };
  });
  if (pequenasAmostras > 0) {
    avisos.push(`Amostra pequena: ${pequenasAmostras} categoria(s) possuem menos de 10 respondentes.`);
  }
  const resposta = {
    linhas,
    n_total: 4857,
    n_filtrado: nFiltrado,
    base_descricao: `Respondentes com filtros aplicados (total: ${nFiltrado.toLocaleString("pt-BR")})`,
    avisos,
    metadados: {
      campo_eixo_1: campoEixo1,
      campo_eixo_2: campoEixo2 || void 0,
      campo_cor: campoCor || void 0,
      medida_tipo: req.medida.tipo
    }
  };
  cacheConsulta.set(cacheKey, {
    expira: now + 5 * 60 * 1e3,
    data: resposta
  });
  return resposta;
}

// src/lib/areaMap.ts
var GRANDES_AREAS_CNPQ = [
  "Engenharias e Tecnologia",
  "Ci\xEAncias Exatas e da Terra",
  "Ci\xEAncias Sociais Aplicadas",
  "Ci\xEAncias Agr\xE1rias",
  "Ci\xEAncias Humanas",
  "Lingu\xEDstica, Letras e Artes",
  "Ci\xEAncias Biol\xF3gicas",
  "Ci\xEAncias da Sa\xFAde",
  "N\xE3o classificada",
  "Prefiro n\xE3o responder"
];
var MAPA_TEXTOS_AREA = {
  // Áreas principais diretas
  "engenharias e tecnologia": "Engenharias e Tecnologia",
  "ci\xEAncias exatas e da terra": "Ci\xEAncias Exatas e da Terra",
  "ciencias exatas e da terra": "Ci\xEAncias Exatas e da Terra",
  "ci\xEAncias sociais aplicadas": "Ci\xEAncias Sociais Aplicadas",
  "ciencias sociais aplicadas": "Ci\xEAncias Sociais Aplicadas",
  "ci\xEAncia social aplicada": "Ci\xEAncias Sociais Aplicadas",
  "ci\xEAncias agr\xE1rias": "Ci\xEAncias Agr\xE1rias",
  "ciencias agrarias": "Ci\xEAncias Agr\xE1rias",
  "ci\xEAncias humanas": "Ci\xEAncias Humanas",
  "ciencias humanas": "Ci\xEAncias Humanas",
  "lingu\xEDstica, letras e artes": "Lingu\xEDstica, Letras e Artes",
  "linguistica, letras e artes": "Lingu\xEDstica, Letras e Artes",
  "ci\xEAncias biol\xF3gicas": "Ci\xEAncias Biol\xF3gicas",
  "ciencias biologicas": "Ci\xEAncias Biol\xF3gicas",
  "ci\xEAncias da sa\xFAde": "Ci\xEAncias da Sa\xFAde",
  "ciencias da saude": "Ci\xEAncias da Sa\xFAde",
  "prefiro n\xE3o responder": "Prefiro n\xE3o responder",
  // Administração e Gestão -> Ciências Sociais Aplicadas
  "administra\xE7\xE3o": "Ci\xEAncias Sociais Aplicadas",
  "administracao": "Ci\xEAncias Sociais Aplicadas",
  "adm": "Ci\xEAncias Sociais Aplicadas",
  "administra\xE7\xE3o de empresas": "Ci\xEAncias Sociais Aplicadas",
  "administra\xE7\xE3o de empresa": "Ci\xEAncias Sociais Aplicadas",
  "bacharelado administracao": "Ci\xEAncias Sociais Aplicadas",
  "gest\xE3o e neg\xF3cios": "Ci\xEAncias Sociais Aplicadas",
  "gestao e negocios": "Ci\xEAncias Sociais Aplicadas",
  "gest\xE3o empresarial": "Ci\xEAncias Sociais Aplicadas",
  "gest\xE3o e neg\xF3cio": "Ci\xEAncias Sociais Aplicadas",
  "processos gerenciais": "Ci\xEAncias Sociais Aplicadas",
  "processo gerencial": "Ci\xEAncias Sociais Aplicadas",
  "processo gerenciais": "Ci\xEAncias Sociais Aplicadas",
  "eixo de processos gerenciais e com\xE9rcio": "Ci\xEAncias Sociais Aplicadas",
  "eixo peocessos gerenciais": "Ci\xEAncias Sociais Aplicadas",
  "com\xE9rcio": "Ci\xEAncias Sociais Aplicadas",
  "comercio": "Ci\xEAncias Sociais Aplicadas",
  "t\xE9cnico em com\xE9rcio": "Ci\xEAncias Sociais Aplicadas",
  "tecnico em comercio": "Ci\xEAncias Sociais Aplicadas",
  "t\xE9cnico de com\xE9rcio": "Ci\xEAncias Sociais Aplicadas",
  "pro eja com\xE9rcio": "Ci\xEAncias Sociais Aplicadas",
  "t\xE9cnico em vendas": "Ci\xEAncias Sociais Aplicadas",
  "log\xEDstica": "Ci\xEAncias Sociais Aplicadas",
  "logistica": "Ci\xEAncias Sociais Aplicadas",
  "tecnologia em log\xEDstica": "Ci\xEAncias Sociais Aplicadas",
  "marketing": "Ci\xEAncias Sociais Aplicadas",
  "secretariado": "Ci\xEAncias Sociais Aplicadas",
  "ci\xEAncias da informa\xE7\xE3o": "Ci\xEAncias Sociais Aplicadas",
  "ci\xEAncia da informa\xE7\xE3o": "Ci\xEAncias Sociais Aplicadas",
  "biblioteconomia": "Ci\xEAncias Sociais Aplicadas",
  "neg\xF3cios e gast\xE3o": "Ci\xEAncias Sociais Aplicadas",
  "administra\xE7\xE3o e mat\xE9rias gerais": "Ci\xEAncias Sociais Aplicadas",
  "administra\xE7\xE3o, gest\xE3o": "Ci\xEAncias Sociais Aplicadas",
  "administra\xE7\xE3o do com\xE9rcio": "Ci\xEAncias Sociais Aplicadas",
  "tecnico em administra\xE7\xE3o": "Ci\xEAncias Sociais Aplicadas",
  "t\xE9cnico em administra\xE7\xE3o": "Ci\xEAncias Sociais Aplicadas",
  "tec em administra\xE7\xE3o": "Ci\xEAncias Sociais Aplicadas",
  "t\xE9cnico de administra\xE7\xE2o": "Ci\xEAncias Sociais Aplicadas",
  "t\xE9cnico de administra\xE7\xE3o": "Ci\xEAncias Sociais Aplicadas",
  "administra\xE7\xE3o.": "Ci\xEAncias Sociais Aplicadas",
  "gest\xE3o": "Ci\xEAncias Sociais Aplicadas",
  "gestao": "Ci\xEAncias Sociais Aplicadas",
  "gest\xE3o de processos": "Ci\xEAncias Sociais Aplicadas",
  "processos gerencias": "Ci\xEAncias Sociais Aplicadas",
  "gest\xE3o e negocios": "Ci\xEAncias Sociais Aplicadas",
  "tpg": "Ci\xEAncias Sociais Aplicadas",
  "lazer": "Ci\xEAncias Sociais Aplicadas",
  "n\xE3o sei qual \xE9 para a administra\xE7\xE3o": "Ci\xEAncias Sociais Aplicadas",
  // Educação e Pedagogia -> Ciências Humanas
  "pedagogia": "Ci\xEAncias Humanas",
  "licenciatura em pedagogia": "Ci\xEAncias Humanas",
  "licenciatura pedagogia": "Ci\xEAncias Humanas",
  "pedagogia docencia": "Ci\xEAncias Humanas",
  "educa\xE7\xE3o": "Ci\xEAncias Humanas",
  "educacao": "Ci\xEAncias Humanas",
  "profept": "Ci\xEAncias Humanas",
  "multidisciplinar - ensino": "Ci\xEAncias Humanas",
  "teorias e metodologias da educa\xE7\xE3o": "Ci\xEAncias Humanas",
  "t\xE9cnico tradu\xE7\xE3o interprete libras / pedagogia licenciatura": "Ci\xEAncias Humanas",
  "ci\xEAncias ambientais e sociais": "Ci\xEAncias Humanas",
  // Informática e TI -> Engenharias e Tecnologia
  "inform\xE1tica": "Engenharias e Tecnologia",
  "informatica": "Engenharias e Tecnologia",
  "ti": "Engenharias e Tecnologia",
  "computa\xE7\xE3o": "Engenharias e Tecnologia",
  "ci\xEAncia da computa\xE7\xE3o": "Engenharias e Tecnologia",
  "sistemas de informa\xE7\xE3o": "Engenharias e Tecnologia",
  "sistemas": "Engenharias e Tecnologia",
  "ads": "Engenharias e Tecnologia",
  "analise e desenvolvimento de sistemas": "Engenharias e Tecnologia",
  "t\xE9cnico em inform\xE1tica": "Engenharias e Tecnologia",
  "t\xE9cnico de inform\xE1tica para internet": "Engenharias e Tecnologia",
  "inform\xE1tica para internet": "Engenharias e Tecnologia",
  "inform\xE1tica para internet e l\xF3gica de programa\xE7\xE3o": "Engenharias e Tecnologia",
  "inform\xE1tica na educa\xE7\xE3o": "Engenharias e Tecnologia",
  "p\xF3s-gradua\xE7\xE3o em intelig\xEAncia artificial na educa\xE7\xE3o": "Engenharias e Tecnologia",
  "educa\xE7\xE3o e tecnologia": "Engenharias e Tecnologia",
  "desenvolvimento e inova\xE7\xE3o": "Engenharias e Tecnologia",
  // Exatas e Engenharias industriais -> Ciências Exatas e da Terra / Engenharias
  "qu\xEDmica": "Ci\xEAncias Exatas e da Terra",
  "quimica": "Ci\xEAncias Exatas e da Terra",
  "t\xE9cnico em qu\xEDmica": "Ci\xEAncias Exatas e da Terra",
  "matem\xE1tica": "Ci\xEAncias Exatas e da Terra",
  "ci\xEAncias da natureza": "Ci\xEAncias Exatas e da Terra",
  "ci\xEAncias da natura": "Ci\xEAncias Exatas e da Terra",
  "ci\xEAncias da natureza:biologia e qu\xEDmica": "Ci\xEAncias Exatas e da Terra",
  "ci\xEAncias naturais": "Ci\xEAncias Exatas e da Terra",
  "eletromec\xE2nica": "Engenharias e Tecnologia",
  "eletrot\xE9cnica": "Engenharias e Tecnologia",
  "mec\xE2nica": "Engenharias e Tecnologia",
  "pol\xEDmeros": "Engenharias e Tecnologia",
  "pol\xEDmero": "Engenharias e Tecnologia",
  "pl\xE1sticos": "Engenharias e Tecnologia",
  "tecnologia": "Engenharias e Tecnologia",
  "tecnologo": "Engenharias e Tecnologia",
  "seguran\xE7a do trabalho": "Engenharias e Tecnologia",
  // Artes e Comunicação -> Linguística, Letras e Artes
  "artes": "Lingu\xEDstica, Letras e Artes",
  "design": "Lingu\xEDstica, Letras e Artes",
  "design gr\xE1fico": "Lingu\xEDstica, Letras e Artes",
  "design grafico": "Lingu\xEDstica, Letras e Artes",
  "designer de moda": "Lingu\xEDstica, Letras e Artes",
  "design de moda": "Lingu\xEDstica, Letras e Artes",
  "moda": "Lingu\xEDstica, Letras e Artes",
  "modelagem": "Lingu\xEDstica, Letras e Artes",
  "modelagem de vestuario": "Lingu\xEDstica, Letras e Artes",
  "modelagem e vestu\xE1rio": "Lingu\xEDstica, Letras e Artes",
  "multimidia": "Lingu\xEDstica, Letras e Artes",
  "multim\xEDdia": "Lingu\xEDstica, Letras e Artes",
  "cinema": "Lingu\xEDstica, Letras e Artes",
  "cinema/audiovisual": "Lingu\xEDstica, Letras e Artes",
  "comunica\xE7\xE3o e audiovisual": "Lingu\xEDstica, Letras e Artes",
  // Ciências Agrárias
  "agropecu\xE1ria": "Ci\xEAncias Agr\xE1rias",
  "agroecologia": "Ci\xEAncias Agr\xE1rias",
  "agrocologia": "Ci\xEAncias Agr\xE1rias",
  "agronomia": "Ci\xEAncias Agr\xE1rias",
  "agro": "Ci\xEAncias Agr\xE1rias",
  "zootecnia": "Ci\xEAncias Agr\xE1rias",
  "bacharelado em zootecnia.": "Ci\xEAncias Agr\xE1rias",
  "tec. viticultura e enologia": "Ci\xEAncias Agr\xE1rias",
  "viticultura e enologia": "Ci\xEAncias Agr\xE1rias",
  // Meio Ambiente e Biologia
  "gest\xE3o ambiental": "Ci\xEAncias Agr\xE1rias",
  "gestao ambiental": "Ci\xEAncias Agr\xE1rias",
  "meio ambiente": "Ci\xEAncias Agr\xE1rias",
  "meia ambiente": "Ci\xEAncias Agr\xE1rias",
  "ambiental": "Ci\xEAncias Agr\xE1rias",
  "t\xE9cnico em meio ambiente": "Ci\xEAncias Agr\xE1rias",
  "tecn\xF3logo em gest\xE3o ambiental": "Ci\xEAncias Agr\xE1rias",
  "meio ambiente e sustentabilidade": "Ci\xEAncias Agr\xE1rias",
  "ci\xEAncias ambientais": "Ci\xEAncias Agr\xE1rias",
  "ci\xEAncias ambientais (meio ambiente)": "Ci\xEAncias Agr\xE1rias",
  "gest\xE3o ambiental, ambiente, sa\xFAde e sociedade, educa\xE7\xE3o ambiental etc": "Ci\xEAncias Agr\xE1rias",
  "panifica\xE7\xE3o": "Ci\xEAncias Agr\xE1rias",
  "panificacao": "Ci\xEAncias Agr\xE1rias",
  "biotecnologia": "Ci\xEAncias Biol\xF3gicas",
  "boitecnologia": "Ci\xEAncias Biol\xF3gicas",
  "licenciatura biologia e qu\xEDmica": "Ci\xEAncias Biol\xF3gicas",
  // Saúde
  "t\xE9cnico enfermagem": "Ci\xEAncias da Sa\xFAde",
  "cuidador de idosos": "Ci\xEAncias da Sa\xFAde"
};

// src/server/dashboardStats.ts
function montarWhereFiltrosGlobais(filtros) {
  const conditions = [SQL_FILTRO_SEM_TERCEIRIZADOS];
  const params = [];
  if (!filtros) {
    return { whereSql: `WHERE ${conditions.join(" AND ")}`, params };
  }
  const addInCondition = (colExpr, values) => {
    if (values && values.length > 0) {
      const placeholders = values.map((v) => {
        params.push(v);
        return `$${params.length}`;
      });
      conditions.push(`${colExpr} IN (${placeholders.join(", ")})`);
    }
  };
  addInCondition("campus", filtros.campus);
  addInCondition("cor_raca", filtros.cor_raca);
  addInCondition("faixa_etaria", filtros.faixa_etaria);
  addInCondition("pcd", filtros.pcd);
  addInCondition(SQL_ORIENTACAO_NORMALIZADA, filtros.orientacao_sexual);
  addInCondition("ocupa_cargo_gestao", filtros.ocupa_cargo_gestao);
  addInCondition("responsabilidade_cuidado", filtros.responsabilidade_cuidado);
  addInCondition(SQL_GENERO_NORMALIZADO, filtros.genero_detalhado);
  if (filtros.vinculo && filtros.vinculo.length > 0) {
    const subConds = filtros.vinculo.map((v) => {
      params.push(`%${v}%`);
      return `vinculo ILIKE $${params.length}`;
    });
    conditions.push(`(${subConds.join(" OR ")})`);
  }
  if (filtros.genero_agrupado && filtros.genero_agrupado.length > 0) {
    addInCondition(SQL_GENERO_NORMALIZADO, filtros.genero_agrupado);
  }
  if (filtros.area_stem && filtros.area_stem !== "todos") {
    const stemAreas = `('Engenharias e Tecnologia', 'Ci\xEAncias Exatas e da Terra')`;
    const areaExpr = `(
      CASE
        WHEN area_conhecimento ILIKE '%engenharia%' OR area_conhecimento ILIKE '%computa%' OR area_conhecimento ILIKE '%inform%' OR area_conhecimento ILIKE '%ti%' OR area_conhecimento ILIKE '%eletro%' OR area_conhecimento ILIKE '%mec\xE2nica%' THEN 'Engenharias e Tecnologia'
        WHEN area_conhecimento ILIKE '%exata%' OR area_conhecimento ILIKE '%f\xEDsica%' OR area_conhecimento ILIKE '%qu\xEDmica%' OR area_conhecimento ILIKE '%matem\xE1t%' THEN 'Ci\xEAncias Exatas e da Terra'
        ELSE 'Outras'
      END
    )`;
    if (filtros.area_stem === "stem") {
      conditions.push(`${areaExpr} IN ${stemAreas}`);
    } else {
      conditions.push(`${areaExpr} NOT IN ${stemAreas}`);
    }
  }
  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereSql, params };
}
function whereComAnd(whereSql, extraCondition) {
  if (whereSql && whereSql.trim().length > 0) {
    return `${whereSql} AND ${extraCondition}`;
  }
  return `WHERE ${extraCondition}`;
}
async function obterKpisVisaoGeral(filtros) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);
  const sql = `
    SELECT
      count(*)::int as total_respondentes,
      count(DISTINCT campus) FILTER (WHERE campus IS NOT NULL AND campus != 'Prefiro n\xE3o responder')::int as unidades_validas,
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%')::int as total_discentes,
      count(*) FILTER (WHERE vinculo ILIKE '%Efetivo%')::int as total_servidores_efetivos,
      count(*) FILTER (WHERE vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%')::int as total_docentes_efetivos,
      count(*) FILTER (WHERE vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%'))::int as total_taes_efetivos,
      count(*) FILTER (WHERE vinculo ILIKE '%Substituto%')::int as total_substitutos,
      count(*) FILTER (WHERE vinculo ILIKE '%Efetivo%' OR vinculo ILIKE '%Substituto%')::int as total_servidores,
      count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim')::int as vitimizacao_sim,
      count(*) FILTER (WHERE violencia_raca = 'Sim')::int as violencia_raca_sim,
      count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as violencia_genero_sim,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Sim')::int as conhece_denuncia_sim,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Em parte')::int as conhece_denuncia_em_parte,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'N\xE3o' OR (conhece_mecanismos_denuncia LIKE 'N%o' AND conhece_mecanismos_denuncia != 'N\xE3o sei'))::int as conhece_denuncia_nao,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'N\xE3o sei')::int as conhece_denuncia_nao_sei,
      count(*) FILTER (WHERE mecanismos_efetivos = 'Sim, s\xE3o muito efetivos')::int as efetividade_muito,
      count(*) FILTER (WHERE mecanismos_efetivos = 'S\xE3o parcialmente efetivos')::int as efetividade_parcial,
      count(*) FILTER (WHERE mecanismos_efetivos = 'S\xE3o pouco efetivos')::int as efetividade_pouco,
      count(*) FILTER (WHERE mecanismos_efetivos = 'N\xE3o s\xE3o efetivos')::int as efetividade_nao,
      count(*) FILTER (WHERE mecanismos_efetivos = 'N\xE3o sei avaliar')::int as efetividade_nao_sei,
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%' AND desencorajado_participacao IN ('Sim, algumas vezes', 'Sim, frequentemente'))::int as desencorajado_discentes,
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%' AND desencorajado_participacao IS NOT NULL)::int as base_desencorajado_discentes,
      count(*) FILTER (WHERE responsabilidade_cuidado = 'Sim')::int as cuidado_principal,
      count(*) FILTER (WHERE responsabilidade_cuidado = 'Divido a responsabilidade igualmente com outra(s) pessoa(s)')::int as cuidado_dividido,
      avg(CASE
        WHEN seguranca_expressao_opiniao = 'Concordo Totalmente' THEN 5
        WHEN seguranca_expressao_opiniao = 'Concordo' THEN 4
        WHEN seguranca_expressao_opiniao = 'N\xE3o concordo nem discordo' THEN 3
        WHEN seguranca_expressao_opiniao = 'Discordo' THEN 2
        WHEN seguranca_expressao_opiniao = 'Discordo Totalmente' THEN 1
        ELSE NULL END)::float as media_q24a,
      avg(CASE
        WHEN ambiente_seguro_respeitoso = 'Concordo Totalmente' THEN 5
        WHEN ambiente_seguro_respeitoso = 'Concordo' THEN 4
        WHEN ambiente_seguro_respeitoso = 'N\xE3o concordo nem discordo' THEN 3
        WHEN ambiente_seguro_respeitoso = 'Discordo' THEN 2
        WHEN ambiente_seguro_respeitoso = 'Discordo Totalmente' THEN 1
        ELSE NULL END)::float as media_q24b,
      avg(CASE
        WHEN inclusao_pessoas_trans = 'Concordo Totalmente' THEN 5
        WHEN inclusao_pessoas_trans = 'Concordo' THEN 4
        WHEN inclusao_pessoas_trans = 'N\xE3o concordo nem discordo' THEN 3
        WHEN inclusao_pessoas_trans = 'Discordo' THEN 2
        WHEN inclusao_pessoas_trans = 'Discordo Totalmente' THEN 1
        ELSE NULL END)::float as media_q24c,
      avg(CASE
        WHEN maternidade_impacto_carreira = 'Concordo Totalmente' THEN 1
        WHEN maternidade_impacto_carreira = 'Concordo' THEN 2
        WHEN maternidade_impacto_carreira = 'N\xE3o concordo nem discordo' THEN 3
        WHEN maternidade_impacto_carreira = 'Discordo' THEN 4
        WHEN maternidade_impacto_carreira = 'Discordo Totalmente' THEN 5
        ELSE NULL END)::float as media_q24d_invertido,
      avg(CASE
        WHEN iniciativas_celebrar_diversidade = 'Concordo Totalmente' THEN 5
        WHEN iniciativas_celebrar_diversidade = 'Concordo' THEN 4
        WHEN iniciativas_celebrar_diversidade = 'N\xE3o concordo nem discordo' THEN 3
        WHEN iniciativas_celebrar_diversidade = 'Discordo' THEN 2
        WHEN iniciativas_celebrar_diversidade = 'Discordo Totalmente' THEN 1
        ELSE NULL END)::float as media_q24e,
      avg(CASE
        WHEN curriculos_principios_igualdade = 'Concordo Totalmente' THEN 5
        WHEN curriculos_principios_igualdade = 'Concordo' THEN 4
        WHEN curriculos_principios_igualdade = 'N\xE3o concordo nem discordo' THEN 3
        WHEN curriculos_principios_igualdade = 'Discordo' THEN 2
        WHEN curriculos_principios_igualdade = 'Discordo Totalmente' THEN 1
        ELSE NULL END)::float as media_q24f
    FROM public.respostas_pgs
    ${whereSql}
  `;
  const campusSql = `
    SELECT
      campus,
      CASE
        WHEN vinculo ILIKE '%Discente%' THEN 'Discente'
        WHEN vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%' THEN 'Docente'
        WHEN vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%') THEN 'T\xE9cnico/a TAE'
        WHEN vinculo ILIKE '%Substituto%' THEN 'Docente Substituto'
        ELSE 'Prefiro n\xE3o responder'
      END as vinculo_simplificado,
      ${SQL_GENERO_NORMALIZADO} as genero,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as total
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "campus IS NOT NULL")}
    GROUP BY campus, vinculo_simplificado, ${SQL_GENERO_NORMALIZADO}, ${SQL_IDADE_AGRUPADA}
    ORDER BY campus ASC
  `;
  const [resKpi, resCampus] = await Promise.all([
    pool.query(sql, params),
    pool.query(campusSql, params)
  ]);
  const row = resKpi.rows[0] || {};
  const n = row.total_respondentes || 0;
  const q24Medias = [
    row.media_q24a,
    row.media_q24b,
    row.media_q24c,
    row.media_q24d_invertido,
    row.media_q24e,
    row.media_q24f
  ].filter((v) => v !== null && !isNaN(v));
  const climaMedia = q24Medias.length > 0 ? q24Medias.reduce((a, b) => a + b, 0) / q24Medias.length : 0;
  const indiceClima = normalizarIndice100(climaMedia, 1, 5);
  const conheceTotal = (row.conhece_denuncia_sim || 0) + (row.conhece_denuncia_em_parte || 0);
  const naoConheceTotal = (row.conhece_denuncia_nao || 0) + (row.conhece_denuncia_nao_sei || 0);
  const efetivosTotal = (row.efetividade_muito || 0) + (row.efetividade_parcial || 0);
  const poucoOuNaoEfetivosTotal = (row.efetividade_pouco || 0) + (row.efetividade_nao || 0);
  const baseAvaliouEfetividade = efetivosTotal + poucoOuNaoEfetivosTotal;
  const cuidadoTotal = (row.cuidado_principal || 0) + (row.cuidado_dividido || 0);
  return {
    n_total: 4857,
    n_filtrado: n,
    kpis: {
      total_respondentes: n,
      unidades_validas: row.unidades_validas || 18,
      discentes: { n: row.total_discentes, pct: n > 0 ? row.total_discentes / n * 100 : 0 },
      servidores_efetivos: { n: row.total_servidores_efetivos, pct: n > 0 ? row.total_servidores_efetivos / n * 100 : 0 },
      docentes_efetivos: { n: row.total_docentes_efetivos, pct: n > 0 ? row.total_docentes_efetivos / n * 100 : 0 },
      taes_efetivos: { n: row.total_taes_efetivos, pct: n > 0 ? row.total_taes_efetivos / n * 100 : 0 },
      docentes_substitutos: { n: row.total_substitutos, pct: n > 0 ? row.total_substitutos / n * 100 : 0 },
      servidores_total: { n: row.total_servidores, pct: n > 0 ? row.total_servidores / n * 100 : 0 },
      taxa_vitimizacao: {
        pct: n > 0 ? Number((row.vitimizacao_sim / n * 100).toFixed(1)) : 0,
        n_sim: row.vitimizacao_sim,
        n_base: n,
        raca_sim: row.violencia_raca_sim,
        genero_sim: row.violencia_genero_sim
      },
      indice_clima: {
        score: Number(indiceClima.toFixed(1)),
        media_escala: Number(climaMedia.toFixed(2)),
        n_base: n
      },
      conhece_mecanismos: {
        pct: n > 0 ? Number((conheceTotal / n * 100).toFixed(1)) : 0,
        n_sim_total: conheceTotal,
        n_sim: row.conhece_denuncia_sim,
        n_em_parte: row.conhece_denuncia_em_parte,
        n_nao_total: naoConheceTotal,
        pct_nao_total: n > 0 ? Number((naoConheceTotal / n * 100).toFixed(1)) : 0,
        n_nao: row.conhece_denuncia_nao,
        n_nao_sei: row.conhece_denuncia_nao_sei,
        n_base: n
      },
      confia_mecanismos: {
        pct: baseAvaliouEfetividade > 0 ? Number((efetivosTotal / baseAvaliouEfetividade * 100).toFixed(1)) : 0,
        pct_total_amostra: n > 0 ? Number((efetivosTotal / n * 100).toFixed(1)) : 0,
        n_sim: efetivosTotal,
        n_muito: row.efetividade_muito,
        n_parcial: row.efetividade_parcial,
        n_negativo: poucoOuNaoEfetivosTotal,
        pct_negativo: baseAvaliouEfetividade > 0 ? Number((poucoOuNaoEfetivosTotal / baseAvaliouEfetividade * 100).toFixed(1)) : 0,
        n_pouco: row.efetividade_pouco,
        n_nao: row.efetividade_nao,
        n_nao_sei: row.efetividade_nao_sei,
        n_base: baseAvaliouEfetividade,
        n_amostra: n
      },
      desencorajado_estudantes: {
        pct: row.base_desencorajado_discentes > 0 ? Number((row.desencorajado_discentes / row.base_desencorajado_discentes * 100).toFixed(1)) : 0,
        n_sim: row.desencorajado_discentes,
        n_base: row.base_desencorajado_discentes
      },
      responsabilidade_cuidado: {
        pct: n > 0 ? Number((cuidadoTotal / n * 100).toFixed(1)) : 0,
        n_total_cuidado: cuidadoTotal,
        n_principal: row.cuidado_principal,
        pct_principal: n > 0 ? Number((row.cuidado_principal / n * 100).toFixed(1)) : 0,
        n_dividido: row.cuidado_dividido,
        pct_dividido: n > 0 ? Number((row.cuidado_dividido / n * 100).toFixed(1)) : 0,
        n_base: n
      }
    },
    campus_distribuicao: resCampus.rows
  };
}
async function obterDadosPerfil(filtros) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);
  const sqlDistribPorSegmento = (campoExpr, extraWhere) => `
    SELECT
      ${campoExpr} as categoria,
      ${SQL_SEGMENTO_COMUNIDADE} as segmento,
      ${SQL_GENERO_NORMALIZADO} as genero,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${extraWhere ? whereComAnd(whereSql, extraWhere) : whereSql}
    GROUP BY categoria, segmento, ${SQL_GENERO_NORMALIZADO}, ${SQL_IDADE_AGRUPADA}
    ORDER BY n DESC
  `;
  const sqlTotaisSegmento = `
    SELECT
      ${SQL_SEGMENTO_COMUNIDADE} as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY segmento
  `;
  const [
    resTotaisSeg,
    resGeneroNormalizado,
    resCorRaca,
    resFaixa,
    resPcd,
    resOrientacao
  ] = await Promise.all([
    pool.query(sqlTotaisSegmento, params),
    pool.query(sqlDistribPorSegmento(SQL_GENERO_NORMALIZADO, `${SQL_GENERO_NORMALIZADO} IS NOT NULL`), params),
    pool.query(sqlDistribPorSegmento("cor_raca", "cor_raca IS NOT NULL"), params),
    pool.query(sqlDistribPorSegmento("faixa_etaria", "faixa_etaria IS NOT NULL"), params),
    pool.query(sqlDistribPorSegmento("pcd", "pcd IS NOT NULL"), params),
    pool.query(sqlDistribPorSegmento(SQL_ORIENTACAO_NORMALIZADA, `${SQL_ORIENTACAO_NORMALIZADA} IS NOT NULL`), params)
  ]);
  const total = resTotaisSeg.rows.reduce((acc, r) => acc + Number(r.n), 0);
  return {
    total,
    totais_segmento: resTotaisSeg.rows,
    genero_detalhado: resGeneroNormalizado.rows,
    cor_raca: resCorRaca.rows,
    faixa_etaria: resFaixa.rows,
    pcd: resPcd.rows,
    orientacao_sexual: resOrientacao.rows
  };
}
async function obterDadosCarreira(filtros) {
  const pool = getDbPool();
  const baseFiltros = {
    ...filtros,
    vinculo: ["Docente", "Efetivo", "Substituto"]
  };
  const { whereSql, params } = montarWhereFiltrosGlobais(baseFiltros);
  const sqlFunilCargo = `
    SELECT
      cargo,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `cargo IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY cargo, genero_grp
    ORDER BY cargo, genero_grp
  `;
  const sqlGestaoIntersec = `
    SELECT
      ocupa_cargo_gestao,
      CASE
        WHEN cor_raca IN ('Preta', 'Parda') THEN 'Pessoa Negra (Preta/Parda)'
        WHEN cor_raca = 'Branca' THEN 'Branca'
        ELSE 'Outras / N\xE3o informado'
      END as raca_grp,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `ocupa_cargo_gestao IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY ocupa_cargo_gestao, raca_grp, genero_grp
  `;
  const sqlFuncaoGestao = `
    SELECT
      CASE
        WHEN funcao_gestao ILIKE '%CD%' THEN 'CD (Dire\xE7\xE3o)'
        WHEN funcao_gestao ILIKE '%FG%' THEN 'FG (Gratificada)'
        WHEN funcao_gestao ILIKE '%FCC%' OR funcao_gestao ILIKE '%FUC%' THEN 'FCC/FUC (Coordena\xE7\xE3o)'
        WHEN funcao_gestao = 'Prefiro n\xE3o responder' THEN 'Prefiro n\xE3o responder'
        ELSE 'Outra / N\xE3o informado'
      END as funcao,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `funcao_gestao IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY funcao, genero_grp, segmento
    ORDER BY n DESC
  `;
  const sqlProgressao = `
    SELECT
      progressao_merito_nota as nota,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `progressao_merito_nota IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY progressao_merito_nota, genero_grp, segmento
    ORDER BY progressao_merito_nota
  `;
  const sqlProgressaoMedias = `
    SELECT
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      round(avg(progressao_merito_nota::float)::numeric, 2)::float as media,
      round(percentile_cont(0.5) within group (order by progressao_merito_nota::float)::numeric, 2)::float as mediana,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `progressao_merito_nota IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY genero_grp, segmento
  `;
  const sqlAcesso = `
    SELECT
      acesso_oportunidades,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `acesso_oportunidades IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY acesso_oportunidades, genero_grp, segmento
    ORDER BY n DESC
  `;
  const sqlEvitouCuidado = `
    SELECT
      responsabilidade_cuidado,
      evitou_candidatura_cuidado,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      cor_raca,
      pcd,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `evitou_candidatura_cuidado IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY responsabilidade_cuidado, evitou_candidatura_cuidado, segmento, genero_grp, cor_raca, pcd
  `;
  const sqlPgd = `
    SELECT
      adesao_pgd,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `adesao_pgd IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY adesao_pgd, genero_grp
    ORDER BY n DESC
  `;
  const [
    resFunilCargo,
    resGestaoIntersec,
    resFuncaoGestao,
    resProgressao,
    resProgressaoMedias,
    resAcesso,
    resEvitouCuidado,
    resPgd
  ] = await Promise.all([
    pool.query(sqlFunilCargo, params),
    pool.query(sqlGestaoIntersec, params),
    pool.query(sqlFuncaoGestao, params),
    pool.query(sqlProgressao, params),
    pool.query(sqlProgressaoMedias, params),
    pool.query(sqlAcesso, params),
    pool.query(sqlEvitouCuidado, params),
    pool.query(sqlPgd, params)
  ]);
  return {
    base_descricao: "Servidores docentes e TAE (efetivos e substitutos). Terceirizados exclu\xEDdos.",
    funil_cargo: resFunilCargo.rows,
    gestao_interseccional: resGestaoIntersec.rows,
    funcoes_gestao: resFuncaoGestao.rows,
    progressao_distribuicao: resProgressao.rows,
    progressao_medias: resProgressaoMedias.rows,
    acesso_oportunidades: resAcesso.rows,
    evitou_candidatura_cuidado: resEvitouCuidado.rows,
    adesao_pgd: resPgd.rows
  };
}
async function obterDadosAmbienteViolencias(filtros) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);
  const itensQ24 = [
    { key: "seguranca_expressao_opiniao", label: "Q24a: Seguran\xE7a para expressar opini\xF5es", invertido: false },
    { key: "ambiente_seguro_respeitoso", label: "Q24b: Ambiente seguro e respeitoso", invertido: false },
    { key: "inclusao_pessoas_trans", label: "Q24c: Inclus\xE3o de pessoas trans", invertido: false },
    { key: "maternidade_impacto_carreira", label: "Q24d: Maternidade impacta negativamente a carreira", invertido: true },
    { key: "iniciativas_celebrar_diversidade", label: "Q24e: Iniciativas de celebra\xE7\xE3o da diversidade", invertido: false },
    { key: "curriculos_principios_igualdade", label: "Q24f: Curr\xEDculos com igualdade de g\xEAnero", invertido: false }
  ];
  const distribuicaoQ24Promises = itensQ24.map(async (item) => {
    const qSql = `
      SELECT
        coalesce("${item.key}", 'Sem resposta') as resposta,
        ${SQL_SEGMENTO_COMUNIDADE} as segmento,
        ${SQL_GENERO_NORMALIZADO} as genero_grp,
        cor_raca,
        ${SQL_IDADE_AGRUPADA} as idade_grp,
        count(*)::int as n
      FROM public.respostas_pgs
      ${whereSql}
      GROUP BY resposta, segmento, genero_grp, cor_raca, idade_grp
      ORDER BY n DESC
    `;
    const res = await pool.query(qSql, params);
    return {
      itemKey: item.key,
      label: item.label,
      invertido: item.invertido,
      distribuicao: res.rows
    };
  });
  const sqlViolenciaRacaPorCor = `
    SELECT
      cor_raca,
      ${SQL_SEGMENTO_COMUNIDADE} as segmento,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_raca = 'Sim')::int as n_sim
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "cor_raca IS NOT NULL")}
    GROUP BY cor_raca, segmento, genero_grp, idade_grp
    ORDER BY cor_raca
  `;
  const sqlViolenciaOrientacaoPorGenero = `
    SELECT
      ${SQL_GENERO_NORMALIZADO} as grupo_genero,
      ${SQL_SEGMENTO_COMUNIDADE} as segmento,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as n_sim
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY grupo_genero, segmento, genero_grp, idade_grp
    ORDER BY grupo_genero
  `;
  const sqlViolenciaPorOrientacao = `
    SELECT
      ${SQL_ORIENTACAO_NORMALIZADA} as orientacao_sexual,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as n_sim,
      round((count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float as taxa_pct
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `${SQL_ORIENTACAO_NORMALIZADA} IS NOT NULL`)}
    GROUP BY ${SQL_ORIENTACAO_NORMALIZADA}
    ORDER BY taxa_pct DESC
  `;
  const sqlInterseccional = `
    SELECT
      cor_raca,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_raca = 'Sim')::int as n_raca,
      count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as n_gen,
      count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim')::int as n_vitimas,
      round((count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float as taxa_pct
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `cor_raca IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY cor_raca, genero_grp
    ORDER BY cor_raca, genero_grp
  `;
  const sqlDesencorajamento = `
    SELECT
      desencorajado_participacao,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `vinculo ILIKE '%Discente%' AND desencorajado_participacao IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY desencorajado_participacao, genero_grp
    ORDER BY desencorajado_participacao
  `;
  const sqlFunilDenuncia = `
    SELECT
      CASE
        WHEN vinculo ILIKE '%Discente%' THEN 'Discentes'
        WHEN vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%' THEN 'Docentes'
        WHEN vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%') THEN 'T\xE9cnicos/as TAEs'
        WHEN vinculo ILIKE '%Substituto%' THEN 'Docentes Substitutos'
        ELSE 'Outro'
      END as vinculo_grp,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      cor_raca,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as base_total,
      count(*)::int as total_respondentes,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Sim')::int as etapa_1_conhece,
      count(*) FILTER (WHERE mecanismos_efetivos IN ('Sim, s\xE3o muito efetivos', 'S\xE3o parcialmente efetivos'))::int as etapa_2_efetivos,
      count(*) FILTER (WHERE mecanismos_resultados_justos IN ('Sim, geram resultados justos', 'Sim, geram resultados parcialmente justos'))::int as etapa_3_justos
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY vinculo_grp, genero_grp, cor_raca, idade_grp
  `;
  const [
    itensQ24Resultados,
    resViolenciaCor,
    resViolenciaGen,
    resViolenciaOri,
    resInterseccional,
    resDesencorajamento,
    resFunilDenuncia
  ] = await Promise.all([
    Promise.all(distribuicaoQ24Promises),
    pool.query(sqlViolenciaRacaPorCor, params),
    pool.query(sqlViolenciaOrientacaoPorGenero, params),
    pool.query(sqlViolenciaPorOrientacao, params),
    pool.query(sqlInterseccional, params),
    pool.query(sqlDesencorajamento, params),
    pool.query(sqlFunilDenuncia, params)
  ]);
  const climaCampus100 = [];
  return {
    q24_itens: itensQ24Resultados,
    clima_por_campus: climaCampus100,
    violencia_por_cor: resViolenciaCor.rows,
    violencia_por_genero: resViolenciaGen.rows,
    violencia_por_orientacao: resViolenciaOri.rows,
    vitimizacao_interseccional: resInterseccional.rows,
    desencorajamento_estudantes: resDesencorajamento.rows,
    funil_denuncia: resFunilDenuncia.rows
  };
}
async function obterDadosNucleos(filtros) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);
  const nucleos = [
    { key: "avaliacao_naaf", nome: "NAAF (A\xE7\xF5es Afirmativas)" },
    { key: "avaliacao_neabi", nome: "NEABI (Afro-brasileiro e Ind\xEDgena)" },
    { key: "avaliacao_nepgs", nome: "NEPGS (G\xEAnero e Sexualidade)" },
    { key: "avaliacao_assessoria_afirmativas", nome: "Assessoria de A\xE7\xF5es Afirmativas, Inclusivas e Diversidade" },
    { key: "avaliacao_assessoria_genero", nome: "Assessoria de G\xEAnero e Sexualidade" },
    { key: "avaliacao_assessoria_etnico_raciais", nome: "Assessoria de Rela\xE7\xF5es \xC9tnico-raciais" }
  ];
  const distNucleos = await Promise.all(
    nucleos.map(async (nuc) => {
      const q = `
        SELECT
          coalesce("${nuc.key}", 'Sem resposta') as avaliacao,
          ${SQL_SEGMENTO_COMUNIDADE} as segmento,
          ${SQL_IDADE_AGRUPADA} as idade_grp,
          count(*)::int as n
        FROM public.respostas_pgs
        ${whereSql}
        GROUP BY avaliacao, segmento, idade_grp
      `;
      const res = await pool.query(q, params);
      return {
        key: nuc.key,
        nome: nuc.nome,
        respostas: res.rows
      };
    })
  );
  const heatmapQueries = nucleos.map((nuc) => `
    avg(CASE
      WHEN "${nuc.key}" = 'Muito Boa' THEN 5
      WHEN "${nuc.key}" = 'Boa' THEN 4
      WHEN "${nuc.key}" = 'Regular' THEN 3
      WHEN "${nuc.key}" = 'Ruim' THEN 2
      WHEN "${nuc.key}" = 'Muito Ruim' THEN 1
      ELSE NULL END)::float as media_${nuc.key},
    count(*) FILTER (WHERE "${nuc.key}" IN ('Muito Boa', 'Boa', 'Regular', 'Ruim', 'Muito Ruim'))::int as validos_${nuc.key},
    count(*) FILTER (WHERE "${nuc.key}" = 'N\xE3o conhe\xE7o')::int as desconhece_${nuc.key}
  `);
  const sqlHeatmap = `
    SELECT
      campus,
      count(*)::int as n_campus,
      ${heatmapQueries.join(",\n")}
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "campus IS NOT NULL AND campus != 'Prefiro n\xE3o responder'")}
    GROUP BY campus
    ORDER BY campus
  `;
  const sqlCampanhas = `
    SELECT
      coalesce(eficacia_capacitacoes, 'N\xE3o informado') as resposta,
      CASE
        WHEN vinculo ILIKE '%Discente%' THEN 'Discentes'
        WHEN vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%' THEN 'Docentes'
        WHEN vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%') THEN 'T\xE9cnicos/as TAEs'
        WHEN vinculo ILIKE '%Substituto%' THEN 'Docentes Substitutos'
        ELSE 'Outro'
      END as vinculo_grp,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY resposta, vinculo_grp, idade_grp
    ORDER BY n DESC
  `;
  const [resHeatmap, resCampanhas] = await Promise.all([
    pool.query(sqlHeatmap, params),
    pool.query(sqlCampanhas, params)
  ]);
  return {
    distribuicao_nucleos: distNucleos,
    heatmap_campus_nucleo: resHeatmap.rows,
    eficacia_campanhas: resCampanhas.rows
  };
}
async function obterDadosCuidado(filtros) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);
  const sqlQ9 = `
    SELECT
      responsabilidade_cuidado,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      ${SQL_SEGMENTO_COMUNIDADE} as segmento,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `responsabilidade_cuidado IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY responsabilidade_cuidado, genero_grp, segmento, idade_grp
  `;
  const sqlQ30 = `
    SELECT
      politica_apoio_cuidado,
      campus,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "politica_apoio_cuidado IS NOT NULL")}
    GROUP BY politica_apoio_cuidado, campus
  `;
  const sqlLicencaSegmento = (coluna) => `
    SELECT
      ${coluna} as resposta,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      ${SQL_SEGMENTO_COMUNIDADE} as segmento,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `${coluna} IS NOT NULL`)}
    GROUP BY ${coluna}, genero_grp, segmento, idade_grp
    ORDER BY n DESC
  `;
  const [resLicMaternidade, resLicPaternidade, resApoioPais] = await Promise.all([
    pool.query(sqlLicencaSegmento("licenca_maternidade_suficiente"), params),
    pool.query(sqlLicencaSegmento("licenca_paternidade_suficiente"), params),
    pool.query(sqlLicencaSegmento("apoio_pais_estudantes_suficiente"), params)
  ]);
  const sqlMaternidadeImpacto = `
    SELECT
      maternidade_impacto_carreira,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      ${SQL_SEGMENTO_COMUNIDADE} as segmento,
      cor_raca,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `maternidade_impacto_carreira IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY maternidade_impacto_carreira, genero_grp, segmento, cor_raca, idade_grp
    ORDER BY n DESC
  `;
  const sqlEstudantesCuidado = `
    SELECT
      campus,
      nivel_curso,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as total_estudantes,
      count(*) FILTER (WHERE responsabilidade_cuidado = 'Sim')::int as com_cuidado_principal,
      count(*) FILTER (WHERE responsabilidade_cuidado = 'Divido a responsabilidade igualmente com outra(s) pessoa(s)')::int as divide_cuidado
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "vinculo ILIKE '%Discente%' AND nivel_curso IS NOT NULL")}
    GROUP BY campus, nivel_curso, idade_grp
    ORDER BY total_estudantes DESC
  `;
  const [resQ9, resQ30, resMaternidadeImpacto, resEstudantesCuidado] = await Promise.all([
    pool.query(sqlQ9, params),
    pool.query(sqlQ30, params),
    pool.query(sqlMaternidadeImpacto, params),
    pool.query(sqlEstudantesCuidado, params)
  ]);
  return {
    responsabilidade_cuidado: resQ9.rows,
    politicas_cuidado_q30: resQ30.rows,
    licenca_maternidade: resLicMaternidade.rows,
    licenca_paternidade: resLicPaternidade.rows,
    apoio_pais_estudantes: resApoioPais.rows,
    maternidade_carreira_q24d: resMaternidadeImpacto.rows,
    estudantes_cuidado: resEstudantesCuidado.rows
  };
}
async function obterDadosStem(filtros) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);
  const sql = `
    SELECT
      area_conhecimento,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      cor_raca,
      pcd,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      desencorajado_participacao,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `vinculo ILIKE '%Discente%' AND area_conhecimento IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY area_conhecimento, genero_grp, cor_raca, pcd, idade_grp, desencorajado_participacao
  `;
  const res = await pool.query(sql, params);
  const contagemPorGrandeArea = {};
  const coberturaTextos = {};
  const desencorajamentoPorArea = {
    STEM: { total: 0, desencorajados: 0 },
    NaoSTEM: { total: 0, desencorajados: 0 }
  };
  const registrosDetalhadosMap = {};
  GRANDES_AREAS_CNPQ.forEach((ga) => {
    contagemPorGrandeArea[ga] = {
      total: 0,
      mulheres: 0,
      homens: 0,
      mulheres_trans: 0,
      homens_trans: 0,
      travestis: 0,
      nao_binarias: 0,
      negros: 0
    };
  });
  for (const row of res.rows) {
    const raw = String(row.area_conhecimento || "").trim();
    const ga = MAPA_TEXTOS_AREA[raw.toLowerCase()] || "N\xE3o classificada";
    const n = Number(row.n || 0);
    if (!contagemPorGrandeArea[ga]) {
      contagemPorGrandeArea[ga] = {
        total: 0,
        mulheres: 0,
        homens: 0,
        mulheres_trans: 0,
        homens_trans: 0,
        travestis: 0,
        nao_binarias: 0,
        negros: 0
      };
    }
    contagemPorGrandeArea[ga].total += n;
    if (row.genero_grp === "Mulher") contagemPorGrandeArea[ga].mulheres += n;
    else if (row.genero_grp === "Homem") contagemPorGrandeArea[ga].homens += n;
    else if (row.genero_grp === "Mulher Trans") contagemPorGrandeArea[ga].mulheres_trans += n;
    else if (row.genero_grp === "Homem Trans") contagemPorGrandeArea[ga].homens_trans += n;
    else if (row.genero_grp === "Travesti") contagemPorGrandeArea[ga].travestis += n;
    else if (row.genero_grp === "N\xE3o-bin\xE1rios") contagemPorGrandeArea[ga].nao_binarias += n;
    if (row.cor_raca === "Preta" || row.cor_raca === "Parda") {
      contagemPorGrandeArea[ga].negros += n;
    }
    if (!coberturaTextos[raw]) {
      coberturaTextos[raw] = { textoOriginal: raw, grandeArea: ga, n: 0 };
    }
    coberturaTextos[raw].n += n;
    const isStem = ga === "Engenharias e Tecnologia" || ga === "Ci\xEAncias Exatas e da Terra";
    const chaveStem = isStem ? "STEM" : "NaoSTEM";
    desencorajamentoPorArea[chaveStem].total += n;
    if (row.desencorajado_participacao === "Sim, algumas vezes" || row.desencorajado_participacao === "Sim, frequentemente") {
      desencorajamentoPorArea[chaveStem].desencorajados += n;
    }
    const detKey = `${ga}|||${row.genero_grp || ""}|||${row.cor_raca || ""}|||${row.pcd || ""}|||${row.idade_grp || ""}|||${row.desencorajado_participacao || ""}`;
    if (!registrosDetalhadosMap[detKey]) {
      registrosDetalhadosMap[detKey] = {
        grande_area: ga,
        is_stem: isStem,
        genero_grp: row.genero_grp,
        cor_raca: row.cor_raca,
        pcd: row.pcd,
        idade_grp: row.idade_grp,
        desencorajado_participacao: row.desencorajado_participacao,
        n: 0
      };
    }
    registrosDetalhadosMap[detKey].n += n;
  }
  const areasOrdenadasPorMulheres = Object.entries(contagemPorGrandeArea).filter(([_, v]) => v.total > 0).map(([area, v]) => ({
    area,
    total: v.total,
    mulheres: v.mulheres,
    homens: v.homens,
    mulheres_trans: v.mulheres_trans,
    homens_trans: v.homens_trans,
    travestis: v.travestis,
    nao_binarias: v.nao_binarias,
    outras: v.mulheres_trans + v.homens_trans + v.travestis + v.nao_binarias,
    pct_mulheres: Number((v.mulheres / v.total * 100).toFixed(1)),
    pct_negros: Number((v.negros / v.total * 100).toFixed(1))
  })).sort((a, b) => b.pct_mulheres - a.pct_mulheres);
  const coberturaLista = Object.values(coberturaTextos).sort((a, b) => b.n - a.n);
  return {
    areas_ranking_mulheres: areasOrdenadasPorMulheres,
    registros_detalhados: Object.values(registrosDetalhadosMap),
    desencorajamento_stem: {
      stem_pct: desencorajamentoPorArea.STEM.total > 0 ? Number((desencorajamentoPorArea.STEM.desencorajados / desencorajamentoPorArea.STEM.total * 100).toFixed(1)) : 0,
      stem_n: desencorajamentoPorArea.STEM.total,
      stem_desencorajados: desencorajamentoPorArea.STEM.desencorajados,
      nao_stem_pct: desencorajamentoPorArea.NaoSTEM.total > 0 ? Number((desencorajamentoPorArea.NaoSTEM.desencorajados / desencorajamentoPorArea.NaoSTEM.total * 100).toFixed(1)) : 0,
      nao_stem_n: desencorajamentoPorArea.NaoSTEM.total,
      nao_stem_desencorajados: desencorajamentoPorArea.NaoSTEM.desencorajados
    },
    cobertura: coberturaLista
  };
}

// src/server/app.ts
var app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  let decodedPath = req.path;
  try {
    decodedPath = decodeURIComponent(req.path);
  } catch {
    res.status(400).send("Bad Request");
    return;
  }
  if (/(?:^|\/)\.(git|env|htaccess|htpasswd|svn|hg|DS_Store|bash|ssh)/i.test(decodedPath)) {
    res.status(404).send("Not Found");
    return;
  }
  next();
});
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
app.use(express.json({ limit: "1mb" }));
var rateLimitMap = /* @__PURE__ */ new Map();
var RATE_LIMIT_MAX = 120;
var RATE_LIMIT_WINDOW = 60 * 1e3;
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, item] of rateLimitMap.entries()) {
      if (now > item.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1e3).unref?.();
}
function rateLimiter(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  let clientData = rateLimitMap.get(ip);
  if (!clientData || now > clientData.resetTime) {
    clientData = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitMap.set(ip, clientData);
  } else {
    clientData.count++;
  }
  if (clientData.count > RATE_LIMIT_MAX) {
    res.status(429).json({
      error: "Limite de requisi\xE7\xF5es excedido. Por favor, aguarde alguns instantes."
    });
    return;
  }
  next();
}
app.use(rateLimiter);
var apiRouter = express.Router();
apiRouter.get("/saude", async (_req, res) => {
  const status = await testDbConnection();
  if (status.ok) {
    res.json({
      status: "ok",
      banco: "Supabase PostgreSQL (Transaction Pooler)",
      tabela: "public.respostas_pgs",
      total_linhas: status.count
    });
  } else {
    res.status(500).json({
      status: "erro",
      mensagem: status.error
    });
  }
});
apiRouter.get("/catalogo", (_req, res) => {
  res.json({ catalogo: CATALOGO_CAMPOS });
});
var opcoesFiltrosCache = null;
apiRouter.get("/filtros-opcoes", async (_req, res) => {
  if (opcoesFiltrosCache) {
    res.json(opcoesFiltrosCache);
    return;
  }
  try {
    const pool = getDbPool();
    const [campusRes, corRes, faixaRes, orientacaoRes] = await Promise.all([
      pool.query("SELECT DISTINCT campus FROM public.respostas_pgs WHERE campus IS NOT NULL AND campus != 'Prefiro n\xE3o responder' ORDER BY campus"),
      pool.query("SELECT DISTINCT cor_raca FROM public.respostas_pgs WHERE cor_raca IS NOT NULL ORDER BY cor_raca"),
      pool.query("SELECT DISTINCT faixa_etaria FROM public.respostas_pgs WHERE faixa_etaria IS NOT NULL ORDER BY faixa_etaria"),
      pool.query("SELECT DISTINCT orientacao_sexual FROM public.respostas_pgs WHERE orientacao_sexual IS NOT NULL ORDER BY orientacao_sexual")
    ]);
    opcoesFiltrosCache = {
      campus: campusRes.rows.map((r) => r.campus),
      cor_raca: corRes.rows.map((r) => r.cor_raca),
      faixa_etaria: faixaRes.rows.map((r) => r.faixa_etaria),
      orientacao_sexual: [
        "Heterossexual",
        "Bissexual",
        "Homossexual (Gay/L\xE9sbica)",
        "Pansexual",
        "Assexual",
        "Demissexual",
        "Prefiro n\xE3o responder"
      ],
      vinculo: [
        "Discente (estudante)",
        "Docente (professor/a) ou T\xE9cnico-Administrativo em Educa\xE7\xE3o (TAE) Efetivo",
        "Docente (professor/a) Substituto",
        "Prefiro n\xE3o responder"
      ],
      genero_agrupado: ["Mulher", "Homem", "Mulher Trans", "Homem Trans", "Travesti", "N\xE3o-bin\xE1rios"],
      pcd: ["Sim", "N\xE3o", "Prefiro n\xE3o responder"],
      responsabilidade_cuidado: [
        "Sim",
        "N\xE3o",
        "Divido a responsabilidade igualmente com outra(s) pessoa(s)",
        "N\xE3o tenho responsabilidade de cuidado sobre ningu\xE9m",
        "Prefiro n\xE3o responder"
      ],
      ocupa_cargo_gestao: ["Sim", "N\xE3o", "Prefiro n\xE3o responder"]
    };
    res.json(opcoesFiltrosCache);
  } catch (err) {
    console.error("Erro ao buscar op\xE7\xF5es de filtros:", err);
    res.status(500).json({ error: "Erro ao carregar op\xE7\xF5es de filtros" });
  }
});
apiRouter.post("/consulta", async (req, res) => {
  try {
    const validacao = RequisicaoConsultaSchema.safeParse(req.body);
    if (!validacao.success) {
      res.status(400).json({
        erro: "Par\xE2metros de consulta inv\xE1lidos.",
        detalhes: validacao.error.issues
      });
      return;
    }
    const resultado = await executarConsulta(validacao.data);
    res.json(resultado);
  } catch (err) {
    console.error("Erro na rota /api/consulta:", err);
    res.status(500).json({
      erro: "N\xE3o foi poss\xEDvel processar a consulta."
    });
  }
});
apiRouter.post("/visao-geral", async (req, res) => {
  try {
    const dados = await obterKpisVisaoGeral(req.body.filtros);
    res.json(dados);
  } catch (err) {
    console.error("Erro na rota /api/visao-geral:", err);
    res.status(500).json({ erro: "Erro ao carregar dados de vis\xE3o geral" });
  }
});
apiRouter.post("/perfil", async (req, res) => {
  try {
    const dados = await obterDadosPerfil(req.body.filtros);
    res.json(dados);
  } catch (err) {
    console.error("Erro na rota /api/perfil:", err);
    res.status(500).json({ erro: "Erro ao carregar perfil" });
  }
});
apiRouter.post("/carreira", async (req, res) => {
  try {
    const dados = await obterDadosCarreira(req.body.filtros);
    res.json(dados);
  } catch (err) {
    console.error("Erro na rota /api/carreira:", err);
    res.status(500).json({ erro: "Erro ao carregar carreira" });
  }
});
apiRouter.post("/ambiente-violencias", async (req, res) => {
  try {
    const dados = await obterDadosAmbienteViolencias(req.body.filtros);
    res.json(dados);
  } catch (err) {
    console.error("Erro na rota /api/ambiente-violencias:", err);
    res.status(500).json({ erro: "Erro ao carregar ambiente e viol\xEAncias" });
  }
});
apiRouter.post("/nucleos", async (req, res) => {
  try {
    const dados = await obterDadosNucleos(req.body.filtros);
    res.json(dados);
  } catch (err) {
    console.error("Erro na rota /api/nucleos:", err);
    res.status(500).json({ erro: "Erro ao carregar n\xFAcleos" });
  }
});
apiRouter.post("/cuidado", async (req, res) => {
  try {
    const dados = await obterDadosCuidado(req.body.filtros);
    res.json(dados);
  } catch (err) {
    console.error("Erro na rota /api/cuidado:", err);
    res.status(500).json({ erro: "Erro ao carregar dados de cuidado" });
  }
});
apiRouter.post("/stem", async (req, res) => {
  try {
    const dados = await obterDadosStem(req.body.filtros);
    res.json(dados);
  } catch (err) {
    console.error("Erro na rota /api/stem:", err);
    res.status(500).json({ erro: "Erro ao carregar dados de STEM" });
  }
});
app.use("/api", apiRouter);
app.use(apiRouter);
var app_default = app;
export {
  app,
  app_default as default
};
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
