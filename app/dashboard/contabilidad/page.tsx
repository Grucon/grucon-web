"use client";

import { useRouter } from "next/navigation";
import { usePermisoModulo } from "@/utils/hooks/usePermisoModulo";
import DashboardHeader from "../_shared/DashboardHeader";
import ResumenContable from "./ResumenContable";

export default function ContabilidadPage() {
  const router = useRouter();
  const { loading, userId } = usePermisoModulo("contabilidad");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400">Verificando permisos...</p>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <ResumenContable userId={userId} />
      </div>
    </main>
  );
}
