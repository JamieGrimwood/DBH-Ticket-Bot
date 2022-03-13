const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {

	data: new SlashCommandBuilder()
		.setName('botinfo')
		.setDescription('Get the bots info!'),
	async execute(interaction, client) {

		const embed = new MessageEmbed()
			.setTitle('Bot Info')
			.setColor('#0099ff')
			.setThumbnail(client.user.displayAvatarURL())
			.addField('**Name**', client.user.username, false)
			.addField('**ID**', client.user.id, true)
			.addField('\u200b', '\u200b', true)
			.addField('**Library**', 'discord.js', true)
			.addField('**Latency**', `${Date.now() - interaction.createdTimestamp}ms`, true)
			.addField('**API Latency**', `${Math.round(client.ws.ping)}ms`, true)
			.addField('**__Developers__**', '<@!526849883559165984> \n<@!323852935307984896>', false)
			.setFooter(`Requested By ${interaction.member.user.username}`, interaction.member.user.displayAvatarURL())
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},


};