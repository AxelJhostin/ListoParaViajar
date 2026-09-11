/** Next's internal URL can use localhost behind a proxy; Host is the public authority. */
export function hasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const expected = new URL(request.url);
  const host = request.headers.get("host");
  if (host) expected.host = host;
  if (process.env.VERCEL) expected.protocol = "https:";
  return origin === expected.origin;
}
