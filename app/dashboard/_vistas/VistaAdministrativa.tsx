"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MODULOS } from "@/utils/modulos";
import { usePermisosModulos } from "@/utils/hooks/usePermisosModulos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function VistaAdministrativa({ user, perfil }: { user?: any; perfil?: { rol: string } | null }) {
  const router = useRouter();
  const { permisos, loading } = usePermisosModulos(user?.id, perfil?.rol);

  if (loading) {
    return <p className="text-slate-400 animate-pulse mb-6">Cargando permisos...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Panel Administrativo</h1>
      <p className="text-slate-400 mb-8">
        Resumen de módulos internos. Solo se puede ingresar a los módulos autorizados.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULOS.map((modulo) => {
          const autorizado = permisos.has(modulo.key);
          return (
            <motion.div
              key={modulo.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-xl border p-6 transition-colors ${modulo.colorClasses.bg} ${modulo.colorClasses.border} ${
                autorizado ? "cursor-pointer hover:brightness-110" : "opacity-60"
              }`}
              onClick={() => autorizado && router.push(modulo.ruta)}
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`p-2 rounded-lg ${modulo.colorClasses.iconBg} ${modulo.colorClasses.iconText}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>

                {autorizado ? (
                  <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400 font-medium">
                    Autorizado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-slate-700/60 text-slate-400 font-medium">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Sin acceso
                  </span>
                )}
              </div>

              <h3 className={`font-semibold ${modulo.colorClasses.text}`}>{modulo.label}</h3>
              <p className="text-sm text-slate-400 mt-1 mb-4">{modulo.descripcion}</p>

              <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {autorizado ? "Indicadores en vivo próximamente" : "Solicita acceso a un directivo"}
                </span>
                {autorizado && (
                  <span className="text-xs font-medium text-white flex items-center gap-1">
                    Entrar
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
