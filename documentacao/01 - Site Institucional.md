# Site Institucional

## Páginas

- **Home** (`/`) — hero de tela cheia (foto real do restaurante com blur estilizado, texto por cima), seção "Sobre" já embutida na home (não precisa clicar em nada pra ver a história), bifurcação Almoço/Jantar, prévia do cardápio com preços reais, galeria de fotos, mapa do Google, chamada final.
- **Cardápio** (`/cardapio`) — abas Almoço/Jantar com os preços reais do estabelecimento (Espeto Corrido, Rodízio de Pizza, Marmitas).
- **Contato** (`/contato`) — endereço, mapa, horários, telefone.
- **Sobre** (`/sobre`) — redireciona pra âncora `#sobre` da home (conteúdo único, sem duplicar).
- **Pedir marmita** — todos os botões "Pedir marmita" do site levam direto pro sistema de pedidos em `/pedido/novo`.

## Identidade visual

- **Paleta:** brasa `#A92A1F`, carvão `#1B1512`, parchment (bege quente) `#EFE6D8`, âmbar `#9C6A1F`.
- **Tipografia:** Fraunces (serifada, títulos) + Work Sans (texto/UI).
- **Fotografia:** fotos reais do restaurante em `public/images/galeria/` (a logo tem só 149×150px — se conseguir uma versão maior/vetorizada no futuro, fica ainda mais nítida em telas grandes).

## Tecnologias

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion (animações).

## Nota relacionada

[[00 - Visão Geral]]
