const { SlashCommandBuilder } = require('discord.js');
const { askClaude, DEFAULT_SYSTEM } = require('../claude');
const { addMessage, getOrCreateSession } = require('../sessionManager');

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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tanya')
    .setDescription('Tanya sesuatu ke Claude AI')
    .addStringOption(opt =>
      opt.setName('pertanyaan')
        .setDescription('Apa yang ingin kamu tanyakan?')
        .setRequired(true)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('pertanyaan');
    await interaction.deferReply();

    const userId = interaction.user.id;
    const session = getOrCreateSession(userId);
    addMessage(userId, 'user', question);

    try {
      const systemPrompt = session.systemPrompt || DEFAULT_SYSTEM;
      const reply = await askClaude(session.messages, systemPrompt);
      addMessage(userId, 'assistant', reply);

      const chunks = splitMessage(reply);
      await interaction.editReply(chunks[0]);
      for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp(chunks[i]);
      }
    } catch (error) {
      console.error('/tanya error:', error);
      await interaction.editReply('❌ Terjadi kesalahan saat menghubungi Claude. Coba lagi ya!');
    }
  },
};
