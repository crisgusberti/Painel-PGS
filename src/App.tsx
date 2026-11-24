/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar, MenuLateral, LayoutMenu, listarFiltrosAtivos } from './components/Navbar';
import { FiltrosGlobaisModal } from './components/FiltrosGlobaisModal';
import { FiltrosGlobaisState } from './lib/types';

// Páginas
import { PageVisaoGeral } from './components/pages/PageVisaoGeral';
import { PagePerfil } from './components/pages/PagePerfil';
import { PageCarreira } from './components/pages/PageCarreira';
import { PageAmbienteViolencias } from './components/pages/PageAmbienteViolencias';
import { PageNucleos } from './components/pages/PageNucleos';
import { PageCuidado } from './components/pages/PageCuidado';
import { PageStem } from './components/pages/PageStem';
import { PageConstrutor } from './components/pages/PageConstrutor';
import { PageMetodologia } from './components/pages/PageMetodologia';
import { PageConhecaPesquisa } from './components/pages/PageConhecaPesquisa';
import { PageIfrsNumeros } from './components/pages/PageIfrsNumeros';
import { PageRespondentesDisseram } from './components/pages/PageRespondentesDisseram';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<string>('conheca_pesquisa');
  const [filtros, setFiltros] = useState<FiltrosGlobaisState>({});
  const [modalFiltrosAberto, setModalFiltrosAberto] = useState<boolean>(false);

  // Layout do menu de abas: lateral (padrão) ou no topo. Pode ser forçado por ?menu=topo / ?menu=lateral
  const [layoutMenu, setLayoutMenu] = useState<LayoutMenu>(() => {
    const daUrl = new URLSearchParams(window.location.search).get('menu');
    if (daUrl === 'topo' || daUrl === 'lateral') return daUrl;
    try {
      const salvo = window.localStorage.getItem('painel_layout_menu');
      if (salvo === 'topo' || salvo === 'lateral') return salvo;
    } catch {
      /* armazenamento indisponível */
    }
    return 'lateral';
  });
  const mudarLayoutMenu = (layout: LayoutMenu) => {
    setLayoutMenu(layout);
    try {
      window.localStorage.setItem('painel_layout_menu', layout);
    } catch {
      /* armazenamento indisponível */
    }
  };

  // Ao trocar de aba, leva o foco (e a rolagem) para o início do conteúdo,
  // para que quem navega por teclado ou leitor de tela não precise percorrer o menu de novo.
  const conteudoRef = useRef<HTMLElement>(null);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const fecharMenuMobile = useCallback(() => setMenuMobileAberto(false), []);
  const primeiraRenderizacao = useRef(true);
  const mudarAba = (aba: string) => {
    setAbaAtiva(aba);
  };
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    conteudoRef.current?.focus({ preventScroll: true });
  }, [abaAtiva]);

  // Estados de dados das páginas
  const [dadosVisaoGeral, setDadosVisaoGeral] = useState<any>(null);
  const [dadosPerfil, setDadosPerfil] = useState<any>(null);
  const [dadosCarreira, setDadosCarreira] = useState<any>(null);
  const [dadosAmbiente, setDadosAmbiente] = useState<any>(null);
  const [dadosNucleos, setDadosNucleos] = useState<any>(null);
  const [dadosCuidado, setDadosCuidado] = useState<any>(null);
  const [dadosStem, setDadosStem] = useState<any>(null);

  const [carregando, setCarregando] = useState<boolean>(false);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [nFiltrado, setNFiltrado] = useState<number>(4857);

  // Carregar dados de acordo com a aba ativa e os filtros
  const carregarDadosAba = async (aba: string, filtrosAtuais: FiltrosGlobaisState) => {
    setCarregando(true);
    setErroCarregamento(null);
    try {
      const endpoints: Record<string, string> = {
        visao_geral: '/api/visao-geral',
        perfil: '/api/perfil',
        carreira: '/api/carreira',
        ambiente_violencias: '/api/ambiente-violencias',
        nucleos: '/api/nucleos',
        cuidado: '/api/cuidado',
        stem: '/api/stem',
      };

      const url = endpoints[aba];
      if (url) {
        const minDelay = new Promise((resolve) => setTimeout(resolve, 280));
        const [res] = await Promise.all([
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filtros: filtrosAtuais }),
          }),
          minDelay,
        ]);

        if (res.ok) {
          const json = await res.json();
          setErroCarregamento(null);
          if (aba === 'visao_geral') {
            setDadosVisaoGeral(json);
            if (json.n_filtrado !== undefined) setNFiltrado(json.n_filtrado);
          } else if (aba === 'perfil') {
            setDadosPerfil(json);
            if (json.total !== undefined) setNFiltrado(json.total);
          } else if (aba === 'carreira') {
            setDadosCarreira(json);
          } else if (aba === 'ambiente_violencias') {
            setDadosAmbiente(json);
          } else if (aba === 'nucleos') {
            setDadosNucleos(json);
          } else if (aba === 'cuidado') {
            setDadosCuidado(json);
          } else if (aba === 'stem') {
            setDadosStem(json);
          }
        } else {
          setErroCarregamento(
            `Erro ${res.status}: Não foi possível carregar os dados desta seção do servidor.`
          );
        }
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados da aba:', err);
      setErroCarregamento('Erro de conexão ao comunicar com a API do servidor.');
    } finally {
      setCarregando(false);
    }
  };

  // Atualizar quando a aba ativa ou os filtros mudam
  useEffect(() => {
    carregarDadosAba(abaAtiva, filtros);
  }, [abaAtiva, filtros]);

  // Remover um filtro específico via chip da barra superior
  const handleRemoverFiltro = (chave: keyof FiltrosGlobaisState, valor?: string) => {
    const novos = { ...filtros };
    if (chave === 'area_stem') {
      delete novos.area_stem;
    } else if (valor && Array.isArray(novos[chave])) {
      const arr = (novos[chave] as string[]).filter((v) => v !== valor);
      if (arr.length > 0) {
        (novos as any)[chave] = arr;
      } else {
        delete novos[chave];
      }
    } else {
      delete novos[chave];
    }
    setFiltros(novos);
  };

  const handleLimparFiltros = () => {
    setFiltros({});
  };

  return (
    <div className="min-h-screen bg-fundo flex flex-col font-sans text-texto selection:bg-marca/20">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-marca focus:text-white focus:font-semibold"
      >
        Pular para o conteúdo
      </a>

      {layoutMenu === 'lateral' && (
        <MenuLateral
          abaAtiva={abaAtiva}
          aoMudarAba={mudarAba}
          aoAbrirFiltros={() => setModalFiltrosAberto(true)}
          totalFiltrosAtivos={listarFiltrosAtivos(filtros).length}
          abertoMobile={menuMobileAberto}
          aoFecharMobile={fecharMenuMobile}
        />
      )}

      {/* No layout lateral, todo o restante fica à direita da barra fixa (lg:pl-[19rem]) */}
      <div className={`flex-1 flex flex-col min-w-0 ${layoutMenu === 'lateral' ? 'lg:pl-[19rem]' : ''}`}>
      {/* Cabeçalho, filtros ativos e (no layout "topo") as abas */}
      <Navbar
        abaAtiva={abaAtiva}
        aoMudarAba={mudarAba}
        filtros={filtros}
        aoAbrirFiltros={() => setModalFiltrosAberto(true)}
        aoLimparFiltros={handleLimparFiltros}
        aoRemoverFiltro={handleRemoverFiltro}
        nFiltrado={nFiltrado}
        layoutMenu={layoutMenu}
        aoMudarLayoutMenu={mudarLayoutMenu}
        aoAbrirMenuMobile={() => setMenuMobileAberto(true)}
      />

      {/* Conteúdo Principal */}
      <main
        id="conteudo"
        ref={conteudoRef}
        tabIndex={-1}
        className="@container flex-1 min-w-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none"
      >
        {erroCarregamento && (
          <div role="alert" className="mb-6 p-4 rounded-xl bg-alerta-fundo border border-alerta-borda flex items-center justify-between gap-3 text-alerta">
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">⚠️</span>
              <span className="text-sm">{erroCarregamento}</span>
            </div>
            <button
              type="button"
              onClick={() => carregarDadosAba(abaAtiva, filtros)}
              className="px-3 py-2 rounded-lg bg-superficie border border-alerta-borda hover:bg-alerta-fundo text-alerta text-sm font-semibold transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {abaAtiva === 'conheca_pesquisa' && <PageConhecaPesquisa />}

        {abaAtiva === 'ifrs_numeros' && <PageIfrsNumeros />}

        {abaAtiva === 'visao_geral' && (
          <PageVisaoGeral
            dados={dadosVisaoGeral}
            carregando={carregando}
            aoNavegarAba={mudarAba}
          />
        )}

        {abaAtiva === 'perfil' && (
          <PagePerfil dados={dadosPerfil} carregando={carregando} />
        )}

        {abaAtiva === 'carreira' && (
          <PageCarreira dados={dadosCarreira} carregando={carregando} />
        )}

        {abaAtiva === 'ambiente_violencias' && (
          <PageAmbienteViolencias dados={dadosAmbiente} carregando={carregando} />
        )}

        {abaAtiva === 'nucleos' && (
          <PageNucleos dados={dadosNucleos} carregando={carregando} />
        )}

        {abaAtiva === 'cuidado' && (
          <PageCuidado dados={dadosCuidado} carregando={carregando} />
        )}

        {abaAtiva === 'stem' && (
          <PageStem dados={dadosStem} carregando={carregando} />
        )}

        {abaAtiva === 'construtor' && <PageConstrutor />}

        {abaAtiva === 'metodologia' && <PageMetodologia />}

        {abaAtiva === 'respondentes_disseram' && <PageRespondentesDisseram />}
      </main>

      {/* Rodapé Institucional */}
      <footer className="bg-superficie border-t-4 border-marca-oficial py-6 text-sm text-texto-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-texto">
              Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Sul (IFRS)
            </span>
            <div className="text-sm text-marca mt-0.5">
              Assessoria de Gênero e Sexualidade
            </div>
          </div>
        </div>
      </footer>

      </div>

      {/* Modal de Filtros Globais */}
      <FiltrosGlobaisModal
        aberto={modalFiltrosAberto}
        aoFechar={() => setModalFiltrosAberto(false)}
        filtrosAtivos={filtros}
        aoAplicar={setFiltros}
        aoLimpar={handleLimparFiltros}
        nTotalFiltrado={nFiltrado}
      />
    </div>
  );
}
