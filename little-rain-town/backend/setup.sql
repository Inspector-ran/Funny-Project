begin;

create schema if not exists rain_town;
revoke all on schema rain_town from public, anon, authenticated;

create table if not exists rain_town.invites (
  id uuid primary key default gen_random_uuid(),
  code_hash bytea unique not null,
  last_action timestamptz
);

create table if not exists rain_town.residents (
  position bigint generated always as identity primary key,
  id text unique not null,
  owner_id uuid unique references rain_town.invites (id),
  name text unique not null check (char_length(name) between 1 and 12),
  appearance jsonb not null,
  place text not null check (place in ('bakery', 'library', 'square', 'bench')),
  mood text not null
);

create table if not exists rain_town.world (
  singleton boolean primary key default true check (singleton),
  revision bigint not null default 0,
  minutes integer not null default 540,
  turn integer not null default 0,
  last_tick timestamptz not null default clock_timestamp(),
  bonds jsonb not null default '{"aqing|nuomi":18}',
  events jsonb not null default '[
    {"time":540,"kind":"solo","title":"小栗选了一本书","body":"雨伞图书屋的窗边，刚好有一张空椅子。"},
    {"time":530,"kind":"meet","title":"糯米和阿晴打了招呼","body":"两个人顺便分了一块刚烤好的小饼干。"},
    {"time":520,"kind":"arrival","title":"小镇开始营业","body":"喷泉醒了，面包房也亮起了灯。"}
  ]'
);

alter table rain_town.invites enable row level security;
alter table rain_town.residents enable row level security;
alter table rain_town.world enable row level security;

insert into rain_town.world default values on conflict do nothing;
insert into rain_town.residents (id, name, appearance, place, mood) values
  ('nuomi', '糯米', '{"temper":"quiet","hair":"buns","hairColor":"orange","shirt":"rose","skin":"pearl","hobby":"baking","phrase":"先吃一小口。"}', 'bakery', '闻到面包香了'),
  ('aqing', '阿晴', '{"temper":"warm","hair":"sweep","hairColor":"brown","shirt":"moss","skin":"peach","hobby":"walking","phrase":"走呀，去看看！"}', 'square', '想找人一起玩'),
  ('xiaoli', '小栗', '{"temper":"curious","hair":"short","hairColor":"plum","shirt":"teal","skin":"sand","hobby":"reading","phrase":"咦，这是为什么？"}', 'library', '挑到一本好书')
on conflict (id) do nothing;

create or replace function rain_town.player(p_code text)
returns uuid
language plpgsql stable set search_path = ''
as $$
declare
  normalized text := replace(lower(btrim(p_code)), '-', '');
  player_id uuid;
begin
  if normalized is null or normalized !~ '^[0-9a-f]{32}$' then
    raise exception 'RAIN_INVITE_INVALID';
  end if;
  select i.id into player_id from rain_town.invites i
  where i.code_hash = sha256(convert_to(normalized, 'UTF8'));
  if player_id is null then raise exception 'RAIN_INVITE_INVALID'; end if;
  return player_id;
end;
$$;

create or replace function rain_town.snapshot()
returns jsonb
language sql volatile set search_path = ''
as $$
  select jsonb_build_object(
    'version', 1, 'revision', w.revision, 'minutes', w.minutes, 'turn', w.turn,
    'bonds', w.bonds, 'events', w.events, 'people',
    coalesce(
      (select jsonb_agg(r.appearance || jsonb_build_object(
        'id', r.id, 'name', r.name, 'place', r.place, 'mood', r.mood
      ) order by r.position) from rain_town.residents r),
      '[]'::jsonb
    )
  )
  from rain_town.world w where w.singleton;
$$;

create or replace function rain_town.add_event(p_kind text, p_title text, p_body text)
returns void
language sql volatile set search_path = ''
as $$
  update rain_town.world w set revision = w.revision + 1, events = (
    select jsonb_agg(e.event order by e.number)
    from jsonb_array_elements(jsonb_build_array(jsonb_build_object(
      'time', w.minutes, 'kind', p_kind, 'title', p_title, 'body', p_body
    )) || w.events) with ordinality as e(event, number)
    where e.number <= 48
  )
  where w.singleton;
$$;

create or replace function rain_town.advance_clock()
returns integer
language sql volatile set search_path = ''
as $$
  update rain_town.world w set
    minutes = case when (w.minutes + 20) % 1440 >= 1200
      then (w.minutes / 1440 + 1) * 1440 + 540
      else w.minutes + 20 end,
    turn = w.turn + 1,
    last_tick = clock_timestamp()
  where w.singleton
  returning turn;
$$;

create or replace function rain_town.place_name(p_place text)
returns text
language sql immutable set search_path = ''
as $$
  select case p_place when 'bakery' then '云朵面包房' when 'library' then '雨伞图书屋'
    when 'square' then '喷泉广场' when 'bench' then '河畔长椅' end;
$$;

create or replace function rain_town.hobby_info(p_hobby text)
returns table (label text, place text, topic text, activity text)
language sql immutable set search_path = ''
as $$
  select h.label, h.place, h.topic, h.activity from (values
    ('reading', '读书', 'library', '最近读到的一页', '选了本薄薄的故事书，在窗边慢慢翻。'),
    ('baking', '做点心', 'bakery', '如何把奶油夹进面包', '试着把面团捏成小云朵，烤出来却更像一块石头。'),
    ('walking', '散步', 'bench', '哪条小路最适合发呆', '沿河走了一段，踩过了三片叶子。'),
    ('drawing', '画画', 'square', '怎样把喷泉画出水声', '拿出画本，悄悄画下了路过的小鸟。'),
    ('puzzles', '琢磨题目', 'library', '一道可以慢慢想的题', '在纸上画了几个小图，突然想到了下一步。')
  ) as h(key, label, place, topic, activity) where h.key = p_hobby;
$$;

create or replace function rain_town.record_meeting(
  p_first rain_town.residents, p_second rain_town.residents, p_place text, p_turn integer
)
returns void
language plpgsql volatile set search_path = ''
as $$
declare
  pair text := least(p_first.id, p_second.id) || '|' || greatest(p_first.id, p_second.id);
  shared boolean := p_first.appearance ->> 'hobby' = p_second.appearance ->> 'hobby';
  greeting text := case p_first.appearance ->> 'temper'
    when 'warm' then '先挥了挥手，主动聊起'
    when 'quiet' then '起初只轻轻点头，后来两人慢慢聊到'
    when 'curious' then '一开口就问起'
    else '发了一会儿呆，突然提起' end;
  words text := nullif(p_first.appearance ->> 'phrase', '');
  story text;
  before_score integer;
  score integer;
  hobby record;
begin
  select * into hobby from rain_town.hobby_info(p_second.appearance ->> 'hobby');
  select coalesce((w.bonds ->> pair)::integer, 0) into before_score
  from rain_town.world w where w.singleton;
  score := least(100, before_score + case when shared then 17 else 10 end
    + case when p_first.appearance ->> 'temper' = 'warm' then 2 else 0 end);
  update rain_town.world w set bonds = jsonb_set(w.bonds, array[pair], to_jsonb(score))
  where w.singleton;
  update rain_town.residents r set place = p_place, mood = '和人聊了一会儿'
  where r.id in (p_first.id, p_second.id);
  story := case when shared then '两人发现都喜欢' || hobby.label || '。'
    else p_first.name || greeting || hobby.topic || '。' end;
  if words is not null and p_turn % 3 = 0 then
    story := story || '走之前还说了句「' || words || '」。';
  end if;
  story := story || case
    when before_score < 72 and score >= 72 then '两人成了好朋友。'
    when before_score < 43 and score >= 43 then '两人成了朋友。'
    when before_score < 16 and before_score > 0 and score >= 16 then '两人成了熟面孔。'
    else '' end;
  perform rain_town.add_event('meet', p_first.name || '和' || p_second.name || '在' ||
    rain_town.place_name(p_place) || '碰面', story);
end;
$$;

create or replace function public.rain_town_read()
returns jsonb
language sql volatile security definer set search_path = ''
as $$ select rain_town.snapshot(); $$;

create or replace function public.rain_town_sign_in(p_code text)
returns jsonb
language sql stable security definer set search_path = ''
as $$ select jsonb_build_object('playerId', rain_town.player(p_code)); $$;

create or replace function public.rain_town_save(p_code text, p_profile jsonb, p_create boolean)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  player_id uuid := rain_town.player(p_code);
  nickname text := btrim(p_profile ->> 'name');
  phrase text := btrim(coalesce(p_profile ->> 'phrase', ''));
  clean_profile jsonb;
begin
  if not coalesce(
    jsonb_typeof(p_profile) = 'object'
    and char_length(nickname) between 1 and 12
    and char_length(phrase) <= 36
    and (p_profile ->> 'temper') in ('warm', 'quiet', 'curious', 'dreamy')
    and (p_profile ->> 'hair') in ('short', 'sweep', 'long', 'buns')
    and (p_profile ->> 'hairColor') in ('brown', 'black', 'orange', 'plum')
    and (p_profile ->> 'shirt') in ('moss', 'rose', 'gold', 'teal', 'violet')
    and (p_profile ->> 'skin') in ('peach', 'sand', 'cocoa', 'pearl')
    and (p_profile ->> 'hobby') in ('reading', 'baking', 'walking', 'drawing', 'puzzles')
    and p_create is not null, false
  ) then
    raise exception 'RAIN_PROFILE_INVALID';
  end if;
  clean_profile := jsonb_build_object(
    'temper', p_profile ->> 'temper', 'hair', p_profile ->> 'hair',
    'hairColor', p_profile ->> 'hairColor', 'shirt', p_profile ->> 'shirt',
    'skin', p_profile ->> 'skin', 'hobby', p_profile ->> 'hobby', 'phrase', phrase
  );
  perform 1 from rain_town.world w where w.singleton for update;
  if p_create then
    if exists (select 1 from rain_town.residents r where r.owner_id = player_id) then
      raise exception 'RAIN_ALREADY_JOINED';
    end if;
    insert into rain_town.residents (id, owner_id, name, appearance, place, mood)
    values (player_id::text, player_id, nickname, clean_profile, 'square', '正在认路');
    perform rain_town.add_event('arrival', nickname || '搬来啦', '拿着行李到达了喷泉广场。');
  else
    update rain_town.residents r set name = nickname, appearance = clean_profile
    where r.owner_id = player_id;
    if not found then raise exception 'RAIN_RESIDENT_MISSING'; end if;
    update rain_town.world w set revision = w.revision + 1 where w.singleton;
  end if;
  return rain_town.snapshot();
exception when unique_violation then
  raise exception 'RAIN_NAME_TAKEN';
end;
$$;

create or replace function public.rain_town_meet(p_code text, p_other text, p_place text)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  player_id uuid := rain_town.player(p_code);
  first_resident rain_town.residents;
  second_resident rain_town.residents;
  next_turn integer;
begin
  if rain_town.place_name(p_place) is null or p_other = player_id::text then
    raise exception 'RAIN_MEETING_INVALID';
  end if;
  perform 1 from rain_town.world w where w.singleton for update;
  select r.* into first_resident from rain_town.residents r where r.owner_id = player_id;
  if not found then raise exception 'RAIN_RESIDENT_MISSING'; end if;
  select r.* into second_resident from rain_town.residents r where r.id = p_other;
  if not found then raise exception 'RAIN_MEETING_INVALID'; end if;
  update rain_town.invites i set last_action = clock_timestamp() where i.id = player_id
  and (i.last_action is null or i.last_action < clock_timestamp() - interval '2 seconds');
  if not found then raise exception 'RAIN_ACTION_LIMIT'; end if;
  next_turn := rain_town.advance_clock();
  perform rain_town.record_meeting(first_resident, second_resident, p_place, next_turn);
  return rain_town.snapshot();
end;
$$;

create or replace function public.rain_town_step(p_code text, p_manual boolean)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  last_tick timestamptz;
  next_turn integer;
  player_id uuid;
  first_resident rain_town.residents;
  second_resident rain_town.residents;
  hobby record;
  venue text;
begin
  if p_manual is true then
    player_id := rain_town.player(p_code);
    if not exists (select 1 from rain_town.residents r where r.owner_id = player_id) then
      raise exception 'RAIN_RESIDENT_MISSING';
    end if;
  end if;
  select w.last_tick into last_tick from rain_town.world w where w.singleton;
  if p_manual is not true and last_tick > clock_timestamp() - interval '16 seconds' then
    return rain_town.snapshot();
  end if;
  select w.last_tick into last_tick from rain_town.world w where w.singleton for update;
  if last_tick > clock_timestamp() - case when p_manual is true
    then interval '3 seconds' else interval '16 seconds' end then
    return rain_town.snapshot();
  end if;
  next_turn := rain_town.advance_clock();
  select r.* into first_resident from rain_town.residents r order by random() limit 1;
  select r.* into second_resident from rain_town.residents r
  where r.id <> first_resident.id order by random() limit 1;
  select * into hobby from rain_town.hobby_info(first_resident.appearance ->> 'hobby');
  if second_resident.id is not null and next_turn % 3 <> 1 then
    venue := (array[first_resident.place, second_resident.place, hobby.place, 'square'])[1 + floor(random() * 4)::integer];
    perform rain_town.record_meeting(first_resident, second_resident, venue, next_turn);
  else
    update rain_town.residents r set place = hobby.place, mood = '在' || hobby.label
    where r.id = first_resident.id;
    perform rain_town.add_event('solo', first_resident.name || '去了' || rain_town.place_name(hobby.place),
      hobby.activity || case when next_turn % 3 = 1 and first_resident.appearance ->> 'phrase' <> ''
        then '「' || (first_resident.appearance ->> 'phrase') || '」' else '' end);
  end if;
  return rain_town.snapshot();
end;
$$;

create or replace function rain_town.issue_invites(p_count integer)
returns table (invite_code text)
language sql volatile set search_path = ''
as $$
  with codes as materialized (
    select replace(gen_random_uuid()::text, '-', '') as code
    from generate_series(1, greatest(0, least(p_count, 100)))
  ), issued as (
    insert into rain_town.invites (code_hash)
    select sha256(convert_to(code, 'UTF8')) from codes
    returning code_hash
  )
  select c.code from codes c join issued i on sha256(convert_to(c.code, 'UTF8')) = i.code_hash;
$$;

revoke all on all tables in schema rain_town from public, anon, authenticated;
revoke all on all functions in schema rain_town from public, anon, authenticated;
revoke all on function public.rain_town_read(), public.rain_town_sign_in(text),
  public.rain_town_save(text, jsonb, boolean), public.rain_town_meet(text, text, text),
  public.rain_town_step(text, boolean) from public;
grant execute on function public.rain_town_read(), public.rain_town_sign_in(text),
  public.rain_town_save(text, jsonb, boolean), public.rain_town_meet(text, text, text),
  public.rain_town_step(text, boolean) to anon, authenticated;

notify pgrst, 'reload schema';
commit;
