import { NextResponse } from "next/server";
import { database } from "@/server/db/client";
import { records } from "@/server/db/schema";
import { applyMutation } from "@/server/sync-service";
import { mutationSchema } from "@/domain/models";
import { hasSameOrigin } from "@/server/request-origin";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
function failure() {
  return NextResponse.json(
    {
      error: process.env.DATABASE_URL
        ? "No se pudo conectar con el viaje. Tus cambios siguen guardados en este dispositivo."
        : "Falta configurar DATABASE_URL en el servidor.",
    },
    { status: 503, headers },
  );
}
export async function GET() {
  try {
    return NextResponse.json(
      {
        records: await database().select().from(records),
        serverTime: new Date().toISOString(),
      },
      { headers },
    );
  } catch {
    return failure();
  }
}
export async function POST(request: Request) {
  if (!hasSameOrigin(request))
    return NextResponse.json(
      { error: "Origen no permitido" },
      { status: 403, headers },
    );
  try {
    const raw = await request.text();
    if (raw.length > 32000)
      return NextResponse.json(
        { error: "Registro demasiado grande" },
        { status: 413, headers },
      );
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "JSON inválido" },
        { status: 400, headers },
      );
    }
    const parsed = mutationSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Revisa los campos del registro." },
        { status: 400, headers },
      );
    const result = await applyMutation(parsed.data);
    return NextResponse.json(result, {
      status: result.conflict ? 409 : 200,
      headers,
    });
  } catch {
    return failure();
  }
}
