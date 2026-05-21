const { askClaude, DEFAULT_SYSTEM } = require('./claude');
const { addMessage, getOrCreateSession } = require('./sessionManager');

/**
 * Pecah teks panjang menjadi beberapa chunk ≤ 2000 karakter
 */
function splitMessage(text, maxLength = 1990) {
  if (text.length <= maxLength) return [text];
  const chunks = [];
  let current = '';
  for (const line of text.split('\n')) {
    if ((current + '\n' + line).length > maxLength) {
      if (current) chunks.push(current.trim());
      current = line;
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

async function handleMessage(message) {
  if (message.author.bot) return;

  const isMentioned = message.mentions.has(message.client.user);
  const isDM = message.channel.type === 1;

  if (!isMentioned && !isDM) return;

  // Bersihkan mention dari teks
  const userText = message.content
    .replace(/<@!?\d+>/g, '')
    .trim();

  if (!userText) {
    return message.reply('👋 Halo! Ada yang bisa aku bantu? Ketik pertanyaan atau perintahmu.');
  }

  await message.channel.sendTyping();

  const userId = message.author.id;
  const session = getOrCreateSession(userId);
  addMessage(userId, 'user', userText);

  try {
    const systemPrompt = session.systemPrompt || DEFAULT_SYSTEM;
    const reply = await askClaude(session.messages, systemPrompt);
    addMessage(userId, 'assistant', reply);

    const chunks = splitMessage(reply);
    await message.reply(chunks[0]);
    for (let i = 1; i < chunks.length; i++) {
      await message.channel.send(chunks[i]);
    }
  } catch (error) {
    console.error('handleMessage error:', error);
    await message.reply('❌ Maaf, terjadi kesalahan. Coba lagi ya!');
  }
}

module.exports = { handleMessage };
