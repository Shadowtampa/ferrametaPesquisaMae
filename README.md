# Catálogo de Servidores por Cargo e Setor

Aplicação web simples para catalogar servidores públicos (inicialmente
Pedagogos e TAEs) por cargo, setor/unidade de trabalho e classificação do
setor (Unidade Acadêmica, Unidade Administrativa ou Não sei). Ver
`Documento de Visão` para o detalhamento completo do escopo.

Suporta dois modos de hospedagem: auto-hospedado (Node.js + CSV local, como
descrito no Documento de Visão) ou deploy na Vercel (Functions + Vercel
Blob). Veja as seções abaixo.

## Arquitetura

```text
Navegador
    |
    v
React + Vite (client/)
    |
    v
API HTTP em Express (server/app.js)
    |
    v
Camada de storage (server/storage/)
    |
    +--> auto-hospedado: arquivo CSV local (server/data/servidores.csv)
    +--> Vercel: Vercel Blob (mesmo conteúdo em formato CSV)
```

O projeto é um monorepo com [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces):

```text
/
├── client/     # React + Vite (frontend)
├── server/     # Express + lógica de dados (usado localmente e pela Vercel)
├── api/        # Vercel Function (reexporta server/app.js)
└── vercel.json
```

## Requisitos

- Node.js 18 ou superior

## Como rodar em desenvolvimento

Instale as dependências uma vez, na raiz do projeto (workspaces cuidam de
`client/` e `server/`):

```bash
npm install
```

Em dois terminais separados:

```bash
# Terminal 1 - backend (API + CSV local)
npm run dev:server   # http://localhost:3001

# Terminal 2 - frontend
npm run dev:client   # http://localhost:5173
```

O Vite já está configurado para fazer proxy de `/api` para
`http://localhost:3001`, então basta acessar `http://localhost:5173`.

## Como rodar em produção auto-hospedada

```bash
npm install
npm run build          # gera client/dist
npm start --workspace server   # serve a API e o front compilado em http://localhost:3001
```

Os dados ficam persistidos em `server/data/servidores.csv`, criado
automaticamente na primeira execução.

## Deploy na Vercel

As Vercel Functions têm sistema de arquivos efêmero (não compartilhado entre
instâncias e descartado a cada novo deploy), então o CSV local não funciona
como storage nesse ambiente. Por isso, quando a variável de ambiente
`BLOB_READ_WRITE_TOKEN` está definida, o backend passa a ler/escrever o
mesmo CSV através do [Vercel Blob](https://vercel.com/docs/vercel-blob) em
vez do disco local — a troca é automática (`server/storage/index.js`).

Passos:

1. Importe o repositório em [vercel.com/new](https://vercel.com/new).
   A Vercel detecta o `vercel.json` na raiz (build do frontend +
   Function em `api/index.js` servindo `/api/*`).
2. No projeto criado, vá em **Storage → Create Database → Blob** para criar
   um Blob Store e conectá-lo ao projeto. Isso injeta automaticamente a
   variável `BLOB_READ_WRITE_TOKEN` nas Functions.
3. Faça o deploy (ou apenas um redeploy, se o Blob Store foi criado depois
   do primeiro deploy).

**Limitação conhecida:** o backend usa um lock em memória para serializar
leitura+escrita do CSV e evitar corrida entre requisições simultâneas. Esse
lock só protege dentro de uma mesma instância de function; sob concorrência
real entre instâncias diferentes da Vercel (múltiplas escritas simultâneas),
uma escrita pode sobrescrever outra. Para o volume de uso previsto (catálogo
interno, poucos editores simultâneos) isso é aceitável; se o tráfego de
escrita crescer, a evolução natural é migrar para um banco de dados
(Postgres/SQLite), como já previsto no Documento de Visão.

## Endpoints da API

| Método | Rota                    | Descrição                                   |
| ------ | ------------------------ | -------------------------------------------- |
| GET    | `/api/records`           | Lista registros (`search`, `cargo`, `classificacao`) |
| POST   | `/api/records`           | Cria um registro                             |
| PUT    | `/api/records/:id`       | Atualiza um registro                         |
| DELETE | `/api/records/:id`       | Remove um registro                           |
| GET    | `/api/records/export`    | Exporta todos os registros em CSV            |
| POST   | `/api/records/import`    | Importa registros a partir de um texto CSV (`{ "csv": "..." }`) |
| GET    | `/api/stats`             | Indicadores (totais por cargo/classificação) |

## Modelo de dados

```text
id, cargo, setor, classificacao_setor, created_at, updated_at
```

`classificacao_setor` aceita somente: `UNIDADE_ACADEMICA`,
`UNIDADE_ADMINISTRATIVA` ou `NAO_SEI`.

## Backup

- Auto-hospedado: copie o arquivo `server/data/servidores.csv`.
- Vercel: use a exportação CSV da aplicação (`/api/records/export`, também
  disponível pelo botão "Exportar CSV" na interface).
