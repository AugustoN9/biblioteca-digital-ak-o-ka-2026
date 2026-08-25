@'
# 📚 Portal Acervo Digital — AK-O-KA

Plataforma full-stack moderna para gestão, categorização e visualização interativa de acervos bibliográficos, livros acadêmicos e documentos científicos em PDF.

---

## 🎯 Sobre o Projeto

O **Portal Acervo Digital — AK-O-KA** foi desenvolvido para centralizar, catalogar e disponibilizar coleções acadêmicas e técnicas. A plataforma oferece uma interface intuitiva para estudantes, pesquisadores e leitores navegarem por categorias hierárquicas, realizarem buscas instantâneas e visualizarem livros em PDF diretamente pelo navegador, além de contar com um painel administrativo protegido para gestão completa do catálogo.

---

## 🚀 Tecnologias Utilizadas

### Frontend
* **Angular 19** (Standalone Components, Signals & Reactive Forms)
* **TypeScript 5.x**
* **Bootstrap 5 & Bootstrap Icons**
* **SCSS Modular**
* **RxJS**

### Backend
* **Node.js 24.x**
* **Express.js**
* **TypeScript & tsx**
* **Mongoose & MongoDB Atlas** (NoSQL em nuvem)
* **JWT (JSON Web Token)** & **bcryptjs** (Autenticação e segurança)
* **CORS & Dotenv**

---

## 🏗️ Estrutura do Monorepo

```text
biblioteca-digital-ak-o-ka-2026/
├── backend/                  # API RESTful Node.js + Express
│   ├── src/
│   │   ├── config/           # Conexão MongoDB Atlas e DNS resolvers
│   │   ├── controllers/      # Regras de negócio e handlers das rotas
│   │   ├── middlewares/      # Proteção de rotas com JWT
│   │   ├── models/           # Schemas Mongoose (Categories, Subcategories, Books)
│   │   ├── routes/           # Endpoints da API REST
│   │   ├── scripts/          # Seed para migração e carga da base
│   │   └── server.ts         # Ponto de entrada do servidor Express
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Aplicação SPA Angular 19
│   ├── src/
│   │   ├── app/
│   │   │   ├── guards/       # Guards de proteção de rotas (AuthGuard)
│   │   │   ├── models/       # Interfaces e contratos TypeScript
│   │   │   ├── pages/        # Componentes de página (Home, Categoria, Admin, Login)
│   │   │   ├── pipes/        # Pipes de sanitização de URLs (SafeUrlPipe)
│   │   │   └── services/     # Comunicação HTTP e gerenciamento de estado
│   │   ├── assets/           # Imagens, capas e identidades visuais
│   │   └── styles.scss       # Design system e estilização global
│   ├── angular.json
│   └── package.json
│
└── README.md


## ⚡ Principais Funcionalidades

* **Catálogo Hierárquico:** Navegação categorizada em múltiplos níveis (`Grandes Áreas → Subcategorias → Livros`).
* **Busca Global Instantânea:** Filtragem dinâmica em tempo real por título, autor, descrição e tags associadas.
* **Leitor de PDF Integrado:** Modal com visualizador responsivo integrado ao Google Drive, utilizando sanitização segura de `iframe` com `DomSanitizer`.
* **Sistema de Favoritos:** Persistência em nuvem com incremento dinâmico de contadores de interesse.
* **Painel Administrativo (`/admin`):**

  * Autenticação com sessão protegida por tokens JWT.
  * CRUD completo para inserção, edição e exclusão de obras, categorias e tópicos.
  * Sincronização direta e persistência em nuvem no MongoDB Atlas.

## 🛠️ Instalação e Execução Local

### Pré-requisitos

* **Node.js** (v18+)
* **NPM** (v9+)
* **Angular CLI** (`npm install -g @angular/cli`)
* Cluster ativo no **MongoDB Atlas**

### 1. Configuração do Backend

1. Acesse o diretório do backend e instale as dependências:

```bash
cd backend
npm install
```

2. Crie o arquivo `.env` na pasta `backend/`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster0.eguf1gp.mongodb.net/acervo_digital?retryWrites=true&w=majority
JWT_SECRET=seu_segredo_jwt_aqui
```

3. Execute a carga de dados inicial (Seed):

```bash
npm run seed
```

4. Inicie o servidor da API:

```bash
npm run dev
```

> A API estará ativa em `http://localhost:3000`.

### 2. Configuração do Frontend

1. Em outro terminal, acesse o diretório do frontend e instale as dependências:

```bash
cd frontend
npm install
```

2. Inicie o servidor de desenvolvimento do Angular:

```bash
ng serve
```

3. Acesse a aplicação no navegador:

```text
http://localhost:4200
```

## 🔒 Variáveis de Ambiente

| Variável      | Descrição                                              | Exemplo                                                                                  |
| ------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `PORT`        | Porta de execução da API Express                       | `3000`                                                                                   |
| `MONGODB_URI` | URI de conexão com o cluster MongoDB Atlas             | `mongodb+srv://user:pass@cluster.mongodb.net/acervo_digital?retryWrites=true&w=majority` |
| `JWT_SECRET`  | Chave secreta para assinatura e validação do token JWT | `segredo_jwt_super_seguro`                                                               |

## 🌐 Deploy em Produção

* **Backend:** Hospedado no [Render](https://render.com/) com Node runtime e integração contínua via branch `main`.
* **Frontend:** Hospedado na [Vercel](https://vercel.com/) com build automatizado do Angular 19 e suporte nativo a Single Page Application (SPA).
