"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

// Importamos los componentes modulares
import VistaComercial from "./components/VistaComercial";
import VistaDirectiva from "./components/VistaDirectiva";
import VistaCliente from "./components/VistaCliente";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any[]>([]); 
  const [contactos, setContactos] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
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
    const checkUserAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");
      setUser(session.user);

      const { data: dataPerfil } = await supabase.from("perfiles").select("rol, nombre_completo").eq("uuid", session.user.id).single(); 
      if (dataPerfil) {
        setPerfil(dataPerfil);
        if (['comercial', 'directiva', 'directivo'].includes(dataPerfil.rol)) {
          await fetchPipeline();
          await fetchContactos();
        }
      } else {
        setPerfil({ rol: "cliente", nombre_completo: "Usuario" });
      }
      setLoading(false);
    };
    checkUserAndRole();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Cargando...</p></div>;

  const rol = perfil?.rol || 'cliente';

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <Image 
             src="/Logo_GRUCON_dark.png" 
             alt="Logo Grucon" 
             width={100} 
             height={30} 
             priority 
             className="object-contain"
           />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {perfil?.nombre_completo}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium capitalize">
              {rol}
            </p>
          </div>
          <button 
            onClick={async () => { 
              await supabase.auth.signOut(); 
              router.push("/"); 
            }} 
            className="text-sm px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8">
          
          {/* El renderizado condicional ahora es súper limpio */}
          {(rol === 'directiva' || rol === 'directivo') && <VistaDirectiva pipeline={pipeline} />}
          {rol === 'comercial' && <VistaComercial pipeline={pipeline} contactos={contactos} fetchPipeline={fetchPipeline} />}
          {rol === 'cliente' && <VistaCliente perfil={perfil} />}

        </motion.div>
      </div>
    </main>
  );
}