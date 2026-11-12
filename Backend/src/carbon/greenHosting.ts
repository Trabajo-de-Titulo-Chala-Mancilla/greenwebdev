const GREEN_CHECK_URL = "https://api.thegreenwebfoundation.org/api/v3/greencheck/";

/** Consulta The Green Web Foundation. Devuelve null si no se pudo verificar. */
export async function checkGreenHosting(hostname: string): Promise<boolean | null> {
  try {
    const response = await fetch(GREEN_CHECK_URL + encodeURIComponent(hostname), {
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { green?: unknown };
    return typeof body.green === "boolean" ? body.green : null;
  } catch {
    return null;
  }
}
