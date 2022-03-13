const config = require('../config/config.json');
const db = require('../utils/database.js');
const Discord = require('discord.js');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { MongoClient } = require('mongodb');
const client2 = new MongoClient(config.db.connectionString);
const db2 = client2.db('dbh-ticket-bot');
const collection = db2.collection('tickets');
const fs = require('fs');

exports.new = async (interaction) => {
	const ticketNum = Math.floor(1000 + Math.random() * 9000);
	const creator = `${interaction.user.username}#${interaction.user.discriminator}`;
	const creator_id = interaction.user.id;
	let topic;

	if (typeof interaction.options === 'undefined') {
		topic = 'Created via panel.';
	}
	else {
		topic = interaction.options.getString('topic') || 'No Topic Provided';
	}

	const ticketName = `ticket-${ticketNum}`;

	const t_channel = await interaction.guild.channels.create(ticketName, {
		parent: config.tickets.ticketsCategory,
		reason: `${interaction.user.name} requested a new ticket channel`,
		topic: `Topic: ${topic} | Created by: ${creator}`,
		type: 'GUILD_TEXT',
	});

	t_channel.permissionOverwrites.edit(
		creator_id,
		{
			ATTACH_FILES: true,
			READ_MESSAGE_HISTORY: true,
			SEND_MESSAGES: true,
			VIEW_CHANNEL: true,
		},
		`Ticket channel created by ${interaction.user.name}`,
	);

	t_channel.send(`<@${interaction.user.id}>`).then(async (msg) => {
		msg.delete();
	});
	t_channel.send(`<@&${config.tickets.supportTeamID}>`).then(async (msg) => {
		msg.delete();
	});

	const newTicketEmbed = new MessageEmbed()
		.setColor('GREEN')
		.setTitle('New Ticket!')
		.setDescription(
			`Welcome <@${interaction.user.id}>! Please state your issue below and a member of the support team will be with you shortly.`,
		)
		.setTimestamp()
		.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');

	const closeButton = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId('close')
			.setLabel('Close')
			.setStyle('DANGER'),
	);

	t_channel.send({ embeds: [newTicketEmbed], components: [closeButton] });

	const logChannel = interaction.guild.channels.cache.find(
		(channel) => channel.id === config.tickets.ticketLogsChannel,
	);

	const logEmbed = new MessageEmbed()
		.setColor('GREEN')
		.setTitle('New Ticket')
		.addField('Created By', interaction.user.tag)
		.addField('Created At', Date())
		.addField('Ticket Name', ticketName)
		.addField('Reason Created', topic)
		.setTimestamp()
		.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');

	logChannel.send({ embeds: [logEmbed] }).catch(() => {
		logChannel.send(
			'There was an error sending the embed. Ticket created by ' +
        interaction.user.tag +
        '.',
		);
	});

	const ticketid = t_channel.id;
	const creatorid = creator_id;
	await db.newTicket(ticketid, creatorid, topic, ticketName);
	return ticketid;
};

exports.close = async (interaction) => {
	const ticketHtmlID = Math.floor(1000 + Math.random() * 900000);
	await client2.connect();

	const t_channel = interaction.channel;
	const ticketid = interaction.channel.id;

	const filteredDocs = await collection.findOne({
		channelid: ticketid,
	});

	const noticketEmbed = new MessageEmbed()
		.setColor('RED')
		.setAuthor('This channel is not in the database as a ticket.')
		.setTimestamp()
		.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');

	if (!filteredDocs) {return interaction.reply({ embeds: [noticketEmbed], ephemeral: true });}

	const notTicketEmbed = new MessageEmbed()
		.setColor('RED')
		.setAuthor('This ticket is already closed!')
		.setTimestamp()
		.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');

	if (filteredDocs.closed === true) {return interaction.reply({ embeds: [notTicketEmbed], ephemeral: true });}

	interaction.channel.messages.fetch({ limit: 100 }).then(async (msgs) => {
		const ticketChannel = interaction.channel;
		let html = '';

		msgs = msgs.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
		html += '<style>* {background-color: #2c2f33;color: #fff;font-family: Arial, Helvetica, sans-serif;}</style>';
		html += `<strong>Server Name:</strong> ${interaction.guild.name}<br>`;
		html += `<strong>Date And Time Closed:</strong> ${Date()}<br>`;
		html += `<strong>Ticket:</strong> ${ticketChannel.name}<br>`;
		html += `<strong>Topic:</strong> ${filteredDocs.topic}<br>`;
		html += `<strong>Message:</strong> ${msgs.size} Messages<br><br><br>`;
		html += '-----<br><br>';

		msgs.forEach((msg) => {
			const dateObject = new Date(msg.createdTimestamp);

			const humanDateFormat = dateObject.toLocaleString();

			if (msg.content) {
				html += `<strong>User:</strong> ${msg.author.tag}<br>`;
				html += `<strong>Message:</strong> ${msg.content}<br>`;
				html += `<strong>Time:</strong> ${humanDateFormat}<br>`;
				html += '-----<br><br>';
			}
		});

		const name = `${interaction.channel.name}-${ticketHtmlID}`;
		const logChannel = interaction.guild.channels.cache.find(
			(channel) => channel.id === config.tickets.ticketLogsChannel,
		);

		const path = `./src/web/tickets/${name}.html`;

		const buffer = Buffer.from(html);

		fs.createWriteStream(path).write(buffer);

		const logEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Ticket Closed.')
			.addField('Closed By', interaction.user.tag)
			.addField('Topic', filteredDocs.topic)
			.addField('Closed At', Date())
			.addField(
				'Direct Transcript',
				`https://${config.transcriptURL}/tickets/${name}.html`,
			)
			.setTimestamp()
			.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');

		const file = new Discord.MessageAttachment(Buffer.from(html), `${name}.html`);
		logChannel.send({ embeds: [logEmbed], files: [file] }).catch(() => {
			interaction.reply(
				'There was an error creating the transcript. Ticket closed by ' +
          interaction.user.tag +
          '.',
			);
		});

		const creator_id = filteredDocs.creator;

		t_channel.permissionOverwrites.edit(
			creator_id,
			{
				ATTACH_FILES: false,
				READ_MESSAGE_HISTORY: false,
				SEND_MESSAGES: false,
				VIEW_CHANNEL: false,
			},
			`Closing ticket channel. (${interaction.user.name})`,
		);

		db.closeTicket(ticketid);
		const ticketEmbed = new MessageEmbed()
			.setColor('ORANGE')
			.setDescription(
				'The ticket has been closed. Do you want to archive the ticket or delete it?',
			)
		// .setThumbnail('https://i.imgur.com/AfFp7pu.png')
			.setTimestamp()
			.setFooter('DBH Ticket Bot', 'https://cdn.discordapp.com/attachments/751155257580454041/952625324447924285/logo.png');
		const archiveButton = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('archive')
				.setLabel('Archive')
				.setStyle('SUCCESS'),
		);
		const deleteButton = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('delete')
				.setLabel('Delete')
				.setStyle('DANGER'),
		);
		await interaction.reply({
			embeds: [ticketEmbed],
			components: [archiveButton, deleteButton],
		});
	});
};
