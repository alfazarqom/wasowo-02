-- Duitku POP protocol alignment and durable callback/invoice reconciliation.
-- Repository proposal only: do NOT run against the live Supabase project without
-- a separately approved schema-drift review and migration execution.
begin;

alter table public.divoom_payment_transactions
  add column if not exists payment_url text,
  add column if not exists invoice_creation_state text not null default 'not_started',
  add column if not exists invoice_attempted_at timestamptz,
  add column if not exists invoice_response_received_at timestamptz,
  add column if not exists invoice_error_message text,
  add column if not exists callback_metadata jsonb not null default '{}'::jsonb;

alter table public.divoom_payment_callback_events
  add column if not exists amount bigint,
  add column if not exists amount_text text,
  add column if not exists provider_metadata jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'divoom_payment_transactions_invoice_creation_state_check'
      and conrelid = 'public.divoom_payment_transactions'::regclass
  ) then
    alter table public.divoom_payment_transactions
      add constraint divoom_payment_transactions_invoice_creation_state_check
      check (invoice_creation_state in ('not_started','in_progress','created','unknown','rejected'));
  end if;
end;
$$;

create index if not exists divoom_callback_events_awaiting_reference_idx
  on public.divoom_payment_callback_events (merchant_order_id, received_at)
  where processing_result = 'awaiting_invoice_reference';

create or replace function public.divoom_reconcile_pending_payment_callbacks(
  p_merchant_order_id text,
  p_reference text
) returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment public.divoom_payment_transactions%rowtype;
  v_event public.divoom_payment_callback_events%rowtype;
  v_processed integer := 0;
  v_next_status text;
  v_order_status text;
begin
  select * into v_payment
  from public.divoom_payment_transactions
  where merchant_order_id = p_merchant_order_id
  for update;

  if not found then
    raise exception 'Unknown merchant order';
  end if;

  if v_payment.duitku_reference is null
     or v_payment.duitku_reference is distinct from p_reference then
    raise exception 'Persisted Duitku reference mismatch';
  end if;

  for v_event in
    select *
    from public.divoom_payment_callback_events
    where merchant_order_id = p_merchant_order_id
      and processing_result = 'awaiting_invoice_reference'
    order by received_at asc, id asc
    for update
  loop
    if v_event.amount is distinct from v_payment.payment_amount then
      update public.divoom_payment_callback_events
        set processing_result = 'amount_mismatch'
        where id = v_event.id;
      continue;
    end if;

    if v_event.duitku_reference is distinct from v_payment.duitku_reference then
      update public.divoom_payment_callback_events
        set processing_result = 'reference_mismatch'
        where id = v_event.id;
      continue;
    end if;

    if v_event.result_code not in ('00','01','02') then
      update public.divoom_payment_callback_events
        set processing_result = 'unsupported_result_code'
        where id = v_event.id;
      continue;
    end if;

    if v_payment.status <> 'pending' then
      update public.divoom_payment_callback_events
        set processing_result = 'ignored_terminal_state'
        where id = v_event.id;
      continue;
    end if;

    v_next_status := case when v_event.result_code = '00' then 'paid' else 'failed' end;
    v_order_status := case when v_event.result_code = '00' then 'paid' else 'payment_failed' end;

    update public.divoom_payment_transactions
      set status = v_next_status,
          payment_method = coalesce(nullif(v_event.payment_code, ''), payment_method),
          callback_metadata = coalesce(v_event.provider_metadata, '{}'::jsonb),
          paid_at = case when v_next_status = 'paid' then now() else null end,
          updated_at = now()
      where id = v_payment.id;

    update public.divoom_orders
      set order_status = v_order_status, updated_at = now()
      where id = v_payment.order_id;

    update public.divoom_payment_callback_events
      set processing_result = v_next_status
      where id = v_event.id;

    v_payment.status := v_next_status;
    v_processed := v_processed + 1;
  end loop;

  return v_processed;
end;
$$;

create or replace function public.divoom_record_invoice_result(
  p_merchant_order_id text,
  p_reference text,
  p_payment_url text,
  p_status_code text,
  p_status_message text,
  p_provider_response jsonb
) returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment public.divoom_payment_transactions%rowtype;
  v_processed integer := 0;
begin
  if nullif(trim(p_reference), '') is null then
    raise exception 'Duitku reference is required';
  end if;

  select * into v_payment
  from public.divoom_payment_transactions
  where merchant_order_id = p_merchant_order_id
  for update;

  if not found then
    raise exception 'Unknown merchant order';
  end if;

  if v_payment.duitku_reference is not null
     and v_payment.duitku_reference is distinct from p_reference then
    raise exception 'Duitku reference already exists and does not match';
  end if;

  update public.divoom_payment_transactions
    set duitku_reference = p_reference,
        payment_url = nullif(p_payment_url, ''),
        invoice_creation_state = 'created',
        invoice_response_received_at = coalesce(invoice_response_received_at, now()),
        invoice_error_message = null,
        provider_status_code = nullif(p_status_code, ''),
        provider_status_message = nullif(left(coalesce(p_status_message, ''), 250), ''),
        provider_response = coalesce(p_provider_response, '{}'::jsonb),
        updated_at = now()
    where id = v_payment.id;

  v_processed := public.divoom_reconcile_pending_payment_callbacks(
    p_merchant_order_id, p_reference
  );

  return v_processed;
end;
$$;

drop function if exists public.divoom_apply_payment_callback(text,text,bigint,text,text,text);

create function public.divoom_apply_payment_callback(
  p_event_hash text,
  p_merchant_order_id text,
  p_amount bigint,
  p_amount_text text,
  p_reference text,
  p_result_code text,
  p_payment_code text,
  p_provider_metadata jsonb
) returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment public.divoom_payment_transactions%rowtype;
  v_event_id uuid;
  v_existing_result text;
  v_processing_result text;
  v_next_status text;
  v_order_status text;
begin
  select * into v_payment
  from public.divoom_payment_transactions
  where merchant_order_id = p_merchant_order_id
  for update;

  if not found then
    raise exception 'Unknown merchant order';
  end if;

  if p_amount_text is null
     or p_amount_text !~ '^[1-9][0-9]*
    when v_payment.duitku_reference is not null
      and v_payment.duitku_reference is distinct from p_reference then 'reference_mismatch'
    when v_payment.duitku_reference is null then 'awaiting_invoice_reference'
    else 'received'
  end;

  insert into public.divoom_payment_callback_events(
    event_hash, order_id, merchant_order_id, duitku_reference,
    result_code, payment_code, processing_result, amount, amount_text, provider_metadata
  ) values (
    p_event_hash, v_payment.order_id, p_merchant_order_id, p_reference,
    p_result_code, p_payment_code, v_processing_result, p_amount,
    p_amount_text, coalesce(p_provider_metadata, '{}'::jsonb)
  )
  on conflict (event_hash) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select processing_result into v_existing_result
    from public.divoom_payment_callback_events
    where event_hash = p_event_hash;

    if v_existing_result = 'awaiting_invoice_reference'
       and v_payment.duitku_reference is not null then
      perform public.divoom_reconcile_pending_payment_callbacks(
        p_merchant_order_id, v_payment.duitku_reference
      );
    end if;

    return 'duplicate';
  end if;

  if v_processing_result <> 'received' then
    return v_processing_result;
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
        callback_metadata = coalesce(p_provider_metadata, '{}'::jsonb),
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

revoke all on function public.divoom_reconcile_pending_payment_callbacks(text,text)
  from public, anon, authenticated;
grant execute on function public.divoom_reconcile_pending_payment_callbacks(text,text)
  to service_role;

revoke all on function public.divoom_record_invoice_result(text,text,text,text,text,jsonb)
  from public, anon, authenticated;
grant execute on function public.divoom_record_invoice_result(text,text,text,text,text,jsonb)
  to service_role;

revoke all on function public.divoom_apply_payment_callback(text,text,bigint,text,text,text,text,jsonb)
  from public, anon, authenticated;
grant execute on function public.divoom_apply_payment_callback(text,text,bigint,text,text,text,text,jsonb)
  to service_role;

commit;

     or p_amount_text::numeric <> p_amount then
    raise exception 'Callback amount text and numeric amount do not match';
  end if;

  v_processing_result := case
    when v_payment.payment_amount <> p_amount then 'amount_mismatch'
    when p_result_code is null or p_result_code not in ('00','01','02') then 'unsupported_result_code'
    when v_payment.duitku_reference is not null
      and v_payment.duitku_reference is distinct from p_reference then 'reference_mismatch'
    when v_payment.duitku_reference is null then 'awaiting_invoice_reference'
    else 'received'
  end;

  insert into public.divoom_payment_callback_events(
    event_hash, order_id, merchant_order_id, duitku_reference,
    result_code, payment_code, processing_result, amount, amount_text, provider_metadata
  ) values (
    p_event_hash, v_payment.order_id, p_merchant_order_id, p_reference,
    p_result_code, p_payment_code, v_processing_result, p_amount,
    p_amount_text, coalesce(p_provider_metadata, '{}'::jsonb)
  )
  on conflict (event_hash) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select processing_result into v_existing_result
    from public.divoom_payment_callback_events
    where event_hash = p_event_hash;

    if v_existing_result = 'awaiting_invoice_reference'
       and v_payment.duitku_reference is not null then
      perform public.divoom_reconcile_pending_payment_callbacks(
        p_merchant_order_id, v_payment.duitku_reference
      );
    end if;

    return 'duplicate';
  end if;

  if v_processing_result <> 'received' then
    return v_processing_result;
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
        callback_metadata = coalesce(p_provider_metadata, '{}'::jsonb),
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

revoke all on function public.divoom_reconcile_pending_payment_callbacks(text,text)
  from public, anon, authenticated;
grant execute on function public.divoom_reconcile_pending_payment_callbacks(text,text)
  to service_role;

revoke all on function public.divoom_record_invoice_result(text,text,text,text,text,jsonb)
  from public, anon, authenticated;
grant execute on function public.divoom_record_invoice_result(text,text,text,text,text,jsonb)
  to service_role;

revoke all on function public.divoom_apply_payment_callback(text,text,bigint,text,text,text,text,jsonb)
  from public, anon, authenticated;
grant execute on function public.divoom_apply_payment_callback(text,text,bigint,text,text,text,text,jsonb)
  to service_role;

commit;
