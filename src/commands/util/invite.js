const Commando = require('discord.js-commando');

module.exports = class InviteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            aliases: ['i'],
            group: 'util',
            memberName: 'invite',
            description: 'Provides you with the invite of this server',
            examples: ['invite'],
        });
    }

    async run(msg) {
        console.log('>>> invite by', msg.author.tag);
        msg.reply('Tis be thy invite');
    }
};
