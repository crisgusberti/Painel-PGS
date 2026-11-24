/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import { testDbConnection, getDbPool } from './db';
import { CATALOGO_CAMPOS } from '../lib/catalogo';
import { RequisicaoConsultaSchema, executarConsulta } from './consultaEngine';
import {
  obterKpisVisaoGeral,
  obterDadosPerfil,
  obterDadosCarreira,
  obterDadosAmbienteViolencias,
  obterDadosNucleos,
  obterDadosCuidado,
  obterDadosStem,
} from './dashboardStats';

const app = express();

// 1. Ocultar cabeçalho do servidor Express para dificultar fingerprinting tecnológico
app.disable('x-powered-by');

// 2. Proteção estrita contra vazamento de arquivos ocultos e de versionamento (.git, .env, etc.)
app.use((req, res, next) => {
  let decodedPath = req.path;
  try {
    decodedPath = decodeURIComponent(req.path);
  } catch {
    res.status(400).send('Bad Request');
    return;
  }

  // Bloqueia acesso a arquivos confidenciais (.git, .env, etc.) sem bloquear caches de ferramentas como /node_modules/.vite
  if (/(?:^|\/)\.(git|env|htaccess|htpasswd|svn|hg|DS_Store|bash|ssh)/i.test(decodedPath)) {
    res.status(404).send('Not Found');
    return;
  }
  next();
});

// 3. Cabeçalhos de Segurança HTTP (Defense-in-Depth / OWASP)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json({ limit: '1mb' }));

// Middleware de Limite de Requisições por IP com limpeza periódica de memória
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_WINDOW = 60 * 1000;

// Limpeza de IPs expirados a cada 5 minutos para evitar acúmulo de memória
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, item] of rateLimitMap.entries()) {
      if (now > item.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let clientData = rateLimitMap.get(ip);

  if (!clientData || now > clientData.resetTime) {
    clientData = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitMap.set(ip, clientData);
  } else {
    clientData.count++;
  }

  if (clientData.count > RATE_LIMIT_MAX) {
    res.status(429).json({
      error: 'Limite de requisições excedido. Por favor, aguarde alguns instantes.',
    });
    return;
  }

  next();
}

app.use(rateLimiter);

const apiRouter = express.Router();

// 1. Rota de Saúde
apiRouter.get('/saude', async (_req: Request, res: Response) => {
  const status = await testDbConnection();
  if (status.ok) {
    res.json({
      status: 'ok',
      banco: 'Supabase PostgreSQL (Transaction Pooler)',
      tabela: 'public.respostas_pgs',
      total_linhas: status.count,
    });
  } else {
    res.status(500).json({
      status: 'erro',
      mensagem: status.error,
    });
  }
});

// 2. Rota do Catálogo
apiRouter.get('/catalogo', (_req: Request, res: Response) => {
  res.json({ catalogo: CATALOGO_CAMPOS });
});

// 3. Rota de Opções para Filtros
let opcoesFiltrosCache: any = null;
apiRouter.get('/filtros-opcoes', async (_req: Request, res: Response) => {
  if (opcoesFiltrosCache) {
    res.json(opcoesFiltrosCache);
    return;
  }
  try {
    const pool = getDbPool();
    const [campusRes, corRes, faixaRes, orientacaoRes] = await Promise.all([
      pool.query("SELECT DISTINCT campus FROM public.respostas_pgs WHERE campus IS NOT NULL AND campus != 'Prefiro não responder' ORDER BY campus"),
      pool.query('SELECT DISTINCT cor_raca FROM public.respostas_pgs WHERE cor_raca IS NOT NULL ORDER BY cor_raca'),
      pool.query('SELECT DISTINCT faixa_etaria FROM public.respostas_pgs WHERE faixa_etaria IS NOT NULL ORDER BY faixa_etaria'),
      pool.query('SELECT DISTINCT orientacao_sexual FROM public.respostas_pgs WHERE orientacao_sexual IS NOT NULL ORDER BY orientacao_sexual'),
    ]);

    opcoesFiltrosCache = {
      campus: campusRes.rows.map((r) => r.campus),
      cor_raca: corRes.rows.map((r) => r.cor_raca),
      faixa_etaria: faixaRes.rows.map((r) => r.faixa_etaria),
      orientacao_sexual: [
        'Heterossexual',
        'Bissexual',
        'Homossexual (Gay/Lésbica)',
        'Pansexual',
        'Assexual',
        'Demissexual',
        'Prefiro não responder',
      ],
      vinculo: [
        'Discente (estudante)',
        'Docente (professor/a) ou Técnico-Administrativo em Educação (TAE) Efetivo',
        'Docente (professor/a) Substituto',

        'Prefiro não responder',
      ],
      genero_agrupado: ['Mulher', 'Homem', 'Mulher Trans', 'Homem Trans', 'Travesti', 'Não-binários'],
      pcd: ['Sim', 'Não', 'Prefiro não responder'],
      responsabilidade_cuidado: [
        'Sim',
        'Não',
        'Divido a responsabilidade igualmente com outra(s) pessoa(s)',
        'Não tenho responsabilidade de cuidado sobre ninguém',
        'Prefiro não responder',
      ],
      ocupa_cargo_gestao: ['Sim', 'Não', 'Prefiro não responder'],
    };

    res.json(opcoesFiltrosCache);
  } catch (err: any) {
    console.error('Erro ao buscar opções de filtros:', err);
    res.status(500).json({ error: 'Erro ao carregar opções de filtros' });
  }
});

// 4. Rota do Motor de Consulta Dinâmica
apiRouter.post('/consulta', async (req: Request, res: Response) => {
  try {
    const validacao = RequisicaoConsultaSchema.safeParse(req.body);
    if (!validacao.success) {
      res.status(400).json({
        erro: 'Parâmetros de consulta inválidos.',
        detalhes: validacao.error.issues,
      });
      return;
    }

    const resultado = await executarConsulta(validacao.data);
    res.json(resultado);
  } catch (err: any) {
    console.error('Erro na rota /api/consulta:', err);
    res.status(500).json({
      erro: 'Não foi possível processar a consulta.',
    });
  }
});

// 5. Rotas de Páginas Analíticas
apiRouter.post('/visao-geral', async (req: Request, res: Response) => {
  try {
    const dados = await obterKpisVisaoGeral(req.body.filtros);
    res.json(dados);
  } catch (err: any) {
    console.error('Erro na rota /api/visao-geral:', err);
    res.status(500).json({ erro: 'Erro ao carregar dados de visão geral' });
  }
});

apiRouter.post('/perfil', async (req: Request, res: Response) => {
  try {
    const dados = await obterDadosPerfil(req.body.filtros);
    res.json(dados);
  } catch (err: any) {
    console.error('Erro na rota /api/perfil:', err);
    res.status(500).json({ erro: 'Erro ao carregar perfil' });
  }
});

apiRouter.post('/carreira', async (req: Request, res: Response) => {
  try {
    const dados = await obterDadosCarreira(req.body.filtros);
    res.json(dados);
  } catch (err: any) {
    console.error('Erro na rota /api/carreira:', err);
    res.status(500).json({ erro: 'Erro ao carregar carreira' });
  }
});

apiRouter.post('/ambiente-violencias', async (req: Request, res: Response) => {
  try {
    const dados = await obterDadosAmbienteViolencias(req.body.filtros);
    res.json(dados);
  } catch (err: any) {
    console.error('Erro na rota /api/ambiente-violencias:', err);
    res.status(500).json({ erro: 'Erro ao carregar ambiente e violências' });
  }
});

apiRouter.post('/nucleos', async (req: Request, res: Response) => {
  try {
    const dados = await obterDadosNucleos(req.body.filtros);
    res.json(dados);
  } catch (err: any) {
    console.error('Erro na rota /api/nucleos:', err);
    res.status(500).json({ erro: 'Erro ao carregar núcleos' });
  }
});

apiRouter.post('/cuidado', async (req: Request, res: Response) => {
  try {
    const dados = await obterDadosCuidado(req.body.filtros);
    res.json(dados);
  } catch (err: any) {
    console.error('Erro na rota /api/cuidado:', err);
    res.status(500).json({ erro: 'Erro ao carregar dados de cuidado' });
  }
});

apiRouter.post('/stem', async (req: Request, res: Response) => {
  try {
    const dados = await obterDadosStem(req.body.filtros);
    res.json(dados);
  } catch (err: any) {
    console.error('Erro na rota /api/stem:', err);
    res.status(500).json({ erro: 'Erro ao carregar dados de STEM' });
  }
});

// Suporta requisições tanto com prefixo /api quanto sem ele (para compatibilidade com qualquer rewrite no Vercel)
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
export { app };
