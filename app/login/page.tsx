"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/utils/supabase/client"; // Ajusta la ruta si es necesario
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Intentamos iniciar sesión con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales incorrectas. Por favor, verifica tus datos.");
      setLoading(false);
      return;
    }

    // Si es exitoso, redirigimos al dashboard
    if (data.user) {
      router.push("/dashboard"); // Esta será nuestra próxima ruta protegida
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 p-6">
      
      {/* Botón para volver al inicio */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8"
      >
        
        {/* Logo corporativo (Versión oscura permanente) */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo_GRUCON_dark.png"
            alt="Logo Grucon"
            width={180}
            height={60}
            className="object-contain"
          />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Portal de Usuarios</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Ingresa con las credenciales proporcionadas por tu ingeniero asignado.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Correo Electrónico Corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 dark:text-white"
              placeholder="cliente@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contraseña
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
            {loading ? "Iniciando sesión..." : "Ingresar al Portal"}
          </button>
          
        </form>
      </motion.div>
    </main>
  );
}