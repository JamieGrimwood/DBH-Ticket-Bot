const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get a list of commands for the bot.'),

	async execute(interaction, client) {
		const helpEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('A list of commands you can use.')
			.addField('Tickets', '/new - Create a new ticket', false)

		interaction.reply({ embeds: [helpEmbed] });

		const adminEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('A list of staff commands you can use.')
			.addField(
				'Tickets',
				'/add - Add a user to a ticket. (Support Team)\n/remove - Remove a user from a ticket. (Support Team)\n/close - Close a ticket. (Support Team)\n/createpanel - Create a new ticket panel. (Support Team)',
				false,
			);

		if (interaction.member.permissions.has('MANAGE_MESSAGES')) {
			return interaction.followUp({
				embeds: [adminEmbed],
				ephemeral: true,
			});
		}
	},
};
