import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { DownloaderHelper } from 'node-downloader-helper';

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
            const url = msg.attachments.first()?.url;
            const is_json = msg.attachments.first()?.name?.endsWith('.json');
            if (!url || !is_json) {
                msg.react('❌');
                msg.reply('Couldn\'t process the attachment.');
                return null;
            }

            const download = new DownloaderHelper(url, 'tmp', {
                override: true,
            });

            download.on('end', async () => {
                const json_path = download.getDownloadPath().replace('\\', '/');
                import('./../../../' + json_path)
                    .then(embed => {
                        msg.react('✅');
                        channel.send(content, new MessageEmbed(embed));
                    })
                    .catch(err => {
                        console.log(err);
                        msg.react('❌');
                        msg.reply('Couldn\'t download the attachment.');
                    });
            });

            download.start();

        }
        else {
            msg.react('✅');
            channel.send(content);
        }

        return null;

    }
}
