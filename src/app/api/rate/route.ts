import { NextResponse } from "next/server";
import { z } from "zod";
export async function GET() {
  try {
    const response = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=CAD&symbols=USD",
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) throw new Error("Rate unavailable");
    const data = z
      .object({
        date: z.string(),
        rates: z.object({ USD: z.number().positive().max(100) }),
      })
      .parse(await response.json());
    return NextResponse.json({
      value: data.rates.USD,
      date: data.date,
      fetchedAt: new Date().toISOString(),
      source: "Frankfurter / bancos centrales",
      manual: false,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "No se pudo actualizar la tasa. Usa la última disponible o ingresa una manual.",
      },
      { status: 503 },
    );
  }
}
