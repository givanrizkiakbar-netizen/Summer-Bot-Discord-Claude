const { SlashCommandBuilder } = require('discord.js');
const { askClaude } = require('../claude');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ringkas')
    .setDescription('Ringkas teks panjang menjadi poin-poin penting')
    .addStringOption(opt =>
      opt.setName('teks')
        .setDescription('Teks yang ingin diringkas')
        .setRequired(true)
    ),

  async execute(interaction) {
    const teks = interaction.options.getString('teks');
    await interaction.deferReply();

    const systemPrompt = 'Kamu adalah asisten yang ahli meringkas teks. Ringkas teks yang diberikan menjadi poin-poin penting menggunakan bullet point. Gunakan bahasa yang sama dengan teks input. Tambahkan judul ringkas di atas.';

    try {
      const reply = await askClaude(
        [{ role: 'user', content: `Ringkas teks berikut:\n\n${teks}` }],
        systemPrompt
      );
      await interaction.editReply(reply.slice(0, 1990));
    } catch (error) {
      console.error('/ringkas error:', error);
      await interaction.editReply('❌ Gagal meringkas teks. Coba lagi ya!');
    }
  },
};
