const { SlashCommandBuilder } = require('discord.js');
const { askClaude } = require('../claude');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('terjemah')
    .setDescription('Terjemahkan teks ke bahasa lain')
    .addStringOption(opt =>
      opt.setName('teks')
        .setDescription('Teks yang ingin diterjemahkan')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('ke')
        .setDescription('Bahasa tujuan')
        .setRequired(true)
        .addChoices(
          { name: '🇮🇩 Indonesia', value: 'Indonesia' },
          { name: '🇬🇧 Inggris', value: 'Inggris' },
          { name: '🇯🇵 Jepang', value: 'Jepang' },
          { name: '🇰🇷 Korea', value: 'Korea' },
          { name: '🇨🇳 Mandarin', value: 'Mandarin' },
          { name: '🇫🇷 Prancis', value: 'Prancis' },
          { name: '🇩🇪 Jerman', value: 'Jerman' },
          { name: '🇸🇦 Arab', value: 'Arab' },
        )
    ),

  async execute(interaction) {
    const teks = interaction.options.getString('teks');
    const ke = interaction.options.getString('ke');
    await interaction.deferReply();

    const systemPrompt = `Kamu adalah penerjemah profesional. Terjemahkan teks yang diberikan ke bahasa ${ke}. Hanya balas dengan hasil terjemahan, tanpa penjelasan tambahan.`;

    try {
      const reply = await askClaude(
        [{ role: 'user', content: teks }],
        systemPrompt
      );
      await interaction.editReply(`🌐 **Terjemahan ke ${ke}:**\n${reply.slice(0, 1900)}`);
    } catch (error) {
      console.error('/terjemah error:', error);
      await interaction.editReply('❌ Gagal menerjemahkan. Coba lagi ya!');
    }
  },
};
