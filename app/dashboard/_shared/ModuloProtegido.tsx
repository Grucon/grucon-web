"use client";

import { useRouter } from "next/navigation";
import { getModulo, ModuloKey } from "@/utils/modulos";
import { usePermisoModulo } from "@/utils/hooks/usePermisoModulo";
import DashboardHeader from "./DashboardHeader";

export default function ModuloProtegido({ modulo }: { modulo: ModuloKey }) {
  const router = useRouter();
  const { loading } = usePermisoModulo(modulo);
  const info = getModulo(modulo);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400">Verificando permisos...</p>
      </div>
    );
  }

  if (!info) return null;

  return (
    <main className="min-h-screen bg-slate-900">
      <DashboardHeader>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          Volver al Dashboard
        </button>
      </DashboardHeader>

      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <span className={`inline-flex p-3 rounded-xl mb-4 ${info.colorClasses.iconBg} ${info.colorClasses.iconText}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </span>
        <h1 className="text-3xl font-bold text-white mb-2">{info.label}</h1>
        <p className="text-slate-400 max-w-md mx-auto">{info.descripcion}</p>
        <p className="text-slate-500 text-sm mt-6">
          Este módulo está en construcción. Pronto encontrarás aquí la información completa.
        </p>
      </div>
    </main>
  );
}
