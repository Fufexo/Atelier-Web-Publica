-- ============================================================
-- 008 — auth.uid() evaluado una vez por consulta en las políticas de 001
--
-- Aviso de rendimiento de Supabase (auth_rls_initplan): `auth.uid()` dentro de una
-- política se evalúa por cada fila; `(select auth.uid())` se evalúa una sola vez.
-- Mismo significado, solo cambia cómo lo planifica Postgres.
-- ============================================================

alter policy "perfil_propio" on public.perfiles
  using ((select auth.uid()) = id);

alter policy "direcciones_propias" on public.direcciones
  using ((select auth.uid()) = usuario_id);

alter policy "pedidos_propios" on public.pedidos
  using ((select auth.uid()) = usuario_id);

alter policy "crear_pedido" on public.pedidos
  with check ((select auth.uid()) = usuario_id);

alter policy "items_pedido_propios" on public.items_pedido
  using (exists (
    select 1 from public.pedidos p
    where p.id = items_pedido.pedido_id and p.usuario_id = (select auth.uid())
  ));

alter policy "pagos_propios" on public.pagos
  using (exists (
    select 1 from public.pedidos p
    where p.id = pagos.pedido_id and p.usuario_id = (select auth.uid())
  ));
