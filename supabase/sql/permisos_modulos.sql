-- Ejecutar en el SQL Editor de Supabase (Project > SQL Editor > New query).
-- Crea la tabla de permisos granulares por módulo administrativo y su RLS.

create table if not exists permisos_modulos (
  id bigint generated always as identity primary key,
  uuid_usuario uuid not null references auth.users(id) on delete cascade,
  modulo text not null check (
    modulo in ('tesoreria', 'rrhh', 'sistemas', 'logistica', 'contabilidad')
  ),
  created_at timestamptz not null default now(),
  unique (uuid_usuario, modulo)
);

alter table permisos_modulos enable row level security;

-- Cada usuario solo puede ver sus propios permisos (necesario para que el
-- dashboard sepa qué tarjetas desbloquear).
create policy "usuarios_ven_sus_permisos"
  on permisos_modulos
  for select
  using (auth.uid() = uuid_usuario);

-- Otorgar acceso a un módulo (ejecutar manualmente por cada usuario/módulo).
-- Reemplaza el UUID por el de la persona (Authentication > Users en Supabase)
-- y 'tesoreria' por el módulo correspondiente.
--
-- insert into permisos_modulos (uuid_usuario, modulo)
-- values ('00000000-0000-0000-0000-000000000000', 'tesoreria');

-- Acceso total a todos los módulos (sin necesidad de filas en esta tabla):
-- asigna el rol 'super_admin' en la tabla `perfiles` al usuario que
-- necesite entrar a Tesorería, RRHH, Sistemas, Logística y Contabilidad
-- sin pedir permiso módulo por módulo.
--
-- update perfiles set rol = 'super_admin' where uuid = '00000000-0000-0000-0000-000000000000';
