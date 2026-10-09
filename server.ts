/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import { fileURLToPath } from 'url';
import app from './src/server/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Setup Vite Dev Middleware vs Static Files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      (await import('express')).default.static(path.resolve(__dirname, 'dist'), {
        dotfiles: 'ignore',
        index: false,
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor IFRS executando na porta ${PORT} (${isProd ? 'produção' : 'desenvolvimento'})`);
  });
}

export default app;
export { app };

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Falha ao iniciar o servidor:', err);
  });
}

