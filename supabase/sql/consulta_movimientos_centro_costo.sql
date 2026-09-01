-- Consulta de diagnóstico (no crea nada, solo lee). Pégala en el SQL Editor
-- de Supabase. Cambia 'C-423' si necesitas revisar otro centro de costo.
-- Usa el mismo criterio de cruce que la vista movimientos_contables_por_proyecto:
-- coincidencia por PREFIJO contra nombre_centro_costo.

-- 1) Detalle de movimientos del centro de costo
select
  fecha,
  periodo,
  tipo_documento,
  nombre_tipo_documento,
  numero_documento,
  cuenta,
  nombre_cuenta,
  nombre_centro_costo,
  tercero_nombre,
  concepto,
  naturaleza,
  debitos,
  creditos,
  movimiento
from movimientos_contables
where nombre_centro_costo ilike 'C-423%'
order by fecha, id;

-- 2) Resumen (ingresos, gastos y balance) para ese centro de costo
select
  coalesce(sum(movimiento) filter (where cuenta_clase = '4'), 0) as ingresos,
  coalesce(sum(movimiento) filter (where cuenta_clase in ('5', '6', '7')), 0) as gastos,
  coalesce(sum(movimiento) filter (where cuenta_clase = '4'), 0)
    - coalesce(sum(movimiento) filter (where cuenta_clase in ('5', '6', '7')), 0) as balance
from movimientos_contables
where nombre_centro_costo ilike 'C-423%';
