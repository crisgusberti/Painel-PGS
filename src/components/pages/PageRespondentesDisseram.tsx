/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  Quote,
  HelpCircle,
  ClipboardList,
  X,
  Users,
  AlertTriangle,
  ShieldAlert,
  GraduationCap,
  HeartHandshake,
  Building2,
  ShieldOff,
  Lightbulb,
  Info,
} from 'lucide-react';
import { ChartCard } from '../ChartCard';
import { PALETA_ACESSIVEL } from '../../lib/chartTheme';
import { formatarNumero } from '../../lib/formatters';

interface Trecho {
  texto: string;
  perfil: 'Estudante' | 'Servidor(a)' | null;
  // Pergunta de origem: não informada no esboço do relatório qualitativo (os excertos são
  // organizados por categoria temática, não por pergunta). Deixe indefinido quando desconhecida.
  pergunta?: string;
  subtemaId?: string;
  temasAssociados?: string[];
}

interface Subtema {
  id: string;
  nome: string;
  frequencia: number | null;
}

interface TemaQualitativo {
  id: string;
  titulo: string;
  icone: React.ReactNode;
  contagem: number;
  sintese: string;
  subtemas: Subtema[];
  trechos: Trecho[];
  sugestoes?: string[];
}

interface PerguntaAberta {
  texto: string;
  contexto: string;
}

// As 4 perguntas abertas do formulário "Diagnóstico sobre Gênero e Sexualidade no IFRS" (texto integral).
const PERGUNTAS_ABERTAS: PerguntaAberta[] = [
  {
    texto: 'Caso tenha respondido "Sim" na(s) questão(ões) 10 e/ou 11 e se sinta à vontade, descreva a situação ocorrida:',
    contexto: 'Pergunta 12 do formulário — segue as perguntas 10 e 11, sobre já ter sofrido violência/bullying na instituição por raça/cor, orientação sexual ou identidade de gênero.',
  },
  {
    texto: 'Em sua opinião, quais são os maiores desafios para aumentar a diversidade de gênero e raça em sua área de estudo? (Caso prefira não responder escreva "Prefiro não responder").',
    contexto: 'Pergunta 16 do formulário.',
  },
  {
    texto: 'Caso queira justificar a resposta da pergunta anterior, fique a vontade para utilizar esse espaço:',
    contexto: 'Complementa a pergunta 23, sobre o acesso a oportunidades de participação em projetos de pesquisa/extensão/inovação e ao recebimento de bolsas de fomento.',
  },
  {
    texto: 'Utilize o espaço abaixo para deixar alguma contribuição que considere relevante para a pesquisa.',
    contexto: 'Pergunta final do formulário.',
  },
];

// Temas e trechos do relatório qualitativo do IFRS (ver "COMPLEMENTOS PARA ABA QUALITATIVA"),
// com trechos reais selecionados a partir das respostas abertas do formulário "Diagnóstico sobre
// Gênero e Sexualidade no IFRS", revisados para divulgação e preservação da identidade das pessoas
// participantes.
const TEMAS: TemaQualitativo[] = [
  {
    id: 'violencias',
    titulo: 'Violências e discriminação',
    icone: <AlertTriangle className="w-5 h-5" />,
    contagem: 377,
    sintese:
      'As subcategorias mais recorrentes foram machismo/misoginia, comentários ofensivos, racismo, LGBTfobia e transfobia. As violências relatadas não se restringem a episódios isolados: atravessam diferentes relações institucionais — entre estudantes, entre servidores(as), nas práticas docentes e nos espaços de convivência — combinando situações explícitas de assédio e discriminação com formas mais naturalizadas de piadas e comentários ofensivos.',
    subtemas: [
      { id: 'machismo_misoginia', nome: 'Machismo e misoginia', frequencia: 151 },
      { id: 'comentarios_ofensivos', nome: 'Comentários ofensivos', frequencia: 121 },
      { id: 'racismo', nome: 'Racismo', frequencia: 75 },
      { id: 'lgbtfobia', nome: 'LGBTfobia', frequencia: 69 },
      { id: 'transfobia', nome: 'Transfobia', frequencia: 31 },
    ],
    trechos: [
      { texto: 'Às vezes, as situações não são explícitas, ainda mais sendo mulher e TAE. São ações no cotidiano que vão nos desmerecendo, colocando para baixo, como se não tivesse lugar de fala.', perfil: 'Servidor(a)', subtemaId: 'machismo_misoginia', temasAssociados: ['convivencia'] },
      { texto: 'Ter as falas constantemente cortadas por homens em reuniões, ter minha ideia ignorada enquanto um homem ao lado diz a mesma coisa e é aplaudido.', perfil: 'Servidor(a)', subtemaId: 'machismo_misoginia' },
      { texto: 'Infelizmente, muitos estudantes acabam fazendo comentários transfóbicos dentro da instituição, isso acaba me deixando extremamente chateada pela falta de respeito... Mesmo que eu não seja uma pessoa trans, me sinto mal pelas coisas que acabo sendo obrigada a ouvir dentro da sala de aula. Não só comentários transfóbicos, mas de preconceito contra a comunidade LGBTQIAPN+ como um todo.', perfil: 'Estudante', subtemaId: 'transfobia' },
    ],
  },
  {
    id: 'sugestoes',
    titulo: 'Sugestões para o IFRS',
    icone: <Lightbulb className="w-5 h-5" />,
    contagem: 272,
    sintese:
      'As subcategorias mais recorrentes foram mudança institucional, comunicação, campanhas, formação e materiais. A comunidade não apenas descreve problemas: formula propostas concretas de transformação institucional.',
    subtemas: [
      { id: 'mudanca_institucional', nome: 'Mudança institucional', frequencia: 136 },
      { id: 'comunicacao', nome: 'Comunicação', frequencia: 93 },
      { id: 'campanhas', nome: 'Campanhas', frequencia: 93 },
      { id: 'formacao', nome: 'Formação', frequencia: 77 },
      { id: 'materiais', nome: 'Materiais', frequencia: 51 },
    ],
    trechos: [
      { texto: 'Um olhar mais atento para as questões da maternidade é muito necessário. Sobre a Política de Prevenção e Combate ao Assédio, vejo que há forte cultura do silenciamento quando quem comete o assédio é um servidor. Não vemos resolutividade. Precisamos de mais capacitação.', perfil: 'Servidor(a)', subtemaId: 'mudanca_institucional', temasAssociados: ['cuidado_trabalho'] },
      { texto: 'Poderia haver um olhar especial para as mães solteiras, sejam elas servidoras ou estudantes. Uma política específica que lhes assegure tempo maior de afastamento do trabalho/estudos, assim como lhes acolha, dando suporte psicológico.', perfil: 'Servidor(a)', subtemaId: 'mudanca_institucional', temasAssociados: ['cuidado_trabalho'] },
    ],
  },
  {
    id: 'convivencia',
    titulo: 'Convivência e pertencimento',
    icone: <Users className="w-5 h-5" />,
    contagem: 207,
    sintese:
      'As subcategorias mais recorrentes foram pertencimento, acolhimento, isolamento, machismo/misoginia e insegurança. O clima institucional é percebido tanto pela dimensão positiva de acolhimento e pertencimento quanto por experiências de isolamento, insegurança e tratamento desigual.',
    subtemas: [
      { id: 'pertencimento', nome: 'Pertencimento', frequencia: 66 },
      { id: 'acolhimento', nome: 'Acolhimento', frequencia: 52 },
      { id: 'isolamento', nome: 'Isolamento', frequencia: 30 },
      { id: 'machismo_misoginia', nome: 'Machismo e misoginia', frequencia: 28 },
      { id: 'inseguranca', nome: 'Insegurança', frequencia: 26 },
    ],
    trechos: [
      { texto: 'Justamente por ter poucas mulheres na computação, sinto que o público feminino é um pouco excluído do curso.', perfil: 'Estudante', subtemaId: 'isolamento' },
      { texto: 'Essas políticas não são muito divulgadas. Não vejo capacitação de servidores sobre isso; assim como fazem capacitação para professores, deveria haver também para os TAEs.', perfil: 'Servidor(a)', subtemaId: 'acolhimento' },
      { texto: 'Em sala de aula, recentemente, ouvi colegas me chamando por um insulto LGBTfóbico. Sou abertamente lésbica e tenho medo desta escola.', perfil: 'Estudante', subtemaId: 'inseguranca' },
    ],
  },
  {
    id: 'curriculo_formacao',
    titulo: 'Currículo e formação',
    icone: <GraduationCap className="w-5 h-5" />,
    contagem: 141,
    sintese:
      'As subcategorias mais recorrentes foram masculinização das áreas de tecnologia, práticas pedagógicas, baixa diversidade racial e de gênero nessas áreas, machismo/misoginia e currículo. O problema não se restringe à ausência de conteúdos sobre gênero, sexualidade e raça nos currículos: envolve também uma cultura formativa marcada pela naturalização da masculinidade e pela baixa representatividade.',
    subtemas: [
      { id: 'masculinizacao_tecnologia', nome: 'Masculinização das áreas de tecnologia', frequencia: 36 },
      { id: 'praticas_pedagogicas', nome: 'Práticas Pedagógicas', frequencia: 24 },
      { id: 'baixa_diversidade_tecnologia', nome: 'Baixa diversidade racial e de gênero em tecnologia', frequencia: 20 },
      { id: 'machismo_misoginia', nome: 'Machismo e misoginia', frequencia: 18 },
      { id: 'curriculo', nome: 'Currículo', frequencia: 17 },
    ],
    trechos: [
      { texto: 'Algumas servidoras(es) - e são muito poucas pessoas - fazem essa abordagem, mas porque têm compromisso pessoal com as pautas raciais, de gênero, etc. Não percebo um movimento da instituição como um todo para que esses temas sejam centrais.', perfil: 'Servidor(a)', subtemaId: 'praticas_pedagogicas' },
      { texto: 'Meu curso parece replicar estruturas tradicionais sem reflexão crítica. A disciplina de Direito deveria enfocar que racismo, homofobia, transfobia e misoginia são crimes. A formação parece apenas reproduzir e incluir no mercado de forma acrítica, sem transformação social.', perfil: 'Estudante', subtemaId: 'curriculo' },
      { texto: 'O corpo docente pode receber maior preparo. A grade curricular necessita de ajustes para tratar dessas temáticas, que são emergentes na educação. Os estudantes não se sentem preparados para tratar sobre essas temáticas em sala de aula com seus futuros alunos.', perfil: 'Estudante', subtemaId: 'praticas_pedagogicas' },
    ],
  },
  {
    id: 'resistencias',
    titulo: 'Resistências à pauta de gênero e diversidade',
    icone: <ShieldOff className="w-5 h-5" />,
    contagem: 133,
    sintese:
      'As subcategorias mais recorrentes foram recusa da pauta, deslegitimação, baixa percepção de desigualdades estruturais, hostilidade e percepção de vitimização de grupos majoritários. Esse eixo revela limites da sensibilização institucional e disputas de sentido em torno da pauta — não deve ser lido como ruído, mas como dado analítico relevante.',
    subtemas: [
      { id: 'recusa_pauta', nome: 'Recusa da pauta', frequencia: 80 },
      { id: 'deslegitimacao', nome: 'Deslegitimação', frequencia: 54 },
      { id: 'baixa_percepcao_desigualdades', nome: 'Baixa percepção de desigualdades estruturais', frequencia: 33 },
      { id: 'hostilidade', nome: 'Hostilidade', frequencia: 10 },
      { id: 'percepcao_vitimizacao_majoritarios', nome: 'Percepção de vitimização de grupos majoritários', frequencia: 8 },
    ],
    trechos: [
      { texto: 'As perguntas partem do pressuposto de que existe discriminação estrutural, ainda que velada, daí a necessidade de combate a tais posturas. Talvez essa base, considerada preconcebida e generalizante, devesse ser analisada de forma mais científica.', perfil: 'Servidor(a)', subtemaId: 'baixa_percepcao_desigualdades' },
      { texto: 'Tratar todos igualmente, sem cotas raciais, sem discriminação, apenas avaliando capacidade e conhecimento.', perfil: 'Estudante', subtemaId: 'recusa_pauta' },
      { texto: 'Senti-me discriminado, e que não há espaço de fala para mim em nenhuma área por ser branco e heterossexual.', perfil: 'Estudante', subtemaId: 'percepcao_vitimizacao_majoritarios' },
    ],
  },
  {
    id: 'cuidado_trabalho',
    titulo: 'Cuidado, estudo e trabalho',
    icone: <HeartHandshake className="w-5 h-5" />,
    contagem: 111,
    sintese:
      'As subcategorias mais recorrentes foram maternidade, parentalidade, dependentes, sobrecarga de trabalho de cuidado não reconhecida e penalidade na carreira. O cuidado aparece tanto como questão estudantil quanto laboral, afetando especialmente mulheres, mães e pessoas que precisam conciliar estudo, trabalho e família.',
    subtemas: [
      { id: 'maternidade', nome: 'Maternidade', frequencia: 51 },
      { id: 'parentalidade', nome: 'Parentalidade', frequencia: 41 },
      { id: 'dependentes', nome: 'Dependentes', frequencia: 32 },
      { id: 'sobrecarga_cuidado', nome: 'Sobrecarga de cuidado não reconhecida', frequencia: 26 },
      { id: 'penalidade_carreira', nome: 'Penalidade na carreira', frequencia: 17 },
    ],
    trechos: [
      { texto: 'Quando se tem filhos pequenos e em idade escolar, diversas ações importantes para a carreira docente ficam muito difíceis de realizar: participação em congressos em outras cidades, atividades que exigem maior flexibilidade de horário. Essas dificuldades prejudicam a construção de um currículo competitivo.', perfil: 'Servidor(a)', subtemaId: 'penalidade_carreira' },
      { texto: 'O cuidado com os filhos ou com pais idosos é visto como "problema" da servidora.', perfil: 'Servidor(a)', subtemaId: 'sobrecarga_cuidado' },
      { texto: 'O IFRS poderia ter espaços mais preparados para receber estudantes mães que precisam levar seus bebês e filhos junto para a aula! Espaço com trocador, lugar para guardar ou esquentar alimentos, se necessário.', perfil: 'Estudante', subtemaId: 'maternidade' },
    ],
  },
  {
    id: 'denuncia',
    titulo: 'Denúncia e acolhimento',
    icone: <ShieldAlert className="w-5 h-5" />,
    contagem: 80,
    sintese:
      'As subcategorias mais recorrentes foram impunidade, descrença, negligência institucional no encaminhamento, comentários ofensivos e assédio moral. O problema da denúncia não aparece apenas como desconhecimento dos canais, mas como desconfiança quanto à efetividade dos encaminhamentos: não basta divulgar canais, é preciso qualificar o percurso institucional após o relato.',
    subtemas: [
      { id: 'impunidade', nome: 'Impunidade', frequencia: 46 },
      { id: 'descrenca', nome: 'Descrença', frequencia: 26 },
      { id: 'negligencia_encaminhamento', nome: 'Negligência no encaminhamento', frequencia: 11 },
      { id: 'comentarios_ofensivos', nome: 'Comentários ofensivos', frequencia: 11 },
      { id: 'assedio_moral', nome: 'Assédio moral', frequencia: 9 },
    ],
    trechos: [
      { texto: 'No que se refere a reclamações sobre discriminação, assédio moral e/ou sexual, o processo de verificação é muito moroso e causa insegurança ao reclamante.', perfil: 'Servidor(a)', subtemaId: 'impunidade' },
      { texto: 'O que consta nos documentos institucionais é uma coisa; o que acontece no campus, na prática, é diferente.', perfil: 'Servidor(a)', subtemaId: 'descrenca' },
      { texto: 'As pessoas responsáveis por políticas de mediação de conflitos deveriam ser fiscalizadas para não desencorajar denúncias.', perfil: 'Estudante', subtemaId: 'negligencia_encaminhamento' },
    ],
  },
  {
    id: 'nucleos',
    titulo: 'Núcleos e redes de apoio',
    icone: <Building2 className="w-5 h-5" />,
    contagem: 42,
    sintese:
      'As subcategorias mais recorrentes foram desconhecimento, falta de visibilidade, campanhas, comunicação e mudança institucional. O desafio não está apenas na existência formal dos núcleos e assessorias, mas em sua capacidade de se tornarem reconhecidos, acessíveis e integrados ao cotidiano institucional.',
    subtemas: [
      { id: 'desconhecimento', nome: 'Desconhecimento', frequencia: 14 },
      { id: 'falta_visibilidade', nome: 'Falta de visibilidade', frequencia: 13 },
      { id: 'campanhas', nome: 'Campanhas', frequencia: 8 },
      { id: 'comunicacao', nome: 'Comunicação', frequencia: 8 },
      { id: 'mudanca_institucional', nome: 'Mudança institucional', frequencia: 7 },
    ],
    trechos: [
      { texto: 'Os núcleos são pouco ou nada valorizados pelas gestões dos campi. As equipes dos núcleos atuam com grande sobrecarga de trabalho, nenhum reconhecimento e ainda recebem represálias de colegas e, até mesmo, das gestões dos campi.', perfil: 'Servidor(a)', subtemaId: 'falta_visibilidade' },
      { texto: 'Muitos dos projetos acabam em falta de divulgação crônica. Os projetos deveriam buscar participar de mais eventos para que se difundisse a existência de tais organizações.', perfil: 'Estudante', subtemaId: 'desconhecimento' },
    ],
  },
];

const TITULOS_POR_ID: Record<string, string> = Object.fromEntries(TEMAS.map((t) => [t.id, t.titulo]));

// Tabela 3 do esboço do relatório qualitativo: principais coocorrências entre categorias
// (quantas respostas foram classificadas simultaneamente nos dois temas).
const COOCORRENCIAS: { a: string; b: string; respostas: number; percentual: string }[] = [
  { a: 'convivencia', b: 'violencias', respostas: 73, percentual: '4,76%' },
  { a: 'convivencia', b: 'sugestoes', respostas: 42, percentual: '2,74%' },
  { a: 'denuncia', b: 'violencias', respostas: 36, percentual: '2,35%' },
  { a: 'sugestoes', b: 'violencias', respostas: 28, percentual: '1,83%' },
  { a: 'curriculo_formacao', b: 'sugestoes', respostas: 28, percentual: '1,83%' },
  { a: 'curriculo_formacao', b: 'violencias', respostas: 24, percentual: '1,57%' },
  { a: 'convivencia', b: 'denuncia', respostas: 20, percentual: '1,30%' },
  { a: 'nucleos', b: 'sugestoes', respostas: 20, percentual: '1,30%' },
  { a: 'convivencia', b: 'curriculo_formacao', respostas: 16, percentual: '1,04%' },
  { a: 'cuidado_trabalho', b: 'sugestoes', respostas: 15, percentual: '0,98%' },
  { a: 'convivencia', b: 'cuidado_trabalho', respostas: 11, percentual: '0,72%' },
  { a: 'denuncia', b: 'sugestoes', respostas: 10, percentual: '0,65%' },
  { a: 'convivencia', b: 'nucleos', respostas: 10, percentual: '0,65%' },
  { a: 'cuidado_trabalho', b: 'violencias', respostas: 7, percentual: '0,46%' },
  { a: 'denuncia', b: 'nucleos', respostas: 6, percentual: '0,39%' },
];

export const PageRespondentesDisseram: React.FC = () => {
  const [temaSelecionado, setTemaSelecionado] = useState<string | null>(null);
  const [subtemaSelecionado, setSubtemaSelecionado] = useState<string | null>(null);
  const [mostrarTodosTrechos, setMostrarTodosTrechos] = useState(false);
  const [perguntasReveladas, setPerguntasReveladas] = useState<Set<string>>(new Set());
  const [modalPerguntas, setModalPerguntas] = useState(false);
  const [modalAnalise, setModalAnalise] = useState(false);
  const detalheRef = useRef<HTMLDivElement>(null);

  const temaAtual = TEMAS.find((t) => t.id === temaSelecionado) || null;

  useEffect(() => {
    setSubtemaSelecionado(null);
    setMostrarTodosTrechos(false);
    if (temaSelecionado && detalheRef.current) {
      detalheRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [temaSelecionado]);

  const selecionarTema = (id: string) => {
    setTemaSelecionado((atual) => (atual === id ? null : id));
  };

  const alternarSubtema = (id: string) => {
    setSubtemaSelecionado((atual) => (atual === id ? null : id));
    setMostrarTodosTrechos(false);
  };

  const alternarPergunta = (chave: string) => {
    setPerguntasReveladas((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  };

  // Gráfico geral: temas presentes nas respostas abertas (contagens, sem percentuais, sem empilhamento)
  const temasOrdenados = [...TEMAS].sort((a, b) => b.contagem - a.contagem);
  const linhasTemas = [...temasOrdenados].reverse();

  const optionTemasGeral = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#d3dbd6',
      textStyle: { color: '#14201a' },
      formatter: (params: any[]) => {
        const p = params[0];
        const tema = linhasTemas[p.dataIndex];
        return `<div class="font-bold text-texto mb-1">${tema.titulo}</div><div class="text-xs text-texto-2">Identificado em <strong>${formatarNumero(tema.contagem)}</strong> respostas</div>`;
      },
    },
    grid: { left: '3%', right: '4%', top: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 12, color: '#4d5a53' },
      splitLine: { lineStyle: { stroke: '#e3e8e5' } },
    },
    yAxis: {
      type: 'category',
      data: linhasTemas.map((t) => t.titulo),
      axisLabel: { fontSize: 13, color: '#2f3b35' },
    },
    series: [
      {
        type: 'bar',
        data: linhasTemas.map((t) => ({
          value: t.contagem,
          itemStyle: { color: t.id === temaSelecionado ? '#1f6d2b' : PALETA_ACESSIVEL[1] },
        })),
        cursor: 'pointer',
        barMaxWidth: 28,
      },
    ],
  };

  const aoClicarBarraTema = (params: any) => {
    const tema = linhasTemas[params.dataIndex];
    if (tema) selecionarTema(tema.id);
  };

  // Gráfico de subtemas (dentro do tema selecionado), quando houver frequências numéricas
  const subtemasComFrequencia = (temaAtual?.subtemas || []).filter((s) => s.frequencia !== null) as (Subtema & { frequencia: number })[];
  const subtemasOrdenados = [...subtemasComFrequencia].sort((a, b) => b.frequencia - a.frequencia);
  const linhasSubtemas = [...subtemasOrdenados].reverse();

  const optionSubtemas = temaAtual
    ? {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#ffffff',
          borderColor: '#d3dbd6',
          textStyle: { color: '#14201a' },
          formatter: (params: any[]) => {
            const p = params[0];
            const sub = linhasSubtemas[p.dataIndex];
            return `<div class="font-bold text-texto mb-1">${sub.nome}</div><div class="text-xs text-texto-2">${formatarNumero(sub.frequencia)} respostas</div>`;
          },
        },
        grid: { left: '3%', right: '4%', top: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'value',
          axisLabel: { fontSize: 12, color: '#4d5a53' },
          splitLine: { lineStyle: { stroke: '#e3e8e5' } },
        },
        yAxis: {
          type: 'category',
          data: linhasSubtemas.map((s) => s.nome),
          axisLabel: { fontSize: 13, color: '#2f3b35' },
        },
        series: [
          {
            type: 'bar',
            data: linhasSubtemas.map((s) => ({
              value: s.frequencia,
              itemStyle: { color: s.id === subtemaSelecionado ? '#1f6d2b' : PALETA_ACESSIVEL[1] },
            })),
            cursor: 'pointer',
            barMaxWidth: 28,
          },
        ],
      }
    : null;

  const aoClicarBarraSubtema = (params: any) => {
    const sub = linhasSubtemas[params.dataIndex];
    if (sub) alternarSubtema(sub.id);
  };

  // Trechos filtrados pelo tema (e, quando selecionado, pelo assunto específico)
  const trechosFiltrados = temaAtual
    ? temaAtual.trechos.filter((t) => !subtemaSelecionado || t.subtemaId === subtemaSelecionado)
    : [];
  const trechosVisiveis = mostrarTodosTrechos ? trechosFiltrados : trechosFiltrados.slice(0, 2);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Título e Resumo Introdutório */}
      <div className="border-b border-borda pb-3">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-6 h-6 text-marca" />
          <h2 className="text-xl font-bold text-texto">O que a comunidade contou</h2>
        </div>
        <p className="text-xs sm:text-sm text-texto-3 mt-1.5">
          Experiências, opiniões e sugestões de quem participou da pesquisa.
        </p>
      </div>

      {/* Conteúdo introdutório */}
      <div className="bg-superficie rounded-xl border border-borda shadow-sm p-6 space-y-4 text-sm text-texto-2 leading-relaxed">
        <p>
          Nas perguntas abertas, estudantes e servidores(as) puderam escrever sobre suas vivências, avaliar
          aspectos do cotidiano institucional e compartilhar ideias para o IFRS. A leitura dessas respostas nos
          ajudou a compreender situações e pontos de vista que as alternativas do questionário, sozinhas, não
          permitiam conhecer.
        </p>
        <p>
          Organizamos esse material por temas. Escolha um deles — no gráfico ou nos cartões abaixo — para
          explorar o que encontramos e conhecer trechos das respostas, selecionados com cuidado para preservar a
          identidade das pessoas participantes.
        </p>
      </div>

      {/* Botões complementares de navegação */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setModalPerguntas(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-borda-forte bg-superficie text-texto hover:bg-realce transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-info" />
          O que perguntamos?
        </button>
        <button
          type="button"
          onClick={() => setModalAnalise(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-borda-forte bg-superficie text-texto hover:bg-realce transition-colors"
        >
          <ClipboardList className="w-4 h-4 text-marca" />
          Como analisamos as respostas?
        </button>
      </div>

      {/* Gráfico geral de temas */}
      <ChartCard
        titulo="Quais temas apareceram nas respostas abertas?"
        subtitulo="Contagens do relatório qualitativo do IFRS. Uma mesma resposta pode aparecer em mais de um tema."
        infoTitulo="Sobre este gráfico"
        infoTooltip={
          <div className="space-y-1">
            <div>Cada barra mostra quantas respostas foram classificadas em cada tema. Clique numa barra (ou num cartão abaixo) para ver o detalhamento.</div>
            <div>Dentro de cada tema, um segundo gráfico mostra os assuntos específicos mais recorrentes, quando disponíveis.</div>
          </div>
        }
        option={optionTemasGeral}
        altura={360}
        fonte="Fonte: relatório qualitativo do IFRS. O gráfico apresenta os oito eixos substantivos; categorias operacionais e comentários sobre a pesquisa ficam na explicação metodológica."
        aoClicarGrafico={aoClicarBarraTema}
        tabelaDados={{
          cabecalhos: ['Tema', 'Respostas'],
          linhas: temasOrdenados.map((t) => [t.titulo, t.contagem]),
        }}
      />
      <p className="text-xs text-texto-3 leading-relaxed -mt-2">
        Uma resposta pode abordar vários temas e ser contada em mais de uma barra. Os números mostram a presença
        dos assuntos nas respostas abertas, não quantas pessoas de todo o IFRS vivenciaram cada situação. A
        frequência também não indica, sozinha, a gravidade ou a importância de um tema.
      </p>

      {/* Cartões temáticos (funcionam como botões de acesso ao mesmo detalhamento do gráfico) */}
      <div className="grid grid-cols-1 @lg:grid-cols-2 gap-3">
        {TEMAS.map((tema) => {
          const ativo = temaSelecionado === tema.id;
          return (
            <button
              key={tema.id}
              type="button"
              onClick={() => selecionarTema(tema.id)}
              className={`flex items-center justify-between gap-3 p-4 rounded-xl border text-left transition-all ${
                ativo
                  ? 'bg-realce border-marca/60 shadow-xs'
                  : 'bg-superficie border-borda hover:bg-realce/60'
              }`}
            >
              <span className="flex items-center gap-2.5 text-sm font-bold text-texto">
                <span className={ativo ? 'text-marca' : 'text-marca'}>{tema.icone}</span>
                {tema.titulo}
              </span>
              <span className="text-xs text-texto-3 font-semibold shrink-0">{formatarNumero(tema.contagem)}</span>
            </button>
          );
        })}
      </div>

      {/* Painel de detalhamento do tema selecionado */}
      {temaAtual && (
        <div
          ref={detalheRef}
          className="bg-superficie rounded-xl border border-marca/40 shadow-sm p-6 space-y-5 scroll-mt-20"
        >
          {/* Título e contagem */}
          <div className="flex items-start justify-between gap-3 border-b border-borda pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-marca">{temaAtual.icone}</span>
              <div>
                <h3 className="text-base font-bold text-texto">{temaAtual.titulo}</h3>
                <p className="text-xs text-texto-3 mt-0.5">
                  Tema identificado em <strong className="text-texto">{formatarNumero(temaAtual.contagem)}</strong> respostas.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTemaSelecionado(null)}
              className="p-1.5 rounded-lg text-texto-3 hover:text-texto hover:bg-realce transition-colors shrink-0"
              title="Fechar detalhamento"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Síntese da análise */}
          <div>
            <span className="text-xs uppercase tracking-wider text-marca font-semibold">Síntese da análise</span>
            <p className="text-sm text-texto-2 leading-relaxed mt-1">{temaAtual.sintese}</p>
          </div>

          {/* Gráfico dos assuntos específicos (subtemas) */}
          <div>
            <span className="text-xs uppercase tracking-wider text-marca font-semibold">
              Quais assuntos apareceram nesse tema?
            </span>
            {subtemasOrdenados.length > 0 ? (
              <>
                <div className="mt-2">
                  <ChartCard
                    titulo="Assuntos específicos"
                    option={optionSubtemas}
                    altura={Math.max(160, subtemasOrdenados.length * 46)}
                    fonte="Fonte: relatório qualitativo do IFRS."
                    aoClicarGrafico={aoClicarBarraSubtema}
                    classeExtra="!p-4"
                  />
                </div>
                <p className="text-xs text-texto-3 italic mt-1.5">
                  Estas são as subcategorias mais recorrentes identificadas neste tema, não necessariamente
                  todas as existentes. As barras não são empilhadas: uma mesma resposta pode mencionar mais de
                  um assunto. Clique numa barra para ver os trechos correspondentes.
                </p>
              </>
            ) : temaAtual.subtemas.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2 mt-2">
                  {temaAtual.subtemas.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => alternarSubtema(sub.id)}
                      aria-pressed={subtemaSelecionado === sub.id}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        subtemaSelecionado === sub.id
                          ? 'bg-marca border-marca text-white'
                          : 'bg-superficie-2 border-borda text-texto-2 hover:bg-realce'
                      }`}
                    >
                      {sub.nome}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-texto-3 italic mt-1.5">
                  Assuntos identificados neste tema; as frequências de cada um ainda estão em apuração. Clique
                  num assunto para ver os trechos correspondentes.
                </p>
              </>
            ) : (
              <p className="text-xs text-texto-3 italic mt-1">
                Os assuntos específicos deste tema ainda serão detalhados em uma próxima atualização.
              </p>
            )}
          </div>

          {/* Trechos selecionados */}
          <div>
            <span className="text-xs uppercase tracking-wider text-marca font-semibold">
              Trechos selecionados
              {subtemaSelecionado && (
                <span className="text-texto-3 normal-case font-normal">
                  {' '}
                  — assunto: {temaAtual.subtemas.find((s) => s.id === subtemaSelecionado)?.nome}
                </span>
              )}
            </span>
            {trechosFiltrados.length > 0 ? (
              <div className="space-y-2 mt-2">
                {trechosVisiveis.map((trecho, idx) => {
                  const chave = `${temaAtual.id}-${subtemaSelecionado || 'geral'}-${idx}`;
                  return (
                    <div key={chave} className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <Quote className="w-3.5 h-3.5 text-marca shrink-0 mt-0.5" />
                        <p className="text-xs text-texto-2 italic leading-relaxed">“{trecho.texto}”</p>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap pl-5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {trecho.perfil && (
                            <span className="text-xs text-texto-3 font-medium">— {trecho.perfil}</span>
                          )}
                          {trecho.temasAssociados?.map((tId) => (
                            <span
                              key={tId}
                              className="text-xs px-1.5 py-0.5 rounded-full bg-realce text-marca border border-borda-forte"
                            >
                              {TITULOS_POR_ID[tId] || tId}
                            </span>
                          ))}
                        </div>
                        {trecho.pergunta && (
                          <button
                            type="button"
                            onClick={() => alternarPergunta(chave)}
                            className="flex items-center gap-1 text-xs font-semibold text-info hover:text-info transition-colors"
                          >
                            <HelpCircle className="w-3 h-3" />
                            Ver a pergunta respondida
                          </button>
                        )}
                      </div>
                      {trecho.pergunta && perguntasReveladas.has(chave) && (
                        <div className="pl-5 text-xs text-texto-3 bg-superficie border border-borda rounded-md p-2">
                          Pergunta respondida: <em>“{trecho.pergunta}”</em>
                        </div>
                      )}
                    </div>
                  );
                })}
                {trechosFiltrados.length > 2 && !mostrarTodosTrechos && (
                  <button
                    type="button"
                    onClick={() => setMostrarTodosTrechos(true)}
                    className="text-xs font-semibold text-marca hover:text-marca transition-colors"
                  >
                    Ler mais respostas selecionadas ({trechosFiltrados.length - 2})
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-texto-3 italic mt-1">
                Nenhum trecho selecionado para este recorte até o momento.
              </p>
            )}
          </div>

          {/* Sugestões relacionadas */}
          {temaAtual.sugestoes && temaAtual.sugestoes.length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-wider text-marca font-semibold">
                Sugestões relacionadas
              </span>
              <ul className="mt-1.5 space-y-1.5">
                {temaAtual.sugestoes.map((sugestao, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-texto-2 leading-relaxed">
                    <Lightbulb className="w-3.5 h-3.5 text-alerta shrink-0 mt-0.5" />
                    {sugestao}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Modal: O que perguntamos? */}
      {modalPerguntas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-superficie-2 rounded-2xl shadow-2xl border border-borda w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-texto">
            <div className="px-6 py-4 border-b border-borda flex items-center justify-between bg-superficie">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-info" />
                <h2 className="text-lg font-bold text-texto">O que perguntamos?</h2>
              </div>
              <button
                onClick={() => setModalPerguntas(false)}
                className="p-2 rounded-lg text-texto-3 hover:text-texto hover:bg-realce transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 flex-1 text-sm bg-fundo">
              <p className="text-xs text-texto-3 italic">
                Estas são as 4 perguntas abertas do formulário "Diagnóstico sobre Gênero e Sexualidade no IFRS".
                Quando a pergunta de origem de um trecho for conhecida, ela aparece junto do trecho exibido na
                página, pelo botão "Ver a pergunta respondida".
              </p>
              <ol className="space-y-3 list-decimal list-inside text-texto-2 text-sm">
                {PERGUNTAS_ABERTAS.map((pergunta, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {pergunta.texto}
                    <div className="text-xs text-texto-3 italic mt-0.5 ml-0.5">{pergunta.contexto}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Como analisamos as respostas? */}
      {modalAnalise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-superficie-2 rounded-2xl shadow-2xl border border-borda w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-texto">
            <div className="px-6 py-4 border-b border-borda flex items-center justify-between bg-superficie">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-marca" />
                <h2 className="text-lg font-bold text-texto">Como analisamos as respostas?</h2>
              </div>
              <button
                onClick={() => setModalAnalise(false)}
                className="p-2 rounded-lg text-texto-3 hover:text-texto hover:bg-realce transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm bg-fundo">
              <p className="text-texto-2 leading-relaxed">
                As respostas às perguntas abertas foram lidas na íntegra e analisadas com base em categorias
                temáticas definidas a priori, a partir do referencial teórico e dos objetivos da pesquisa
                (análise de conteúdo e análise temática), complementadas por subcategorias identificadas no
                próprio material. Como muitas respostas articulam mais de uma dimensão da experiência
                institucional, adotou-se a multicodificação: uma mesma resposta pode ser vinculada a mais de uma
                categoria ou subcategoria.
              </p>

              <ul className="space-y-2 text-xs text-texto-2">
                <li className="flex gap-2">
                  <Info className="w-3.5 h-3.5 text-marca shrink-0 mt-0.5" />
                  <span>
                    Base de respostas abertas analisadas: <strong className="text-texto">1.533</strong>, com{' '}
                    <strong className="text-texto">1.852</strong> ocorrências de categorias ao todo
                    (multicodificação).
                  </span>
                </li>
                <li className="flex gap-2">
                  <Info className="w-3.5 h-3.5 text-marca shrink-0 mt-0.5" />
                  <span>Uma mesma pessoa pode ter respondido a várias perguntas abertas diferentes.</span>
                </li>
                <li className="flex gap-2">
                  <Info className="w-3.5 h-3.5 text-marca shrink-0 mt-0.5" />
                  <span>
                    As respostas foram classificadas em temas e, dentro de cada tema, em assuntos (subtemas)
                    mais específicos.
                  </span>
                </li>
                <li className="flex gap-2">
                  <Info className="w-3.5 h-3.5 text-marca shrink-0 mt-0.5" />
                  <span>
                    Respostas fora do escopo da pesquisa, muito vagas ou sem elementos suficientes para
                    codificação temática foram organizadas numa categoria operacional à parte (484 ocorrências)
                    e não constituem um dos 8 temas deste painel. Respostas críticas, hostis, irônicas ou de
                    negação da pauta não entram nessa categoria: elas são classificadas em "Resistências à pauta
                    de gênero e diversidade", por serem dado analítico relevante.
                  </span>
                </li>
                <li className="flex gap-2">
                  <Info className="w-3.5 h-3.5 text-marca shrink-0 mt-0.5" />
                  <span>
                    A seleção de trechos seguiu critério ético de proteção das pessoas respondentes, priorizando
                    excertos com menor risco de identificação; por isso, a contagem do gráfico pode ser maior
                    que o número de trechos disponíveis para leitura.
                  </span>
                </li>
              </ul>

              <div className="bg-alerta-fundo/40 border border-alerta-borda/60 rounded-xl p-4 text-alerta text-xs leading-relaxed">
                As contagens apresentadas referem-se às respostas e aos temas identificados nelas, e não
                necessariamente a pessoas diferentes: uma mesma resposta pode conter mais de um tema.
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-marca font-semibold">
                  Principais coocorrências entre temas
                </span>
                <p className="text-xs text-texto-3 mt-1 mb-2">
                  Alguns temas aparecem juntos na mesma resposta. Por exemplo, a combinação mais frequente,
                  Convivência e pertencimento + Violências e discriminação, mostra que relatos de violência
                  aparecem fortemente associados a clima institucional e segurança.
                </p>
                <div className="overflow-x-auto rounded-lg border border-borda max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-superficie text-texto font-semibold border-b border-borda sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Combinação de temas</th>
                        <th className="px-3 py-2">Respostas</th>
                        <th className="px-3 py-2">% do total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borda text-texto-3">
                      {COOCORRENCIAS.map((c, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-texto-2">
                            {TITULOS_POR_ID[c.a]} + {TITULOS_POR_ID[c.b]}
                          </td>
                          <td className="px-3 py-2">{formatarNumero(c.respostas)}</td>
                          <td className="px-3 py-2">{c.percentual}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-superficie border border-borda rounded-xl p-4 text-xs text-texto-3 leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-texto">
                  <Info className="w-3.5 h-3.5 text-info" />
                  Filtros (em planejamento)
                </div>
                <p>
                  A ideia é permitir filtrar por segmento (estudantes ou servidores(as)), pergunta de origem e
                  tema/assunto específico. Isso depende de organizar as respostas em uma base codificada
                  resposta por resposta, o que pode ser desenvolvido em uma próxima etapa.
                </p>
                <p>
                  Os filtros globais do painel (campus, gênero, etc.) só devem valer para esta aba quando houver
                  correspondência nos dados e condições de preservar a identidade das pessoas participantes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
