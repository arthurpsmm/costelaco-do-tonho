-- TaPronto — função de criação de pedido
-- Rode depois do schema.sql e do seed.sql, também no SQL Editor.
--
-- Por que uma função em vez de INSERT direto na tabela:
-- o preço de cada item vem do banco (menu_items), nunca do que o navegador
-- do cliente envia — assim ninguém consegue manipular o total do pedido
-- alterando a requisição no navegador.

create or replace function create_order(
  p_tenant_slug text,
  p_customer_name text,
  p_customer_phone text,
  p_pickup_date date,
  p_pickup_window_id uuid,
  p_marmita_item_id uuid,
  p_protein_choice text[],
  p_cutlery boolean,
  p_drink_item_id uuid,
  p_notes text
)
returns table (order_id uuid, ticket_number integer, total_cents integer)
language plpgsql
as $$
declare
  v_tenant_id uuid;
  v_marmita record;
  v_cutlery record;
  v_drink record;
  v_items jsonb := '[]'::jsonb;
  v_total integer := 0;
  v_order_id uuid;
  v_ticket integer;
begin
  select id into v_tenant_id from tenants where slug = p_tenant_slug;
  if v_tenant_id is null then
    raise exception 'Restaurante não encontrado';
  end if;

  select id, name, price_cents into v_marmita
  from menu_items
  where id = p_marmita_item_id and tenant_id = v_tenant_id and category = 'marmita' and active = true;
  if v_marmita.id is null then
    raise exception 'Item de marmita inválido';
  end if;

  v_items := v_items || jsonb_build_object(
    'menu_item_id', v_marmita.id,
    'name', v_marmita.name,
    'price_cents', v_marmita.price_cents,
    'proteins', to_jsonb(p_protein_choice),
    'quantity', 1
  );
  v_total := v_total + v_marmita.price_cents;

  if p_cutlery then
    select id, name, price_cents into v_cutlery
    from menu_items
    where tenant_id = v_tenant_id and category = 'addon_cutlery' and active = true
    limit 1;
    if v_cutlery.id is not null then
      v_items := v_items || jsonb_build_object(
        'menu_item_id', v_cutlery.id,
        'name', v_cutlery.name,
        'price_cents', v_cutlery.price_cents,
        'quantity', 1
      );
      v_total := v_total + v_cutlery.price_cents;
    end if;
  end if;

  if p_drink_item_id is not null then
    select id, name, price_cents into v_drink
    from menu_items
    where id = p_drink_item_id and tenant_id = v_tenant_id and category = 'addon_drink' and active = true;
    if v_drink.id is not null then
      v_items := v_items || jsonb_build_object(
        'menu_item_id', v_drink.id,
        'name', v_drink.name,
        'price_cents', v_drink.price_cents,
        'quantity', 1
      );
      v_total := v_total + v_drink.price_cents;
    end if;
  end if;

  insert into orders (
    tenant_id, customer_name, customer_phone, pickup_date,
    pickup_window_template_id, items, notes, total_cents
  ) values (
    v_tenant_id, p_customer_name, p_customer_phone, p_pickup_date,
    p_pickup_window_id, v_items, p_notes, v_total
  )
  returning id, orders.ticket_number into v_order_id, v_ticket;

  return query select v_order_id, v_ticket, v_total;
end;
$$;

grant execute on function create_order(
  text, text, text, date, uuid, uuid, text[], boolean, uuid, text
) to anon, authenticated;
