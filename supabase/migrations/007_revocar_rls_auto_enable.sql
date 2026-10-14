-- ============================================================
-- 007 — rls_auto_enable no debe exponerse por la API
--
-- Supabase crea esta función (SECURITY DEFINER) para el event trigger `ensure_rls`,
-- que activa RLS en cada tabla nueva. Por defecto `anon` y `authenticated` pueden
-- llamarla vía /rest/v1/rpc. Quitarles EXECUTE no afecta al trigger: Postgres no
-- verifica ese permiso al dispararlo.
-- ============================================================
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
