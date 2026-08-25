"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function VistaOperativa({ perfil }: { perfil: any }) {
  // Datos de prueba para visualizar el diseño (luego los conectaremos a Supabase)
  const [obras, setObras] = useState([
    { id: 1, proyecto: "Edificio Corporativo Norte", cliente: "Constructora Alfa", avance: 45, proxima_entrega: "Diseño Estructural V2", fecha: "28 Ago 2026", estado: "En ejecución" },
    { id: 2, proyecto: "Estudio de Suelos Lote B", cliente: "Inversiones del Valle", avance: 90, proxima_entrega: "Informe Final", fecha: "25 Ago 2026", estado: "Revisión" },
  ]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Centro de Operaciones</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Control técnico de obras, carga de informes y actualización de avances.
          </p>
        </div>
      </div>

      {/* Tarjetas de Indicadores Técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50">
          <h3 className="font-semibold text-orange-900 dark:text-orange-100">Mis Obras Asignadas</h3>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{obras.length}</p>
        </div>
        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">Entregables Próximos</h3>
          <p className="text-3xl font-bold text-slate-700 dark:text-slate-300 mt-2">2</p>
        </div>
        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">Eficiencia Promedio</h3>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">68%</p>
        </div>
      </div>

      {/* Tabla de Control de Ejecución */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Ejecución de Proyectos</h2>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 font-semibold">Proyecto / Cliente</th>
                  <th className="px-6 py-4 font-semibold w-1/3">Avance Técnico</th>
                  <th className="px-6 py-4 font-semibold">Próxima Entrega</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {obras.map((obra) => (
                  <tr key={obra.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{obra.proyecto}</p>
                      <p className="text-xs text-slate-500">{obra.cliente}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full" 
                            style={{ width: `${obra.avance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{obra.avance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{obra.proxima_entrega}</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">Vence: {obra.fecha}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                          Actualizar %
                        </button>
                        <button className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
                          Subir Archivo
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}