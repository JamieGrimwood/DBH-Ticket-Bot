const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ticketFunctions = require('../../command_functions/tickets');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('new')
		.setDescription('Creates a new ticket.')
		.addStringOption((option) =>
			option.setName('topic').setDescription('The topic of the ticket.'),
		),
	async execute(interaction, client) {
		const ticketid = await ticketFunctions.new(interaction, client);
		const ticketEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setDescription(`Your ticket has been created in <#${ticketid}>`)
		// .setThumbnail('https://i.imgur.com/AfFp7pu.png')
			.setTimestamp()
			.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');
		await interaction.reply({ embeds: [ticketEmbed] });
	},
};
