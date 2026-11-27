/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CATALOGO_CAMPOS } from '../../lib/catalogo';
import {
  BookOpen,
  Target,
  FileText,
  Calendar,
  Users,
  Database,
  HelpCircle,
  LayoutDashboard,
  Compass,
  AlertTriangle,
  Lock,
  Bookmark,
  Mail,
  Scale,
  Search,
  ExternalLink,
  Info,
} from 'lucide-react';

export const PageMetodologia: React.FC = () => {
  const campos = Object.values(CATALOGO_CAMPOS);
  const [buscaVariavel, setBuscaVariavel] = useState<string>('');
  const [grupoFiltro, setGrupoFiltro] = useState<string>('todos');

  const camposFiltrados = campos.filter((c) => {
    const matchBusca =
      c.key.toLowerCase().includes(buscaVariavel.toLowerCase()) ||
      c.label.toLowerCase().includes(buscaVariavel.toLowerCase()) ||
      (c.descricao && c.descricao.toLowerCase().includes(buscaVariavel.toLowerCase()));
    const matchGrupo = grupoFiltro === 'todos' || c.grupo === grupoFiltro;
    return matchBusca && matchGrupo;
  });

  const gruposUnicos = Array.from(new Set(campos.map((c) => c.grupo)));

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Cabeçalho da Página */}
      <div className="border-b border-borda pb-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-marca" />
          <h1 className="text-xl sm:text-2xl font-bold text-texto">
            9. Metodologia, Dicionário e Governança de Dados
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-texto-3 mt-1 leading-relaxed">
          Documentação completa do Diagnóstico de Gênero e Diversidade do IFRS: objetivos,
          desenho amostral, fontes, regras de leitura, dicionário oficial de variáveis e diretrizes éticas.
        </p>
      </div>

      {/* Aviso Prévio Fundamental */}
      <div className="bg-alerta-fundo/40 border border-alerta-borda/60 rounded-xl p-5 text-alerta text-xs sm:text-sm space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-alerta">
          <AlertTriangle className="w-5 h-5 text-alerta shrink-0" />
          <span>Antes de usar os dados</span>
        </div>
        <p className="leading-relaxed text-alerta/90">
          Os resultados apresentados descrevem os <strong>4.857 integrantes da comunidade acadêmica analisados</strong> (de um total bruto de 4.878 submissões, após a exclusão metodológica de 21 registros de trabalhadores/as terceirizados/as) que
          responderam voluntariamente ao formulário. Eles <strong>não constituem estimativas populacionais probabilísticas</strong> do
          IFRS. Recomendamos a leitura atenta da seção{' '}
          <a href="#limites-pesquisa" className="underline font-semibold hover:text-alerta">
            9. Limites da pesquisa
          </a>{' '}
          antes de extrair conclusões inferenciais.
        </p>
      </div>

      {/* Sumário Rápido de Seções */}
      <div className="bg-superficie-2 rounded-xl border border-borda p-4 text-xs">
        <span className="font-semibold text-texto mb-2 block text-xs uppercase tracking-wider text-marca">
          Navegação Rápida do Documento
        </span>
        <div className="flex flex-wrap gap-2 text-texto-2">
          <a href="#objetivo" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">1. Objetivo</a>
          <a href="#visao-geral" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">2. Visão Geral</a>
          <a href="#periodo" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">3. Coleta</a>
          <a href="#quem-respondeu" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">4. Respondentes & Ética</a>
          <a href="#fonte-dados" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">5. Fonte & Regra de Ouro de Gênero</a>
          <a href="#como-ler" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">6. Leitura dos Indicadores</a>
          <a href="#graficos-paginas" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">7. Guia das Páginas</a>
          <a href="#ordem-leitura" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">8. Roteiro Sugerido</a>
          <a href="#limites-pesquisa" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">9. Limites</a>
          <a href="#privacidade" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">10. Privacidade</a>
          <a href="#siglas" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">11. Siglas & Termos</a>
          <a href="#contato" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">12. Contato</a>
          <a href="#indices-formulas" className="px-2.5 py-1 rounded-md bg-marca-fundo/60 text-marca hover:bg-marca-fundo/80 border border-marca-borda/60 transition-colors">Fórmulas dos Índices</a>
          <a href="#dicionario-campos" className="px-2.5 py-1 rounded-md bg-marca-fundo/60 text-marca hover:bg-marca-fundo/80 border border-marca-borda/60 transition-colors">Dicionário de Variáveis</a>
        </div>
      </div>

      {/* 1. Objetivo */}
      <section id="objetivo" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-marca">
          <Target className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">1. Objetivo Institucional</h2>
        </div>
        <p className="text-xs sm:text-sm text-texto-2 leading-relaxed">
          O diagnóstico tem como finalidade primordial <strong>mapear e analisar indicadores institucionais de gênero e diversidade</strong> no
          IFRS, abrangendo todos os 17 campi e a Reitoria, para fornecer subsídios empíricos à formulação de políticas institucionais voltadas à:
        </p>
        <ul className="list-disc list-inside text-xs sm:text-sm text-texto-2 space-y-1.5 pl-2">
          <li>Equidade de gênero e justiça de oportunidades em todas as esferas acadêmicas e funcionais;</li>
          <li>Permanência discente e apoio institucional a estudantes e servidores/as com responsabilidades de cuidado familiar;</li>
          <li>Respeito à diversidade e prevenção estrutural a violências, assédios moral e sexual e discriminações;</li>
          <li>Avaliação do clima institucional, da confiança nos canais de ouvidoria/denúncia e do conhecimento sobre núcleos de base (NEPGS, NEABI, NAAF) e campanhas preventivas.</li>
        </ul>
        <p className="text-xs text-texto-3">
          Público destinatário dos dados: comunidade acadêmica, Assessoria de Gênero e Diversidade, equipes gestoras, comissões de permanência e núcleos de pesquisa.
        </p>
      </section>

      {/* 2. Visão geral do projeto */}
      <section id="visao-geral" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-marca">
          <FileText className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">2. Visão Geral do Projeto e Marco Referencial</h2>
        </div>
        <p className="text-xs sm:text-sm text-texto-2 leading-relaxed">
          O IFRS aderiu ao <strong>Marco Referencial para Igualdade de Gênero em Instituições de Ensino Superior no Brasil</strong>,
          inspirado na consagrada metodologia britânica <em>Athena Swan Charter</em>. O Marco estrutura a avaliação da equidade
          em dimensões fundamentais: visão geral da instituição, suporte às trajetórias de carreira, cultura institucional, inclusão e pertencimento.
          Este diagnóstico constitui a etapa indispensável de levantamento de evidências empíricas que embasa esse processo.
        </p>
        <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-3 pt-1">
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 text-xs">
            <span className="font-bold text-marca block mb-1">Parte Quantitativa (Neste Painel)</span>
            <p className="text-texto-2">
              Respostas fechadas (múltipla escolha, escalas Likert de concordância e frequências), tratadas
              em indicadores estatísticos agregados, mapas de calor e gráficos analíticos.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 text-xs">
            <span className="font-bold text-alerta block mb-1">Parte Qualitativa (Relatório Narrativo)</span>
            <p className="text-texto-2">
              Respostas abertas e depoimentos textuais livres, analisados à parte.
              <strong> Nenhum texto aberto é exibido no painel ou exposto para resguardar a privacidade</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Período de coleta */}
      <section id="periodo" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-marca">
          <Calendar className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">3. Período de Coleta e Volume Amostral</h2>
        </div>
        <div className="grid grid-cols-1 @lg:grid-cols-2 gap-4">
          <div className="bg-superficie-2 border border-borda rounded-lg p-4">
            <span className="text-xs text-texto-3 block">Janela Temporal de Respostas:</span>
            <span className="text-base font-bold text-marca mt-1 block">
              07/10/2025 a 28/07/2026
            </span>
            <span className="text-xs text-texto-3 mt-0.5 block">
              Registro da primeira à última submissão no formulário eletrônico.
            </span>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-4">
            <span className="text-xs text-texto-3 block">Total de Participações Analisadas no Painel:</span>
            <span className="text-xl font-extrabold text-texto mt-1 block">
              4.857 respondentes
            </span>
            <span className="text-xs text-marca mt-0.5 block">
              Extraídos de 4.878 registros brutos após a exclusão de 21 registros de terceirizados (4.790 com gênero válido).
            </span>
          </div>
        </div>
      </section>

      {/* 4. Quem respondeu e aspectos éticos */}
      <section id="quem-respondeu" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-marca">
          <Users className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">4. Perfil dos Respondentes e Rigor Ético</h2>
        </div>
        <p className="text-xs sm:text-sm text-texto-2 leading-relaxed">
          O painel analisa os vínculos institucionais de carreira e estudantis do IFRS: <strong>discentes</strong> (3.216; 66,2%),
          <strong> docentes efetivos/as</strong> (763; 15,7%), <strong>docentes substitutos/as</strong> (151; 3,1%) e <strong>servidores/as técnico-administrativos em educação — TAEs</strong> (679; 14,0%), além de 17 servidores/as efetivos/as sem cargo específico declarado e 31 respondentes que optaram por "Prefiro não responder" no vínculo.
          <strong> Trabalhadores/as terceirizados/as (21 registros na base bruta) foram integralmente removidos de todas as análises, gráficos, indicadores e filtros do painel</strong> por diretriz metodológica institucional.
          Em todas as perguntas sensíveis, foi assegurada a opção <strong>"Prefiro não responder"</strong>.
        </p>

        <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-4 pt-1">
          <div className="bg-superficie-2 border border-borda rounded-lg p-4 text-xs space-y-2">
            <h3 className="font-bold text-texto">Protocolo de Aplicação do Formulário</h3>
            <ul className="space-y-1.5 text-texto-2">
              <li>• <strong>Servidores/as:</strong> convites institucionais via e-mail corporativo com hiperlink individualizado anônimo.</li>
              <li>• <strong>Discentes:</strong> articulação de coordenações e docentes com sessões em laboratórios de informática, assegurando sigilo individual diante de pares.</li>
              <li>• <strong>Menores de 18 anos:</strong> Termo de Consentimento Livre e Esclarecido (TCLE) prévio dos responsáveis legais e Termo de Assentimento do estudante, com registros físicos arquivados dissociados do banco digital.</li>
            </ul>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-4 text-xs space-y-2">
            <h3 className="font-bold text-texto">Conformidade e Diretrizes Éticas</h3>
            <p className="text-texto-2 leading-relaxed">
              A pesquisa segue estritamente as <strong>Resoluções CNS nº 466/2012 e nº 510/2016</strong>. A participação
              é estritamente voluntária e anônima. Não há rastreamento de IP, e-mail, login corporativo ou qualquer metadado
              identificador. As equipes locais de assistência estudantil e apoio psicossocial foram orientadas preventivamente para prestar acolhimento caso solicitado.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Fonte dos dados e normalizações */}
      <section id="fonte-dados" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-marca">
          <Database className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">5. Fonte dos Dados, Tratamento e Regra de Ouro de Normalização de Gênero</h2>
        </div>
        <p className="text-xs sm:text-sm text-texto-2 leading-relaxed">
          Os dados brutos originam-se da extração tabular da pesquisa institucional, saneados e estruturados em banco relacional PostgreSQL (Supabase).
          Os cálculos, taxas e agregações ocorrem dinamicamente no servidor através de consultas determinísticas com parametrização estrita, garantindo reprodutibilidade matemática absoluta:
        </p>

        <div className="bg-superficie-2 border border-borda rounded-lg p-4 text-xs space-y-2 text-texto-2">
          <p>
            • <strong>Preservação das respostas originais:</strong> Nenhuma informação foi alterada ou suprimida no banco de dados bruto (4.878 registros originais mantêm o teor exato submetido pelos/as participantes para fins de auditoria).
          </p>
          <p>
            • <strong>Exclusão Global de Trabalhadores/as Terceirizados/as (<code className="text-marca font-mono">SQL_FILTRO_SEM_TERCEIRIZADOS</code>):</strong> Os 21 registros de profissionais terceirizados (20 com <code className="text-marca font-mono">vinculo = 'Terceirizado'</code> e 1 com <code className="text-marca font-mono">cargo = 'Terceirizado'</code>) são excluídos globalmente de todas as análises, KPIs, gráficos e filtros do painel, resultando no universo analítico oficial de <strong>4.857 respondentes</strong>.
          </p>
          <p>
            • <strong>Normalização de Orientação Sexual (<code className="text-marca font-mono">SQL_ORIENTACAO_NORMALIZADA</code>):</strong> Variantes com grafia divergente ou autodeclarações equivalentes são consolidadas automaticamente (ex.: <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Demisexual</code> + <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Demissexual</code> → <strong>Demissexual</strong>; <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Hétero</code> / <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Normal</code> → <strong>Heterossexual</strong>; <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Panssexual</code> / <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Panromantica</code> → <strong>Pansexual</strong>; <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Bissexual</code> / <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Bi</code> → <strong>Bissexual</strong>).
          </p>
          <p>
            • <strong>Classificação de Áreas STEM dos/as estudantes:</strong> Devido ao preenchimento textual livre do nome do curso pelo discente, um algoritmo determinístico de correspondência de termos agrupou as menções nas 8 Grandes Áreas do Conhecimento do CNPq (Engenharias e Tecnologia, Ciências Exatas e da Terra, Ciências Sociais Aplicadas, Ciências Agrárias, Ciências Humanas, Linguística, Letras e Artes, Ciências Biológicas e Ciências da Saúde). Após rigorosa auditoria metodológica e contextual (cruzando termos livres com Campus e Nível de Curso), apenas 8 respostas individuais (8 respondentes) permaneceram como "Não classificada" por informarem nível/modalidade de ensino ou respostas indeterminadas.
          </p>
        </div>

        {/* Subseção Detalhada: Normalização de Gênero (Regra de Ouro Oficial) */}
        <div className="bg-superficie-2 border border-marca-borda/50 rounded-lg p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center gap-2 text-marca">
            <Info className="w-4 h-4 shrink-0 text-marca" />
            <h3 className="font-bold text-sm text-texto">
              Regra de Ouro Oficial: Normalização e Classificação de Gênero (6 Categorias Estritas)
            </h3>
          </div>

          <p className="text-xs text-texto-2 leading-relaxed">
            No formulário eletrônico, o item de gênero disponibilizou tanto opções fechadas quanto a possibilidade de digitação livre (campo aberto "Outro / Como você se identifica"). Essa flexibilidade gerou <strong>53 variações textuais distintas</strong> na base de dados.
          </p>

          <p className="text-xs text-texto-2 leading-relaxed">
            Para assegurar consistência absoluta entre todos os gráficos, indicadores, filtros globais e o construtor dinâmico, o painel adota uma <strong>Regra de Ouro única parametrizada no servidor</strong> (<code className="text-marca font-mono">SQL_GENERO_NORMALIZADO</code>). Entre os 4.857 respondentes analisados (sem terceirizados), todas as respostas válidas são classificadas estritamente em <strong>6 categorias oficiais</strong> (<code className="text-marca font-mono">total: 4.790</code>; 98,62% da amostra), enquanto respostas sem declaração de gênero ou invalidadas (<code className="text-texto-2 font-mono">total: 67</code>; 1,38%) são desconsideradas dos gráficos e filtros de gênero:
          </p>

          <div className="overflow-x-auto rounded-lg border border-borda">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-superficie-2 text-texto font-semibold border-b border-borda">
                <tr>
                  <th className="px-3 py-2.5 w-40">Categoria Oficial</th>
                  <th className="px-3 py-2.5 w-28">Respondentes</th>
                  <th className="px-3 py-2.5">Critérios de Classificação e Autodeclarações Mapeadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borda text-texto-2">
                <tr className="hover:bg-superficie transition-colors">
                  <td className="px-3 py-2.5 font-bold text-marca">
                    Mulher
                  </td>
                  <td className="px-3 py-2.5 font-mono text-texto font-semibold">
                    2.650 (55,3%*)
                  </td>
                  <td className="px-3 py-2.5 text-xs leading-relaxed">
                    Consolida <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Mulher (cisgênero)</code> (2.639), respostas diretas <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Mulher</code> (6), variações com pontuação/espaçamento (<code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Mulher </code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Mulher, </code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Mulher, hétero.</code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Mulher negra, mas não sei porque tantos rótulos</code>) e <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">FEMINIMO</code> (1).
                  </td>
                </tr>
                <tr className="hover:bg-superficie transition-colors">
                  <td className="px-3 py-2.5 font-bold text-marca">
                    Homem
                  </td>
                  <td className="px-3 py-2.5 font-mono text-texto font-semibold">
                    1.989 (41,5%*)
                  </td>
                  <td className="px-3 py-2.5 text-xs leading-relaxed">
                    Consolida <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Homem (cisgênero)</code> (1.969), <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Homem</code> / <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">homem</code> (4), variantes afirmativas livres (<code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Apenas HOMEM</code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Homem normal</code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Homem biológico</code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Homem hétero</code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Homem bagual</code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Homem Macho alpha</code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">O biologicamente correto, homem cisgênero</code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Homem, até onde eu sabia...</code>) e autodeclarações de sexo masculino (<code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Masculino </code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Sexo masculino </code>, <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Possuo cromossomos XY (masculino)...</code>).
                  </td>
                </tr>
                <tr className="hover:bg-superficie transition-colors">
                  <td className="px-3 py-2.5 font-bold text-marca">
                    Mulher Trans
                  </td>
                  <td className="px-3 py-2.5 font-mono text-texto font-semibold">
                    25 (0,5%*)
                  </td>
                  <td className="px-3 py-2.5 text-xs leading-relaxed">
                    Corresponde integralmente às respondentes autodeclaradas como <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Mulher (transgênero)</code> (25).
                  </td>
                </tr>
                <tr className="hover:bg-superficie transition-colors">
                  <td className="px-3 py-2.5 font-bold text-marca">
                    Homem Trans
                  </td>
                  <td className="px-3 py-2.5 font-mono text-texto font-semibold">
                    40 (0,8%*)
                  </td>
                  <td className="px-3 py-2.5 text-xs leading-relaxed">
                    Consolida <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Homem (transgênero)</code> (39) e <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Transmasculino</code> (1).
                  </td>
                </tr>
                <tr className="hover:bg-superficie transition-colors">
                  <td className="px-3 py-2.5 font-bold text-marca">
                    Travesti
                  </td>
                  <td className="px-3 py-2.5 font-mono text-texto font-semibold">
                    6 (0,1%*)
                  </td>
                  <td className="px-3 py-2.5 text-xs leading-relaxed">
                    Corresponde integralmente às respondentes autodeclaradas como <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Travesti</code> (6).
                  </td>
                </tr>
                <tr className="hover:bg-superficie transition-colors">
                  <td className="px-3 py-2.5 font-bold text-marca">
                    Não-binários
                  </td>
                  <td className="px-3 py-2.5 font-mono text-texto font-semibold">
                    80 (1,7%*)
                  </td>
                  <td className="px-3 py-2.5 text-xs leading-relaxed">
                    Reúne todas as autodeclarações não-binárias e dissidentes: <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Não-binário</code> (71), <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Agênero</code> (2), variações de <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Gênero Fluido / fluído / fluido</code> (4), <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Demigirl</code> (1), <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Alexigênero</code> (1) e <code className="text-marca bg-marca-fundo/60 px-1 py-0.5 rounded">Pangênero</code> (1).
                  </td>
                </tr>
                <tr className="bg-superficie-2/60 hover:bg-superficie transition-colors">
                  <td className="px-3 py-2.5 font-bold text-perigo">
                    Desconsideradas nos Gráficos de Gênero (NULL)
                  </td>
                  <td className="px-3 py-2.5 font-mono text-perigo font-semibold">
                    67 (1,4% do total)
                  </td>
                  <td className="px-3 py-2.5 text-xs leading-relaxed">
                    Engloba <code className="text-texto-2 bg-realce px-1 py-0.5 rounded">Prefiro não responder</code> (53) e <strong>14 respostas invalidadas</strong> por conterem orientação sexual no campo de gênero (<code className="text-texto-2 bg-realce px-1 py-0.5 rounded">Hetero</code>, <code className="text-texto-2 bg-realce px-1 py-0.5 rounded">Bissexual</code>, <code className="text-texto-2 bg-realce px-1 py-0.5 rounded">gay</code>, <code className="text-texto-2 bg-realce px-1 py-0.5 rounded">sapatão</code>), protesto/recusa (<code className="text-texto-2 bg-realce px-1 py-0.5 rounded">Acho o genero totalmente desnecessário</code>, <code className="text-texto-2 bg-realce px-1 py-0.5 rounded">Não tenho gênero...</code>) ou respostas satíricas/"zueras" (<code className="text-texto-2 bg-realce px-1 py-0.5 rounded">Geladeira Frost Free</code>, <code className="text-texto-2 bg-realce px-1 py-0.5 rounded">Me identifico como um jegue</code>, <code className="text-texto-2 bg-realce px-1 py-0.5 rounded">Patrola</code>, <code className="text-texto-2 bg-realce px-1 py-0.5 rounded">tio paulo</code>, <code className="text-texto-2 bg-realce px-1 py-0.5 rounded">Jedi</code>, <code className="text-texto-2 bg-realce px-1 py-0.5 rounded">sem gênero com pênis</code>). Estes 67 registros permanecem nos indicadores gerais da pesquisa (total: 4.857), mas são filtrados (<code className="text-perigo font-mono">IS NOT NULL</code>) em todos os gráficos e recortes por gênero.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-1 text-xs text-texto-3 leading-relaxed">
            * <strong>Nota de rigor estatístico:</strong> Os percentuais com asterisco (*) são calculados sobre o total de <strong>4.790 respostas válidas de gênero</strong> (após exclusão de terceirizados). O parâmetro centralizado <code className="text-marca font-mono">SQL_GENERO_NORMALIZADO</code> é reutilizado em todas as consultas SQL do painel, garantindo que nenhum gráfico classifique gêneros de forma divergente.
          </div>
        </div>
      </section>

      {/* 6. Como ler os números */}
      <section id="como-ler" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-marca">
          <HelpCircle className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">6. Como Ler os Números e Indicadores</h2>
        </div>
        <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-3 text-xs">
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-marca">Base Analisada (Denominador)</span>
            <p className="text-texto-2">
              Corresponde ao total de respondentes elegíveis para a questão (sem trabalhadores/as terceirizados/as). Perguntas exclusivas de servidores/as ou discentes usam suas bases específicas e não o total de 4.857. Nos gráficos por gênero, o denominador corresponde aos/às respondentes com gênero válido dentro das 6 categorias oficiais (até 4.790).
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-marca">Cálculo de Percentuais (%)</span>
            <p className="text-texto-2">
              Calculados sobre as respostas válidas da dimensão analisada. Nos gráficos que segmentam por gênero, declarações "Prefiro não responder" no campo de gênero e respostas invalidadas não são contabilizadas.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-marca">Média em Escala Likert (1 a 5)</span>
            <p className="text-texto-2">
              Opções como "Não conheço" ou "Não se aplica" não possuem peso numérico e são expurgadas do cálculo da média, figurando em contagens próprias ao lado.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-marca">Aglutinação Likert Simplificada</span>
            <p className="text-texto-2">
              Para maior clareza de leitura, os gráficos de mérito e acesso aglutinam: <strong>Concordo</strong> (notas 4 e 5: Concordo totalmente + Concordo), <strong>Neutro</strong> (nota 3) e <strong>Discordo</strong> (notas 1 e 2: Discordo totalmente + Discordo).
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-marca">Índices Normalizados (0% a 100%)</span>
            <p className="text-texto-2">
              Calculados linearmente a partir das médias de 1 a 5 pela fórmula <code>((Média − 1) / 4) × 100</code>. Quanto mais próximo de 100%, mais positiva a percepção institucional.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-marca">Item Invertido no Clima</span>
            <p className="text-texto-2">
              O item <em>"A maternidade impacta negativamente a trajetória"</em> tem sentido reverso: concordar aponta para fragilidade. Para compor o índice geral, é invertido matematicamente (6 − nota).
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-marca">Ocorrência de Assédios e Violências</span>
            <p className="text-texto-2">
              Percentual que assinalou "Sim" para vivência ou presenciamento de violência ou discriminação (por raça/cor e/ou por identidade de gênero / orientação sexual).
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-marca">Diversidade de Shannon e Categorias Oficiais</span>
            <p className="text-texto-2">
              Shannon avalia o equilíbrio proporcional entre grupos. Na identidade de gênero, os gráficos exibem estritamente as 6 categorias oficiais padronizadas pela Regra de Ouro (Mulher, Homem, Mulher Trans, Homem Trans, Travesti e Não-binários). Respostas inválidas e "Prefiro não responder" no campo de gênero são desconsideradas.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-marca">Seletores Padronizados Transversais</span>
            <p className="text-texto-2">
              O painel disponibiliza seletores reutilizáveis em múltiplos gráficos: <strong>Segmento</strong> (Geral, Docente, Técnico/a TAE, Discentes — com versão restrita a servidores/as na Página 2), <strong>Gênero</strong> (6 categorias oficiais), <strong>Cor / Raça</strong> (6 opções), <strong>PCD</strong> (Sim / Não) e <strong>Idade</strong> (Menor: &lt;18 anos; Maior: ≥18 anos, classificada estritamente com base na autodeclaração de faixa etária).
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-perigo">Taxa de Renúncia com Cuidado (Carreira)</span>
            <p className="text-texto-2">
              Mede a proporção de servidores com encargos de cuidado (responsabilidade principal <em>"Sim"</em> somada à responsabilidade compartilhada <em>"Divido igualmente"</em>) que declararam já ter deixado de se candidatar a cargos ou funções de gestão (<em>"Sim"</em>) devido às demandas de cuidado familiar.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-alerta">Amostra Pequena (n &lt; 10)</span>
            <p className="text-texto-2">
              Células ou categorias com menos de 10 respondentes exigem cautela estatística na leitura para evitar generalizações indevidas.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-texto-2">Símbolo "—"</span>
            <p className="text-texto-2">
              Indica ausência absoluta de respondentes para aquela combinação específica de cruzamento na amostra.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Gráficos e páginas do painel */}
      <section id="graficos-paginas" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-marca">
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">7. Estrutura e Gráficos das Páginas do Painel</h2>
        </div>
        <p className="text-xs text-texto-3">
          Visão detalhada do que é apresentado em cada uma das 9 abas do painel institucional:
        </p>

        <div className="space-y-3 text-xs">
          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Página 0 — Visão Geral</h3>
            <p className="text-texto-2 leading-relaxed">
              Painel executivo com os principais indicadores institucionais: Total de Respondentes (4.857 em 18 unidades: 17 campi + Reitoria, sem terceirizados), Composição da Amostra (Discentes vs. Servidores/as), Ocorrência de Assédios e Violências, Índice de Convivência e Clima Institucional (em %), Conhecimento dos Canais de Denúncia, Efetividade dos Canais de Denúncia, Desencorajamento na Participação Acadêmica por Marcadores Sociais e Responsabilidade de Cuidado. Inclui o gráfico "Distribuição de Respondentes por Campus e Vínculo Institucional" com empilhamento de Discentes, Docentes, Técnicos/as TAEs, Docentes Substitutos e Vínculo/Cargo não informado, além de seletores dedicados de Gênero e Idade.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Página 1 — Perfil Demográfico e Representatividade</h3>
            <p className="text-texto-2 leading-relaxed">
              Mapeamento sociodemográfico com seletores padrão reutilizáveis de Segmento (Geral, Docente, Técnico/a TAE e Discente), Gênero (estritamente nas 6 categorias oficiais: Mulher, Homem, Mulher Trans, Homem Trans, Travesti e Não-binários), Cor / Raça (6 opções IBGE), Deficiência (PCD) e Idade (Menor e Maior) em todos os gráficos: Autodeclaração Étnico-Racial, Faixa Etária (com alinhamento visual de altura), Pessoas com Deficiência (PCD), Orientação Sexual e cartões de Diversidade de Shannon por unidade e segmento.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Página 2 — Carreira, Progressão e Equidade Institucional (Servidores/as)</h3>
            <p className="text-texto-2 leading-relaxed">
              Foco exclusivo em servidores/as docentes e técnicos/as (TAEs), com o seletor de segmento restrito exclusivamente a servidores/as (Geral, Docente, Técnico/a TAE — sem Discentes). Apresenta KPIs de liderança feminina e negra, Composição de Servidores/as por Cargo e Gênero, Tipologia de Função de Gestão (CD, FG, FCC), avaliação da Progressão por Mérito e Equidade no Acesso a Oportunidades e Bolsas. Apresenta o bloco unificado de Cruzamento: Responsabilidade de Cuidado × Deixou de se Candidatar à Gestão com seletores dedicados por Raça e Deficiência, exibindo a Taxa de Renúncia com Cuidado e tabela sincrônica.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Página 3 — Ambiente, Segurança e Violências</h3>
            <p className="text-texto-2 leading-relaxed">
              Diagnóstico do clima institucional: Diagrama Divergente de Percepção do Clima Institucional (com tooltip acessível com mouse, códigos internos Q24a–f removidos e filtros por Segmento, Gênero, Raça e Idade), Índice de Convivência por campus, Percentual de Discriminação por Cor/Raça, Percentual de Discriminação por Gênero e Orientação (proporção que já sofreu LGBTfobia ou violência de gênero nas 6 categorias oficiais), Matriz Interseccional de Discriminação, Desencorajamento de Discentes por Vulnerabilidade e Funil de Conhecimento, Efetividade e Justiça dos Canais de Denúncia (com divisão de servidores/as em Docentes e Técnicos/as TAEs, filtros por Gênero e Raça e cálculo dinâmico da base de respondentes válidos).
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Página 4 — Núcleos, Assessorias e Políticas</h3>
            <p className="text-texto-2 leading-relaxed">
              Avaliação de desempenho dos núcleos de ações afirmativas (NAAFs, NEABIs, NEPGSs e Assessorias) e percepção de eficácia das campanhas e capacitações de diversidade. Apresenta o gráfico de Avaliação dos Núcleos e Assessorias Institucionais (com siglas e nomes oficiais: Assessoria de Ações Afirmativas, Inclusivas e Diversidade; Assessoria de Gênero e Sexualidade; Assessoria de Relações Étnico-raciais e filtro por Segmento), a Matriz Campus × Núcleo: Média de Qualidade (com sigla NEPGS corrigida e linha "Prefiro não responder" removida), Ranking de Desconhecimento dos Núcleos e Percepção sobre a Eficácia das Campanhas e Ações Formativas (com separação entre Docentes e Técnicos/as TAEs).
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Página 5 — Cuidado, Parentalidade e Permanência</h3>
            <p className="text-texto-2 leading-relaxed">
              Investigação da sobrecarga reprodutiva e permanência: gráfico de Responsabilidade Principal de Cuidado por Identidade de Gênero (com 4 opções de resposta padronizadas — unificando "Não" e "Não tenho responsabilidade" —, seletor de Segmento e tooltip ajustado à tela), Políticas de Apoio ao Cuidado, Percepção Acerca da Suficiência das Licenças Maternidade e Paternidade e do Apoio a Estudantes com Filhos/as (com filtro de Segmento), Percepção sobre o Impacto da Maternidade na Carreira (com seletores por Segmento e Raça, percentuais e tooltips aprofundados) e Estudantes com Responsabilidade de Cuidado por Campus, Nível de Curso e Idade (com comboboxes e filtros integrados).
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Página 6 — Áreas de Conhecimento e STEM</h3>
            <p className="text-texto-2 leading-relaxed">
              Análise da representatividade discente em Ciências Exatas, Engenharias e Computação (STEM): KPIs comparativos de desencorajamento acadêmico em áreas STEM vs. Não-STEM, gráfico de Distribuição e Participação Discente por Grande Área do Conhecimento CNPq (com seletores de Gênero, Raça, Deficiência e Idade), novo gráfico dedicado de Desencorajamento na Participação Acadêmica em Cursos STEM (com frequência detalhada entre os 1.556 discentes da área e filtros demográficos) e Tabela de Auditoria e Cobertura da Normalização de Áreas com mapeamento de termos do formulário (reduzido metodologicamente para apenas 8 respondentes em 8 termos não classificados).
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Página 7 — O que a comunidade contou</h3>
            <p className="text-texto-2 leading-relaxed">
              Análise qualitativa das respostas abertas do formulário: temas mais frequentes, assuntos que aparecem em cada tema e trechos selecionados de falas de estudantes e servidores/as, revisados para preservar a identidade das pessoas participantes.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Página 8 — Construtor Dinâmico de Gráficos</h3>
            <p className="text-texto-2 leading-relaxed">
              Módulo de exploração aberta com validação metodológica de cruzamentos: seletores temáticos limpos de duplicidades, filtragem inteligente de compatibilidade entre o Eixo Principal e a Série de Cor (bloqueio de autocruzamentos, isolamento de universos de Discentes vs. Servidores/as e restrição de matrizes sem sentido entre perguntas avaliativas), 3 métricas robustas de tabulação cruzada (% no Grupo, % do Total Geral e Contagem Absoluta n), exclusão automática de registros nulos ("Sem resposta" espúrio) e visualizações em Barras Empilhadas 100%, Barras Agrupadas e Rosca, com exportação instantânea em CSV e persistência local de visões salvas.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Página 9 — Metodologia, Dicionário e Governança</h3>
            <p className="text-texto-2 leading-relaxed">
              Documentação institucional permanente com objetivos, marco referencial Athena Swan, Regra de Ouro das 6 categorias oficiais de gênero, glossário de siglas (NEPGS, NEABI, NAAF, Assessorias), catálogo dinâmico de variáveis do banco de dados e fórmulas matemáticas de todos os índices sintéticos.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Ordem de leitura sugerida */}
      <section id="ordem-leitura" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-marca">
          <Compass className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">8. Ordem de Leitura e Análise Sugerida</h2>
        </div>
        <div className="grid grid-cols-1 @lg:grid-cols-5 gap-2.5 text-xs">
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-marca font-bold text-sm block">1º Passo</span>
              <span className="font-bold text-texto mt-1 block">Visão Geral</span>
            </div>
            <p className="text-texto-3 mt-2 text-xs">
              Tenha uma fotografia macro dos principais indicadores e do volume amostral.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-marca font-bold text-sm block">2º Passo</span>
              <span className="font-bold text-texto mt-1 block">Perfil</span>
            </div>
            <p className="text-texto-3 mt-2 text-xs">
              Compreenda quem são os/as respondentes antes de examinar cruzamentos.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-marca font-bold text-sm block">3º Passo</span>
              <span className="font-bold text-texto mt-1 block">Abas Temáticas</span>
            </div>
            <p className="text-texto-3 mt-2 text-xs">
              Explore carreira, violências, núcleos, parentalidade, STEM e o que a comunidade contou, conforme o foco.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-marca font-bold text-sm block">4º Passo</span>
              <span className="font-bold text-texto mt-1 block">Construtor</span>
            </div>
            <p className="text-texto-3 mt-2 text-xs">
              Crie hipóteses e cruzamentos customizados com filtros multidimensionais.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-marca font-bold text-sm block">5º Passo</span>
              <span className="font-bold text-texto mt-1 block">Metodologia</span>
            </div>
            <p className="text-texto-3 mt-2 text-xs">
              Consulte definições, fórmulas e o catálogo de campos para ancorar conclusões.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Limites da pesquisa */}
      <section id="limites-pesquisa" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-alerta">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">9. Limites Metodológicos da Pesquisa</h2>
        </div>
        <div className="space-y-2.5 text-xs sm:text-sm text-texto-2 leading-relaxed">
          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1">
            <span className="font-bold text-alerta block">• Amostra Voluntária e Não-Probabilística:</span>
            <p className="text-texto-2">
              Embora o projeto tenha sido concebido com metas estratificadas de participação por campus e segmento, a adesão foi voluntária. Consequentemente, as porcentagens descrevem <strong>exclusivamente a amostra respondente</strong> e não podem ser extrapoladas como parâmetros da população total do IFRS.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1">
            <span className="font-bold text-alerta block">• Representatividade Heterogênea entre Unidades:</span>
            <p className="text-texto-2">
              A mobilização variou significativamente entre campi e segmentos. Alguns subgrupos possuem amostra reduzida (n &lt; 10), exigindo cautela na leitura dos percentuais relativos.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1">
            <span className="font-bold text-alerta block">• Natureza da Autodeclaração:</span>
            <p className="text-texto-2">
              Todas as informações sobre gênero, orientação, raça/cor e condições de saúde/deficiência decorrem estritamente da autopercepção expressa pelo respondente no ato da pesquisa.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1">
            <span className="font-bold text-alerta block">• Associação Estatística não Implica Causalidade:</span>
            <p className="text-texto-2">
              As correlações evidenciadas nos cruzamentos revelam disparidades e tendências, mas não estabelecem relações diretas de causa e efeito sem aprofundamento investigativo.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1">
            <span className="font-bold text-alerta block">• Limitação Temporal e Escopo do Instrumento:</span>
            <p className="text-texto-2">
              O questionário reflete o clima e as percepções vigentes no período da coleta. Determinadas nuances institucionais complexas foram capturadas de forma indireta e serão aprofundadas nos relatórios analíticos.
            </p>
          </div>
        </div>
      </section>

      {/* 10. Privacidade e proteção dos dados */}
      <section id="privacidade" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-marca">
          <Lock className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">10. Governança, Privacidade e Proteção de Dados (LGPD)</h2>
        </div>
        <div className="bg-superficie-2 border border-borda rounded-lg p-4 space-y-2 text-xs text-texto-2 leading-relaxed">
          <p>
            • <strong>Exibição Exclusiva de Agregações:</strong> O painel opera como plataforma pública orientada à transparência ativa, exibindo exclusivamente agregações estatísticas, taxas e contagens consolidadas.
          </p>
          <p>
            • <strong>Exclusão Estrita de Respostas Abertas:</strong> Nenhum trecho textual livre de pergunta aberta é armazenado em endpoints públicos ou acessível pelo painel, eliminando riscos de desanonimização por estilo ou relatos particulares.
          </p>
          <p>
            • <strong>Proteção contra Reidentificação em Microamostras:</strong> Cruzamentos com número diminuto de respondentes recebem notas de alerta e tratamento que impossibilita a identificação de pessoas no âmbito local.
          </p>
          <p>
            • <strong>Inexistência de Identificadores Pessoais:</strong> O banco de dados não armazena nomes, CPFs, matrículas SIAPE, números de matrícula discente, endereços IP ou e-mails.
          </p>
        </div>
      </section>

      {/* 11. Siglas e termos */}
      <section id="siglas" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-marca">
          <Bookmark className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">11. Glossário de Siglas e Conceitos Institucionais</h2>
        </div>
        <div className="overflow-x-auto rounded-lg border border-borda">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-superficie-2 text-texto font-semibold border-b border-borda">
              <tr>
                <th className="px-4 py-3 w-48">Sigla / Termo</th>
                <th className="px-4 py-3">Significado e Contexto no IFRS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda">
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">IFRS</td>
                <td className="px-4 py-2.5 text-texto-2">Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Sul</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">PGS</td>
                <td className="px-4 py-2.5 text-texto-2">Pesquisa sobre Gênero e Diversidade (código de identificação interna do projeto)</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">NEPGS</td>
                <td className="px-4 py-2.5 text-texto-2">Núcleo de Estudos e Pesquisas em Gênero e Sexualidade dos campi do IFRS</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">NEABI</td>
                <td className="px-4 py-2.5 text-texto-2">Núcleo de Estudos Afro-Brasileiros e Indígenas</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">NAAF</td>
                <td className="px-4 py-2.5 text-texto-2">Núcleo de Apoio a Ações Afirmativas</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">Assessorias da Reitoria</td>
                <td className="px-4 py-2.5 text-texto-2">Órgãos de assessoramento especializado da Reitoria do IFRS avaliados na pesquisa: Assessoria de Ações Afirmativas, Inclusivas e Diversidade; Assessoria de Gênero e Sexualidade; e Assessoria de Relações Étnico-raciais</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">TAE</td>
                <td className="px-4 py-2.5 text-texto-2">Servidor/a Técnico-Administrativo em Educação da Carreira dos Cargos Técnico-Administrativos (PCCTAE)</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">PGD</td>
                <td className="px-4 py-2.5 text-texto-2">Programa de Gestão e Desempenho (modalidade de teletrabalho e entrega por resultados)</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">CD / FG / FCC / FUC</td>
                <td className="px-4 py-2.5 text-texto-2">Cargos de Direção (CD), Funções Gratificadas (FG) e Funções Comissionadas de Coordenação de Curso (FCC/FUC) no serviço público federal</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">STEM</td>
                <td className="px-4 py-2.5 text-texto-2">Áreas de Ciência, Tecnologia, Engenharia e Matemática (Science, Technology, Engineering and Mathematics)</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">Marco Referencial</td>
                <td className="px-4 py-2.5 text-texto-2">Marco Referencial para Igualdade de Gênero em Instituições de Ensino Superior no Brasil</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-2.5 font-bold text-marca">Athena Swan Charter</td>
                <td className="px-4 py-2.5 text-texto-2">Metodologia internacional britânica de autoavaliação e acreditação para avanço da equidade de gênero na academia que inspira o Marco brasileiro</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 12. Contato e créditos */}
      <section id="contato" className="bg-superficie rounded-xl border border-borda p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-marca">
          <Mail className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-texto">12. Expediente, Créditos e Contato Institucional</h2>
        </div>
        <div className="bg-superficie-2 border border-borda rounded-lg p-4 space-y-2 text-xs text-texto-2">
          <p>
            • <strong>Realização:</strong> Assessoria de Gênero e Diversidade do Instituto Federal do Rio Grande do Sul (IFRS), em colaboração técnica com comissões de pesquisa e servidores/as da Reitoria e dos campi.
          </p>
          <p>
            • <strong>Canal Oficial de Dúvidas, Sugestões ou Esclarecimentos Metodológicos:</strong>{' '}
            <a
              href="mailto:acoes.generosexualidade@ifrs.edu.br"
              className="text-marca font-semibold underline hover:text-marca inline-flex items-center gap-1"
            >
              acoes.generosexualidade@ifrs.edu.br
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </section>

      {/* Tabela de Índices Compostos e Fórmulas */}
      <section id="indices-formulas" className="bg-superficie rounded-xl border border-borda shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-marca" />
          <h2 className="text-base sm:text-lg font-bold text-texto">Fórmulas Matemáticas dos Índices Compostos</h2>
        </div>
        <p className="text-xs text-texto-3">
          Especificação formal dos índices normalizados de 0 a 100 gerados nos algoritmos do painel:
        </p>

        <div className="overflow-x-auto rounded-lg border border-borda">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-superficie-2 text-texto font-semibold border-b border-borda">
              <tr>
                <th className="px-4 py-3">Índice Sintético</th>
                <th className="px-4 py-3">Composição e Variáveis</th>
                <th className="px-4 py-3">Fórmula Matemática</th>
                <th className="px-4 py-3">Escala</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda">
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-3 font-bold text-texto">Índice de Convivência Institucional</td>
                <td className="px-4 py-3 text-texto-2">
                  Média das 6 dimensões psicométricas de clima. <strong>Item sobre impacto da maternidade é invertido</strong>: 6 − nota original.
                </td>
                <td className="px-4 py-3 font-mono text-xs text-marca">
                  ((Média − 1) / 4) × 100
                </td>
                <td className="px-4 py-3 font-semibold text-marca">0 a 100</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-3 font-bold text-texto">Índice de Confiança nos Canais</td>
                <td className="px-4 py-3 text-texto-2">
                  Média ponderada entre percepção de eficácia dos canais de acolhimento e garantia de respostas justas.
                </td>
                <td className="px-4 py-3 font-mono text-xs text-marca">
                  Média normalizada das avaliações válidas
                </td>
                <td className="px-4 py-3 font-semibold text-marca">0 a 100</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-3 font-bold text-texto">Índice de Diversidade de Shannon (H')</td>
                <td className="px-4 py-3 text-texto-2">
                  Entropia da distribuição entre grupos, normalizada pelo logaritmo natural do total de categorias (k).
                </td>
                <td className="px-4 py-3 font-mono text-xs text-marca">
                  H' = (−Σ pᵢ·ln(pᵢ)) / ln(k)
                </td>
                <td className="px-4 py-3 font-semibold text-marca">0 a 100</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-3 font-bold text-texto">Ocorrência de Assédios e Violências</td>
                <td className="px-4 py-3 text-texto-2">
                  Proporção de respondentes com pelo menos um relato vivenciado ou presenciado de discriminação/violência por raça/cor e/ou identidade de gênero/orientação sexual.
                </td>
                <td className="px-4 py-3 font-mono text-xs text-marca">
                  (n_relatos / n_respondentes) × 100
                </td>
                <td className="px-4 py-3 font-semibold text-perigo">0 a 100%</td>
              </tr>
              <tr className="hover:bg-realce transition-colors">
                <td className="px-4 py-3 font-bold text-texto">Taxa de Renúncia com Cuidado</td>
                <td className="px-4 py-3 text-texto-2">
                  Proporção de servidores com responsabilidade de cuidado direta (<em>"Sim"</em>) ou compartilhada (<em>"Divido igualmente"</em>) que deixaram de se candidatar a cargos/funções de gestão (<em>"Sim"</em>).
                </td>
                <td className="px-4 py-3 font-mono text-xs text-marca">
                  (n_renuncia_com_cuidado / n_total_com_cuidado) × 100
                </td>
                <td className="px-4 py-3 font-semibold text-perigo">0 a 100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Dicionário de Campos da Base de Dados */}
      <section id="dicionario-campos" className="bg-superficie rounded-xl border border-borda shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-marca shrink-0" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-texto">
                Dicionário de Variáveis (Catálogo Oficial do Banco de Dados)
              </h2>
              <p className="text-xs text-texto-3">
                {campos.length} variáveis catalogadas e disponíveis para filtros e cruzamentos no construtor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-texto-3" />
              <input
                type="text"
                value={buscaVariavel}
                onChange={(e) => setBuscaVariavel(e.target.value)}
                placeholder="Buscar variável..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-superficie-2 border border-borda text-xs text-texto placeholder-texto-3 focus:outline-none focus:border-marca w-44"
              />
            </div>

            <select
              value={grupoFiltro}
              onChange={(e) => setGrupoFiltro(e.target.value)}
              aria-label="Filtrar por grupo de variáveis"
              className="px-2.5 py-1.5 rounded-lg bg-superficie-2 border border-borda text-xs text-texto focus:outline-none focus:border-marca"
            >
              <option value="todos">Todos os grupos ({campos.length})</option>
              {gruposUnicos.map((g) => (
                <option key={g} value={g}>
                  Grupo: {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px] rounded-lg border border-borda">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-superficie-2 text-texto font-semibold border-b border-borda sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5">Nome no Banco (Key)</th>
                <th className="px-3 py-2.5">Rótulo na Interface</th>
                <th className="px-3 py-2.5">Tipo</th>
                <th className="px-3 py-2.5">Grupo</th>
                <th className="px-3 py-2.5">Descrição Metodológica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda font-mono text-xs">
              {camposFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-texto-3 font-sans">
                    Nenhuma variável encontrada com os termos buscados.
                  </td>
                </tr>
              ) : (
                camposFiltrados.map((c) => (
                  <tr key={c.key} className="hover:bg-realce transition-colors">
                    <td className="px-3 py-2 text-marca font-bold">{c.key}</td>
                    <td className="px-3 py-2 font-sans font-medium text-texto">{c.label}</td>
                    <td className="px-3 py-2 font-sans">
                      <span className="bg-realce text-texto-2 border border-borda-forte px-1.5 py-0.5 rounded text-xs">
                        {c.tipo}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-sans text-texto-3 capitalize">{c.grupo}</td>
                    <td className="px-3 py-2 font-sans text-texto-3 max-w-sm">{c.descricao || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
