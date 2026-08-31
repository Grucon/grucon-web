"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MODULOS } from "@/utils/modulos";
import { usePermisosModulos } from "@/utils/hooks/usePermisosModulos";
import { useProyectosOperativos } from "@/utils/hooks/useProyectosOperativos";
import VistaComercial from "./VistaComercial";
import VistaAdministrativa from "./VistaAdministrativa";
import VistaOperativa from "./VistaOperativa";

type Seccion = "resumen" | "comercial" | "administrativa" | "operativa";

interface VistaDirectivaProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pipeline: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contactos?: any[];
  fetchPipeline?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
  perfil?: { rol: string } | null;
}

const formatearDinero = (valor: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

export default function VistaDirectiva({ pipeline, contactos = [], fetchPipeline = () => {}, user, perfil }: VistaDirectivaProps) {
  const [seccion, setSeccion] = useState<Seccion>("resumen");
  const { permisos } = usePermisosModulos(user?.id, perfil?.rol);
  const { obras } = useProyectosOperativos(user?.id);

  const contratosGanados = pipeline.filter((p) => p.estado?.toLowerCase() === "ganado");
  const leadsActivos = pipeline.filter((p) => p.estado?.toLowerCase() !== "ganado" && p.estado?.toLowerCase() !== "perdido");
  const valorContratos = contratosGanados.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  const obrasEnEjecucion = obras.filter((o) => o.estado === "En ejecución").length;

  const tarjetas: {
    key: Seccion;
    titulo: string;
    descripcion: string;
    colorClasses: { bg: string; border: string; text: string; iconBg: string; iconText: string };
    metricas: { label: string; valor: string }[];
  }[] = [
    {
      key: "comercial",
      titulo: "Comercial",
      descripcion: "Pipeline de contratos y oportunidades activas.",
      colorClasses: {
        bg: "bg-emerald-900/10", border: "border-emerald-900/40", text: "text-emerald-400",
        iconBg: "bg-emerald-900/30", iconText: "text-emerald-400",
      },
      metricas: [
        { label: "Contratos adjudicados", valor: String(contratosGanados.length) },
        { label: "Valor adjudicado", valor: formatearDinero(valorContratos) },
        { label: "Leads activas", valor: String(leadsActivos.length) },
      ],
    },
    {
      key: "administrativa",
      titulo: "Administración",
      descripcion: "Tesorería, RRHH, Sistemas, Logística y Contabilidad.",
      colorClasses: {
        bg: "bg-indigo-900/10", border: "border-indigo-900/40", text: "text-indigo-400",
        iconBg: "bg-indigo-900/30", iconText: "text-indigo-400",
      },
      metricas: [
        { label: "Módulos con acceso", valor: `${permisos.size}/${MODULOS.length}` },
      ],
    },
    {
      key: "operativa",
      titulo: "Operaciones",
      descripcion: "Obras y proyectos en curso.",
      colorClasses: {
        bg: "bg-orange-900/10", border: "border-orange-900/40", text: "text-orange-400",
        iconBg: "bg-orange-900/30", iconText: "text-orange-400",
      },
      metricas: [
        { label: "Proyectos totales", valor: String(obras.length) },
        { label: "En ejecución", valor: String(obrasEnEjecucion) },
      ],
    },
  ];

  return (
    <AnimatePresence mode="wait">
      {seccion === "resumen" ? (
        <motion.div key="resumen" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Visión Estratégica</h1>
          <p className="text-slate-400 mb-8">Panel gerencial. Monitoreo global de operaciones e indicadores.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tarjetas.map((t) => (
              <motion.div
                key={t.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSeccion(t.key)}
                className={`cursor-pointer rounded-xl border p-6 transition-colors hover:brightness-110 ${t.colorClasses.bg} ${t.colorClasses.border}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`p-2 rounded-lg ${t.colorClasses.iconBg} ${t.colorClasses.iconText}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                  <span className="text-xs font-medium text-white flex items-center gap-1">
                    Ver dashboard
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>

                <h3 className={`font-semibold ${t.colorClasses.text}`}>{t.titulo}</h3>
                <p className="text-sm text-slate-400 mt-1 mb-4">{t.descripcion}</p>

                <div className="pt-4 border-t border-slate-700/50 space-y-2">
                  {t.metricas.map((m) => (
                    <div key={m.label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="font-semibold text-white">{m.valor}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div key={seccion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <button
            onClick={() => setSeccion("resumen")}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al resumen
          </button>

          {seccion === "comercial" && (
            <VistaComercial pipeline={pipeline} contactos={contactos} fetchPipeline={fetchPipeline} />
          )}
          {seccion === "administrativa" && <VistaAdministrativa user={user} perfil={perfil} />}
          {seccion === "operativa" && <VistaOperativa perfil={perfil} user={user} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
