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
      <div className="border-b border-[#1f2d4e] pb-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-teal-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
            8. Metodologia, Dicionário e Governança de Dados
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
          Documentação completa do Diagnóstico de Gênero e Diversidade do IFRS: objetivos,
          desenho amostral, fontes, regras de leitura, dicionário oficial de variáveis e diretrizes éticas.
        </p>
      </div>

      {/* Aviso Prévio Fundamental */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-5 text-amber-200 text-xs sm:text-sm space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Antes de usar os dados</span>
        </div>
        <p className="leading-relaxed text-amber-200/90">
          Os resultados apresentados descrevem os <strong>4.857 integrantes da comunidade acadêmica analisados</strong> (de um total bruto de 4.878 submissões, após a exclusão metodológica de 21 registros de trabalhadores terceirizados) que
          responderam voluntariamente ao formulário. Eles <strong>não constituem estimativas populacionais probabilísticas</strong> do
          IFRS. Recomendamos a leitura atenta da seção{' '}
          <a href="#limites-pesquisa" className="underline font-semibold hover:text-amber-100">
            9. Limites da pesquisa
          </a>{' '}
          antes de extrair conclusões inferenciais.
        </p>
      </div>

      {/* Sumário Rápido de Seções */}
      <div className="bg-[#101930] rounded-xl border border-[#223154] p-4 text-xs">
        <span className="font-semibold text-slate-200 mb-2 block text-[11px] uppercase tracking-wider text-teal-400">
          Navegação Rápida do Documento
        </span>
        <div className="flex flex-wrap gap-2 text-slate-300">
          <a href="#objetivo" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">1. Objetivo</a>
          <a href="#visao-geral" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">2. Visão Geral</a>
          <a href="#periodo" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">3. Coleta</a>
          <a href="#quem-respondeu" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">4. Respondentes & Ética</a>
          <a href="#fonte-dados" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">5. Fonte & Regra de Ouro de Gênero</a>
          <a href="#como-ler" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">6. Leitura dos Indicadores</a>
          <a href="#graficos-paginas" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">7. Guia das Páginas</a>
          <a href="#ordem-leitura" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">8. Roteiro Sugerido</a>
          <a href="#limites-pesquisa" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">9. Limites</a>
          <a href="#privacidade" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">10. Privacidade</a>
          <a href="#siglas" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">11. Siglas & Termos</a>
          <a href="#contato" className="px-2.5 py-1 rounded-md bg-[#162342] hover:bg-[#1f315c] border border-[#263761] transition-colors">12. Contato</a>
          <a href="#indices-formulas" className="px-2.5 py-1 rounded-md bg-teal-950/60 text-teal-300 hover:bg-teal-900/80 border border-teal-700/60 transition-colors">Fórmulas dos Índices</a>
          <a href="#dicionario-campos" className="px-2.5 py-1 rounded-md bg-teal-950/60 text-teal-300 hover:bg-teal-900/80 border border-teal-700/60 transition-colors">Dicionário de Variáveis</a>
        </div>
      </div>

      {/* 1. Objetivo */}
      <section id="objetivo" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-teal-400">
          <Target className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">1. Objetivo Institucional</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          O diagnóstico tem como finalidade primordial <strong>mapear e analisar indicadores institucionais de gênero e diversidade</strong> no
          IFRS, abrangendo todos os 17 campi e a Reitoria, para fornecer subsídios empíricos à formulação de políticas institucionais voltadas à:
        </p>
        <ul className="list-disc list-inside text-xs sm:text-sm text-slate-300 space-y-1.5 pl-2">
          <li>Equidade de gênero e justiça de oportunidades em todas as esferas acadêmicas e funcionais;</li>
          <li>Permanência discente e apoio institucional a estudantes e servidores com responsabilidades de cuidado familiar;</li>
          <li>Respeito à diversidade e prevenção estrutural a violências, assédios moral e sexual e discriminações;</li>
          <li>Avaliação do clima institucional, da confiança nos canais de ouvidoria/denúncia e do conhecimento sobre núcleos de base (NEPGS, NEABI, NAAF) e campanhas preventivas.</li>
        </ul>
        <p className="text-xs text-slate-400">
          Público destinatário dos dados: comunidade acadêmica, Assessoria de Gênero e Diversidade, equipes gestoras, comissões de permanência e núcleos de pesquisa.
        </p>
      </section>

      {/* 2. Visão geral do projeto */}
      <section id="visao-geral" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-teal-400">
          <FileText className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">2. Visão Geral do Projeto e Marco Referencial</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          O IFRS aderiu ao <strong>Marco Referencial para Igualdade de Gênero em Instituições de Ensino Superior no Brasil</strong>,
          inspirado na consagrada metodologia britânica <em>Athena Swan Charter</em>. O Marco estrutura a avaliação da equidade
          em dimensões fundamentais: visão geral da instituição, suporte às trajetórias de carreira, cultura institucional, inclusão e pertencimento.
          Este diagnóstico constitui a etapa indispensável de levantamento de evidências empíricas que embasa esse processo.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 text-xs">
            <span className="font-bold text-teal-300 block mb-1">Parte Quantitativa (Neste Painel)</span>
            <p className="text-slate-300">
              Respostas fechadas (múltipla escolha, escalas Likert de concordância e frequências), tratadas
              em indicadores estatísticos agregados, mapas de calor e gráficos analíticos.
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 text-xs">
            <span className="font-bold text-amber-300 block mb-1">Parte Qualitativa (Relatório Narrativo)</span>
            <p className="text-slate-300">
              Respostas abertas e depoimentos textuais livres, analisados à parte.
              <strong> Nenhum texto aberto é exibido no painel ou exposto para resguardar a privacidade</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Período de coleta */}
      <section id="periodo" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-teal-400">
          <Calendar className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">3. Período de Coleta e Volume Amostral</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-4">
            <span className="text-xs text-slate-400 block">Janela Temporal de Respostas:</span>
            <span className="text-base font-bold text-teal-300 mt-1 block">
              07/10/2025 a 28/07/2026
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Registro da primeira à última submissão no formulário eletrônico.
            </span>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-4">
            <span className="text-xs text-slate-400 block">Total de Participações Analisadas no Painel:</span>
            <span className="text-xl font-extrabold text-slate-100 mt-1 block">
              4.857 respondentes
            </span>
            <span className="text-[11px] text-teal-300 mt-0.5 block">
              Extraídos de 4.878 registros brutos após a exclusão de 21 registros de terceirizados (4.790 com gênero válido).
            </span>
          </div>
        </div>
      </section>

      {/* 4. Quem respondeu e aspectos éticos */}
      <section id="quem-respondeu" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-teal-400">
          <Users className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">4. Perfil dos Respondentes e Rigor Ético</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          O painel analisa os vínculos institucionais de carreira e estudantis do IFRS: <strong>discentes</strong> (3.216; 66,2%),
          <strong> docentes efetivos</strong> (763; 15,7%), <strong>docentes substitutos</strong> (151; 3,1%) e <strong>servidores técnico-administrativos em educação — TAEs</strong> (679; 14,0%), além de 17 servidores efetivos sem cargo específico declarado e 31 respondentes que optaram por "Prefiro não responder" no vínculo.
          <strong> Trabalhadores terceirizados (21 registros na base bruta) foram integralmente removidos de todas as análises, gráficos, indicadores e filtros do painel</strong> por diretriz metodológica institucional.
          Em todas as perguntas sensíveis, foi assegurada a opção <strong>"Prefiro não responder"</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-4 text-xs space-y-2">
            <h3 className="font-bold text-slate-200">Protocolo de Aplicação do Formulário</h3>
            <ul className="space-y-1.5 text-slate-300">
              <li>• <strong>Servidores:</strong> convites institucionais via e-mail corporativo com hiperlink individualizado anônimo.</li>
              <li>• <strong>Discentes:</strong> articulação de coordenações e docentes com sessões em laboratórios de informática, assegurando sigilo individual diante de pares.</li>
              <li>• <strong>Menores de 18 anos:</strong> Termo de Consentimento Livre e Esclarecido (TCLE) prévio dos responsáveis legais e Termo de Assentimento do estudante, com registros físicos arquivados dissociados do banco digital.</li>
            </ul>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-4 text-xs space-y-2">
            <h3 className="font-bold text-slate-200">Conformidade e Diretrizes Éticas</h3>
            <p className="text-slate-300 leading-relaxed">
              A pesquisa segue estritamente as <strong>Resoluções CNS nº 466/2012 e nº 510/2016</strong>. A participação
              é estritamente voluntária e anônima. Não há rastreamento de IP, e-mail, login corporativo ou qualquer metadado
              identificador. As equipes locais de assistência estudantil e apoio psicossocial foram orientadas preventivamente para prestar acolhimento caso solicitado.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Fonte dos dados e normalizações */}
      <section id="fonte-dados" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-teal-400">
          <Database className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">5. Fonte dos Dados, Tratamento e Regra de Ouro de Normalização de Gênero</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Os dados brutos originam-se da extração tabular da pesquisa institucional, saneados e estruturados em banco relacional PostgreSQL (Supabase).
          Os cálculos, taxas e agregações ocorrem dinamicamente no servidor através de consultas determinísticas com parametrização estrita, garantindo reprodutibilidade matemática absoluta:
        </p>

        <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-4 text-xs space-y-2 text-slate-300">
          <p>
            • <strong>Preservação das respostas originais:</strong> Nenhuma informação foi alterada ou suprimida no banco de dados bruto (4.878 registros originais mantêm o teor exato submetido pelos participantes para fins de auditoria).
          </p>
          <p>
            • <strong>Exclusão Global de Trabalhadores Terceirizados (<code className="text-teal-300 font-mono">SQL_FILTRO_SEM_TERCEIRIZADOS</code>):</strong> Os 21 registros de profissionais terceirizados (20 com <code className="text-teal-300 font-mono">vinculo = 'Terceirizado'</code> e 1 com <code className="text-teal-300 font-mono">cargo = 'Terceirizado'</code>) são excluídos globalmente de todas as análises, KPIs, gráficos e filtros do painel, resultando no universo analítico oficial de <strong>4.857 respondentes</strong>.
          </p>
          <p>
            • <strong>Normalização de Orientação Sexual (<code className="text-teal-300 font-mono">SQL_ORIENTACAO_NORMALIZADA</code>):</strong> Variantes com grafia divergente ou autodeclarações equivalentes são consolidadas automaticamente (ex.: <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Demisexual</code> + <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Demissexual</code> → <strong>Demissexual</strong>; <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Hétero</code> / <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Normal</code> → <strong>Heterossexual</strong>; <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Panssexual</code> / <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Panromantica</code> → <strong>Pansexual</strong>; <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Bissexual</code> / <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Bi</code> → <strong>Bissexual</strong>).
          </p>
          <p>
            • <strong>Classificação de Áreas STEM dos estudantes:</strong> Devido ao preenchimento textual livre do nome do curso pelo discente, um algoritmo determinístico de correspondência de termos agrupou as menções em Grandes Áreas do Conhecimento (Engenharias e Tecnologia, Ciências Exatas e da Terra, Ciências Agrárias, Ciências Biológicas, Ciências da Saúde, Ciências Humanas, Ciências Sociais Aplicadas, Linguística, Letras e Artes). Menções ambíguas foram categorizadas como "Não classificada".
          </p>
        </div>

        {/* Subseção Detalhada: Normalização de Gênero (Regra de Ouro Oficial) */}
        <div className="bg-[#0e162b] border border-teal-900/50 rounded-lg p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center gap-2 text-teal-300">
            <Info className="w-4 h-4 shrink-0 text-teal-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Regra de Ouro Oficial: Normalização e Classificação de Gênero (6 Categorias Estritas)
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            No formulário eletrônico, o item de gênero disponibilizou tanto opções fechadas quanto a possibilidade de digitação livre (campo aberto "Outro / Como você se identifica"). Essa flexibilidade gerou <strong>53 variações textuais distintas</strong> na base de dados.
          </p>

          <p className="text-xs text-slate-300 leading-relaxed">
            Para assegurar consistência absoluta entre todos os gráficos, indicadores, filtros globais e o construtor dinâmico, o painel adota uma <strong>Regra de Ouro única parametrizada no servidor</strong> (<code className="text-teal-300 font-mono">SQL_GENERO_NORMALIZADO</code>). Entre os 4.857 respondentes analisados (sem terceirizados), todas as respostas válidas são classificadas estritamente em <strong>6 categorias oficiais</strong> (<code className="text-teal-300 font-mono">n = 4.790</code>; 98,62% da amostra), enquanto respostas sem declaração de gênero ou invalidadas (<code className="text-slate-300 font-mono">n = 67</code>; 1,38%) são desconsideradas dos gráficos e filtros de gênero:
          </p>

          <div className="overflow-x-auto rounded-lg border border-[#223154]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#080d1a] text-slate-200 font-semibold border-b border-[#223154]">
                <tr>
                  <th className="px-3 py-2.5 w-40">Categoria Oficial</th>
                  <th className="px-3 py-2.5 w-28">Respondentes</th>
                  <th className="px-3 py-2.5">Critérios de Classificação e Autodeclarações Mapeadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2d4e] text-slate-300">
                <tr className="hover:bg-[#141f3d] transition-colors">
                  <td className="px-3 py-2.5 font-bold text-teal-300">
                    Mulher
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-200 font-semibold">
                    2.650 (55,3%*)
                  </td>
                  <td className="px-3 py-2.5 text-[11px] leading-relaxed">
                    Consolida <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Mulher (cisgênero)</code> (2.639), respostas diretas <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Mulher</code> (6), variações com pontuação/espaçamento (<code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Mulher </code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Mulher, </code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Mulher, hétero.</code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Mulher negra, mas não sei porque tantos rótulos</code>) e <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">FEMINIMO</code> (1).
                  </td>
                </tr>
                <tr className="hover:bg-[#141f3d] transition-colors">
                  <td className="px-3 py-2.5 font-bold text-teal-300">
                    Homem
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-200 font-semibold">
                    1.989 (41,5%*)
                  </td>
                  <td className="px-3 py-2.5 text-[11px] leading-relaxed">
                    Consolida <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Homem (cisgênero)</code> (1.969), <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Homem</code> / <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">homem</code> (4), variantes afirmativas livres (<code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Apenas HOMEM</code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Homem normal</code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Homem biológico</code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Homem hétero</code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Homem bagual</code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Homem Macho alpha</code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">O biologicamente correto, homem cisgênero</code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Homem, até onde eu sabia...</code>) e autodeclarações de sexo masculino (<code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Masculino </code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Sexo masculino </code>, <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Possuo cromossomos XY (masculino)...</code>).
                  </td>
                </tr>
                <tr className="hover:bg-[#141f3d] transition-colors">
                  <td className="px-3 py-2.5 font-bold text-teal-300">
                    Mulher Trans
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-200 font-semibold">
                    25 (0,5%*)
                  </td>
                  <td className="px-3 py-2.5 text-[11px] leading-relaxed">
                    Corresponde integralmente às respondentes autodeclaradas como <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Mulher (transgênero)</code> (25).
                  </td>
                </tr>
                <tr className="hover:bg-[#141f3d] transition-colors">
                  <td className="px-3 py-2.5 font-bold text-teal-300">
                    Homem Trans
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-200 font-semibold">
                    40 (0,8%*)
                  </td>
                  <td className="px-3 py-2.5 text-[11px] leading-relaxed">
                    Consolida <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Homem (transgênero)</code> (39) e <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Transmasculino</code> (1).
                  </td>
                </tr>
                <tr className="hover:bg-[#141f3d] transition-colors">
                  <td className="px-3 py-2.5 font-bold text-teal-300">
                    Travesti
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-200 font-semibold">
                    6 (0,1%*)
                  </td>
                  <td className="px-3 py-2.5 text-[11px] leading-relaxed">
                    Corresponde integralmente às respondentes autodeclaradas como <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Travesti</code> (6).
                  </td>
                </tr>
                <tr className="hover:bg-[#141f3d] transition-colors">
                  <td className="px-3 py-2.5 font-bold text-teal-300">
                    Não-binárias
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-200 font-semibold">
                    80 (1,7%*)
                  </td>
                  <td className="px-3 py-2.5 text-[11px] leading-relaxed">
                    Reúne todas as autodeclarações não-binárias e dissidentes: <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Não-binário</code> (71), <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Agênero</code> (2), variações de <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Gênero Fluido / fluído / fluido</code> (4), <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Demigirl</code> (1), <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Alexigênero</code> (1) e <code className="text-teal-200 bg-teal-950/60 px-1 py-0.5 rounded">Pangênero</code> (1).
                  </td>
                </tr>
                <tr className="bg-slate-900/60 hover:bg-[#141f3d] transition-colors">
                  <td className="px-3 py-2.5 font-bold text-rose-300">
                    Desconsideradas nos Gráficos de Gênero (NULL)
                  </td>
                  <td className="px-3 py-2.5 font-mono text-rose-200 font-semibold">
                    67 (1,4% do total)
                  </td>
                  <td className="px-3 py-2.5 text-[11px] leading-relaxed">
                    Engloba <code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">Prefiro não responder</code> (53) e <strong>14 respostas invalidadas</strong> por conterem orientação sexual no campo de gênero (<code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">Hetero</code>, <code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">Bissexual</code>, <code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">gay</code>, <code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">sapatão</code>), protesto/recusa (<code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">Acho o genero totalmente desnecessário</code>, <code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">Não tenho gênero...</code>) ou respostas satíricas/"zueras" (<code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">Geladeira Frost Free</code>, <code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">Me identifico como um jegue</code>, <code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">Patrola</code>, <code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">tio paulo</code>, <code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">Jedi</code>, <code className="text-slate-300 bg-[#162342] px-1 py-0.5 rounded">sem gênero com pênis</code>). Estes 67 registros permanecem nos indicadores gerais da pesquisa (N = 4.857), mas são filtrados (<code className="text-rose-300 font-mono">IS NOT NULL</code>) em todos os gráficos e recortes por gênero.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-1 text-[11px] text-slate-400 leading-relaxed">
            * <strong>Nota de rigor estatístico:</strong> Os percentuais com asterisco (*) são calculados sobre o total de <strong>4.790 respostas válidas de gênero</strong> (após exclusão de terceirizados). O parâmetro centralizado <code className="text-teal-300 font-mono">SQL_GENERO_NORMALIZADO</code> é reutilizado em todas as consultas SQL do painel, garantindo que nenhum gráfico classifique gêneros de forma divergente.
          </div>
        </div>
      </section>

      {/* 6. Como ler os números */}
      <section id="como-ler" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-teal-400">
          <HelpCircle className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">6. Como Ler os Números e Indicadores</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 space-y-1">
            <span className="font-bold text-teal-300">Base Analisada (Denominador)</span>
            <p className="text-slate-300">
              Corresponde ao total de respondentes elegíveis para a questão (sem trabalhadores terceirizados). Perguntas exclusivas de servidores ou discentes usam suas bases específicas e não o total de 4.857. Nos gráficos por gênero, o denominador corresponde aos respondentes com gênero válido dentro das 6 categorias oficiais (até 4.790).
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 space-y-1">
            <span className="font-bold text-teal-300">Cálculo de Percentuais (%)</span>
            <p className="text-slate-300">
              Calculados sobre as respostas válidas da dimensão analisada. Nos gráficos que segmentam por gênero, declarações "Prefiro não responder" no campo de gênero e respostas invalidadas não são contabilizadas.
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 space-y-1">
            <span className="font-bold text-teal-300">Média em Escala Likert (1 a 5)</span>
            <p className="text-slate-300">
              Opções como "Não conheço" ou "Não se aplica" não possuem peso numérico e são expurgadas do cálculo da média, figurando em contagens próprias ao lado.
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 space-y-1">
            <span className="font-bold text-teal-300">Aglutinação Likert Simplificada</span>
            <p className="text-slate-300">
              Para maior clareza de leitura, os gráficos de mérito e acesso aglutinam: <strong>Concordo</strong> (notas 4 e 5: Concordo totalmente + Concordo), <strong>Neutro</strong> (nota 3) e <strong>Discordo</strong> (notas 1 e 2: Discordo totalmente + Discordo).
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 space-y-1">
            <span className="font-bold text-teal-300">Índices Normalizados (0% a 100%)</span>
            <p className="text-slate-300">
              Calculados linearmente a partir das médias de 1 a 5 pela fórmula <code>((Média − 1) / 4) × 100</code>. Quanto mais próximo de 100%, mais positiva a percepção institucional.
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 space-y-1">
            <span className="font-bold text-teal-300">Item Invertido no Clima</span>
            <p className="text-slate-300">
              O item <em>"A maternidade impacta negativamente a trajetória"</em> tem sentido reverso: concordar aponta para fragilidade. Para compor o índice geral, é invertido matematicamente (6 − nota).
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 space-y-1">
            <span className="font-bold text-teal-300">Ocorrência de Assédios e Violências</span>
            <p className="text-slate-300">
              Percentual que assinalou "Sim" para vivência ou presenciamento de violência ou discriminação (por raça/cor e/ou por identidade de gênero / orientação sexual).
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 space-y-1">
            <span className="font-bold text-teal-300">Diversidade de Shannon e Categorias Oficiais</span>
            <p className="text-slate-300">
              Shannon avalia o equilíbrio proporcional entre grupos. Na identidade de gênero, os gráficos exibem estritamente as 6 categorias oficiais padronizadas pela Regra de Ouro.
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 space-y-1">
            <span className="font-bold text-rose-300">Taxa de Renúncia com Cuidado (Carreira)</span>
            <p className="text-slate-300">
              Mede a proporção de servidores com encargos de cuidado (responsabilidade principal <em>"Sim"</em> somada à responsabilidade compartilhada <em>"Divido igualmente"</em>) que declararam já ter deixado de se candidatar a cargos ou funções de gestão (<em>"Sim"</em>) devido às demandas de cuidado familiar.
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 space-y-1">
            <span className="font-bold text-amber-300">Amostra Pequena (n &lt; 10)</span>
            <p className="text-slate-300">
              Células ou categorias com menos de 10 respondentes exigem cautela estatística na leitura para evitar generalizações indevidas.
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 space-y-1">
            <span className="font-bold text-slate-300">Símbolo "—"</span>
            <p className="text-slate-300">
              Indica ausência absoluta de respondentes para aquela combinação específica de cruzamento na amostra.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Gráficos e páginas do painel */}
      <section id="graficos-paginas" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-teal-400">
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">7. Estrutura e Gráficos das Páginas do Painel</h2>
        </div>
        <p className="text-xs text-slate-400">
          Visão detalhada do que é apresentado em cada uma das 9 abas do painel institucional:
        </p>

        <div className="space-y-3 text-xs">
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-teal-300 text-sm">Página 0 — Visão Geral</h3>
            <p className="text-slate-300 leading-relaxed">
              Painel executivo com os principais indicadores institucionais: Total de Respondentes (4.857 em 18 unidades: 17 campi + Reitoria, sem terceirizados), Composição da Amostra (Discentes vs. Servidores), Ocorrência de Assédios e Violências, Índice de Convivência e Clima Institucional (em %), Conhece Canais de Denúncia (com detalhamento explícito de "Sim, conheço" + "Conheço em parte" vs. "Não conheço" + "Não sei"), Efetividade dos Canais de Denúncia (com detalhamento de "Muito efetivos" + "Parcialmente efetivos" vs. "Pouco efetivos" + "Não são efetivos"), Desencorajamento na Participação Acadêmica por Gênero, Raça, Orientação Sexual ou Outras Características, e Responsabilidade de Cuidado (somando cuidadores principais e compartilhados com detalhamento explícito). Inclui gráfico de respondentes por unidade separando Discentes, Docentes Efetivos, Técnicos TAEs e Docentes Substitutos.
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-teal-300 text-sm">Página 1 — Perfil Demográfico e Representatividade</h3>
            <p className="text-slate-300 leading-relaxed">
              Mapeamento sociodemográfico com seletores individuais por categoria (<strong>Geral, Docente, Técnico TAE e Discente</strong>) em todos os gráficos: Identidade de Gênero Detalhada (nas 6 categorias oficiais: Mulher, Homem, Mulher Trans, Homem Trans, Travesti e Não-binárias), Cor ou Raça (Autodeclaração IBGE), Pirâmide / Distribuição Etária, Pessoas com Deficiência (PCD) e Orientação Sexual (com termos normalizados). Inclui cartões de Diversidade de Shannon por campus/vínculo e mapa de calor Campus × Vínculo.
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-teal-300 text-sm">Página 2 — Carreira, Progressão e Equidade Institucional (Servidores)</h3>
            <p className="text-slate-300 leading-relaxed">
              Foco exclusivo em servidores docentes e técnicos (TAEs). Apresenta KPIs de liderança feminina e negra, <strong>Composição de Servidores por Cargo e Gênero</strong> e <strong>Tipologia de Função de Gestão (CD, FG, FCC)</strong> estruturados pelas 6 categorias oficiais de gênero. Traz o comparativo dos 3 universos e detalhado pelas 6 categorias oficiais de gênero com termos aglutinados de concordância (Concordo totalmente + Concordo, Neutro, Discordo totalmente + Discordo) para <strong>Avaliação da Progressão por Mérito</strong> e para <strong>Equidade no Acesso a Oportunidades e Bolsas</strong>. Apresenta o bloco unificado de <strong>Cruzamento: Cuidado × Deixou de se Candidatar à Gestão</strong> (ordenado da maior para a menor barra, com o indicador dinâmico de <strong>Taxa de Renúncia com Cuidado</strong> e tabela detalhada sincrônica por segmento e gênero).
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-teal-300 text-sm">Página 3 — Ambiente, Segurança e Violências</h3>
            <p className="text-slate-300 leading-relaxed">
              Diagnóstico do clima institucional: diagrama divergente de concordância nos 6 itens de convivência (com destaque para o item invertido sobre maternidade), índice de clima por campus comparado à média geral, taxas específicas de violência e discriminação por gênero (nas 6 categorias oficiais), cor/raça e orientação sexual, tabela 2D de vitimização cruzada, desencorajamento de discentes por vulnerabilidade e funil de denúncia em 3 etapas consecutivas (conhecimento, efetividade e justiça das respostas).
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-teal-300 text-sm">Página 4 — Núcleos, Assessorias e Políticas</h3>
            <p className="text-slate-300 leading-relaxed">
              Avaliação de atuação dos núcleos de ação afirmativa e diversidade (NEPGS, NEABI, NAAF): gráfico divergente da qualidade percebida (com faixa destacada de desconhecimento), mapa de calor da média de avaliação campus × núcleo, ranking de desconhecimento dos núcleos por unidade e eficácia percebida das campanhas de sensibilização e capacitações institucionais.
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-teal-300 text-sm">Página 5 — Cuidado, Parentalidade e Permanência</h3>
            <p className="text-slate-300 leading-relaxed">
              Investigação da sobrecarga reprodutiva e parental: distribuição de responsabilidades de cuidado (cuidado direto, dividido, sem cuidado) pelas 6 categorias oficiais de gênero, avaliação de políticas de apoio a pais e mães estudantes, percepção sobre licenças e flexibilização, divergente do impacto da maternidade na carreira acadêmica e contagem de estudantes com dependentes sob seus cuidados por campus e nível de formação.
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-teal-300 text-sm">Página 6 — Áreas de Conhecimento e STEM</h3>
            <p className="text-slate-300 leading-relaxed">
              Distribuição discente nas áreas de Ciência, Tecnologia, Engenharia e Matemática: proporção feminina por grande área do conhecimento, diversidade racial em cursos de tecnologia e engenharias, taxas de desencorajamento acadêmico comparando áreas STEM vs Não-STEM e tabela de cobertura do algoritmo de mapeamento de cursos.
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-teal-300 text-sm">Página 7 — Construtor Dinâmico de Gráficos</h3>
            <p className="text-slate-300 leading-relaxed">
              Módulo de exploração aberta que permite cruzar até 2 variáveis categóricas no eixo principal, uma dimensão de série de cor e múltiplos filtros combinados (utilizando a Regra de Ouro nas dimensões de gênero). O motor calcula dinamicamente frequências, médias, concordâncias top 2 e proporções com exportação instantânea dos dados em formato CSV e dos gráficos em PNG.
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1.5">
            <h3 className="font-bold text-teal-300 text-sm">Página 8 — Metodologia, Dicionário e Governança</h3>
            <p className="text-slate-300 leading-relaxed">
              Página de referência permanente com documentação epistemológica, Regra de Ouro de classificação de gênero, limites metodológicos, catálogo oficial de campos do banco de dados e fórmulas de cálculo de todos os índices compostos.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Ordem de leitura sugerida */}
      <section id="ordem-leitura" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-teal-400">
          <Compass className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">8. Ordem de Leitura e Análise Sugerida</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-teal-400 font-bold text-sm block">1º Passo</span>
              <span className="font-bold text-slate-200 mt-1 block">Visão Geral</span>
            </div>
            <p className="text-slate-400 mt-2 text-[11px]">
              Tenha uma fotografia macro dos principais indicadores e do volume amostral.
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-teal-400 font-bold text-sm block">2º Passo</span>
              <span className="font-bold text-slate-200 mt-1 block">Perfil</span>
            </div>
            <p className="text-slate-400 mt-2 text-[11px]">
              Compreenda quem são os respondentes antes de examinar cruzamentos.
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-teal-400 font-bold text-sm block">3º Passo</span>
              <span className="font-bold text-slate-200 mt-1 block">Abas Temáticas</span>
            </div>
            <p className="text-slate-400 mt-2 text-[11px]">
              Explore carreira, violências, núcleos, parentalidade ou STEM conforme o foco.
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-teal-400 font-bold text-sm block">4º Passo</span>
              <span className="font-bold text-slate-200 mt-1 block">Construtor</span>
            </div>
            <p className="text-slate-400 mt-2 text-[11px]">
              Crie hipóteses e cruzamentos customizados com filtros multidimensionais.
            </p>
          </div>

          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="font-mono text-teal-400 font-bold text-sm block">5º Passo</span>
              <span className="font-bold text-slate-200 mt-1 block">Metodologia</span>
            </div>
            <p className="text-slate-400 mt-2 text-[11px]">
              Consulte definições, fórmulas e o catálogo de campos para ancorar conclusões.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Limites da pesquisa */}
      <section id="limites-pesquisa" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">9. Limites Metodológicos da Pesquisa</h2>
        </div>
        <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1">
            <span className="font-bold text-amber-300 block">• Amostra Voluntária e Não-Probabilística:</span>
            <p className="text-slate-300">
              Embora o projeto tenha sido concebido com metas estratificadas de participação por campus e segmento, a adesão foi voluntária. Consequentemente, as porcentagens descrevem <strong>exclusivamente a amostra respondente</strong> e não podem ser extrapoladas como parâmetros da população total do IFRS.
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1">
            <span className="font-bold text-amber-300 block">• Representatividade Heterogênea entre Unidades:</span>
            <p className="text-slate-300">
              A mobilização variou significativamente entre campi e segmentos. Alguns subgrupos possuem amostra reduzida (n &lt; 10), exigindo cautela na leitura dos percentuais relativos.
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1">
            <span className="font-bold text-amber-300 block">• Natureza da Autodeclaração:</span>
            <p className="text-slate-300">
              Todas as informações sobre gênero, orientação, raça/cor e condições de saúde/deficiência decorrem estritamente da autopercepção expressa pelo respondente no ato da pesquisa.
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1">
            <span className="font-bold text-amber-300 block">• Associação Estatística não Implica Causalidade:</span>
            <p className="text-slate-300">
              As correlações evidenciadas nos cruzamentos revelam disparidades e tendências, mas não estabelecem relações diretas de causa e efeito sem aprofundamento investigativo.
            </p>
          </div>
          <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-3.5 space-y-1">
            <span className="font-bold text-amber-300 block">• Limitação Temporal e Escopo do Instrumento:</span>
            <p className="text-slate-300">
              O questionário reflete o clima e as percepções vigentes no período da coleta. Determinadas nuances institucionais complexas foram capturadas de forma indireta e serão aprofundadas nos relatórios analíticos.
            </p>
          </div>
        </div>
      </section>

      {/* 10. Privacidade e proteção dos dados */}
      <section id="privacidade" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-teal-400">
          <Lock className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">10. Governança, Privacidade e Proteção de Dados (LGPD)</h2>
        </div>
        <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-4 space-y-2 text-xs text-slate-300 leading-relaxed">
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
      <section id="siglas" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-teal-400">
          <Bookmark className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">11. Glossário de Siglas e Conceitos Institucionais</h2>
        </div>
        <div className="overflow-x-auto rounded-lg border border-[#223154]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0e162b] text-slate-200 font-semibold border-b border-[#223154]">
              <tr>
                <th className="px-4 py-3 w-48">Sigla / Termo</th>
                <th className="px-4 py-3">Significado e Contexto no IFRS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d4e]">
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">IFRS</td>
                <td className="px-4 py-2.5 text-slate-300">Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Sul</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">PGS</td>
                <td className="px-4 py-2.5 text-slate-300">Pesquisa sobre Gênero e Diversidade (código de identificação interna do projeto)</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">NEPGS</td>
                <td className="px-4 py-2.5 text-slate-300">Núcleo de Estudos e Pesquisas em Gênero e Diversidade dos campi do IFRS</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">NEABI</td>
                <td className="px-4 py-2.5 text-slate-300">Núcleo de Estudos Afro-Brasileiros e Indígenas</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">NAAF</td>
                <td className="px-4 py-2.5 text-slate-300">Núcleo de Apoio a Ações Afirmativas</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">Assessoria de Gênero e Diversidade</td>
                <td className="px-4 py-2.5 text-slate-300">Órgão de assessoria executiva da Reitoria do IFRS responsável pelo diagnóstico institucional</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">TAE</td>
                <td className="px-4 py-2.5 text-slate-300">Servidor Técnico-Administrativo em Educação da Carreira dos Cargos Técnico-Administrativos (PCCTAE)</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">PGD</td>
                <td className="px-4 py-2.5 text-slate-300">Programa de Gestão e Desempenho (modalidade de teletrabalho e entrega por resultados)</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">CD / FG / FCC / FUC</td>
                <td className="px-4 py-2.5 text-slate-300">Cargos de Direção (CD), Funções Gratificadas (FG) e Funções Comissionadas de Coordenação de Curso (FCC/FUC) no serviço público federal</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">STEM</td>
                <td className="px-4 py-2.5 text-slate-300">Áreas de Ciência, Tecnologia, Engenharia e Matemática (Science, Technology, Engineering and Mathematics)</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">Marco Referencial</td>
                <td className="px-4 py-2.5 text-slate-300">Marco Referencial para Igualdade de Gênero em Instituições de Ensino Superior no Brasil</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-2.5 font-bold text-teal-300">Athena Swan Charter</td>
                <td className="px-4 py-2.5 text-slate-300">Metodologia internacional britânica de autoavaliação e acreditação para avanço da equidade de gênero na academia que inspira o Marco brasileiro</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 12. Contato e créditos */}
      <section id="contato" className="bg-[#131d36] rounded-xl border border-[#223154] p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-teal-400">
          <Mail className="w-5 h-5 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">12. Expediente, Créditos e Contato Institucional</h2>
        </div>
        <div className="bg-[#0e162b] border border-[#223154] rounded-lg p-4 space-y-2 text-xs text-slate-300">
          <p>
            • <strong>Realização:</strong> Assessoria de Gênero e Diversidade do Instituto Federal do Rio Grande do Sul (IFRS), em colaboração técnica com comissões de pesquisa e servidores da Reitoria e dos campi.
          </p>
          <p>
            • <strong>Canal Oficial de Dúvidas, Sugestões ou Esclarecimentos Metodológicos:</strong>{' '}
            <a
              href="mailto:acoes.generosexualidade@ifrs.edu.br"
              className="text-teal-400 font-semibold underline hover:text-teal-300 inline-flex items-center gap-1"
            >
              acoes.generosexualidade@ifrs.edu.br
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </section>

      {/* Tabela de Índices Compostos e Fórmulas */}
      <section id="indices-formulas" className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-400" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">Fórmulas Matemáticas dos Índices Compostos</h2>
        </div>
        <p className="text-xs text-slate-400">
          Especificação formal dos índices normalizados de 0 a 100 gerados nos algoritmos do painel:
        </p>

        <div className="overflow-x-auto rounded-lg border border-[#223154]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0e162b] text-slate-200 font-semibold border-b border-[#223154]">
              <tr>
                <th className="px-4 py-3">Índice Sintético</th>
                <th className="px-4 py-3">Composição e Variáveis</th>
                <th className="px-4 py-3">Fórmula Matemática</th>
                <th className="px-4 py-3">Escala</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d4e]">
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-3 font-bold text-slate-200">Índice de Convivência Institucional</td>
                <td className="px-4 py-3 text-slate-300">
                  Média das 6 dimensões psicométricas de clima. <strong>Item sobre impacto da maternidade é invertido</strong>: 6 − nota original.
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-teal-300">
                  ((Média − 1) / 4) × 100
                </td>
                <td className="px-4 py-3 font-semibold text-emerald-400">0 a 100</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-3 font-bold text-slate-200">Índice de Confiança nos Canais</td>
                <td className="px-4 py-3 text-slate-300">
                  Média ponderada entre percepção de eficácia dos canais de acolhimento e garantia de respostas justas.
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-teal-300">
                  Média normalizada das avaliações válidas
                </td>
                <td className="px-4 py-3 font-semibold text-emerald-400">0 a 100</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-3 font-bold text-slate-200">Índice de Diversidade de Shannon (H')</td>
                <td className="px-4 py-3 text-slate-300">
                  Entropia da distribuição entre grupos, normalizada pelo logaritmo natural do total de categorias (k).
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-teal-300">
                  H' = (−Σ pᵢ·ln(pᵢ)) / ln(k)
                </td>
                <td className="px-4 py-3 font-semibold text-emerald-400">0 a 100</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-3 font-bold text-slate-200">Ocorrência de Assédios e Violências</td>
                <td className="px-4 py-3 text-slate-300">
                  Proporção de respondentes com pelo menos um relato vivenciado ou presenciado de discriminação/violência por raça/cor e/ou identidade de gênero/orientação sexual.
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-teal-300">
                  (n_relatos / n_respondentes) × 100
                </td>
                <td className="px-4 py-3 font-semibold text-rose-400">0 a 100%</td>
              </tr>
              <tr className="hover:bg-[#1a2647] transition-colors">
                <td className="px-4 py-3 font-bold text-slate-200">Taxa de Renúncia com Cuidado</td>
                <td className="px-4 py-3 text-slate-300">
                  Proporção de servidores com responsabilidade de cuidado direta (<em>"Sim"</em>) ou compartilhada (<em>"Divido igualmente"</em>) que deixaram de se candidatar a cargos/funções de gestão (<em>"Sim"</em>).
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-teal-300">
                  (n_renuncia_com_cuidado / n_total_com_cuidado) × 100
                </td>
                <td className="px-4 py-3 font-semibold text-rose-400">0 a 100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Dicionário de Campos da Base de Dados */}
      <section id="dicionario-campos" className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Dicionário de Variáveis (Catálogo Oficial do Banco de Dados)
              </h2>
              <p className="text-xs text-slate-400">
                {campos.length} variáveis catalogadas e disponíveis para filtros e cruzamentos no construtor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={buscaVariavel}
                onChange={(e) => setBuscaVariavel(e.target.value)}
                placeholder="Buscar variável..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0e162b] border border-[#25355a] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 w-44"
              />
            </div>

            <select
              value={grupoFiltro}
              onChange={(e) => setGrupoFiltro(e.target.value)}
              aria-label="Filtrar por grupo de variáveis"
              className="px-2.5 py-1.5 rounded-lg bg-[#0e162b] border border-[#25355a] text-xs text-slate-200 focus:outline-none focus:border-teal-500"
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

        <div className="overflow-x-auto max-h-[500px] rounded-lg border border-[#223154]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0e162b] text-slate-200 font-semibold border-b border-[#223154] sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5">Nome no Banco (Key)</th>
                <th className="px-3 py-2.5">Rótulo na Interface</th>
                <th className="px-3 py-2.5">Tipo</th>
                <th className="px-3 py-2.5">Grupo</th>
                <th className="px-3 py-2.5">Descrição Metodológica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d4e] font-mono text-[11px]">
              {camposFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-sans">
                    Nenhuma variável encontrada com os termos buscados.
                  </td>
                </tr>
              ) : (
                camposFiltrados.map((c) => (
                  <tr key={c.key} className="hover:bg-[#1a2647] transition-colors">
                    <td className="px-3 py-2 text-teal-300 font-bold">{c.key}</td>
                    <td className="px-3 py-2 font-sans font-medium text-slate-200">{c.label}</td>
                    <td className="px-3 py-2 font-sans">
                      <span className="bg-[#1a2647] text-slate-300 border border-[#2b3d68] px-1.5 py-0.5 rounded text-[10px]">
                        {c.tipo}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-sans text-slate-400 capitalize">{c.grupo}</td>
                    <td className="px-3 py-2 font-sans text-slate-400 max-w-sm">{c.descricao || '—'}</td>
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
