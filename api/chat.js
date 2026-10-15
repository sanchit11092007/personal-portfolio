/** Server-side Gemini proxy. Configure GEMINI_API_KEY in the deployment environment. */
const MAX_TURNS = 12;
const MAX_MESSAGE_LENGTH = 2_000;

function normaliseContents(contents) {
  if (!Array.isArray(contents)) return [];
  return contents.slice(-MAX_TURNS).flatMap((turn) => {
    const role = turn?.role === "model" ? "model" : turn?.role === "user" ? "user" : null;
    const text = typeof turn?.parts?.[0]?.text === "string" ? turn.parts[0].text.trim().slice(0, MAX_MESSAGE_LENGTH) : "";
    return role && text ? [{ role, parts: [{ text }] }] : [];
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "The assistant is not configured yet." });
  const contents = normaliseContents(req.body?.contents);
  if (!contents.length || contents.at(-1).role !== "user") return res.status(400).json({ error: "Send a valid message to the assistant." });
  const instruction = req.body?.systemInstruction?.parts?.[0]?.text;
  if (typeof instruction !== "string" || instruction.length > 50_000) return res.status(400).json({ error: "Invalid assistant context." });
  try {
    const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: instruction }] }, generationConfig: { temperature: 0.45, maxOutputTokens: 750 } })
    });
    if (!geminiResponse.ok || !geminiResponse.body) {
      const detail = await geminiResponse.json().catch(() => ({}));
      return res.status(geminiResponse.status || 502).json({ error: detail?.error?.message || "Gemini could not complete this request." });
    }
    res.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" });
    const reader = geminiResponse.body.getReader();
    while (true) { const { done, value } = await reader.read(); if (done) break; res.write(value); }
    res.end();
  } catch (error) {
    console.error("Gemini proxy error", error);
    if (!res.headersSent) return res.status(500).json({ error: "The assistant encountered a server error." });
    res.end();
  }
}
