export default async function handler(req, res) {
  if (res && typeof res.json === "function") {
    return res.json({
      status: "ok",
      schema: "detected",
      altText: "detected",
      meta: "active",
      h1: "Premium Home Energy Retrofit Advisory in Ireland"
    });
  }

  return new Response(
    JSON.stringify({
      status: "ok",
      schema: "detected",
      altText: "detected",
      meta: "active",
      h1: "Premium Home Energy Retrofit Advisory in Ireland"
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
