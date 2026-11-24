/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDbPool } from './db';
import {
  normalizarIndice100,
  calcularIndiceShannon,
  SQL_GENERO_NORMALIZADO,
  SQL_FILTRO_SEM_TERCEIRIZADOS,
  SQL_ORIENTACAO_NORMALIZADA,
  SQL_SEGMENTO_COMUNIDADE,
  SQL_IDADE_AGRUPADA,
} from '../lib/escalas';
import { FiltrosGlobaisState } from '../lib/types';
import { MAPA_TEXTOS_AREA, GRANDES_AREAS_CNPQ } from '../lib/areaMap';

export function montarWhereFiltrosGlobais(filtros?: FiltrosGlobaisState): { whereSql: string; params: any[] } {
  const conditions: string[] = [SQL_FILTRO_SEM_TERCEIRIZADOS];
  const params: any[] = [];

  if (!filtros) {
    return { whereSql: `WHERE ${conditions.join(' AND ')}`, params };
  }

  const addInCondition = (colExpr: string, values?: string[]) => {
    if (values && values.length > 0) {
      const placeholders = values.map((v) => {
        params.push(v);
        return `$${params.length}`;
      });
      conditions.push(`${colExpr} IN (${placeholders.join(', ')})`);
    }
  };

  addInCondition('campus', filtros.campus);
  addInCondition('cor_raca', filtros.cor_raca);
  addInCondition('faixa_etaria', filtros.faixa_etaria);
  addInCondition('pcd', filtros.pcd);
  addInCondition(SQL_ORIENTACAO_NORMALIZADA, filtros.orientacao_sexual);
  addInCondition('ocupa_cargo_gestao', filtros.ocupa_cargo_gestao);
  addInCondition('responsabilidade_cuidado', filtros.responsabilidade_cuidado);
  addInCondition(SQL_GENERO_NORMALIZADO, filtros.genero_detalhado);

  if (filtros.vinculo && filtros.vinculo.length > 0) {
    const subConds = filtros.vinculo.map((v) => {
      params.push(`%${v}%`);
      return `vinculo ILIKE $${params.length}`;
    });
    conditions.push(`(${subConds.join(' OR ')})`);
  }

  if (filtros.genero_agrupado && filtros.genero_agrupado.length > 0) {
    addInCondition(SQL_GENERO_NORMALIZADO, filtros.genero_agrupado);
  }

  if (filtros.area_stem && filtros.area_stem !== 'todos') {
    const stemAreas = `('Engenharias e Tecnologia', 'Ciências Exatas e da Terra')`;
    const areaExpr = `(
      CASE
        WHEN area_conhecimento ILIKE '%engenharia%' OR area_conhecimento ILIKE '%computa%' OR area_conhecimento ILIKE '%inform%' OR area_conhecimento ILIKE '%ti%' OR area_conhecimento ILIKE '%eletro%' OR area_conhecimento ILIKE '%mecânica%' THEN 'Engenharias e Tecnologia'
        WHEN area_conhecimento ILIKE '%exata%' OR area_conhecimento ILIKE '%física%' OR area_conhecimento ILIKE '%química%' OR area_conhecimento ILIKE '%matemát%' THEN 'Ciências Exatas e da Terra'
        ELSE 'Outras'
      END
    )`;
    if (filtros.area_stem === 'stem') {
      conditions.push(`${areaExpr} IN ${stemAreas}`);
    } else {
      conditions.push(`${areaExpr} NOT IN ${stemAreas}`);
    }
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereSql, params };
}

export function whereComAnd(whereSql: string, extraCondition: string): string {
  if (whereSql && whereSql.trim().length > 0) {
    return `${whereSql} AND ${extraCondition}`;
  }
  return `WHERE ${extraCondition}`;
}

// ==========================================
// PÁGINA 0: VISÃO GERAL
// ==========================================
export async function obterKpisVisaoGeral(filtros?: FiltrosGlobaisState) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);

  const sql = `
    SELECT
      count(*)::int as total_respondentes,
      count(DISTINCT campus) FILTER (WHERE campus IS NOT NULL AND campus != 'Prefiro não responder')::int as unidades_validas,
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%')::int as total_discentes,
      count(*) FILTER (WHERE vinculo ILIKE '%Efetivo%')::int as total_servidores_efetivos,
      count(*) FILTER (WHERE vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%')::int as total_docentes_efetivos,
      count(*) FILTER (WHERE vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%'))::int as total_taes_efetivos,
      count(*) FILTER (WHERE vinculo ILIKE '%Substituto%')::int as total_substitutos,
      count(*) FILTER (WHERE vinculo ILIKE '%Efetivo%' OR vinculo ILIKE '%Substituto%')::int as total_servidores,
      count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim')::int as vitimizacao_sim,
      count(*) FILTER (WHERE violencia_raca = 'Sim')::int as violencia_raca_sim,
      count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as violencia_genero_sim,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Sim')::int as conhece_denuncia_sim,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Em parte')::int as conhece_denuncia_em_parte,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Não' OR (conhece_mecanismos_denuncia LIKE 'N%o' AND conhece_mecanismos_denuncia != 'Não sei'))::int as conhece_denuncia_nao,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Não sei')::int as conhece_denuncia_nao_sei,
      count(*) FILTER (WHERE mecanismos_efetivos = 'Sim, são muito efetivos')::int as efetividade_muito,
      count(*) FILTER (WHERE mecanismos_efetivos = 'São parcialmente efetivos')::int as efetividade_parcial,
      count(*) FILTER (WHERE mecanismos_efetivos = 'São pouco efetivos')::int as efetividade_pouco,
      count(*) FILTER (WHERE mecanismos_efetivos = 'Não são efetivos')::int as efetividade_nao,
      count(*) FILTER (WHERE mecanismos_efetivos = 'Não sei avaliar')::int as efetividade_nao_sei,
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%' AND desencorajado_participacao IN ('Sim, algumas vezes', 'Sim, frequentemente'))::int as desencorajado_discentes,
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%' AND desencorajado_participacao IS NOT NULL)::int as base_desencorajado_discentes,
      count(*) FILTER (WHERE responsabilidade_cuidado = 'Sim')::int as cuidado_principal,
      count(*) FILTER (WHERE responsabilidade_cuidado = 'Divido a responsabilidade igualmente com outra(s) pessoa(s)')::int as cuidado_dividido,
      avg(CASE
        WHEN seguranca_expressao_opiniao = 'Concordo Totalmente' THEN 5
        WHEN seguranca_expressao_opiniao = 'Concordo' THEN 4
        WHEN seguranca_expressao_opiniao = 'Não concordo nem discordo' THEN 3
        WHEN seguranca_expressao_opiniao = 'Discordo' THEN 2
        WHEN seguranca_expressao_opiniao = 'Discordo Totalmente' THEN 1
        ELSE NULL END)::float as media_q24a,
      avg(CASE
        WHEN ambiente_seguro_respeitoso = 'Concordo Totalmente' THEN 5
        WHEN ambiente_seguro_respeitoso = 'Concordo' THEN 4
        WHEN ambiente_seguro_respeitoso = 'Não concordo nem discordo' THEN 3
        WHEN ambiente_seguro_respeitoso = 'Discordo' THEN 2
        WHEN ambiente_seguro_respeitoso = 'Discordo Totalmente' THEN 1
        ELSE NULL END)::float as media_q24b,
      avg(CASE
        WHEN inclusao_pessoas_trans = 'Concordo Totalmente' THEN 5
        WHEN inclusao_pessoas_trans = 'Concordo' THEN 4
        WHEN inclusao_pessoas_trans = 'Não concordo nem discordo' THEN 3
        WHEN inclusao_pessoas_trans = 'Discordo' THEN 2
        WHEN inclusao_pessoas_trans = 'Discordo Totalmente' THEN 1
        ELSE NULL END)::float as media_q24c,
      avg(CASE
        WHEN maternidade_impacto_carreira = 'Concordo Totalmente' THEN 1
        WHEN maternidade_impacto_carreira = 'Concordo' THEN 2
        WHEN maternidade_impacto_carreira = 'Não concordo nem discordo' THEN 3
        WHEN maternidade_impacto_carreira = 'Discordo' THEN 4
        WHEN maternidade_impacto_carreira = 'Discordo Totalmente' THEN 5
        ELSE NULL END)::float as media_q24d_invertido,
      avg(CASE
        WHEN iniciativas_celebrar_diversidade = 'Concordo Totalmente' THEN 5
        WHEN iniciativas_celebrar_diversidade = 'Concordo' THEN 4
        WHEN iniciativas_celebrar_diversidade = 'Não concordo nem discordo' THEN 3
        WHEN iniciativas_celebrar_diversidade = 'Discordo' THEN 2
        WHEN iniciativas_celebrar_diversidade = 'Discordo Totalmente' THEN 1
        ELSE NULL END)::float as media_q24e,
      avg(CASE
        WHEN curriculos_principios_igualdade = 'Concordo Totalmente' THEN 5
        WHEN curriculos_principios_igualdade = 'Concordo' THEN 4
        WHEN curriculos_principios_igualdade = 'Não concordo nem discordo' THEN 3
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
        WHEN vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%') THEN 'Técnico TAE'
        WHEN vinculo ILIKE '%Substituto%' THEN 'Docente Substituto'
        ELSE 'Prefiro não responder'
      END as vinculo_simplificado,
      ${SQL_GENERO_NORMALIZADO} as genero,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as total
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'campus IS NOT NULL')}
    GROUP BY campus, vinculo_simplificado, ${SQL_GENERO_NORMALIZADO}, ${SQL_IDADE_AGRUPADA}
    ORDER BY campus ASC
  `;

  const [resKpi, resCampus] = await Promise.all([
    pool.query(sql, params),
    pool.query(campusSql, params),
  ]);

  const row = resKpi.rows[0] || {};
  const n = row.total_respondentes || 0;

  const q24Medias = [
    row.media_q24a,
    row.media_q24b,
    row.media_q24c,
    row.media_q24d_invertido,
    row.media_q24e,
    row.media_q24f,
  ].filter((v) => v !== null && !isNaN(v));

  const climaMedia =
    q24Medias.length > 0 ? q24Medias.reduce((a, b) => a + b, 0) / q24Medias.length : 0;
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
      discentes: { n: row.total_discentes, pct: n > 0 ? (row.total_discentes / n) * 100 : 0 },
      servidores_efetivos: { n: row.total_servidores_efetivos, pct: n > 0 ? (row.total_servidores_efetivos / n) * 100 : 0 },
      docentes_efetivos: { n: row.total_docentes_efetivos, pct: n > 0 ? (row.total_docentes_efetivos / n) * 100 : 0 },
      taes_efetivos: { n: row.total_taes_efetivos, pct: n > 0 ? (row.total_taes_efetivos / n) * 100 : 0 },
      docentes_substitutos: { n: row.total_substitutos, pct: n > 0 ? (row.total_substitutos / n) * 100 : 0 },
      servidores_total: { n: row.total_servidores, pct: n > 0 ? (row.total_servidores / n) * 100 : 0 },
      taxa_vitimizacao: {
        pct: n > 0 ? Number(((row.vitimizacao_sim / n) * 100).toFixed(1)) : 0,
        n_sim: row.vitimizacao_sim,
        n_base: n,
        raca_sim: row.violencia_raca_sim,
        genero_sim: row.violencia_genero_sim,
      },
      indice_clima: {
        score: Number(indiceClima.toFixed(1)),
        media_escala: Number(climaMedia.toFixed(2)),
        n_base: n,
      },
      conhece_mecanismos: {
        pct: n > 0 ? Number(((conheceTotal / n) * 100).toFixed(1)) : 0,
        n_sim_total: conheceTotal,
        n_sim: row.conhece_denuncia_sim,
        n_em_parte: row.conhece_denuncia_em_parte,
        n_nao_total: naoConheceTotal,
        pct_nao_total: n > 0 ? Number(((naoConheceTotal / n) * 100).toFixed(1)) : 0,
        n_nao: row.conhece_denuncia_nao,
        n_nao_sei: row.conhece_denuncia_nao_sei,
        n_base: n,
      },
      confia_mecanismos: {
        pct: baseAvaliouEfetividade > 0 ? Number(((efetivosTotal / baseAvaliouEfetividade) * 100).toFixed(1)) : 0,
        pct_total_amostra: n > 0 ? Number(((efetivosTotal / n) * 100).toFixed(1)) : 0,
        n_sim: efetivosTotal,
        n_muito: row.efetividade_muito,
        n_parcial: row.efetividade_parcial,
        n_negativo: poucoOuNaoEfetivosTotal,
        pct_negativo: baseAvaliouEfetividade > 0 ? Number(((poucoOuNaoEfetivosTotal / baseAvaliouEfetividade) * 100).toFixed(1)) : 0,
        n_pouco: row.efetividade_pouco,
        n_nao: row.efetividade_nao,
        n_nao_sei: row.efetividade_nao_sei,
        n_base: baseAvaliouEfetividade,
        n_amostra: n,
      },
      desencorajado_estudantes: {
        pct: row.base_desencorajado_discentes > 0 ? Number(((row.desencorajado_discentes / row.base_desencorajado_discentes) * 100).toFixed(1)) : 0,
        n_sim: row.desencorajado_discentes,
        n_base: row.base_desencorajado_discentes,
      },
      responsabilidade_cuidado: {
        pct: n > 0 ? Number(((cuidadoTotal / n) * 100).toFixed(1)) : 0,
        n_total_cuidado: cuidadoTotal,
        n_principal: row.cuidado_principal,
        pct_principal: n > 0 ? Number(((row.cuidado_principal / n) * 100).toFixed(1)) : 0,
        n_dividido: row.cuidado_dividido,
        pct_dividido: n > 0 ? Number(((row.cuidado_dividido / n) * 100).toFixed(1)) : 0,
        n_base: n,
      },
    },
    campus_distribuicao: resCampus.rows,
  };
}

// ==========================================
// PÁGINA 1: PERFIL E REPRESENTATIVIDADE
// ==========================================
export async function obterDadosPerfil(filtros?: FiltrosGlobaisState) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);

  const sqlDistribPorSegmento = (campoExpr: string, extraWhere?: string) => `
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
    resOrientacao,
  ] = await Promise.all([
    pool.query(sqlTotaisSegmento, params),
    pool.query(sqlDistribPorSegmento(SQL_GENERO_NORMALIZADO, `${SQL_GENERO_NORMALIZADO} IS NOT NULL`), params),
    pool.query(sqlDistribPorSegmento('cor_raca', 'cor_raca IS NOT NULL'), params),
    pool.query(sqlDistribPorSegmento('faixa_etaria', 'faixa_etaria IS NOT NULL'), params),
    pool.query(sqlDistribPorSegmento('pcd', 'pcd IS NOT NULL'), params),
    pool.query(sqlDistribPorSegmento(SQL_ORIENTACAO_NORMALIZADA, `${SQL_ORIENTACAO_NORMALIZADA} IS NOT NULL`), params),
  ]);

  const total = resTotaisSeg.rows.reduce((acc: number, r: any) => acc + Number(r.n), 0);

  return {
    total,
    totais_segmento: resTotaisSeg.rows,
    genero_detalhado: resGeneroNormalizado.rows,
    cor_raca: resCorRaca.rows,
    faixa_etaria: resFaixa.rows,
    pcd: resPcd.rows,
    orientacao_sexual: resOrientacao.rows,
  };
}

// ==========================================
// PÁGINA 2: CARREIRA, PROGRESSÃO E EQUIDADE (Servidores)
// ==========================================
export async function obterDadosCarreira(filtros?: FiltrosGlobaisState) {
  const pool = getDbPool();
  // Base estrita: servidores efetivos + substitutos (terceirizados e discentes excluídos)
  const baseFiltros: FiltrosGlobaisState = {
    ...filtros,
    vinculo: ['Docente', 'Efetivo', 'Substituto'],
  };
  const { whereSql, params } = montarWhereFiltrosGlobais(baseFiltros);

  // 1. Composição de servidores: cargo x genero normalizado
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

  // 2. Proporção em cargos de gestão por raça e gênero normalizado
  const sqlGestaoIntersec = `
    SELECT
      ocupa_cargo_gestao,
      CASE
        WHEN cor_raca IN ('Preta', 'Parda') THEN 'Pessoa Negra (Preta/Parda)'
        WHEN cor_raca = 'Branca' THEN 'Branca'
        ELSE 'Outras / Não informado'
      END as raca_grp,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `ocupa_cargo_gestao IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY ocupa_cargo_gestao, raca_grp, genero_grp
  `;

  // 3. Tipos de função de gestão (CD, FG, FCC) com segmento docente/tecnico
  const sqlFuncaoGestao = `
    SELECT
      CASE
        WHEN funcao_gestao ILIKE '%CD%' THEN 'CD (Direção)'
        WHEN funcao_gestao ILIKE '%FG%' THEN 'FG (Gratificada)'
        WHEN funcao_gestao ILIKE '%FCC%' OR funcao_gestao ILIKE '%FUC%' THEN 'FCC/FUC (Coordenação)'
        WHEN funcao_gestao = 'Prefiro não responder' THEN 'Prefiro não responder'
        ELSE 'Outra / Não informado'
      END as funcao,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `funcao_gestao IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY funcao, genero_grp, segmento
    ORDER BY n DESC
  `;

  // 4. Progressão por mérito Q22 (nota 1 a 5) com segmento docente/tecnico
  const sqlProgressao = `
    SELECT
      progressao_merito_nota as nota,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
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
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      round(avg(progressao_merito_nota::float)::numeric, 2)::float as media,
      round(percentile_cont(0.5) within group (order by progressao_merito_nota::float)::numeric, 2)::float as mediana,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `progressao_merito_nota IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY genero_grp, segmento
  `;

  // 5. Acesso a oportunidades Q23 com segmento docente/tecnico
  const sqlAcesso = `
    SELECT
      acesso_oportunidades,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `acesso_oportunidades IS NOT NULL AND ${SQL_GENERO_NORMALIZADO} IS NOT NULL`)}
    GROUP BY acesso_oportunidades, genero_grp, segmento
    ORDER BY n DESC
  `;

  // 6. Evitou candidatura por cuidado com segmento docente/tecnico, genero normalizado, cor/raca e pcd
  const sqlEvitouCuidado = `
    SELECT
      responsabilidade_cuidado,
      evitou_candidatura_cuidado,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
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

  // 7. PGD
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
    resPgd,
  ] = await Promise.all([
    pool.query(sqlFunilCargo, params),
    pool.query(sqlGestaoIntersec, params),
    pool.query(sqlFuncaoGestao, params),
    pool.query(sqlProgressao, params),
    pool.query(sqlProgressaoMedias, params),
    pool.query(sqlAcesso, params),
    pool.query(sqlEvitouCuidado, params),
    pool.query(sqlPgd, params),
  ]);

  return {
    base_descricao: 'Servidores docentes e TAE (efetivos e substitutos). Terceirizados excluídos.',
    funil_cargo: resFunilCargo.rows,
    gestao_interseccional: resGestaoIntersec.rows,
    funcoes_gestao: resFuncaoGestao.rows,
    progressao_distribuicao: resProgressao.rows,
    progressao_medias: resProgressaoMedias.rows,
    acesso_oportunidades: resAcesso.rows,
    evitou_candidatura_cuidado: resEvitouCuidado.rows,
    adesao_pgd: resPgd.rows,
  };
}

// ==========================================
// PÁGINA 3: AMBIENTE, SEGURANÇA E VIOLÊNCIAS
// ==========================================
export async function obterDadosAmbienteViolencias(filtros?: FiltrosGlobaisState) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);

  // 1. Q24a-f divergente
  const itensQ24 = [
    { key: 'seguranca_expressao_opiniao', label: 'Q24a: Segurança para expressar opiniões', invertido: false },
    { key: 'ambiente_seguro_respeitoso', label: 'Q24b: Ambiente seguro e respeitoso', invertido: false },
    { key: 'inclusao_pessoas_trans', label: 'Q24c: Inclusão de pessoas trans', invertido: false },
    { key: 'maternidade_impacto_carreira', label: 'Q24d: Maternidade impacta negativamente a carreira', invertido: true },
    { key: 'iniciativas_celebrar_diversidade', label: 'Q24e: Iniciativas de celebração da diversidade', invertido: false },
    { key: 'curriculos_principios_igualdade', label: 'Q24f: Currículos com igualdade de gênero', invertido: false },
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
      distribuicao: res.rows,
    };
  });

  // 2. Percentual de discriminação direta por raça com suporte a filtros de segmento, gênero e idade
  const sqlViolenciaRacaPorCor = `
    SELECT
      cor_raca,
      ${SQL_SEGMENTO_COMUNIDADE} as segmento,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_raca = 'Sim')::int as n_sim
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'cor_raca IS NOT NULL')}
    GROUP BY cor_raca, segmento, genero_grp, idade_grp
    ORDER BY cor_raca
  `;

  // 3. Percentual de discriminação de gênero/orientação usando a Regra de Ouro de Gênero Normalizado
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

  // 4. Vitimização interseccional (cor/raça x gênero normalizado)
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

  // 5. Desencorajamento discente Q15
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

  // 6. Funil de denúncia (Q25 -> Q26 -> Q27) separando Servidor Efetivo em Docentes e Técnicos TAEs
  const sqlFunilDenuncia = `
    SELECT
      CASE
        WHEN vinculo ILIKE '%Discente%' THEN 'Discentes'
        WHEN vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%' THEN 'Docentes'
        WHEN vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%') THEN 'Técnicos TAEs'
        WHEN vinculo ILIKE '%Substituto%' THEN 'Docentes Substitutos'
        ELSE 'Outro'
      END as vinculo_grp,
      ${SQL_GENERO_NORMALIZADO} as genero_grp,
      cor_raca,
      ${SQL_IDADE_AGRUPADA} as idade_grp,
      count(*)::int as base_total,
      count(*)::int as total_respondentes,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Sim')::int as etapa_1_conhece,
      count(*) FILTER (WHERE mecanismos_efetivos IN ('Sim, são muito efetivos', 'São parcialmente efetivos'))::int as etapa_2_efetivos,
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
    resFunilDenuncia,
  ] = await Promise.all([
    Promise.all(distribuicaoQ24Promises),
    pool.query(sqlViolenciaRacaPorCor, params),
    pool.query(sqlViolenciaOrientacaoPorGenero, params),
    pool.query(sqlViolenciaPorOrientacao, params),
    pool.query(sqlInterseccional, params),
    pool.query(sqlDesencorajamento, params),
    pool.query(sqlFunilDenuncia, params),
  ]);

  const climaCampus100: any[] = [];

  return {
    q24_itens: itensQ24Resultados,
    clima_por_campus: climaCampus100,
    violencia_por_cor: resViolenciaCor.rows,
    violencia_por_genero: resViolenciaGen.rows,
    violencia_por_orientacao: resViolenciaOri.rows,
    vitimizacao_interseccional: resInterseccional.rows,
    desencorajamento_estudantes: resDesencorajamento.rows,
    funil_denuncia: resFunilDenuncia.rows,
  };
}

// ==========================================
// PÁGINA 4: NÚCLEOS, ASSESSORIAS E POLÍTICAS
// ==========================================
export async function obterDadosNucleos(filtros?: FiltrosGlobaisState) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);

  const nucleos = [
    { key: 'avaliacao_naaf', nome: 'NAAF (Ações Afirmativas)' },
    { key: 'avaliacao_neabi', nome: 'NEABI (Afro-brasileiro e Indígena)' },
    { key: 'avaliacao_nepgs', nome: 'NEPGS (Gênero e Sexualidade)' },
    { key: 'avaliacao_assessoria_afirmativas', nome: 'Assessoria de Ações Afirmativas, Inclusivas e Diversidade' },
    { key: 'avaliacao_assessoria_genero', nome: 'Assessoria de Gênero e Sexualidade' },
    { key: 'avaliacao_assessoria_etnico_raciais', nome: 'Assessoria de Relações Étnico-raciais' },
  ];

  // 1. Distribuição de avaliação e percentual "Não conheço" com suporte a Segmento e Idade
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
        respostas: res.rows,
      };
    })
  );

  // 2. Heatmap campus x núcleo: média de qualidade (1 a 5, excluindo "Não conheço" e "Prefiro não responder" no campus)
  const heatmapQueries = nucleos.map((nuc) => `
    avg(CASE
      WHEN "${nuc.key}" = 'Muito Boa' THEN 5
      WHEN "${nuc.key}" = 'Boa' THEN 4
      WHEN "${nuc.key}" = 'Regular' THEN 3
      WHEN "${nuc.key}" = 'Ruim' THEN 2
      WHEN "${nuc.key}" = 'Muito Ruim' THEN 1
      ELSE NULL END)::float as media_${nuc.key},
    count(*) FILTER (WHERE "${nuc.key}" IN ('Muito Boa', 'Boa', 'Regular', 'Ruim', 'Muito Ruim'))::int as validos_${nuc.key},
    count(*) FILTER (WHERE "${nuc.key}" = 'Não conheço')::int as desconhece_${nuc.key}
  `);

  const sqlHeatmap = `
    SELECT
      campus,
      count(*)::int as n_campus,
      ${heatmapQueries.join(',\n')}
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "campus IS NOT NULL AND campus != 'Prefiro não responder'")}
    GROUP BY campus
    ORDER BY campus
  `;

  // 3. Eficácia das campanhas Q28 separando Servidor Efetivo em Docentes e Técnicos TAEs + Idade
  const sqlCampanhas = `
    SELECT
      coalesce(eficacia_capacitacoes, 'Não informado') as resposta,
      CASE
        WHEN vinculo ILIKE '%Discente%' THEN 'Discentes'
        WHEN vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%' THEN 'Docentes'
        WHEN vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%') THEN 'Técnicos TAEs'
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
    pool.query(sqlCampanhas, params),
  ]);

  return {
    distribuicao_nucleos: distNucleos,
    heatmap_campus_nucleo: resHeatmap.rows,
    eficacia_campanhas: resCampanhas.rows,
  };
}

// ==========================================
// PÁGINA 5: CUIDADO, PARENTALIDADE E PERMANÊNCIA
// ==========================================
export async function obterDadosCuidado(filtros?: FiltrosGlobaisState) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);

  // 1. Q9 Responsabilidade de cuidado por gênero normalizado, segmento e idade
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

  // 2. Q30 Políticas de apoio ao cuidado
  const sqlQ30 = `
    SELECT
      politica_apoio_cuidado,
      campus,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'politica_apoio_cuidado IS NOT NULL')}
    GROUP BY politica_apoio_cuidado, campus
  `;

  // 3. Licenças Q31, Q32 e apoio a pais estudantes Q33 (com recorte por gênero normalizado, segmento e idade)
  const sqlLicencaSegmento = (coluna: string) => `
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
    pool.query(sqlLicencaSegmento('licenca_maternidade_suficiente'), params),
    pool.query(sqlLicencaSegmento('licenca_paternidade_suficiente'), params),
    pool.query(sqlLicencaSegmento('apoio_pais_estudantes_suficiente'), params),
  ]);

  // 4. Maternidade como impacto na carreira Q24d (invertido) com segmento, raça e idade
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

  // 5. Estudantes com responsabilidade de cuidado por campus, nível do curso e idade
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
    pool.query(sqlEstudantesCuidado, params),
  ]);

  return {
    responsabilidade_cuidado: resQ9.rows,
    politicas_cuidado_q30: resQ30.rows,
    licenca_maternidade: resLicMaternidade.rows,
    licenca_paternidade: resLicPaternidade.rows,
    apoio_pais_estudantes: resApoioPais.rows,
    maternidade_carreira_q24d: resMaternidadeImpacto.rows,
    estudantes_cuidado: resEstudantesCuidado.rows,
  };
}

// ==========================================
// PÁGINA 6: STEM E MASCULINIZAÇÃO DAS ÁREAS
// ==========================================
export async function obterDadosStem(filtros?: FiltrosGlobaisState) {
  const pool = getDbPool();
  const { whereSql, params } = montarWhereFiltrosGlobais(filtros);

  // Buscar todos os registros de estudantes com area_conhecimento preenchida e gênero válido
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

  // Mapeamento e agregação determinística via areaMap.ts
  const contagemPorGrandeArea: Record<
    string,
    {
      total: number;
      mulheres: number;
      homens: number;
      mulheres_trans: number;
      homens_trans: number;
      travestis: number;
      nao_binarias: number;
      negros: number;
    }
  > = {};
  const coberturaTextos: Record<string, { textoOriginal: string; grandeArea: string; n: number }> = {};
  const desencorajamentoPorArea: Record<string, { total: number; desencorajados: number }> = {
    STEM: { total: 0, desencorajados: 0 },
    NaoSTEM: { total: 0, desencorajados: 0 },
  };
  const registrosDetalhadosMap: Record<
    string,
    {
      grande_area: string;
      is_stem: boolean;
      genero_grp: string;
      cor_raca: string;
      pcd: string;
      idade_grp: string | null;
      desencorajado_participacao: string | null;
      n: number;
    }
  > = {};

  GRANDES_AREAS_CNPQ.forEach((ga) => {
    contagemPorGrandeArea[ga] = {
      total: 0,
      mulheres: 0,
      homens: 0,
      mulheres_trans: 0,
      homens_trans: 0,
      travestis: 0,
      nao_binarias: 0,
      negros: 0,
    };
  });

  for (const row of res.rows) {
    const raw = String(row.area_conhecimento || '').trim();
    const ga = MAPA_TEXTOS_AREA[raw.toLowerCase()] || 'Não classificada';
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
        negros: 0,
      };
    }

    contagemPorGrandeArea[ga].total += n;
    if (row.genero_grp === 'Mulher') contagemPorGrandeArea[ga].mulheres += n;
    else if (row.genero_grp === 'Homem') contagemPorGrandeArea[ga].homens += n;
    else if (row.genero_grp === 'Mulher Trans') contagemPorGrandeArea[ga].mulheres_trans += n;
    else if (row.genero_grp === 'Homem Trans') contagemPorGrandeArea[ga].homens_trans += n;
    else if (row.genero_grp === 'Travesti') contagemPorGrandeArea[ga].travestis += n;
    else if (row.genero_grp === 'Não-binários') contagemPorGrandeArea[ga].nao_binarias += n;

    if (row.cor_raca === 'Preta' || row.cor_raca === 'Parda') {
      contagemPorGrandeArea[ga].negros += n;
    }

    // Cobertura
    if (!coberturaTextos[raw]) {
      coberturaTextos[raw] = { textoOriginal: raw, grandeArea: ga, n: 0 };
    }
    coberturaTextos[raw].n += n;

    // Desencorajamento
    const isStem = ga === 'Engenharias e Tecnologia' || ga === 'Ciências Exatas e da Terra';
    const chaveStem = isStem ? 'STEM' : 'NaoSTEM';
    desencorajamentoPorArea[chaveStem].total += n;
    if (row.desencorajado_participacao === 'Sim, algumas vezes' || row.desencorajado_participacao === 'Sim, frequentemente') {
      desencorajamentoPorArea[chaveStem].desencorajados += n;
    }

    // Registro detalhado agrupado por Grande Área + recortes demográficos
    const detKey = `${ga}|||${row.genero_grp || ''}|||${row.cor_raca || ''}|||${row.pcd || ''}|||${row.idade_grp || ''}|||${row.desencorajado_participacao || ''}`;
    if (!registrosDetalhadosMap[detKey]) {
      registrosDetalhadosMap[detKey] = {
        grande_area: ga,
        is_stem: isStem,
        genero_grp: row.genero_grp,
        cor_raca: row.cor_raca,
        pcd: row.pcd,
        idade_grp: row.idade_grp,
        desencorajado_participacao: row.desencorajado_participacao,
        n: 0,
      };
    }
    registrosDetalhadosMap[detKey].n += n;
  }

  const areasOrdenadasPorMulheres = Object.entries(contagemPorGrandeArea)
    .filter(([_, v]) => v.total > 0)
    .map(([area, v]) => ({
      area,
      total: v.total,
      mulheres: v.mulheres,
      homens: v.homens,
      mulheres_trans: v.mulheres_trans,
      homens_trans: v.homens_trans,
      travestis: v.travestis,
      nao_binarias: v.nao_binarias,
      outras: v.mulheres_trans + v.homens_trans + v.travestis + v.nao_binarias,
      pct_mulheres: Number(((v.mulheres / v.total) * 100).toFixed(1)),
      pct_negros: Number(((v.negros / v.total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.pct_mulheres - a.pct_mulheres);

  const coberturaLista = Object.values(coberturaTextos).sort((a, b) => b.n - a.n);

  return {
    areas_ranking_mulheres: areasOrdenadasPorMulheres,
    registros_detalhados: Object.values(registrosDetalhadosMap),
    desencorajamento_stem: {
      stem_pct:
        desencorajamentoPorArea.STEM.total > 0
          ? Number(((desencorajamentoPorArea.STEM.desencorajados / desencorajamentoPorArea.STEM.total) * 100).toFixed(1))
          : 0,
      stem_n: desencorajamentoPorArea.STEM.total,
      stem_desencorajados: desencorajamentoPorArea.STEM.desencorajados,
      nao_stem_pct:
        desencorajamentoPorArea.NaoSTEM.total > 0
          ? Number(((desencorajamentoPorArea.NaoSTEM.desencorajados / desencorajamentoPorArea.NaoSTEM.total) * 100).toFixed(1))
          : 0,
      nao_stem_n: desencorajamentoPorArea.NaoSTEM.total,
      nao_stem_desencorajados: desencorajamentoPorArea.NaoSTEM.desencorajados,
    },
    cobertura: coberturaLista,
  };
}
