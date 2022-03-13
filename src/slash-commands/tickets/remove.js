const config = require('../../config/config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ticketFunctions = require('../../command_functions/tickets');
const { MongoClient } = require('mongodb');
const client2 = new MongoClient(config.db.connectionString);
const db2 = client2.db('dbh-ticket-bot');
const collection = db2.collection('tickets');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Removes a user from a ticket.')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The user you want to remove from the ticket.')
				.setRequired(true),
		),
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

		const user = interaction.options.getMember('user');
		interaction.channel.permissionOverwrites.edit(
			user.id,
			{
				ATTACH_FILES: false,
				READ_MESSAGE_HISTORY: false,
				SEND_MESSAGES: false,
				VIEW_CHANNEL: false,
			},
			`Archiving ticket channel. (${interaction.user.id})`,
		);
		const ticketEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setDescription(`<@${user.id}> has been removed from the ticket.`)
		// .setThumbnail('https://i.imgur.com/AfFp7pu.png')
			.setTimestamp()
			.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');
		await interaction.reply({ embeds: [ticketEmbed] });
	},
};
