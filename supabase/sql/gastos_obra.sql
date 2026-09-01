-- Ejecutar en el SQL Editor de Supabase (Project > SQL Editor > New query).
-- Tabla de gastos por proyecto operativo (rubro de egresos), hermana de
-- `facturas_obra` (que registra los ingresos/facturación).

create table if not exists gastos_obra (
  id bigint generated always as identity primary key,
  proyecto_id bigint not null references proyectos_operativos(id) on delete cascade,
  concepto text not null,
  categoria text not null default 'Otros' check (
    categoria in ('Materiales', 'Mano de obra', 'Transporte', 'Equipos', 'Otros')
  ),
  valor numeric not null,
  fecha date,
  estado text not null default 'Pendiente' check (estado in ('Pendiente', 'Pagado')),
  created_at timestamptz not null default now()
);

alter table gastos_obra enable row level security;

-- Sigue el mismo modelo permisivo que el resto de tablas operativas: todo
-- usuario autenticado puede ver y gestionar gastos (la app ya oculta los
-- botones de editar/borrar a quien no es dueño del proyecto en la UI).
-- Si `facturas_obra`/`productos_obra` ya tienen políticas más estrictas en
-- tu proyecto, ajusta estas para que coincidan.
create policy "autenticados_gestionan_gastos"
  on gastos_obra
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
