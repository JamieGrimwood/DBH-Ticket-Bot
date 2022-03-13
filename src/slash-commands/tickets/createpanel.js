const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createpanel')
		.setDescription('Creates the ticket panel.'),
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

		const ticketEmbed = new MessageEmbed()
			.setColor('GREEN')
			.setDescription(
				'Please submit a ticket to contact a member of the DanbotHosting team!',
			)
		// .setThumbnail('https://i.imgur.com/AfFp7pu.png')
			.setTimestamp()
			.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');
		const createButton = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('create_ticket')
				.setLabel('Create Ticket')
				.setStyle('SUCCESS'),
		);
		await interaction.reply({
			embeds: [ticketEmbed],
			components: [createButton],
		});
	},
};
