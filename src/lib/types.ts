/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TipoCampo =
  | 'nominal'
  | 'ordinal_faixa'
  | 'likert'
  | 'binario_sim_nao'
  | 'numerico'
  | 'texto';

export type GrupoCampo =
  | 'perfil'
  | 'diversidade'
  | 'ambiente'
  | 'violencia'
  | 'denuncia'
  | 'politicas'
  | 'cuidado'
  | 'carreira';

export interface CampoCatalogo {
  key: string;
  label: string;
  tipo: TipoCampo;
  grupo: GrupoCampo;
  dinamico: boolean; // se pode ser usado no construtor dinâmico (campos de texto = false)
  ordem?: string[];
  escala?: Record<string, number>;
  categoriasSemPontuacao?: string[];
  invertido?: boolean; // para maternidade_impacto_carreira (6 - nota)
  descricao?: string;
  filtroOpcoes?: string[];
}

export type TipoMedida =
  | 'contagem'
  | 'percentual_no_grupo'
  | 'percentual_do_total'
  | 'media'
  | 'mediana'
  | 'taxa_sim'
  | 'percentual_concordancia';

export interface FiltroConsulta {
  campo: string;
  operador: 'in' | 'eq' | 'neq';
  valores: string[];
}

export interface RequisicaoConsulta {
  campos_eixo: string[];
  campos_cor?: string[];
  medida: {
    tipo: TipoMedida;
    incluir_prefiro_nao_responder?: boolean;
  };
  filtros?: FiltroConsulta[];
}

export interface LinhaResultadoConsulta {
  eixo_1?: string | null;
  eixo_2?: string | null;
  cor?: string | null;
  valor: number;
  n: number;
  n_grupo?: number;
  percentual?: number;
}

export interface RespostaConsulta {
  linhas: LinhaResultadoConsulta[];
  n_total: number;
  n_filtrado: number;
  base_descricao: string;
  avisos: string[];
  metadados?: {
    campo_eixo_1?: string;
    campo_eixo_2?: string;
    campo_cor?: string;
    medida_tipo: TipoMedida;
  };
}

export interface FiltrosGlobaisState {
  vinculo?: string[];
  campus?: string[];
  genero_agrupado?: string[];
  genero_detalhado?: string[];
  cor_raca?: string[];
  faixa_etaria?: string[];
  pcd?: string[];
  orientacao_sexual?: string[];
  ocupa_cargo_gestao?: string[];
  responsabilidade_cuidado?: string[];
  area_stem?: 'stem' | 'nao_stem' | 'todos';
}
