const { SlashCommandBuilder } = require('discord.js');
const { setSystemPrompt, resetSession } = require('../sessionManager');

const PRESETS = {
  default: null,
  guru: 'Kamu adalah guru yang sabar dan menerangkan segala sesuatu dengan cara yang mudah dipahami, menggunakan analogi dan contoh nyata. Selalu dorong rasa penasaran pengguna.',
  programmer: 'Kamu adalah senior software engineer berpengalaman. Jawab pertanyaan teknis dengan presisi, berikan contoh kode yang bersih dan best practices. Gunakan terminologi teknis yang tepat.',
  kreatif: 'Kamu adalah partner kreatif yang penuh semangat dan ide-ide segar. Bantu pengguna brainstorm, menulis, dan mengeksplorasi ide-ide kreatif dengan antusias.',
  formal: 'Kamu adalah asisten profesional yang sopan dan formal. Gunakan bahasa Indonesia baku dan hindari bahasa kasual atau slang.',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('persona')
    .setDescription('Ganti gaya percakapan Claude')
    .addStringOption(opt =>
      opt.setName('gaya')
        .setDescription('Pilih persona Claude')
        .setRequired(true)
        .addChoices(
          { name: '🤖 Default', value: 'default' },
          { name: '📚 Guru (penjelasan mudah)', value: 'guru' },
          { name: '💻 Programmer (teknis)', value: 'programmer' },
          { name: '🎨 Kreatif (ide & menulis)', value: 'kreatif' },
          { name: '👔 Formal (bahasa baku)', value: 'formal' },
        )
    ),

  async execute(interaction) {
    const gaya = interaction.options.getString('gaya');
    const systemPrompt = PRESETS[gaya];
    const userId = interaction.user.id;

    resetSession(userId); // Reset history saat ganti persona
    if (systemPrompt) setSystemPrompt(userId, systemPrompt);

    const labels = { default: '🤖 Default', guru: '📚 Guru', programmer: '💻 Programmer', kreatif: '🎨 Kreatif', formal: '👔 Formal' };
    await interaction.reply({
      content: `✅ Persona diubah ke **${labels[gaya]}**! Riwayat percakapan juga direset.`,
      ephemeral: true,
    });
  },
};
