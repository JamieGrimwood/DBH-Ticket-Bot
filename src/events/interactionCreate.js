const config = require('../config/config.json');
const ticketFunctions = require('../command_functions/tickets');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const Discord = require('discord.js');
const { MongoClient } = require('mongodb');
const client2 = new MongoClient(config.db.connectionString);
const db2 = client2.db('dbh-ticket-bot');
const collection = db2.collection('tickets');
const log = require('../utils/logger');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.isButton()) {
			if (interaction.customId === 'yes') {
				ticketFunctions.close(interaction, client);
			}
			else if (interaction.customId === 'no') {
				const channel = client.channels.cache.get(interaction.channelId);
				channel.messages
					.fetch(interaction.message.id)
					.then((msg) => msg.delete());
			}
			else if (interaction.customId === 'delete') {
				interaction.channel.delete().catch((error) => {
					if (error.code !== Discord.Constants.APIErrors.UNKNOWN_CHANNEL) {
						interaction.reply(
							'There was an error deleting the channel. Please do it manually.',
						);
						log.error('Failed to delete the interaction:', error);
					}
				});
			}
			else if (interaction.customId === 'archive') {
				const category = await client.channels.cache.get(
					config.tickets.archivedCategoryID,
				);
				interaction.channel.setParent(category);
				interaction.channel.permissionOverwrites.edit(
					config.tickets.supportTeamID,
					{
						ATTACH_FILES: false,
						READ_MESSAGE_HISTORY: true,
						SEND_MESSAGES: false,
						VIEW_CHANNEL: true,
					},
					`Archiving ticket channel. (${interaction.user.id})`,
				);
				const archivedEmbed = new MessageEmbed()
					.setColor('GREEN')
					.setDescription('The ticket has been archived.')
					.setTimestamp()
					.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');
				await interaction.reply({ embeds: [archivedEmbed] });
			}
			else if (interaction.customId === 'create_ticket') {
				const ticketid = await ticketFunctions.new(interaction, client);
				const ticketEmbed = new MessageEmbed()
					.setColor('GREEN')
					.setDescription(`Your ticket has been created in <#${ticketid}>`)
				// .setThumbnail('https://i.imgur.com/AfFp7pu.png')
					.setTimestamp()
					.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');
				interaction.reply({ embeds: [ticketEmbed], ephemeral: true });
			}
			else if (interaction.customId === 'close') {
				await client2.connect();

				const ticketid = interaction.channel.id;

				const filteredDocs = await collection.findOne({
					channelid: ticketid,
				});

				const noticketEmbed = new MessageEmbed()
					.setColor('RED')
					.setAuthor('This is not a ticket channel.')
					.setTimestamp()
					.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');

				if (!filteredDocs) {
					return interaction.reply({
						embeds: [noticketEmbed],
						ephemeral: true,
					});
				}
				const ticketEmbed = new MessageEmbed()
					.setColor('ORANGE')
					.setDescription('Are you sure you want to close the ticket?')
				// .setThumbnail('https://i.imgur.com/AfFp7pu.png')
					.setTimestamp()
					.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');
				const yesButton = new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId('yes')
						.setLabel('Yes')
						.setStyle('SUCCESS'),
				);
				const noButton = new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId('no')
						.setLabel('No')
						.setStyle('DANGER'),
				);
				await interaction.reply({
					embeds: [ticketEmbed],
					components: [yesButton, noButton],
				});
			}
		}

		if (!interaction.isCommand()) return;

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction, client);
			// console.log(interaction.member.voice.channel)
		}
		catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	},
};
