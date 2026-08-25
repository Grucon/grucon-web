"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function VistaOperativa({ perfil, user }: { perfil?: any, user?: any }) {
  // Estado para controlar si estamos viendo la lista o el detalle de un proyecto
  const [proyectoActivo, setProyectoActivo] = useState<any | null>(null);

  // Datos de prueba estructurados con los 3 pilares solicitados
  const obras = [
    { 
      id: 1, 
      proyecto: "Cálculo Estructural Edificio Norte", 
      cliente: "Constructora Alfa", 
      avance_fisico: 65, 
      estado: "En ejecución",
      // PILAR 1: CONTRACTUAL
      contractual: {
        contrato: "CT-2026-045",
        fecha_inicio: "15 Ene 2026",
        fecha_fin_estimada: "28 Ago 2026",
        adicionales: 1,
        estado_legal: "Al día"
      },
      // PILAR 2: ALCANCE
      alcance: {
        fase_actual: "Diseño de Cimentación",
        entregables_totales: 12,
        entregables_aprobados: 7,
        proximo_hito: "Entrega Planos V2",
        observaciones: "Terreno con nivel freático alto, ajustes en diseño requeridos."
      },
      // PILAR 3: FINANCIERO
      financiero: {
        presupuesto_total: 120000000,
        facturado: 60000000,
        costos_ejecutados: 45000000,
        rentabilidad_actual: "25%"
      }
    },
    { 
      id: 2, 
      proyecto: "Estudio de Suelos Lote B", 
      cliente: "Inversiones del Valle", 
      avance_fisico: 90, 
      estado: "Fase Final",
      contractual: {
        contrato: "CT-2026-089",
        fecha_inicio: "10 Jul 2026",
        fecha_fin_estimada: "30 Ago 2026",
        adicionales: 0,
        estado_legal: "Liquidación próxima"
      },
      alcance: {
        fase_actual: "Informe Final",
        entregables_totales: 4,
        entregables_aprobados: 3,
        proximo_hito: "Firma de actas",
        observaciones: "Muestras de laboratorio completadas con éxito."
      },
      financiero: {
        presupuesto_total: 35000000,
        facturado: 35000000,
        costos_ejecutados: 18000000,
        rentabilidad_actual: "48%"
      }
    }
  ];

  // Función para formatear el dinero a Pesos Colombianos (COP)
  const formatDinero = (valor: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  };

  return (
    <AnimatePresence mode="wait">
      {/* ========================================= */}
      {/* VISTA 1: DASHBOARD RESUMEN DE PROYECTOS */}
      {/* ========================================= */}
      {!proyectoActivo ? (
        <motion.div 
          key="resumen"
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Centro de Operaciones</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Resumen de proyectos a cargo y estado de ejecución.
              </p>
            </div>
          </div>

          {/* KPIs Operativos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">Proyectos Activos</h3>
              <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mt-2">{obras.length}</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Avance Promedio</h3>
              <p className="text-4xl font-bold text-slate-700 dark:text-slate-300 mt-2">
                {Math.round(obras.reduce((acc, curr) => acc + curr.avance_fisico, 0) / obras.length)}%
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Alertas Técnicas</h3>
              <p className="text-4xl font-bold text-red-500 dark:text-red-400 mt-2">0</p>
            </div>
          </div>

          {/* Lista de Proyectos */}
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Mis Proyectos Asignados</h2>
          <div className="grid grid-cols-1 gap-4">
            {obras.map((obra) => (
              <div key={obra.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1 w-full">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{obra.proyecto}</h3>
                  <p className="text-sm text-slate-500 mb-4">{obra.cliente}</p>
                  
                  {/* Barra de Progreso */}
                  <div className="w-full max-w-md">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Avance Físico</span>
                      <span className="font-bold text-orange-600">{obra.avance_fisico}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${obra.avance_fisico}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-auto">
                  <button 
                    onClick={() => setProyectoActivo(obra)}
                    className="w-full md:w-auto px-6 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    Ingresar al Proyecto
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        
      /* ========================================= */
      /* VISTA 2: DETALLE PROFUNDO DEL PROYECTO    */
      /* ========================================= */
        <motion.div 
          key="detalle"
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Botón de regreso y Título */}
          <div className="mb-8">
            <button 
              onClick={() => setProyectoActivo(null)}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Volver al resumen
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{proyectoActivo.proyecto}</h1>
            <p className="text-slate-600 dark:text-slate-400">Cliente: {proyectoActivo.cliente} | Estado: <span className="font-semibold text-orange-600">{proyectoActivo.estado}</span></p>
          </div>

          {/* GRID DE LOS 3 PILARES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. DESARROLLO CONTRACTUAL */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Desarrollo Contractual</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Nº de Contrato</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{proyectoActivo.contractual.contrato}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Inicio</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{proyectoActivo.contractual.fecha_inicio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Fin Estimado</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{proyectoActivo.contractual.fecha_fin_estimada}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Adicionales / Otrosí</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{proyectoActivo.contractual.adicionales}</p>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Estado Legal</span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full">
                    {proyectoActivo.contractual.estado_legal}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ALCANCE Y TÉCNICO */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm border-t-4 border-t-orange-500">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Alcance y Ejecución</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Fase Actual</p>
                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{proyectoActivo.alcance.fase_actual}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Entregables (Aprobados / Totales)</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-800 dark:bg-slate-300 rounded-full" style={{ width: `${(proyectoActivo.alcance.entregables_aprobados / proyectoActivo.alcance.entregables_totales) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{proyectoActivo.alcance.entregables_aprobados} de {proyectoActivo.alcance.entregables_totales}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Próximo Hito</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{proyectoActivo.alcance.proximo_hito}</p>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Observaciones de Obra</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{proyectoActivo.alcance.observaciones}"</p>
                </div>
              </div>
            </div>

            {/* 3. FINANCIERO */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Estado Financiero</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Presupuesto Total Contratado</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatDinero(proyectoActivo.financiero.presupuesto_total)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Facturado a Cliente</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatDinero(proyectoActivo.financiero.facturado)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Costos Ejecutados</p>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formatDinero(proyectoActivo.financiero.costos_ejecutados)}</p>
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-xl">
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rentabilidad del Proyecto</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{proyectoActivo.financiero.rentabilidad_actual}</span>
                  </div>
                  <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Ver Flujo de Caja
                  </button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}