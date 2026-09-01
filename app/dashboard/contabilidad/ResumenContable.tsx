"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useContabilidad } from "@/utils/hooks/useContabilidad";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function etiquetaPeriodo(periodo: string) {
  const anio = periodo.slice(0, 4);
  const mes = parseInt(periodo.slice(4, 6), 10);
  return `${MESES[mes - 1] ?? periodo} ${anio}`;
}

const formatDinero = (valor: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

function Metrica({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold mt-1 ${color}`}>{formatDinero(valor)}</p>
    </div>
  );
}

export default function ResumenContable({ userId }: { userId?: string }) {
  const {
    loading, resumenAnioActual, ultimoMes, categoriasGasto, ultimaImportacion,
    anioActual, importando, progreso, error, importarArchivo,
  } = useContabilidad(userId);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await importarArchivo(file);
    e.target.value = "";
  };

  if (loading) return <p className="text-slate-400 animate-pulse mb-6">Cargando contabilidad...</p>;

  const balanceAnio = resumenAnioActual.ingresos - resumenAnioActual.gastos;
  const balanceMes = ultimoMes ? ultimoMes.ingresos - ultimoMes.gastos : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Contabilidad</h1>
          <p className="text-slate-400">Resumen de ingresos y gastos.</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={importando}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md disabled:opacity-60 whitespace-nowrap"
          >
            {importando ? (progreso ? `Importando ${progreso.actual}/${progreso.total}...` : "Importando...") : "Importar archivo (.xlsx)"}
          </button>
          {ultimaImportacion && (
            <p className="text-xs text-slate-500 text-right">
              Última carga: {ultimaImportacion.nombre_archivo} ({ultimaImportacion.filas_importadas} filas) —{" "}
              {new Date(ultimaImportacion.created_at).toLocaleDateString("es-CO")}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-900/40 text-red-400 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Año en curso ({anioActual})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Metrica label="Ingresos" valor={resumenAnioActual.ingresos} color="text-emerald-400" />
            <Metrica label="Gastos" valor={resumenAnioActual.gastos} color="text-red-400" />
            <Metrica label="Balance" valor={balanceAnio} color={balanceAnio >= 0 ? "text-blue-400" : "text-amber-400"} />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            {ultimoMes ? `Último mes disponible: ${etiquetaPeriodo(ultimoMes.periodo)}` : "Último mes disponible"}
          </h2>
          {ultimoMes ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Metrica label="Ingresos" valor={ultimoMes.ingresos} color="text-emerald-400" />
              <Metrica label="Gastos" valor={ultimoMes.gastos} color="text-red-400" />
              <Metrica label="Balance" valor={balanceMes} color={balanceMes >= 0 ? "text-blue-400" : "text-amber-400"} />
            </div>
          ) : (
            <p className="text-sm text-slate-400">Aún no hay movimientos importados.</p>
          )}
        </div>
      </div>

      {categoriasGasto.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Top categorías de gasto ({anioActual})</h2>
          <ul className="space-y-2">
            {categoriasGasto.map((c) => (
              <li key={c.nombre_grupo} className="flex items-center justify-between text-sm border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-300">{c.nombre_grupo || "Sin categoría"}</span>
                <span className="font-semibold text-red-400">{formatDinero(c.total_gasto)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
