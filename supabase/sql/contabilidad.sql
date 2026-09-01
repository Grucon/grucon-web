-- Ejecutar en el SQL Editor de Supabase (Project > SQL Editor > New query).
-- Tablas y vistas para el módulo de Contabilidad: movimientos contables
-- importados desde el libro auxiliar en Excel (clasificación PUC/NIIF),
-- y resúmenes agregados para no traer miles de filas al navegador.

-- ─────────────────────────────────────────────────────────────────────────
-- Auditoría de cada archivo importado.
create table if not exists importaciones_contables (
  id bigint generated always as identity primary key,
  nombre_archivo text not null,
  periodos text[] not null,
  filas_importadas int not null,
  subido_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Una fila por línea del Excel (libro auxiliar contable).
create table if not exists movimientos_contables (
  id bigint generated always as identity primary key,
  anio int not null,
  periodo text not null,              -- YYYYMM, ej. '202607'
  fecha date,
  tipo_documento text,
  nombre_tipo_documento text,
  numero_documento text,
  cuenta_clase text not null,         -- '4' = INGRESOS, '5'/'6'/'7' = GASTOS/COSTOS
  nombre_clase text,
  cuenta_grupo text,
  nombre_grupo text,
  cuenta_mayor text,
  nombre_cuenta_mayor text,
  cuenta text,
  nombre_cuenta text,
  centro_costo text,
  nombre_centro_costo text,
  tercero_id text,
  tercero_nombre text,
  concepto text,
  naturaleza text,                    -- 'D' o 'C'
  debitos numeric not null default 0,
  creditos numeric not null default 0,
  movimiento numeric not null default 0,  -- ya viene con signo correcto (positivo = aumento en la dirección natural de la cuenta)
  importacion_id bigint references importaciones_contables(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_movimientos_contables_periodo on movimientos_contables (periodo);
create index if not exists idx_movimientos_contables_clase on movimientos_contables (cuenta_clase);

-- ─────────────────────────────────────────────────────────────────────────
-- Resumen mensual: ingresos y gastos por periodo (para "año en curso" y
-- "último mes disponible" en la página).
create or replace view contabilidad_resumen_mensual as
select
  periodo,
  anio,
  coalesce(sum(movimiento) filter (where cuenta_clase = '4'), 0) as ingresos,
  coalesce(sum(movimiento) filter (where cuenta_clase in ('5', '6', '7')), 0) as gastos
from movimientos_contables
group by periodo, anio;

-- Top categorías de gasto por año (para el desglose en la página).
create or replace view contabilidad_categorias_gasto_anual as
select
  anio,
  nombre_grupo,
  sum(movimiento) as total_gasto
from movimientos_contables
where cuenta_clase in ('5', '6', '7')
group by anio, nombre_grupo;

-- ─────────────────────────────────────────────────────────────────────────
-- RLS: solo entra quien tiene acceso al módulo 'contabilidad' (mismo
-- criterio que usePermisoModulo/tieneAccesoTotal en la app: super_admin,
-- directivo/directiva, o un permiso explícito en permisos_modulos).
alter table movimientos_contables enable row level security;
alter table importaciones_contables enable row level security;

create policy "acceso_contabilidad_movimientos"
  on movimientos_contables
  for all
  using (
    exists (select 1 from perfiles where uuid = auth.uid() and rol in ('super_admin', 'directivo', 'directiva'))
    or exists (select 1 from permisos_modulos where uuid_usuario = auth.uid() and modulo = 'contabilidad')
  )
  with check (
    exists (select 1 from perfiles where uuid = auth.uid() and rol in ('super_admin', 'directivo', 'directiva'))
    or exists (select 1 from permisos_modulos where uuid_usuario = auth.uid() and modulo = 'contabilidad')
  );

create policy "acceso_contabilidad_importaciones"
  on importaciones_contables
  for all
  using (
    exists (select 1 from perfiles where uuid = auth.uid() and rol in ('super_admin', 'directivo', 'directiva'))
    or exists (select 1 from permisos_modulos where uuid_usuario = auth.uid() and modulo = 'contabilidad')
  )
  with check (
    exists (select 1 from perfiles where uuid = auth.uid() and rol in ('super_admin', 'directivo', 'directiva'))
    or exists (select 1 from permisos_modulos where uuid_usuario = auth.uid() and modulo = 'contabilidad')
  );

-- Las vistas heredan RLS de sus tablas base automáticamente en Postgres
-- moderno (security_invoker), pero por si tu proyecto lo requiere:
alter view contabilidad_resumen_mensual set (security_invoker = true);
alter view contabilidad_categorias_gasto_anual set (security_invoker = true);
