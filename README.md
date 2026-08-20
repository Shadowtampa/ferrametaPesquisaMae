# Catálogo de Servidores por Cargo e Setor

Aplicação web simples e auto-hospedada para catalogar servidores públicos
(inicialmente Pedagogos e TAEs) por cargo, setor/unidade de trabalho e
classificação do setor (Unidade Acadêmica, Unidade Administrativa ou
Não sei). Ver `Documento de Visão` para o detalhamento completo do escopo.

## Arquitetura

```text
Navegador
    |
    v
React + Vite (client/)
    |
    v
API HTTP em Express (server/)
    |
    v
Arquivo CSV (server/data/servidores.csv)
```

## Requisitos

- Node.js 18 ou superior

## Como rodar em desenvolvimento

Em dois terminais separados:

```bash
# Terminal 1 - backend (API + CSV)
cd server
npm install
npm run dev        # http://localhost:3001

# Terminal 2 - frontend
cd client
npm install
npm run dev         # http://localhost:5173
```

O Vite já está configurado para fazer proxy de `/api` para
`http://localhost:3001`, então basta acessar `http://localhost:5173`.

## Como rodar em produção (auto-hospedado)

```bash
cd client
npm install
npm run build        # gera client/dist

cd ../server
npm install
npm start             # serve a API e o front compilado em http://localhost:3001
```

Os dados ficam persistidos em `server/data/servidores.csv`, criado
automaticamente na primeira execução.

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

Basta copiar o arquivo `server/data/servidores.csv`.
