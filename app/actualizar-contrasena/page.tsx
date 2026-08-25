"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ActualizarContrasenaPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validación básica
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden. Por favor, verifica.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    // Actualizamos la contraseña en Supabase
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError("Hubo un error al actualizar la contraseña. Es posible que el enlace haya expirado.");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Redirigimos al dashboard después de 2 segundos para que lea el mensaje de éxito
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8"
      >
        {/* Logos adaptables a modo claro/oscuro */}
        <div className="flex justify-center mb-8">
          <Image
            src="/Logo_GRUCON.png"
            alt="Logo Grucon"
            width={180}
            height={60}
            className="block dark:hidden object-contain"
          />
          <Image
            src="/logo_GRUCON_dark.png"
            alt="Logo Grucon"
            width={180}
            height={60}
            className="hidden dark:block object-contain"
          />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crear Nueva Contraseña</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Ingresa tu nueva contraseña para acceder al Portal de Usuarios.
          </p>
        </div>

        {success ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-lg"
          >
            <p className="text-emerald-700 dark:text-emerald-400 font-medium">
              ¡Contraseña actualizada con éxito!
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
              Redirigiendo a tu panel...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Actualizando..." : "Guardar y Entrar"}
            </button>
            
          </form>
        )}
      </motion.div>
    </main>
  );
}