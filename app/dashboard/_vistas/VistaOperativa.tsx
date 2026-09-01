"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useProyectosOperativos } from "@/utils/hooks/useProyectosOperativos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function VistaOperativa({ perfil, user }: { perfil?: any, user?: any }) {
  const { obras, loading, fetchObras: fetchMisObras } = useProyectosOperativos(user?.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [proyectoActivo, setProyectoActivo] = useState<any | null>(null);

  // Estados del Modal y CRUD
  const [modalTipo, setModalTipo] = useState<'proyecto' | 'documento' | 'producto' | 'factura' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({});
  const [editId, setEditId] = useState<number | null>(null); // null = Crear, number = Editar

  useEffect(() => {
    if (proyectoActivo) {
      const obraActualizada = obras.find(o => o.id === proyectoActivo.id);
      if (obraActualizada) setProyectoActivo(obraActualizada);
    }
  }, [obras]);

  const handleDelete = async (tabla: string, id: number) => {
    if (window.confirm(`¿Estás seguro de eliminar este registro? Esta acción es irreversible.`)) {
      const { error } = await supabase.from(tabla).delete().eq('id', id);
      if (error) alert(`Error al eliminar: ${error.message}`);
      else fetchMisObras(); 
    }
  };

  const openEditModal = (tipo: any, item: any) => {
    setModalTipo(tipo);
    setEditId(item.id);
    if (tipo === 'proyecto') {
      // 'item' viene con relaciones anidadas (documentos_legales, productos_obra,
      // facturas_obra) y el campo calculado gasto_contable, que no son columnas
      // de proyectos_operativos: si se mandan tal cual en el update, Supabase
      // lo rechaza. Solo tomamos los campos editables reales de la tabla.
      setFormData({
        nombre_proyecto: item.nombre_proyecto,
        cliente: item.cliente,
        centro_costos: item.centro_costos,
        avance_fisico: item.avance_fisico,
        estado: item.estado,
      });
    } else {
      setFormData(item);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let errorObj;

    let tabla = '';
    if (modalTipo === 'proyecto') tabla = 'proyectos_operativos';
    else if (modalTipo === 'documento') tabla = 'documentos_legales';
    else if (modalTipo === 'producto') tabla = 'productos_obra';
    else if (modalTipo === 'factura') tabla = 'facturas_obra';

    let payload = { ...formData };
    
    if (modalTipo === 'proyecto' && !editId) {
      payload.ingeniero_id = user.id;
    }
    if (modalTipo !== 'proyecto') {
      payload.proyecto_id = proyectoActivo?.id;
    }

    if (editId) {
      const { error } = await supabase.from(tabla).update(payload).eq('id', editId);
      errorObj = error;
    } else {
      const { error } = await supabase.from(tabla).insert([payload]);
      errorObj = error;
    }

    setIsSubmitting(false);
    if (errorObj) {
      alert(`Error al guardar: ${errorObj.message}`);
    } else {
      setModalTipo(null);
      setEditId(null);
      setFormData({});
      fetchMisObras(); 
    }
  };

  const formatDinero = (valor: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  };

  if (loading) return <p className="text-slate-500 animate-pulse mb-6">Cargando operaciones...</p>;

  // Variable de apoyo para saber si el usuario activo es el dueño del proyecto abierto
  const esDuenioActivo = proyectoActivo?.ingeniero_id === user?.id;

  // Balance 100% contable (Ingresos - Gastos), acumulado desde el inicio del
  // proyecto por centro de costo. `facturas_obra` sigue existiendo como
  // registro manual de facturación, pero ya no alimenta este balance.
  const totalIngresos = Number(proyectoActivo?.ingresos_contables) || 0;
  const totalGastado = Number(proyectoActivo?.gasto_contable) || 0;
  const balanceProyecto = Number(proyectoActivo?.balance_contable) || (totalIngresos - totalGastado);

  return (
    <> 
      <AnimatePresence mode="wait">
        {!proyectoActivo ? (
          <motion.div key="resumen" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Centro de Operaciones</h1>
                <p className="text-slate-400">Resumen de proyectos activos y estado de ejecución.</p>
              </div>
              <button 
                onClick={() => { setEditId(null); setFormData({}); setModalTipo('proyecto'); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md shadow-orange-500/20 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nuevo Proyecto
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {obras.length === 0 ? (
                <div className="text-center p-12 bg-slate-800 rounded-xl border border-dashed border-slate-700">
                  <p className="text-slate-400 mb-4">No hay obras operativas actualmente.</p>
                </div>
              ) : (
                obras.map((obra) => (
                  <div key={obra.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white">{obra.nombre_proyecto || 'Sin Nombre'}</h3>
                          <p className="text-sm text-slate-400 mb-2">{obra.cliente || 'Cliente no especificado'} {obra.centro_costos && `| CC: ${obra.centro_costos}`}</p>
                        </div>
                        
                        {/* CAMBIO 2: Ocultamos los botones de editar/borrar si no es el dueño */}
                        {obra.ingeniero_id === user?.id && (
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal('proyecto', obra)} className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors bg-slate-700/50 hover:bg-slate-700 rounded-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                            <button onClick={() => handleDelete('proyectos_operativos', obra.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors bg-slate-700/50 hover:bg-slate-700 rounded-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                         <span className="text-xs px-2 py-1 bg-orange-900/30 text-orange-400 rounded-full font-medium">Avance: {obra.avance_fisico}%</span>
                         <span className="text-xs text-slate-400">Estado: {obra.estado}</span>
                      </div>

                      <div className="flex gap-4 text-xs font-medium text-slate-400">
                        <span className="bg-slate-700 px-2 py-1 rounded">Docs: {obra.documentos_legales?.length || 0}</span>
                        <span className="bg-slate-700 px-2 py-1 rounded">Productos: {obra.productos_obra?.length || 0}</span>
                        <span className="bg-slate-700 px-2 py-1 rounded">Facturas: {obra.facturas_obra?.length || 0}</span>
                        <span className={`px-2 py-1 rounded ${(Number(obra.balance_contable) || 0) >= 0 ? 'bg-blue-900/30 text-blue-400' : 'bg-amber-900/30 text-amber-400'}`}>
                          Balance Contable: {formatDinero(Number(obra.balance_contable) || 0)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setProyectoActivo(obra)}
                      className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium shadow-md flex items-center gap-2 transition-colors"
                    >
                      Ingresar al Proyecto <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="detalle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-8">
              <button onClick={() => setProyectoActivo(null)} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-orange-500 mb-4 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Volver al resumen
              </button>
              <h1 className="text-3xl font-bold text-white">{proyectoActivo.nombre_proyecto}</h1>
              <p className="text-slate-400">Cliente: {proyectoActivo.cliente} | CC: {proyectoActivo.centro_costos || 'N/A'} | Estado: <span className="font-semibold text-orange-500">{proyectoActivo.estado}</span> | Avance: {proyectoActivo.avance_fisico}%</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-emerald-900/10 border border-emerald-900/40">
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Ingresos Contables</p>
                <p className="text-xl font-bold text-white mt-1">{formatDinero(totalIngresos)}</p>
              </div>
              <div className="p-4 rounded-xl bg-red-900/10 border border-red-900/40">
                <p className="text-xs font-medium text-red-400 uppercase tracking-wide">Gasto Contable</p>
                <p className="text-xl font-bold text-white mt-1">{formatDinero(totalGastado)}</p>
              </div>
              <div className={`p-4 rounded-xl border ${balanceProyecto >= 0 ? 'bg-blue-900/10 border-blue-900/40' : 'bg-amber-900/10 border-amber-900/40'}`}>
                <p className={`text-xs font-medium uppercase tracking-wide ${balanceProyecto >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>Balance (desde el inicio del proyecto)</p>
                <p className="text-xl font-bold text-white mt-1">{formatDinero(balanceProyecto)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* 1. CONTRACTUAL (Documentos) */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="p-1.5 bg-blue-900/30 text-blue-400 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span>
                    Legal
                  </h2>
                  {/* CAMBIO 3: Botón añadir oculto si no es dueño */}
                  {esDuenioActivo && (
                    <button onClick={() => { setEditId(null); setFormData({}); setModalTipo('documento'); }} className="text-xs bg-blue-900/40 text-blue-400 hover:bg-blue-800/60 px-3 py-1.5 rounded-lg font-medium transition-colors">+ Añadir</button>
                  )}
                </div>
                <ul className="space-y-3">
                  {proyectoActivo.documentos_legales?.length === 0 && <p className="text-sm text-slate-400">No hay documentos registrados.</p>}
                  {proyectoActivo.documentos_legales?.map((doc: any) => (
                    <li key={doc.id} className="text-sm border border-slate-700 p-3 rounded-lg bg-slate-900/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-200">{doc.tipo_documento}: <span className="font-normal text-slate-400">{doc.referencia}</span></p>
                          <p className="text-xs text-slate-400 mt-1">Vence: {doc.fecha_vencimiento || 'N/A'}</p>
                        </div>
                        {/* CAMBIO 4: Botones edición de sub-ítems ocultos si no es dueño */}
                        {esDuenioActivo && (
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal('documento', doc)} className="text-blue-400 hover:text-blue-300 text-xs font-medium">Editar</button>
                            <button onClick={() => handleDelete('documentos_legales', doc.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">X</button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. ALCANCE (Productos / Entregables) */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 border-t-4 border-t-orange-500">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="p-1.5 bg-orange-900/30 text-orange-400 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></span>
                    Productos
                  </h2>
                  {esDuenioActivo && (
                    <button onClick={() => { setEditId(null); setFormData({}); setModalTipo('producto'); }} className="text-xs bg-orange-900/40 text-orange-400 hover:bg-orange-800/60 px-3 py-1.5 rounded-lg font-medium transition-colors">+ Añadir</button>
                  )}
                </div>
                <ul className="space-y-3">
                  {proyectoActivo.productos_obra?.length === 0 && <p className="text-sm text-slate-400">No hay productos registrados.</p>}
                  {proyectoActivo.productos_obra?.map((prod: any) => (
                    <li key={prod.id} className="text-sm border border-slate-700 p-3 rounded-lg flex justify-between items-center bg-slate-900/50">
                      <div>
                        <p className="font-semibold text-slate-200">{prod.nombre}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{prod.fase} | {prod.valor ? formatDinero(prod.valor) : 'Sin valor'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] px-2 py-0.5 bg-slate-700 border border-slate-600 rounded text-slate-300">{prod.estado}</span>
                        {esDuenioActivo && (
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => openEditModal('producto', prod)} className="text-orange-400 hover:text-orange-300 text-xs font-medium">Editar</button>
                            <button onClick={() => handleDelete('productos_obra', prod.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">X</button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. FINANCIERO (Facturas) */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-900/30 text-emerald-400 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                    Facturación
                  </h2>
                  {esDuenioActivo && (
                    <button onClick={() => { setEditId(null); setFormData({}); setModalTipo('factura'); }} className="text-xs bg-emerald-900/40 text-emerald-400 hover:bg-emerald-800/60 px-3 py-1.5 rounded-lg font-medium transition-colors">+ Añadir</button>
                  )}
                </div>
                <ul className="space-y-3">
                  {proyectoActivo.facturas_obra?.length === 0 && <p className="text-sm text-slate-400">No hay facturas registradas.</p>}
                  {proyectoActivo.facturas_obra?.map((fac: any) => {
                    const prodVinculado = proyectoActivo.productos_obra?.find((p:any) => p.id === fac.producto_id);
                    return (
                      <li key={fac.id} className="text-sm border border-slate-700 p-3 rounded-lg flex justify-between items-center bg-slate-900/50">
                        <div>
                          <p className="font-bold text-emerald-400">{formatDinero(fac.valor)}</p>
                          <p className="text-xs text-slate-400 font-medium">#{fac.numero_factura} {prodVinculado ? `(${prodVinculado.nombre})` : ''}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded text-slate-300">{fac.estado}</span>
                          {esDuenioActivo && (
                            <div className="flex gap-2 mt-1">
                              <button onClick={() => openEditModal('factura', fac)} className="text-emerald-400 hover:text-emerald-300 text-xs font-medium">Editar</button>
                              <button onClick={() => handleDelete('facturas_obra', fac.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">X</button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* 4. FINANCIERO (Contabilidad real, solo lectura, acumulada desde el inicio del proyecto) */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 border-t-4 border-t-red-500">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="p-1.5 bg-red-900/30 text-red-400 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg></span>
                    Contabilidad
                  </h2>
                </div>
                {proyectoActivo.centro_costos ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Ingresos</span>
                      <span className="font-semibold text-emerald-400">{formatDinero(totalIngresos)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Gastos</span>
                      <span className="font-semibold text-red-400">{formatDinero(totalGastado)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-700">
                      <span className="text-slate-300 font-medium">Balance</span>
                      <span className={`font-bold ${balanceProyecto >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>{formatDinero(balanceProyecto)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">
                      Centro de costo: <span className="text-slate-300 font-medium">{proyectoActivo.centro_costos}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Acumulado desde el inicio del proyecto. Fuente: módulo de Contabilidad (libro auxiliar importado).</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Este proyecto no tiene un Centro de Costos asignado, así que no se puede cruzar con Contabilidad. Edítalo desde el botón de lápiz en el resumen.
                  </p>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ANIMACIÓN 2: Independiente, solo para abrir/cerrar el modal */}
      <AnimatePresence>
        {modalTipo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700 flex justify-between bg-slate-900/50">
                <h3 className="font-bold text-white capitalize">
                  {editId ? 'Editar' : 'Añadir Nuevo'} {modalTipo}
                </h3>
                <button onClick={() => {setModalTipo(null); setEditId(null); setFormData({});}} className="text-slate-400 hover:text-slate-200"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {modalTipo === 'proyecto' && (
                  <>
                    <div>
                      <label className="block text-sm mb-1 font-medium text-slate-300">Nombre de la Obra/Proyecto</label>
                      <input type="text" required value={formData.nombre_proyecto || ''} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, nombre_proyecto: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 font-medium text-slate-300">Cliente / Entidad</label>
                      <input type="text" required value={formData.cliente || ''} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, cliente: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1 font-medium text-slate-300">Centro de Costos</label>
                        <input type="text" value={formData.centro_costos || ''} placeholder="Ej: C-410 (debe coincidir con el inicio del nombre de centro de costo en Contabilidad)" className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, centro_costos: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 font-medium text-slate-300">Avance Físico (%)</label>
                        <input type="number" min="0" max="100" value={formData.avance_fisico || 0} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, avance_fisico: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 font-medium text-slate-300">Estado</label>
                      <select value={formData.estado || 'Planificación'} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, estado: e.target.value})}>
                        <option value="Planificación">Planificación</option>
                        <option value="En ejecución">En ejecución</option>
                        <option value="Suspendido">Suspendido</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="Liquidado">Liquidado</option>
                      </select>
                    </div>
                  </>
                )}

                {modalTipo === 'documento' && (
                  <>
                    <div><label className="block text-sm mb-1 font-medium text-slate-300">Tipo de Documento</label><input type="text" required value={formData.tipo_documento || ''} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, tipo_documento: e.target.value})} /></div>
                    <div><label className="block text-sm mb-1 font-medium text-slate-300">Referencia / Número</label><input type="text" required value={formData.referencia || ''} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, referencia: e.target.value})} /></div>
                    <div><label className="block text-sm mb-1 font-medium text-slate-300">Fecha de Vencimiento</label><input type="date" value={formData.fecha_vencimiento || ''} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, fecha_vencimiento: e.target.value})} /></div>
                  </>
                )}

                {modalTipo === 'producto' && (
                  <>
                    <div><label className="block text-sm mb-1 font-medium text-slate-300">Nombre del Entregable</label><input type="text" required value={formData.nombre || ''} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, nombre: e.target.value})} /></div>
                    <div><label className="block text-sm mb-1 font-medium text-slate-300">Fase</label><input type="text" value={formData.fase || ''} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, fase: e.target.value})} /></div>
                    <div><label className="block text-sm mb-1 font-medium text-slate-300">Valor (Presupuesto) COP</label><input type="number" value={formData.valor || ''} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, valor: e.target.value})} /></div>
                    <div>
                      <label className="block text-sm mb-1 font-medium text-slate-300">Estado</label>
                      <select value={formData.estado || 'Pendiente'} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, estado: e.target.value})}>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Revisión">En Revisión</option>
                        <option value="Aprobado">Aprobado</option>
                      </select>
                    </div>
                  </>
                )}

                {modalTipo === 'factura' && (
                  <>
                    <div><label className="block text-sm mb-1 font-medium text-slate-300">Número de Factura</label><input type="text" required value={formData.numero_factura || ''} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, numero_factura: e.target.value})} /></div>
                    <div><label className="block text-sm mb-1 font-medium text-slate-300">Valor (COP)</label><input type="number" required value={formData.valor || ''} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, valor: e.target.value})} /></div>
                    
                    <div>
                      <label className="block text-sm mb-1 font-medium text-slate-300">Asociar a Producto (Opcional)</label>
                      <select value={formData.producto_id || ''} className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white outline-none" onChange={(e)=>setFormData({...formData, producto_id: e.target.value ? parseInt(e.target.value) : null})}>
                        <option value="">-- Sin asociar --</option>
                        {proyectoActivo?.productos_obra?.map((prod: any) => (
                          <option key={prod.id} value={prod.id}>{prod.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-700">
                  <button type="button" onClick={() => {setModalTipo(null); setEditId(null); setFormData({});}} className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 disabled:opacity-70 transition-colors shadow-md">
                    {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar' : 'Guardar')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </> 
  );
}