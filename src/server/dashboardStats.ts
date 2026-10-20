/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDbPool } from './db';
import { normalizarIndice100, calcularIndiceShannon } from '../lib/escalas';
import { FiltrosGlobaisState } from '../lib/types';
import { MAPA_TEXTOS_AREA, GRANDES_AREAS_CNPQ } from '../lib/areaMap';

export function montarWhereFiltrosGlobais(filtros?: FiltrosGlobaisState): { whereSql: string; params: any[] } {
  if (!filtros) return { whereSql: '', params: [] };

  const conditions: string[] = [];
  const params: any[] = [];

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
  addInCondition('orientacao_sexual', filtros.orientacao_sexual);
  addInCondition('ocupa_cargo_gestao', filtros.ocupa_cargo_gestao);
  addInCondition('responsabilidade_cuidado', filtros.responsabilidade_cuidado);
  addInCondition('genero', filtros.genero_detalhado);

  if (filtros.vinculo && filtros.vinculo.length > 0) {
    const subConds = filtros.vinculo.map((v) => {
      params.push(`%${v}%`);
      return `vinculo ILIKE $${params.length}`;
    });
    conditions.push(`(${subConds.join(' OR ')})`);
  }

  if (filtros.genero_agrupado && filtros.genero_agrupado.length > 0) {
    const exprAgrupado = `(
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        WHEN genero ILIKE '%não-binário%' OR genero ILIKE '%nao-binario%' OR genero ILIKE '%travesti%' OR genero ILIKE '%agênero%' THEN 'Pessoa não-binária/outras'
        WHEN genero = 'Prefiro não responder' THEN 'Prefiro não responder'
        ELSE 'Pessoa não-binária/outras'
      END
    )`;
    addInCondition(exprAgrupado, filtros.genero_agrupado);
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
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%')::int as total_discentes,
      count(*) FILTER (WHERE vinculo ILIKE '%Efetivo%')::int as total_servidores_efetivos,
      count(*) FILTER (WHERE vinculo ILIKE '%Substituto%')::int as total_substitutos,
      count(*) FILTER (WHERE vinculo ILIKE '%Terceirizado%')::int as total_terceirizados,
      count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim')::int as vitimizacao_sim,
      count(*) FILTER (WHERE violencia_raca = 'Sim')::int as violencia_raca_sim,
      count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as violencia_genero_sim,
      count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Sim')::int as conhece_denuncia_sim,
      count(*) FILTER (WHERE mecanismos_efetivos IN ('Sim, são muito efetivos', 'São parcialmente efetivos'))::int as confia_efetividade,
      count(*) FILTER (WHERE mecanismos_efetivos IS NOT NULL)::int as base_efetividade,
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%' AND desencorajado_participacao IN ('Sim, algumas vezes', 'Sim, frequentemente'))::int as desencorajado_discentes,
      count(*) FILTER (WHERE vinculo ILIKE '%Discente%' AND desencorajado_participacao IS NOT NULL)::int as base_desencorajado_discentes,
      count(*) FILTER (WHERE responsabilidade_cuidado = 'Sim')::int as cuidado_principal,
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
        WHEN vinculo ILIKE '%Efetivo%' THEN 'Servidor Efetivo'
        WHEN vinculo ILIKE '%Substituto%' THEN 'Docente Substituto'
        WHEN vinculo ILIKE '%Terceirizado%' THEN 'Terceirizado'
        ELSE 'Não informado'
      END as vinculo_simplificado,
      count(*)::int as total
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY campus, vinculo_simplificado
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

  return {
    n_total: 4878,
    n_filtrado: n,
    kpis: {
      total_respondentes: n,
      discentes: { n: row.total_discentes, pct: n > 0 ? (row.total_discentes / n) * 100 : 0 },
      servidores_efetivos: { n: row.total_servidores_efetivos, pct: n > 0 ? (row.total_servidores_efetivos / n) * 100 : 0 },
      docentes_substitutos: { n: row.total_substitutos, pct: n > 0 ? (row.total_substitutos / n) * 100 : 0 },
      terceirizados: { n: row.total_terceirizados, pct: n > 0 ? (row.total_terceirizados / n) * 100 : 0 },
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
        pct: n > 0 ? Number(((row.conhece_denuncia_sim / n) * 100).toFixed(1)) : 0,
        n_sim: row.conhece_denuncia_sim,
        n_base: n,
      },
      confia_mecanismos: {
        pct: row.base_efetividade > 0 ? Number(((row.confia_efetividade / row.base_efetividade) * 100).toFixed(1)) : 0,
        n_sim: row.confia_efetividade,
        n_base: row.base_efetividade,
      },
      desencorajado_estudantes: {
        pct: row.base_desencorajado_discentes > 0 ? Number(((row.desencorajado_discentes / row.base_desencorajado_discentes) * 100).toFixed(1)) : 0,
        n_sim: row.desencorajado_discentes,
        n_base: row.base_desencorajado_discentes,
      },
      responsabilidade_cuidado: {
        pct: n > 0 ? Number(((row.cuidado_principal / n) * 100).toFixed(1)) : 0,
        n_sim: row.cuidado_principal,
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

  const sqlDistrib = (campo: string, alias = 'categoria') => `
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
    resHeatmap,
  ] = await Promise.all([
    pool.query(sqlDistrib('campus'), params),
    pool.query(sqlDistrib('vinculo'), params),
    pool.query(sqlDistrib('genero'), params),
    pool.query(
      `SELECT
        CASE
          WHEN genero ILIKE '%mulher%' THEN 'Mulher'
          WHEN genero ILIKE '%homem%' THEN 'Homem'
          WHEN genero ILIKE '%não-binário%' OR genero ILIKE '%nao-binario%' OR genero ILIKE '%travesti%' OR genero ILIKE '%agênero%' THEN 'Pessoa não-binária/outras'
          WHEN genero = 'Prefiro não responder' THEN 'Prefiro não responder'
          ELSE 'Pessoa não-binária/outras'
        END as categoria,
        count(*)::int as n
      FROM public.respostas_pgs
      ${whereSql}
      GROUP BY categoria
      ORDER BY n DESC`,
      params
    ),
    pool.query(sqlDistrib('cor_raca'), params),
    pool.query(sqlDistrib('faixa_etaria'), params),
    pool.query(sqlDistrib('pcd'), params),
    pool.query(sqlDistrib('nome_social'), params),
    pool.query(sqlDistrib('orientacao_sexual'), params),
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
    ),
  ]);

  // Total geral filtrado
  const total = resCampus.rows.reduce((acc: number, r: any) => acc + Number(r.n), 0);

  // Shannon Diversity Index por campus e por vínculo
  const shannonPorCampus: Record<string, number> = {};
  const campusGroups: Record<string, Record<string, number>> = {};
  resHeatmap.rows.forEach((r: any) => {
    if (!campusGroups[r.campus]) campusGroups[r.campus] = {};
    campusGroups[r.campus][r.vinculo_grp] = Number(r.n);
  });
  Object.keys(campusGroups).forEach((c) => {
    shannonPorCampus[c] = Number(calcularIndiceShannon(campusGroups[c]).toFixed(1));
  });

  // Tabela de pluralidade (categorias com mais de 1 resposta para gênero e orientação)
  const pluralidade = {
    genero: resGeneroDet.rows.filter((r: any) => r.categoria && r.n > 1).length,
    cor_raca: resCorRaca.rows.filter((r: any) => r.categoria && r.n > 0).length,
    orientacao_sexual: resOrientacao.rows.filter((r: any) => r.categoria && r.n > 1).length,
    pcd: resPcd.rows.filter((r: any) => r.categoria && r.n > 0).length,
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
    pluralidade,
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

  // 1. Funil de liderança: cargo x genero agrupado e cargo x raça para ocupa_cargo_gestao
  const sqlFunilCargo = `
    SELECT
      cargo,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Pessoa não-binária/outras'
      END as genero_grp,
      ocupa_cargo_gestao,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'cargo IS NOT NULL')}
    GROUP BY cargo, genero_grp, ocupa_cargo_gestao
    ORDER BY cargo, genero_grp
  `;

  // 2. Proporção em cargos de gestão por raça e gênero
  const sqlGestaoIntersec = `
    SELECT
      ocupa_cargo_gestao,
      CASE
        WHEN cor_raca IN ('Preta', 'Parda') THEN 'Pessoa Negra (Preta/Parda)'
        WHEN cor_raca = 'Branca' THEN 'Branca'
        ELSE 'Outras / Não informado'
      END as raca_grp,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Pessoa não-binária/outras'
      END as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'ocupa_cargo_gestao IS NOT NULL')}
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
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Outras identidades'
      END as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'funcao_gestao IS NOT NULL')}
    GROUP BY funcao, genero_grp, segmento
    ORDER BY n DESC
  `;

  // 4. Progressão por mérito Q22 (nota 1 a 5) com segmento docente/tecnico
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
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'progressao_merito_nota IS NOT NULL')}
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
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      round(avg(progressao_merito_nota::float)::numeric, 2)::float as media,
      round(percentile_cont(0.5) within group (order by progressao_merito_nota::float)::numeric, 2)::float as mediana,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'progressao_merito_nota IS NOT NULL')}
    GROUP BY genero_grp, segmento
  `;

  // 5. Acesso a oportunidades Q23 com segmento docente/tecnico
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
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'acesso_oportunidades IS NOT NULL')}
    GROUP BY acesso_oportunidades, genero_grp, segmento
    ORDER BY n DESC
  `;

  // 6. Evitou candidatura por cuidado (Tabela 2x2 e cortes) com segmento docente/tecnico e genero
  const sqlEvitouCuidado = `
    SELECT
      responsabilidade_cuidado,
      evitou_candidatura_cuidado,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulheres'
        WHEN genero ILIKE '%homem%' THEN 'Homens'
        ELSE 'Outras'
      END as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'evitou_candidatura_cuidado IS NOT NULL')}
    GROUP BY responsabilidade_cuidado, evitou_candidatura_cuidado, segmento, genero_grp
  `;

  // 7. PGD
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
    ${whereComAnd(whereSql, 'adesao_pgd IS NOT NULL')}
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
        CASE
          WHEN cargo ILIKE '%Docente%' THEN 'docentes'
          WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
          WHEN vinculo ILIKE '%Discente%' THEN 'discentes'
          ELSE 'outros'
        END as segmento,
        CASE
          WHEN genero ILIKE '%mulher%' THEN 'Mulheres'
          WHEN genero ILIKE '%homem%' THEN 'Homens'
          ELSE 'Outras identidades'
        END as genero_grp,
        count(*)::int as n
      FROM public.respostas_pgs
      ${whereSql}
      GROUP BY resposta, segmento, genero_grp
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

  // 2. Taxas de violência direta por raça com suporte a filtros de segmento e gênero
  const sqlViolenciaRacaPorCor = `
    SELECT
      cor_raca,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        WHEN vinculo ILIKE '%Discente%' THEN 'discentes'
        ELSE 'outros'
      END as segmento,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulheres'
        WHEN genero ILIKE '%homem%' THEN 'Homens'
        ELSE 'Outras identidades'
      END as genero_grp,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_raca = 'Sim')::int as n_sim
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY cor_raca, segmento, genero_grp
    ORDER BY cor_raca
  `;

  // 3. Taxas de violência de gênero/orientação com suporte a filtros de segmento e gênero
  const sqlViolenciaOrientacaoPorGenero = `
    SELECT
      CASE
        WHEN genero ILIKE '%trans%' THEN 'Pessoas Trans/Travestis'
        WHEN genero ILIKE '%não-binário%' OR genero ILIKE '%nao-binario%' THEN 'Não-binários'
        WHEN genero ILIKE '%mulher%' THEN 'Mulheres Cis'
        WHEN genero ILIKE '%homem%' THEN 'Homens Cis'
        ELSE 'Outras identidades'
      END as grupo_genero,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        WHEN vinculo ILIKE '%Discente%' THEN 'discentes'
        ELSE 'outros'
      END as segmento,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulheres'
        WHEN genero ILIKE '%homem%' THEN 'Homens'
        ELSE 'Outras identidades'
      END as genero_grp,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as n_sim
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY grupo_genero, segmento, genero_grp
    ORDER BY grupo_genero
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

  // 4. Vitimização interseccional (cor/raça x gênero)
  const sqlInterseccional = `
    SELECT
      cor_raca,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulheres'
        WHEN genero ILIKE '%homem%' THEN 'Homens'
        ELSE 'Não-binárias / Trans / Outras'
      END as genero_grp,
      count(*)::int as n_total,
      count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim')::int as n_vitimas,
      round((count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float as taxa_pct
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY cor_raca, genero_grp
    ORDER BY cor_raca, genero_grp
  `;

  // 5. Desencorajamento discente Q15
  const sqlDesencorajamento = `
    SELECT
      desencorajado_participacao,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Não-binária / Outras'
      END as genero_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "vinculo ILIKE '%Discente%' AND desencorajado_participacao IS NOT NULL")}
    GROUP BY desencorajado_participacao, genero_grp
    ORDER BY desencorajado_participacao
  `;

  // 6. Funil de denúncia (Q25 -> Q26 -> Q27)
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
      count(*) FILTER (WHERE mecanismos_efetivos IN ('Sim, são muito efetivos', 'São parcialmente efetivos'))::int as etapa_2_efetivos,
      count(*) FILTER (WHERE mecanismos_resultados_justos IN ('Sim, geram resultados justos', 'Sim, geram resultados parcialmente justos'))::int as etapa_3_justos
    FROM public.respostas_pgs
    ${whereSql}
    GROUP BY vinculo_grp
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
    { key: 'avaliacao_nepgs', nome: 'NEPG (Gênero)' },
    { key: 'avaliacao_assessoria_afirmativas', nome: 'Assessoria Ações Afirmativas' },
    { key: 'avaliacao_assessoria_genero', nome: 'Assessoria de Gênero' },
    { key: 'avaliacao_assessoria_etnico_raciais', nome: 'Assessoria Étnico-Raciais' },
  ];

  // 1. Distribuição de avaliação e percentual "Não conheço"
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
        respostas: res.rows,
      };
    })
  );

  // 2. Heatmap campus x núcleo: média de qualidade (1 a 5, excluindo "Não conheço")
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
    ${whereSql}
    GROUP BY campus
    ORDER BY campus
  `;

  // 3. Eficácia das campanhas Q28
  const sqlCampanhas = `
    SELECT
      coalesce(eficacia_capacitacoes, 'Não informado') as resposta,
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

  // 1. Q9 Responsabilidade de cuidado por gênero agrupado e vínculo
  const sqlQ9 = `
    SELECT
      responsabilidade_cuidado,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Não-binária / Outras'
      END as genero_grp,
      CASE
        WHEN vinculo ILIKE '%Discente%' THEN 'Discente'
        ELSE 'Servidor(a)'
      END as vinculo_grp,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'responsabilidade_cuidado IS NOT NULL')}
    GROUP BY responsabilidade_cuidado, genero_grp, vinculo_grp
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

  // 3. Licenças Q31, Q32 e apoio a pais estudantes Q33 (com recorte por gênero e segmento)
  const sqlLicencaSegmento = (coluna: string) => `
    SELECT
      ${coluna} as resposta,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'mulheres'
        WHEN genero ILIKE '%homem%' THEN 'homens'
        ELSE 'outros'
      END as genero_grp,
      CASE
        WHEN cargo ILIKE '%Docente%' THEN 'docentes'
        WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
        ELSE 'outro'
      END as segmento,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, `${coluna} IS NOT NULL`)}
    GROUP BY ${coluna}, genero_grp, segmento
    ORDER BY n DESC
  `;

  const [resLicMaternidade, resLicPaternidade, resApoioPais] = await Promise.all([
    pool.query(sqlLicencaSegmento('licenca_maternidade_suficiente'), params),
    pool.query(sqlLicencaSegmento('licenca_paternidade_suficiente'), params),
    pool.query(sqlLicencaSegmento('apoio_pais_estudantes_suficiente'), params),
  ]);

  // 4. Maternidade como impacto na carreira Q24d (invertido)
  const sqlMaternidadeImpacto = `
    SELECT
      maternidade_impacto_carreira,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Não-binária / Outras'
      END as genero_grp,
      responsabilidade_cuidado,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, 'maternidade_impacto_carreira IS NOT NULL')}
    GROUP BY maternidade_impacto_carreira, genero_grp, responsabilidade_cuidado
  `;

  // 5. Estudantes com responsabilidade de cuidado por campus e nível do curso
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

  // Buscar todos os registros de estudantes com area_conhecimento preenchida
  const sql = `
    SELECT
      area_conhecimento,
      CASE
        WHEN genero ILIKE '%mulher%' THEN 'Mulher'
        WHEN genero ILIKE '%homem%' THEN 'Homem'
        ELSE 'Não-binária / Outras'
      END as genero_grp,
      cor_raca,
      desencorajado_participacao,
      count(*)::int as n
    FROM public.respostas_pgs
    ${whereComAnd(whereSql, "vinculo ILIKE '%Discente%' AND area_conhecimento IS NOT NULL")}
    GROUP BY area_conhecimento, genero_grp, cor_raca, desencorajado_participacao
  `;

  const res = await pool.query(sql, params);

  // Mapeamento e agregação determinística via areaMap.ts
  const contagemPorGrandeArea: Record<string, { total: number; mulheres: number; homens: number; outras: number; negros: number }> = {};
  const coberturaTextos: Record<string, { textoOriginal: string; grandeArea: string; n: number }> = {};
  const desencorajamentoPorArea: Record<string, { total: number; desencorajados: number }> = {
    STEM: { total: 0, desencorajados: 0 },
    NaoSTEM: { total: 0, desencorajados: 0 },
  };

  GRANDES_AREAS_CNPQ.forEach((ga) => {
    contagemPorGrandeArea[ga] = { total: 0, mulheres: 0, homens: 0, outras: 0, negros: 0 };
  });

  for (const row of res.rows) {
    const raw = String(row.area_conhecimento || '').trim();
    const ga = MAPA_TEXTOS_AREA[raw.toLowerCase()] || 'Não classificada';
    const n = Number(row.n || 0);

    if (!contagemPorGrandeArea[ga]) {
      contagemPorGrandeArea[ga] = { total: 0, mulheres: 0, homens: 0, outras: 0, negros: 0 };
    }

    contagemPorGrandeArea[ga].total += n;
    if (row.genero_grp === 'Mulher') contagemPorGrandeArea[ga].mulheres += n;
    else if (row.genero_grp === 'Homem') contagemPorGrandeArea[ga].homens += n;
    else contagemPorGrandeArea[ga].outras += n;

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
  }

  const areasOrdenadasPorMulheres = Object.entries(contagemPorGrandeArea)
    .filter(([_, v]) => v.total > 0)
    .map(([area, v]) => ({
      area,
      total: v.total,
      mulheres: v.mulheres,
      homens: v.homens,
      outras: v.outras,
      pct_mulheres: Number(((v.mulheres / v.total) * 100).toFixed(1)),
      pct_negros: Number(((v.negros / v.total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.pct_mulheres - a.pct_mulheres);

  const coberturaLista = Object.values(coberturaTextos).sort((a, b) => b.n - a.n);

  return {
    areas_ranking_mulheres: areasOrdenadasPorMulheres,
    desencorajamento_stem: {
      stem_pct:
        desencorajamentoPorArea.STEM.total > 0
          ? Number(((desencorajamentoPorArea.STEM.desencorajados / desencorajamentoPorArea.STEM.total) * 100).toFixed(1))
          : 0,
      stem_n: desencorajamentoPorArea.STEM.total,
      nao_stem_pct:
        desencorajamentoPorArea.NaoSTEM.total > 0
          ? Number(((desencorajamentoPorArea.NaoSTEM.desencorajados / desencorajamentoPorArea.NaoSTEM.total) * 100).toFixed(1))
          : 0,
      nao_stem_n: desencorajamentoPorArea.NaoSTEM.total,
    },
    cobertura: coberturaLista,
  };
}
