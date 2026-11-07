-- Resolve Duitku callbacks that arrive before createInvoice reference persistence.
-- Apply only after reconciling this migration with the target project's migration history.
-- This repository change does not apply this migration to Supabase.
begin;

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

  if p_reference is null or btrim(p_reference) = ''
     or v_payment.duitku_reference is null
     or v_payment.duitku_reference is distinct from p_reference then
    raise exception 'Invoice reference is not persisted or does not match';
  end if;

  for v_event in
    select *
    from public.divoom_payment_callback_events
    where merchant_order_id = p_merchant_order_id
      and processing_result = 'awaiting_invoice_reference'
    order by received_at asc, id asc
    for update
  loop
    if v_event.duitku_reference is distinct from v_payment.duitku_reference then
      update public.divoom_payment_callback_events
        set processing_result = 'reference_mismatch'
        where id = v_event.id;
      continue;
    end if;

    if v_event.result_code is null or v_event.result_code not in ('00', '01') then
      update public.divoom_payment_callback_events
        set processing_result = 'invalid_result_code'
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
  v_existing_result text;
begin
  select * into v_payment
  from public.divoom_payment_transactions
  where merchant_order_id = p_merchant_order_id
  for update;

  if not found then
    raise exception 'Unknown merchant order';
  end if;
  if p_event_hash is null or btrim(p_event_hash) = '' then
    raise exception 'Callback event hash is required';
  end if;
  if p_merchant_order_id is null or btrim(p_merchant_order_id) = '' then
    raise exception 'Merchant order ID is required';
  end if;
  if p_amount is null or v_payment.payment_amount <> p_amount then
    raise exception 'Callback amount mismatch';
  end if;
  if p_reference is null or btrim(p_reference) = '' then
    raise exception 'Callback reference is required';
  end if;
  if p_result_code is null or p_result_code not in ('00', '01') then
    raise exception 'Unsupported callback result code';
  end if;

  if v_payment.duitku_reference is not null
     and v_payment.duitku_reference is distinct from p_reference then
    raise exception 'Callback reference mismatch';
  end if;

  -- A signed callback can safely supply the provider reference when the
  -- Create Invoice response was delayed or lost.
  if v_payment.duitku_reference is null then
    update public.divoom_payment_transactions
      set duitku_reference = p_reference, updated_at = now()
      where id = v_payment.id;
    v_payment.duitku_reference := p_reference;
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
    select processing_result into v_existing_result
    from public.divoom_payment_callback_events
    where event_hash = p_event_hash;

    if v_existing_result = 'awaiting_invoice_reference' then
      perform public.divoom_reconcile_pending_payment_callbacks(
        p_merchant_order_id, v_payment.duitku_reference
      );
    end if;

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

revoke all on function public.divoom_reconcile_pending_payment_callbacks(text,text) from public, anon, authenticated;
grant execute on function public.divoom_reconcile_pending_payment_callbacks(text,text) to service_role;
revoke all on function public.divoom_apply_payment_callback(text,text,bigint,text,text,text) from public, anon, authenticated;
grant execute on function public.divoom_apply_payment_callback(text,text,bigint,text,text,text) to service_role;

commit;
