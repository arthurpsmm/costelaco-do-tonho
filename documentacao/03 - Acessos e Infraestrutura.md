# Acessos e Infraestrutura

> Por segurança, senhas e chaves **não estão escritas aqui** — só onde
> precisam estar (variáveis de ambiente / painéis oficiais).

## Site + sistema de pedidos

- **URL pública:** https://costelaco-do-tonho.vercel.app
- **Painel do restaurante:** https://costelaco-do-tonho.vercel.app/admin/login
  - Login do dono: `arthurpsm2008@gmail.com` (senha definida por você)
  - Outros funcionários: criados pelo próprio painel, em **Equipe** (só o
    dono vê essa aba)

## Hospedagem — Vercel

- Conta: `arthurpsm2008-6154` (a mesma conta Vercel de sempre)
- Projeto: `psm-projects/costelaco-do-tonho`
- Pra atualizar o site depois de uma mudança no código: rodar
  `npx vercel --prod --yes` dentro da pasta do projeto.
- Domínio próprio (`costelacodotonho.com.br`) ainda **não está configurado**
  — hoje é preciso digitar o link `.vercel.app`. Dá pra apontar o domínio
  próprio quando quiser (ver [[04 - Próximos Passos]]).

## Banco de dados — Supabase

- Projeto: `costelaco-do-tonho` (ref `mrbanuwezubtupknbvlv`)
- Painel: supabase.com → login → esse projeto
- Guarda: cardápio, pedidos, horários/capacidade, contas da equipe
- Schema e funções do banco estão versionados no código, em
  `supabase/schema.sql`, `supabase/seed.sql` e `supabase/functions.sql`

## Onde ficam as chaves/senhas de verdade

- **No computador:** arquivo `.env.local` dentro da pasta do projeto
  (não vai pro GitHub, está no `.gitignore`)
- **Em produção:** Vercel → projeto → Settings → Environment Variables
- **Senha do painel:** só você sabe, defina/troque em Supabase →
  Authentication → Users

## Nota relacionada

[[00 - Visão Geral]] · [[02 - Sistema de Pedidos (TaPronto)]]
