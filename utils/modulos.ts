// Catálogo central de módulos administrativos y sus metadatos visuales.
// Mantener esta lista en sincronía con el CHECK constraint de la tabla
// `permisos_modulos` en Supabase (ver supabase/sql/permisos_modulos.sql).

export type ModuloKey =
  | "tesoreria"
  | "rrhh"
  | "sistemas"
  | "logistica"
  | "contabilidad";

export interface ModuloInfo {
  key: ModuloKey;
  label: string;
  descripcion: string;
  ruta: string;
  colorClasses: {
    bg: string;
    border: string;
    text: string;
    iconBg: string;
    iconText: string;
  };
}

export const MODULOS: ModuloInfo[] = [
  {
    key: "tesoreria",
    label: "Tesorería",
    descripcion: "Flujo de caja, cuentas bancarias y pagos.",
    ruta: "/dashboard/tesoreria",
    colorClasses: {
      bg: "bg-emerald-900/10",
      border: "border-emerald-900/40",
      text: "text-emerald-400",
      iconBg: "bg-emerald-900/30",
      iconText: "text-emerald-400",
    },
  },
  {
    key: "rrhh",
    label: "Recursos Humanos",
    descripcion: "Personal, nómina y gestión de talento.",
    ruta: "/dashboard/rrhh",
    colorClasses: {
      bg: "bg-blue-900/10",
      border: "border-blue-900/40",
      text: "text-blue-400",
      iconBg: "bg-blue-900/30",
      iconText: "text-blue-400",
    },
  },
  {
    key: "sistemas",
    label: "Sistemas",
    descripcion: "Infraestructura, soporte técnico y accesos.",
    ruta: "/dashboard/sistemas",
    colorClasses: {
      bg: "bg-purple-900/10",
      border: "border-purple-900/40",
      text: "text-purple-400",
      iconBg: "bg-purple-900/30",
      iconText: "text-purple-400",
    },
  },
  {
    key: "logistica",
    label: "Logística",
    descripcion: "Inventario, transporte y proveedores.",
    ruta: "/dashboard/logistica",
    colorClasses: {
      bg: "bg-orange-900/10",
      border: "border-orange-900/40",
      text: "text-orange-400",
      iconBg: "bg-orange-900/30",
      iconText: "text-orange-400",
    },
  },
  {
    key: "contabilidad",
    label: "Contabilidad",
    descripcion: "Estados financieros, impuestos y facturación.",
    ruta: "/dashboard/contabilidad",
    colorClasses: {
      bg: "bg-indigo-900/10",
      border: "border-indigo-900/40",
      text: "text-indigo-400",
      iconBg: "bg-indigo-900/30",
      iconText: "text-indigo-400",
    },
  },
];

export function getModulo(key: string): ModuloInfo | undefined {
  return MODULOS.find((m) => m.key === key);
}

// Roles con acceso total a todos los módulos administrativos, sin necesidad
// de una fila en `permisos_modulos` por cada uno. 'directivo'/'directiva' ya
// son la dirección de la empresa, así que heredan el mismo acceso total que
// 'super_admin' (pensado para TI u otro personal sin ese rol directivo).
export const ROL_SUPER_ADMIN = "super_admin";
export const ROLES_ACCESO_TOTAL = [ROL_SUPER_ADMIN, "directivo", "directiva"];

export function tieneAccesoTotal(rol?: string | null): boolean {
  return !!rol && ROLES_ACCESO_TOTAL.includes(rol);
}
