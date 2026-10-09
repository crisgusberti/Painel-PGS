/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
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

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<string>('visao_geral');
  const [filtros, setFiltros] = useState<FiltrosGlobaisState>({});
  const [modalFiltrosAberto, setModalFiltrosAberto] = useState<boolean>(false);

  // Estados de dados das páginas
  const [dadosVisaoGeral, setDadosVisaoGeral] = useState<any>(null);
  const [dadosPerfil, setDadosPerfil] = useState<any>(null);
  const [dadosCarreira, setDadosCarreira] = useState<any>(null);
  const [dadosAmbiente, setDadosAmbiente] = useState<any>(null);
  const [dadosNucleos, setDadosNucleos] = useState<any>(null);
  const [dadosCuidado, setDadosCuidado] = useState<any>(null);
  const [dadosStem, setDadosStem] = useState<any>(null);

  const [carregando, setCarregando] = useState<boolean>(false);
  const [nFiltrado, setNFiltrado] = useState<number>(4878);

  // Carregar dados de acordo com a aba ativa e os filtros
  const carregarDadosAba = async (aba: string, filtrosAtuais: FiltrosGlobaisState) => {
    setCarregando(true);
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
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados da aba:', err);
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
    <div className="min-h-screen bg-[#0b1329] flex flex-col font-sans text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Barra de Navegação e Filtros */}
      <Navbar
        abaAtiva={abaAtiva}
        aoMudarAba={setAbaAtiva}
        filtros={filtros}
        aoAbrirFiltros={() => setModalFiltrosAberto(true)}
        aoLimparFiltros={handleLimparFiltros}
        aoRemoverFiltro={handleRemoverFiltro}
        nFiltrado={nFiltrado}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {abaAtiva === 'visao_geral' && (
          <PageVisaoGeral
            dados={dadosVisaoGeral}
            carregando={carregando}
            aoNavegarAba={setAbaAtiva}
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
      </main>

      {/* Rodapé Institucional */}
      <footer className="bg-[#0e162b] border-t border-[#1f2d4e] mt-12 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-200">
              Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Sul (IFRS)
            </span>
            <div className="text-[11px] text-teal-400/80 mt-0.5">
              Assessoria de Gênero e Sexualidade
            </div>
          </div>
        </div>
      </footer>

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
