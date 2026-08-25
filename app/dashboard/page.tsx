"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any[]>([]); 
  const [contactos, setContactos] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // NUEVO: Estado para controlar qué pestaña ve el comercial
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registro'>('dashboard');

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    proyecto: "",
    entidad: "",
    contacto_id: "", 
    servicio: "Consultoría", // Actualizado a la primera línea de negocio
    valor: "",
    duracion: "",
    etapa: "Nuevo",
    estado: "En progreso"
  });

  const fetchPipeline = async () => {
    const { data: pipelineData, error } = await supabase
      .from('pipeline_com')
      .select(`*, contacto_externo:directorio_comercial(nombre_completo, empresa, cargo)`)
      .order('created_at', { ascending: false });
      
    if (error) console.error("Error leyendo Pipeline:", error.message);
    if (pipelineData) setPipeline(pipelineData);
  };

  const fetchContactos = async () => {
    const { data: contactosData, error } = await supabase
      .from('directorio_comercial')
      .select('id, nombre_completo, empresa')
      .order('nombre_completo', { ascending: true });
      
    if (error) console.error("Error leyendo Contactos:", error.message);
    if (contactosData) setContactos(contactosData);
  };

  useEffect(() => {
    const checkUserAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data: dataPerfil } = await supabase
        .from("perfiles")
        .select("rol, nombre_completo")
        .eq("uuid", session.user.id)
        .single(); 

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSubmitProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('pipeline_com')
      .insert([{
          proyecto: formData.proyecto,
          entidad: formData.entidad,
          servicio: formData.servicio,
          valor: formData.valor ? parseFloat(formData.valor) : null,
          duracion: formData.duracion ? parseInt(formData.duracion) : null,
          etapa: formData.etapa,
          estado: formData.estado,
          contacto_id: formData.contacto_id ? parseInt(formData.contacto_id) : null 
      }]);

    setIsSubmitting(false);

    if (error) {
      console.error("Error al guardar:", error.message);
      alert("Hubo un error al guardar el proyecto.");
    } else {
      setFormData({ proyecto: "", entidad: "", contacto_id: "", servicio: "Consultoría", valor: "", duracion: "", etapa: "Nuevo", estado: "En progreso" });
      setShowModal(false);
      fetchPipeline(); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">Cargando entorno seguro...</p>
      </div>
    );
  }

  const rol = perfil?.rol || 'cliente';

  // ==========================================
  // NUEVO: LÓGICA MATEMÁTICA PARA KPIs
  // ==========================================
  const contratosGanados = pipeline.filter(p => p.estado?.toLowerCase() === 'ganado');
  const leadsEnProceso = pipeline.filter(p => p.estado?.toLowerCase() !== 'ganado' && p.estado?.toLowerCase() !== 'perdido');

  const numContratos = contratosGanados.length;
  const valorContratos = contratosGanados.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  const numLeads = leadsEnProceso.length;
  const valorLeads = leadsEnProceso.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  const numClientesUnicos = new Set(pipeline.map(p => p.entidad).filter(Boolean)).size;
  const numPaises = 3; // Estático por ahora (hasta añadir columna de país en BD)

  // Formateador de Moneda
  const formatearDinero = (valor: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  };
  // ==========================================


  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Image 
            src="/logo_GRUCON_dark.png" 
            alt="Logo Grucon" 
            width={120} 
            height={40} 
            className="object-contain" 
          />
          <span className="hidden md:inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full uppercase tracking-wider">
            Portal de Usuarios
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {perfil?.nombre_completo || user?.email}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">{rol}</p>
          </div>
          <button onClick={handleLogout} className="text-sm px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors">
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 relative"
        >
          
          {(rol === 'directiva' || rol === 'directivo') && (
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Visión Estratégica</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-8">Panel gerencial. Monitoreo global de operaciones e indicadores.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Oportunidades Comerciales</h3>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{pipeline.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* VISTA COMERCIAL: TABS, KPIS Y TABLERO */}
          {/* ========================================= */}
          {rol === 'comercial' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Entorno Comercial</h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Monitoreo estratégico y tablero de registro de oportunidades.
                  </p>
                </div>
                <button 
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md shadow-emerald-500/20 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Añadir Registro
                </button>
              </div>

              {/* SISTEMA DE PESTAÑAS (TABS) */}
              <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700 mb-8">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'dashboard' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  Dashboard Comercial
                </button>
                <button 
                  onClick={() => setActiveTab('registro')}
                  className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'registro' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  Tablero de Registro
                </button>
              </div>

              {/* CONTENIDO PESTAÑA 1: DASHBOARD Y KPIs */}
              {activeTab === 'dashboard' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Líneas de Negocio</h2>
                  <div className="flex flex-wrap gap-3 mb-10">
                    {['Consultoría', 'Interventoría', 'Gerencia de Proyectos', 'Grucon Energy (Desarrollo de PCHs)', 'Innovación'].map((linea) => (
                      <button key={linea} className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 dark:hover:border-emerald-800 transition-all shadow-sm">
                        {linea}
                      </button>
                    ))}
                  </div>

                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Indicadores Clave (Anual)</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Contratos Adjudicados</h3>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{numContratos}</p>
                    </div>
                    <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50">
                      <h3 className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Valor Adjudicado</h3>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{formatearDinero(valorContratos)}</p>
                    </div>
                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Leads Activas</h3>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{numLeads}</p>
                    </div>
                    <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50">
                      <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">Valor de Leads Activas</h3>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{formatearDinero(valorLeads)}</p>
                    </div>
                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Número de Clientes</h3>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{numClientesUnicos}</p>
                    </div>
                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Países</h3>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{numPaises}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CONTENIDO PESTAÑA 2: TABLERO DE REGISTRO */}
              {activeTab === 'registro' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <th className="px-6 py-4 font-semibold">Proyecto / Entidad</th>
                            <th className="px-6 py-4 font-semibold">Servicio</th>
                            <th className="px-6 py-4 font-semibold">Finanzas</th>
                            <th className="px-6 py-4 font-semibold">Tiempo / Etapa</th>
                            <th className="px-6 py-4 font-semibold">Contacto Externo</th>
                            <th className="px-6 py-4 font-semibold">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                          {pipeline.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                No hay registros en el tablero todavía.
                              </td>
                            </tr>
                          ) : (
                            pipeline.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-semibold text-slate-900 dark:text-white">{item.proyecto || 'Sin nombre'}</p>
                                  <p className="text-xs text-slate-500">{item.entidad || 'Entidad no especificada'}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                  {item.servicio}
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {item.valor ? formatearDinero(item.valor) : 'Por definir'}
                                  </p>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                  <p className="font-medium">{item.etapa || 'Inicial'}</p>
                                  {item.duracion && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Duración: {item.duracion} meses</p>}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {item.contacto_externo?.nombre_completo || 'Sin asignar'}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                    ${item.estado?.toLowerCase() === 'ganado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                                  `}>
                                    {item.estado || 'En progreso'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* VISTAS EXTRAS (Recortadas visualmente para ti, pero mantenlas igual si las necesitas) */}
          {rol === 'cliente' && (
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Hola, {perfil?.nombre_completo || 'Usuario'}</h1>
            </div>
          )}

        </motion.div>
      </div>

      {/* --- MODAL EMERGENTE PARA NUEVOS PROYECTOS --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nuevo Registro Comercial</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmitProyecto} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Proyecto</label>
                    <input type="text" required value={formData.proyecto} onChange={(e) => setFormData({...formData, proyecto: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. Edificio Norte" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Entidad / Empresa</label>
                    <input type="text" value={formData.entidad} onChange={(e) => setFormData({...formData, entidad: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. Constructora Alfa" />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contacto Externo (Directorio)</label>
                    <select value={formData.contacto_id} onChange={(e) => setFormData({...formData, contacto_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="">Sin asignar (Opcional)</option>
                      {contactos.map((contacto) => (
                        <option key={contacto.id} value={contacto.id}>
                          {contacto.nombre_completo} {contacto.empresa ? `(${contacto.empresa})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Línea de Negocio (Servicio)</label>
                    <select value={formData.servicio} onChange={(e) => setFormData({...formData, servicio: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option>Consultoría</option>
                      <option>Interventoría</option>
                      <option>Gerencia de Proyectos</option>
                      <option>Grucon Energy (Desarrollo de PCHs)</option>
                      <option>Innovación</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor Estimado (COP)</label>
                    <input type="number" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. 15000000" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duración (Meses)</label>
                    <input type="number" value={formData.duracion} onChange={(e) => setFormData({...formData, duracion: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. 6" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Etapa Comercial</label>
                    <select value={formData.etapa} onChange={(e) => setFormData({...formData, etapa: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option>Nuevo</option>
                      <option>Contactado</option>
                      <option>Cotizado</option>
                      <option>En Negociación</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70">
                    {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}