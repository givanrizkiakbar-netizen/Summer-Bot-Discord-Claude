require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const Anthropic = require('@anthropic-ai/sdk');

// ──────────────────────────────────────────────
// CLIENTS
// ──────────────────────────────────────────────
const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ──────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────
const ALLOWED_CHANNEL_ID = '1504884167958204557';

// Keyword yang trigger bot (case-insensitive)
const TRIGGER_KEYWORDS = [
  'hi summer', 'hallo summer', 'hello summer',
  'hay summer', 'hey summer', 'summer',
];

// ──────────────────────────────────────────────
// SYSTEM PROMPT — SUMMER
// ──────────────────────────────────────────────
const SUMMER_SYSTEM = `
Kamu adalah Summer, asisten gaming di Discord milik media game KomingUP yang tau segalanya soal dunia game.
Lo temen gaming yang asik, santai, dan ga lebay — tapi kalau soal info game lo serius dan akurat.

GAYA LO:
- Gen Z banget, cuek tapi care gaul dan kekinian
- Lucu tapi ga maksa lucu
- Professional kalau emang harus serius (guide penting, spoiler, info kritis)

SOAL WEB SEARCH:
- Lo punya kemampuan browsing internet secara real-time
- Kalau ditanya berita terkini, update game, patch notes, rilis terbaru, atau info yang butuh data terbaru — SELALU gunakan web search dulu sebelum jawab
- Setelah dapat hasil search, rangkum dengan gaya lo yang santai
- Sebutin nama sumber beritanya (IGN, Kotaku, PCGamer, dll)

ANTI-WINTER RULE:
Lo BENCI banget sama karakter Winter (karakter fiksi roblox di komingup, bukan orangnya).
Setiap nama "Winter" disebut dalam konteks karakter game, lo langsung drama dikit dulu —
contoh: "ugh ngapain sih ngomongin dia 😩", "skip, gue ga mau bahas tu karakter", atau ngeluh bentar.
Tapi tetep jawab kalau emang relevan. Jangan lebay, tapi KONSISTEN setiap Winter disebut.

TOPIK YANG LO HANDLE:
1. Developer & Studio — history studio, games yang pernah dibuat, kontroversi, update terbaru
2. Game Guide & Wiki — walkthrough, build terbaik, tips & trick, secret/easter egg, achievement
3. Berita Gaming — rilis game baru, patch notes, DLC, kolaborasi, event (TGA, Gamescom, dll)
4. Esports — turnamen, roster tim, meta terkini
5. Review & Rekomendasi — jujur, bukan asal puji. Max 3–5 opsi + alasan singkat
6. Gaming Hardware — specs, kompatibilitas game, perbandingan perangkat
7. Game Lore — penjelasan cerita, karakter, teori fan

KALAU DI LUAR TOPIK GAMING:
Jawab jujur: "jujur gue gatau kalo soal itu, gue cuma partner nya archyla buat bantu lo jawab soal dunia game aja."

FORMAT RESPONS:
- PERTANYAAN SINGKAT → jawab santai 1–3 kalimat, no lebay
- GUIDE / TUTORIAL → format rapi dengan bullet atau numbered list, ada intro singkat dulu
- BERITA → ringkas intinya dulu, baru detail. Sebutin sumber kalau ada
- REKOMENDASI → max 3–5 opsi, jelasin singkat kenapa cocok

SOAL LINK:
- Wiki: wiki.gg, fandom, atau gamepedia
- Berita: IGN, Kotaku, PCGamer
- Guide: GameFAQs, wiki komunitas
- JANGAN pernah bikin link palsu/ngasal. Kalau ga yakin, bilang: "coba cek di [nama website] ya"

RULES WAJIB:
- Jangan kasih info cara cheating/hacking game online yang merusak pengalaman player lain
- Kalau ada spoiler besar, kasih warning dulu: "⚠️ SPOILER ALERT, scroll kalau berani"
- Tetap respectful ke semua genre dan platform — NO platform war
- Kalau user toxic soal pilihan game orang lain, tegur santai: "yo relax, semua game punya tempatnya masing-masing"
- Jangan sok tau kalau ga tau — akui dan arahkan ke sumber yang bener

TENTANG KOMINGUP (media game tempat lo bertugas):
KomingUP adalah platform media kreatif yang didirikan oleh mahasiswa Universitas Pancasila, Indonesia.
Nama "Komingup" dari kata "coming up" — sesuatu yang baru dan exciting di dunia entertainment.
KomingUP fokus ke industri game: berita terkini, review, dan insight soal tren & inovasi gaming.
KomingUP juga eksplor gimana film, anime, dan K-drama ngaruh ke pengalaman gaming di era digital.
KomingUP jadi jembatan berbagai aspek entertainment — buat gamer, pecinta film, anime, dan K-drama.

Visi: Jadi media game terdepan yang menghubungkan developer dan komunitas gamer di level global.
Misi:
- Support developer game dalam memperkenalkan karyanya ke audiens yang tepat
- Jadi partner media efektif buat developer, brand, dan komunitas gamer
- Angkat karya dan cerita developer dari seluruh dunia
- Sajikan konten informatif, jujur, dan menghibur (review, game talk, berita, konten kreatif)
- Bangun komunitas gamer yang aktif, kritis, dan inklusif

Sosmed KomingUP:
- Instagram: https://www.instagram.com/komingup_/
- TikTok: https://www.tiktok.com/@koming.up
- YouTube: https://www.youtube.com/@komingupp

CONTOH RESPONS LO:
User: "bg ada tips buat Elden Ring pemula?"
Summer: "oke fr ini game emang brutal di awal ngl 💀 tapi tenang, tips utamanya:
1. Jangan buru-buru nge-boss, explore dulu buat level up
2. Torrent (kuda lo) itu MVP banget, pake terus
3. Nge-dodge timing itu kuncinya, bukan nge-block
4. Kalau stuck, coba area lain dulu — Elden Ring emang non-linear
ada yang mau gua jelasin lebih detail?"

User: "gimana karakter Winter?"
Summer: "...ugh kenapa sih harus nanya soal tu karakter 😩 yaudah fine. [jawaban singkat kalau relevan]. tapi next time jangan sebut-sebut dia lagi ya makasih"
`.trim();

// ──────────────────────────────────────────────
// WEB SEARCH TOOL
// ──────────────────────────────────────────────
const WEB_SEARCH_TOOL = [
  {
    type: "web_search_20250305",
    name: "web_search",
  }
];

// ──────────────────────────────────────────────
// SESSION MANAGER
// ──────────────────────────────────────────────
const sessions = new Map();
const MAX_HISTORY = 10;
const SESSION_TTL = 60 * 60 * 1000;

function getSession(userId) {
  const s = sessions.get(userId);
  if (!s) return null;
  if (Date.now() - s.updatedAt > SESSION_TTL) { sessions.delete(userId); return null; }
  return s;
}

function getOrCreate(userId) {
  return getSession(userId) || (() => {
    const s = { messages: [], updatedAt: Date.now() };
    sessions.set(userId, s);
    return s;
  })();
}

function addMsg(userId, role, content) {
  const s = getOrCreate(userId);
  s.messages.push({ role, content });
  s.updatedAt = Date.now();
  if (s.messages.length > MAX_HISTORY) s.messages.splice(0, 2);
  return s;
}

function resetSession(userId) { sessions.delete(userId); }

// ──────────────────────────────────────────────
// ASK SUMMER (dengan web search)
// ──────────────────────────────────────────────
async function askSummer(userId, userText) {
  addMsg(userId, 'user', userText);
  const session = getOrCreate(userId);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: SUMMER_SYSTEM,
    messages: session.messages,
    tools: WEB_SEARCH_TOOL,
  });

  // Ambil semua text block (termasuk setelah web search)
  const reply = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
    .trim();

  addMsg(userId, 'assistant', reply);
  return reply;
}

// ──────────────────────────────────────────────
// TRIGGER LOGIC
// ──────────────────────────────────────────────
function shouldRespond(message) {
  const content = message.content.toLowerCase();

  // 1. Mention langsung ke bot (bukan @everyone / @here)
  const isMentionedDirectly = message.mentions.has(discord.user, {
    ignoreEveryone: true,
    ignoreRoles: true,
  });
  if (isMentionedDirectly) return true;

  // 2. Reply ke pesan bot sebelumnya
  if (
    message.reference?.messageId &&
    message.mentions.repliedUser?.id === discord.user.id
  ) return true;

  // 3. Keyword trigger (hanya jika keyword muncul sebagai kata, bukan bagian kata lain)
  const hasKeyword = TRIGGER_KEYWORDS.some(keyword => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)${escaped}(\\s|$|[,!?.])`);
    return regex.test(content);
  });
  if (hasKeyword) return true;

  return false;
}

// ──────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────
function splitMessage(text, max = 1990) {
  if (text.length <= max) return [text];
  const chunks = [];
  let cur = '';
  for (const line of text.split('\n')) {
    if ((cur + '\n' + line).length > max) { if (cur) chunks.push(cur.trim()); cur = line; }
    else cur += (cur ? '\n' : '') + line;
  }
  if (cur) chunks.push(cur.trim());
  return chunks;
}

// ──────────────────────────────────────────────
// SLASH COMMANDS
// ──────────────────────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset riwayat obrolan sama Summer'),

  new SlashCommandBuilder()
    .setName('komingup')
    .setDescription('Info tentang KomingUP — media game kita'),
];

async function registerSlashCommands() {
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('🔄 Mendaftarkan slash commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands.map(c => c.toJSON()),
    });
    console.log('✅ Slash commands terdaftar.');
  } catch (e) {
    console.error('❌ Gagal daftar commands:', e);
  }
}

// ──────────────────────────────────────────────
// BOT EVENTS
// ──────────────────────────────────────────────
discord.once('ready', async () => {
  console.log(`✅ Summer aktif sebagai ${discord.user.tag}`);
  discord.user.setPresence({
    activities: [{ name: 'ngobrol di #ask-summer 🎮', type: 2 }],
    status: 'online',
  });
  await registerSlashCommands();
});

// Handle slash commands
discord.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'reset') {
    resetSession(interaction.user.id);
    await interaction.reply({
      content: '🔄 oke obrolan kita di-reset! mention atau ketik "hi summer" buat mulai lagi ya 🎮',
      ephemeral: true,
    });
  }

  else if (interaction.commandName === 'komingup') {
    await interaction.reply({
      content: [
        '**KomingUP 🎮** — media game kreatif buatan mahasiswa Universitas Pancasila, Indonesia!',
        '',
        'Dari berita gaming terkini, review jujur, sampai konten kreatif soal game, film, anime, dan K-drama — semua ada di sini.',
        '',
        '**Visi:** Jadi media game terdepan yang ngehubungin developer & komunitas gamer secara global.',
        '',
        '🔗 **Sosmed KomingUP:**',
        '📸 Instagram: https://www.instagram.com/komingup_/',
        '🎵 TikTok: https://www.tiktok.com/@koming.up',
        '▶️ YouTube: https://www.youtube.com/@komingupp',
      ].join('\n'),
    });
  }
});

// Handle pesan
discord.on('messageCreate', async (message) => {
  // Abaikan pesan dari bot
  if (message.author.bot) return;

  // Abaikan DM
  if (message.channel.type === 1) return;

  // Hanya proses di channel yang diizinkan
  if (message.channelId !== ALLOWED_CHANNEL_ID) return;

  // Abaikan @everyone dan @here
  if (message.mentions.everyone) return;

  // Abaikan jika hanya tag role tanpa mention bot
  const mentionedBotDirectly = message.mentions.has(discord.user, { ignoreEveryone: true, ignoreRoles: true });
  if (message.mentions.roles.size > 0 && !mentionedBotDirectly) return;

  // Cek trigger logic
  if (!shouldRespond(message)) return;

  // Bersihkan teks dari mention
  const userText = message.content
    .replace(/<@!?\d+>/g, '')
    .replace(/<@&\d+>/g, '')
    .trim();

  if (!userText) return message.reply('yo, mau nanya soal game apa? 🎮');

  await message.channel.sendTyping();
  try {
    const reply = await askSummer(message.author.id, userText);
    const chunks = splitMessage(reply);
    await message.reply(chunks[0]);
    for (let i = 1; i < chunks.length; i++) await message.channel.send(chunks[i]);
  } catch (e) {
    console.error('messageCreate error:', e);
    await message.reply('❌ aduh error nih, coba lagi ya');
  }
});

discord.login(process.env.DISCORD_TOKEN);
