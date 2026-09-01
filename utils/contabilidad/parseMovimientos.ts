import * as XLSX from "xlsx";

// Una fila ya mapeada a las columnas de `movimientos_contables`.
export interface MovimientoContable {
  anio: number;
  periodo: string;
  fecha: string | null;
  tipo_documento: string;
  nombre_tipo_documento: string;
  numero_documento: string;
  cuenta_clase: string;
  nombre_clase: string;
  cuenta_grupo: string;
  nombre_grupo: string;
  cuenta_mayor: string;
  nombre_cuenta_mayor: string;
  cuenta: string;
  nombre_cuenta: string;
  centro_costo: string;
  nombre_centro_costo: string;
  tercero_id: string;
  tercero_nombre: string;
  concepto: string;
  naturaleza: string;
  debitos: number;
  creditos: number;
  movimiento: number;
}

export interface ArchivoContableParseado {
  filas: MovimientoContable[];
  periodos: string[];
}

const texto = (v: unknown): string => String(v ?? "").trim();
const numero = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// "Fecha AMD" viene como YYYYMMDD (numérico o texto) -> 'YYYY-MM-DD'.
function amdAIso(v: unknown): string | null {
  const s = texto(v);
  if (s.length !== 8) return null;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

// Lee un archivo .xlsx (libro auxiliar contable, clasificación PUC/NIIF) y
// devuelve las filas mapeadas por nombre de columna + la lista de periodos
// (YYYYMM) distintos que trae, para saber qué reemplazar al importar.
export function parseArchivoContable(buffer: ArrayBuffer): ArchivoContableParseado {
  const workbook = XLSX.read(buffer, { type: "array" });
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filasCrudas: any[] = XLSX.utils.sheet_to_json(hoja, { defval: "" });

  const periodosSet = new Set<string>();

  const filas: MovimientoContable[] = filasCrudas
    .filter((f) => texto(f["Periodo"]) !== "")
    .map((f) => {
      const periodo = texto(f["Periodo"]);
      periodosSet.add(periodo);

      return {
        anio: numero(f["Año"]),
        periodo,
        fecha: amdAIso(f["Fecha AMD"]),
        tipo_documento: texto(f["Tipo Documento"]),
        nombre_tipo_documento: texto(f["Nombre Tipo de Documento"]),
        numero_documento: texto(f["Numero Documento"]),
        cuenta_clase: texto(f["Cuenta Clase NIIF"]),
        nombre_clase: texto(f["Nombre Cuenta Clase"]),
        cuenta_grupo: texto(f["Cuenta Grupo NIIF"]),
        nombre_grupo: texto(f["Nombre Cuenta Grupo"]),
        cuenta_mayor: texto(f["Cuenta Mayor NIIF"]),
        nombre_cuenta_mayor: texto(f["Nombre Cuenta Mayor"]),
        cuenta: texto(f["Cuenta"]),
        nombre_cuenta: texto(f["Nombre Cuenta"]),
        centro_costo: texto(f["Centro de Costo"]),
        nombre_centro_costo: texto(f["Nombre Centro de Costo"]),
        tercero_id: texto(f["IdTercero"]),
        tercero_nombre: texto(f["Nombre IdTercero"]),
        concepto: texto(f["Concepto"]),
        naturaleza: texto(f["Naturaleza"]),
        debitos: numero(f["Debitos"]),
        creditos: numero(f["Creditos"]),
        movimiento: numero(f["Movimiento"]),
      };
    });

  return { filas, periodos: [...periodosSet].sort() };
}
