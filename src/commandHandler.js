const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, 'commands');
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`📦 Command dimuat: /${command.data.name}`);
    }
  }
}

async function registerCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  const commands = files
    .map(f => require(path.join(commandsPath, f)).data?.toJSON())
    .filter(Boolean);

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('🔄 Mendaftarkan slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log(`✅ ${commands.length} slash command berhasil didaftarkan.`);
  } catch (error) {
    console.error('❌ Gagal mendaftarkan commands:', error);
  }
}

module.exports = { loadCommands, registerCommands };
