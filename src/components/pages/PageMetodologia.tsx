/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
  ExternalLink,
  Info,
} from 'lucide-react';

export const PageMetodologia: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Cabeçalho da Página */}
      <div className="border-b border-borda pb-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-marca" />
          <h1 className="text-xl sm:text-2xl font-bold text-texto">
            9. Metodologia e Governança de Dados
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-texto-3 mt-1 leading-relaxed">
          Documentação do Diagnóstico de Gênero e Diversidade do IFRS: objetivos,
          desenho amostral, fontes, regras de leitura e diretrizes éticas.
        </p>
      </div>

      {/* Aviso Prévio Fundamental */}
      <div className="bg-alerta-fundo/40 border border-alerta-borda/60 rounded-xl p-5 text-alerta text-xs sm:text-sm space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-alerta">
          <AlertTriangle className="w-5 h-5 text-alerta shrink-0" />
          <span>Antes de usar os dados</span>
        </div>
        <p className="leading-relaxed text-alerta/90">
          Os resultados apresentados descrevem os <strong>4.857 integrantes da comunidade acadêmica</strong> que
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
          <a href="#fonte-dados" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">5. Fonte & Normalização de Gênero</a>
          <a href="#como-ler" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">6. Leitura dos Indicadores</a>
          <a href="#graficos-paginas" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">7. Guia das Páginas</a>
          <a href="#ordem-leitura" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">8. Roteiro Sugerido</a>
          <a href="#limites-pesquisa" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">9. Limites</a>
          <a href="#privacidade" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">10. Privacidade</a>
          <a href="#siglas" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">11. Siglas & Termos</a>
          <a href="#contato" className="px-2.5 py-1 rounded-md bg-realce hover:bg-realce border border-borda transition-colors">12. Contato</a>
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
          Público destinatário dos dados: comunidade acadêmica, Assessoria de Gênero e Sexualidade, equipes gestoras, comissões de permanência e núcleos de pesquisa.
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
            <span className="font-bold text-alerta block mb-1">Parte Qualitativa (Aba 7 — O que a comunidade contou)</span>
            <p className="text-texto-2">
              Respostas abertas e depoimentos analisados qualitativamente por categoria temática.
              <strong> Os trechos exibidos na aba 7 foram selecionados e revisados para preservar a identidade das pessoas participantes</strong>.
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
              Participações válidas analisadas no painel (4.790 com declaração de identidade de gênero nas 6 categorias oficiais).
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
          A pesquisa contempla estudantes e servidores/as do quadro do IFRS: <strong>discentes</strong> (3.216; 66,2%),
          <strong> docentes efetivos/as</strong> (763; 15,7%), <strong>docentes substitutos/as</strong> (151; 3,1%) e <strong>servidores/as técnico-administrativos em educação — TAEs</strong> (679; 14,0%), além de 17 servidores/as efetivos/as sem cargo declarado e 31 respondentes que optaram por "Prefiro não responder" no vínculo.
          Por não comporem o escopo deste recorte institucional, 21 respostas de trabalhadores/as terceirizados/as não integram os indicadores do painel.
          Em todas as perguntas sensíveis, foi assegurada a opção <strong>"Prefiro não responder"</strong>.
        </p>

        <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-4 pt-1">
          <div className="bg-superficie-2 border border-borda rounded-lg p-4 text-xs space-y-2">
            <h3 className="font-bold text-texto">Protocolo de Aplicação do Formulário</h3>
            <ul className="space-y-1.5 text-texto-2">
              <li>• <strong>Servidores/as:</strong> convites institucionais via e-mail corporativo com link de acesso anônimo ao formulário.</li>
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
          <h2 className="text-base sm:text-lg font-bold text-texto">5. Fonte dos Dados, Tratamento e Normalização de Gênero</h2>
        </div>
        <p className="text-xs sm:text-sm text-texto-2 leading-relaxed">
          Os dados originam-se das respostas ao formulário institucional, tratadas e padronizadas para garantir consistência matemática e comparabilidade entre todas as abas e filtros do painel:
        </p>

        <div className="bg-superficie-2 border border-borda rounded-lg p-4 text-xs space-y-2 text-texto-2">
          <p>
            • <strong>Preservação das respostas originais:</strong> Os registros originais da coleta são preservados sem alterações para fins de auditoria institucional.
          </p>
          <p>
            • <strong>Normalização de Orientação Sexual:</strong> Variantes de grafia e termos equivalentes digitados no campo aberto foram consolidados automaticamente (ex.: <em>Demisexual</em> e <em>Demissexual</em> em <strong>Demissexual</strong>; <em>Bi</em> em <strong>Bissexual</strong>; <em>Panssexual</em> em <strong>Pansexual</strong>).
          </p>
          <p>
            • <strong>Classificação de Áreas STEM dos estudantes:</strong> Os nomes de cursos preenchidos em campo aberto pelos discentes foram agrupados nas 8 Grandes Áreas do Conhecimento do CNPq (Engenharias e Tecnologia, Ciências Exatas e da Terra, Ciências Sociais Aplicadas, Ciências Agrárias, Ciências Humanas, Linguística, Letras e Artes, Ciências Biológicas e Ciências da Saúde). Após revisão contextual por campus e nível de curso, apenas 8 respostas permaneceram sem classificação por serem genéricas ou indeterminadas.
          </p>
        </div>

        {/* Subseção Detalhada: Normalização de Gênero */}
        <div className="bg-superficie-2 border border-marca-borda/50 rounded-lg p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center gap-2 text-marca">
            <Info className="w-4 h-4 shrink-0 text-marca" />
            <h3 className="font-bold text-sm text-texto">
              Normalização e Classificação de Gênero (6 Categorias Oficiais)
            </h3>
          </div>

          <p className="text-xs text-texto-2 leading-relaxed">
            No formulário eletrônico, o item de gênero disponibilizou tanto opções fechadas quanto a possibilidade de digitação livre (campo aberto "Outro / Como você se identifica"). Essa flexibilidade gerou diversas variações textuais na base de dados.
          </p>

          <p className="text-xs text-texto-2 leading-relaxed">
            Para assegurar consistência entre todos os gráficos, indicadores e filtros, o painel adota uma padronização única. Entre os 4.857 respondentes analisados, todas as respostas válidas são classificadas estritamente em <strong>6 categorias oficiais</strong> (total: 4.790; 98,62% da amostra), enquanto respostas sem declaração de gênero ou não classificáveis (total: 67; 1,38%) são desconsideradas nos recortes específicos por gênero:
          </p>

          <div className="overflow-x-auto rounded-lg border border-borda">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-superficie-2 text-texto font-semibold border-b border-borda">
                <tr>
                  <th className="px-3 py-2.5 w-40">Categoria Oficial</th>
                  <th className="px-3 py-2.5 w-28">Respondentes</th>
                  <th className="px-3 py-2.5">Critérios de Classificação</th>
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
                    Consolida as autodeclarações "Mulher (cisgênero)" e respostas livres equivalentes no campo aberto.
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
                    Consolida as autodeclarações "Homem (cisgênero)" e respostas livres equivalentes no campo aberto (como "Homem" e "Masculino").
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
                    Corresponde às respondentes autodeclaradas como "Mulher (transgênero)".
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
                    Consolida as autodeclarações "Homem (transgênero)" e "Transmasculino".
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
                    Corresponde às respondentes autodeclaradas como "Travesti".
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
                    Reúne autodeclarações não-binárias e identidades correlatas, como Não-binário, Agênero, Gênero Fluido, Demigirl, Alexigênero e Pangênero.
                  </td>
                </tr>
                <tr className="bg-superficie-2/60 hover:bg-superficie transition-colors">
                  <td className="px-3 py-2.5 font-bold text-texto-2">
                    Não classificadas nos recortes de gênero
                  </td>
                  <td className="px-3 py-2.5 font-mono text-texto-2 font-semibold">
                    67 (1,4% do total)
                  </td>
                  <td className="px-3 py-2.5 text-xs leading-relaxed">
                    Engloba "Prefiro não responder" (53) e 14 preenchimentos do campo aberto sem relação com identidade de gênero (como declarações de orientação sexual ou respostas não classificáveis). Esses 67 registros permanecem nos indicadores gerais da pesquisa (total: 4.857), mas não entram nos gráficos e filtros por gênero.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-1 text-xs text-texto-3 leading-relaxed">
            * <strong>Nota de rigor estatístico:</strong> Os percentuais com asterisco (*) são calculados sobre o total de <strong>4.790 respostas válidas de gênero</strong>. A mesma regra de classificação é aplicada em todos os gráficos, indicadores e filtros do painel, garantindo que nenhuma visualização apresente contagens divergentes.
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
              Corresponde ao total de respondentes elegíveis para a questão. Perguntas exclusivas de servidores/as ou discentes usam suas bases específicas e não o total de 4.857. Nos gráficos por gênero, o denominador corresponde aos respondentes com gênero válido dentro das 6 categorias oficiais (até 4.790).
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-marca">Cálculo de Percentuais (%)</span>
            <p className="text-texto-2">
              Calculados sobre as respostas válidas da dimensão analisada. Nos gráficos que segmentam por gênero, declarações "Prefiro não responder" no campo de gênero e respostas não classificáveis não são contabilizadas.
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
            <span className="font-bold text-marca">Categorias Oficiais de Gênero</span>
            <p className="text-texto-2">
              Os gráficos de identidade de gênero exibem estritamente as 6 categorias oficiais padronizadas (Mulher, Homem, Mulher Trans, Homem Trans, Travesti e Não-binários), desconsiderando "Prefiro não responder" e respostas não classificáveis nesse recorte.
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-marca">Seletores Padronizados Transversais</span>
            <p className="text-texto-2">
              O painel disponibiliza seletores reutilizáveis em múltiplos gráficos: <strong>Segmento</strong> (Geral, Docente, Técnico TAE, Discentes — com versão restrita a servidores/as na Página 2), <strong>Gênero</strong> (6 categorias oficiais), <strong>Cor / Raça</strong> (6 opções), <strong>PCD</strong> (Sim / Não) e <strong>Idade</strong> (Menor: &lt;18 anos; Maior: ≥18 anos, classificada estritamente com base na autodeclaração de faixa etária).
            </p>
          </div>
          <div className="bg-superficie-2 border border-borda rounded-lg p-3 space-y-1">
            <span className="font-bold text-perigo">Taxa de Renúncia com Cuidado (Carreira)</span>
            <p className="text-texto-2">
              Mede a proporção de servidores/as com encargos de cuidado (responsabilidade principal <em>"Sim"</em> somada à responsabilidade compartilhada <em>"Divido igualmente"</em>) que declararam já ter deixado de se candidatar a cargos ou funções de gestão (<em>"Sim"</em>) devido às demandas de cuidado familiar.
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
          Visão geral do que é apresentado em cada uma das 12 abas do painel institucional:
        </p>

        <div className="space-y-3 text-xs">
          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Conheça a Pesquisa</h3>
            <p className="text-texto-2 leading-relaxed">
              Apresentação geral do levantamento, objetivos, período de coleta e vínculo com o Marco Referencial para a Igualdade de Gênero em Instituições de Ensino Superior no Brasil.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">O IFRS em Números</h3>
            <p className="text-texto-2 leading-relaxed">
              Panorama institucional com dados oficiais do Sistema Integrado de Gestão (SIG) do IFRS sobre discentes e servidores/as, oferecendo contexto populacional complementar aos resultados da pesquisa.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">Visão Geral da Pesquisa</h3>
            <p className="text-texto-2 leading-relaxed">
              Painel executivo com os principais indicadores institucionais (total de 4.857 respondentes nos 17 campi e Reitoria, composição por segmento, ocorrência de assédios e violências, índice de convivência e clima, conhecimento e efetividade dos canais de denúncia, desencorajamento acadêmico e responsabilidade de cuidado) e distribuição de respondentes por campus e vínculo, com filtros de Gênero e Idade.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">1. Perfil e Representatividade</h3>
            <p className="text-texto-2 leading-relaxed">
              Mapeamento sociodemográfico dos/as respondentes — Identidade de Gênero (nas 6 categorias oficiais), Autodeclaração Étnico-Racial, Orientação Sexual, Faixa Etária e Pessoas com Deficiência (PCD) — com seletores por Segmento, Gênero e Idade.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">2. Carreira e Gestão</h3>
            <p className="text-texto-2 leading-relaxed">
              Foco exclusivo em servidores/as docentes e técnicos-administrativos (TAEs). Apresenta indicadores de liderança feminina e negra, composição por cargo e gênero, tipologia de funções de gestão (CD, FG, FCC), avaliação da progressão por mérito, equidade no acesso a oportunidades e o cruzamento entre responsabilidade de cuidado e renúncia à candidatura a cargos de gestão (Taxa de Renúncia com Cuidado).
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">3. Clima e Violências</h3>
            <p className="text-texto-2 leading-relaxed">
              Diagnóstico do clima institucional (diagrama de percepção das 6 dimensões de convivência), índice de convivência por campus, relatos de discriminação por cor/raça e por gênero/orientação sexual, matriz interseccional de discriminação, desencorajamento discente e funil de conhecimento, efetividade e percepção de justiça dos canais de denúncia.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">4. Núcleos e Políticas</h3>
            <p className="text-texto-2 leading-relaxed">
              Avaliação da atuação dos núcleos de ações afirmativas (NAAF, NEABI, NEPGS) e das Assessorias da Reitoria (Ações Afirmativas, Inclusivas e Diversidade; Gênero e Sexualidade; Relações Étnico-raciais), média de qualidade por campus, índice de desconhecimento dos núcleos e percepção sobre a eficácia das campanhas e ações formativas.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">5. Cuidado e Parentalidade</h3>
            <p className="text-texto-2 leading-relaxed">
              Análise da responsabilidade principal de cuidado por identidade de gênero (exibindo as 5 opções de resposta do questionário), percepção sobre a suficiência das licenças maternidade e paternidade e do apoio a estudantes com filhos/as, percepção sobre o impacto da maternidade na carreira e tabela de estudantes com responsabilidade de cuidado por campus, nível de curso e faixa etária.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">6. Áreas e STEM</h3>
            <p className="text-texto-2 leading-relaxed">
              Análise da participação discente por Grande Área do Conhecimento (CNPq), indicadores comparativos de desencorajamento acadêmico em cursos STEM versus Não-STEM e detalhamento do desencorajamento entre os estudantes das áreas de Exatas e Tecnologia, com filtros demográficos.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">7. O que a comunidade contou</h3>
            <p className="text-texto-2 leading-relaxed">
              Síntese qualitativa das respostas abertas do formulário, organizada por temas recorrentes, com trechos selecionados e revisados de falas de estudantes e servidores/as para preservar o anonimato das pessoas participantes.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">8. Construtor Dinâmico</h3>
            <p className="text-texto-2 leading-relaxed">
              Ferramenta de exploração interativa que permite cruzar variáveis compatíveis da pesquisa, aplicar filtros e visualizar os resultados em barras empilhadas, barras agrupadas ou rosca, em contagem absoluta ou percentuais, com opção de exportar os dados em CSV e salvar visões no navegador.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-marca text-sm">9. Metodologia e Governança</h3>
            <p className="text-texto-2 leading-relaxed">
              Documentação permanente da pesquisa com objetivos, marco referencial, procedimentos éticos, critérios de tratamento de dados, limites metodológicos e glossário de siglas institucionais.
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
              <span className="font-bold text-texto mt-1 block">Apresentação e Visão Geral</span>
            </div>
            <p className="text-texto-3 mt-2 text-xs">
              Conheça o contexto institucional e tenha uma fotografia macro dos principais indicadores.
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
              Explore carreira, violências, núcleos, parentalidade ou STEM conforme o foco.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-marca font-bold text-sm block">4º Passo</span>
              <span className="font-bold text-texto mt-1 block">Relatos e Construtor</span>
            </div>
            <p className="text-texto-3 mt-2 text-xs">
              Leia os relatos qualitativos na aba 7 e crie cruzamentos customizados no Construtor.
            </p>
          </div>

          <div className="bg-superficie-2 border border-borda rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-marca font-bold text-sm block">5º Passo</span>
              <span className="font-bold text-texto mt-1 block">Metodologia</span>
            </div>
            <p className="text-texto-3 mt-2 text-xs">
              Consulte definições, critérios de tratamento e limites para ancorar conclusões.
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
            <span className="font-bold text-alerta block">• Desafios Éticos e Operacionais na Coleta com Estudantes Menores de Idade:</span>
            <p className="text-texto-2">
              Diferentemente das universidades tradicionais, o maior público de um Instituto Federal é composto por estudantes menores de 18 anos — uma população originalmente não prevista pelo Marco Referencial voltado ao ensino superior que norteou a metodologia desta pesquisa. Em consonância com o princípio da proteção integral previsto no <strong>Estatuto da Criança e do Adolescente (ECA — Lei nº 8.069/1990)</strong> e conforme determinação do <strong>Comitê de Ética em Pesquisa do IFRS (CEP/IFRS)</strong>, a participação de menores de idade exigiu a entrega prévia de Termo de Consentimento Livre e Esclarecido (TCLE) impresso e assinado pelos responsáveis legais, além do assentimento do próprio estudante. Essa exigência, embora indispensável para a garantia de direitos e proteção ética, representou um desafio logístico relevante e impactou o ritmo e o alcance da adesão desse segmento.
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
            • <strong>Curadoria e Anonimização de Relatos Qualitativos:</strong> As respostas abertas passam por análise qualitativa prévia; os excertos exibidos na aba "7. O que a comunidade contou" são selecionados e revisados para remover qualquer dado que possa identificar pessoas ou situações específicas.
          </p>
          <p>
            • <strong>Proteção contra Reidentificação em Microamostras:</strong> Cruzamentos com número diminuto de respondentes recebem alerta de amostra pequena (n &lt; 10), orientando cautela na interpretação e evitando conclusões individualizadas.
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
            • <strong>Realização:</strong> Assessoria de Gênero e Sexualidade do Instituto Federal do Rio Grande do Sul (IFRS), em colaboração técnica com comissões de pesquisa e servidores/as da Reitoria e dos campi.
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
    </div>
  );
};
