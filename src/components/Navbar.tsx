/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldAlert,
  Building2,
  HeartHandshake,
  Cpu,
  Wand2,
  BookOpen,
  FileText,
  Database,
  MessageSquare,
  Filter,
  RotateCcw,
  X,
  Menu,
  PanelLeft,
  PanelTop,
} from 'lucide-react';
import { FiltrosGlobaisState } from '../lib/types';

export interface TabItem {
  id: string;
  label: string;
  icone: React.ReactNode;
  /** Abas com rótulo mais longo: usa largura maior e não trunca o texto (menu no topo). */
  largo?: boolean;
}

const ICONE = 'w-4 h-4 shrink-0';

export const ABAS_PAINEL: TabItem[] = [
  { id: 'conheca_pesquisa', label: 'Conheça a Pesquisa', icone: <FileText className={ICONE} aria-hidden="true" /> },
  { id: 'ifrs_numeros', label: 'O IFRS em Números', icone: <Database className={ICONE} aria-hidden="true" /> },
  { id: 'visao_geral', label: 'Visão Geral da Pesquisa', icone: <LayoutDashboard className={ICONE} aria-hidden="true" /> },
  { id: 'perfil', label: '1. Perfil e Representatividade', icone: <Users className={ICONE} aria-hidden="true" /> },
  { id: 'carreira', label: '2. Carreira e Gestão', icone: <Briefcase className={ICONE} aria-hidden="true" /> },
  { id: 'ambiente_violencias', label: '3. Clima e Violências', icone: <ShieldAlert className={ICONE} aria-hidden="true" /> },
  { id: 'nucleos', label: '4. Núcleos e Políticas', icone: <Building2 className={ICONE} aria-hidden="true" /> },
  { id: 'cuidado', label: '5. Cuidado e Parentalidade', icone: <HeartHandshake className={ICONE} aria-hidden="true" /> },
  { id: 'stem', label: '6. Áreas e STEM', icone: <Cpu className={ICONE} aria-hidden="true" /> },
  { id: 'respondentes_disseram', label: '7. O que a comunidade contou', icone: <MessageSquare className={ICONE} aria-hidden="true" />, largo: true },
  { id: 'construtor', label: '8. Construtor Dinâmico', icone: <Wand2 className={ICONE} aria-hidden="true" /> },
  { id: 'metodologia', label: '9. Metodologia e Governança', icone: <BookOpen className={ICONE} aria-hidden="true" /> },
];

// Abas de apresentação (sem numeração) vs. abas do roteiro da pesquisa (numeradas 1 a 9)
const ABAS_PRINCIPAIS = ABAS_PAINEL.slice(0, 3);
const ABAS_NUMERADAS = ABAS_PAINEL.slice(3);

export type LayoutMenu = 'lateral' | 'topo';

/** Símbolo dos Institutos Federais nas cores oficiais (verde #2F9E41 e vermelho #CD191E).
 *  Recomenda-se substituir pelo arquivo oficial do logotipo do IFRS, sem alterar suas cores. */
function SimboloIF() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 shrink-0" role="img" aria-label="Símbolo do Instituto Federal">
      {/* Mesma composição do desenho anterior; apenas as cores passaram a ser as oficiais */}
      <rect x="2" y="2" width="7" height="7" rx="1.8" fill="#2F9E41" />
      <rect x="2" y="12.5" width="7" height="7" rx="1.8" fill="#2F9E41" />
      <rect x="2" y="23" width="7" height="7" rx="1.8" fill="#2F9E41" />
      <circle cx="16" cy="5.5" r="3.8" fill="#CD191E" />
      <rect x="12.5" y="12.5" width="7" height="7" rx="1.8" fill="#2F9E41" />
      <rect x="12.5" y="23" width="7" height="7" rx="1.8" fill="#2F9E41" />
      <rect x="23" y="2" width="7" height="7" rx="1.8" fill="#2F9E41" />
      <rect x="23" y="12.5" width="7" height="7" rx="1.8" fill="#2F9E41" />
    </svg>
  );
}

// ---------------------------------------------------------------------------------------------
// Menu no topo (layout anterior, mantido para comparação)
// ---------------------------------------------------------------------------------------------
function BotaoAbaTopo({ aba, ativa, onClick }: { aba: TabItem; ativa: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={ativa ? 'page' : undefined}
      className={`flex items-center justify-start gap-2 py-2 px-2.5 text-sm leading-tight font-semibold border-b-[3px] transition-colors shrink-0 ${
        aba.largo ? 'w-56 sm:w-60' : 'w-40 sm:w-44'
      } ${
        ativa
          ? 'border-marca text-marca bg-realce'
          : 'border-transparent text-texto-2 hover:text-texto hover:border-borda-forte hover:bg-realce/60'
      }`}
    >
      {aba.icone}
      <span className={`text-left break-words ${aba.largo ? '' : 'line-clamp-2'}`}>{aba.label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------------------------
// Menu lateral: barra verde-escura de altura total (desktop) ou gaveta deslizante (celular)
// ---------------------------------------------------------------------------------------------
function ItemMenuLateral({ aba, ativa, onClick }: { aba: TabItem; ativa: boolean; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={ativa ? 'page' : undefined}
        className={`group w-full flex items-center gap-2.5 min-h-10 px-2.5 py-1.5 rounded-xl text-sm text-left leading-snug transition-colors ${
          ativa
            ? 'bg-white text-marca font-bold shadow-sm'
            : 'text-lateral-texto font-medium hover:bg-white/10 hover:text-white'
        }`}
      >
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors ${
            ativa ? 'bg-marca-fundo text-marca' : 'bg-white/10 text-lateral-texto group-hover:text-white'
          }`}
        >
          {aba.icone}
        </span>
        <span>{aba.label}</span>
      </button>
    </li>
  );
}

interface MenuLateralProps {
  abaAtiva: string;
  aoMudarAba: (aba: string) => void;
  aoAbrirFiltros: () => void;
  totalFiltrosAtivos: number;
  /** Gaveta aberta em telas estreitas */
  abertoMobile: boolean;
  aoFecharMobile: () => void;
}

function ConteudoMenu({
  abaAtiva,
  aoMudarAba,
  aoAbrirFiltros,
  totalFiltrosAtivos,
  aoFecharMobile,
  mobile,
}: Omit<MenuLateralProps, 'abertoMobile'> & { mobile: boolean }) {
  const escolher = (id: string) => {
    aoMudarAba(id);
    aoFecharMobile();
  };
  return (
    <div className="menu-escuro flex flex-col h-full bg-lateral text-white">
      {/* Marca */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/10 mb-4">
        <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-white shrink-0">
          <SimboloIF />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight">IFRS</p>
          <p className="text-xs leading-snug text-lateral-texto">Igualdade de Gênero e Diversidade</p>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={aoFecharMobile}
            aria-label="Fechar menu"
            className="ml-auto flex items-center justify-center w-10 h-10 rounded-lg text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => {
            aoFecharMobile();
            aoAbrirFiltros();
          }}
          className={`w-full flex items-center justify-center gap-2 min-h-11 px-3 rounded-xl text-sm font-semibold transition-colors ${
            totalFiltrosAtivos > 0
              ? 'bg-white text-marca hover:bg-marca-fundo'
              : 'bg-white/10 text-white border border-white/25 hover:bg-white/20'
          }`}
        >
          <Filter className="w-4 h-4" aria-hidden="true" />
          Filtros Globais
          {totalFiltrosAtivos > 0 && (
            <span className="bg-marca text-white text-xs px-2 rounded-full font-bold">
              {totalFiltrosAtivos}
              <span className="sr-only"> filtros ativos</span>
            </span>
          )}
        </button>
      </div>

      <nav aria-label="Seções do painel" className="flex-1 overflow-y-auto px-3 pb-6">
        <h2 className="px-3 mb-1.5 text-xs font-bold uppercase tracking-wider text-lateral-rotulo">Apresentação</h2>
        <ul className="space-y-0.5 mb-4">
          {ABAS_PRINCIPAIS.map((aba) => (
            <ItemMenuLateral key={aba.id} aba={aba} ativa={abaAtiva === aba.id} onClick={() => escolher(aba.id)} />
          ))}
        </ul>
        <h2 className="px-3 mb-1.5 text-xs font-bold uppercase tracking-wider text-lateral-rotulo">Resultados da pesquisa</h2>
        <ul className="space-y-0.5">
          {ABAS_NUMERADAS.map((aba) => (
            <ItemMenuLateral key={aba.id} aba={aba} ativa={abaAtiva === aba.id} onClick={() => escolher(aba.id)} />
          ))}
        </ul>
      </nav>

      <p className="px-5 py-3 border-t border-white/10 text-xs text-lateral-texto">Assessoria de Gênero e Sexualidade</p>
    </div>
  );
}

export const MenuLateral: React.FC<MenuLateralProps> = (props) => {
  const { abertoMobile, aoFecharMobile } = props;
  const gavetaRef = useRef<HTMLDivElement>(null);

  // Gaveta do celular: foco entra nela ao abrir, Esc fecha, rolagem da página fica travada
  useEffect(() => {
    if (!abertoMobile) return;
    const anterior = document.activeElement as HTMLElement | null;
    gavetaRef.current?.querySelector<HTMLElement>('button')?.focus();
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && aoFecharMobile();
    document.addEventListener('keydown', aoTeclar);
    const overflowAntes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAntes;
      anterior?.focus();
    };
  }, [abertoMobile, aoFecharMobile]);

  return (
    <>
      {/* Desktop: barra fixa de altura total */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-[19rem]">
        <ConteudoMenu {...props} mobile={false} />
      </aside>

      {/* Celular / zoom alto: gaveta sobreposta */}
      {abertoMobile && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu do painel">
          <div className="absolute inset-0 bg-black/50" onClick={aoFecharMobile} aria-hidden="true" />
          <div ref={gavetaRef} className="absolute inset-y-0 left-0 w-[min(20rem,88vw)] shadow-2xl gaveta-entrada">
            <ConteudoMenu {...props} mobile={true} />
          </div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Cabeçalho
// ---------------------------------------------------------------------------------------------
interface NavbarProps {
  abaAtiva: string;
  aoMudarAba: (aba: string) => void;
  filtros: FiltrosGlobaisState;
  aoAbrirFiltros: () => void;
  aoLimparFiltros: () => void;
  aoRemoverFiltro: (chave: keyof FiltrosGlobaisState, valor?: string) => void;
  nFiltrado?: number;
  layoutMenu: LayoutMenu;
  aoMudarLayoutMenu: (layout: LayoutMenu) => void;
  /** Abre a gaveta do menu lateral em telas estreitas */
  aoAbrirMenuMobile?: () => void;
}

export function listarFiltrosAtivos(filtros: FiltrosGlobaisState) {
  const lista: { chave: keyof FiltrosGlobaisState; label: string; valor: string }[] = [];
  if (filtros.vinculo) filtros.vinculo.forEach((v) => lista.push({ chave: 'vinculo', label: 'Vínculo', valor: v }));
  if (filtros.campus) filtros.campus.forEach((v) => lista.push({ chave: 'campus', label: 'Campus', valor: v }));
  if (filtros.genero_agrupado) filtros.genero_agrupado.forEach((v) => lista.push({ chave: 'genero_agrupado', label: 'Gênero', valor: v }));
  if (filtros.cor_raca) filtros.cor_raca.forEach((v) => lista.push({ chave: 'cor_raca', label: 'Cor/Raça', valor: v }));
  if (filtros.faixa_etaria) filtros.faixa_etaria.forEach((v) => lista.push({ chave: 'faixa_etaria', label: 'Faixa', valor: v }));
  if (filtros.pcd) filtros.pcd.forEach((v) => lista.push({ chave: 'pcd', label: 'PCD', valor: v }));
  if (filtros.orientacao_sexual) filtros.orientacao_sexual.forEach((v) => lista.push({ chave: 'orientacao_sexual', label: 'Orientação', valor: v }));
  if (filtros.responsabilidade_cuidado) filtros.responsabilidade_cuidado.forEach((v) => lista.push({ chave: 'responsabilidade_cuidado', label: 'Cuidado', valor: v }));
  if (filtros.area_stem && filtros.area_stem !== 'todos') {
    lista.push({ chave: 'area_stem', label: 'Área', valor: filtros.area_stem === 'stem' ? 'Apenas STEM' : 'Não-STEM' });
  }
  return lista;
}

export const Navbar: React.FC<NavbarProps> = ({
  abaAtiva,
  aoMudarAba,
  filtros,
  aoAbrirFiltros,
  aoLimparFiltros,
  aoRemoverFiltro,
  layoutMenu,
  aoMudarLayoutMenu,
  aoAbrirMenuMobile,
}) => {
  const listaFiltrosAtivos = listarFiltrosAtivos(filtros);
  const temFiltroAtivo = listaFiltrosAtivos.length > 0;
  const menuTopo = layoutMenu === 'topo';

  return (
    <header className={`sticky top-0 z-40 border-b border-borda ${menuTopo ? 'bg-superficie shadow-sm' : 'bg-superficie/90 backdrop-blur-md'}`}>
      {/* Faixa verde institucional (no layout lateral, a própria barra lateral faz esse papel) */}
      {menuTopo && <div className="h-1.5 bg-marca-oficial" aria-hidden="true" />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {!menuTopo && (
            <button
              type="button"
              onClick={aoAbrirMenuMobile}
              aria-label="Abrir menu de seções"
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl border border-borda-forte text-texto hover:bg-realce shrink-0"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
          {/* Símbolo aparece aqui só quando não há barra lateral visível */}
          <span className={menuTopo ? '' : 'lg:hidden hidden sm:block'}>
            <SimboloIF />
          </span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-marca leading-tight">Instituto Federal do Rio Grande do Sul</p>
            <h1 className="text-base sm:text-xl font-bold text-texto leading-tight">
              Painel de Indicadores de Igualdade de Gênero e Diversidade no IFRS
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Alternância do layout do menu, para comparação das duas versões */}
          <button
            type="button"
            onClick={() => aoMudarLayoutMenu(menuTopo ? 'lateral' : 'topo')}
            className="hidden lg:flex items-center gap-2 min-h-10 px-3 rounded-xl text-sm font-medium border border-borda text-texto-2 bg-superficie hover:bg-realce transition-colors"
          >
            {menuTopo ? <PanelLeft className="w-4 h-4" aria-hidden="true" /> : <PanelTop className="w-4 h-4" aria-hidden="true" />}
            {menuTopo ? 'Ver menu lateral' : 'Ver menu no topo'}
          </button>

          {menuTopo && (
            <button
              type="button"
              onClick={aoAbrirFiltros}
              className={`flex items-center gap-2 min-h-10 px-3 rounded-lg text-sm font-semibold border transition-colors ${
                temFiltroAtivo
                  ? 'bg-marca border-marca text-white hover:bg-marca-escura'
                  : 'bg-superficie border-borda-forte text-texto hover:bg-realce'
              }`}
            >
              <Filter className="w-4 h-4" aria-hidden="true" />
              <span>Filtros Globais</span>
              {temFiltroAtivo && (
                <span className="bg-white/25 text-white text-xs px-2 rounded-full font-bold">
                  {listaFiltrosAtivos.length}
                  <span className="sr-only"> filtros ativos</span>
                </span>
              )}
            </button>
          )}

          {temFiltroAtivo && (
            <button
              type="button"
              onClick={aoLimparFiltros}
              className="flex items-center gap-1.5 min-h-10 px-3 rounded-lg border border-borda-forte text-sm text-texto-2 hover:bg-realce transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Faixa de chips de filtros ativos */}
      {temFiltroAtivo && (
        <div className="bg-marca-fundo border-t border-borda" aria-live="polite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-marca shrink-0 mr-1">Filtros ativos:</span>
          <ul className="flex items-center gap-1.5 flex-wrap">
            {listaFiltrosAtivos.map((fa, i) => (
              <li
                key={i}
                className="bg-superficie text-texto border border-marca-borda rounded-md pl-2 text-sm font-medium flex items-center gap-1 shrink-0"
              >
                <span className="text-texto-3 font-normal">{fa.label}:</span>
                <span className="max-w-40 truncate">{fa.valor}</span>
                <button
                  type="button"
                  onClick={() => aoRemoverFiltro(fa.chave, fa.valor)}
                  aria-label={`Remover filtro ${fa.label}: ${fa.valor}`}
                  className="flex items-center justify-center w-7 h-7 text-texto-3 hover:text-perigo transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        </div>
      )}

      {/* Navegação por abas no topo (somente no layout "topo") */}
      {menuTopo && (
        <nav aria-label="Seções do painel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-borda divide-y divide-borda">
          <div className="flex flex-wrap justify-center gap-1 py-0.5">
            {ABAS_PRINCIPAIS.map((aba) => (
              <BotaoAbaTopo key={aba.id} aba={aba} ativa={abaAtiva === aba.id} onClick={() => aoMudarAba(aba.id)} />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-1 py-0.5">
            {ABAS_NUMERADAS.map((aba) => (
              <BotaoAbaTopo key={aba.id} aba={aba} ativa={abaAtiva === aba.id} onClick={() => aoMudarAba(aba.id)} />
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
