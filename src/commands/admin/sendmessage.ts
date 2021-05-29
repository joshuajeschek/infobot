import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { downloadJSON } from '../../modules/util/download_attachment';

interface Args {
    channel: TextChannel,
    content: string,
}

export default class SendMessageCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'sendmessage',
            aliases: ['sendmsg'],
            group: 'admin',
            memberName: 'sendmessage',
            description: 'Sends a text message with the supplied content',
            examples: ['sendmessage #general kenobi'],
            userPermissions: ['ADMINISTRATOR'],
            args: [
                {
                    key: 'channel',
                    label: 'channel',
                    prompt: 'In which channel should the message be sent?',
                    type: 'text-channel',
                },
                {
                    key: 'content',
                    label: 'content',
                    prompt: 'What should the message say?',
                    type: 'string',
                    default: '',
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { channel, content }: Args): Promise<null> {
        console.log('>>> sendmessage by', msg.author.tag);

        if (content === '' && msg.attachments.size === 0) {
            msg.reply('cannot send an empty message!');
            return null;
        }

        if (msg.attachments.size != 0) {
            downloadJSON(msg).then(async (json) => {
                if (!json) {
                    msg.react('❌');
                    return msg.reply('Couldn\'t download the attachment.');
                }
                try {
                    await channel.send(content, new MessageEmbed(json));
                    msg.react('✅');
                }
                catch (e) {
                    msg.react('❌');
                    msg.channel.send('Couldn\'t send your message: `' + e + '`');
                }
            });
        }
        else {
            try {
                msg.react('✅');
                channel.send(content);
            }
            catch (e) {
                msg.react('❌');
                msg.channel.send('Couldn\'t send your message: `' + e + '`');
            }
        }

        return null;

    }
}
