import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { removeInviteLink, setInviteLink } from '../modules/invitelink';

interface Args {
    invite_link: string;
}

export default class SetInviteCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'setinvite',
            aliases: ['si'],
            group: 'admin',
            memberName: 'setinvite',
            description: 'Set the invite that will be presented through the `invite` command. Use `none` as parameter, to delete the stored invite.',
            examples: ['setinvite discord.gg/foobar', 'setinvite none'],
            userPermissions: ['CREATE_INSTANT_INVITE'],
            guildOnly: true,
            args: [
                {
                    key: 'invite_link',
                    label: 'link',
                    prompt: 'Which link should be used? Type none to delete the stored invite link.',
                    type: 'string',
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { invite_link }: Args): Promise<null> {
        console.log('>>> setinvite by', msg.author.tag);
        if (invite_link === 'none') {
            removeInviteLink(msg.guild.id);
        }
        else {
            setInviteLink(msg.guild.id, invite_link);
        }
        msg.react('✅');
        return null;
    }
}
