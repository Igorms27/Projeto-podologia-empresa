# Projeto Podologia

Sistema de gerenciamento para clínica de podologia desenvolvido com Angular.

## Requisitos

- Node.js (v14+)
- Angular CLI (v13+)
- Yarn ou NPM

## Configuração Inicial

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/Projeto-podologia-empresa.git
cd Projeto-podologia-empresa
```

2. Instale as dependências:

```bash
yarn install
```

3. Configure as variáveis de ambiente:
   - Copie o conteúdo do arquivo `src/environments/environment.ts` para um novo arquivo `src/environments/environment.local.ts`
   - Preencha as informações do Firebase no arquivo `environment.local.ts`

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
yarn start
```

O aplicativo estará disponível em `http://localhost:4200/`.

## Build

Para gerar uma versão de produção:

```bash
yarn build:cloudflare
```

Os arquivos serão gerados na pasta `dist/demo/`.

## Deploy na Cloudflare Pages

### Configuração na Cloudflare:

1. No dashboard da Cloudflare, acesse "Pages"
2. Clique em "Create a project" e selecione "Connect to Git"
3. Escolha o repositório e configure o build:

   - Framework preset: Angular
   - Build command: `yarn build:cloudflare`
   - Build output directory: `dist/demo`

4. Na seção "Environment variables", adicione as variáveis do Firebase:

   ```
   FIREBASE_API_KEY
   FIREBASE_AUTH_DOMAIN
   FIREBASE_PROJECT_ID
   FIREBASE_STORAGE_BUCKET
   FIREBASE_MESSAGING_SENDER_ID
   FIREBASE_APP_ID
   FIREBASE_MEASUREMENT_ID
   ```

5. Clique em "Save and Deploy"

### Atualizando o deploy:

Após fazer alterações, basta fazer commit e push para o GitHub. A Cloudflare fará automaticamente o deploy da nova versão.

## Segurança

Este projeto segue as seguintes práticas de segurança:

1. Não armazena chaves de API diretamente no código-fonte
2. Utiliza variáveis de ambiente para informações sensíveis
3. Implementa controle de acesso baseado em papéis
4. Protege rotas com guards

## Estrutura do Projeto

- `/src/app/admin` - Módulo administrativo
- `/src/app/auth` - Autenticação
- `/src/app/core` - Serviços e componentes principais
- `/src/app/shared` - Componentes, pipes e utilitários compartilhados
