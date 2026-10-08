export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, instagram, niche, plan } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.GPTIFY_ADMIN_BOT_TOKEN;
  if (!botToken) {
    console.error('Missing TELEGRAM_BOT_TOKEN environment variable in Vercel');
    return res.status(200).json({ ok: false, message: 'Serverless notification pending env token' });
  }

  const adminChatIds = ['327216340', '5077641672'];
  const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
  const cleanInsta = (instagram || '').replace(/^@/, '');

  const tgMessage = 
    `🚀 <b>Yangi AILO Ariza (ailo.gptify.uz)</b>\n\n` +
    `👤 <b>Mijoz:</b> ${name}\n` +
    `📞 <b>Telefon:</b> <a href="tel:${phone}">${phone}</a>\n` +
    `📷 <b>Instagram:</b> <a href="https://instagram.com/${cleanInsta}">@${cleanInsta}</a>\n` +
    `🏢 <b>Soha:</b> ${niche || 'Umumiy'}\n` +
    `⭐ <b>Tarif / Xizmat:</b> ${plan || 'Umumiy'}\n` +
    `⏰ <b>Vaqt:</b> ${now}\n\n` +
    `<i>💡 Shuhratbek, mijozning Instagram profilini ko‘rib chiqib, o‘zingiz bog‘lanishingiz mumkin.</i>`;

  try {
    await Promise.allSettled(adminChatIds.map(chatId =>
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: tgMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        })
      })
    ));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram lead notification error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
