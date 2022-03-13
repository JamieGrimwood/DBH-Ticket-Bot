const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const log = require('../utils/logger');
const config = require('../config/config.json');

const guildId = config.guildID; // Make this "null" when all the commands have been added.

module.exports = (client) => {
	client.handleCommands = async (commandFolder, path) => {
		client.commandArray = [];
		for (folder of commandFolder) {
			const commandFiles = fs
				.readdirSync(`${path}/${folder}`)
				.filter((file) => file.endsWith('.js'));
			for (const file of commandFiles) {
				const command = require(`../slash-commands/${folder}/${file}`);
				// Set a new item in the Collection
				// With the key as the command name and the value as the exported module
				client.commands.set(command.data.name, command);
				client.commandArray.push(command.data.toJSON());
			}
		}

		if (guildId) {
			// Define "guildID" as "null", when we aren't in production.
			const rest = new REST({
				version: '9',
			}).setToken(client.config.token);

			(async () => {
				try {
					log.discord('Started refreshing application (/) commands.');

					await rest.put(
						Routes.applicationGuildCommands(config.clientID, guildId),
						{
							body: client.commandArray,
						},
					);

					log.success('Successfully reloaded application (/) commands.');
				}
				catch (error) {
					log.error(error);
				}
			})();
		}
	};
};
