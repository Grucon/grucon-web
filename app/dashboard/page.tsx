"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthPerfil } from "@/utils/hooks/useAuthPerfil";
import DashboardHeader from "./_shared/DashboardHeader";

// Importamos los componentes modulares
import VistaComercial from "./_vistas/VistaComercial";
import VistaDirectiva from "./_vistas/VistaDirectiva";
import VistaCliente from "./_vistas/VistaCliente";
import VistaOperativa from "./_vistas/VistaOperativa";
import VistaAdministrativa from "./_vistas/VistaAdministrativa";

export default function DashboardPage() {
  const { user, perfil, loading } = useAuthPerfil();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pipeline, setPipeline] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contactos, setContactos] = useState<any[]>([]);
  const router = useRouter();

  const fetchPipeline = async () => {
    const { data } = await supabase.from('pipeline_com').select(`*, contacto_externo:directorio_comercial(nombre_completo, empresa, cargo)`).order('created_at', { ascending: false });
    if (data) setPipeline(data);
  };

  const fetchContactos = async () => {
    const { data } = await supabase.from('directorio_comercial').select('id, nombre_completo, empresa').order('nombre_completo', { ascending: true });
    if (data) setContactos(data);
  };

  useEffect(() => {
    if (!perfil || !['comercial', 'directiva', 'directivo'].includes(perfil.rol)) return;
    (async () => {
      await fetchPipeline();
      await fetchContactos();
    })();
  }, [perfil]);

if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400">Cargando entorno seguro...</p>
      </div>
    );
  }
  const rol = perfil?.rol || 'cliente';


  return (
    <main className="min-h-screen bg-slate-900 text-white transition-colors duration-300">
      <DashboardHeader>
        {['comercial', 'directiva', 'directivo'].includes(rol) && (
          <button
            onClick={() => router.push("/dashboard/directorio")}
            className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors hidden md:block"
          >
            Ver Directorio
          </button>
        )}
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-slate-900 text-white">
            {perfil?.nombre_completo}
          </p>
          <p className="text-xs text-emerald-600 text-emerald-400 font-medium capitalize">
            {rol}
          </p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/");
          }}
          className="text-sm px-4 py-2 bg-slate-100 bg-slate-700 hover:bg-slate-200 hover:bg-slate-600 text-white-700 text-slate-200 rounded-lg transition-colors"
        >
          Salir
        </button>
      </DashboardHeader>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 rounded-2xl shadow-sm p-8">

          {/* El renderizado condicional ahora es súper limpio */}
          {(rol === 'directiva' || rol === 'directivo') && (
            <VistaDirectiva pipeline={pipeline} contactos={contactos} fetchPipeline={fetchPipeline} user={user} perfil={perfil} />
          )}
          {rol === 'comercial' && <VistaComercial pipeline={pipeline} contactos={contactos} fetchPipeline={fetchPipeline} />}
          {rol === 'cliente' && <VistaCliente perfil={perfil} />}
          {/* 3. VISTA OPERATIVO */}
          {rol === 'operativo' && (
            <VistaOperativa perfil={perfil} user={user} />
          )}
          {/* 4. VISTA ADMINISTRATIVA ('administrativo' = permisos por módulo; 'super_admin' = acceso total; directivo/directiva la ven dentro de su propio hub) */}
          {['administrativo', 'super_admin'].includes(rol) && (
            <VistaAdministrativa user={user} perfil={perfil} />
          )}

        </motion.div>
      </div>
    </main>
  );
}
