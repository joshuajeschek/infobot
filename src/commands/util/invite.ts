import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';

export default class InviteCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'invite',
            aliases: ['i'],
            group: 'util',
            memberName: 'invite',
            description: 'Provides you with the invite of this server',
            examples: ['invite'],
        });
    }

    async run(msg: CommandoMessage): Promise<Message> {
        console.log('>>> invite by', msg.author.tag);
        return msg.reply('Tis be thy invite');
    }
}
