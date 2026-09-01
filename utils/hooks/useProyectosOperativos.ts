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

    const { data, error } = await supabase
      .from('proyectos_operativos')
      .select(`
        *,
        documentos_legales(*),
        productos_obra(*),
        facturas_obra(*),
        gastos_obra(*)
      `)
      .order('created_at', { ascending: false });

    if (error) console.error("Error cargando obras:", error.message);
    else setObras(data ?? []);

    setLoading(false);
  };

  useEffect(() => {
    (async () => { await fetchObras(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { obras, loading, fetchObras };
}
