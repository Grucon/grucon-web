"use client";

export default function VistaCliente({ perfil }: { perfil: any }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
        Hola, {perfil?.nombre_completo || 'Usuario'}
      </h1>
      <p className="text-slate-600 dark:text-slate-400">Bienvenido al Portal Grucon.</p>
    </div>
  );
}