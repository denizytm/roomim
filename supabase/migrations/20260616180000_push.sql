-- Push bildirimleri: profiles.expo_push_token + pg_net ile doğrudan Expo push API'sine POST.
-- Trigger'lar: yeni mesaj, yeni ilgi (conversation insert), eşleşme onayı (accepted).

alter table public.profiles add column if not exists expo_push_token text;

create extension if not exists pg_net;

-- Yardımcı: alıcının token'ına Expo push gönder
create or replace function public.send_push(recipient uuid, title text, body text, data jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text;
begin
  select expo_push_token into v_token from public.profiles where id = recipient;
  if v_token is null or v_token = '' then
    return;
  end if;
  perform net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    body := jsonb_build_object(
      'to', v_token,
      'title', title,
      'body', body,
      'sound', 'default',
      'data', data
    ),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
end;
$$;

-- Yeni mesaj → karşı tarafa bildirim
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient uuid;
  v_sender    text;
begin
  select case when c.seeker_id = new.sender_id then c.host_id else c.seeker_id end
    into v_recipient
  from public.conversations c
  where c.id = new.conversation_id;
  if v_recipient is null then return new; end if;

  select coalesce(full_name, 'Yeni mesaj') into v_sender
  from public.profiles where id = new.sender_id;

  perform public.send_push(
    v_recipient,
    v_sender,
    new.body,
    jsonb_build_object('conversationId', new.conversation_id)
  );
  return new;
end;
$$;

drop trigger if exists on_message_notify on public.messages;
create trigger on_message_notify
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- Yeni ilgi (pending) → ev sahibine; eşleşme onayı (accepted) → arayan kişiye
create or replace function public.notify_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient uuid;
  v_name      text;
  v_title     text;
  v_body      text;
begin
  if (tg_op = 'INSERT') then
    v_recipient := new.host_id;
    select coalesce(full_name, 'Biri') into v_name from public.profiles where id = new.seeker_id;
    v_title := 'Yeni ilgi';
    v_body := v_name || ' ilanınla ilgileniyor';
  elsif (tg_op = 'UPDATE' and new.status = 'accepted' and old.status is distinct from 'accepted') then
    v_recipient := new.seeker_id;
    select coalesce(full_name, 'Ev sahibi') into v_name from public.profiles where id = new.host_id;
    v_title := 'Eşleştiniz! 🎉';
    v_body := v_name || ' isteğini onayladı';
  else
    return new;
  end if;

  perform public.send_push(v_recipient, v_title, v_body, jsonb_build_object('conversationId', new.id));
  return new;
end;
$$;

drop trigger if exists on_conversation_notify on public.conversations;
create trigger on_conversation_notify
  after insert or update on public.conversations
  for each row execute function public.notify_conversation();
