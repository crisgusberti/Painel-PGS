/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MessageSquare } from 'lucide-react';

export const PageRespondentesDisseram: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Título e Resumo Introdutório */}
      <div className="border-b border-[#1f2d4e] pb-3">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-6 h-6 text-teal-400" />
          <h2 className="text-xl font-bold text-slate-100">O que os respondentes disseram?</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          Análise das respostas abertas (dados qualitativos) coletadas na pesquisa.
        </p>
      </div>

      {/* Conteúdo (texto provisório) */}
      <div className="bg-[#131d36] rounded-xl border border-[#223154] shadow-sm p-6 space-y-4 text-sm text-slate-300 leading-relaxed">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
          dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
          ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>
        <p className="text-xs text-slate-500 italic">
          Os gráficos com a análise das respostas abertas serão adicionados aqui nas próximas etapas.
        </p>
      </div>
    </div>
  );
};
