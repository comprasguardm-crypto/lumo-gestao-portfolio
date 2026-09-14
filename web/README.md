# Lumo Gestão — Web

Painel administrativo do Lumo Gestão, desenvolvido com Next.js, React, TypeScript e Tailwind CSS.

## Funcionalidades

- Autenticação com Supabase Auth
- Dashboard com indicadores de colaboradores, ponto, férias e documentos
- Cadastro e gestão de colaboradores
- Controle de ponto e jornada
- Gestão de férias
- Documentos com armazenamento privado e URLs assinadas
- Recrutamento
- Treinamentos
- Indicadores de desempenho
- Relatórios CSV
- Configurações de empresa, permissões e locais de ponto
- Notificações por usuário e empresa
- Assistente Lumo AI integrado ao produto

## Configuração

Crie um arquivo `.env.local` a partir de `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUBSTITUA_AQUI
```

Nunca coloque chaves administrativas, `service_role` ou outros segredos no frontend.

## Rodar localmente

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Estrutura

```text
app/             rotas e páginas Next.js
components/      componentes de interface e módulos
services/        integrações e regras de negócio no cliente
lib/             autenticação, acesso à API e utilidades
mocks/           dados fictícios para demonstração
adapters/        adaptação entre modelos da aplicação
```

## Segurança

- Dados autenticados são protegidos por sessão e políticas de acesso no banco.
- Documentos privados utilizam URLs temporárias assinadas.
- Segredos administrativos permanecem no backend.
- Variáveis públicas necessárias ao cliente são configuradas por ambiente.
