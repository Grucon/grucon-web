"use client";

import Image from "next/image";
import { ReactNode } from "react";

// Header común a todas las pantallas del área /dashboard: logo + acciones
// específicas de cada página, pasadas como children.
export default function DashboardHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
      <Image
        src="/Logo_GRUCON_dark.png"
        alt="Logo Grucon"
        width={100}
        height={30}
        priority
        className="object-contain"
      />
      <div className="flex items-center gap-4">{children}</div>
    </header>
  );
}
