"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { MODULOS, ModuloKey, tieneAccesoTotal } from "@/utils/modulos";

// Trae el conjunto completo de módulos a los que el usuario tiene permiso,
// para pintar el estado (autorizado/bloqueado) de las tarjetas del dashboard.
// Si el rol es ROL_SUPER_ADMIN, se otorgan todos los módulos sin consultar
// `permisos_modulos`.
export function usePermisosModulos(userId?: string, rol?: string | null) {
  const [permisos, setPermisos] = useState<Set<ModuloKey>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    (async () => {
      if (!userId) {
        if (activo) setLoading(false);
        return;
      }

      if (tieneAccesoTotal(rol)) {
        setPermisos(new Set(MODULOS.map((m) => m.key)));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("permisos_modulos")
        .select("modulo")
        .eq("uuid_usuario", userId);

      if (!activo) return;
      if (error) console.error("Error cargando permisos:", error.message);
      setPermisos(new Set((data ?? []).map((p) => p.modulo as ModuloKey)));
      setLoading(false);
    })();

    return () => { activo = false; };
  }, [userId, rol]);

  return { permisos, loading };
}
