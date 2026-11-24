# Documentação Técnica: Consultas SQL, Indicadores e Regras de Negócio — Painel PGS (IFRS)

Este documento compila de forma hierárquica **todas as consultas SQL**, **regras de negócio**, **componentes reutilizáveis de filtro**, **normalizações**, **escalas** e **fórmulas** utilizadas pelo Painel Analítico do Diagnóstico Institucional de Gênero e Sexualidade do IFRS.

Serve como guia de referência rápida para identificar exatamente **qual consulta SQL e qual regra de cálculo montam cada KPI, Gráfico ou Tabela** em cada aba do painel.

---

## Sumário

1. [Arquitetura da Base de Dados e Segurança](#1-arquitetura-da-base-de-dados-e-segurança)
2. [Regras de Negócio Globais, Normalizações e Fórmulas](#2-regras-de-negócio-globais-normalizações-e-fórmulas)
   - [2.0. Exclusão Global de Trabalhadores Terceirizados (`SQL_FILTRO_SEM_TERCEIRIZADOS`)](#20-exclusão-global-de-trabalhadores-terceirizados-sql_filtro_sem_terceirizados)
   - [2.1. Regra de Ouro Oficial: Normalização e Classificação de Gênero (`SQL_GENERO_NORMALIZADO`)](#21-regra-de-ouro-oficial-normalização-e-classificação-de-gênero-sql_genero_normalizado)
   - [2.1.B. Normalização de Orientação Sexual (`SQL_ORIENTACAO_NORMALIZADA`)](#21b-normalização-de-orientação-sexual-sql_orientacao_normalizada)
   - [2.1.C. Componentes Reutilizáveis de Seleção Individual por Gráfico](#21c-componentes-reutilizáveis-de-seleção-individual-por-gráfico)
   - [2.2. Normalização de Vínculo Institucional e Segmentos Funcionais](#22-normalização-de-vínculo-institucional-e-segmentos-funcionais)
   - [2.3. Agrupamento Étnico-Racial (Pessoas Negras e 6 Categorias Oficiais)](#23-agrupamento-étnico-racial-pessoas-negras-e-6-categorias-oficiais)
   - [2.4. Escalas Likert, Pontuações e Inversão de Polo (Q24d)](#24-escalas-likert-pontuações-e-inversão-de-polo-q24d)
   - [2.5. Fórmulas de Índices Sintéticos (Clima 0–100 e Shannon)](#25-fórmulas-de-índices-sintéticos-clima-0100-e-shannon)
   - [2.6. Normalização de Grandes Áreas (CNPq) e Classificação STEM](#26-normalização-de-grandes-áreas-cnpq-e-classificação-stem)
   - [2.7. Regras de Denominadores, Cortes de Privacidade e Amostra Pequena](#27-regras-de-denominadores-cortes-de-privacidade-e-amostra-pequena)
   - [2.8. Motor de Filtros Globais (`montarWhereFiltrosGlobais`)](#28-motor-de-filtros-globais-montarwherefiltrosglobais)
3. [Catálogo Hierárquico de Consultas SQL por Aba do Painel](#3-catálogo-hierárquico-de-consultas-sql-por-aba-do-painel)
   - [Rotas Auxiliares (`/api/saude` e `/api/filtros-opcoes`)](#rotas-auxiliares-apisaude-e-apifiltros-opcoes)
   - [Aba 0: Visão Geral (`/api/visao-geral`)](#aba-0-visão-geral-apivisao-geral)
   - [Aba 1: Perfil e Representatividade (`/api/perfil`)](#aba-1-perfil-demográfico-e-representatividade-apiperfil)
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
  - Todas as consultas dinâmicas utilizam *whitelist* estrita validada via Zod (`CAMPOS_PERMITIDOS_CONSULTA`) e *placeholders* parametrizados (`$1, $2...`) contra SQL Injection.

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
    OR genero ILIKE '%multigênero%' THEN 'Não-binários'
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
| **`Não-binários`** | **80** | 1,65% | 1,67% | `Não-binário` (71), `Agênero` (2), `Gênero Fluido` (1), `Genero fluído ` (1), `Gênero fluído` (1), `Gênero fluido` (1), `Demigirl` (1), `Alexigênero` (1), `Pangênero` (1) |
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

### 2.1.C. Componentes Reutilizáveis de Seleção Individual por Gráfico

O projeto padroniza **5 componentes reutilizáveis de filtro** nos cabeçalhos dos gráficos (`ChartCard`), além do indicador obrigatório de amostra **`n`** e do confinamento automático de tooltips (`confine: true` em [`src/components/ChartCard.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/ChartCard.tsx)):

1. **`SeletorGenero` ([`src/components/SeletorGenero.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/SeletorGenero.tsx)):**
   - Opções: `Todos`, `Mulher`, `Homem`, `Mulher Trans`, `Homem Trans`, `Travesti`, `Não-binários` (`CATEGORIAS_GENERO_OFICIAIS`).
2. **`SeletorSegmento` ([`src/components/SeletorSegmento.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/SeletorSegmento.tsx)):**
   - Opções: `Geral`, `Docente`, `Técnico TAE`, `Discentes` (`correspondeSegmento` aceita os valores singulares e plurais vindos do banco).
3. **`SeletorRaca` ([`src/components/SeletorRaca.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/SeletorRaca.tsx)):**
   - Opções: `Todos`, `Branca`, `Parda`, `Preta`, `Amarela`, `Indígena`, `Prefiro não responder` (`CATEGORIAS_COR_RACA_OFICIAIS`).
4. **`SeletorDeficiencia` ([`src/components/SeletorDeficiencia.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/SeletorDeficiencia.tsx)):**
   - Opções: `Todos`, `Sim`, `Não` (`CATEGORIAS_DEFICIENCIA_OFICIAIS`).
5. **`SeletorIdade` ([`src/components/SeletorIdade.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/SeletorIdade.tsx)):**
   - Opções: `Todos`, `Menor` (`< 18 anos`) e `Maior` (`18+ anos`), mapeadas via `SQL_IDADE_AGRUPADA` ([`src/lib/escalas.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/lib/escalas.ts)):
   ```sql
   CASE
     WHEN faixa_etaria = 'Menor de 18 anos' THEN 'menor'
     WHEN faixa_etaria IN ('De 18 a 24 anos', 'De 25 a 34 anos', 'De 35 a 44 anos', 'De 45 a 54 anos', 'De 55 a 64 anos', '65 anos ou mais') THEN 'maior'
     ELSE 'nao_informado'
   END
   ```
   - Aplicado em **todos os gráficos** do painel (exceto na Aba 2 — Carreira e Gestão, por tratar exclusivamente de servidores adultos).

---

### 2.2. Normalização de Vínculo Institucional e Segmentos Funcionais

#### A) Vínculo Detalhado no Gráfico de Campus (`vinculo_simplificado` na Aba 0)
Separa os servidores efetivos em **Docentes** e **Técnicos TAEs** e contempla também a série **"Vínculo/Cargo não informado"** para respondentes que declararam o campus mas ocultaram vínculo ou cargo, além de contabilizar `sem_campus_por_genero` para conciliar 100% da base (`n = 4.857` no geral; `n = 2.650` para `Mulher` = `2.630` com vínculo/cargo + `16` com vínculo/cargo não informado nas 18 unidades + `4` com `'Prefiro não responder'` em campus):
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

#### B) Segmento da Comunidade (`SQL_SEGMENTO_COMUNIDADE`: Geral | Docente | Técnico TAE | Discentes)
Usado nos seletores individuais `SeletorSegmento` das abas **Perfil (Aba 1)**, **Carreira (Aba 2)**, **Ambiente (Aba 3)**, **Núcleos (Aba 4)** e **Cuidado (Aba 5)**:
```sql
CASE
  WHEN vinculo ILIKE '%Discente%' THEN 'discente'
  WHEN vinculo ILIKE '%Substituto%' OR cargo ILIKE '%Docente%' THEN 'docente'
  WHEN cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%' THEN 'tecnico_tae'
  ELSE 'outro'
END
```

#### C) Separação de "Servidor Efetivo" em "Docentes" e "Técnicos TAEs" (Abas 3 e 4)
Nos gráficos **"Funil de Conhecimento, Efetividade e Justiça dos Canais de Denúncia"** (Aba 3) e **"Percepção sobre a Eficácia das Campanhas e Ações Formativas"** (Aba 4), o eixo de vínculos separa explicitamente servidores efetivos entre **Docentes** e **Técnicos TAEs**:
```sql
CASE
  WHEN vinculo ILIKE '%Discente%' THEN 'Discentes'
  WHEN vinculo ILIKE '%Substituto%' THEN 'Docentes Substitutos'
  WHEN vinculo ILIKE '%Efetivo%' AND cargo ILIKE '%Docente%' THEN 'Docentes'
  WHEN vinculo ILIKE '%Efetivo%' AND (cargo ILIKE '%Técnico%' OR cargo ILIKE '%Administrativo%' OR cargo ILIKE '%TAE%') THEN 'Técnicos TAEs'
  ELSE 'Outro'
END as vinculo_grp
```

#### D) Regra de Restrição de Base na Aba 2 (Carreira)
Na função `obterDadosCarreira` ([`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)), o filtro de vínculo é **forçado** para incluir apenas servidores:
```ts
const baseFiltros: FiltrosGlobaisState = {
  ...filtros,
  vinculo: ['Docente', 'Efetivo', 'Substituto'],
};
```
Isso garante que **Discentes e Terceirizados sejam sempre excluídos** das estatísticas de carreira e gestão.

---

### 2.3. Agrupamento Étnico-Racial (Pessoas Negras e 6 Categorias Oficiais)

- **6 Categorias Oficiais (`CATEGORIAS_COR_RACA_OFICIAIS`):** `['Branca', 'Parda', 'Preta', 'Amarela', 'Indígena', 'Prefiro não responder']`.
- **Pessoa Negra (IBGE / Estatuto da Igualdade Racial):** Soma das autodeclarações **`Preta`** + **`Parda`** (`cor_raca IN ('Preta', 'Parda')`).

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

---

### 2.5. Fórmulas de Índices Sintéticos (Clima 0–100 e Shannon)

1. **Índice de Convivência e Clima Institucional (0 a 100):**
   $$\text{climaMedia} = \frac{\bar{Q}_{24a} + \bar{Q}_{24b} + \bar{Q}_{24c} + \bar{Q}_{24d\_inv} + \bar{Q}_{24e} + \bar{Q}_{24f}}{6}$$
   $$\text{Índice Clima} = \left(\frac{\text{climaMedia} - 1}{5 - 1}\right) \times 100$$

2. **Índice de Diversidade de Shannon Normalizado ($H' \in [0, 100]$):**
   $$H' = \left(\frac{-\sum_{i=1}^{k} p_i \ln(p_i)}{\ln(k)}\right) \times 100$$

---

### 2.6. Normalização de Grandes Áreas (CNPq) e Classificação STEM

- **Definição de STEM:** Pertencem ao grupo **STEM** exclusivamente as Grandes Áreas:
  1. `Engenharias e Tecnologia`
  2. `Ciências Exatas e da Terra`
- **Base Discente em STEM:** Existem **1.556 discentes** em cursos STEM com gênero válido nas 6 categorias oficiais, dos quais **187 (12,0%)** relataram desencorajamento na participação acadêmica (`144` `'Sim, algumas vezes'` e `43` `'Sim, frequentemente'`), `146` `'Raramente'`, `1.168` `'Nunca'` e `55` `'Prefiro não responder'`.
- **Exclusão de `"Não classificada"` no Gráfico Principal da Aba 6:** O gráfico **"Distribuição e Participação Discente por Grande Área do Conhecimento (CNPq)"** exibe exclusivamente as **8 Grandes Áreas oficiais do CNPq**, mantendo os registros não classificados apenas na Tabela de Auditoria logo abaixo.
- **Auditoria e Cobertura de Termos Livres:** A normalização determinística reduziu os termos não classificados de 19 para apenas 8 termos (8 respondentes: `"Ensino Médio"`, `"Eja"`, `"Mestrado"`, `"Multidisciplinar"`, `"Exatas e Humanas"`, `"todos"`, `"Nenhuma área ainda"`, `"sei lá"`), após cruzar termos livres com Campus e Nível de Curso.

---

### 2.7. Regras de Denominadores, Cortes de Privacidade e Amostra Pequena

1. **Exibição Obrigatória do `n`:** Todos os gráficos e tabelas do painel exibem o tamanho da amostra (`n`) correspondente ao recorte ativo dos seletores.
2. **Denominador no Gráfico "Percentual de Discriminação por Cor/Raça" (Aba 3):**
   - Quando o seletor de gênero está em `"Todos"`, a consulta `sqlViolenciaRacaPorCor` **não** restringe por `${SQL_GENERO_NORMALIZADO} IS NOT NULL`, garantindo que a totalidade dos respondentes de cada raça seja contabilizada (ex.: **6 de 20 indígenas = 30,0%**). A restrição de gênero só é aplicada quando o usuário filtra uma categoria específica de gênero.
3. **Sinalização de Amostra Pequena (`n < 10`):**
   - Na **Matriz Interseccional (Aba 3)** e no **Construtor Dinâmico (Aba 7)**, qualquer célula ou categoria com $0 < n < 10$ recebe o alerta `"amostra pequena (n < 10)"`.

---

### 2.8. Motor de Filtros Globais (`montarWhereFiltrosGlobais`)

Definido em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts). Todas as abas recebem `filtros` no corpo do `POST` e injetam `${whereSql}` com combinação `AND`.

---

## 3. Catálogo Hierárquico de Consultas SQL por Aba do Painel

### Rotas Auxiliares (`/api/saude` e `/api/filtros-opcoes`)

*Arquivos:* [`src/server/db.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/db.ts) e [`src/server/app.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/app.ts)

---

### Aba 0: Visão Geral (`POST /api/visao-geral`)

*Backend:* `obterKpisVisaoGeral` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)  
*Frontend:* [`src/components/pages/PageVisaoGeral.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageVisaoGeral.tsx)

#### Consulta 0.1 — Consolidação dos 8 KPI Cards da Visão Geral
Alimenta os 8 cards principais da página inicial sobre o universo de `4.857` respondentes.

#### Consulta 0.2 — Distribuição por Campus, Vínculo, Gênero e Idade (`sqlCampusVinculo` e `sqlSemCampus`)
- **Componente Visual alimentado:** Gráfico **"Distribuição de Respondentes por Campus e Vínculo Institucional"** com seletores individuais de **Gênero** (`SeletorGenero`) e **Idade** (`SeletorIdade`).
- Inclui a série empilhada **"Vínculo/Cargo não informado"** e soma `sem_campus_por_genero` no badge `n` para reconciliar 100% dos respondentes de cada gênero (ex.: `n = 2.650` para Mulher = `2.646` nas 18 unidades + `4` `'Prefiro não responder'` em campus).
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
  ${SQL_GENERO_NORMALIZADO} as genero,
  ${SQL_IDADE_AGRUPADA} as idade_grp,
  count(*)::int as total
FROM public.respostas_pgs
${whereComAnd(whereSql, "campus IS NOT NULL AND campus <> 'Prefiro não responder'")}
GROUP BY campus, vinculo_simplificado, ${SQL_GENERO_NORMALIZADO}, ${SQL_IDADE_AGRUPADA}
ORDER BY campus ASC;
```

---

### Aba 1: Perfil Demográfico e Representatividade (`POST /api/perfil`)

*Backend:* `obterDadosPerfil` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)  
*Frontend:* [`src/components/pages/PagePerfil.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PagePerfil.tsx)

#### Consultas 1.1 a 1.5 — Distribuições Segmentadas por Categoria, Segmento, Gênero e Idade
Todos os 5 gráficos da Aba 1 utilizam `SeletorSegmento` (`Geral | Docente | Técnico TAE | Discentes`), `SeletorIdade` (`Todos | Menor | Maior`) e `SeletorGenero` (nos gráficos 2 a 5):
1. **Identidade de Gênero Detalhada (`sqlGeneroNormalizado`):** Agrupado por `categoria`, `segmento` e `idade_grp`.
2. **Autodeclaração Étnico-Racial (`cor_raca`):** Agrupado por `cor_raca`, `segmento`, `genero` e `idade_grp`.
3. **Orientação Sexual (`sqlOrientacaoNormalizada`):** Agrupado por `${SQL_ORIENTACAO_NORMALIZADA}`, `segmento`, `genero` e `idade_grp`.
4. **Distribuição por Faixa Etária (`faixa_etaria`):** Agrupado por `faixa_etaria`, `segmento`, `genero` e `idade_grp` (com `ORDEM_FAIXA_ETARIA` alinhada aos textos exatos do banco: `'Menor de 18 anos'`, `'De 18 a 24 anos'`, etc.).
5. **Pessoas com Deficiência — PCD (`pcd`):** Agrupado por `pcd`, `segmento`, `genero` e `idade_grp`.

---

### Aba 2: Carreira, Progressão e Equidade (`POST /api/carreira`)

*Backend:* `obterDadosCarreira` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)  
*Frontend:* [`src/components/pages/PageCarreira.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageCarreira.tsx)

- Todos os seletores de segmento utilizam o componente reutilizável `SeletorSegmento`.
- **Consulta 2.7 (`sqlEvitouCuidado` — Cruzamento: Responsabilidade de Cuidado × Deixou de se Candidatar a Gestão):**
  Agrupa por `responsabilidade_cuidado, evitou_candidatura_cuidado, segmento, genero_grp, cor_raca, pcd`, alimentando os 4 seletores combinados no cabeçalho do bloco: **`SeletorSegmento`**, **`SeletorRaca`**, **`SeletorDeficiencia`** e **`SeletorGenero`**.
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
  cor_raca,
  pcd,
  count(*)::int as n
FROM public.respostas_pgs
${whereComAnd(whereSql, `evitou_candidatura_cuidado IS NOT NULL AND (${SQL_GENERO_NORMALIZADO}) IS NOT NULL`)}
GROUP BY responsabilidade_cuidado, evitou_candidatura_cuidado, segmento, genero_grp, cor_raca, pcd;
```

---

### Aba 3: Ambiente, Segurança, Clima e Violências (`POST /api/ambiente-violencias`)

*Backend:* `obterDadosAmbienteViolencias` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)  
*Frontend:* [`src/components/pages/PageAmbienteViolencias.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageAmbienteViolencias.tsx)

#### Consulta 3.1 — Diagrama Divergente de Percepção do Clima Institucional (`Q24a` a `Q24f`)
- Agrupa por `resposta, segmento, genero_grp, cor_raca, idade_grp`.
- Habilita no cabeçalho os seletores **`SeletorSegmento`**, **`SeletorRaca`**, **`SeletorIdade`** e **`SeletorGenero`**.

#### Consulta 3.2 — Percentual de Discriminação por Cor/Raça (`sqlViolenciaRacaPorCor`)
- Sem filtro fixo de `SQL_GENERO_NORMALIZADO IS NOT NULL` na consulta SQL para preservar a totalidade dos respondentes de cada raça quando `Gênero = Todos` (ex.: `6 de 20` Indígenas = `30,0%`).
- Habilita **`SeletorSegmento`**, **`SeletorIdade`** e **`SeletorGenero`**.

#### Consulta 3.3 — Percentual de Discriminação por Gênero e Orientação (`sqlViolenciaOrientacaoPorGenero`)
- Habilita **`SeletorSegmento`**, **`SeletorIdade`** e **`SeletorGenero`**.

#### Consulta 3.4 — Matriz Interseccional de Relatos de Discriminação (`sqlInterseccional`)
- Retorna `n_total`, `n_raca` (`violencia_raca = 'Sim'`), `n_gen` (`violencia_orientacao_genero = 'Sim'`), `n_vitimas` (união sem dupla contagem: `violencia_raca = 'Sim' OR violencia_orientacao_genero = 'Sim'`) e `taxa_pct`.

#### Consulta 3.7 — Funil de Conhecimento, Efetividade e Justiça dos Canais de Denúncia (`sqlFunilDenuncia`)
- Separa `"Servidor Efetivo"` em **`Docentes`** e **`Técnicos TAEs`** (`['Discentes', 'Docentes', 'Técnicos TAEs', 'Docentes Substitutos']`).
- Agrupa por `vinculo_grp, genero_grp, cor_raca, idade_grp`, habilitando **`SeletorRaca`**, **`SeletorIdade`** e **`SeletorGenero`**, com legendas sem numeração (`Conhece Canais`, `Considera Efetivos`, `Considera os Resultados Justos`) e indicador `n`.

---

### Aba 4: Núcleos, Assessorias e Políticas (`POST /api/nucleos`)

*Backend:* `obterDadosNucleos` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)  
*Frontend:* [`src/components/pages/PageNucleos.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageNucleos.tsx)

- **Subtítulo oficial da seção:** *"Avaliação de desempenho dos núcleos de ações afirmativas (NAAFs, NEABIs, NEPGSs e Assessorias) e percepção de eficácia das campanhas e capacitações de diversidade."*
- **Nomenclatura oficial dos 6 órgãos:**
  1. `NAAF (Ações Afirmativas)`
  2. `NEABI (Afro-brasileiro e Indígena)`
  3. `NEPGS (Gênero e Sexualidade)`
  4. `Assessoria de Ações Afirmativas, Inclusivas e Diversidade`
  5. `Assessoria de Gênero e Sexualidade`
  6. `Assessoria de Relações Étnico-raciais`
- **Gráfico 4.1 ("Avaliação dos Núcleos e Assessorias Institucionais"):** Agrupa por `avaliacao, segmento, idade_grp` e inclui **`SeletorSegmento`**, **`SeletorIdade`** e **`n`**.
- **Tabela 4.2 ("Matriz Campus × Núcleo: Média de Qualidade (Escala 1 a 5)"):** Coluna corrigida para **`NEPGS`** e exclusão da linha `'Prefiro não responder'` em `campus`.
- **Gráfico 4.3 ("Percepção sobre a Eficácia das Campanhas e Ações Formativas"):** Separa `"Servidor Efetivo"` entre **`Docentes`** e **`Técnicos TAEs`** (`['Discentes', 'Docentes', 'Técnicos TAEs', 'Docentes Substitutos']`) e inclui **`SeletorIdade`** e **`n`**.

---

### Aba 5: Cuidado, Parentalidade e Permanência (`POST /api/cuidado`)

*Backend:* `obterDadosCuidado` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)  
*Frontend:* [`src/components/pages/PageCuidado.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageCuidado.tsx)

1. **Gráfico 5.1 ("Responsabilidade Principal de Cuidado por Identidade de Gênero" — Questão 9):**
   - Inclui **`SeletorSegmento`**, **`SeletorIdade`**, **`n`**, confinamento de tooltip e `infoTooltip` detalhando as 5 opções originais da Questão 9 (`Sim` [786], `Divido a responsabilidade igualmente...` [938], `Não` [1.686 — há dependentes na família, mas outra pessoa é a principal responsável], `Não tenho responsabilidade de cuidado sobre ninguém` [1.391 — sem dependentes] e `Prefiro não responder` [56]).
2. **Gráfico 5.3 ("Percepção Acerca da Suficiência das Licenças Maternidade e Paternidade e do Apoio a Estudantes com Filhos/as" — Questões 31, 32 e 33):**
   - Inclui **`SeletorSegmento`**, **`SeletorIdade`**, **`SeletorGenero`**, **`n`** e `infoTooltip` documentando os enunciados oficiais das **Questões 31, 32 e 33**.
3. **Gráfico 5.4 ("Percepção sobre o Impacto da Maternidade na Carreira" — Questão 24d):**
   - Inclui **`SeletorSegmento`**, **`SeletorRaca`**, **`SeletorIdade`** e **`n`**.
   - Exibe barras 100% empilhadas em **porcentagem (%)** por identidade de gênero (`Gênero (n=X)`), com tooltips detalhando percentual e quantidade absoluta (`X,X% (Y resp.)`), seguindo o mesmo padrão analítico da Aba 2.
4. **Tabela 5.5 ("Estudantes com Responsabilidade de Cuidado por Campus e Nível de Curso"):**
   - Filtro por **Campus** combinado ao **`SeletorIdade`** (`Todos | Menor | Maior`), substituindo o antigo combo de nível de curso.

---

### Aba 6: STEM e Masculinização das Áreas (`POST /api/stem`)

*Backend:* `obterDadosStem` em [`src/server/dashboardStats.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/dashboardStats.ts)  
*Frontend:* [`src/components/pages/PageStem.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageStem.tsx)

1. **KPIs de Desencorajamento (2 colunas):**
   - **"Desencorajamento na Participação Acadêmica em Áreas STEM":** `12,0%` (`187` de `1.556` discentes em Exatas e Tecnologia).
   - **"Desencorajamento na Participação Acadêmica em Áreas Não STEM":** `13,7%` (`1.663` discentes em cursos não-STEM).
   - *(O antigo 3º KPI "Áreas Mapeadas Deterministicamente" e o antigo gráfico repetido "Desencorajamento Acadêmico: STEM vs Outras" foram removidos).*
2. **Gráfico 6.1 (Largura Total): "Distribuição e Participação Discente por Grande Área do Conhecimento (CNPq)":**
   - Remove a categoria `"Não classificada"`.
   - Inclui os 4 seletores padrão: **`SeletorGenero`**, **`SeletorRaca`**, **`SeletorDeficiencia`** e **`SeletorIdade`**, além do indicador **`n`**.
3. **Novo Gráfico 6.2: "Desencorajamento na Participação Acadêmica em Cursos STEM (Exatas e Tecnologia)":**
   - Calculado sobre a base dos **1.556 discentes em Exatas e Tecnologia**.
   - Inclui **`SeletorGenero`**, **`SeletorRaca`**, **`SeletorDeficiencia`** e **`SeletorIdade`**, permitindo verificar exatamente quantos discentes de cada categoria enfrentaram desencorajamento (`Enfrentaram Desencorajamento (Total Sim)`, `Sim, frequentemente`, `Sim, algumas vezes`, `Raramente`, `Nunca`, `Prefiro não responder`).

---

### Aba 7: Construtor Dinâmico (`POST /api/consulta`)

*Backend:* `executarConsulta` em [`src/server/consultaEngine.ts`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/server/consultaEngine.ts)  
*Frontend:* [`src/components/pages/PageConstrutor.tsx`](file:///c:/Users/Cristian/GitHub/Painel-PGS/src/components/pages/PageConstrutor.tsx)
