import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { DownloaderHelper } from 'node-downloader-helper';

interface Args {
    channel: TextChannel,
    content: string,
}

export default class SendEmbedCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'sendembed',
            aliases: ['sendmbd'],
            group: 'admin',
            memberName: 'sendembed',
            description: 'Sends an embed, attached as a file to the specified channel',
            examples: ['sendembed #general This is an embed:'],
            args: [
                {
                    key: 'channel',
                    label: 'channel',
                    prompt: 'Where should the message be sent to?',
                    type: 'text-channel',
                },
                {
                    key: 'content',
                    label: 'content',
                    prompt: 'What should the message say',
                    default: '',
                    type: 'string',
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { channel, content }: Args): Promise<Message | null> {
        console.log('>>> sendembed by', msg.author.tag);

        const attachment = msg.attachments.first();

        if(!attachment) {
            return msg.reply('Please provide an attachment.');
        }

        const download = new DownloaderHelper(attachment.url, 'tmp', {
            override: true,
        });

        download.on('end', () => {
            const json_path = download.getDownloadPath().replace('\\', '/');
            import('./../../../' + json_path)
                .then(embed => {
                    channel.send(content, new MessageEmbed(embed));
                })
                .catch(err => console.log(err));
        });

        download.start();

        return null;
    }
}
