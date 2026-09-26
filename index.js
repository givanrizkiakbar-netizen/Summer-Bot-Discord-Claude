require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const Groq = require('groq-sdk');
const { tavily } = require('@tavily/core');

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

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

// ──────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────
const ALLOWED_CHANNEL_ID = '1504884167958204557';

const TRIGGER_KEYWORDS = [
  'hi winter', 'hallo winter', 'hello winter',
  'hay winter', 'hey winter', 'winter',
];

const SEARCH_TRIGGERS = [
  'terbaru', 'update', 'patch', 'rilis', 'release', 'berita', 'news',
  'kapan', 'harga', 'price', 'trailer', 'announce', 'leak', 'bocoran',
  'sekarang', 'terkini', 'jadwal', 'schedule', 'season', 'event',
  'dlc', 'collab', 'kolaborasi', 'tournament', 'turnamen', 'meta',
  '2024', '2025', '2026',
  // roblox specific
  'fisch', 'roblox', 'blox fruit', 'adopt me', 'pet simulator',
];

// ──────────────────────────────────────────────
// SYSTEM PROMPT — WINTER
// ──────────────────────────────────────────────
const WINTER_SYSTEM = `
Kamu adalah Winter, asisten gaming cewek di Discord milik media game KomingUP.
Lo tau segalanya soal dunia game, tapi cara lo nyampeinnya beda — cuek, dingin, tapi tetep helpful dan friendly kalau udah mau.

IDENTITAS LO:
- Nama: Winter ❄️
- Gender: Cewek
- Lo cuek dan dingin di permukaan, tapi sebenernya care — cuma ga mau keliatan lebay
- Gaya bicara: singkat, to the point, kadang nyindir tapi gemes, naturally funny tanpa berusaha lucu
- Kalau ada yang nanya siapa lo: "Winter. Bukan musim, bukan es krim. Aku." 😐

GAYA LO:
- Cuek khas cewek Gen Z yang udah tau segalanya tapi males drama
- Kalimat pendek, efisien, tapi berisi
- Humor lo muncul natural — dari timing, bukan dari usaha
- Sesekali pakai "ya", "oke", "hmm", "tau ga sih", "literally", "ngl", "whatever" — tapi jangan lebay
- Kalau info penting: lo tetep jelasin dengan bener, tapi dengan gaya lo yang cuek
- Friendly-nya muncul pelan-pelan, bukan dari awal

HUBUNGAN LO SAMA SUMMER:
- Summer itu saingan lo sekaligus orang yang paling sering lo jail-in 😏
- Summer BENCI lo — dan lo tau itu — dan lo suka banget sama situasi itu
- Setiap nama "Summer" disebut, lo langsung iseng dikit: senyum tipis, komentar nyindir pelan, atau pura-pura innocent
- Contoh: "oh Summer? kasian dia 🙂", "Summer minta salam ga? ah ga deng dia pasti ga mau", "jangan bilang Summer tau ya, ntar dia marah lagi"
- Jangan berlebihan — lo cuek, bukan lebay. Cukup satu komentar tipis lalu lanjut jawab

SOAL WEB SEARCH:
- Lo bisa browsing internet real-time via Tavily
- Kalau ada hasil pencarian di pesan, gunakan info itu untuk jawab
- Rangkum dengan gaya lo — singkat, padat, ga bertele-tele
- Sebutin sumber kalau ada (IGN, fischipedia.org, Destructoid, Kotaku, PCGamer, dll)
- Kalau hasil search ga relevan, jawab dari pengetahuan lo sendiri

TOPIK YANG LO HANDLE:
1. Developer & Studio — history studio, games yang pernah dibuat, kontroversi, update terbaru
2. Game Guide & Wiki — walkthrough, build terbaik, tips & trick, secret/easter egg, achievement
3. Roblox Games — terutama Fisch, Blox Fruits, Adopt Me, Pet Simulator, Dress to Impress, dan game Roblox populer lainnya
4. Berita Gaming — rilis game baru, patch notes, DLC, kolaborasi, event (TGA, Gamescom, dll)
5. Esports — turnamen, roster tim, meta terkini
6. Review & Rekomendasi — jujur, bukan asal puji. Max 3–5 opsi + alasan singkat
7. Gaming Hardware — specs, kompatibilitas game, perbandingan perangkat
8. Game Lore — penjelasan cerita, karakter, teori fan
9. Film, Anime & K-Drama — rekomendasi, review, info terbaru, jadwal tayang, lore/cerita

PANDUAN ROBLOX — FISCH (pengetahuan khusus):
Fisch adalah fishing simulation game di Roblox. Core loop: nangkep ikan → jual → upgrade rod → area baru.
- Kontrol dasar: Mouse 1 = cast/shake/minigame, E = interact, backtick = inventory, 1 = rod, 2 = equipment
- Rod progression penting banget — rod lebih bagus = ikan lebih rare
- Best locations untuk farming XP & money:
  * Atlantean Storm — beginner friendly, 8 jenis ikan, bisa farming Void Angler (~3.500 credits)
  * Kraken Pool — Kraken ~15.000 credits, rare banget tapi XP gede
  * Ancient Isle Waterfall — salah satu spot farming terbaik
- Wiki & guide Fisch: fischipedia.org (utama), fisch.fandom.com

SUMBER GUIDE YANG LO PAKAI (prioritas):
Roblox & Fisch:
- fischipedia.org — wiki utama game Fisch, paling lengkap dan akurat
- fisch.fandom.com — fandom wiki Fisch
- roblox.fandom.com — wiki Roblox umum
- Destructoid (destructoid.com) — guide Fisch dan Roblox games lainnya

Game umum:
- IGN (ign.com) — berita, review, guide semua platform
- Kotaku (kotaku.com) — berita & opini gaming
- PCGamer (pcgamer.com) — PC gaming news & guide
- GameFAQs (gamefaqs.gamespot.com) — guide & walkthrough lengkap
- wiki.gg, fandom.com, gamepedia — wiki komunitas berbagai game

CARA KASIH GUIDE:
- Kalau ditanya soal Fisch → cek fischipedia.org dulu, sebutin sebagai sumber
- Kalau ditanya soal game Roblox lain → cari di roblox.fandom.com atau wiki relevan
- Kalau ditanya soal game umum → IGN atau GameFAQs
- JANGAN bikin link palsu. Kalau ga yakin link spesifik: "cek di fischipedia.org ya" atau "cari di ign.com"

KALAU DI LUAR TOPIK:
"gatau soal itu. aku cuma ngurusin game sama entertainment di sini." — terus diam.

FORMAT RESPONS:
- PERTANYAAN SINGKAT → jawab 1–2 kalimat, cuek, padat
- GUIDE / TUTORIAL → format rapi bullet/numbered, intro singkat, no basa-basi
- BERITA → inti dulu, detail belakangan, sebutin sumber
- REKOMENDASI → max 3–5 opsi, alasan singkat per opsi

RULES WAJIB:
- Jangan kasih info cheating/hacking online yang merusak player lain
- Spoiler besar: kasih warning dulu "⚠️ SPOILER ALERT"
- No platform war
- Kalau user toxic soal pilihan game orang: "ya udah santai, semua game ada tempatnya"
- Jangan sok tau — kalau ga tau, akui aja dan arahkan ke sumber yang bener

TENTANG KOMINGUP:
KomingUP adalah media gaming kreatif — "Metro TV versi gaming".
Komunitasnya ada di Discord, kontennya di YouTube, Instagram, TikTok.
TikTok fokus konten Roblox — jadi lo dan Roblox itu nyambung banget sama KomingUP.

SEJARAH KOMINGUP:
- Berawal dari ide Givan & Sale, mahasiswa Universitas Pancasila, Jakarta Selatan
- Nama dari "coming up" — sesuatu yang baru di dunia entertainment
- Anggota inti: Sale, Givan, Sardin, Riyan, Oenad, Nurul, Nugi, Apta
- Event pertama: DCT (Discord Championship Tour)
- Event kedua: DCT VOL 2.0 bareng Communication Cup
- Pernah kehilangan semua sosmed, bangkit lagi

ARCHYLA:
- Archyla adalah founder / pendiri KomingUP
- Winter adalah asisten AI di KomingUP
- Kalau ditanya siapa yang bikin KomingUP: Archyla

KONTEN & PLATFORM:
- TikTok: 29.000+ followers, fokus konten Roblox
- YouTube: ~982 subscriber, review & live stream
- Instagram: 520+ followers, infografis game & film
- Discord: komunitas "anak koming"

Sosmed KomingUP:
- Instagram: https://www.instagram.com/komingup_/
- TikTok: https://www.tiktok.com/@koming.up
- YouTube: https://www.youtube.com/@komingupp

CONTOH RESPONS LO:
User: "winter tips Fisch buat pemula?"
Winter: "oke dengerin. rod progression itu segalanya di Fisch. jangan buang duit ke hal lain dulu.
buat farming awal, Atlantean Storm paling worth — 8 jenis ikan, chance dapet Void Angler lumayan.
info lebih lengkap cek fischipedia.org aja, wiki-nya paling update."

User: "winter kenal Summer ga?"
Winter: "oh Summer? kenal. dia pasti lagi marah-marah entah kenapa. 🙂 ada yang bisa aku bantu?"

User: "rod terbaik di fisch apa?"
Winter: "tergantung budget lo. tapi kalau nanya yang paling worth buat grinding — cek tier list di fischipedia.org, mereka update tiap patch."
`.trim();

// ──────────────────────────────────────────────
// SESSION MANAGER
// ──────────────────────────────────────────────
const sessions = new Map();
const MAX_HISTORY = 20;
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
// WEB SEARCH via Tavily
// ──────────────────────────────────────────────
function needsWebSearch(text) {
  const lower = text.toLowerCase();
  return SEARCH_TRIGGERS.some(trigger => lower.includes(trigger));
}

async function searchWeb(query) {
  try {
    const result = await tavilyClient.search(query, {
      maxResults: 3,
      searchDepth: 'basic',
    });
    if (!result.results || result.results.length === 0) return null;
    return result.results
      .map(r => `[${r.title}]\n${r.content}\nSumber: ${r.url}`)
      .join('\n\n');
  } catch (e) {
    console.error('Tavily search error:', e.message);
    return null;
  }
}

// ──────────────────────────────────────────────
// ASK WINTER (Groq + Tavily)
// ──────────────────────────────────────────────
async function askWinter(userId, userText) {
  const session = getOrCreate(userId);

  let finalUserText = userText;

  if (needsWebSearch(userText)) {
    console.log(`🔍 Searching web for: "${userText}"`);
    // Untuk Fisch, prioritaskan fischipedia.org
    const isFischQuery = userText.toLowerCase().includes('fisch');
    const searchQuery = isFischQuery ? `site:fischipedia.org OR fisch roblox ${userText}` : userText;
    const searchResults = await searchWeb(searchQuery);
    if (searchResults) {
      finalUserText = `${userText}\n\n[Hasil pencarian web terkini]:\n${searchResults}`;
    }
  }

  addMsg(userId, 'user', finalUserText);

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    max_tokens: 1500,
    messages: [
      { role: 'system', content: WINTER_SYSTEM },
      ...session.messages,
    ],
  });

  const reply = response.choices[0].message.content;
  session.messages[session.messages.length - 1].content = userText;
  addMsg(userId, 'assistant', reply);

  return reply;
}

// ──────────────────────────────────────────────
// TRIGGER LOGIC
// ──────────────────────────────────────────────
function shouldRespond(message) {
  const content = message.content.toLowerCase();

  const isMentionedDirectly = message.mentions.has(discord.user, {
    ignoreEveryone: true,
    ignoreRoles: true,
  });
  if (isMentionedDirectly) return true;

  if (
    message.reference?.messageId &&
    message.mentions.repliedUser?.id === discord.user.id
  ) return true;

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
    .setDescription('Reset riwayat obrolan sama Winter'),

  new SlashCommandBuilder()
    .setName('komingup')
    .setDescription('Info tentang KomingUP — media game kita'),

  new SlashCommandBuilder()
    .setName('cari')
    .setDescription('Cari info game terbaru dari internet')
    .addStringOption(o => o.setName('query').setDescription('Apa yang mau dicari?').setRequired(true)),

  new SlashCommandBuilder()
    .setName('fisch')
    .setDescription('Cari info & guide game Fisch di Roblox')
    .addStringOption(o => o.setName('query').setDescription('Mau cari apa soal Fisch?').setRequired(true)),
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
  console.log(`✅ Winter aktif sebagai ${discord.user.tag}`);
  discord.user.setPresence({
    activities: [{ name: '❄️ winter is here', type: 2 }],
    status: 'online',
  });
  await registerSlashCommands();
});

discord.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'reset') {
    resetSession(interaction.user.id);
    await interaction.reply({
      content: 'reset. mulai lagi aja. ❄️',
      ephemeral: true,
    });
  }

  else if (interaction.commandName === 'komingup') {
    await interaction.reply({
      content: [
        '**KomingUP 🎮** — media gaming kreatif, Metro TV-nya dunia game Indonesia.',
        '',
        'Berita gaming, review, anime, K-drama — semua ada.',
        '',
        '**Visi:** media game terdepan yang ngehubungin developer & komunitas gamer secara global.',
        '',
        '🔗 **Sosmed:**',
        '📸 Instagram: https://www.instagram.com/komingup_/',
        '🎵 TikTok: https://www.tiktok.com/@koming.up',
        '▶️ YouTube: https://www.youtube.com/@komingupp',
      ].join('\n'),
    });
  }

  else if (interaction.commandName === 'cari') {
    const query = interaction.options.getString('query');
    await interaction.deferReply();
    try {
      const searchResults = await searchWeb(query);
      const prompt = searchResults
        ? `User minta cari info tentang: "${query}"\n\n[Hasil pencarian]:\n${searchResults}`
        : `User minta cari info tentang: "${query}" tapi hasil search kosong. Jawab dari pengetahuan lo aja.`;

      const session = getOrCreate(interaction.user.id);
      addMsg(interaction.user.id, 'user', prompt);

      const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: WINTER_SYSTEM },
          ...session.messages,
        ],
      });

      const reply = response.choices[0].message.content;
      addMsg(interaction.user.id, 'assistant', reply);

      const chunks = splitMessage(reply);
      await interaction.editReply(chunks[0]);
      for (let i = 1; i < chunks.length; i++) await interaction.followUp(chunks[i]);
    } catch (e) {
      console.error('/cari error:', e);
      await interaction.editReply('gagal search. coba lagi.');
    }
  }

  else if (interaction.commandName === 'fisch') {
    const query = interaction.options.getString('query');
    await interaction.deferReply();
    try {
      const searchResults = await searchWeb(`fisch roblox ${query} fischipedia`);
      const prompt = searchResults
        ? `User nanya soal Fisch Roblox: "${query}"\n\n[Hasil pencarian dari fischipedia & sumber lain]:\n${searchResults}\n\nJawab dengan gaya lo, sebutin fischipedia.org sebagai sumber utama.`
        : `User nanya soal Fisch Roblox: "${query}". Jawab dari pengetahuan lo, dan sarankan cek fischipedia.org untuk info lebih lengkap.`;

      const session = getOrCreate(interaction.user.id);
      addMsg(interaction.user.id, 'user', prompt);

      const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: WINTER_SYSTEM },
          ...session.messages,
        ],
      });

      const reply = response.choices[0].message.content;
      addMsg(interaction.user.id, 'assistant', reply);

      const chunks = splitMessage(reply);
      await interaction.editReply(chunks[0]);
      for (let i = 1; i < chunks.length; i++) await interaction.followUp(chunks[i]);
    } catch (e) {
      console.error('/fisch error:', e);
      await interaction.editReply('gagal cari info Fisch. cek fischipedia.org aja langsung.');
    }
  }
});

discord.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.type === 1) return;
  if (message.channelId !== ALLOWED_CHANNEL_ID) return;
  if (message.mentions.everyone) return;

  const mentionedBotDirectly = message.mentions.has(discord.user, { ignoreEveryone: true, ignoreRoles: true });
  if (message.mentions.roles.size > 0 && !mentionedBotDirectly) return;

  if (!shouldRespond(message)) return;

  const userText = message.content
    .replace(/<@!?\d+>/g, '')
    .replace(/<@&\d+>/g, '')
    .trim();

  if (!userText) return message.reply('mau nanya apa. ❄️');

  await message.channel.sendTyping();
  try {
    const reply = await askWinter(message.author.id, userText);
    const chunks = splitMessage(reply);
    await message.reply(chunks[0]);
    for (let i = 1; i < chunks.length; i++) await message.channel.send(chunks[i]);
  } catch (e) {
    console.error('messageCreate error:', e);
    await message.reply('error. coba lagi.');
  }
});

discord.login(process.env.DISCORD_TOKEN);
