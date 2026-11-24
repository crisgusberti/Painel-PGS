/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileText, Target, Calendar, Users } from 'lucide-react';

export const PageConhecaPesquisa: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Título e Resumo Introdutório */}
      <div className="border-b border-borda pb-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-marca" />
          <h2 className="text-xl font-bold text-texto">Conheça a Pesquisa</h2>
        </div>
        <p className="text-xs sm:text-sm text-texto-3 mt-1.5">
          Venha conhecer um pouco mais sobre quem estuda e trabalha no IFRS e o que essas pessoas compartilharam
          conosco nesta pesquisa.
        </p>
      </div>

      {/* Conteúdo (texto provisório) */}
      <div className="bg-superficie rounded-xl border border-borda shadow-sm p-6 space-y-4 text-sm text-texto-2 leading-relaxed">
        <p>
          Este painel é um convite para conhecer melhor as pessoas que estudam e trabalham no IFRS. Quem são
          elas, quais são suas trajetórias e como vivenciam a instituição são questões que orientam nossa
          pesquisa.
        </p>
        <p>
          Realizado pela Assessoria de Gênero e Sexualidade, o levantamento reuniu respostas de estudantes,
          docentes e técnicos(as) administrativos(as) entre 2025 e 2026. Buscamos delinear o perfil das pessoas
          participantes e conhecer suas experiências em temas como participação acadêmica, carreira, convivência,
          cuidado e acesso às políticas institucionais.
        </p>
        <p>
          Nosso olhar é interseccional: considera que gênero, raça, orientação sexual, deficiência e outras
          características fazem parte da vida das pessoas de maneira articulada. Conhecer essas diferentes
          realidades ajuda a planejar ações que atendam melhor à diversidade da comunidade.
        </p>
        <p>
          A pesquisa foi orientada pelo{' '}
          <a
            href="https://www.britishcouncil.org.br/mulheres-na-ciencia/marco-referencial"
            target="_blank"
            rel="noopener noreferrer"
            className="text-marca underline underline-offset-2 hover:text-marca"
          >
            Marco Referencial para a Igualdade de Gênero em Instituições de Ensino Superior no Brasil
          </a>
          , uma ferramenta que apoia as instituições a conhecer sua realidade e planejar
          melhorias. Ao explorar as abas, você encontrará tanto números quanto relatos das pessoas participantes,
          contribuindo para pensar os próximos passos do IFRS.
        </p>
      </div>

      {/* Blocos de destaque */}
      <div className="grid grid-cols-1 @lg:grid-cols-3 gap-4">
        <div className="bg-superficie rounded-xl border border-borda shadow-sm p-5 space-y-2">
          <Target className="w-5 h-5 text-info" />
          <h3 className="text-sm font-bold text-texto">Objetivo</h3>
          <p className="text-xs text-texto-3 leading-relaxed">
            Conhecer o perfil, as percepções e as experiências de estudantes e servidores(as) do IFRS,
            considerando como gênero e outras características sociais se articulam, para subsidiar políticas de
            igualdade e respeito à diversidade.
          </p>
        </div>
        <div className="bg-superficie rounded-xl border border-borda shadow-sm p-5 space-y-2">
          <Calendar className="w-5 h-5 text-alerta" />
          <h3 className="text-sm font-bold text-texto">Período de Coleta</h3>
          <p className="text-xs text-texto-3 leading-relaxed">
            De 07 de outubro de 2025 até 28 de julho de 2026.
          </p>
        </div>
        <div className="bg-superficie rounded-xl border border-borda shadow-sm p-5 space-y-2">
          <Users className="w-5 h-5 text-marca" />
          <h3 className="text-sm font-bold text-texto">Quem Participou</h3>
          <p className="text-xs text-texto-3 leading-relaxed">
            Docentes, técnicos administrativos, estudantes maiores e menores de idade dos 17 campi e da Reitoria
            do IFRS.
          </p>
        </div>
      </div>
    </div>
  );
};
