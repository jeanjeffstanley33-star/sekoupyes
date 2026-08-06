// api/chat-health.js
// Verifye si OPENAI_API_KEY konfigire e valid, pou nou ka montre yon
// pwen vèt/wouj bò kote ikon chat la nan aplikasyon an.

module.exports = async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    res.status(200).json({ ok: false, reason: "no_key" });
    return;
  }

  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
      },
    });

    if (r.status === 401) {
      res.status(200).json({ ok: false, reason: "invalid_key" });
      return;
    }
    if (r.status === 429) {
      res.status(200).json({ ok: false, reason: "no_credit_or_rate_limited" });
      return;
    }
    if (!r.ok) {
      res.status(200).json({ ok: false, reason: "unknown_error_" + r.status });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false, reason: "network_error" });
  }
};
