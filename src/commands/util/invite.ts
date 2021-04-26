import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getInviteLink } from '../../modules/invitelink';

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
        const invite_link = await getInviteLink(msg.guild.id);
        if (!invite_link) {
            const member = msg.guild.member(msg.author);
            if (member?.hasPermission('CREATE_INSTANT_INVITE')) {
                return msg.reply('Invite not set. Please set it using the `setInvite` command.');
            }
            else {
                return msg.reply('Invite not set. Please ask an admin to set it using the `setInvite` command.');
            }
        }
        return msg.reply('Invite people to this server!\n' + invite_link);
    }
}
