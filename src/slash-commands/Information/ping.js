const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, client) {
		const pingEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setDescription(`**Latency** is ${Date.now() - interaction.createdTimestamp}ms. \n**API Latency** is ${Math.round(client.ws.ping)}ms`)
			// .setThumbnail('https://i.imgur.com/AfFp7pu.png')
			.setTimestamp()
			.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');
		await interaction.reply({ embeds: [pingEmbed] });
	},
};
