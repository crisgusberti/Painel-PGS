/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.clgxxutckeftsqpvzjcx:smqn7TNGDJ_w!8a@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';

let poolInstance: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  if (!poolInstance) {
    poolInstance = new pg.Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      // Configuração para transaction pooler (porta 6543)
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000,
      statement_timeout: 8000, // 8 segundos conforme especificação 2.2
    });

    poolInstance.on('error', (err) => {
      console.error('Erro inesperado no cliente de conexão PostgreSQL:', err);
    });
  }

  return poolInstance;
}

export async function testDbConnection(): Promise<{ ok: boolean; count?: number; error?: string }> {
  try {
    const pool = getDbPool();
    const result = await pool.query('SELECT count(*)::int as total FROM public.respostas_pgs');
    return { ok: true, count: result.rows[0]?.total ?? 0 };
  } catch (err: any) {
    console.error('Falha ao conectar no banco Supabase:', err);
    return { ok: false, error: err?.message || String(err) };
  }
}
