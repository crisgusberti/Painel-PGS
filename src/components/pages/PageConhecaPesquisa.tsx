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
      <div className="border-b border-[#1f2d4e] pb-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-teal-400" />
          <h2 className="text-xl font-bold text-slate-100">Conheça a Pesquisa</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          Venha conhecer um pouco mais sobre quem estuda e trabalha no IFRS e o que essas pessoas compartilharam
          conosco nesta pesquisa.
        </p>
      </div>

      {/* Conteúdo (texto provisório) */}
      <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-6 space-y-4 text-sm text-slate-300 leading-relaxed">
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
          A pesquisa foi orientada pelo Marco Referencial para a Igualdade de Gênero em Instituições de Ensino
          Superior no Brasil, uma ferramenta que apoia as instituições a conhecer sua realidade e planejar
          melhorias. Ao explorar as abas, você encontrará tanto números quanto relatos das pessoas participantes,
          contribuindo para pensar os próximos passos do IFRS.
        </p>
      </div>

      {/* Blocos de destaque */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5 space-y-2">
          <Target className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-100">Objetivo</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Traçar o perfil da comunidade do IFRS para subsidiar políticas de promoção da igualdade de gênero e
            de combate ao assédio e à violência de gênero.
          </p>
        </div>
        <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5 space-y-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Período de Coleta</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            De 07 de outubro de 2025 até 28 de julho de 2026.
          </p>
        </div>
        <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-5 space-y-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">Quem Participou</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Docentes, técnicos administrativos, estudantes maiores e menores de idade dos 17 campi e da Reitoria
            do IFRS.
          </p>
        </div>
      </div>
    </div>
  );
};
