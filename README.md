# Painel Analítico do Diagnóstico de Gênero (IFRS)

Aplicação analítica do Diagnóstico Institucional de Gênero do Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Sul (IFRS).

## 1. Visão Geral e Arquitetura

- **Base de Dados:** Tabela `public.respostas_pgs` no Supabase PostgreSQL (4.878 respondentes validados).
- **Conexão:** Transaction Pooler (porta 6543) com pool `pg` e `statement_timeout` de 8 segundos.
- **Frontend:** React, TypeScript, Tailwind CSS, Apache ECharts (`echarts-for-react`), `@dnd-kit/core`, Lucide Icons.
- **Backend:** Express integrado com Vite e motor de consultas dinâmicas seguro (`consultaEngine.ts`) com validação via Zod e catálogo em whitelist.
- **Segurança e Ética:** Campos de texto livre (`*_texto`) jamais são consultados ou exibidos. Rate limit de requisições por IP e proteção estrita contra SQL injection.

## 2. Estrutura do Projeto

```
├── catalogo.ts              # Fonte única de verdade de campos, escalas e metadados
├── areaMap.ts               # Mapeamento determinístico de 181 textos de área para o CNPq
├── escalas.ts               # Mapas de pontuação Likert, Shannon e normalização (0 a 100)
├── server.ts                # Servidor Express com rotas de API e middleware Vite
├── src/
│   ├── server/
│   │   ├── db.ts            # Pooler de conexão PostgreSQL com Supabase
│   │   ├── consultaEngine.ts# Motor de consulta dinâmico com Zod e cache
│   │   └── dashboardStats.ts# Consultas consolidadas para as 6 páginas temáticas
│   ├── components/
│   │   ├── Navbar.tsx       # Navegação superior e contador de amostra
│   │   ├── FiltrosGlobaisModal.tsx # Drawer de filtros multidimensionais
│   │   ├── KpiCard.tsx      # Card de indicadores com n, base e metodologia
│   │   ├── ChartCard.tsx    # Gráficos acessíveis com exportação PNG e tabela
│   │   └── pages/           # 9 páginas completas da especificação
```

## 3. Como Executar Localmente

### Pré-requisitos
- Node.js >= 18
- npm ou pnpm

### Passos
1. Clone o repositório e instale as dependências:
```bash
npm install
```

2. Crie ou configure o arquivo `.env` com a string de conexão do Supabase (Transaction Pooler, porta 6543):
```env
DATABASE_URL="postgresql://postgres.<user>:<senha>@aws-1-sa-east-1.pooler.supabase.com:6543/postgres"
```

3. Inicie o servidor em modo de desenvolvimento:
```bash
npm run dev
```
O painel estará disponível em `http://localhost:3000`.

4. Para testar o build de produção:
```bash
npm run build
npm start
```

## 4. Deploy na Vercel

1. Importe o repositório na Vercel.
2. Adicione a variável de ambiente:
   - `DATABASE_URL`: URL do Transaction Pooler Supabase (porta 6543).
3. O comando de build é `npm run build` e o comando de saída é `dist`.
4. Devido ao uso do Transaction Pooler da Supabase na porta 6543, não há esgotamento de conexões em ambientes serverless.

## 5. Páginas Implementadas

1. **Visão Geral:** KPIs fundamentais (amostra, vínculos, taxa de vitimização, índice de clima, denúncias, cuidado) e distribuição por campus.
2. **Perfil e Representatividade:** Caracterização demográfica, Shannon Diversity Index, pluralidade e cortes censitários.
3. **Carreira e Gestão:** Funil de liderança de servidores, proporção de mulheres e negros em gestão, avaliação do mérito (Q22) e acesso a bolsas (Q23).
4. **Clima e Violências:** Diagrama divergente Likert (Q24a–f com item de maternidade invertido), taxas diretas de racismo e violência de gênero, vitimização interseccional e funil de denúncia.
5. **Núcleos e Políticas:** Avaliação do NAAF, NEABI, NEPG e Assessorias, heatmap de qualidade e desconhecimento institucional.
6. **Cuidado e Parentalidade:** Responsabilidade de cuidado, percepção de licenças, estudantes com filhos e impacto na carreira.
7. **Áreas e STEM:** Participação feminina por Grande Área CNPq, diversidade racial e comparativo de desencorajamento em STEM.
8. **Construtor Dinâmico:** Ferramenta interativa de cruzamento multidimensional com medidas, filtros, exportação CSV/PNG e persistência local.
9. **Metodologia e Dicionário:** Documentação completa das fórmulas, notas amostrais e dicionário de variáveis.
