/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const GRANDES_AREAS_CNPQ = [
  'Engenharias e Tecnologia',
  'Ciências Exatas e da Terra',
  'Ciências Sociais Aplicadas',
  'Ciências Agrárias',
  'Ciências Humanas',
  'Linguística, Letras e Artes',
  'Ciências Biológicas',
  'Ciências da Saúde',
  'Não classificada',
  'Prefiro não responder',
] as const;

export type GrandeArea = (typeof GRANDES_AREAS_CNPQ)[number];

/**
 * Mapa determinístico e versionado de normalização de strings digitadas
 * no campo area_conhecimento para uma das Grandes Áreas do CNPq.
 */
export const MAPA_TEXTOS_AREA: Record<string, GrandeArea> = {
  // Áreas principais diretas
  'engenharias e tecnologia': 'Engenharias e Tecnologia',
  'ciências exatas e da terra': 'Ciências Exatas e da Terra',
  'ciencias exatas e da terra': 'Ciências Exatas e da Terra',
  'ciências sociais aplicadas': 'Ciências Sociais Aplicadas',
  'ciencias sociais aplicadas': 'Ciências Sociais Aplicadas',
  'ciência social aplicada': 'Ciências Sociais Aplicadas',
  'ciências agrárias': 'Ciências Agrárias',
  'ciencias agrarias': 'Ciências Agrárias',
  'ciências humanas': 'Ciências Humanas',
  'ciencias humanas': 'Ciências Humanas',
  'linguística, letras e artes': 'Linguística, Letras e Artes',
  'linguistica, letras e artes': 'Linguística, Letras e Artes',
  'ciências biológicas': 'Ciências Biológicas',
  'ciencias biologicas': 'Ciências Biológicas',
  'ciências da saúde': 'Ciências da Saúde',
  'ciencias da saude': 'Ciências da Saúde',
  'prefiro não responder': 'Prefiro não responder',

  // Administração e Gestão -> Ciências Sociais Aplicadas
  'administração': 'Ciências Sociais Aplicadas',
  'administracao': 'Ciências Sociais Aplicadas',
  'adm': 'Ciências Sociais Aplicadas',
  'administração de empresas': 'Ciências Sociais Aplicadas',
  'administração de empresa': 'Ciências Sociais Aplicadas',
  'bacharelado administracao': 'Ciências Sociais Aplicadas',
  'gestão e negócios': 'Ciências Sociais Aplicadas',
  'gestao e negocios': 'Ciências Sociais Aplicadas',
  'gestão empresarial': 'Ciências Sociais Aplicadas',
  'gestão e negócio': 'Ciências Sociais Aplicadas',
  'processos gerenciais': 'Ciências Sociais Aplicadas',
  'processo gerencial': 'Ciências Sociais Aplicadas',
  'processo gerenciais': 'Ciências Sociais Aplicadas',
  'eixo de processos gerenciais e comércio': 'Ciências Sociais Aplicadas',
  'eixo peocessos gerenciais': 'Ciências Sociais Aplicadas',
  'comércio': 'Ciências Sociais Aplicadas',
  'comercio': 'Ciências Sociais Aplicadas',
  'técnico em comércio': 'Ciências Sociais Aplicadas',
  'tecnico em comercio': 'Ciências Sociais Aplicadas',
  'técnico de comércio': 'Ciências Sociais Aplicadas',
  'pro eja comércio': 'Ciências Sociais Aplicadas',
  'técnico em vendas': 'Ciências Sociais Aplicadas',
  'logística': 'Ciências Sociais Aplicadas',
  'logistica': 'Ciências Sociais Aplicadas',
  'tecnologia em logística': 'Ciências Sociais Aplicadas',
  'marketing': 'Ciências Sociais Aplicadas',
  'secretariado': 'Ciências Sociais Aplicadas',
  'ciências da informação': 'Ciências Sociais Aplicadas',
  'ciência da informação': 'Ciências Sociais Aplicadas',
  'biblioteconomia': 'Ciências Sociais Aplicadas',
  'negócios e gastão': 'Ciências Sociais Aplicadas',
  'administração e matérias gerais': 'Ciências Sociais Aplicadas',
  'administração, gestão': 'Ciências Sociais Aplicadas',
  'administração do comércio': 'Ciências Sociais Aplicadas',
  'tecnico em administração': 'Ciências Sociais Aplicadas',
  'técnico em administração': 'Ciências Sociais Aplicadas',
  'tec em administração': 'Ciências Sociais Aplicadas',
  'técnico de administraçâo': 'Ciências Sociais Aplicadas',
  'não sei qual é para a administração': 'Ciências Sociais Aplicadas',

  // Educação e Pedagogia -> Ciências Humanas
  'pedagogia': 'Ciências Humanas',
  'licenciatura em pedagogia': 'Ciências Humanas',
  'licenciatura pedagogia': 'Ciências Humanas',
  'pedagogia docencia': 'Ciências Humanas',
  'educação': 'Ciências Humanas',
  'educacao': 'Ciências Humanas',
  'profept': 'Ciências Humanas',
  'multidisciplinar - ensino': 'Ciências Humanas',
  'teorias e metodologias da educação': 'Ciências Humanas',
  'técnico tradução interprete libras / pedagogia licenciatura': 'Ciências Humanas',
  'ciências ambientais e sociais': 'Ciências Humanas',

  // Informática e TI -> Engenharias e Tecnologia
  'informática': 'Engenharias e Tecnologia',
  'informatica': 'Engenharias e Tecnologia',
  'ti': 'Engenharias e Tecnologia',
  'computação': 'Engenharias e Tecnologia',
  'ciência da computação': 'Engenharias e Tecnologia',
  'sistemas de informação': 'Engenharias e Tecnologia',
  'sistemas': 'Engenharias e Tecnologia',
  'ads': 'Engenharias e Tecnologia',
  'analise e desenvolvimento de sistemas': 'Engenharias e Tecnologia',
  'técnico em informática': 'Engenharias e Tecnologia',
  'técnico de informática para internet': 'Engenharias e Tecnologia',
  'informática para internet': 'Engenharias e Tecnologia',
  'informática para internet e lógica de programação': 'Engenharias e Tecnologia',
  'informática na educação': 'Engenharias e Tecnologia',
  'pós-graduação em inteligência artificial na educação': 'Engenharias e Tecnologia',
  'educação e tecnologia': 'Engenharias e Tecnologia',
  'desenvolvimento e inovação': 'Engenharias e Tecnologia',

  // Exatas e Engenharias industriais -> Ciências Exatas e da Terra / Engenharias
  'química': 'Ciências Exatas e da Terra',
  'quimica': 'Ciências Exatas e da Terra',
  'técnico em química': 'Ciências Exatas e da Terra',
  'matemática': 'Ciências Exatas e da Terra',
  'ciências da natureza': 'Ciências Exatas e da Terra',
  'ciências da natura': 'Ciências Exatas e da Terra',
  'ciências da natureza:biologia e química': 'Ciências Exatas e da Terra',
  'ciências naturais': 'Ciências Exatas e da Terra',
  'eletromecânica': 'Engenharias e Tecnologia',
  'eletrotécnica': 'Engenharias e Tecnologia',
  'mecânica': 'Engenharias e Tecnologia',
  'polímeros': 'Engenharias e Tecnologia',
  'polímero': 'Engenharias e Tecnologia',
  'plásticos': 'Engenharias e Tecnologia',
  'tecnologia': 'Engenharias e Tecnologia',
  'tecnologo': 'Engenharias e Tecnologia',
  'segurança do trabalho': 'Engenharias e Tecnologia',

  // Artes e Comunicação -> Linguística, Letras e Artes
  'artes': 'Linguística, Letras e Artes',
  'design': 'Linguística, Letras e Artes',
  'designer de moda': 'Linguística, Letras e Artes',
  'design de moda': 'Linguística, Letras e Artes',
  'moda': 'Linguística, Letras e Artes',
  'modelagem': 'Linguística, Letras e Artes',
  'modelagem de vestuario': 'Linguística, Letras e Artes',
  'modelagem e vestuário': 'Linguística, Letras e Artes',
  'multimidia': 'Linguística, Letras e Artes',
  'multimídia': 'Linguística, Letras e Artes',
  'cinema': 'Linguística, Letras e Artes',
  'cinema/audiovisual': 'Linguística, Letras e Artes',
  'comunicação e audiovisual': 'Linguística, Letras e Artes',

  // Ciências Agrárias
  'agropecuária': 'Ciências Agrárias',
  'agroecologia': 'Ciências Agrárias',
  'agrocologia': 'Ciências Agrárias',
  'agronomia': 'Ciências Agrárias',
  'agro': 'Ciências Agrárias',
  'zootecnia': 'Ciências Agrárias',
  'bacharelado em zootecnia.': 'Ciências Agrárias',
  'tec. viticultura e enologia': 'Ciências Agrárias',
  'viticultura e enologia': 'Ciências Agrárias',

  // Meio Ambiente e Biologia
  'gestão ambiental': 'Ciências Agrárias',
  'gestao ambiental': 'Ciências Agrárias',
  'meio ambiente': 'Ciências Agrárias',
  'meia ambiente': 'Ciências Agrárias',
  'ambiental': 'Ciências Agrárias',
  'técnico em meio ambiente': 'Ciências Agrárias',
  'tecnólogo em gestão ambiental': 'Ciências Agrárias',
  'meio ambiente e sustentabilidade': 'Ciências Agrárias',
  'ciências ambientais': 'Ciências Agrárias',
  'ciências ambientais (meio ambiente)': 'Ciências Agrárias',
  'biotecnologia': 'Ciências Biológicas',
  'boitecnologia': 'Ciências Biológicas',
  'licenciatura biologia e química': 'Ciências Biológicas',

  // Saúde
  'técnico enfermagem': 'Ciências da Saúde',
  'cuidador de idosos': 'Ciências da Saúde',
};

/**
 * Normaliza qualquer texto livre digitado em area_conhecimento
 */
export function normalizarAreaConhecimento(texto: string | null | undefined): GrandeArea {
  if (!texto) return 'Não classificada';
  const limpo = texto.trim().toLowerCase();
  if (limpo === '' || limpo === 'todos' || limpo === 'sei lá' || limpo === 'nenhuma área ainda') {
    return 'Não classificada';
  }
  if (MAPA_TEXTOS_AREA[limpo]) {
    return MAPA_TEXTOS_AREA[limpo];
  }

  // Busca por substrings caso haja texto com espaços ou variações
  if (limpo.includes('engenharia') || limpo.includes('computa') || limpo.includes('informát') || limpo.includes('informat')) {
    return 'Engenharias e Tecnologia';
  }
  if (limpo.includes('exatas') || limpo.includes('física') || limpo.includes('química') || limpo.includes('matemát')) {
    return 'Ciências Exatas e da Terra';
  }
  if (limpo.includes('administra') || limpo.includes('gestão') || limpo.includes('processos gerenciais') || limpo.includes('comércio')) {
    return 'Ciências Sociais Aplicadas';
  }
  if (limpo.includes('agrár') || limpo.includes('agro') || limpo.includes('zootec') || limpo.includes('viticult')) {
    return 'Ciências Agrárias';
  }
  if (limpo.includes('human') || limpo.includes('pedagog') || limpo.includes('educa')) {
    return 'Ciências Humanas';
  }
  if (limpo.includes('letras') || limpo.includes('artes') || limpo.includes('design') || limpo.includes('moda') || limpo.includes('cinema')) {
    return 'Linguística, Letras e Artes';
  }
  if (limpo.includes('biolog') || limpo.includes('biotec')) {
    return 'Ciências Biológicas';
  }
  if (limpo.includes('saúde') || limpo.includes('saude') || limpo.includes('enferm')) {
    return 'Ciências da Saúde';
  }

  return 'Não classificada';
}

/**
 * Identifica se a grande área pertence a STEM (Ciências Exatas e da Terra ou Engenharias e Tecnologia)
 */
export function isAreaSTEM(grandeArea: string): boolean {
  return grandeArea === 'Engenharias e Tecnologia' || grandeArea === 'Ciências Exatas e da Terra';
}
