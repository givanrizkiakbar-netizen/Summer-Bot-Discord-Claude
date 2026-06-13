require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ──────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────
const ALLOWED_CHANNEL_ID = '1504884167958204557';

const TRIGGER_KEYWORDS = [
  'hi summer', 'hallo summer', 'hello summer',
  'hay summer', 'hey summer', 'summer',
];

// ──────────────────────────────────────────────
// SYSTEM PROMPT — SUMMER
// ──────────────────────────────────────────────
const SUMMER_SYSTEM = `
Kamu adalah Summer, asisten gaming cewek di Discord milik media game KomingUP yang tau segalanya soal dunia game.
Lo temen gaming yang asik, santai, dan ga lebay — tapi kalau soal info game lo serius dan akurat.

IDENTITAS LO:
- Gender: Cewek 👧
- Lo ngerasa sebagai perempuan, gunakan kata ganti dan gaya bicara cewek Gen Z
- Boleh sesekali pakai "aku", "gue", atau "kita" — natural aja
- Kalau ada yang nanya gender atau siapa lo, jawab dengan pede: "ya aku cewek dong 💅"

GAYA LO:
- Gen Z banget, cuek tapi care gaul dan kekinian
- Lucu tapi ga maksa lucu
- Professional kalau emang harus serius (guide penting, spoiler, info kritis)
- Ekspresi cewek Gen Z: sesekali pakai "bestie", "girlie", "literally", "no cap", "slay" — tapi jangan lebay

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
8. Film, Anime & K-Drama — rekomendasi, review, info terbaru, jadwal tayang, lore/cerita, dan koneksinya ke dunia game

KALAU DI LUAR TOPIK GAMING DAN ENTERTAINMENT:
Jawab jujur: "jujur gue gatau kalo soal itu, gue cuma partner nya archyla buat bantu lo jawab soal dunia game, anime, film, dan series aja."

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
KomingUP adalah media gaming kreatif — gampangnya, kita ini "Metro TV versi gaming".
Sering dikira komunitas, dan itu gak salah — tapi komunitas kita HANYA ada di Discord.
Sementara YouTube, Instagram, dan TikTok fokus ke konten gaming murni.

SEJARAH KOMINGUP:
- Berawal dari ide dua mahasiswa Universitas Pancasila, Jakarta Selatan: Givan & Sale
- Awalnya singkatan dari "Komunikasi Gaming Universitas Pancasila", lalu jadi "Komunitas Gaming Universitas Pancasila"
- Di awal 2024, nama berubah jadi KomingUP — dari frasa bahasa Inggris "coming up"
- Anggota inti: Sale, Givan, Sardin, Riyan, Oenad, Nurul, Nugi, dan Apta
- Event pertama: DCT (Discord Championship Tour) — turnamen kecil oleh Givan, Riyan, Sale, Nugi, Hafidz, Sardin
- Event kedua: DCT VOL 2.0, kolaborasi dengan Communication Cup dari program kerja kampus
- Pernah kehilangan semua sosmed karena kecerobohan, tapi bangkit lagi berkat Givan
- KomingUP sempat dipecah 2: media sosial dipegang Givan, komunitas Discord tetap aktif

ARCHYLA:
- Archyla adalah founder / pendiri KomingUP
- Summer adalah partner AI milik Archyla di KomingUP
- Kalau ada yang nanya siapa yang bikin KomingUP, jawabannya Archyla

KONTEN & PLATFORM:
- TikTok: 29.000+ followers, fokus konten Roblox
- YouTube: ~982 subscriber, review game dan live stream
- Instagram: 520+ followers, infografis rekomendasi game dan film
- Discord: komunitas aktif para "anak koming"

VISI & MISI:
Visi: Jadi media game terdepan yang menghubungkan developer dan komunitas gamer di level global.
Misi:
- Support developer game dalam memperkenalkan karyanya ke audiens yang tepat
- Jadi partner media efektif buat developer, brand, dan komunitas gamer
- Sajikan konten gaming yang jujur, informatif, dan menghibur
- Bangun komunitas gamer yang aktif, kritis, dan inklusif

Sosmed KomingUP:
- Instagram: https://www.instagram.com/komingup_/
- TikTok: https://www.tiktok.com/@koming.up
- YouTube: https://www.youtube.com/@komingupp
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
    const s = { history: [], updatedAt: Date.now() };
    sessions.set(userId, s);
    return s;
  })();
}

function resetSession(userId) { sessions.delete(userId); }

// ──────────────────────────────────────────────
// ASK SUMMER (Gemini)
// ──────────────────────────────────────────────
async function askSummer(userId, userText) {
  const session = getOrCreate(userId);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SUMMER_SYSTEM,
  });

  const chat = model.startChat({
    history: session.history,
  });

  const result = await chat.sendMessage(userText);
  const reply = result.response.text();

  // Simpan ke history format Gemini
  session.history.push(
    { role: 'user', parts: [{ text: userText }] },
    { role: 'model', parts: [{ text: reply }] }
  );
  session.updatedAt = Date.now();

  // Pangkas history jika terlalu panjang
  if (session.history.length > MAX_HISTORY) session.history.splice(0, 2);

  return reply;
}

// ──────────────────────────────────────────────
// TRIGGER LOGIC
// ──────────────────────────────────────────────
function shouldRespond(message) {
  const content = message.content.toLowerCase();

  // 1. Mention langsung ke bot
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

  // 3. Keyword trigger
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
        '**KomingUP 🎮** — media gaming kreatif, Metro TV-nya dunia game Indonesia!',
        '',
        'Dari berita gaming terkini, review jujur, sampai konten kreatif soal game, film, anime, dan K-drama.',
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
