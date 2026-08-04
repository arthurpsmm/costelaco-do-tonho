# Sistema de Pedidos — TaPronto

Sistema criado pra resolver o problema real: fila desorganizada de marmita no
almoço, pedidos bagunçados no WhatsApp, gente perguntando toda hora se já
ficou pronto. A ideia central: o WhatsApp continua existindo como canal de
aviso, mas deixa de ser o "banco de dados" do pedido.

## Fluxo do cliente

1. Clica em "Pedir marmita" no site.
2. Monta o pedido em `/pedido/novo` (tipo de marmita, proteína, talheres,
   bebida, horário de retirada — só aparecem horários com vaga real).
3. Confirma com nome e telefone.
4. Recebe uma **senha numérica automática** e vai pra `/pedido/[id]`.
5. Essa página **atualiza sozinha** (tempo real) conforme o status muda —
   Recebido → Em preparo → Pronto → Entregue. Não precisa ficar perguntando.

## Fluxo da equipe (painel `/admin`)

Cinco áreas, com acesso diferente por papel:

| Área | Dono | Cozinha | Balcão |
|---|---|---|---|
| Fila (avançar status, cancelar, avisar no WhatsApp) | ✅ | ✅ | ✅ |
| Pedidos (histórico por dia, excluir individual ou tudo de uma vez) | ✅ | ✅ | ✅ |
| Cardápio (editar itens e preços) | ✅ | ✅ | ✅ |
| Horários (capacidade de vaga por janela de 15min) | ✅ | ❌ | ❌ |
| Equipe (adicionar/remover funcionário) | ✅ | ❌ | ❌ |

## Segurança (o que impede um cliente de "quebrar" o sistema)

- Preço do pedido é **sempre calculado no banco**, nunca confia no que o
  navegador do cliente envia.
- Cada horário tem uma trava de capacidade de verdade no banco (não é só
  visual) — dois pedidos simultâneos não conseguem lotar a mesma vaga.
- Cliente sem login só consegue **criar** um pedido e **ver o próprio** pelo
  link (que funciona como um token, tipo link de rastreio de encomenda) —
  nunca vê pedido de outra pessoa nem mexe em cardápio/horários/equipe.
- Regra de segurança do banco (Row Level Security) já pensada pra, no
  futuro, atender vários restaurantes ao mesmo tempo sem misturar dados de
  um cliente com o de outro.

## O que ficou de fora por decisão (não por esquecimento)

- **WhatsApp automático de verdade** — exige aprovação de negócio da Meta,
  processo que não é imediato. Hoje o aviso de "pronto" é manual: 1 clique
  no painel abre o WhatsApp já com a mensagem pronta.
- **Pagamento (Pix) no pedido.**
- **Painel de TV** mostrando a senha chamada no balcão.
- **Relatórios** (horário de pico, produto mais vendido, tempo médio).

Essas quatro coisas são a "Fase 2" natural do sistema.

## Nota relacionada

[[00 - Visão Geral]] · [[03 - Acessos e Infraestrutura]]
