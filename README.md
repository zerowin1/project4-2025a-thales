# Bookmark Manager

Uma aplicação web completa para gerenciar bookmarks com inteligência artificial, construída com Next.js 14, TypeScript, Tailwind CSS e shadcn/ui.

## Funcionalidades

- 🔐 **Autenticação com Google OAuth** - Login seguro via Google
- 🤖 **IA para análise de URLs** - Preenchimento automático de título, descrição e tags
- 📚 **CRUD completo** - Criar, visualizar, editar e deletar bookmarks
- 🎨 **Interface moderna** - Design responsivo com shadcn/ui
- 🗄️ **Banco PostgreSQL** - Persistência de dados com Prisma ORM

## Tecnologias Utilizadas

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Autenticação**: NextAuth.js
- **Banco de Dados**: PostgreSQL + Prisma
- **IA**: Hugging Face Inference API

## Configuração do Projeto

### 1. Instalação

\`\`\`bash
npm install
\`\`\`

### 2. Configuração do Banco de Dados

1. Configure sua string de conexão PostgreSQL no arquivo `.env`
2. Execute as migrações:

\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`

### 3. Configuração das Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

- `DATABASE_URL`: String de conexão do PostgreSQL
- `NEXTAUTH_URL`: URL da aplicação (http://localhost:3000 em desenvolvimento)
- `NEXTAUTH_SECRET`: Chave secreta para NextAuth.js
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`: Credenciais do Google OAuth
- `HUGGINGFACE_API_KEY`: Chave da API do Hugging Face

### 4. Configuração do Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google+ API
4. Configure as credenciais OAuth 2.0
5. Adicione `http://localhost:3000/api/auth/callback/google` como URI de redirecionamento

### 5. Configuração do Hugging Face

1. Crie uma conta no [Hugging Face](https://huggingface.co/)
2. Gere uma API key em Settings > Access Tokens
3. Adicione a chave no arquivo `.env`

### 6. Executar a Aplicação

\`\`\`bash
npm run dev
\`\`\`

A aplicação estará disponível em `http://localhost:3000`.

## Estrutura do Projeto

\`\`\`
├── app/
│   ├── api/                 # API Routes
│   ├── globals.css         # Estilos globais
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página inicial
│   └── providers.tsx       # Providers React
├── components/             # Componentes React
├── lib/                   # Utilitários e configurações
├── prisma/                # Schema do banco de dados
└── public/                # Arquivos estáticos
\`\`\`

## Como Usar

1. **Login**: Faça login com sua conta Google
2. **Adicionar Bookmark**: 
   - Clique em "Adicionar Bookmark"
   - Cole a URL desejada
   - Clique em "Analisar com IA"
   - Revise e edite as informações geradas
   - Salve o bookmark
3. **Gerenciar Bookmarks**: Use os botões de editar e deletar em cada card

## Funcionalidades da IA

A IA analisa automaticamente o conteúdo da página e gera:
- **Título**: Extraído do título da página ou H1
- **Descrição**: Resumo do conteúdo principal
- **Tags**: Tags relevantes baseadas no conteúdo

## Deploy

Para fazer deploy da aplicação:

1. Configure as variáveis de ambiente na plataforma de deploy
2. Configure um banco PostgreSQL em produção
3. Execute `npm run build`
4. Deploy na Vercel, Netlify ou plataforma de sua escolha

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.
