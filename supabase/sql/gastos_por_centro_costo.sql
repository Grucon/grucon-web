-- Ejecutar en el SQL Editor de Supabase (Project > SQL Editor > New query).
-- Cruza cada proyecto operativo con SUS movimientos reales en Contabilidad
-- (ingresos y gastos), por centro de costo, acumulados desde el inicio del
-- proyecto (sin filtro de periodo: suma TODO lo importado hasta hoy).
-- `proyectos_operativos.centro_costos` guarda un prefijo (ej. "C-410") que
-- debe coincidir con el inicio de `movimientos_contables.nombre_centro_costo`
-- (ej. "C-410 PACIFICO SUR...").
--
-- IMPORTANTE sobre permisos: esta vista se deja SIN `security_invoker`, a
-- propósito, para que cualquier usuario que pueda ver los proyectos (todos
-- los autenticados, como ya hace el resto de la Vista Operativa) vea el
-- balance agregado de su proyecto, aunque no tenga permiso para entrar al
-- módulo de Contabilidad. Solo expone sumas, nunca las filas individuales
-- del libro auxiliar (esas siguen protegidas por la RLS de
-- `movimientos_contables`).

-- Reemplaza a la vista anterior (solo gastos); si ya la habías creado, esto
-- la elimina para dejar únicamente la nueva versión con ingresos incluidos.
drop view if exists gastos_contables_por_proyecto;

create or replace view movimientos_contables_por_proyecto as
select
  po.id as proyecto_id,
  po.centro_costos,
  coalesce(sum(mc.movimiento) filter (where mc.cuenta_clase = '4'), 0) as ingresos_contables,
  coalesce(sum(mc.movimiento) filter (where mc.cuenta_clase in ('5', '6', '7')), 0) as gasto_contable,
  coalesce(sum(mc.movimiento) filter (where mc.cuenta_clase = '4'), 0)
    - coalesce(sum(mc.movimiento) filter (where mc.cuenta_clase in ('5', '6', '7')), 0) as balance_contable
from proyectos_operativos po
left join movimientos_contables mc
  on po.centro_costos is not null
  and trim(po.centro_costos) <> ''
  and mc.nombre_centro_costo ilike trim(po.centro_costos) || '%'
group by po.id, po.centro_costos;

grant select on movimientos_contables_por_proyecto to authenticated;
