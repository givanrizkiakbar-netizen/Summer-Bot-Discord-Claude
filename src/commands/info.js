const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getStats } = require('../sessionManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Tampilkan informasi tentang bot ini'),

  async execute(interaction) {
    const stats = getStats();
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🤖 Claude Discord Bot')
      .setDescription('Bot AI bertenaga Claude dari Anthropic')
      .addFields(
        { name: '🧠 Model AI', value: 'Claude Sonnet 4', inline: true },
        { name: '📡 Status', value: '🟢 Online', inline: true },
        { name: '⏱️ Uptime', value: `${h}j ${m}m ${s}d`, inline: true },
        { name: '💬 Sesi Aktif', value: `${stats.activeSessions} user`, inline: true },
        {
          name: '📋 Slash Commands',
          value: [
            '`/tanya` — Tanya Claude AI (dengan memori)',
            '`/reset` — Hapus riwayat percakapan',
            '`/persona` — Ubah gaya Claude',
            '`/ringkas` — Ringkas teks panjang',
            '`/terjemah` — Terjemahkan teks',
            '`/info` — Info bot ini',
          ].join('\n')
        },
        {
          name: '💡 Tips',
          value: 'Kamu juga bisa **mention** bot ini atau DM langsung untuk ngobrol bebas!'
        }
      )
      .setFooter({ text: 'Powered by Anthropic Claude API' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
