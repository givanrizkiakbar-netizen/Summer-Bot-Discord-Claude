const { SlashCommandBuilder } = require('discord.js');
const { resetSession } = require('../sessionManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Hapus riwayat percakapan denganku dan mulai dari awal'),

  async execute(interaction) {
    resetSession(interaction.user.id);
    await interaction.reply({
      content: '🔄 Riwayat percakapan kamu sudah dihapus! Kita mulai dari awal ya.',
      ephemeral: true,
    });
  },
};
