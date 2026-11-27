/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { getDbPool } from './db';
import { CATALOGO_CAMPOS, CAMPOS_PERMITIDOS_CONSULTA } from '../lib/catalogo';
import {
  SQL_GENERO_NORMALIZADO,
  SQL_FILTRO_SEM_TERCEIRIZADOS,
  SQL_ORIENTACAO_NORMALIZADA,
} from '../lib/escalas';
import {
  RequisicaoConsulta,
  RespostaConsulta,
  LinhaResultadoConsulta,
} from '../lib/types';

// Validação com Zod para requisição da API
export const RequisicaoConsultaSchema = z.object({
  campos_eixo: z
    .array(z.string().refine((k) => CAMPOS_PERMITIDOS_CONSULTA.includes(k), {
      message: 'Campo de eixo não permitido ou inválido',
    }))
    .min(1)
    .max(2),
  campos_cor: z
    .array(z.string().refine((k) => CAMPOS_PERMITIDOS_CONSULTA.includes(k), {
      message: 'Campo de cor não permitido ou inválido',
    }))
    .max(1)
    .optional(),
  medida: z.object({
    tipo: z.enum([
      'contagem',
      'percentual_no_grupo',
      'percentual_do_total',
      'media',
      'mediana',
      'taxa_sim',
      'percentual_concordancia',
    ]),
    incluir_prefiro_nao_responder: z.boolean().optional().default(true),
  }),
  filtros: z
    .array(
      z.object({
        campo: z.string().refine((k) => CAMPOS_PERMITIDOS_CONSULTA.includes(k) || k === 'area_stem', {
          message: 'Campo de filtro não permitido',
        }),
        operador: z.enum(['in', 'eq', 'neq']),
        valores: z.array(z.string()),
      })
    )
    .max(8)
    .optional(),
});

// Cache simples em memória com TTL de 5 minutos (300.000 ms)
const cacheConsulta = new Map<string, { expira: number; data: RespostaConsulta }>();

// Expressão SQL para campos derivados (Regra de Ouro de Gênero Normalizado e Orientação Sexual Normalizada)
function expressaoCampoSql(campoKey: string): string {
  if (campoKey === 'genero_agrupado' || campoKey === 'genero') {
    return SQL_GENERO_NORMALIZADO;
  }

  if (campoKey === 'orientacao_sexual') {
    return SQL_ORIENTACAO_NORMALIZADA;
  }

  if (campoKey === 'vinculo') {
    return `(
      CASE
        WHEN vinculo ILIKE '%Discente%' THEN 'Discentes'
        WHEN vinculo ILIKE '%Substituto%' THEN 'Docentes Substitutos'
        WHEN vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%' THEN 'Docentes'
        WHEN vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%') THEN 'Técnicos/as TAEs'
        WHEN vinculo = 'Prefiro não responder' THEN 'Prefiro não responder'
        ELSE NULL
      END
    )`;
  }

  if (campoKey === 'responsabilidade_cuidado') {
    return `(
      CASE
        WHEN responsabilidade_cuidado IN ('Não', 'Não tenho responsabilidade de cuidado sobre ninguém') THEN 'Não'
        ELSE responsabilidade_cuidado
      END
    )`;
  }

  if (campoKey === 'progressao_merito_nota') {
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

  if (campoKey === 'area_conhecimento') {
    return `(
      CASE
        WHEN TRIM(LOWER(area_conhecimento)) IN ('todos', 'sei lá', 'nenhuma área ainda', 'ensino médio', 'eja', 'mestrado', 'multidisciplinar', 'exatas e humanas') THEN NULL
        WHEN area_conhecimento ILIKE '%engenharia%' OR area_conhecimento ILIKE '%computa%' OR area_conhecimento ILIKE '%inform%' OR area_conhecimento ILIKE '%ti%' OR area_conhecimento ILIKE '%ads%' OR area_conhecimento ILIKE '%eletro%' OR area_conhecimento ILIKE '%mecânica%' OR area_conhecimento ILIKE '%mecanica%' OR area_conhecimento ILIKE '%polímero%' OR area_conhecimento ILIKE '%polimero%' OR area_conhecimento ILIKE '%plástico%' OR area_conhecimento ILIKE '%segurança do trabalho%' OR area_conhecimento ILIKE '%sistemas%' OR area_conhecimento ILIKE '%tecnolog%' OR area_conhecimento ILIKE '%inovação%' THEN 'Engenharias e Tecnologia'
        WHEN area_conhecimento ILIKE '%exata%' OR area_conhecimento ILIKE '%física%' OR area_conhecimento ILIKE '%fisica%' OR area_conhecimento ILIKE '%química%' OR area_conhecimento ILIKE '%quimica%' OR area_conhecimento ILIKE '%matemát%' OR area_conhecimento ILIKE '%matemat%' OR area_conhecimento ILIKE '%ciências da natureza%' OR area_conhecimento ILIKE '%ciencias da natureza%' OR area_conhecimento ILIKE '%ciências da natura%' OR area_conhecimento ILIKE '%ciências naturais%' THEN 'Ciências Exatas e da Terra'
        WHEN area_conhecimento ILIKE '%agrár%' OR area_conhecimento ILIKE '%agrar%' OR area_conhecimento ILIKE '%agro%' OR area_conhecimento ILIKE '%zootec%' OR area_conhecimento ILIKE '%viticult%' OR area_conhecimento ILIKE '%meio ambiente%' OR area_conhecimento ILIKE '%meia ambiente%' OR area_conhecimento ILIKE '%ambiental%' OR area_conhecimento ILIKE '%panifica%' THEN 'Ciências Agrárias'
        WHEN area_conhecimento ILIKE '%administra%' OR area_conhecimento ILIKE '%adm%' OR area_conhecimento ILIKE '%gestão%' OR area_conhecimento ILIKE '%gestao%' OR area_conhecimento ILIKE '%processo%' OR area_conhecimento ILIKE '%comércio%' OR area_conhecimento ILIKE '%comercio%' OR area_conhecimento ILIKE '%vendas%' OR area_conhecimento ILIKE '%logística%' OR area_conhecimento ILIKE '%logistica%' OR area_conhecimento ILIKE '%marketing%' OR area_conhecimento ILIKE '%secretariado%' OR area_conhecimento ILIKE '%informação%' OR area_conhecimento ILIKE '%biblioteconomia%' OR area_conhecimento ILIKE '%negócio%' OR area_conhecimento ILIKE '%negocio%' OR TRIM(LOWER(area_conhecimento)) IN ('tpg', 'lazer') THEN 'Ciências Sociais Aplicadas'
        WHEN area_conhecimento ILIKE '%human%' OR area_conhecimento ILIKE '%pedagog%' OR area_conhecimento ILIKE '%educa%' OR area_conhecimento ILIKE '%profept%' OR area_conhecimento ILIKE '%ensino%' THEN 'Ciências Humanas'
        WHEN area_conhecimento ILIKE '%letras%' OR area_conhecimento ILIKE '%artes%' OR area_conhecimento ILIKE '%design%' OR area_conhecimento ILIKE '%moda%' OR area_conhecimento ILIKE '%modelagem%' OR area_conhecimento ILIKE '%cinema%' OR area_conhecimento ILIKE '%multimídia%' OR area_conhecimento ILIKE '%multimidia%' OR area_conhecimento ILIKE '%audiovisual%' THEN 'Linguística, Letras e Artes'
        WHEN area_conhecimento ILIKE '%biolog%' OR area_conhecimento ILIKE '%biotec%' OR area_conhecimento ILIKE '%boitec%' THEN 'Ciências Biológicas'
        WHEN area_conhecimento ILIKE '%saúde%' OR area_conhecimento ILIKE '%saude%' OR area_conhecimento ILIKE '%enferm%' OR area_conhecimento ILIKE '%idoso%' THEN 'Ciências da Saúde'
        WHEN area_conhecimento = 'Prefiro não responder' THEN 'Prefiro não responder'
        ELSE NULL
      END
    )`;
  }

  // Nome direto e higienizado da coluna (garantido pelo schema Zod com whitelist)
  return `"${campoKey}"`;
}

// Mapeamento Likert em SQL
function expressaoNotaLikert(campoKey: string): string | null {
  const campo = CATALOGO_CAMPOS[campoKey];
  if (!campo) return null;

  if (campo.key === 'progressao_merito_nota') {
    return 'progressao_merito_nota::float';
  }

  if (campo.escala) {
    const cases = Object.entries(campo.escala)
      .map(([val, nota]) => `WHEN ${expressaoCampoSql(campoKey)} = '${val.replace(/'/g, "''")}' THEN ${nota}`)
      .join(' ');
    return `(CASE ${cases} ELSE NULL END)::float`;
  }

  return null;
}

export async function executarConsulta(req: RequisicaoConsulta): Promise<RespostaConsulta> {
  // Verificação de cache
  const cacheKey = JSON.stringify(req);
  const now = Date.now();
  const cached = cacheConsulta.get(cacheKey);
  if (cached && cached.expira > now) {
    return cached.data;
  }

  const pool = getDbPool();
  const params: any[] = [];
  const whereClauses: string[] = [SQL_FILTRO_SEM_TERCEIRIZADOS];

  // Filtros de segurança e valores
  if (req.filtros && req.filtros.length > 0) {
    for (const f of req.filtros) {
      if (f.campo === 'area_stem') {
        const areaSql = expressaoCampoSql('area_conhecimento');
        if (f.valores.includes('stem')) {
          whereClauses.push(`${areaSql} IN ('Engenharias e Tecnologia', 'Ciências Exatas e da Terra')`);
        } else if (f.valores.includes('nao_stem')) {
          whereClauses.push(`${areaSql} NOT IN ('Engenharias e Tecnologia', 'Ciências Exatas e da Terra') AND ${areaSql} IS NOT NULL`);
        }
        continue;
      }

      const colExpr = expressaoCampoSql(f.campo);
      if (f.operador === 'in' && f.valores.length > 0) {
        const placeholders = f.valores.map((v) => {
          params.push(v);
          return `$${params.length}`;
        });
        whereClauses.push(`${colExpr} IN (${placeholders.join(', ')})`);
      } else if (f.operador === 'eq' && f.valores.length > 0) {
        params.push(f.valores[0]);
        whereClauses.push(`${colExpr} = $${params.length}`);
      } else if (f.operador === 'neq' && f.valores.length > 0) {
        params.push(f.valores[0]);
        whereClauses.push(`${colExpr} != $${params.length}`);
      }
    }
  }

  const campoEixo1 = req.campos_eixo[0];
  const campoEixo2 = req.campos_eixo[1] || null;
  const campoCor = req.campos_cor?.[0] || null;

  // Excluir registros nulos (ex.: variáveis exclusivas de Discentes ou de Servidores, ou declarações fora das 6 categorias oficiais)
  const camposEnvolvidos = [campoEixo1, campoEixo2, campoCor].filter(Boolean) as string[];
  for (const c of camposEnvolvidos) {
    const colExpr = expressaoCampoSql(c);
    whereClauses.push(`${colExpr} IS NOT NULL`);
  }

  // Toggle de "Prefiro não responder" aplicado tanto no Eixo quanto na Série
  if (req.medida.incluir_prefiro_nao_responder === false) {
    for (const c of camposEnvolvidos) {
      const colExpr = expressaoCampoSql(c);
      whereClauses.push(`${colExpr} != 'Prefiro não responder'`);
    }
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const exprEixo1 = expressaoCampoSql(campoEixo1);
  const exprEixo2 = campoEixo2 ? expressaoCampoSql(campoEixo2) : 'NULL';
  const exprCor = campoCor ? expressaoCampoSql(campoCor) : 'NULL';

  const selectCols = [
    `${exprEixo1} AS eixo_1`,
    campoEixo2 ? `${exprEixo2} AS eixo_2` : 'NULL::text AS eixo_2',
    campoCor ? `${exprCor} AS cor` : 'NULL::text AS cor',
  ];

  const groupByCols = [`${exprEixo1}`];
  if (campoEixo2) groupByCols.push(`${exprEixo2}`);
  if (campoCor) groupByCols.push(`${exprCor}`);

  // Base e métrica
  let metricExpr = 'count(*)::int AS n, count(*)::float AS valor';
  let innerWhere = whereSql;

  if (req.medida.tipo === 'media') {
    const likertExpr = expressaoNotaLikert(campoEixo1);
    if (!likertExpr) {
      throw new Error(`O campo ${campoEixo1} não possui escala numérica/likert para média.`);
    }
    // Para média, apenas respostas válidas com pontuação entram na média
    metricExpr = `count(*)::int AS n, coalesce(round(avg(${likertExpr})::numeric, 2), 0)::float AS valor`;
  } else if (req.medida.tipo === 'mediana') {
    const likertExpr = expressaoNotaLikert(campoEixo1);
    if (!likertExpr) {
      throw new Error(`O campo ${campoEixo1} não possui escala para cálculo de mediana.`);
    }
    metricExpr = `count(*)::int AS n, coalesce(round(percentile_cont(0.5) within group (order by ${likertExpr})::numeric, 2), 0)::float AS valor`;
  } else if (req.medida.tipo === 'taxa_sim') {
    metricExpr = `count(*)::int AS n, round((count(*) filter (where ${exprEixo1} = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float AS valor`;
  } else if (req.medida.tipo === 'percentual_concordancia') {
    metricExpr = `count(*)::int AS n, round((count(*) filter (where ${exprEixo1} IN ('Concordo', 'Concordo Totalmente')) * 100.0 / nullif(count(*), 0))::numeric, 1)::float AS valor`;
  }

  // Consulta das linhas agrupadas
  const sql = `
    SELECT
      ${selectCols.join(', ')},
      ${metricExpr}
    FROM public.respostas_pgs
    ${innerWhere}
    GROUP BY ${groupByCols.join(', ')}
    ORDER BY valor DESC, n DESC
    LIMIT 120
  `;

  // Consulta do total e n_filtrado
  const totalSql = `
    SELECT
      count(*)::int as n_filtrado
    FROM public.respostas_pgs
    ${innerWhere}
  `;

  const [resLinhas, resTotal] = await Promise.all([
    pool.query(sql, params),
    pool.query(totalSql, params),
  ]);

  const nFiltrado = resTotal.rows[0]?.n_filtrado ?? 0;
  const avisos: string[] = [];

  // Calcular totais de grupos e percentuais no grupo se necessário
  const totaisGrupo: Record<string, number> = {};
  for (const r of resLinhas.rows) {
    const gKey = String(r.eixo_1 ?? '');
    totaisGrupo[gKey] = (totaisGrupo[gKey] || 0) + Number(r.n || 0);
  }

  let pequenasAmostras = 0;

  const linhas: LinhaResultadoConsulta[] = resLinhas.rows.map((row: any) => {
    const n = Number(row.n || 0);
    const nGrupo = totaisGrupo[String(row.eixo_1 ?? '')] || nFiltrado;
    let valor = Number(row.valor || 0);
    let percentual = nFiltrado > 0 ? Number(((n / nFiltrado) * 100).toFixed(1)) : 0;

    if (req.medida.tipo === 'percentual_no_grupo') {
      valor = nGrupo > 0 ? Number(((n / nGrupo) * 100).toFixed(1)) : 0;
      percentual = valor;
    } else if (req.medida.tipo === 'percentual_do_total') {
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
      percentual,
    };
  });

  if (pequenasAmostras > 0) {
    avisos.push(`Amostra pequena: ${pequenasAmostras} categoria(s) possuem menos de 10 respondentes.`);
  }

  const resposta: RespostaConsulta = {
    linhas,
    n_total: 4857,
    n_filtrado: nFiltrado,
    base_descricao: `Respondentes com filtros aplicados (total: ${nFiltrado.toLocaleString('pt-BR')})`,
    avisos,
    metadados: {
      campo_eixo_1: campoEixo1,
      campo_eixo_2: campoEixo2 || undefined,
      campo_cor: campoCor || undefined,
      medida_tipo: req.medida.tipo,
    },
  };

  // Salvar no cache por 5 minutos
  cacheConsulta.set(cacheKey, {
    expira: now + 5 * 60 * 1000,
    data: resposta,
  });

  return resposta;
}
