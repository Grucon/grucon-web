"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

// Trae las obras/proyectos operativos (con sus documentos, productos y
// facturas) para un usuario en sesión. Se reutiliza tanto en la Vista
// Operativa (gestión completa) como en el resumen de la Vista Directiva.
export function useProyectosOperativos(userId?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchObras = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const [{ data, error }, { data: movimientosContables, error: errorMovimientos }] = await Promise.all([
      supabase
        .from('proyectos_operativos')
        .select(`
          *,
          documentos_legales(*),
          productos_obra(*),
          facturas_obra(*)
        `)
        .order('created_at', { ascending: false }),
      supabase.from('movimientos_contables_por_proyecto').select('*'),
    ]);

    if (error) console.error("Error cargando obras:", error.message);
    if (errorMovimientos) console.error("Error cargando movimientos contables:", errorMovimientos.message);

    const obrasConContabilidad = (data ?? []).map((obra) => {
      const mov = movimientosContables?.find((m) => m.proyecto_id === obra.id);
      return {
        ...obra,
        ingresos_contables: mov?.ingresos_contables ?? 0,
        gasto_contable: mov?.gasto_contable ?? 0,
        balance_contable: mov?.balance_contable ?? 0,
      };
    });
    setObras(obrasConContabilidad);

    setLoading(false);
  };

  useEffect(() => {
    (async () => { await fetchObras(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { obras, loading, fetchObras };
}
