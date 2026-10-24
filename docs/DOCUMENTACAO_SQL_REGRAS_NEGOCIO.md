# Documentação Técnica: Consultas SQL, Indicadores e Regras de Negócio — Painel PGS (IFRS)

Este documento compila de forma hierárquica **todas as consultas SQL**, **regras de negócio**, **normalizações**, **escalas** e **fórmulas** utilizadas pelo Painel Analítico do Diagnóstico Institucional de Gênero e Sexualidade do IFRS.

Serve como guia de referência rápida para identificar exatamente **qual consulta SQL e qual regra de cálculo montam cada KPI, Gráfico ou Tabela** em cada aba do painel.

---

## Sumário

1. [Arquitetura da Base de Dados e Segurança](#1-arquitetura-da-base-de-dados-e-segurança)
2. [Regras de Negócio Globais, Normalizações e Fórmulas](#2-regras-de-negócio-globais-normalizações-e-fórmulas)
   - [2.1. Regra de Ouro Oficial: Normalização e Classificação de Gênero (`SQL_GENERO_NORMALIZADO`)](#21-regra-de-ouro-oficial-normalização-e-classificação-de-gênero-sql_genero_normalizado)
   - [2.2. Normalização de Vínculo Institucional e Segmentos Funcionais](#22-normalização-de-vínculo-institucional-e-segmentos-funcionais)
   - [2.3. Agrupamento Étnico-Racial (Pessoas Negras)](#23-agrupamento-étnico-racial-pessoas-negras)
   - [2.4. Escalas Likert, Pontuações e Inversão de Polo (Q24d)](#24-escalas-likert-pontuações-e-inversão-de-polo-q24d)
   - [2.5. Fórmulas de Índices Sintéticos (Clima 0–100 e Shannon)](#25-fórmulas-de-índices-sintéticos-clima-0100-e-shannon)
   - [2.6. Normalização de Grandes Áreas (CNPq) e Classificação STEM](#26-normalização-de-grandes-áreas-cnpq-e-classificação-stem)
   - [2.7. Regras de Denominadores, Cortes de Privacidade e Amostra Pequena](#27-regras-de-denominadores-cortes-de-privacidade-e-amostra-pequena)
   - [2.8. Motor de Filtros Globais (`montarWhereFiltrosGlobais`)](#28-motor-de-filtros-globais-montarwherefiltrosglobais)
3. [Catálogo Hierárquico de Consultas SQL por Aba do Painel](#3-catálogo-hierárquico-de-consultas-sql-por-aba-do-painel)
   - [Rotas Auxiliares (`/api/saude` e `/api/filtros-opcoes`)](#rotas-auxiliares-apisaude-e-apifiltros-opcoes)
   - [Aba 0: Visão Geral (`/api/visao-geral`)](#aba-0-visão-geral-apivisao-geral)
   - [Aba 1: Perfil e Representatividade (`/api/perfil`)](#aba-1-perfil-e-representatividade-apiperfil)
   - [Aba 2: Carreira, Progressão e Equidade (`/api/carreira`)](#aba-2-carreira-progressão-e-equidade-apicarreira)
   - [Aba 3: Ambiente, Segurança, Clima e Violências (`/api/ambiente-violencias`)](#aba-3-ambiente-segurança-clima-e-violências-apiambiente-violencias)
   - [Aba 4: Núcleos, Assessorias e Políticas (`/api/nucleos`)](#aba-4-núcleos-assessorias-e-políticas-apinucleos)
   - [Aba 5: Cuidado, Parentalidade e Permanência (`/api/cuidado`)](#aba-5-cuidado-parentalidade-e-permanência-apicuidado)
   - [Aba 6: STEM e Masculinização das Áreas (`/api/stem`)](#aba-6-stem-e-masculinização-das-áreas-apistem)
   - [Aba 7: Construtor Dinâmico (`/api/consulta`)](#aba-7-construtor-dinâmico-apiconsulta)

---

## 1. Arquitetura da Base de Dados e Segurança

- **Tabela Única:** `public.respostas_pgs` (hospedada no Supabase PostgreSQL).
- **Universo Analítico Oficial (`n_total`):** `4.857` respondentes (extraídos de `4.878` registros brutos após a exclusão global de `21` registros de trabalhadores terceirizados via `SQL_FILTRO_SEM_TERCEIRIZADOS`), sendo `4.790` com identidade de gênero válida dentro das 6 categorias oficiais.
- **Conexão ([`src/server/db.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/db.ts)):** Pool `pg` conectado via Supabase Transaction Pooler (porta `6543`), `max: 10` conexões, `statement_timeout: 8000` (8 segundos).
- **Proteção Ética e de Dados:**
  - Nenhuma coluna de relato aberto (`*_texto`) consta no catálogo ([`src/lib/catalogo.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/lib/catalogo.ts)) nem é consultada por qualquer SQL.
  - Todas as consultas dinâmicas utilizam *whitelist* estrita validada via Zod (`CAMPOS_PERMITIDOS_CONSULTA`) e *placeholders* parametrizados (`\$1, \$2...`) contra SQL Injection.

---

## 2. Regras de Negócio Globais, Normalizações e Fórmulas

### 2.0. Exclusão Global de Trabalhadores Terceirizados (`SQL_FILTRO_SEM_TERCEIRIZADOS`)

Definido em [`src/lib/escalas.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/lib/escalas.ts) e injetado automaticamente em `montarWhereFiltrosGlobais` ([`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)) e em `executarConsultaDinamica` ([`src/server/consultaEngine.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/consultaEngine.ts)):
```sql
(
  (vinculo IS NULL OR vinculo NOT ILIKE '%Terceirizado%')
  AND (cargo IS NULL OR cargo NOT ILIKE '%Terceirizado%')
)
```
Isso remove integralmente os **21 registros** de terceirizados (`20` com `vinculo = 'Terceirizado'` e `1` com `vinculo = '...Efetivo'` e `cargo = 'Terceirizado'`), fixando o universo do painel em **4.857 respondentes**.

---

### 2.1. Regra de Ouro Oficial: Normalização e Classificação de Gênero (`SQL_GENERO_NORMALIZADO`)

Todas as consultas SQL do painel, filtros globais e o Construtor Dinâmico utilizam um **único parâmetro centralizado** definido em [`src/lib/escalas.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/lib/escalas.ts) (`SQL_GENERO_NORMALIZADO` e `CATEGORIAS_GENERO_OFICIAIS`). Nenhum gráfico classifica gêneros de forma diferente.

Entre os **4.857 respondentes analisados** (sem terceirizados), as respostas na coluna `genero` são mapeadas estritamente nas **6 categorias oficiais** (`4.790` respostas válidas = `98,62%`), enquanto `'Prefiro não responder'` (`53`) e respostas inválidas/orientação sexual/zombeteiras (`14`) retornam `NULL` (`67` registros = `1,38%`) e são filtradas via `AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL` em todos os gráficos e recortes de gênero:

```sql
CASE
  WHEN genero IS NULL OR TRIM(genero) = '' OR genero = 'Prefiro não responder' THEN NULL
  WHEN genero ILIKE '%travesti%' THEN 'Travesti'
  WHEN genero ILIKE '%transmasculino%'
    OR (genero ILIKE '%homem%' AND genero ILIKE '%trans%') THEN 'Homem Trans'
  WHEN genero ILIKE '%mulher%' AND genero ILIKE '%trans%' THEN 'Mulher Trans'
  WHEN genero ILIKE '%não-binário%'
    OR genero ILIKE '%nao-binario%'
    OR genero ILIKE '%agênero%'
    OR genero ILIKE '%agenero%'
    OR genero ILIKE '%fluido%'
    OR genero ILIKE '%fluído%'
    OR genero ILIKE '%demigirl%'
    OR genero ILIKE '%demi%'
    OR genero ILIKE '%alexigênero%'
    OR genero ILIKE '%alexigenero%'
    OR genero ILIKE '%pangênero%'
    OR genero ILIKE '%pangenero%'
    OR genero ILIKE '%multigênero%' THEN 'Não-binárias'
  WHEN genero ILIKE '%mulher%' OR genero ILIKE '%femin%' THEN 'Mulher'
  WHEN genero ILIKE '%homem%'
    OR genero ILIKE '%masculin%'
    OR genero ILIKE '%cromossomo%xy%' THEN 'Homem'
  ELSE NULL
END
```

| Categoria Oficial (`CATEGORIAS_GENERO_OFICIAIS`) | Total (`n`) | % Total (`4.857`) | % Válidos (`4.790`) | Respostas Originais Mapeadas (sem terceirizados) |
| :--- | :---: | :---: | :---: | :--- |
| **`Mulher`** | **2.650** | 54,56% | 55,32% | `Mulher (cisgênero)` (2.639), `Mulher` (6), `Mulher `, `Mulher, `, `Mulher, hétero.`, `Mulher negra, mas não sei porque tantos rótulos`, `FEMINIMO` |
| **`Homem`** | **1.989** | 40,95% | 41,52% | `Homem (cisgênero)` (1.969), `Homem` (3), `homem` (1), `Homem ` (3), `Masculino ` (2), `Apenas HOMEM`, `Homem bagual`, `Homem biológico`, `Homem hétero`, `Homem Macho alpha`, `Homem normal`, `Homem normal `, `Homem, até onde eu sabia...`, `O biologicamente correto, homem cisgênero`, `Possuo cromossomos XY (masculino)...`, `Sexo masculino ` |
| **`Mulher Trans`** | **25** | 0,51% | 0,52% | `Mulher (transgênero)` (25) |
| **`Homem Trans`** | **40** | 0,82% | 0,84% | `Homem (transgênero)` (39), `Transmasculino` (1) |
| **`Travesti`** | **6** | 0,12% | 0,13% | `Travesti` (6) |
| **`Não-binárias`** | **80** | 1,65% | 1,67% | `Não-binário` (71), `Agênero` (2), `Gênero Fluido` (1), `Genero fluído ` (1), `Gênero fluído` (1), `Gênero fluido` (1), `Demigirl` (1), `Alexigênero` (1), `Pangênero` (1) |
| **`NULL` (Desconsideradas em gráficos de gênero)** | **67** | 1,38% | — | `Prefiro não responder` (53) + 14 respostas inválidas (`Hetero` [2], `Bissexual`, `gay`, `sapatão`, `Acho o genero totalmente desnecessário`, `Não tenho gênero...`, `Geladeira Frost Free`, `Jedi`, `Me identifico como um jegue`, `Normal`, `Patrola`, `sem gênero com pênis`, `tio paulo`) |

---

### 2.1.B. Normalização de Orientação Sexual (`SQL_ORIENTACAO_NORMALIZADA`)

Definida em [`src/lib/escalas.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/lib/escalas.ts), consolida variantes ortográficas (como `Demisexual` + `Demissexual`) e respostas equivalentes livres:
```sql
CASE
  WHEN orientacao_sexual IS NULL OR TRIM(orientacao_sexual) = '' THEN NULL
  WHEN orientacao_sexual = 'Prefiro não responder' THEN 'Prefiro não responder'
  WHEN orientacao_sexual ILIKE '%hetero%'
    OR orientacao_sexual ILIKE '%hétero%'
    OR TRIM(LOWER(orientacao_sexual)) IN ('normal', 'homem', 'mulher') THEN 'Heterossexual'
  WHEN orientacao_sexual ILIKE '%bissexual%'
    OR TRIM(LOWER(orientacao_sexual)) = 'bi'
    OR orientacao_sexual ILIKE '%bicurioso%' THEN 'Bissexual'
  WHEN orientacao_sexual ILIKE '%homossexual%' THEN 'Homossexual'
  WHEN orientacao_sexual ILIKE '%pansexual%'
    OR orientacao_sexual ILIKE '%panssexual%'
    OR orientacao_sexual ILIKE '%panrom%' THEN 'Pansexual'
  WHEN orientacao_sexual ILIKE '%assexual%'
    OR orientacao_sexual ILIKE '%arrom%'
    OR orientacao_sexual ILIKE '%ace %' THEN 'Assexual'
  WHEN orientacao_sexual ILIKE '%demissexual%'
    OR orientacao_sexual ILIKE '%demisexual%' THEN 'Demissexual'
  WHEN orientacao_sexual ILIKE '%queer%' THEN 'Queer'
  ELSE 'Outra / Não especificada'
END
```

---

### 2.2. Normalização de Vínculo Institucional e Segmentos Funcionais

#### A) Vínculo Detalhado no Gráfico de Campus (`vinculo_simplificado` na Aba 0)
Separa os servidores efetivos em **Docentes** e **Técnicos TAEs** (excluindo `'Prefiro não responder'` do eixo de unidades para exibir estritamente as **18 unidades** = 17 campi + Reitoria):
```sql
CASE
  WHEN vinculo ILIKE '%Discente%' THEN 'Discente'
  WHEN vinculo ILIKE '%Substituto%' THEN 'Docente Substituto'
  WHEN vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%' THEN 'Docente'
  WHEN vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%') THEN 'Técnico TAE'
  WHEN vinculo ILIKE '%Efetivo%' THEN 'Servidor Efetivo (Sem cargo)'
  ELSE 'Não informado'
END
```

#### B) Segmento da Comunidade na Aba 1 (`SQL_SEGMENTO_COMUNIDADE`: Geral | Docente | Técnico TAE | Discente)
Usado nos seletores individuais de todos os gráficos da **Aba 1 (Perfil Demográfico)**:
```sql
CASE
  WHEN vinculo ILIKE '%Discente%' THEN 'discente'
  WHEN vinculo ILIKE '%Substituto%' OR cargo ILIKE '%Docente%' THEN 'docente'
  WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnico_tae'
  ELSE 'outro'
END
```

#### C) Segmento de Carreira (`segmento`: Docentes vs Técnicos TAE)
Usado nos seletores internos (`Geral | Docentes | Técnicos (TAE)`) das abas **Carreira (Aba 2)**, **Ambiente (Aba 3)** e **Cuidado (Aba 5)** a partir da coluna `cargo`:
```sql
CASE
  WHEN cargo ILIKE '%Docente%' THEN 'docentes'
  WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
  -- Na Aba 3 (Ambiente), inclui também: WHEN vinculo ILIKE '%Discente%' THEN 'discentes'
  ELSE 'outro'
END
```

#### D) Regra de Restrição de Base na Aba 2 (Carreira)
Na função `obterDadosCarreira` ([`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)), o filtro de vínculo é **forçado** para incluir apenas servidores:
```ts
const baseFiltros: FiltrosGlobaisState = {
  ...filtros,
  vinculo: ['Docente', 'Efetivo', 'Substituto'],
};
```
Isso gera `WHERE ... AND (vinculo ILIKE '%Docente%' OR vinculo ILIKE '%Efetivo%' OR vinculo ILIKE '%Substituto%')`, garantindo que **Discentes e Terceirizados sejam sempre excluídos** das estatísticas de carreira e gestão.

---

### 2.3. Agrupamento Étnico-Racial (Pessoas Negras)

Seguindo o critério do IBGE e do Estatuto da Igualdade Racial:
- **Pessoa Negra:** Soma das autodeclarações **`Preta`** + **`Parda`** (`cor_raca IN ('Preta', 'Parda')`).
- Usado no KPI **"Pessoas Negras em Gestão"** (Aba 2) e no cálculo de `pct_negros` por Grande Área na **Aba 6 (STEM)**.

---

### 2.4. Escalas Likert, Pontuações e Inversão de Polo (Q24d)

Definidas em [`src/lib/escalas.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/lib/escalas.ts):

| Questão / Dimensão | Categorias e Pesos Numéricos | Categorias Excluídas da Média (`NULL`) |
| :--- | :--- | :--- |
| **Clima Institucional (Q24a, b, c, e, f)** | `Concordo Totalmente` = **5**<br>`Concordo` = **4**<br>`Não concordo nem discordo` = **3**<br>`Discordo` = **2**<br>`Discordo Totalmente` = **1** | `N/A - Não sei avaliar` |
| **Maternidade e Carreira (Q24d — INVERTIDO)** | `Concordo Totalmente` = **1**<br>`Concordo` = **2**<br>`Não concordo nem discordo` = **3**<br>`Discordo` = **4**<br>`Discordo Totalmente` = **5** | `N/A - Não sei avaliar` |
| **Qualidade dos Núcleos (Q29a–f)** | `Muito Boa` = **5**<br>`Boa` = **4**<br>`Regular` = **3**<br>`Ruim` = **2**<br>`Muito Ruim` = **1** | `Não conheço` |
| **Efetividade de Denúncias (Q26)** | `Sim, são muito efetivos` = **5**<br>`São parcialmente efetivos` = **3**<br>`São pouco efetivos` = **2**<br>`Não são efetivos` = **1** | `Não sei avaliar`, `Prefiro não responder` |
| **Resultados Justos (Q27)** | `Sim, geram resultados justos` = **4**<br>`Sim, geram resultados parcialmente justos` = **3**<br>`Sim, geram poucos resultados justos` = **2**<br>`Não geram resultados justos` = **1** | `Não sei avaliar`, `Prefiro não responder` |
| **Acesso a Oportunidades (Q23)** | `Muito equitativo` = **5**<br>`Equitativo` = **4**<br>`Pouco equitativo` = **2**<br>`Nada equitativo` = **1** | `Não sei avaliar`, `Prefiro não responder` |
| **Progressão por Mérito (Q22)** | Valor numérico direto no banco: **1 a 5** | `NULL` |

> [!WARNING]
> **Regra Crítica do Item Invertido (`Q24d - maternidade_impacto_carreira`):**
> A frase afirma *"A maternidade/paternidade é vista como um fator que pode impactar negativamente a carreira..."*. Portanto, **concordar com a frase representa um diagnóstico negativo de clima**.
> - No cálculo do **Índice de Clima (Visão Geral)**, a pontuação é **invertida** (`Concordo Totalmente = 1`, `Discordo Totalmente = 5`) para que todas as 6 dimensões apontem na mesma direção (quanto maior a nota, melhor o clima).
> - Já no **Construtor Dinâmico (`consultaEngine.ts`)**, `ESCALA_CONCORDANCIA_Q24` padrão é utilizada caso o usuário peça a média isolada de `maternidade_impacto_carreira` (onde 5 = concorda totalmente com o impacto negativo).

---

### 2.5. Fórmulas de Índices Sintéticos (Clima 0–100 e Shannon)

1. **Índice de Convivência e Clima Institucional (0 a 100):**
   - Calcula-se a média simples das 6 médias das questões `Q24a`, `Q24b`, `Q24c`, `Q24d (invertida)`, `Q24e`, `Q24f`:
     $$\text{climaMedia} = \frac{\bar{Q}_{24a} + \bar{Q}_{24b} + \bar{Q}_{24c} + \bar{Q}_{24d\_inv} + \bar{Q}_{24e} + \bar{Q}_{24f}}{6}$$
   - Em seguida, normaliza-se da escala `[1, 5]` para `[0, 100]` via `normalizarIndice100`:
     $$\text{Índice Clima} = \left(\frac{\text{climaMedia} - 1}{5 - 1}\right) \times 100$$

2. **Índice de Diversidade de Shannon Normalizado ($H' \in [0, 100]$):**
   - Na **Aba 1 (Perfil)**, mede a equitabilidade da distribuição entre os vínculos (`Discente`, `Servidor Efetivo`, `Docente Substituto`, `Terceirizado`) dentro de cada campus, e depois extrai a média aritmética entre os campi:
     $$H' = \left(\frac{-\sum_{i=1}^{k} p_i \ln(p_i)}{\ln(k)}\right) \times 100$$
     onde $p_i = \frac{n_i}{N_{\text{campus}}}$ e $k$ é o número de categorias com $n_i > 0$ no campus.

---

### 2.6. Normalização de Grandes Áreas (CNPq) e Classificação STEM

- **Definição de STEM:** Pertencem ao grupo **STEM** exclusivamente as Grandes Áreas:
  1. `Engenharias e Tecnologia`
  2. `Ciências Exatas e da Terra`
- **Duas camadas de normalização de `area_conhecimento`:**
  1. **Na Aba 6 (STEM — `obterDadosStem`):** A consulta SQL traz o texto bruto de `area_conhecimento` e o backend aplica o dicionário determinístico `MAPA_TEXTOS_AREA` ([`src/lib/areaMap.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/lib/areaMap.ts)) com ~150 termos mapeados exatamente em minúsculas (`MAPA_TEXTOS_AREA[raw.toLowerCase()] || 'Não classificada'`).
  2. **Nos Filtros Globais (`montarWhereFiltrosGlobais`) e no Construtor Dinâmico (`consultaEngine.ts`):** A normalização é feita diretamente em SQL via `CASE WHEN area_conhecimento ILIKE ...` buscando palavras-chave por substring (ex.: `%engenharia%`, `%computa%`, `%inform%`, `%exata%`, `%química%`, etc.).

---

### 2.7. Regras de Denominadores, Cortes de Privacidade e Amostra Pequena

1. **Denominadores Distintos nos KPIs da Visão Geral:**
   - **Sobre o Total da Amostra Filtrada (`n`):** % Discentes, % Servidores Efetivos, Taxa de Vitimização (Raça ou Gênero), Conhece Canais de Denúncia (`= 'Sim'`), Responsabilidade Principal de Cuidado (`= 'Sim'`).
   - **Sobre Subconjunto de Respostas Válidas:**
     - **Efetividade dos Canais de Denúncia:** Numerador = `mecanismos_efetivos IN ('Sim, são muito efetivos', 'São parcialmente efetivos')`; Denominador = `mecanismos_efetivos IS NOT NULL` (quem efetivamente respondeu à pergunta Q26).
     - **Desencorajamento na Participação Acadêmica:** Numerador = Discentes com `desencorajado_participacao IN ('Sim, algumas vezes', 'Sim, frequentemente')`; Denominador = Discentes com `desencorajado_participacao IS NOT NULL`.
2. **Denominador nos Gráficos de Gênero:**
   - Todos os gráficos que filtram ou segmentam por gênero consideram estritamente as 6 categorias oficiais (`(${SQL_GENERO_NORMALIZADO}) IS NOT NULL`, `n = 4.811` na base completa), excluindo `'Prefiro não responder'` e respostas invalidadas/zombeteiras.
3. **Sinalização de Amostra Pequena (`n < 10`):**
   - Na **Matriz Interseccional (Aba 3)** e no **Construtor Dinâmico (Aba 7)**, qualquer célula ou categoria com $0 < n < 10$ recebe o alerta `"amostra pequena (n < 10)"`.

---

### 2.8. Motor de Filtros Globais (`montarWhereFiltrosGlobais`)

Definido em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts#L31-L82). Todas as abas (exceto o Construtor Dinâmico, que possui filtros próprios) recebem `filtros` no corpo do `POST` e injetam `${whereSql}` com combinação `AND`:

- `campus`, `cor_raca`, `faixa_etaria`, `pcd`, `orientacao_sexual`, `ocupa_cargo_gestao`, `responsabilidade_cuidado` $\rightarrow$ `coluna IN (\$1, \$2, ...)`
- `vinculo` $\rightarrow$ `(vinculo ILIKE \$1 OR vinculo ILIKE \$2 ...)` com curingas `%valor%`
- `genero_agrupado` e `genero_detalhado` $\rightarrow$ aplica `${SQL_GENERO_NORMALIZADO} IN (\$1, \$2, ...)` (Seção 2.1)
- `area_stem` (`'stem'` ou `'nao_stem'`) $\rightarrow$ aplica `CASE WHEN` de `area_conhecimento` filtrando `IN ('Engenharias e Tecnologia', 'Ciências Exatas e da Terra')` ou `NOT IN`.

---

## 3. Catálogo Hierárquico de Consultas SQL por Aba do Painel

### Rotas Auxiliares (`/api/saude` e `/api/filtros-opcoes`)

*Arquivos:* [`src/server/db.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/db.ts) e [`src/server/app.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/app.ts)

#### 1. Health Check (`GET /api/saude`)
Verifica a conectividade com o Supabase e retorna o total de linhas da tabela:
```sql
SELECT count(*)::int as total FROM public.respostas_pgs;
```

#### 2. Opções do Modal de Filtros Globais (`GET /api/filtros-opcoes`)
Executa 4 consultas em paralelo na primeira chamada (e armazena o resultado em cache em memória `opcoesFiltrosCache`), enquanto `genero_agrupado` retorna estritamente as 6 categorias oficiais `['Mulher', 'Homem', 'Mulher Trans', 'Homem Trans', 'Travesti', 'Não-binárias']`:
```sql
SELECT DISTINCT campus FROM public.respostas_pgs WHERE campus IS NOT NULL ORDER BY campus;
SELECT DISTINCT cor_raca FROM public.respostas_pgs WHERE cor_raca IS NOT NULL ORDER BY cor_raca;
SELECT DISTINCT faixa_etaria FROM public.respostas_pgs WHERE faixa_etaria IS NOT NULL ORDER BY faixa_etaria;
SELECT DISTINCT orientacao_sexual FROM public.respostas_pgs WHERE orientacao_sexual IS NOT NULL ORDER BY orientacao_sexual;
```

---

### Aba 0: Visão Geral (`POST /api/visao-geral`)

*Backend:* `obterKpisVisaoGeral` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)  
*Frontend:* [`src/components/pages/PageVisaoGeral.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageVisaoGeral.tsx)

#### Consulta 0.1 — Consolidação dos 8 KPI Cards da Visão Geral
- **Componentes Visuais alimentados:**
  1. **KPI Card "Total de Respondentes":** `total_respondentes` (`4.857`, distribuídos em **18 unidades** = 17 campi + Reitoria, sem contar `"Prefiro não responder"` no número de unidades e sem terceirizados).
  2. **KPI Card "Composição da Amostra":** `total_discentes / total_respondentes * 100` (`66,2%` discentes vs. `33,1%` servidores = `total_servidores_efetivos + total_substitutos`, detalhando `763` docentes efetivos, `679` técnicos TAEs e `151` docentes substitutos).
  3. **KPI Card "Ocorrência de Assédios e Violências":** `vitimizacao_sim / total_respondentes * 100` (`9,8%`, `474` respondentes: `337` por gênero/orientação e `198` por raça/cor).
  4. **KPI Card "Índice de Convivência e Clima Institucional":** Média das 6 colunas `media_q24a..f` (com `q24d` invertida) exibida em **porcentagem (`62,2%`)** com descrição pedagógica.
  5. **KPI Card "Conhece Canais de Denúncia":** Soma de `conhece_denuncia_sim` (`1.197`) + `conhece_denuncia_parcial` (`1.607`) = **`2.804` (`57,7%`)**, contra `conhece_denuncia_nao` (`1.433`) + `conhece_denuncia_nao_sei` (`544`) = **`1.977` (`40,7%`)**, exibindo explicitamente abaixo a divisão dessas quantidades.
  6. **KPI Card "Efetividade dos Canais de Denúncia":** Soma de `efetividade_muito` (`411`) + `efetividade_parcial` (`928`) = **`1.339` (`55,9%`)**, contra `efetividade_pouco` (`627`) + `efetividade_nao` (`428`) = **`1.055` (`44,1%`)**, exibindo explicitamente abaixo a divisão dessas quantidades sobre as respostas válidas (`base_efetividade = 2.394`).
  7. **KPI Card "Desencorajamento na Participação Acadêmica por Gênero, Raça, Orientação Sexual ou Outras Características":** `desencorajado_discentes / base_desencorajado_discentes * 100` (`13,0%`, `419` discentes), com o texto explicativo institucional completo.
  8. **KPI Card "Responsabilidade de Cuidado":** Soma de `cuidado_principal` (`Sim` = `786`, `16,2%`) + `cuidado_dividido` (`Sim, divido igualmente` = `938`, `19,3%`) = **`1.724` (`35,5%`)**, exibindo explicitamente abaixo a divisão dessas quantidades.

#### Consulta 0.2 — Distribuição por Campus e Vínculo Institucional (Separando Docentes e Técnicos TAEs)
- **Componente Visual alimentado:** Gráfico de barras horizontais empilhadas **"Distribuição de Respondentes por Campus e Vínculo Institucional"** (excluindo `'Prefiro não responder'` no campo `campus` e separando `'Servidor Efetivo'` em `'Docente'` e `'Técnico TAE'`).
```sql
SELECT
  campus,
  CASE
    WHEN vinculo ILIKE '%Discente%' THEN 'Discente'
    WHEN vinculo ILIKE '%Substituto%' THEN 'Docente Substituto'
    WHEN vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%' THEN 'Docente'
    WHEN vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%') THEN 'Técnico TAE'
    WHEN vinculo ILIKE '%Efetivo%' THEN 'Servidor Efetivo (Sem cargo)'
    ELSE 'Não informado'
  END as vinculo_simplificado,
  count(*)::int as total
FROM public.respostas_pgs
${whereComAnd(whereSql, "campus IS NOT NULL AND campus <> 'Prefiro não responder'")}
GROUP BY campus, vinculo_simplificado
ORDER BY campus ASC;
```

---

### Aba 1: Perfil Demográfico e Representatividade (`POST /api/perfil`)

*Backend:* `obterDadosPerfil` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)  
*Frontend:* [`src/components/pages/PagePerfil.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PagePerfil.tsx)

#### Consultas 1.1 a 1.5 — Distribuições Segmentadas por Categoria (`Geral | Docente | Técnico TAE | Discente`)
Todos os gráficos da Aba 1 possuem seletor individual por segmento (`SQL_SEGMENTO_COMUNIDADE`) e consomem consultas agrupadas por `categoria, segmento`:
1. **Identidade de Gênero Detalhada (`sqlGeneroNormalizado`):** Agrupado pelas **6 categorias oficiais** (`SQL_GENERO_NORMALIZADO`) e por `segmento`.
2. **Cor ou Raça (`cor_raca`):** Agrupado por `cor_raca` e `segmento`.
3. **Pirâmide / Distribuição Etária (`faixa_etaria`):** Agrupado por `faixa_etaria` e `segmento`.
4. **Pessoas com Deficiência — PCD (`pcd`):** Agrupado por `pcd` e `segmento`.
5. **Orientação Sexual (`sqlOrientacaoNormalizada`):** Agrupado por `${SQL_ORIENTACAO_NORMALIZADA}` (consolidando termos com grafia divergente como `Demisexual` + `Demissexual`) e por `segmento`.

---

### Aba 2: Carreira, Progressão e Equidade (`POST /api/carreira`)

*Backend:* `obterDadosCarreira` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)  
*Frontend:* [`src/components/pages/PageCarreira.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageCarreira.tsx)  
*Regra de Base:* Todas as consultas desta aba possuem filtro obrigatório `vinculo ILIKE '%Docente%' OR vinculo ILIKE '%Efetivo%' OR vinculo ILIKE '%Substituto%'` (além de `SQL_FILTRO_SEM_TERCEIRIZADOS`) e filtram gênero via `(${SQL_GENERO_NORMALIZADO}) IS NOT NULL`.

#### Consulta 2.1 — Composição de Servidores por Cargo e Gênero (`sqlFunilCargo`)
- **Componente Visual alimentado:** Gráfico **"Composição de Servidores por Cargo e Gênero"** (empilhado pelas 6 categorias oficiais de `SQL_GENERO_NORMALIZADO`, agrupando diretamente por `cargo, genero_grp` para contabilizar 100% dos servidores docentes e TAEs sem fragmentação).
```sql
SELECT
  cargo,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `cargo IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY cargo, genero_grp
ORDER BY cargo, genero_grp;
```

#### Consulta 2.2 — Proporção em Cargos de Gestão por Raça e Gênero (`sqlGestaoIntersec`)
- **Componentes Visuais alimentados:**
  1. **KPI Card "Servidores em Gestão (Total)":** Soma de `n` onde `ocupa_cargo_gestao === 'Sim'`.
  2. **KPI Card "Mulheres em Cargos de Gestão":** Soma de `n` onde `ocupa_cargo_gestao === 'Sim' AND (genero_grp === 'Mulher' OR genero_grp === 'Mulher Trans')` dividido pelo total de gestores.
  3. **KPI Card "Pessoas Negras em Gestão":** Soma de `n` onde `ocupa_cargo_gestao === 'Sim' AND raca_grp = 'Pessoa Negra (Preta/Parda)'` dividido pelo total de gestores.
```sql
SELECT
  ocupa_cargo_gestao,
  CASE
    WHEN cor_raca IN ('Preta', 'Parda') THEN 'Pessoa Negra (Preta/Parda)'
    WHEN cor_raca = 'Branca' THEN 'Branca'
    ELSE 'Outras / Não informado'
  END as raca_grp,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `ocupa_cargo_gestao IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY ocupa_cargo_gestao, raca_grp, genero_grp;
```

#### Consulta 2.3 — Tipologia de Função de Gestão (`sqlFuncaoGestao`)
- **Componente Visual alimentado:** Gráfico **"Tipologia de Função de Gestão (CD, FG, FCC)"** (com seletor `Geral | Docentes | Técnicos (TAE)` e séries pelas 6 categorias oficiais).
```sql
SELECT
  CASE
    WHEN funcao_gestao ILIKE '%CD%' THEN 'CD (Direção)'
    WHEN funcao_gestao ILIKE '%FG%' THEN 'FG (Gratificada)'
    WHEN funcao_gestao ILIKE '%FCC%' OR funcao_gestao ILIKE '%FUC%' THEN 'FCC/FUC (Coordenação)'
    WHEN funcao_gestao = 'Prefiro não responder' THEN 'Prefiro não responder'
    ELSE 'Outra / Não informado'
  END as funcao,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  CASE
    WHEN cargo ILIKE '%Docente%' THEN 'docentes'
    WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
    ELSE 'outro'
  END as segmento,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `funcao_gestao IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY funcao, genero_grp, segmento
ORDER BY n DESC;
```

#### Consultas 2.4 e 2.5 — Progressão por Mérito Q22 (`sqlProgressao` e `sqlProgressaoMedias`)
- **Componentes Visuais alimentados:**
  1. **KPI Card "Percepção de Justiça na Progressão":** Média ponderada de `sqlProgressaoMedias` (`media * n / sum(n)`).
  2. **Gráfico "Avaliação da Progressão por Mérito":**
     - *Regra de Aglutinação no Frontend:* Agrupa as notas numéricas (1 a 5) de `sqlProgressao` em 3 faixas: **Concordo** (`nota >= 4`), **Neutro** (`nota === 3`) e **Discordo** (`nota <= 2`).
     - *Visualização 100% Proporcional:*
       - **Modo Comparativo (3 Universos):** Barras verticais 100% empilhadas (0% a 100%) comparando `Geral`, `Docentes` e `Técnicos (TAE)`.
       - **Modo Detalhado por Categoria:** Barras horizontais 100% empilhadas (escala de 0% a 100%) para as 6 categorias oficiais de gênero, com rótulos `Categoria (n=X)` no eixo Y, alertas para amostra pequena ($n < 10$) e eliminação da distorção de tamanho decorrente do volume absoluto de respondentes.
```sql
-- 2.4 Distribuição das notas Q22
SELECT
  progressao_merito_nota as nota,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  CASE
    WHEN cargo ILIKE '%Docente%' THEN 'docentes'
    WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
    ELSE 'outro'
  END as segmento,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `progressao_merito_nota IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY progressao_merito_nota, genero_grp, segmento
ORDER BY progressao_merito_nota;

-- 2.5 Médias e Medianas Q22 por gênero e segmento
SELECT
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  CASE
    WHEN cargo ILIKE '%Docente%' THEN 'docentes'
    WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
    ELSE 'outro'
  END as segmento,
  round(avg(progressao_merito_nota::float)::numeric, 2)::float as media,
  round(percentile_cont(0.5) within group (order by progressao_merito_nota::float)::numeric, 2)::float as mediana,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `progressao_merito_nota IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY genero_grp, segmento;
```

#### Consulta 2.6 — Equidade no Acesso a Oportunidades e Bolsas Q23 (`sqlAcesso`)
- **Componente Visual alimentado:** Gráfico **"Equidade no Acesso a Oportunidades e Bolsas"**.
  - *Regra de Aglutinação no Frontend:* Agrupa as respostas em **Equitativo** (`'Muito equitativo'` + `'Equitativo'`), **Pouco ou nada equitativo** (`'Pouco equitativo'` + `'Nada equitativo'`) e **Não sei avaliar / Sem resposta**.
```sql
SELECT
  acesso_oportunidades,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  CASE
    WHEN cargo ILIKE '%Docente%' THEN 'docentes'
    WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
    ELSE 'outro'
  END as segmento,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `acesso_oportunidades IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY acesso_oportunidades, genero_grp, segmento
ORDER BY n DESC;
```

#### Consulta 2.7 — Cruzamento Responsabilidade de Cuidado × Evitou Candidatura à Gestão (`sqlEvitouCuidado`)
- **Componente Visual alimentado:** Bloco Integrado (Gráfico + Tabela) **"Cruzamento: Responsabilidade de Cuidado × Deixou de se Candidatar a Gestão"** (ordenado decrescentemente da maior para a menor barra) e badge **"Taxa de renúncia com cuidado"** (com seletores de Segmento e das 6 categorias oficiais de Gênero).
- **Fórmula da Taxa de Renúncia com Cuidado:**
  $$\text{Taxa de Renúncia com Cuidado} = \left(\frac{n_{\text{cuidado (Sim + Divide igualmente) e evitou candidatura = Sim}}}{n_{\text{total com cuidado (Sim + Divide igualmente)}}}\right) \times 100$$
```sql
SELECT
  responsabilidade_cuidado,
  evitou_candidatura_cuidado,
  CASE
    WHEN cargo ILIKE '%Docente%' THEN 'docentes'
    WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
    ELSE 'outro'
  END as segmento,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `evitou_candidatura_cuidado IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY responsabilidade_cuidado, evitou_candidatura_cuidado, segmento, genero_grp;
```

#### Consulta 2.8 — Adesão ao PGD (`sqlPgd`)
*(Retornada no payload JSON da rota `/api/carreira` em `adesao_pgd` para suporte analítico)*:
```sql
SELECT
  adesao_pgd,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `adesao_pgd IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY adesao_pgd, genero_grp
ORDER BY n DESC;
```

---

### Aba 3: Ambiente, Segurança, Clima e Violências (`POST /api/ambiente-violencias`)

*Backend:* `obterDadosAmbienteViolencias` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts#L508-L711)  
*Frontend:* [`src/components/pages/PageAmbienteViolencias.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageAmbienteViolencias.tsx)

#### Consulta 3.1 — Diagrama Divergente Likert (6 consultas em paralelo para `Q24a` a `Q24f`)
- **Componente Visual alimentado:** Gráfico **"Diagrama Divergente de Percepção do Clima Institucional"** (com seletores locais de `Segmento` e das 6 categorias oficiais de `Gênero`).
  - Executa a consulta abaixo para cada uma das 6 colunas: `seguranca_expressao_opiniao`, `ambiente_seguro_respeitoso`, `inclusao_pessoas_trans`, `maternidade_impacto_carreira`, `iniciativas_celebrar_diversidade`, `curriculos_principios_igualdade`.
```sql
SELECT
  coalesce("${item.key}", 'Sem resposta') as resposta,
  CASE
    WHEN cargo ILIKE '%Docente%' THEN 'docentes'
    WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
    WHEN vinculo ILIKE '%Discente%' THEN 'discentes'
    ELSE 'outros'
  END as segmento,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `(${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY resposta, segmento, genero_grp
ORDER BY n DESC;
```

#### Consulta 3.2 — Taxa Direta de Discriminação por Cor/Raça (`sqlViolenciaRacaPorCor`)
- **Componente Visual alimentado:** Gráfico **"Taxa Direta de Discriminação por Cor/Raça (% Sim)"** (com seletores locais de `Segmento` e das 6 categorias oficiais de `Gênero`).
```sql
SELECT
  cor_raca,
  CASE
    WHEN cargo ILIKE '%Docente%' THEN 'docentes'
    WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
    WHEN vinculo ILIKE '%Discente%' THEN 'discentes'
    ELSE 'outros'
  END as segmento,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  count(*)::int as n_total,
  count(*) FILTER (WHERE violencia_raca = 'Sim')::int as n_sim
FROM public.respostas_pgs
${whereComAnd(whereSql, `(${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY cor_raca, segmento, genero_grp
ORDER BY cor_raca;
```

#### Consulta 3.3 — Taxa de Discriminação por Gênero e Orientação (`sqlViolenciaOrientacaoPorGenero`)
- **Componente Visual alimentado:** Gráfico **"Taxa de Discriminação por Gênero e Orientação (% Sim)"** (exibe as 6 categorias oficiais de gênero ordenadas).
```sql
SELECT
  ${SQL_GENERO_NORMALIZADO} as grupo_genero,
  CASE
    WHEN cargo ILIKE '%Docente%' THEN 'docentes'
    WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
    WHEN vinculo ILIKE '%Discente%' THEN 'discentes'
    ELSE 'outros'
  END as segmento,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  count(*)::int as n_total,
  count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as n_sim
FROM public.respostas_pgs
${whereComAnd(whereSql, `(${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY grupo_genero, segmento, genero_grp
ORDER BY grupo_genero;
```

#### Consulta 3.4 — Matriz Interseccional Cor/Raça × Gênero (`sqlInterseccional`)
- **Componente Visual alimentado:** Tabela **"Matriz Interseccional de Relatos de Discriminação (Cor / Raça × Gênero)"** (exibe as 6 categorias oficiais de gênero nas colunas).
  - Contabiliza como vítima (`n_vitimas`) quem respondeu `'Sim'` em `violencia_raca` **OU** `'Sim'` em `violencia_orientacao_genero`.
```sql
SELECT
  cor_raca,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  count(*)::int as n_total,
  count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim')::int as n_vitimas,
  round((count(*) FILTER (WHERE violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float as taxa_pct
FROM public.respostas_pgs
${whereComAnd(whereSql, `(${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY cor_raca, genero_grp
ORDER BY cor_raca, genero_grp;
```

#### Consultas 3.5, 3.6 e 3.7 — Consultas Complementares da Rota `/api/ambiente-violencias`
Retornadas pela API (`violencia_por_orientacao`, `desencorajamento_estudantes` e `funil_denuncia`):
```sql
-- 3.5 Violência por Orientação Sexual
SELECT
  orientacao_sexual,
  count(*)::int as n_total,
  count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim')::int as n_sim,
  round((count(*) FILTER (WHERE violencia_orientacao_genero = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float as taxa_pct
FROM public.respostas_pgs
${whereSql}
GROUP BY orientacao_sexual
ORDER BY taxa_pct DESC;

-- 3.6 Desencorajamento Discente (Q15) por Gênero
SELECT
  desencorajado_participacao,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `vinculo ILIKE '%Discente%' AND desencorajado_participacao IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY desencorajado_participacao, genero_grp
ORDER BY desencorajado_participacao;

-- 3.7 Funil de Denúncia (Q25 -> Q26 -> Q27) por Vínculo
SELECT
  CASE
    WHEN vinculo ILIKE '%Discente%' THEN 'Discente'
    WHEN vinculo ILIKE '%Efetivo%' THEN 'Servidor Efetivo'
    WHEN vinculo ILIKE '%Substituto%' THEN 'Docente Substituto'
    ELSE 'Outro'
  END as vinculo_grp,
  count(*)::int as base_total,
  count(*) FILTER (WHERE conhece_mecanismos_denuncia = 'Sim')::int as etapa_1_conhece,
  count(*) FILTER (WHERE mecanismos_efetivos IN ('Sim, são muito efetivos', 'São parcialmente efetivos'))::int as etapa_2_efetivos,
  count(*) FILTER (WHERE mecanismos_resultados_justos IN ('Sim, geram resultados justos', 'Sim, geram resultados parcialmente justos'))::int as etapa_3_justos
FROM public.respostas_pgs
${whereSql}
GROUP BY vinculo_grp;
```

---

### Aba 4: Núcleos, Assessorias e Políticas (`POST /api/nucleos`)

*Backend:* `obterDadosNucleos` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts#L714-L812)  
*Frontend:* [`src/components/pages/PageNucleos.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageNucleos.tsx)

#### Consulta 4.1 — Distribuição de Avaliação e Desconhecimento dos 6 Órgãos
- **Componente Visual alimentado:** Gráfico **"Avaliação dos Núcleos e Assessorias Institucionais"** (empilha `Muito Boa` a `Muito Ruim` na barra `qualidade` e separa `'Não conheço'` na barra cinza `desconhece`).
- Executada em paralelo para as 6 colunas: `avaliacao_naaf`, `avaliacao_neabi`, `avaliacao_nepgs`, `avaliacao_assessoria_afirmativas`, `avaliacao_assessoria_genero`, `avaliacao_assessoria_etnico_raciais`:
```sql
SELECT
  coalesce("${nuc.key}", 'Sem resposta') as avaliacao,
  count(*)::int as n
FROM public.respostas_pgs
${whereSql}
GROUP BY avaliacao;
```

#### Consulta 4.2 — Matriz Heatmap Campus × Núcleo (`sqlHeatmap`)
- **Componente Visual alimentado:** Tabela **"Matriz Campus × Núcleo: Média de Qualidade (Escala 1 a 5)"**.
  - *Regra de Negócio:* A média (1 a 5) exclui automaticamente `'Não conheço'` e `NULL`. No frontend, notas $\ge 4,0$ são destacadas em verde e notas $\le 2,5$ em vermelho.
```sql
SELECT
  campus,
  count(*)::int as n_campus,
  -- Bloco repetido para cada uma das 6 colunas (${nuc.key}):
  avg(CASE
    WHEN "${nuc.key}" = 'Muito Boa' THEN 5
    WHEN "${nuc.key}" = 'Boa' THEN 4
    WHEN "${nuc.key}" = 'Regular' THEN 3
    WHEN "${nuc.key}" = 'Ruim' THEN 2
    WHEN "${nuc.key}" = 'Muito Ruim' THEN 1
    ELSE NULL END)::float as media_${nuc.key},
  count(*) FILTER (WHERE "${nuc.key}" IN ('Muito Boa', 'Boa', 'Regular', 'Ruim', 'Muito Ruim'))::int as validos_${nuc.key},
  count(*) FILTER (WHERE "${nuc.key}" = 'Não conheço')::int as desconhece_${nuc.key}
FROM public.respostas_pgs
${whereSql}
GROUP BY campus
ORDER BY campus;
```

#### Consulta 4.3 — Eficácia das Campanhas e Capacitações Q28 (`sqlCampanhas`)
- **Componente Visual alimentado:** Gráfico **"Percepção sobre a Eficácia das Campanhas e Ações Formativas"**.
```sql
SELECT
  coalesce(eficacia_capacitacoes, 'Não informado') as resposta,
  CASE
    WHEN vinculo ILIKE '%Discente%' THEN 'Discente'
    WHEN vinculo ILIKE '%Efetivo%' THEN 'Servidor Efetivo'
    WHEN vinculo ILIKE '%Substituto%' THEN 'Docente Substituto'
    ELSE 'Outro'
  END as vinculo_grp,
  count(*)::int as n
FROM public.respostas_pgs
${whereSql}
GROUP BY resposta, vinculo_grp
ORDER BY n DESC;
```

---

### Aba 5: Cuidado, Parentalidade e Permanência (`POST /api/cuidado`)

*Backend:* `obterDadosCuidado` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts#L815-L904)  
*Frontend:* [`src/components/pages/PageCuidado.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageCuidado.tsx)

#### Consulta 5.1 — Responsabilidade de Cuidado por Gênero e Vínculo (`sqlQ9`)
- **Componente Visual alimentado:** Gráfico **"Responsabilidade Principal de Cuidado por Identidade de Gênero"** (pelas 6 categorias oficiais).
```sql
SELECT
  responsabilidade_cuidado,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  CASE
    WHEN vinculo ILIKE '%Discente%' THEN 'Discente'
    ELSE 'Servidor(a)'
  END as vinculo_grp,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `responsabilidade_cuidado IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY responsabilidade_cuidado, genero_grp, vinculo_grp;
```

#### Consulta 5.2 — Políticas de Apoio ao Cuidado Q30 (`sqlQ30`)
*(Retornada no payload da rota `/api/cuidado` em `politicas_cuidado_q30`)*:
```sql
SELECT
  politica_apoio_cuidado,
  campus,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, 'politica_apoio_cuidado IS NOT NULL')}
GROUP BY politica_apoio_cuidado, campus;
```

#### Consulta 5.3 — Suficiência de Licenças (Q31, Q32) e Apoio a Pais Estudantes (Q33) (`sqlLicencaSegmento`)
- **Componente Visual alimentado:** Gráfico **"Suficiência das Licenças e Apoio a Estudantes com Filhos"** (com seletor de `Geral` e das 6 categorias oficiais de gênero).
- Executada em paralelo para `licenca_maternidade_suficiente`, `licenca_paternidade_suficiente` e `apoio_pais_estudantes_suficiente`:
```sql
SELECT
  ${coluna} as resposta,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  CASE
    WHEN cargo ILIKE '%Docente%' THEN 'docentes'
    WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnicos'
    ELSE 'outro'
  END as segmento,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `${coluna} IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY ${coluna}, genero_grp, segmento
ORDER BY n DESC;
```

#### Consulta 5.4 — Impacto da Maternidade na Carreira Q24d (`sqlMaternidadeImpacto`)
- **Componente Visual alimentado:** Gráfico **"Percepção sobre o Impacto da Maternidade na Carreira"** (pelas 6 categorias oficiais).
```sql
SELECT
  maternidade_impacto_carreira,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `maternidade_impacto_carreira IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY maternidade_impacto_carreira, genero_grp
ORDER BY n DESC;
```

#### Consulta 5.5 — Estudantes com Responsabilidade de Cuidado por Campus e Nível (`sqlEstudantesCuidado`)
- **Componente Visual alimentado:** Tabela com filtros integrados **"Estudantes com Responsabilidade de Cuidado por Campus e Nível de Curso"**.
  - *Regra de Negócio na Tabela:* A coluna **`% com Cuidado`** soma `(com_cuidado_principal + divide_cuidado) / total_estudantes * 100`.
```sql
SELECT
  campus,
  nivel_curso,
  count(*)::int as total_estudantes,
  count(*) FILTER (WHERE responsabilidade_cuidado = 'Sim')::int as com_cuidado_principal,
  count(*) FILTER (WHERE responsabilidade_cuidado = 'Divido a responsabilidade igualmente com outra(s) pessoa(s)')::int as divide_cuidado
FROM public.respostas_pgs
${whereComAnd(whereSql, "vinculo ILIKE '%Discente%' AND nivel_curso IS NOT NULL")}
GROUP BY campus, nivel_curso
ORDER BY total_estudantes DESC;
```

---

### Aba 6: STEM e Masculinização das Áreas (`POST /api/stem`)

*Backend:* `obterDadosStem` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts#L907-L980)  
*Frontend:* [`src/components/pages/PageStem.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageStem.tsx)

#### Consulta 6.1 — Extração Discente por Área de Conhecimento, Gênero, Cor/Raça e Desencorajamento
- **Componentes Visuais alimentados (após agregação determinística via `MAPA_TEXTOS_AREA`):**
  1. **KPI Card "Desencorajamento em STEM":** `desencorajamento_stem.stem_pct` (% de discentes em `Engenharias e Tecnologia` ou `Ciências Exatas e da Terra` que responderam `'Sim, algumas vezes'` ou `'Sim, frequentemente'` em `desencorajado_participacao`).
  2. **KPI Card "Desencorajamento em Outras Áreas":** `desencorajamento_stem.nao_stem_pct`.
  3. **KPI Card "Áreas Mapeadas Deterministicamente":** Quantidade de Grandes Áreas CNPq com respondentes (`ranking.length`).
  4. **Gráfico "Participação Feminina por Grande Área do Conhecimento (CNPq)":** `pct_mulheres = mulheres / total * 100` (contabilizando `Mulher` e `Mulher Trans`) ordenado decrescentemente.
  5. **Gráfico "Desencorajamento Acadêmico: STEM vs Outras":** Compara `stem_pct` vs `nao_stem_pct`.
  6. **Tabela "Tabela de Auditoria e Cobertura da Normalização de Áreas":** Lista cada texto bruto (`textoOriginal`), a Grande Área atribuída (`grandeArea`) e a contagem `n`.

```sql
SELECT
  area_conhecimento,
  ${SQL_GENERO_NORMALIZADO} as genero_grp,
  cor_raca,
  desencorajado_participacao,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `vinculo ILIKE '%Discente%' AND area_conhecimento IS NOT NULL`)}
GROUP BY area_conhecimento, genero_grp, cor_raca, desencorajado_participacao;
```

---

### Aba 7: Construtor Dinâmico (`POST /api/consulta`)

*Backend:* `executarConsulta` em [`src/server/consultaEngine.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/consultaEngine.ts#L100-L284)  
*Frontend:* [`src/components/pages/PageConstrutor.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageConstrutor.tsx)

O Construtor Dinâmico permite cruzar até **2 campos de eixo** (`eixo_1`, `eixo_2`), **1 campo de série/cor** (`cor`), até **8 filtros** (`in`, `eq`, `neq`) e um *toggle* para incluir ou ocultar `'Prefiro não responder'`. Os resultados ficam em cache por **5 minutos** (`cacheConsulta`). Quando `genero` ou `genero_agrupado` é utilizado como eixo ou série de cor, o motor aplica `(${SQL_GENERO_NORMALIZADO}) IS NOT NULL` automaticamente.

#### Template SQL Dinâmico
```sql
-- 1. Consulta das linhas agrupadas (limitada a 120 linhas)
SELECT
  ${exprEixo1} AS eixo_1,
  ${exprEixo2_ou_NULL} AS eixo_2,
  ${exprCor_ou_NULL} AS cor,
  ${metricExpr}
FROM public.respostas_pgs
${innerWhere}
GROUP BY ${groupByCols}
ORDER BY valor DESC, n DESC
LIMIT 120;

-- 2. Consulta do total filtrado (denominador geral)
SELECT
  count(*)::int as n_filtrado
FROM public.respostas_pgs
${innerWhere};
```

#### Expressões de Medida (`${metricExpr}`) no Construtor Dinâmico

| Tipo de Medida (`req.medida.tipo`) | Expressão SQL (`metricExpr`) / Pós-processamento |
| :--- | :--- |
| `contagem` | `count(*)::int AS n, count(*)::float AS valor` |
| `percentual_no_grupo` | SQL: `count(*)::int AS n, count(*)::float AS valor`<br>Pós-processamento JS: `valor = (n / soma_n_do_eixo_1) * 100` |
| `percentual_do_total` | SQL: `count(*)::int AS n, count(*)::float AS valor`<br>Pós-processamento JS: `valor = (n / n_filtrado) * 100` |
| `media` | `count(*)::int AS n, coalesce(round(avg(${likertExpr})::numeric, 2), 0)::float AS valor` |
| `mediana` | `count(*)::int AS n, coalesce(round(percentile_cont(0.5) within group (order by ${likertExpr})::numeric, 2), 0)::float AS valor` |
| `taxa_sim` | `count(*)::int AS n, round((count(*) filter (where ${exprEixo1} = 'Sim') * 100.0 / nullif(count(*), 0))::numeric, 1)::float AS valor` |
