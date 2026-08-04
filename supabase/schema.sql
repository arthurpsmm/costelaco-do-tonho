-- TaPronto — schema inicial (multi-tenant desde o dia 1)
-- Rode este arquivo inteiro no SQL Editor do Supabase, de uma vez.

create extension if not exists pgcrypto;

-- ── TENANTS ──────────────────────────────────────────────────────────────
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now()
);

-- ── STAFF (perfil ligado ao auth.users do Supabase) ─────────────────────
create table if not exists staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  tenant_id uuid not null references tenants (id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('owner', 'kitchen', 'counter')),
  created_at timestamptz not null default now()
);

create index if not exists staff_profiles_tenant_idx on staff_profiles (tenant_id);

-- helper: tenant do usuário autenticado atual
create or replace function auth_tenant_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select tenant_id from staff_profiles where user_id = auth.uid();
$$;

-- ── CARDÁPIO ─────────────────────────────────────────────────────────────
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  category text not null check (category in ('marmita', 'addon_cutlery', 'addon_drink')),
  name text not null,
  short_name text not null,
  description text,
  volume_label text,
  price_cents integer not null check (price_cents >= 0),
  protein_options jsonb,        -- ex: ["Maminha","Cupim","Fraldinha"]
  protein_pick_count integer,   -- quantas proteínas o cliente escolhe (1 ou 2)
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists menu_items_tenant_idx on menu_items (tenant_id, category, active);

-- ── JANELAS DE RETIRADA ──────────────────────────────────────────────────
create table if not exists pickup_window_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  start_time time not null,
  end_time time not null,
  capacity integer not null check (capacity > 0),
  is_peak boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists pickup_window_templates_tenant_idx on pickup_window_templates (tenant_id, active);

-- ── CONTADOR DIÁRIO DE SENHA (por tenant + dia) ─────────────────────────
create table if not exists daily_counters (
  tenant_id uuid not null references tenants (id) on delete cascade,
  pickup_date date not null,
  last_ticket_number integer not null default 0,
  primary key (tenant_id, pickup_date)
);

-- ── PEDIDOS ──────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  ticket_number integer,
  customer_name text not null,
  customer_phone text not null,
  pickup_date date not null,
  pickup_window_template_id uuid not null references pickup_window_templates (id),
  status text not null default 'recebido'
    check (status in ('recebido', 'em_preparo', 'pronto', 'entregue', 'cancelado')),
  items jsonb not null,          -- snapshot dos itens escolhidos (nome/preço no momento do pedido)
  notes text,
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_tenant_date_idx on orders (tenant_id, pickup_date);
create index if not exists orders_tenant_status_idx on orders (tenant_id, status);

create table if not exists order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  status text not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users (id)
);

-- updated_at automático
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- grava histórico de status a cada mudança
-- security definer: grava mesmo quando quem chamou (cliente anônimo criando
-- o pedido) não tem permissão de RLS para escrever direto em order_status_events
create or replace function log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') or (new.status is distinct from old.status) then
    insert into order_status_events (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists orders_log_status on orders;
create trigger orders_log_status
  after insert or update on orders
  for each row execute function log_order_status_change();

-- numeração de senha diária + trava de capacidade, de forma atômica
-- security definer: precisa escrever em daily_counters mesmo quando quem
-- chamou é um cliente anônimo criando o pedido (sem permissão de RLS ali)
create or replace function assign_ticket_and_check_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_taken integer;
  v_next integer;
begin
  -- trava só esta janela+dia+tenant até o fim da transação, evita corrida
  perform pg_advisory_xact_lock(
    hashtextextended(new.tenant_id::text || new.pickup_date::text || new.pickup_window_template_id::text, 0)
  );

  select capacity into v_capacity
  from pickup_window_templates
  where id = new.pickup_window_template_id and tenant_id = new.tenant_id;

  if v_capacity is null then
    raise exception 'Janela de retirada inválida para este restaurante';
  end if;

  select count(*) into v_taken
  from orders
  where tenant_id = new.tenant_id
    and pickup_date = new.pickup_date
    and pickup_window_template_id = new.pickup_window_template_id
    and status <> 'cancelado';

  if v_taken >= v_capacity then
    raise exception 'Esta janela de retirada acabou de lotar. Escolha outro horário.';
  end if;

  insert into daily_counters (tenant_id, pickup_date, last_ticket_number)
  values (new.tenant_id, new.pickup_date, 1)
  on conflict (tenant_id, pickup_date)
  do update set last_ticket_number = daily_counters.last_ticket_number + 1
  returning last_ticket_number into v_next;

  new.ticket_number := v_next;
  return new;
end;
$$;

drop trigger if exists orders_assign_ticket on orders;
create trigger orders_assign_ticket
  before insert on orders
  for each row execute function assign_ticket_and_check_capacity();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────
alter table tenants enable row level security;
alter table menu_items enable row level security;
alter table pickup_window_templates enable row level security;
alter table orders enable row level security;
alter table order_status_events enable row level security;
alter table staff_profiles enable row level security;
alter table daily_counters enable row level security;
-- sem policies em daily_counters de propósito: ninguém acessa essa tabela
-- direto, só o gatilho acima (security definer) — fica 100% trancada.

-- tenants: leitura pública (nome do restaurante aparece no site)
drop policy if exists tenants_public_read on tenants;
create policy tenants_public_read on tenants for select using (true);

-- cardápio e janelas: leitura pública, escrita só da equipe do mesmo tenant
drop policy if exists menu_items_public_read on menu_items;
create policy menu_items_public_read on menu_items for select using (active = true);

drop policy if exists menu_items_staff_write on menu_items;
create policy menu_items_staff_write on menu_items for all
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

drop policy if exists pickup_windows_public_read on pickup_window_templates;
create policy pickup_windows_public_read on pickup_window_templates for select using (active = true);

drop policy if exists pickup_windows_staff_write on pickup_window_templates;
create policy pickup_windows_staff_write on pickup_window_templates for all
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

-- pedidos: qualquer um pode criar (fluxo sem login) e ver pelo id (link é o token)
-- a equipe do restaurante vê/atualiza todos os pedidos do próprio tenant
drop policy if exists orders_public_insert on orders;
create policy orders_public_insert on orders for insert with check (true);

drop policy if exists orders_public_read on orders;
create policy orders_public_read on orders for select using (true);

drop policy if exists orders_staff_update on orders;
create policy orders_staff_update on orders for update
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

drop policy if exists order_status_events_read on order_status_events;
create policy order_status_events_read on order_status_events for select using (true);

-- staff_profiles: cada funcionário só vê o próprio perfil
drop policy if exists staff_profiles_self_read on staff_profiles;
create policy staff_profiles_self_read on staff_profiles for select
  using (user_id = auth.uid());

-- ── REALTIME ─────────────────────────────────────────────────────────────
alter publication supabase_realtime add table orders;
