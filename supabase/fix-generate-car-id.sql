-- Fix: generate_car_id produceva id rotti (es. "-") quando marca/modello
-- arrivavano vuoti. Ora: rimuove i trattini ai bordi e, se la base resta vuota,
-- usa un fallback basato sull'host id. Idempotente.

create or replace function generate_car_id(p_host_id text, p_brand text, p_model text)
returns text
language plpgsql
as $$
declare
  base text;
  candidate text;
  n int;
begin
  base := lower(regexp_replace(coalesce(p_brand, '') || '-' || coalesce(p_model, ''), '[^a-z0-9]+', '-', 'g'));
  base := trim(both '-' from base);             -- niente trattini iniziali/finali
  base := substring(base from 1 for 40);
  if base is null or base = '' then             -- marca/modello vuoti → fallback robusto
    base := 'auto-' || substring(replace(coalesce(p_host_id, 'host'), '-', '') from 1 for 8);
  end if;
  candidate := base;
  n := 0;
  while exists (select 1 from cars where id = candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;
