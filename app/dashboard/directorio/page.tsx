"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthPerfil } from "@/utils/hooks/useAuthPerfil";
import DashboardHeader from "../_shared/DashboardHeader";

const ROLES_AUTORIZADOS = ['comercial', 'directiva', 'directivo'];

export default function DirectorioPage() {
  const router = useRouter();
  const { perfil, loading: loadingPerfil } = useAuthPerfil();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contactos, setContactos] = useState<any[]>([]);
  const [loadingContactos, setLoadingContactos] = useState(true);

  // Estados del Modal
  const [editingContactoId, setEditingContactoId] = useState<number | null>(null);
  const [showContactoModal, setShowContactoModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDataContacto, setFormDataContacto] = useState({
    nombre_completo: "", empresa: "", cargo: "", email: "", telefono: ""
  });

  const fetchContactos = async () => {
    const { data } = await supabase.from('directorio_comercial').select('*').order('nombre_completo', { ascending: true });
    if (data) setContactos(data);
    setLoadingContactos(false);
  };

  useEffect(() => {
    if (loadingPerfil) return;

    // BLOQUEO DE SEGURIDAD: Solo entran comerciales y directivas
    if (!perfil || !ROLES_AUTORIZADOS.includes(perfil.rol)) {
      router.push("/dashboard");
      return;
    }

    (async () => {
      await fetchContactos();
    })();
  }, [loadingPerfil, perfil, router]);

  const resetContactoForm = () => {
    setEditingContactoId(null);
    setFormDataContacto({ nombre_completo: "", empresa: "", cargo: "", email: "", telefono: "" });
    setShowContactoModal(false);
  };

  const handleSubmitContacto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (editingContactoId) {
      await supabase.from('directorio_comercial').update(formDataContacto).eq('id', editingContactoId);
    } else {
      await supabase.from('directorio_comercial').insert([formDataContacto]);
    }
    setIsSubmitting(false);
    resetContactoForm();
    fetchContactos();
  };

  const handleDeleteContacto = async (id: number) => {
    if (window.confirm("¿Eliminar este contacto?")) {
      await supabase.from('directorio_comercial').delete().eq('id', id);
      fetchContactos();
    }
  };

  if (loadingPerfil || loadingContactos) return <div className="min-h-screen flex items-center justify-center"><p>Verificando permisos...</p></div>;

  return (
    <main className="min-h-screen bg-slate-50 bg-slate-900">
      <DashboardHeader>
        <button onClick={() => router.push("/dashboard")} className="text-sm px-4 py-2 bg-slate-100 bg-slate-700 rounded-lg">Volver al Dashboard</button>
      </DashboardHeader>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 text-white mb-2">Directorio Comercial</h1>
            <p className="text-slate-600 text-slate-400">Acceso restringido: Gestión de contactos externos.</p>
          </div>
          <button onClick={() => setShowContactoModal(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Añadir Contacto</button>
        </div>

        {/* Tabla de Contactos */}
        <div className=" bg-slate-800 border border-slate-200 border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 bg-slate-900/50 text-slate-500 text-slate-400 text-xs uppercase">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Empresa / Cargo</th>
                <th className="p-4">Contacto</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 divide-slate-700/50">
              {contactos.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 hover:bg-slate-700/20">
                  <td className="p-4 font-semibold text-slate-900 text-white">{c.nombre_completo}</td>
                  <td className="p-4"><p className="text-slate-900 text-white">{c.empresa}</p><p className="text-xs text-slate-500">{c.cargo}</p></td>
                  <td className="p-4 text-sm text-slate-600 text-slate-300"><p>{c.email}</p><p>{c.telefono}</p></td>
                  <td className="p-4 text-right">
                    <button onClick={() => { setEditingContactoId(c.id); setFormDataContacto(c); setShowContactoModal(true); }} className="text-blue-500 mr-4">Editar</button>
                    <button onClick={() => handleDeleteContacto(c.id)} className="text-red-500">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Simplificado */}
      <AnimatePresence>
        {showContactoModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/60 z-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className=" bg-slate-800 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">{editingContactoId ? 'Editar' : 'Nuevo'} Contacto</h3>
              <form onSubmit={handleSubmitContacto} className="space-y-4 text-black text-white">
                <input type="text" placeholder="Nombre Completo" required value={formDataContacto.nombre_completo} onChange={e => setFormDataContacto({...formDataContacto, nombre_completo: e.target.value})} className="w-full p-2 border rounded bg-slate-700" />
                <input type="text" placeholder="Empresa" value={formDataContacto.empresa} onChange={e => setFormDataContacto({...formDataContacto, empresa: e.target.value})} className="w-full p-2 border rounded bg-slate-700" />
                <input type="text" placeholder="Cargo" value={formDataContacto.cargo} onChange={e => setFormDataContacto({...formDataContacto, cargo: e.target.value})} className="w-full p-2 border rounded bg-slate-700" />
                <input type="email" placeholder="Email" value={formDataContacto.email} onChange={e => setFormDataContacto({...formDataContacto, email: e.target.value})} className="w-full p-2 border rounded bg-slate-700" />
                <input type="text" placeholder="Teléfono" value={formDataContacto.telefono} onChange={e => setFormDataContacto({...formDataContacto, telefono: e.target.value})} className="w-full p-2 border rounded bg-slate-700" />
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={resetContactoForm} className="px-4 py-2">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
