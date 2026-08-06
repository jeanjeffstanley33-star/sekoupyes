// Verifye si kle Claude a konfigire e valid, san l pa konsome twòp kredi.
export default async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ ok: false, reason: "no_key" });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
    if (response.status === 401) return res.status(200).json({ ok: false, reason: "invalid_key" });
    if (response.status === 429) return res.status(200).json({ ok: false, reason: "no_credit_or_rate_limited" });
    if (!response.ok) return res.status(200).json({ ok: false, reason: "http_" + response.status });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: false, reason: "network_error" });
  }
}
