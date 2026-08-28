"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-900 overflow-hidden relative">
      
      {/* BARRA SUPERIOR (HEADER) CON BOTÓN DE LOGIN */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-5 backdrop-blur-md bg-slate-900/80 border-b border-slate-800/50">
        
        {/* Logo pequeño en la esquina superior izquierda */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center"
        >
          <Image
            src="/Logo_GRUCON_dark.png"
            alt="Logo Grucon"
            width={120}
            height={40}
            className="object-contain"
          />
        </motion.div>

        {/* Botón de Login Elegante en la Esquina Superior Derecha */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/login")}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 text-slate-200 bg-slate-800/80 border border-slate-700/60 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm hover:shadow-blue-500/20 hover:shadow-lg"
          >
            {/* Icono de Usuario */}
            <svg
              className="w-4 h-4 transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Iniciar Sesión</span>
            {/* Efecto de destello en el borde en hover */}
            <span className="absolute inset-0 rounded-full border border-blue-400/0 group-hover:border-blue-400/50 transition-all duration-300 pointer-events-none" />
          </motion.button>
        </motion.div>
      </header>

      {/* SECCIÓN HERO (El Gancho) */}
      <section className="relative flex flex-col min-h-screen items-center justify-center px-6 pt-20">
        
        {/* Contenedor del Logo Principal Animado */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative mb-10"
        >
          <Image
            src="/Logo_GRUCON_dark.png" 
            alt="Logo Grucon Ingeniería"
            width={280} 
            height={120} 
            priority 
            className="object-contain"
          />
        </motion.div>

        {/* Título de Impacto Animado */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-center max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Ingeniería que <span className="text-blue-500">Transforma</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10">
            Consultoría especializada para proyectos que exigen precisión, innovación y resultados.
          </p>
          
          {/* Botón Principal */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold transition-colors shadow-lg shadow-blue-500/30"
          >
            Conoce Nuestros Proyectos
          </motion.button>
        </motion.div>

      </section>
    </main>
  );
}