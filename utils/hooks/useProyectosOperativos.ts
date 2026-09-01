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

    const [{ data, error }, { data: gastosContables, error: errorGastos }] = await Promise.all([
      supabase
        .from('proyectos_operativos')
        .select(`
          *,
          documentos_legales(*),
          productos_obra(*),
          facturas_obra(*)
        `)
        .order('created_at', { ascending: false }),
      supabase.from('gastos_contables_por_proyecto').select('*'),
    ]);

    if (error) console.error("Error cargando obras:", error.message);
    if (errorGastos) console.error("Error cargando gasto contable:", errorGastos.message);

    const obrasConGasto = (data ?? []).map((obra) => ({
      ...obra,
      gasto_contable: gastosContables?.find((g) => g.proyecto_id === obra.id)?.gasto_contable ?? 0,
    }));
    setObras(obrasConGasto);

    setLoading(false);
  };

  useEffect(() => {
    (async () => { await fetchObras(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { obras, loading, fetchObras };
}
