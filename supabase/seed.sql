-- TaPronto — dados iniciais do Costelaço do Tonho
-- Rode depois do schema.sql, também no SQL Editor.

insert into tenants (slug, name)
values ('costelaco-do-tonho', 'Costelaço do Tonho')
on conflict (slug) do nothing;

-- Marmitas
insert into menu_items (tenant_id, category, name, short_name, description, volume_label, price_cents, protein_options, protein_pick_count, sort_order)
select t.id, 'marmita', 'Tipo 01 — Carne Mista', 'Carne Mista', 'Frango, linguiça, porco e gado', '1.100ml', 3200, null, null, 1
from tenants t where t.slug = 'costelaco-do-tonho'
on conflict do nothing;

insert into menu_items (tenant_id, category, name, short_name, description, volume_label, price_cents, protein_options, protein_pick_count, sort_order)
select t.id, 'marmita', 'Tipo 02 — Só Gado', 'Só Gado', 'Escolha um corte bovino', '1.100ml', 3900,
       '["Maminha","Cupim","Fraldinha"]'::jsonb, 1, 2
from tenants t where t.slug = 'costelaco-do-tonho'
on conflict do nothing;

insert into menu_items (tenant_id, category, name, short_name, description, volume_label, price_cents, protein_options, protein_pick_count, sort_order)
select t.id, 'marmita', 'Tipo 03 — 2 Proteínas', '2 Proteínas', 'Escolha 2 — não pode ser 2 vezes gado', '750ml', 2300,
       '["Frango","Gado","Porco"]'::jsonb, 2, 3
from tenants t where t.slug = 'costelaco-do-tonho'
on conflict do nothing;

-- Talheres
insert into menu_items (tenant_id, category, name, short_name, price_cents, sort_order)
select t.id, 'addon_cutlery', 'Talheres descartáveis', 'Talheres', 100, 1
from tenants t where t.slug = 'costelaco-do-tonho'
on conflict do nothing;

-- Bebidas (sem preço fixo — informado no balcão, como no site)
insert into menu_items (tenant_id, category, name, short_name, price_cents, sort_order)
select t.id, 'addon_drink', d.name, d.name, 0, d.ord
from tenants t,
  (values ('Sem bebida', 0), ('Coca-Cola lata', 1), ('Guaraná lata', 2), ('Suco natural', 3), ('Água mineral', 4)) as d(name, ord)
where t.slug = 'costelaco-do-tonho'
on conflict do nothing;

-- Janelas de retirada: 11:00–14:00 em blocos de 15min, capacidade 6, pico 11:45–12:30
insert into pickup_window_templates (tenant_id, start_time, end_time, capacity, is_peak, sort_order)
select
  t.id,
  (time '11:00' + (n * interval '15 min')),
  (time '11:00' + ((n + 1) * interval '15 min')),
  6,
  (time '11:00' + (n * interval '15 min')) between time '11:45' and time '12:30',
  n
from tenants t, generate_series(0, 11) as n
where t.slug = 'costelaco-do-tonho'
on conflict do nothing;
