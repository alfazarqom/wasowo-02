-- Divoom-only Duitku POP transaction schema.
-- Apply manually after reviewing this migration. This file is not executed by this change.
begin;

create table if not exists public.divoom_orders (
  id uuid primary key default gen_random_uuid(),
  merchant_order_id varchar(50) not null unique,
  idempotency_key text not null unique,
  checkout_request_hash text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address text not null,
  shipping_city text,
  currency char(3) not null default 'IDR' check (currency = 'IDR'),
  subtotal bigint not null check (subtotal >= 0),
  shipping_cost bigint not null default 52000 check (shipping_cost = 52000),
  total_amount bigint not null check (total_amount = subtotal + shipping_cost),
  order_status text not null default 'pending_payment'
    check (order_status in ('pending_payment','paid','payment_failed','expired','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.divoom_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.divoom_orders(id) on delete cascade,
  product_id text not null references public.divoom_products(id) on update cascade on delete restrict,
  product_title text not null,
  unit_price bigint not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 99),
  line_total bigint generated always as (unit_price * quantity) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.divoom_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.divoom_orders(id) on delete restrict,
  merchant_order_id varchar(50) not null unique references public.divoom_orders(merchant_order_id) on update cascade on delete restrict,
  duitku_reference text unique,
  payment_amount bigint not null check (payment_amount > 0),
  payment_method text,
  status text not null default 'pending'
    check (status in ('pending','paid','failed','expired','invoice_failed','invoice_unknown')),
  provider_status_code text,
  provider_status_message text,
  provider_response jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.divoom_payment_callback_events (
  id uuid primary key default gen_random_uuid(),
  event_hash text not null unique,
  order_id uuid references public.divoom_orders(id) on delete set null,
  merchant_order_id varchar(50) not null,
  duitku_reference text,
  result_code text not null,
  payment_code text,
  processing_result text not null,
  received_at timestamptz not null default now()
);

create table if not exists public.divoom_checkout_rate_limits (
  key_hash text not null,
  action text not null check (action in ('create_invoice','order_status')),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count >= 1),
  primary key (key_hash, action)
);

create index if not exists divoom_orders_email_created_idx
  on public.divoom_orders (lower(customer_email), created_at desc);
create index if not exists divoom_order_items_order_idx
  on public.divoom_order_items (order_id);
create index if not exists divoom_payment_transactions_status_idx
  on public.divoom_payment_transactions (status, created_at);
create index if not exists divoom_callback_events_order_idx
  on public.divoom_payment_callback_events (merchant_order_id, received_at desc);

alter table public.divoom_orders enable row level security;
alter table public.divoom_order_items enable row level security;
alter table public.divoom_payment_transactions enable row level security;
alter table public.divoom_payment_callback_events enable row level security;
alter table public.divoom_checkout_rate_limits enable row level security;

-- No anon/authenticated policies: all writes and guest status reads go through Edge Functions.
revoke all on public.divoom_orders, public.divoom_order_items,
  public.divoom_payment_transactions, public.divoom_payment_callback_events,
  public.divoom_checkout_rate_limits from public, anon, authenticated;
grant all on public.divoom_orders, public.divoom_order_items,
  public.divoom_payment_transactions, public.divoom_payment_callback_events,
  public.divoom_checkout_rate_limits to service_role;

create or replace function public.divoom_consume_rate_limit(
  p_key_hash text,
  p_action text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  insert into public.divoom_checkout_rate_limits(key_hash, action, window_started_at, request_count)
  values (p_key_hash, p_action, now(), 1)
  on conflict (key_hash, action) do update
    set window_started_at = case
          when public.divoom_checkout_rate_limits.window_started_at
               <= now() - make_interval(secs => p_window_seconds)
          then now()
          else public.divoom_checkout_rate_limits.window_started_at
        end,
        request_count = case
          when public.divoom_checkout_rate_limits.window_started_at
               <= now() - make_interval(secs => p_window_seconds)
          then 1
          else public.divoom_checkout_rate_limits.request_count + 1
        end
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

create or replace function public.divoom_apply_payment_callback(
  p_event_hash text,
  p_merchant_order_id text,
  p_amount bigint,
  p_reference text,
  p_result_code text,
  p_payment_code text
) returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment public.divoom_payment_transactions%rowtype;
  v_event_id uuid;
  v_next_status text;
  v_order_status text;
  v_result text;
begin
  if p_result_code not in ('00', '01') then
    raise exception 'Unsupported Duitku result code';
  end if;

  select * into v_payment
  from public.divoom_payment_transactions
  where merchant_order_id = p_merchant_order_id
  for update;

  if not found then
    raise exception 'Unknown merchant order';
  end if;
  if v_payment.payment_amount <> p_amount then
    raise exception 'Callback amount mismatch';
  end if;
  if v_payment.duitku_reference is distinct from p_reference then
    raise exception 'Callback reference mismatch';
  end if;

  insert into public.divoom_payment_callback_events(
    event_hash, order_id, merchant_order_id, duitku_reference,
    result_code, payment_code, processing_result
  ) values (
    p_event_hash, v_payment.order_id, p_merchant_order_id, p_reference,
    p_result_code, p_payment_code, 'received'
  )
  on conflict (event_hash) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return 'duplicate';
  end if;

  if v_payment.status <> 'pending' then
    update public.divoom_payment_callback_events
      set processing_result = 'ignored_terminal_state'
      where id = v_event_id;
    return 'ignored';
  end if;

  v_next_status := case when p_result_code = '00' then 'paid' else 'failed' end;
  v_order_status := case when p_result_code = '00' then 'paid' else 'payment_failed' end;

  update public.divoom_payment_transactions
    set status = v_next_status,
        payment_method = coalesce(nullif(p_payment_code, ''), payment_method),
        paid_at = case when v_next_status = 'paid' then now() else null end,
        updated_at = now()
    where id = v_payment.id;

  update public.divoom_orders
    set order_status = v_order_status, updated_at = now()
    where id = v_payment.order_id;

  update public.divoom_payment_callback_events
    set processing_result = v_next_status
    where id = v_event_id;

  return v_next_status;
end;
$$;

revoke all on function public.divoom_consume_rate_limit(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.divoom_consume_rate_limit(text,text,integer,integer) to service_role;
revoke all on function public.divoom_apply_payment_callback(text,text,bigint,text,text,text) from public, anon, authenticated;
grant execute on function public.divoom_apply_payment_callback(text,text,bigint,text,text,text) to service_role;

commit;
