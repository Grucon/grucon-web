"use client";

export default function VistaDirectiva({ pipeline }: { pipeline: any[] }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 text-white mb-2">Visión Estratégica</h1>
      <p className="text-slate-600 text-slate-400 mb-8">Panel gerencial. Monitoreo global de operaciones e indicadores.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-indigo-50 bg-indigo-900/20 border border-indigo-100 border-indigo-900/50">
          <h3 className="font-semibold text-indigo-900 text-indigo-100">Oportunidades Comerciales</h3>
          <p className="text-3xl font-bold text-indigo-600 text-indigo-400 mt-2">{pipeline.length}</p>
        </div>
      </div>
    </div>
  );
}