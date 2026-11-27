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
      </div>

      {/* Conteúdo (texto provisório) */}
      <div className="bg-superficie rounded-xl border border-borda shadow-sm p-6 space-y-4 text-sm text-texto-2 leading-relaxed">
        <p>
          Conheça um pouco mais sobre quem estuda e trabalha no IFRS! Entre 2025 e 2026, a Assessoria de Gênero e
          Sexualidade ouviu estudantes, docentes e técnicos/as administrativos/as sobre seus perfis e experiências
          de participação acadêmica, carreira, convivência e cuidado.
        </p>
        <p>
          Nosso olhar é interseccional: considera como gênero, raça, orientação sexual, deficiência e outras
          características se articulam nas vivências das pessoas participantes.
        </p>
        <p>
          Orientada pelo{' '}
          <a
            href="https://www.britishcouncil.org.br/mulheres-na-ciencia/marco-referencial"
            target="_blank"
            rel="noopener noreferrer"
            className="text-marca underline underline-offset-2 hover:text-marca"
          >
            Marco Referencial para a Igualdade de Gênero em Instituições de Ensino Superior no Brasil
          </a>
          , a pesquisa busca contribuir para o planejamento de políticas e ações institucionais. Explore as abas e
          conheça os números, relatos e sugestões que reunimos.
        </p>
      </div>

      {/* Blocos de destaque */}
      <div className="grid grid-cols-1 @lg:grid-cols-3 gap-4">
        <div className="bg-superficie rounded-xl border border-borda shadow-sm p-5 space-y-2">
          <Target className="w-5 h-5 text-info" />
          <h3 className="text-sm font-bold text-texto">Objetivo</h3>
          <p className="text-xs text-texto-3 leading-relaxed">
            Conhecer o perfil, as percepções e as experiências de estudantes e servidores/as do IFRS,
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
            Participaram docentes, técnicos/as administrativos/as e estudantes maiores e menores de idade de 17
            campi do IFRS, além da Reitoria.
          </p>
          <p className="text-xs text-texto-3 leading-relaxed">
            <span className="font-semibold text-texto-2">Campi participantes:</span> Alvorada, Bento Gonçalves,
            Canoas, Caxias do Sul, Erechim, Farroupilha, Feliz, Ibirubá, Osório, Porto Alegre, Restinga, Rio
            Grande, Rolante, Sertão, Vacaria, Veranópolis e Viamão.
          </p>
        </div>
      </div>
    </div>
  );
};
