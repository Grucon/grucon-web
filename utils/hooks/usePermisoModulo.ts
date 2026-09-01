"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { ModuloKey, tieneAccesoTotal } from "@/utils/modulos";

// Verifica que el usuario en sesión tenga permiso para UN módulo específico.
// Redirige a /login si no hay sesión, y a /dashboard si no tiene el permiso.
// Independiente del rol (salvo ROL_SUPER_ADMIN, que pasa siempre): aplica
// aunque se acceda a la URL directamente.
export function usePermisoModulo(modulo: ModuloKey) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let activo = true;

    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");
      if (activo) setUserId(session.user.id);

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("uuid", session.user.id)
        .single();

      if (!activo) return;

      if (tieneAccesoTotal(perfil?.rol)) {
        setAutorizado(true);
        setLoading(false);
        return;
      }

      const { data: permiso } = await supabase
        .from("permisos_modulos")
        .select("id")
        .eq("uuid_usuario", session.user.id)
        .eq("modulo", modulo)
        .maybeSingle();

      if (!activo) return;
      if (!permiso) return router.push("/dashboard");

      setAutorizado(true);
      setLoading(false);
    };

    checkAccess();
    return () => { activo = false; };
  }, [router, modulo]);

  return { autorizado, loading, userId };
}
