"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export interface Perfil {
  rol: string;
  nombre_completo: string;
}

// Obtiene la sesión activa y el perfil (rol) del usuario.
// Redirige a /login si no hay sesión. Si el usuario no tiene fila en
// `perfiles`, se asume rol 'cliente' por defecto (comportamiento histórico).
export function useAuthPerfil() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    const checkUserAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");
      if (!activo) return;
      setUser(session.user);

      const { data: dataPerfil } = await supabase
        .from("perfiles")
        .select("rol, nombre_completo")
        .eq("uuid", session.user.id)
        .single();

      if (!activo) return;
      setPerfil(dataPerfil ?? { rol: "cliente", nombre_completo: "Usuario" });
      setLoading(false);
    };

    checkUserAndRole();
    return () => { activo = false; };
  }, [router]);

  return { user, perfil, loading };
}
