# StudyCards - MVP

StudyCards é uma plataforma completa para organização de estudos em formato hierárquico (Matérias > Tópicos > Resumos e Questões). O sistema suporta múltiplos usuários isoladamente com login seguro, permitindo a criação e gestão de flashcards e resumos textuais perfeitamente organizados.

## Tecnologias Empregadas 🚀

- **Next.js (App Router)** - React Framework liderando tanto o frontend quanto a API do backend.
- **SQLite & Prisma ORM** - Banco de dados embutido (perfeito para inicialização local e MVP) com tipagem estática.
- **Vanilla CSS** - Design System Premium customizado do zero, responsivo, com Glassmorphism minimalista.
- **JWT (Jose) & bcryptjs** - Autenticação leve utilizando cookies seguros HTTP-Only.

## Como Rodar Localmente 💻

1. **Instale as dependências:**
   ```bash
   npm install
   ```
2. **Configure o banco de dados e ambiente:**
   - Crie/verifique se existe um arquivo `.env` na raiz do projeto contendo:
     ```env
     DATABASE_URL="file:./dev.db"
     JWT_SECRET="digite_uma_senha_super_secreta_aqui"
     ```
   - Sincronize o banco de dados local com o schema Prisma:
     ```bash
     npx prisma generate
     npx prisma db push
     ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000` em seu navegador e cadastre sua primeira conta!
