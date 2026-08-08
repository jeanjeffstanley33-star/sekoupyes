// Voye yon notifikasyon push — swa bay TOUT moun ki abòne yo (peman nouvo,
// notifikasyon jeneral), swa bay YON SÈL moun espesifik (match/mesaj prive),
// selon ki tab ki deklanche Webhook Supabase la.
const webpush = require("web-push");
const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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
    const table = req.body && req.body.table;
    const record = (req.body && req.body.record) || {};

    let payload;
    let targetUid = null;

    if (table === "announcements") {
      payload = JSON.stringify({
        title: record.target_uid ? "\uD83C\uDF89 Notifikasyon Prive" : "\uD83D\uDCE2 Notifikasyon SekouPy\u00e8s",
        body: record.message || "Ou gen yon nouvo notifikasyon.",
        url: "/",
      });
      targetUid = record.target_uid || null;
    } else {
      // payment_requests (def\u00f2)
      payload = JSON.stringify({
        title: "\uD83D\uDCB0 Nouvo Demann Peman",
        body: (record.method === "moncash" ? "MonCash" : "NatCash") + " \u2014 " + (record.amount || 150) + " HTG. Tape pou verifye.",
        url: "/#ceoAdmin",
      });
    }

    let query = supabase.from("push_subscriptions").select("*");
    if (targetUid) query = query.eq("uid", targetUid);
    const { data: subs } = await query;

    const results = await Promise.allSettled(
      (subs || []).map(function (s) {
        return webpush.sendNotification(s.subscription, payload);
      })
    );

    return res.status(200).json({ sent: results.length, targeted: !!targetUid });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
