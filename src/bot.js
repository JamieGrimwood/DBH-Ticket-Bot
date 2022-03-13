const {
	Client,
	Intents,
	Collection,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} = require('discord.js');
const fs = require('fs');
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		// Intents.FLAGS.GUILD_INTEGRATIONS,
		// Intents.FLAGS.GUILD_WEBHOOKS,
		Intents.FLAGS.GUILD_INVITES,
		Intents.FLAGS.GUILD_VOICE_STATES,
		// Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MESSAGE_TYPING,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGE_TYPING,
	],
});
const { Manager } = require('erela.js');
const Spotify = require('erela.js-spotify');

const config = require('./config/config.json');

const log = require('./utils/logger.js');
const db = require('./utils/database');

const path = require('path');

const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, '/web')));

app.listen(config.web.port, () => {
	log.web(`Website started on port ${config.web.port}`);
});

// Connect to the DB

db.connect();

const clientID = config.spotifyID;
const clientSecret = config.spotifySecret;

client.commands = new Collection();

client.config = config;

const functions = fs
	.readdirSync('./src/functions')
	.filter((file) => file.endsWith('.js'));
const eventFiles = fs
	.readdirSync('./src/events')
	.filter((file) => file.endsWith('.js'));
const commandFolders = fs.readdirSync('./src/slash-commands');

(async () => {
	for (file of functions) {
		require(`./functions/${file}`)(client);
	}
	client.handleEvents(eventFiles, './src/events');
	client.handleCommands(commandFolders, './src/slash-commands');
	client.login(config.token).then(() => {
		client.user.setStatus('dnd');
		client.user.setPresence({ activities: [{ name: 'Starting the bot...' }] });
	});
})();

process.on('SIGINT', () => {
	log.discord('Shutting down the bot...');
	client.destroy();
	process.exit();
});
