const config = require('../../config/config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const ticketFunctions = require('../../command_functions/tickets');
const { MongoClient } = require('mongodb');
const client2 = new MongoClient(config.db.connectionString);
const db2 = client2.db('dbh-ticket-bot');
const collection = db2.collection('tickets');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
		.setDescription('Closes a ticket.'),
	async execute(interaction, client) {
		const noPerms = new MessageEmbed()
			.setColor('#ff0000')
			.setDescription('**You do not have permission to do this!**')
			.setTimestamp()
			.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');

		if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
			return interaction.reply({
				embeds: [noPerms],
				ephemeral: true,
			});
		}

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

		if (!filteredDocs) {return interaction.reply({ embeds: [noticketEmbed], ephemeral: true });}
		const ticketEmbed = new MessageEmbed()
			.setColor('ORANGE')
			.setDescription('Are you sure you want to close the ticket?')
		// .setThumbnail('https://i.imgur.com/AfFp7pu.png')
			.setTimestamp()
			.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');
		const yesButton = new MessageActionRow().addComponents(
			new MessageButton().setCustomId('yes').setLabel('Yes').setStyle('SUCCESS'),
		);
		const noButton = new MessageActionRow().addComponents(
			new MessageButton().setCustomId('no').setLabel('No').setStyle('DANGER'),
		);
		await interaction.reply({
			embeds: [ticketEmbed],
			components: [yesButton, noButton],
		});
	},
};
