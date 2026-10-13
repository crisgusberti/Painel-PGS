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
function calcularIndiceShannon(contagens) {
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
  return Math.min(100, Math.max(0, H / maxH * 100));
}

// src/lib/catalogo.ts
var CATALOGO_CAMPOS = {
  // === Eixo 1: Perfil e Representatividade ===
  campus: {
    key: "campus",
    label: "Campus",
    tipo: "nominal",
    grupo: "perfil",
    dinamico: true,
    descricao: "Unidade ou Reitoria do IFRS de lota\xE7\xE3o ou estudo."
  },
  vinculo: {
    key: "vinculo",
    label: "V\xEDnculo Institucional",
    tipo: "nominal",
    grupo: "perfil",
    dinamico: true,
    descricao: "V\xEDnculo do respondente com o IFRS (discente, servidor efetivo, substituto, terceirizado)."
  },
  genero: {
    key: "genero",
    label: "Identidade de G\xEAnero (Detalhada)",
    tipo: "nominal",
    grupo: "diversidade",
    dinamico: true,
    descricao: "Identidade de g\xEAnero completa declarada pelo respondente."
  },
  genero_agrupado: {
    key: "genero_agrupado",
    label: "G\xEAnero (Agrupado)",
    tipo: "nominal",
    grupo: "diversidade",
    dinamico: true,
    descricao: "Agrupamento sint\xE9tico: Mulher, Homem, Pessoa n\xE3o-bin\xE1ria/outras e Prefiro n\xE3o responder."
  },
  cor_raca: {
    key: "cor_raca",
    label: "Cor / Ra\xE7a",
    tipo: "nominal",
    grupo: "diversidade",
    dinamico: true,
    descricao: "Autodeclara\xE7\xE3o \xE9tnico-racial (Branca, Parda, Preta, Ind\xEDgena, Amarela, Prefiro n\xE3o responder)."
  },
  faixa_etaria: {
    key: "faixa_etaria",
    label: "Faixa Et\xE1ria",
    tipo: "ordinal_faixa",
    grupo: "perfil",
    dinamico: true,
    ordem: ["At\xE9 17 anos", "18 a 24 anos", "25 a 34 anos", "35 a 44 anos", "45 a 54 anos", "55 a 64 anos", "65 anos ou mais", "Prefiro n\xE3o responder"],
    descricao: "Faixa de idade do respondente."
  },
  pcd: {
    key: "pcd",
    label: "Pessoa com Defici\xEAncia (PCD)",
    tipo: "binario_sim_nao",
    grupo: "diversidade",
    dinamico: true,
    descricao: "Declara\xE7\xE3o de condi\xE7\xE3o de pessoa com defici\xEAncia."
  },
  nome_social: {
    key: "nome_social",
    label: "Uso de Nome Social",
    tipo: "binario_sim_nao",
    grupo: "diversidade",
    dinamico: true,
    descricao: "Utiliza\xE7\xE3o de nome social no ambiente institucional."
  },
  orientacao_sexual: {
    key: "orientacao_sexual",
    label: "Orienta\xE7\xE3o Sexual",
    tipo: "nominal",
    grupo: "diversidade",
    dinamico: true,
    descricao: "Orienta\xE7\xE3o sexual declarada (Heterossexual, Bissexual, Homossexual, Assexual, Pansexual etc.)."
  },
  // === Eixo 2: Ambiente, Segurança e Clima (Q24a–f) ===
  seguranca_expressao_opiniao: {
    key: "seguranca_expressao_opiniao",
    label: "Seguran\xE7a para Expressar Opini\xF5es (Q24a)",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "Sinto-me seguro/a para expressar minhas opini\xF5es no IFRS sem medo de retalia\xE7\xE3o."
  },
  ambiente_seguro_respeitoso: {
    key: "ambiente_seguro_respeitoso",
    label: "Ambiente Seguro e Respeitoso (Q24b)",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "Considero o IFRS um ambiente seguro e respeitoso para todas as pessoas."
  },
  inclusao_pessoas_trans: {
    key: "inclusao_pessoas_trans",
    label: "Inclus\xE3o de Pessoas Trans (Q24c)",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "O IFRS \xE9 acolhedor e inclusivo para pessoas trans e travestis."
  },
  maternidade_impacto_carreira: {
    key: "maternidade_impacto_carreira",
    label: "Maternidade Impacta Negativamente Carreira (Q24d - invertido)",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    invertido: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "Item invertido: a maternidade impacta negativamente o desenvolvimento profissional/acad\xEAmico."
  },
  iniciativas_celebrar_diversidade: {
    key: "iniciativas_celebrar_diversidade",
    label: "Iniciativas de Celebra\xE7\xE3o da Diversidade (Q24e)",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "O IFRS promove a\xE7\xF5es e eventos que valorizam a diversidade."
  },
  curriculos_principios_igualdade: {
    key: "curriculos_principios_igualdade",
    label: "Curr\xEDculos com Princ\xEDpios de Igualdade (Q24f)",
    tipo: "likert",
    grupo: "ambiente",
    dinamico: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: "Os curr\xEDculos e pr\xE1ticas pedag\xF3gicas incorporam igualdade de g\xEAnero e diversidade."
  },
  // === Eixo 3: Violências e Discriminações ===
  violencia_raca: {
    key: "violencia_raca",
    label: "J\xE1 Sofreu Viol\xEAncia por Ra\xE7a/Cor",
    tipo: "binario_sim_nao",
    grupo: "violencia",
    dinamico: true,
    descricao: "Relato de j\xE1 ter vivenciado discrimina\xE7\xE3o ou viol\xEAncia por motivo de cor/ra\xE7a no IFRS."
  },
  violencia_orientacao_genero: {
    key: "violencia_orientacao_genero",
    label: "J\xE1 Sofreu Viol\xEAncia por Orienta\xE7\xE3o ou G\xEAnero",
    tipo: "binario_sim_nao",
    grupo: "violencia",
    dinamico: true,
    descricao: "Relato de discrimina\xE7\xE3o ou viol\xEAncia por orienta\xE7\xE3o sexual ou identidade de g\xEAnero no IFRS."
  },
  desencorajado_participacao: {
    key: "desencorajado_participacao",
    label: "Desencorajamento de Participa\xE7\xE3o (Estudantes - Q15)",
    tipo: "ordinal_faixa",
    grupo: "ambiente",
    dinamico: true,
    ordem: ["Nunca", "Raramente", "Sim, algumas vezes", "Sim, frequentemente", "Prefiro n\xE3o responder"],
    descricao: "Frequ\xEAncia com que o estudante se sentiu desencorajado a participar de atividades acad\xEAmicas."
  },
  // === Eixo 4: Mecanismos de Denúncia (Q25, Q26, Q27) ===
  conhece_mecanismos_denuncia: {
    key: "conhece_mecanismos_denuncia",
    label: "Conhecimento dos Canais de Den\xFAncia (Q25)",
    tipo: "nominal",
    grupo: "denuncia",
    dinamico: true,
    descricao: "Conhecimento dos canais institucionais para encaminhamento de den\xFAncias (Sim, Em parte, N\xE3o...)."
  },
  mecanismos_efetivos: {
    key: "mecanismos_efetivos",
    label: "Efetividade dos Mecanismos de Den\xFAncia (Q26)",
    tipo: "likert",
    grupo: "denuncia",
    dinamico: true,
    escala: ESCALA_EFETIVIDADE_Q26,
    categoriasSemPontuacao: SEM_PONTUACAO_EFETIVIDADE_Q26,
    descricao: "Percep\xE7\xE3o sobre a efetividade dos canais e procedimentos de den\xFAncia do IFRS."
  },
  mecanismos_resultados_justos: {
    key: "mecanismos_resultados_justos",
    label: "Gera\xE7\xE3o de Resultados Justos nas Den\xFAncias (Q27)",
    tipo: "likert",
    grupo: "denuncia",
    dinamico: true,
    escala: ESCALA_RESULTADOS_JUSTOS_Q27,
    categoriasSemPontuacao: SEM_PONTUACAO_RESULTADOS_JUSTOS_Q27,
    descricao: "Percep\xE7\xE3o sobre se as den\xFAncias apuradas resultam em desfechos justos e adequados."
  },
  eficacia_capacitacoes: {
    key: "eficacia_capacitacoes",
    label: "Efic\xE1cia de Campanhas e Capacita\xE7\xF5es (Q28)",
    tipo: "nominal",
    grupo: "politicas",
    dinamico: true,
    descricao: "Avalia\xE7\xE3o do impacto formativo das campanhas e capacita\xE7\xF5es de diversidade."
  },
  // === Eixo 5: Avaliação dos Núcleos e Assessorias (Q29a–f) ===
  avaliacao_naaf: {
    key: "avaliacao_naaf",
    label: "Avalia\xE7\xE3o do NAAF (Q29a)",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da atua\xE7\xE3o do N\xFAcleo de A\xE7\xF5es Afirmativas."
  },
  avaliacao_neabi: {
    key: "avaliacao_neabi",
    label: "Avalia\xE7\xE3o do NEABI (Q29b)",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da atua\xE7\xE3o do N\xFAcleo de Estudos Afro-brasileiros e Ind\xEDgenas."
  },
  avaliacao_nepgs: {
    key: "avaliacao_nepgs",
    label: "Avalia\xE7\xE3o do NEPG (Q29c)",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da atua\xE7\xE3o do N\xFAcleo de Estudos e Pesquisas em G\xEAnero."
  },
  avaliacao_assessoria_afirmativas: {
    key: "avaliacao_assessoria_afirmativas",
    label: "Assessoria de A\xE7\xF5es Afirmativas (Q29d)",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da Assessoria de A\xE7\xF5es Afirmativas, Inclusivas e Comunit\xE1rias."
  },
  avaliacao_assessoria_genero: {
    key: "avaliacao_assessoria_genero",
    label: "Assessoria de G\xEAnero (Q29e)",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da Assessoria de Rela\xE7\xF5es \xC9tnico-Raciais e de G\xEAnero."
  },
  avaliacao_assessoria_etnico_raciais: {
    key: "avaliacao_assessoria_etnico_raciais",
    label: "Assessoria de Rela\xE7\xF5es \xC9tnico-Raciais (Q29f)",
    tipo: "likert",
    grupo: "politicas",
    dinamico: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: "Avalia\xE7\xE3o da Assessoria de Rela\xE7\xF5es \xC9tnico-Raciais."
  },
  // === Eixo 6: Cuidado, Parentalidade e Permanência ===
  responsabilidade_cuidado: {
    key: "responsabilidade_cuidado",
    label: "Responsabilidade de Cuidado",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    descricao: "Exerc\xEDcio de cuidado com dependentes, crian\xE7as, idosos ou pessoas enfermas."
  },
  evitou_candidatura_cuidado: {
    key: "evitou_candidatura_cuidado",
    label: "Evitou Candidatura a Gest\xE3o por Cuidado",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    descricao: "Se o servidor j\xE1 deixou de pleitear cargo/fun\xE7\xE3o devido a demandas de cuidado."
  },
  politica_apoio_cuidado: {
    key: "politica_apoio_cuidado",
    label: "Pol\xEDticas de Apoio ao Cuidado no IFRS (Q30)",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    descricao: "Avalia\xE7\xE3o da exist\xEAncia e sufici\xEAncia de pol\xEDticas de concilia\xE7\xE3o trabalho/estudo e cuidado."
  },
  licenca_maternidade_suficiente: {
    key: "licenca_maternidade_suficiente",
    label: "Sufici\xEAncia da Licen\xE7a Maternidade (Q31)",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    descricao: "Percep\xE7\xE3o sobre a adequa\xE7\xE3o dos prazos e condi\xE7\xF5es da licen\xE7a maternidade."
  },
  licenca_paternidade_suficiente: {
    key: "licenca_paternidade_suficiente",
    label: "Sufici\xEAncia da Licen\xE7a Paternidade (Q32)",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    descricao: "Percep\xE7\xE3o sobre a adequa\xE7\xE3o dos prazos e condi\xE7\xF5es da licen\xE7a paternidade."
  },
  apoio_pais_estudantes_suficiente: {
    key: "apoio_pais_estudantes_suficiente",
    label: "Apoio a Pais/M\xE3es Estudantes (Q33)",
    tipo: "nominal",
    grupo: "cuidado",
    dinamico: true,
    descricao: "Avalia\xE7\xE3o sobre infraestrutura e suporte para estudantes com filhos/dependentes."
  },
  // === Eixo 7: Carreira, Progressão e Gestão (Servidores) ===
  cargo: {
    key: "cargo",
    label: "Cargo do Servidor",
    tipo: "nominal",
    grupo: "carreira",
    dinamico: true,
    descricao: "Carreira e n\xEDvel do servidor (Docente, TAE N\xEDveis C, D, E)."
  },
  ocupa_cargo_gestao: {
    key: "ocupa_cargo_gestao",
    label: "Ocupa Cargo de Gest\xE3o",
    tipo: "binario_sim_nao",
    grupo: "carreira",
    dinamico: true,
    descricao: "Declara\xE7\xE3o se atualmente ocupa cargo de dire\xE7\xE3o ou fun\xE7\xE3o comissionada."
  },
  funcao_gestao: {
    key: "funcao_gestao",
    label: "Fun\xE7\xE3o de Gest\xE3o (CD / FG / FCC)",
    tipo: "nominal",
    grupo: "carreira",
    dinamico: true,
    descricao: "Tipologia de fun\xE7\xE3o comissionada exercida (CD, FG, FCC/FUC)."
  },
  adesao_pgd: {
    key: "adesao_pgd",
    label: "Ades\xE3o ao PGD (Teletrabalho)",
    tipo: "nominal",
    grupo: "carreira",
    dinamico: true,
    descricao: "Participa\xE7\xE3o no Programa de Gest\xE3o e Desempenho."
  },
  progressao_merito_nota: {
    key: "progressao_merito_nota",
    label: "Percep\xE7\xE3o de Justi\xE7a na Progress\xE3o (Q22)",
    tipo: "numerico",
    grupo: "carreira",
    dinamico: true,
    descricao: "Nota de 1 (Discordo totalmente) a 5 (Concordo totalmente) sobre equidade na progress\xE3o por m\xE9rito."
  },
  acesso_oportunidades: {
    key: "acesso_oportunidades",
    label: "Acesso Equitativo a Projetos e Bolsas (Q23)",
    tipo: "likert",
    grupo: "carreira",
    dinamico: true,
    escala: ESCALA_ACESSO_Q23,
    categoriasSemPontuacao: SEM_PONTUACAO_ACESSO_Q23,
    descricao: "Percep\xE7\xE3o sobre equidade na distribui\xE7\xE3o de bolsas, projetos e editais."
  },
  // === Eixo 8: Estudantes e STEM ===
  nivel_curso: {
    key: "nivel_curso",
    label: "N\xEDvel do Curso (Estudantes)",
    tipo: "nominal",
    grupo: "perfil",
    dinamico: true,
    descricao: "N\xEDvel acad\xEAmico: T\xE9cnico Integrado, Subsequente, Proeja, Superior, P\xF3s-gradua\xE7\xE3o."
  },
  politica_assistencia_estudantil: {
    key: "politica_assistencia_estudantil",
    label: "Acesso a Assist\xEAncia Estudantil",
    tipo: "nominal",
    grupo: "perfil",
    dinamico: true,
    descricao: "Participa\xE7\xE3o ou benef\xEDcio de programas da assist\xEAncia estudantil."
  },
  area_conhecimento: {
    key: "area_conhecimento",
    label: "Grande \xC1rea do Conhecimento (CNPq)",
    tipo: "nominal",
    grupo: "perfil",
    dinamico: true,
    descricao: "Grande \xE1rea do curso ap\xF3s normaliza\xE7\xE3o determin\xEDstica via areaMap."
  }
};
var CAMPOS_PERMITIDOS_CONSULTA = Object.keys(CATALOGO_CAMPOS).filter(
  (k) => CATALOGO_CAMPOS[k].dinamico
);

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
  if (campoKey === "genero_agrupado") {
    return `(
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        WHEN genero ILIKE '%n\xE3o-bin\xE1rio%' OR genero ILIKE '%nao-binario%' OR genero ILIKE '%travesti%' OR genero ILIKE '%ag\xEAnero%' THEN 'Pessoa n\xE3o-bin\xE1ria/outras'
        WHEN genero = 'Prefiro n\xE3o responder' THEN 'Prefiro n\xE3o responder'
        WHEN genero IS NOT NULL THEN 'Pessoa n\xE3o-bin\xE1ria/outras'
        ELSE 'N\xE3o informado'
      END
    )`;
  }
  if (campoKey === "area_conhecimento") {
    return `(
      CASE
        WHEN area_conhecimento ILIKE '%engenharia%' OR area_conhecimento ILIKE '%computa%' OR area_conhecimento ILIKE '%inform%' OR area_conhecimento ILIKE '%ti%' OR area_conhecimento ILIKE '%ads%' OR area_conhecimento ILIKE '%eletro%' OR area_conhecimento ILIKE '%mec\xE2nica%' OR area_conhecimento ILIKE '%mecanica%' OR area_conhecimento ILIKE '%pol\xEDmero%' OR area_conhecimento ILIKE '%polimero%' OR area_conhecimento ILIKE '%pl\xE1stico%' THEN 'Engenharias e Tecnologia'
        WHEN area_conhecimento ILIKE '%exata%' OR area_conhecimento ILIKE '%f\xEDsica%' OR area_conhecimento ILIKE '%fisica%' OR area_conhecimento ILIKE '%qu\xEDmica%' OR area_conhecimento ILIKE '%quimica%' OR area_conhecimento ILIKE '%matem\xE1t%' OR area_conhecimento ILIKE '%matemat%' OR area_conhecimento ILIKE '%ci\xEAncias da natureza%' OR area_conhecimento ILIKE '%ciencias da natureza%' THEN 'Ci\xEAncias Exatas e da Terra'
        WHEN area_conhecimento ILIKE '%administra%' OR area_conhecimento ILIKE '%gest\xE3o%' OR area_conhecimento ILIKE '%gestao%' OR area_conhecimento ILIKE '%processos gerenciais%' OR area_conhecimento ILIKE '%com\xE9rcio%' OR area_conhecimento ILIKE '%comercio%' OR area_conhecimento ILIKE '%log\xEDstica%' OR area_conhecimento ILIKE '%logistica%' OR area_conhecimento ILIKE '%marketing%' OR area_conhecimento ILIKE '%secretariado%' OR area_conhecimento ILIKE '%ci\xEAncia da informa\xE7\xE3o%' OR area_conhecimento ILIKE '%biblioteconomia%' THEN 'Ci\xEAncias Sociais Aplicadas'
        WHEN area_conhecimento ILIKE '%agr\xE1r%' OR area_conhecimento ILIKE '%agrar%' OR area_conhecimento ILIKE '%agro%' OR area_conhecimento ILIKE '%zootec%' OR area_conhecimento ILIKE '%viticult%' OR area_conhecimento ILIKE '%meio ambiente%' OR area_conhecimento ILIKE '%ambiental%' THEN 'Ci\xEAncias Agr\xE1rias'
        WHEN area_conhecimento ILIKE '%human%' OR area_conhecimento ILIKE '%pedagog%' OR area_conhecimento ILIKE '%educa%' OR area_conhecimento ILIKE '%profept%' THEN 'Ci\xEAncias Humanas'
        WHEN area_conhecimento ILIKE '%letras%' OR area_conhecimento ILIKE '%artes%' OR area_conhecimento ILIKE '%design%' OR area_conhecimento ILIKE '%moda%' OR area_conhecimento ILIKE '%cinema%' OR area_conhecimento ILIKE '%multim\xEDdia%' OR area_conhecimento ILIKE '%multimidia%' OR area_conhecimento ILIKE '%audiovisual%' THEN 'Lingu\xEDstica, Letras e Artes'
        WHEN area_conhecimento ILIKE '%biolog%' OR area_conhecimento ILIKE '%biotec%' THEN 'Ci\xEAncias Biol\xF3gicas'
        WHEN area_conhecimento ILIKE '%sa\xFAde%' OR area_conhecimento ILIKE '%saude%' OR area_conhecimento ILIKE '%enferm%' OR area_conhecimento ILIKE '%idoso%' THEN 'Ci\xEAncias da Sa\xFAde'
        WHEN area_conhecimento = 'Prefiro n\xE3o responder' THEN 'Prefiro n\xE3o responder'
        WHEN area_conhecimento IS NOT NULL THEN 'N\xE3o classificada'
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
  const whereClauses = [];
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
  if (req.medida.incluir_prefiro_nao_responder === false) {
    for (const c of req.campos_eixo) {
      const colExpr = expressaoCampoSql(c);
      whereClauses.push(`${colExpr} != 'Prefiro n\xE3o responder'`);
    }
  }
  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const campoEixo1 = req.campos_eixo[0];
  const campoEixo2 = req.campos_eixo[1] || null;
  const campoCor = req.campos_cor?.[0] || null;
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
    avisos.push(`Amostra pequena: ${pequenasAmostras} categoria(s) possuem n < 10 respondentes.`);
  }
  const resposta = {
    linhas,
    n_total: 4878,
    n_filtrado: nFiltrado,
    base_descricao: `Respondentes com filtros aplicados (n = ${nFiltrado.toLocaleString("pt-BR")})`,
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
  "biotecnologia": "Ci\xEAncias Biol\xF3gicas",
  "boitecnologia": "Ci\xEAncias Biol\xF3gicas",
  "licenciatura biologia e qu\xEDmica": "Ci\xEAncias Biol\xF3gicas",
  // Saúde
  "t\xE9cnico enfermagem": "Ci\xEAncias da Sa\xFAde",
  "cuidador de idosos": "Ci\xEAncias da Sa\xFAde"
};

// src/server/dashboardStats.ts
function montarWhereFiltrosGlobais(filtros) {
  if (!filtros) return { whereSql: "", params: [] };
  const conditions = [];
  const params = [];
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
  addInCondition("orientacao_sexual", filtros.orientacao_sexual);
  addInCondition("ocupa_cargo_gestao", filtros.ocupa_cargo_gestao);
  addInCondition("responsabilidade_cuidado", filtros.responsabilidade_cuidado);
  addInCondition("genero", filtros.genero_detalhado);
  if (filtros.vinculo && filtros.vinculo.length > 0) {
    const subConds = filtros.vinculo.map((v) => {
      params.push(`%${v}%`);
      return `vinculo ILIKE $${params.length}`;
    });
    conditions.push(`(${subConds.join(" OR ")})`);
  }
  if (filtros.genero_agrupado && filtros.genero_agrupado.length > 0) {
    const exprAgrupado = `(
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        WHEN genero ILIKE '%n\xE3o-bin\xE1rio%' OR genero ILIKE '%nao-binario%' OR genero ILIKE '%travesti%' OR genero ILIKE '%ag\xEAnero%' THEN 'Pessoa n\xE3o-bin\xE1ria/outras'
        WHEN genero = 'Prefiro n\xE3o responder' THEN 'Prefiro n\xE3o responder'
        ELSE 'Pessoa n\xE3o-bin\xE1ria/outras'
      END
    )`;
    addInCondition(exprAgrupado, filtros.genero_agrupado);
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
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%')::int as total_discentes,
      count(*) FILTER (WHERE vinculo ILIKE '%Efetivo%')::int as total_servidores_efetivos,
      count(*) FILTER (WHERE vinculo ILIKE '%Substituto%')::int as total_substitutos,
      count(*) FILTER (WHERE vinculo ILIKE '%Terceirizado%')::int as total_terceirizados,
      count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim')::int as vitimizacao_sim,
      count(*) FILTER (WHERE violencia_raca = 'Sim')::int as violencia_raca_sim,
      count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as violencia_genero_sim,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Sim')::int as conhece_denuncia_sim,
      count(*) FILTER (WHERE mecanismos_efetivos IN ('Sim, s\xE3o muito efetivos', 'S\xE3o parcialmente efetivos'))::int as confia_efetividade,
      count(*) FILTER (WHERE mecanismos_efetivos IS NOT NULL)::int as base_efetividade,
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%' AND desencorajado_participacao IN ('Sim, algumas vezes', 'Sim, frequentemente'))::int as desencorajado_discentes,
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%' AND desencorajado_participacao IS NOT NULL)::int as base_desencorajado_discentes,
      count(*) FILTER (WHERE responsabilidade_cuidado = 'Sim')::int as cuidado_principal,
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
        WHEN vinculo ILIKE '%Efetivo%' THEN 'Servidor Efetivo'
        WHEN vinculo ILIKE '%Substituto%' THEN 'Docente Substituto'
        WHEN vinculo ILIKE '%Terceirizado%' THEN 'Terceirizado'
        ELSE 'N\xE3o informado'
      END as vinculo_simplificado,
      count(*)::int as total
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY campus, vinculo_simplificado
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
  return {
    n_total: 4878,
    n_filtrado: n,
    kpis: {
      total_respondentes: n,
      discentes: { n: row.total_discentes, pct: n > 0 ? row.total_discentes / n * 100 : 0 },
      servidores_efetivos: { n: row.total_servidores_efetivos, pct: n > 0 ? row.total_servidores_efetivos / n * 100 : 0 },
      docentes_substitutos: { n: row.total_substitutos, pct: n > 0 ? row.total_substitutos / n * 100 : 0 },
      terceirizados: { n: row.total_terceirizados, pct: n > 0 ? row.total_terceirizados / n * 100 : 0 },
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
        pct: n > 0 ? Number((row.conhece_denuncia_sim / n * 100).toFixed(1)) : 0,
        n_sim: row.conhece_denuncia_sim,
        n_base: n
      },
      confia_mecanismos: {
        pct: row.base_efetividade > 0 ? Number((row.confia_efetividade / row.base_efetividade * 100).toFixed(1)) : 0,
        n_sim: row.confia_efetividade,
        n_base: row.base_efetividade
      },
      desencorajado_estudantes: {
        pct: row.base_desencorajado_discentes > 0 ? Number((row.desencorajado_discentes / row.base_desencorajado_discentes * 100).toFixed(1)) : 0,
        n_sim: row.desencorajado_discentes,
        n_base: row.base_desencorajado_discentes
      },
      responsabilidade_cuidado: {
        pct: n > 0 ? Number((row.cuidado_principal / n * 100).toFixed(1)) : 0,
        n_sim: row.cuidado_principal,
        n_base: n
      }
    },
    campus_distribuicao: resCampus.rows
  };
}
async function obterDadosPerfil(filtros) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);
  const sqlDistrib = (campo, alias = "categoria") => `
    SELECT
      ${campo} as ${alias},
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY ${campo}
    ORDER BY n DESC
  `;
  const [
    resCampus,
    resVinculo,
    resGeneroDet,
    resGeneroAgrup,
    resCorRaca,
    resFaixa,
    resPcd,
    resNomeSocial,
    resOrientacao,
    resHeatmap
  ] = await Promise.all([
    pool.query(sqlDistrib("campus"), params),
    pool.query(sqlDistrib("vinculo"), params),
    pool.query(sqlDistrib("genero"), params),
    pool.query(
      `SELECT
        CASE
          WHEN genero ILIKE '%mulher%' THEN 'Mulher'
          WHEN genero ILIKE '%homem%' THEN 'Homem'
          WHEN genero ILIKE '%n\xE3o-bin\xE1rio%' OR genero ILIKE '%nao-binario%' OR genero ILIKE '%travesti%' OR genero ILIKE '%ag\xEAnero%' THEN 'Pessoa n\xE3o-bin\xE1ria/outras'
          WHEN genero = 'Prefiro n\xE3o responder' THEN 'Prefiro n\xE3o responder'
          ELSE 'Pessoa n\xE3o-bin\xE1ria/outras'
        END as categoria,
        count(*)::int as n
      FROM public.respostas_pgs
      ${whereSql}
      GROUP BY categoria
      ORDER BY n DESC`,
      params
    ),
    pool.query(sqlDistrib("cor_raca"), params),
    pool.query(sqlDistrib("faixa_etaria"), params),
    pool.query(sqlDistrib("pcd"), params),
    pool.query(sqlDistrib("nome_social"), params),
    pool.query(sqlDistrib("orientacao_sexual"), params),
    pool.query(
      `SELECT
        campus,
        CASE
          WHEN vinculo ILIKE '%Discente%' THEN 'Discente'
          WHEN vinculo ILIKE '%Efetivo%' THEN 'Servidor Efetivo'
          WHEN vinculo ILIKE '%Substituto%' THEN 'Docente Substituto'
          WHEN vinculo ILIKE '%Terceirizado%' THEN 'Terceirizado'
          ELSE 'Outro'
        END as vinculo_grp,
        count(*)::int as n
      FROM public.respostas_pgs
      ${whereSql}
      GROUP BY campus, vinculo_grp
      ORDER BY campus, vinculo_grp`,
      params
    )
  ]);
  const total = resCampus.rows.reduce((acc, r) => acc + Number(r.n), 0);
  const shannonPorCampus = {};
  const campusGroups = {};
  resHeatmap.rows.forEach((r) => {
    if (!campusGroups[r.campus]) campusGroups[r.campus] = {};
    campusGroups[r.campus][r.vinculo_grp] = Number(r.n);
  });
  Object.keys(campusGroups).forEach((c) => {
    shannonPorCampus[c] = Number(calcularIndiceShannon(campusGroups[c]).toFixed(1));
  });
  const pluralidade = {
    genero: resGeneroDet.rows.filter((r) => r.categoria && r.n > 1).length,
    cor_raca: resCorRaca.rows.filter((r) => r.categoria && r.n > 0).length,
    orientacao_sexual: resOrientacao.rows.filter((r) => r.categoria && r.n > 1).length,
    pcd: resPcd.rows.filter((r) => r.categoria && r.n > 0).length
  };
  return {
    total,
    campus: resCampus.rows,
    vinculo: resVinculo.rows,
    genero_detalhado: resGeneroDet.rows,
    genero_agrupado: resGeneroAgrup.rows,
    cor_raca: resCorRaca.rows,
    faixa_etaria: resFaixa.rows,
    pcd: resPcd.rows,
    nome_social: resNomeSocial.rows,
    orientacao_sexual: resOrientacao.rows,
    shannon_por_campus: shannonPorCampus,
    heatmap_campus_vinculo: resHeatmap.rows,
    pluralidade
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
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Pessoa n\xE3o-bin\xE1ria/outras'
      END as genero_grp,
      ocupa_cargo_gestao,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "cargo IS NOT NULL")}
    GROUP BY cargo, genero_grp, ocupa_cargo_gestao
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
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Pessoa n\xE3o-bin\xE1ria/outras'
      END as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "ocupa_cargo_gestao IS NOT NULL")}
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
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Outras identidades'
      END as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "funcao_gestao IS NOT NULL")}
    GROUP BY funcao, genero_grp, segmento
    ORDER BY n DESC
  `;
  const sqlProgressao = `
    SELECT
      progressao_merito_nota as nota,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Outras identidades'
      END as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "progressao_merito_nota IS NOT NULL")}
    GROUP BY progressao_merito_nota, genero_grp, segmento
    ORDER BY progressao_merito_nota
  `;
  const sqlProgressaoMedias = `
    SELECT
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Outras identidades'
      END as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      round(avg(progressao_merito_nota::float)::numeric, 2)::float as media,
      round(percentile_cont(0.5) within group (order by progressao_merito_nota::float)::numeric, 2)::float as mediana,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "progressao_merito_nota IS NOT NULL")}
    GROUP BY genero_grp, segmento
  `;
  const sqlAcesso = `
    SELECT
      acesso_oportunidades,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Outras identidades'
      END as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "acesso_oportunidades IS NOT NULL")}
    GROUP BY acesso_oportunidades, genero_grp, segmento
    ORDER BY n DESC
  `;
  const sqlEvitouCuidado = `
    SELECT
      responsabilidade_cuidado,
      evitou_candidatura_cuidado,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulheres'
        WHEN genero ILIKE '%homem%' THEN 'Homens'
        ELSE 'Outras'
      END as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "evitou_candidatura_cuidado IS NOT NULL")}
    GROUP BY responsabilidade_cuidado, evitou_candidatura_cuidado, segmento, genero_grp
  `;
  const sqlPgd = `
    SELECT
      adesao_pgd,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Outras identidades'
      END as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "adesao_pgd IS NOT NULL")}
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
        count(*)::int as n
      FROM public.respostas_pgs
      ${whereSql}
      GROUP BY resposta
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
  const sqlClimaCampus = `
    SELECT
      campus,
      count(*)::int as n,
      round(avg(
        (
          coalesce(CASE
            WHEN seguranca_expressao_opiniao = 'Concordo Totalmente' THEN 5
            WHEN seguranca_expressao_opiniao = 'Concordo' THEN 4
            WHEN seguranca_expressao_opiniao = 'N\xE3o concordo nem discordo' THEN 3
            WHEN seguranca_expressao_opiniao = 'Discordo' THEN 2
            WHEN seguranca_expressao_opiniao = 'Discordo Totalmente' THEN 1
            ELSE NULL END, 3) +
          coalesce(CASE
            WHEN ambiente_seguro_respeitoso = 'Concordo Totalmente' THEN 5
            WHEN ambiente_seguro_respeitoso = 'Concordo' THEN 4
            WHEN ambiente_seguro_respeitoso = 'N\xE3o concordo nem discordo' THEN 3
            WHEN ambiente_seguro_respeitoso = 'Discordo' THEN 2
            WHEN ambiente_seguro_respeitoso = 'Discordo Totalmente' THEN 1
            ELSE NULL END, 3) +
          coalesce(CASE
            WHEN inclusao_pessoas_trans = 'Concordo Totalmente' THEN 5
            WHEN inclusao_pessoas_trans = 'Concordo' THEN 4
            WHEN inclusao_pessoas_trans = 'N\xE3o concordo nem discordo' THEN 3
            WHEN inclusao_pessoas_trans = 'Discordo' THEN 2
            WHEN inclusao_pessoas_trans = 'Discordo Totalmente' THEN 1
            ELSE NULL END, 3) +
          coalesce(CASE
            WHEN maternidade_impacto_carreira = 'Concordo Totalmente' THEN 1
            WHEN maternidade_impacto_carreira = 'Concordo' THEN 2
            WHEN maternidade_impacto_carreira = 'N\xE3o concordo nem discordo' THEN 3
            WHEN maternidade_impacto_carreira = 'Discordo' THEN 4
            WHEN maternidade_impacto_carreira = 'Discordo Totalmente' THEN 5
            ELSE NULL END, 3) +
          coalesce(CASE
            WHEN iniciativas_celebrar_diversidade = 'Concordo Totalmente' THEN 5
            WHEN iniciativas_celebrar_diversidade = 'Concordo' THEN 4
            WHEN iniciativas_celebrar_diversidade = 'N\xE3o concordo nem discordo' THEN 3
            WHEN iniciativas_celebrar_diversidade = 'Discordo' THEN 2
            WHEN iniciativas_celebrar_diversidade = 'Discordo Totalmente' THEN 1
            ELSE NULL END, 3) +
          coalesce(CASE
            WHEN curriculos_principios_igualdade = 'Concordo Totalmente' THEN 5
            WHEN curriculos_principios_igualdade = 'Concordo' THEN 4
            WHEN curriculos_principios_igualdade = 'N\xE3o concordo nem discordo' THEN 3
            WHEN curriculos_principios_igualdade = 'Discordo' THEN 2
            WHEN curriculos_principios_igualdade = 'Discordo Totalmente' THEN 1
            ELSE NULL END, 3)
        ) / 6.0
      )::numeric, 2)::float as media_bruta
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY campus
    ORDER BY media_bruta DESC
  `;
  const sqlViolenciaRacaPorCor = `
    SELECT
      cor_raca,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_raca = 'Sim')::int as n_sim,
      round((count(*) FILTER (WHERE violencia_raca = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float as taxa_pct
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY cor_raca
    ORDER BY taxa_pct DESC
  `;
  const sqlViolenciaOrientacaoPorGenero = `
    SELECT
      CASE
        WHEN genero ILIKE '%trans%' THEN 'Pessoas Trans/Travestis'
        WHEN genero ILIKE '%n\xE3o-bin\xE1rio%' OR genero ILIKE '%nao-binario%' THEN 'N\xE3o-bin\xE1rios'
        WHEN genero ILIKE '%mulher%' THEN 'Mulheres Cis'
        WHEN genero ILIKE '%homem%' THEN 'Homens Cis'
        ELSE 'Outras identidades'
      END as grupo_genero,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as n_sim,
      round((count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float as taxa_pct
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY grupo_genero
    ORDER BY taxa_pct DESC
  `;
  const sqlViolenciaPorOrientacao = `
    SELECT
      orientacao_sexual,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as n_sim,
      round((count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float as taxa_pct
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY orientacao_sexual
    ORDER BY taxa_pct DESC
  `;
  const sqlInterseccional = `
    SELECT
      cor_raca,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulheres'
        WHEN genero ILIKE '%homem%' THEN 'Homens'
        ELSE 'N\xE3o-bin\xE1rias / Trans / Outras'
      END as genero_grp,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim')::int as n_vitimas,
      round((count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float as taxa_pct
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY cor_raca, genero_grp
    ORDER BY cor_raca, genero_grp
  `;
  const sqlDesencorajamento = `
    SELECT
      desencorajado_participacao,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'N\xE3o-bin\xE1ria / Outras'
      END as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "vinculo ILIKE '%Discente%' AND desencorajado_participacao IS NOT NULL")}
    GROUP BY desencorajado_participacao, genero_grp
    ORDER BY desencorajado_participacao
  `;
  const sqlFunilDenuncia = `
    SELECT
      CASE
        WHEN vinculo ILIKE '%Discente%' THEN 'Discente'
        WHEN vinculo ILIKE '%Efetivo%' THEN 'Servidor Efetivo'
        WHEN vinculo ILIKE '%Substituto%' THEN 'Docente Substituto'
        ELSE 'Outro'
      END as vinculo_grp,
      count(*)::int as base_total,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Sim')::int as etapa_1_conhece,
      count(*) FILTER (WHERE mecanismos_efetivos IN ('Sim, s\xE3o muito efetivos', 'S\xE3o parcialmente efetivos'))::int as etapa_2_efetivos,
      count(*) FILTER (WHERE mecanismos_resultados_justos IN ('Sim, geram resultados justos', 'Sim, geram resultados parcialmente justos'))::int as etapa_3_justos
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY vinculo_grp
  `;
  const [
    itensQ24Resultados,
    resClimaCampus,
    resViolenciaCor,
    resViolenciaGen,
    resViolenciaOri,
    resInterseccional,
    resDesencorajamento,
    resFunilDenuncia
  ] = await Promise.all([
    Promise.all(distribuicaoQ24Promises),
    pool.query(sqlClimaCampus, params),
    pool.query(sqlViolenciaRacaPorCor, params),
    pool.query(sqlViolenciaOrientacaoPorGenero, params),
    pool.query(sqlViolenciaPorOrientacao, params),
    pool.query(sqlInterseccional, params),
    pool.query(sqlDesencorajamento, params),
    pool.query(sqlFunilDenuncia, params)
  ]);
  const climaCampus100 = resClimaCampus.rows.map((r) => ({
    campus: r.campus,
    n: Number(r.n),
    media_bruta: Number(r.media_bruta),
    indice_100: Number(normalizarIndice100(Number(r.media_bruta), 1, 5).toFixed(1))
  }));
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
    { key: "avaliacao_nepgs", nome: "NEPG (G\xEAnero)" },
    { key: "avaliacao_assessoria_afirmativas", nome: "Assessoria A\xE7\xF5es Afirmativas" },
    { key: "avaliacao_assessoria_genero", nome: "Assessoria de G\xEAnero" },
    { key: "avaliacao_assessoria_etnico_raciais", nome: "Assessoria \xC9tnico-Raciais" }
  ];
  const distNucleos = await Promise.all(
    nucleos.map(async (nuc) => {
      const q = `
        SELECT
          coalesce("${nuc.key}", 'Sem resposta') as avaliacao,
          count(*)::int as n
        FROM public.respostas_pgs
        ${whereSql}
        GROUP BY avaliacao
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
    ${whereSql}
    GROUP BY campus
    ORDER BY campus
  `;
  const sqlCampanhas = `
    SELECT
      coalesce(eficacia_capacitacoes, 'N\xE3o informado') as resposta,
      CASE
        WHEN vinculo ILIKE '%Discente%' THEN 'Discente'
        WHEN vinculo ILIKE '%Efetivo%' THEN 'Servidor Efetivo'
        WHEN vinculo ILIKE '%Substituto%' THEN 'Docente Substituto'
        ELSE 'Outro'
      END as vinculo_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY resposta, vinculo_grp
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
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'N\xE3o-bin\xE1ria / Outras'
      END as genero_grp,
      CASE
        WHEN vinculo ILIKE '%Discente%' THEN 'Discente'
        ELSE 'Servidor(a)'
      END as vinculo_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "responsabilidade_cuidado IS NOT NULL")}
    GROUP BY responsabilidade_cuidado, genero_grp, vinculo_grp
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
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'mulheres'
        WHEN genero ILIKE '%homem%' THEN 'homens'
        ELSE 'outros'
      END as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%T\xE9cnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `${coluna} IS NOT NULL`)}
    GROUP BY ${coluna}, genero_grp, segmento
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
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'N\xE3o-bin\xE1ria / Outras'
      END as genero_grp,
      responsabilidade_cuidado,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "maternidade_impacto_carreira IS NOT NULL")}
    GROUP BY maternidade_impacto_carreira, genero_grp, responsabilidade_cuidado
  `;
  const sqlEstudantesCuidado = `
    SELECT
      campus,
      nivel_curso,
      count(*)::int as total_estudantes,
      count(*) FILTER (WHERE responsabilidade_cuidado = 'Sim')::int as com_cuidado_principal,
      count(*) FILTER (WHERE responsabilidade_cuidado = 'Divido a responsabilidade igualmente com outra(s) pessoa(s)')::int as divide_cuidado
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "vinculo ILIKE '%Discente%' AND nivel_curso IS NOT NULL")}
    GROUP BY campus, nivel_curso
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
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'N\xE3o-bin\xE1ria / Outras'
      END as genero_grp,
      cor_raca,
      desencorajado_participacao,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "vinculo ILIKE '%Discente%' AND area_conhecimento IS NOT NULL")}
    GROUP BY area_conhecimento, genero_grp, cor_raca, desencorajado_participacao
  `;
  const res = await pool.query(sql, params);
  const contagemPorGrandeArea = {};
  const coberturaTextos = {};
  const desencorajamentoPorArea = {
    STEM: { total: 0, desencorajados: 0 },
    NaoSTEM: { total: 0, desencorajados: 0 }
  };
  GRANDES_AREAS_CNPQ.forEach((ga) => {
    contagemPorGrandeArea[ga] = { total: 0, mulheres: 0, homens: 0, outras: 0, negros: 0 };
  });
  for (const row of res.rows) {
    const raw = String(row.area_conhecimento || "").trim();
    const ga = MAPA_TEXTOS_AREA[raw.toLowerCase()] || "N\xE3o classificada";
    const n = Number(row.n || 0);
    if (!contagemPorGrandeArea[ga]) {
      contagemPorGrandeArea[ga] = { total: 0, mulheres: 0, homens: 0, outras: 0, negros: 0 };
    }
    contagemPorGrandeArea[ga].total += n;
    if (row.genero_grp === "Mulher") contagemPorGrandeArea[ga].mulheres += n;
    else if (row.genero_grp === "Homem") contagemPorGrandeArea[ga].homens += n;
    else contagemPorGrandeArea[ga].outras += n;
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
  }
  const areasOrdenadasPorMulheres = Object.entries(contagemPorGrandeArea).filter(([_, v]) => v.total > 0).map(([area, v]) => ({
    area,
    total: v.total,
    mulheres: v.mulheres,
    homens: v.homens,
    outras: v.outras,
    pct_mulheres: Number((v.mulheres / v.total * 100).toFixed(1)),
    pct_negros: Number((v.negros / v.total * 100).toFixed(1))
  })).sort((a, b) => b.pct_mulheres - a.pct_mulheres);
  const coberturaLista = Object.values(coberturaTextos).sort((a, b) => b.n - a.n);
  return {
    areas_ranking_mulheres: areasOrdenadasPorMulheres,
    desencorajamento_stem: {
      stem_pct: desencorajamentoPorArea.STEM.total > 0 ? Number((desencorajamentoPorArea.STEM.desencorajados / desencorajamentoPorArea.STEM.total * 100).toFixed(1)) : 0,
      stem_n: desencorajamentoPorArea.STEM.total,
      nao_stem_pct: desencorajamentoPorArea.NaoSTEM.total > 0 ? Number((desencorajamentoPorArea.NaoSTEM.desencorajados / desencorajamentoPorArea.NaoSTEM.total * 100).toFixed(1)) : 0,
      nao_stem_n: desencorajamentoPorArea.NaoSTEM.total
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
      pool.query("SELECT DISTINCT campus FROM public.respostas_pgs WHERE campus IS NOT NULL ORDER BY campus"),
      pool.query("SELECT DISTINCT cor_raca FROM public.respostas_pgs WHERE cor_raca IS NOT NULL ORDER BY cor_raca"),
      pool.query("SELECT DISTINCT faixa_etaria FROM public.respostas_pgs WHERE faixa_etaria IS NOT NULL ORDER BY faixa_etaria"),
      pool.query("SELECT DISTINCT orientacao_sexual FROM public.respostas_pgs WHERE orientacao_sexual IS NOT NULL ORDER BY orientacao_sexual")
    ]);
    opcoesFiltrosCache = {
      campus: campusRes.rows.map((r) => r.campus),
      cor_raca: corRes.rows.map((r) => r.cor_raca),
      faixa_etaria: faixaRes.rows.map((r) => r.faixa_etaria),
      orientacao_sexual: orientacaoRes.rows.map((r) => r.orientacao_sexual),
      vinculo: [
        "Discente (estudante)",
        "Docente (professor/a) ou T\xE9cnico-Administrativo em Educa\xE7\xE3o (TAE) Efetivo",
        "Docente (professor/a) Substituto",
        "Terceirizado",
        "Prefiro n\xE3o responder"
      ],
      genero_agrupado: ["Mulher", "Homem", "Pessoa n\xE3o-bin\xE1ria/outras", "Prefiro n\xE3o responder"],
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
