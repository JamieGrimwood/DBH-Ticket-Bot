const config = require('../config/config.json');
const log = require('./logger');
const { MongoClient } = require('mongodb');
const client = new MongoClient(config.db.connectionString);
const db = client.db('dbh-ticket-bot');

exports.connect = async function() {
	await client.connect();
	log.database(
		`Database connected at connection string: ${config.db.connectionString}`,
	);
};

exports.newTicket = async function(ticketid, creatorid, topic, ticketName) {
	const collection = db.collection('tickets');
	const filteredDocs = await collection.findOne({
		channelid: ticketid,
	});
	if (!filteredDocs) {
		await collection.insertOne({
			channelid: ticketid,
			ticketname: ticketName,
			creator: creatorid,
			topic: topic,
			createdat: Date(),
			closed: false,
		});
	}
};

exports.closeTicket = async function(ticketid) {
	const collection = db.collection('tickets');
	const filteredDocs = await collection.findOne({
		channelid: ticketid,
	});
	if (!filteredDocs) return 'notfound';
	await collection.updateOne(
		{ channelid: ticketid },
		{ $set: { closed: true } },
	);
};