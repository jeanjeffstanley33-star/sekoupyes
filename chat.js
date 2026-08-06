// api/chat.js
// Fonksyon serverless Vercel — jere apèl bay OpenAI a AN SEKIRITE.
// Kle OPENAI_API_KEY a viv sèlman isit la, kòm yon Environment Variable
// nan Vercel Dashboard (Project Settings > Environment Variables).
// Li pa JANM parèt nan kòd navigatè a (index.html), kidonk pèsòn pa ka vòlè l.

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  
  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({
      error:
        "OPENAI_API_KEY pa konfigire sou sèvè a. Ale nan Vercel Dashboard > Project > Settings > Environment Variables pou ajoute l.",
    });
    return;
  }

  try {
    const body = req.body || {};
    const incomingMessages = Array.isArray(body.messages) ? body.messages : [];

    // Limite istwa a pou evite gwo faktè ak abi (dènye 12 mesaj yo sèlman)
    const trimmedHistory = incomingMessages.slice(-12).map(function (m) {
      // Si mesaj la gen yon imaj, konvèti l nan fòma "vision" OpenAI a
      if (m.image_url) {
        const parts = [];
        if (m.content) parts.push({ type: "text", text: m.content });
        parts.push({ type: "image_url", image_url: { url: m.image_url } });
        return { role: m.role, content: parts };
      }
      return { role: m.role, content: m.content };
    });

    const systemPrompt = {
      role: "system",
      content:
        "Ou se asistan sipò vityèl pou SekouPyès, yon platfòm ayisyen ki konekte moun ki pèdi pyès idantite yo (paspò, CIN/NIF, lisans, elatriye) ak moun ki jwenn yo. Reponn TOUJOU an Kreyòl Ayisyen, yon fason kout, klè, e zanmitay. Si moun nan mande enfòmasyon sou kijan pou pibliye/chèche yon pyès, esplike etap yo senpleman. Si ou pa gen repons, envite moun nan kontakte sipò imen an sou WhatsApp (+509 4099-7686) oswa imèl SekouPyes@gmail.com.",
    };

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemPrompt, ...trimmedHistory],
        max_tokens: 400,
        temperature: 0.6,
      }),
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      res.status(openaiResponse.status).json({
        error: (data.error && data.error.message) || "Erè nan men OpenAI.",
      });
      return;
    }

    const reply =
      (data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      "Padon, mwen pa t konprann sa. Ou ka reformile l?";

    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Erè sèvè pandan nou t ap kontakte sèvis chat la." });
  }
};
