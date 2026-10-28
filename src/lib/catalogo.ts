/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CampoCatalogo } from './types';
import {
  ESCALA_CONCORDANCIA_Q24,
  SEM_PONTUACAO_CONCORDANCIA_Q24,
  ESCALA_QUALIDADE_Q29,
  SEM_PONTUACAO_QUALIDADE_Q29,
  ESCALA_EFETIVIDADE_Q26,
  SEM_PONTUACAO_EFETIVIDADE_Q26,
  ESCALA_RESULTADOS_JUSTOS_Q27,
  SEM_PONTUACAO_RESULTADOS_JUSTOS_Q27,
  ESCALA_ACESSO_Q23,
  SEM_PONTUACAO_ACESSO_Q23,
} from './escalas';

export const CATALOGO_CAMPOS: Record<string, CampoCatalogo> = {
  // === Eixo 1: Perfil e Representatividade ===
  campus: {
    key: 'campus',
    label: 'Campus / Unidade',
    tipo: 'nominal',
    grupo: 'perfil',
    dinamico: true,
    escopo: 'geral',
    papel: 'perfil',
    permitirComoSerie: false, // 18 unidades torna ilegível como série de cor/legenda; ideal apenas no Eixo Principal
    descricao: 'Unidade ou Reitoria do IFRS de lotação ou estudo (18 unidades).',
  },
  vinculo: {
    key: 'vinculo',
    label: 'Segmento / Vínculo Institucional',
    tipo: 'nominal',
    grupo: 'perfil',
    dinamico: true,
    escopo: 'geral',
    papel: 'perfil',
    permitirComoSerie: true,
    descricao: 'Segmento institucional no IFRS (Discentes, Docentes, Técnicos TAEs, Docentes Substitutos).',
  },
  genero: {
    key: 'genero',
    label: 'Identidade de Gênero (Detalhada)',
    tipo: 'nominal',
    grupo: 'diversidade',
    dinamico: false, // Desativado no construtor por ser duplicado em relação a genero_agrupado
    escopo: 'geral',
    papel: 'perfil',
    permitirComoSerie: false,
    descricao: 'Identidade de gênero declarada pelo respondente.',
  },
  genero_agrupado: {
    key: 'genero_agrupado',
    label: 'Identidade de Gênero',
    tipo: 'nominal',
    grupo: 'diversidade',
    dinamico: true,
    escopo: 'geral',
    papel: 'perfil',
    permitirComoSerie: true,
    descricao: 'Classificação oficial normalizada nas 6 categorias de gênero: Mulher, Homem, Mulher Trans, Homem Trans, Travesti e Não-binárias.',
  },
  cor_raca: {
    key: 'cor_raca',
    label: 'Autodeclaração Étnico-Racial (Cor / Raça)',
    tipo: 'nominal',
    grupo: 'diversidade',
    dinamico: true,
    escopo: 'geral',
    papel: 'perfil',
    permitirComoSerie: true,
    descricao: 'Autodeclaração étnico-racial (Branca, Parda, Preta, Indígena, Amarela, Prefiro não responder).',
  },
  faixa_etaria: {
    key: 'faixa_etaria',
    label: 'Faixa Etária',
    tipo: 'ordinal_faixa',
    grupo: 'perfil',
    dinamico: true,
    escopo: 'geral',
    papel: 'perfil',
    permitirComoSerie: true,
    ordem: ['Menor de 18 anos', 'De 18 a 24 anos', 'De 25 a 34 anos', 'De 35 a 44 anos', 'De 45 a 54 anos', 'De 55 a 64 anos', '65 anos ou mais', 'Prefiro não responder'],
    descricao: 'Faixa de idade do respondente.',
  },
  pcd: {
    key: 'pcd',
    label: 'Pessoa com Deficiência (PCD)',
    tipo: 'binario_sim_nao',
    grupo: 'diversidade',
    dinamico: true,
    escopo: 'geral',
    papel: 'perfil',
    permitirComoSerie: true,
    descricao: 'Declaração de condição de pessoa com deficiência.',
  },
  nome_social: {
    key: 'nome_social',
    label: 'Uso de Nome Social',
    tipo: 'binario_sim_nao',
    grupo: 'diversidade',
    dinamico: false, // Removido do construtor dinâmico por não compor os eixos analíticos do relatório
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: false,
    descricao: 'Utilização de nome social no ambiente institucional.',
  },
  orientacao_sexual: {
    key: 'orientacao_sexual',
    label: 'Orientação Sexual',
    tipo: 'nominal',
    grupo: 'diversidade',
    dinamico: true,
    escopo: 'geral',
    papel: 'perfil',
    permitirComoSerie: true,
    descricao: 'Orientação sexual declarada (Heterossexual, Bissexual, Homossexual, Pansexual, Assexual, Demissexual).',
  },

  // === Eixo 2: Ambiente, Segurança e Clima ===
  seguranca_expressao_opiniao: {
    key: 'seguranca_expressao_opiniao',
    label: 'Segurança para Expressar Opiniões',
    tipo: 'likert',
    grupo: 'ambiente',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: 'Sinto-me seguro/a para expressar minhas opiniões no IFRS sem medo de retaliação.',
  },
  ambiente_seguro_respeitoso: {
    key: 'ambiente_seguro_respeitoso',
    label: 'Ambiente Seguro e Respeitoso',
    tipo: 'likert',
    grupo: 'ambiente',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: 'Considero o IFRS um ambiente seguro e respeitoso para todas as pessoas.',
  },
  inclusao_pessoas_trans: {
    key: 'inclusao_pessoas_trans',
    label: 'Inclusão de Pessoas Trans e Travestis',
    tipo: 'likert',
    grupo: 'ambiente',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: 'O IFRS é acolhedor e inclusivo para pessoas trans e travestis.',
  },
  maternidade_impacto_carreira: {
    key: 'maternidade_impacto_carreira',
    label: 'Impacto da Maternidade na Carreira',
    tipo: 'likert',
    grupo: 'ambiente',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    invertido: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: 'Percepção sobre se a maternidade impacta negativamente o desenvolvimento profissional/acadêmico.',
  },
  iniciativas_celebrar_diversidade: {
    key: 'iniciativas_celebrar_diversidade',
    label: 'Iniciativas de Celebração da Diversidade',
    tipo: 'likert',
    grupo: 'ambiente',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: 'O IFRS promove ações e eventos que valorizam a diversidade.',
  },
  curriculos_principios_igualdade: {
    key: 'curriculos_principios_igualdade',
    label: 'Currículos com Princípios de Igualdade',
    tipo: 'likert',
    grupo: 'ambiente',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_CONCORDANCIA_Q24,
    categoriasSemPontuacao: SEM_PONTUACAO_CONCORDANCIA_Q24,
    descricao: 'Os currículos e práticas pedagógicas incorporam igualdade de gênero e diversidade.',
  },

  // === Eixo 3: Violências e Discriminações ===
  violencia_raca: {
    key: 'violencia_raca',
    label: 'Sofreu Discriminação por Cor / Raça',
    tipo: 'binario_sim_nao',
    grupo: 'violencia',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Relato de já ter vivenciado discriminação ou violência por motivo de cor/raça no IFRS.',
  },
  violencia_orientacao_genero: {
    key: 'violencia_orientacao_genero',
    label: 'Sofreu Discriminação por Gênero ou Orientação',
    tipo: 'binario_sim_nao',
    grupo: 'violencia',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Relato de discriminação ou violência por orientação sexual ou identidade de gênero no IFRS.',
  },
  desencorajado_participacao: {
    key: 'desencorajado_participacao',
    label: 'Desencorajamento de Participação Acadêmica (Discentes)',
    tipo: 'ordinal_faixa',
    grupo: 'ambiente',
    dinamico: true,
    escopo: 'discentes',
    papel: 'indicador',
    permitirComoSerie: true,
    ordem: ['Nunca', 'Raramente', 'Sim, algumas vezes', 'Sim, frequentemente', 'Prefiro não responder'],
    descricao: 'Frequência com que o estudante se sentiu desencorajado a participar de atividades acadêmicas.',
  },

  // === Eixo 4: Mecanismos de Denúncia ===
  conhece_mecanismos_denuncia: {
    key: 'conhece_mecanismos_denuncia',
    label: 'Conhecimento dos Canais de Denúncia',
    tipo: 'nominal',
    grupo: 'denuncia',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Conhecimento dos canais institucionais para encaminhamento de denúncias (Sim, Em parte, Não).',
  },
  mecanismos_efetivos: {
    key: 'mecanismos_efetivos',
    label: 'Efetividade dos Mecanismos de Denúncia',
    tipo: 'likert',
    grupo: 'denuncia',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_EFETIVIDADE_Q26,
    categoriasSemPontuacao: SEM_PONTUACAO_EFETIVIDADE_Q26,
    descricao: 'Percepção sobre a efetividade dos canais e procedimentos de denúncia do IFRS.',
  },
  mecanismos_resultados_justos: {
    key: 'mecanismos_resultados_justos',
    label: 'Geração de Resultados Justos nas Denúncias',
    tipo: 'likert',
    grupo: 'denuncia',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_RESULTADOS_JUSTOS_Q27,
    categoriasSemPontuacao: SEM_PONTUACAO_RESULTADOS_JUSTOS_Q27,
    descricao: 'Percepção sobre se as denúncias apuradas resultam em desfechos justos e adequados.',
  },
  eficacia_capacitacoes: {
    key: 'eficacia_capacitacoes',
    label: 'Eficácia de Campanhas e Ações Formativas',
    tipo: 'nominal',
    grupo: 'politicas',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Avaliação do impacto formativo das campanhas e capacitações de diversidade.',
  },

  // === Eixo 5: Avaliação dos Núcleos e Assessorias ===
  avaliacao_naaf: {
    key: 'avaliacao_naaf',
    label: 'Avaliação do NAAF',
    tipo: 'likert',
    grupo: 'politicas',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: 'Avaliação da atuação do Núcleo de Ações Afirmativas.',
  },
  avaliacao_neabi: {
    key: 'avaliacao_neabi',
    label: 'Avaliação do NEABI',
    tipo: 'likert',
    grupo: 'politicas',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: 'Avaliação da atuação do Núcleo de Estudos Afro-brasileiros e Indígenas.',
  },
  avaliacao_nepgs: {
    key: 'avaliacao_nepgs',
    label: 'Avaliação do NEPGS',
    tipo: 'likert',
    grupo: 'politicas',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: 'Avaliação da atuação do Núcleo de Estudos e Pesquisas em Gênero e Sexualidade.',
  },
  avaliacao_assessoria_afirmativas: {
    key: 'avaliacao_assessoria_afirmativas',
    label: 'Assessoria de Ações Afirmativas, Inclusivas e Diversidade',
    tipo: 'likert',
    grupo: 'politicas',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: 'Avaliação da Assessoria de Ações Afirmativas, Inclusivas e Diversidade.',
  },
  avaliacao_assessoria_genero: {
    key: 'avaliacao_assessoria_genero',
    label: 'Assessoria de Gênero e Sexualidade',
    tipo: 'likert',
    grupo: 'politicas',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: 'Avaliação da Assessoria de Gênero e Sexualidade.',
  },
  avaliacao_assessoria_etnico_raciais: {
    key: 'avaliacao_assessoria_etnico_raciais',
    label: 'Assessoria de Relações Étnico-raciais',
    tipo: 'likert',
    grupo: 'politicas',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_QUALIDADE_Q29,
    categoriasSemPontuacao: SEM_PONTUACAO_QUALIDADE_Q29,
    descricao: 'Avaliação da Assessoria de Relações Étnico-raciais.',
  },

  // === Eixo 6: Cuidado, Parentalidade e Permanência ===
  responsabilidade_cuidado: {
    key: 'responsabilidade_cuidado',
    label: 'Responsabilidade de Cuidado',
    tipo: 'nominal',
    grupo: 'cuidado',
    dinamico: true,
    escopo: 'geral',
    papel: 'perfil', // Permite cruzar indicadores de carreira/clima/permanência por responsabilidade de cuidado
    permitirComoSerie: true,
    descricao: 'Exercício de cuidado com dependentes, crianças, idosos ou pessoas com deficiência.',
  },
  evitou_candidatura_cuidado: {
    key: 'evitou_candidatura_cuidado',
    label: 'Deixou de se Candidatar à Gestão por Cuidado (Servidores)',
    tipo: 'nominal',
    grupo: 'cuidado',
    dinamico: true,
    escopo: 'servidores',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Se o servidor já deixou de pleitear cargo/função devido a demandas de cuidado.',
  },
  politica_apoio_cuidado: {
    key: 'politica_apoio_cuidado',
    label: 'Políticas de Apoio ao Cuidado no IFRS',
    tipo: 'nominal',
    grupo: 'cuidado',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Avaliação da existência e suficiência de políticas de conciliação trabalho/estudo e cuidado.',
  },
  licenca_maternidade_suficiente: {
    key: 'licenca_maternidade_suficiente',
    label: 'Suficiência da Licença Maternidade',
    tipo: 'nominal',
    grupo: 'cuidado',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Percepção sobre a adequação dos prazos e condições da licença maternidade.',
  },
  licenca_paternidade_suficiente: {
    key: 'licenca_paternidade_suficiente',
    label: 'Suficiência da Licença Paternidade',
    tipo: 'nominal',
    grupo: 'cuidado',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Percepção sobre a adequação dos prazos e condições da licença paternidade.',
  },
  apoio_pais_estudantes_suficiente: {
    key: 'apoio_pais_estudantes_suficiente',
    label: 'Suficiência do Apoio a Estudantes com Filhos/as',
    tipo: 'nominal',
    grupo: 'cuidado',
    dinamico: true,
    escopo: 'geral',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Avaliação sobre infraestrutura e suporte para estudantes com filhos/dependentes.',
  },

  // === Eixo 7: Carreira, Progressão e Gestão (Servidores) ===
  cargo: {
    key: 'cargo',
    label: 'Cargo / Carreira do Servidor (Servidores)',
    tipo: 'nominal',
    grupo: 'carreira',
    dinamico: true,
    escopo: 'servidores',
    papel: 'perfil',
    permitirComoSerie: true,
    descricao: 'Carreira e nível do servidor efetivo (Docente, TAE Níveis C, D, E).',
  },
  ocupa_cargo_gestao: {
    key: 'ocupa_cargo_gestao',
    label: 'Ocupa Cargo de Gestão (Servidores)',
    tipo: 'binario_sim_nao',
    grupo: 'carreira',
    dinamico: true,
    escopo: 'servidores',
    papel: 'perfil',
    permitirComoSerie: true,
    descricao: 'Declaração se o servidor ocupa cargo de direção ou função gratificada/comissionada.',
  },
  funcao_gestao: {
    key: 'funcao_gestao',
    label: 'Função de Gestão (CD / FG / FCC)',
    tipo: 'nominal',
    grupo: 'carreira',
    dinamico: false, // Sub-pergunta restrita apenas a gestores (n=390), gerando células esparsas em cruzamentos
    escopo: 'servidores',
    papel: 'indicador',
    permitirComoSerie: false,
    descricao: 'Tipologia de função comissionada exercida (CD, FG, FCC/FUC).',
  },
  adesao_pgd: {
    key: 'adesao_pgd',
    label: 'Adesão ao PGD / Teletrabalho (Servidores)',
    tipo: 'nominal',
    grupo: 'carreira',
    dinamico: true,
    escopo: 'servidores',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Participação no Programa de Gestão e Desempenho.',
  },
  progressao_merito_nota: {
    key: 'progressao_merito_nota',
    label: 'Percepção de Justiça na Progressão (Servidores)',
    tipo: 'numerico',
    grupo: 'carreira',
    dinamico: true,
    escopo: 'servidores',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Avaliação de 1 (Discordo totalmente) a 5 (Concordo totalmente) sobre equidade na progressão por mérito.',
  },
  acesso_oportunidades: {
    key: 'acesso_oportunidades',
    label: 'Acesso Equitativo a Projetos e Bolsas (Servidores)',
    tipo: 'likert',
    grupo: 'carreira',
    dinamico: true,
    escopo: 'servidores',
    papel: 'indicador',
    permitirComoSerie: true,
    escala: ESCALA_ACESSO_Q23,
    categoriasSemPontuacao: SEM_PONTUACAO_ACESSO_Q23,
    descricao: 'Percepção sobre equidade na distribuição de bolsas, projetos e editais entre servidores.',
  },

  // === Eixo 8: Estudantes e STEM ===
  nivel_curso: {
    key: 'nivel_curso',
    label: 'Nível do Curso (Discentes)',
    tipo: 'nominal',
    grupo: 'perfil',
    dinamico: true,
    escopo: 'discentes',
    papel: 'perfil',
    permitirComoSerie: true,
    descricao: 'Nível acadêmico do estudante: Técnico Integrado, Subsequente, PROEJA, Graduação, Pós-graduação.',
  },
  politica_assistencia_estudantil: {
    key: 'politica_assistencia_estudantil',
    label: 'Efetividade da Assistência Estudantil (Discentes)',
    tipo: 'nominal',
    grupo: 'politicas',
    dinamico: true,
    escopo: 'discentes',
    papel: 'indicador',
    permitirComoSerie: true,
    descricao: 'Avaliação discente sobre a efetividade das políticas de assistência estudantil.',
  },
  area_conhecimento: {
    key: 'area_conhecimento',
    label: 'Grande Área do Conhecimento CNPq (Discentes)',
    tipo: 'nominal',
    grupo: 'perfil',
    dinamico: true,
    escopo: 'discentes',
    papel: 'perfil',
    permitirComoSerie: true,
    descricao: 'Grande área do curso discente segundo a classificação do CNPq.',
  },
};

/**
 * Retorna apenas as opções de Série / Cor que fazem sentido estatístico e visual
 * quando combinadas com o campo selecionado no Eixo Principal (eixo1Key).
 */
export function obterOpcoesSerieCompativeis(eixo1Key: string): CampoCatalogo[] {
  const campoEixo = CATALOGO_CAMPOS[eixo1Key];
  if (!campoEixo) return [];

  return Object.values(CATALOGO_CAMPOS).filter((c) => {
    // 1. Deve ser um campo ativo no construtor e permitido como série (exclui Campus, etc.)
    if (!c.dinamico || c.permitirComoSerie === false) return false;

    // 2. Não pode cruzar um campo com ele mesmo
    if (c.key === eixo1Key) return false;

    // 3. Compatibilidade de Universo Populacional (Servidores vs. Discentes)
    if (campoEixo.escopo === 'servidores' && c.escopo === 'discentes') return false;
    if (campoEixo.escopo === 'discentes' && c.escopo === 'servidores') return false;

    // Se o Eixo Principal já é exclusivo de Discentes, "Vínculo Institucional" teria apenas 1 categoria ("Discentes")
    if (campoEixo.escopo === 'discentes' && c.key === 'vinculo') return false;

    // 4. Bloquear par redundante Vínculo × Cargo (já que Vínculo efetivo e Cargo medem a mesma divisão Docente/TAE)
    if (
      (eixo1Key === 'cargo' && c.key === 'vinculo') ||
      (eixo1Key === 'vinculo' && c.key === 'cargo')
    ) {
      return false;
    }

    // 5. Compatibilidade de Papel Analítico:
    // Se o Eixo Principal é uma questão avaliativa/temática ('indicador'), a Série/Cor deve ser
    // estritamente uma dimensão de segmentação ('perfil'), evitando matrizes confusas de Pergunta × Pergunta.
    if (campoEixo.papel === 'indicador' && c.papel === 'indicador') {
      return false;
    }

    return true;
  });
}

/**
 * Lista dos nomes de campos seguros para consulta dinâmica na API
 */
export const CAMPOS_PERMITIDOS_CONSULTA = Object.keys(CATALOGO_CAMPOS);
