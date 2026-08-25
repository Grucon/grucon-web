import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grucon Ingeniería",
  description: "Consultoría especializada en ingeniería",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Forzamos el esquema oscuro desde el HTML
    <html lang="es" className="dark" style={{ colorScheme: "dark" }}> 
      {/* Aplicamos el fondo corporativo directamente al Body */}
      <body className={`${inter.className} bg-slate-900 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}