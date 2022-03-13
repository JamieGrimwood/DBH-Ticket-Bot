const log = require('../utils/logger');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		log.discord(`Ready! Logged in as ${client.user.tag}`);
		client.user.setStatus('online');
		client.user.setPresence({ activities: [{ name: '/help' }] });
	},
};
