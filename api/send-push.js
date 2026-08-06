// Voye yon notifikasyon push bay tout CEO ki abòne yo.
// Rele fonksyon sa a lè yon nouvo demann peman antre (via Supabase Database Webhook).
const webpush = require("web-push");
const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Sekirite: Supabase Webhook la dwe voye menm sekrè sa a nan header "x-webhook-secret"
  const secret = req.headers["x-webhook-secret"];
  if (!secret || secret !== process.env.PUSH_WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: "VAPID keys pa konfigire." });
  }
  webpush.setVapidDetails("mailto:SekouPyes@gmail.com", vapidPublic, vapidPrivate);

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data: subs } = await supabase.from("push_subscriptions").select("*");

    const record = (req.body && req.body.record) || {};
    const payload = JSON.stringify({
      title: "\uD83D\uDCB0 Nouvo Demann Peman",
      body: (record.method === "moncash" ? "MonCash" : "NatCash") + " \u2014 " + (record.amount || 150) + " HTG. Tape pou verifye.",
      url: "/#ceoAdmin",
    });

    const results = await Promise.allSettled(
      (subs || []).map(function (s) {
        return webpush.sendNotification(s.subscription, payload);
      })
    );

    return res.status(200).json({ sent: results.length });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
