# StudyCards - MVP

StudyCards é uma plataforma completa para organização de estudos em formato hierárquico (Matérias > Tópicos > Resumos e Questões). O sistema suporta múltiplos usuários isoladamente com login seguro, permitindo a criação e gestão de flashcards e resumos textuais perfeitamente organizados.

## Tecnologias Empregadas 🚀

- **Next.js (App Router)** - React Framework liderando tanto o frontend quanto a API do backend.
- **PostgreSQL & Prisma ORM** - Banco de dados relacional (perfeito para hierarquias com cascade) e tipagem estática.
- **Vanilla CSS** - Design System Premium customizado do zero, responsivo, com Glassmorphism minimalista.
- **JWT (Jose) & bcryptjs** - Autenticação leve compatível com ambientes Edge (como a Vercel/Next middleware).

## Como Rodar Localmente 💻

1. **Instale as dependências:**
   ```bash
   npm install
   ```
2. **Configure o banco de dados:**
   - Crie um arquivo `.env` na raiz do projeto contendo as strings de conexão:
     ```env
     DATABASE_URL="postgresql://usuario:senha@localhost:5432/studycards"
     JWT_SECRET="digite_uma_senha_super_secreta_aqui"
     ```
   - Construa as tabelas em seu banco de dados vazio:
     ```bash
     npx prisma db push
     ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000` e crie a sua primeira conta.

## Como realizar o Deploy no Render ☁️

A infraestrutura foi pensada para subida simples em serviços de cloud.

1. Crie um **Web Service** no [Render](https://render.com/) integrado ao seu GitHub.
2. Defina o **Build Command** exatamente como:
   ```bash
   npm install && npx prisma generate && npx prisma db push && npm run build
   ```
   *(Nota: `prisma db push` criará as tabelas. Em produção pesada, usaríamos `prisma migrate deploy`.)*
3. Defina o **Start Command** como:
   ```bash
   npm start
   ```
4. Na aba **Environment Variables**, adicione as seguintes chaves:
   - `DATABASE_URL` (crie um banco nativo no Render Postgres e cole o Link Interno aqui)
   - `JWT_SECRET` (qualquer string aleatória)
   - `NODE_ENV` definido como `production`
5. Pressione "Deploy" e acesse o link finalizado.
