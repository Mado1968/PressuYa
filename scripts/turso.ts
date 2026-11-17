// npm run turso -- --confirmar
//
// Carga la base de producción (Turso) con los datos de tu base local: vacía
// Turso, le aplica el esquema y copia tabla a tabla, en lotes, lo que hay en
// DATABASE_URL (el fichero de data/demo.db, ya sembrado y cuadrado). Al final
// compara las filas de cada tabla a los dos lados.
//
// Se copia en lugar de sembrar en remoto porque el seed son miles de
// inserciones: una a una contra Turso serían minutos; en lotes, segundos.
//
// Usa TURSO_DATABASE_URL y TURSO_AUTH_TOKEN de .env.local. La app no las lee:
// en Vercel, la base se configura con DATABASE_URL y DATABASE_AUTH_TOKEN.
import { createClient, type InStatement } from "@libsql/client";
import { aplicarEsquema, cargarEnv, vaciar } from "../src/db/herramientas";

/** En el orden en que se pueden insertar sin romper ninguna clave ajena. */
const TABLAS = [
  "negocio",
  "partida",
  "cliente",
  "solicitud",
  "presupuesto",
  "linea",
  "evento_lectura",
  "tarea_programada",
  "evento",
  "plantilla",
  "aviso",
  "pulso",
  "peticion_web",
];

const POR_LOTE = 200;

async function main() {
  cargarEnv();
  const origenUrl = process.env.DATABASE_URL || "file:./data/demo.db";
  const destinoUrl = process.env.TURSO_DATABASE_URL;
  const destinoToken = process.env.TURSO_AUTH_TOKEN;

  if (!destinoUrl || !destinoToken) {
    console.error("❌ Falten TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en .env.local.");
    process.exit(1);
  }
  if (!origenUrl.startsWith("file:")) {
    console.error("❌ DATABASE_URL ha de ser la teva base local (file:…): es la que es copia a Turso.");
    process.exit(1);
  }
  if (!process.argv.includes("--confirmar")) {
    console.log("Això ESBORRA la base de producció a Turso i la sustitueix per la teva base local:");
    console.log(`  origen:  ${origenUrl}`);
    console.log(`  desti: ${destinoUrl}`);
    console.log("\nSi es el que vols: npm run turso -- --confirmar");
    process.exit(1);
  }

  const t0 = Date.now();
  const borradas = await vaciar(destinoUrl, destinoToken);
  console.log(`· Turso buidada (${borradas} taules)`);

  aplicarEsquema(destinoUrl, destinoToken);
  console.log("· esquema aplicat a Turso");

  const origen = createClient({ url: origenUrl });
  const destino = createClient({ url: destinoUrl, authToken: destinoToken });
  let fallos = 0;

  for (const tabla of TABLAS) {
    const { rows, columns } = await origen.execute(`select * from "${tabla}"`);
    const lista = columns.map((c) => `"${c}"`).join(", ");
    const huecos = columns.map(() => "?").join(", ");
    const sentencias: InStatement[] = rows.map((fila) => ({
      sql: `insert into "${tabla}" (${lista}) values (${huecos})`,
      args: columns.map((c) => fila[c] ?? null),
    }));
    for (let i = 0; i < sentencias.length; i += POR_LOTE) {
      await destino.batch(sentencias.slice(i, i + POR_LOTE), "write");
    }

    const copiadas = Number((await destino.execute(`select count(*) n from "${tabla}"`)).rows[0]!.n);
    const cuadra = copiadas === rows.length;
    if (!cuadra) fallos++;
    console.log(`  ${cuadra ? "✓" : "✗"} ${tabla.padEnd(17)} ${String(copiadas).padStart(4)} filas`);
  }

  origen.close();
  destino.close();

  if (fallos) {
    console.error(`\n❌ ${fallos} taule(s) no quadren entre la teva base local y Turso.`);
    process.exit(1);
  }
  console.log(`\n✅ Turso te exactament el mateix que la teva base local (${((Date.now() - t0) / 1000).toFixed(1)} s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
