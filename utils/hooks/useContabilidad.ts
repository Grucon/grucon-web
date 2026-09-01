"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { parseArchivoContable } from "@/utils/contabilidad/parseMovimientos";

export interface ResumenMensual {
  periodo: string;
  anio: number;
  ingresos: number;
  gastos: number;
}

export interface CategoriaGasto {
  anio: number;
  nombre_grupo: string;
  total_gasto: number;
}

export interface Importacion {
  id: number;
  nombre_archivo: string;
  periodos: string[];
  filas_importadas: number;
  created_at: string;
}

const TAMANO_LOTE = 500;

export function useContabilidad(userId?: string) {
  const [resumenMensual, setResumenMensual] = useState<ResumenMensual[]>([]);
  const [categoriasGasto, setCategoriasGasto] = useState<CategoriaGasto[]>([]);
  const [ultimaImportacion, setUltimaImportacion] = useState<Importacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [importando, setImportando] = useState(false);
  const [progreso, setProgreso] = useState<{ actual: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const anioActual = new Date().getFullYear();

  const fetchResumen = async () => {
    const [resMensual, resCategorias, resImportacion] = await Promise.all([
      supabase.from("contabilidad_resumen_mensual").select("*"),
      supabase.from("contabilidad_categorias_gasto_anual").select("*").eq("anio", anioActual),
      supabase.from("importaciones_contables").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (resMensual.error) console.error("Error cargando resumen mensual:", resMensual.error.message);
    if (resCategorias.error) console.error("Error cargando categorías de gasto:", resCategorias.error.message);
    if (resImportacion.error) console.error("Error cargando última importación:", resImportacion.error.message);

    setResumenMensual(resMensual.data ?? []);
    setCategoriasGasto(
      (resCategorias.data ?? []).slice().sort((a, b) => b.total_gasto - a.total_gasto).slice(0, 5)
    );
    setUltimaImportacion(resImportacion.data ?? null);
    setLoading(false);
  };

  useEffect(() => {
    (async () => { await fetchResumen(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const importarArchivo = async (file: File) => {
    if (!userId) return;
    setError(null);
    setImportando(true);
    setProgreso(null);

    try {
      const buffer = await file.arrayBuffer();
      const { filas, periodos } = parseArchivoContable(buffer);

      if (filas.length === 0) {
        throw new Error("El archivo no tiene filas con un periodo válido.");
      }

      const { error: deleteError } = await supabase
        .from("movimientos_contables")
        .delete()
        .in("periodo", periodos);
      if (deleteError) throw new Error(`No se pudo limpiar los periodos existentes: ${deleteError.message}`);

      const { data: importacion, error: importacionError } = await supabase
        .from("importaciones_contables")
        .insert([{ nombre_archivo: file.name, periodos, filas_importadas: filas.length, subido_por: userId }])
        .select()
        .single();
      if (importacionError || !importacion) {
        throw new Error(`No se pudo registrar la importación: ${importacionError?.message}`);
      }

      const filasConImportacion = filas.map((f) => ({ ...f, importacion_id: importacion.id }));

      for (let i = 0; i < filasConImportacion.length; i += TAMANO_LOTE) {
        const lote = filasConImportacion.slice(i, i + TAMANO_LOTE);
        const { error: insertError } = await supabase.from("movimientos_contables").insert(lote);
        if (insertError) throw new Error(`Error al importar (fila ${i}): ${insertError.message}`);
        setProgreso({ actual: Math.min(i + TAMANO_LOTE, filasConImportacion.length), total: filasConImportacion.length });
      }

      await fetchResumen();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido al importar el archivo.");
    } finally {
      setImportando(false);
      setProgreso(null);
    }
  };

  const resumenAnioActual = resumenMensual
    .filter((r) => r.anio === anioActual)
    .reduce(
      (acc, r) => ({ ingresos: acc.ingresos + r.ingresos, gastos: acc.gastos + r.gastos }),
      { ingresos: 0, gastos: 0 }
    );

  const ultimoMes = resumenMensual.reduce<ResumenMensual | null>(
    (max, r) => (!max || r.periodo > max.periodo ? r : max),
    null
  );

  return {
    loading,
    resumenAnioActual,
    ultimoMes,
    categoriasGasto,
    ultimaImportacion,
    anioActual,
    importando,
    progreso,
    error,
    importarArchivo,
  };
}
