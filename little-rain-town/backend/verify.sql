begin;
update rain_town.world set last_tick = clock_timestamp() - interval '1 minute' where singleton;
set local role anon;

do $$
declare
  first_token text := encode(sha256(convert_to(gen_random_uuid()::text, 'UTF8')), 'hex');
  second_token text := encode(sha256(convert_to(gen_random_uuid()::text, 'UTF8')), 'hex');
  first_name text := '甲' || left(first_token, 8);
  second_name text := '乙' || left(second_token, 8);
  draft jsonb := '{"temper":"curious","hair":"curly","hairColor":"blue","shirt":"mint","skin":"peach",
    "expression":"happy","outfit":"raincoat","accessory":"cat","hobby":"letters","phrase":"测试"}';
  first_id text;
  second_id text;
  resident_count integer;
  starting_turn integer;
  town jsonb;
begin
  town := public.rain_town_read();
  starting_turn := (town ->> 'turn')::integer;
  town := public.rain_town_step(null, false);
  if (town ->> 'turn')::integer <> starting_turn + 1 then
    raise exception 'The shared clock should advance for a visitor';
  end if;
  resident_count := jsonb_array_length(town -> 'people');
  if resident_count < 3 then raise exception 'Public readers should see the starter town'; end if;
  if public.rain_town_find(first_token) ->> 'playerId' is not null then
    raise exception 'A browser that has not saved should not have a resident';
  end if;
  begin
    perform 1 from rain_town.browser_players;
    raise exception 'Public roles should not read the browser token table';
  exception when insufficient_privilege then
    null;
  end;
  town := public.rain_town_save(first_token, draft || jsonb_build_object('name', first_name), true);
  first_id := town ->> 'playerId';
  if first_id is null then raise exception 'Creation should return an owner identity'; end if;
  if jsonb_array_length(town -> 'people') <> resident_count + 1 then
    raise exception 'The creation snapshot should contain the resident';
  end if;
  begin
    perform public.rain_town_save(first_token, draft || jsonb_build_object('name', second_name), true);
    raise exception 'A second create using the same browser token should fail';
  exception when raise_exception then
    if sqlerrm <> 'RAIN_ALREADY_JOINED' then raise; end if;
  end;
  begin
    perform public.rain_town_save(second_token, draft || jsonb_build_object('name', first_name), false);
    raise exception 'An unrelated browser should not edit the first resident';
  exception when raise_exception then
    if sqlerrm <> 'RAIN_RESIDENT_MISSING' then raise; end if;
  end;
  town := public.rain_town_save(second_token, draft || jsonb_build_object('name', second_name), true);
  second_id := town ->> 'playerId';
  if second_id is null or second_id = first_id then
    raise exception 'Two browsers should have independent residents';
  end if;
  town := public.rain_town_save(first_token, draft || jsonb_build_object('name', first_name, 'outfit', 'sailor'), false);
  if not exists (select 1 from jsonb_array_elements(town -> 'people') as r(person)
    where r.person ->> 'id' = first_id and r.person ->> 'outfit' = 'sailor') then
    raise exception 'The owner should be able to edit a resident';
  end if;
  perform public.rain_town_visit(first_token, 'post');
  perform public.rain_town_meet(second_token, first_id, 'deck');
  town := public.rain_town_read();
  if town -> 'events' -> 0 ->> 'title' <> second_name || '和' || first_name || '在星星观景台碰面' then
    raise exception 'Public readers should see the shared meeting';
  end if;
  if jsonb_array_length(town -> 'people') <> resident_count + 2 or town ? 'playerId' or town::text like '%' || first_token || '%' then
    raise exception 'The public snapshot must contain both residents and exclude ownership secrets';
  end if;
end;
$$;

rollback;
