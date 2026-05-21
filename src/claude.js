const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEFAULT_SYSTEM = `Kamu adalah asisten AI yang ramah, cerdas, dan membantu di Discord.
Nama panggilanmu adalah "Claude". Kamu menjawab dalam bahasa yang sama dengan pengguna.
Jika pengguna berbahasa Indonesia, jawab dengan Bahasa Indonesia yang natural dan santai.
Jika ada pertanyaan teknis, berikan jawaban yang jelas dan terstruktur.
Gunakan emoji secukupnya untuk membuat percakapan lebih hidup.`;

/**
 * Kirim pesan ke Claude dan dapatkan balasan
 * @param {Array} history - Riwayat percakapan [{role, content}]
 * @param {string} systemPrompt - System prompt kustom (opsional)
 * @returns {string} - Teks balasan dari Claude
 */
async function askClaude(history, systemPrompt = DEFAULT_SYSTEM) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: systemPrompt,
    messages: history,
  });
  return response.content[0].text;
}

module.exports = { askClaude, DEFAULT_SYSTEM };
