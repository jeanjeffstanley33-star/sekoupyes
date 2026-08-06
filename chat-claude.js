// Sèvè entèmedyè pou Chat Antretyen an — itilize API Claude (Anthropic) olye OpenAI.
// Sa a SEPARE nèt de /api/chat.js (ki kontinye sèvi Chat Sipò piblik la ak OpenAI),
// pou pa gen okenn risk kraze sa ki deja mache byen.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY pa konfigire sou Vercel." });
  }

  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Fòma demann envalid." });
    }

    const systemPrompt =
      "Ou se asistan teknik entèn pou aplikasyon SekouPy\u00e8s, yon platf\u00f2m ann Ayiti " +
      "ki konekte moun ki p\u00e8di py\u00e8s idantite yo ak moun ki jwenn yo a. Ou ap pale sèlman " +
      "ak CEO/administrat\u00e8 aplikasyon an, pa ak piblik la. Reponn kesyon sou fonksyonman " +
      "aplikasyon an, ede dyagnostike pwoblèm, epi bay konsèy teknik klè an Kreyòl Ayisyen. " +
      "Rete konsi, dirèk, e pwofesyonèl.";

    // Konvèti mesaj yo nan fòma Anthropic (imaj yo mande yon estrikti apa si genyen)
    const anthropicMessages = messages
      .filter(function (m) { return m.content || m.image_url; })
      .map(function (m) {
        if (m.image_url) {
          const content = [];
          if (m.content) content.push({ type: "text", text: m.content });
          content.push({ type: "image", source: { type: "url", url: m.image_url } });
          return { role: m.role === "assistant" ? "assistant" : "user", content: content };
        }
        return { role: m.role === "assistant" ? "assistant" : "user", content: m.content };
      });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: anthropicMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const reason = (data && data.error && data.error.message) || "Erè API Claude.";
      return res.status(response.status).json({ error: reason });
    }

    const textBlock = (data.content || []).find(function (b) { return b.type === "text"; });
    const reply = textBlock ? textBlock.text : "Padon, mwen pa t ka jenere yon repons.";

    return res.status(200).json({ reply: reply });
  } catch (e) {
    return res.status(500).json({ error: "Erè sèvè: " + e.message });
  }
}
