import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { DownloaderHelper } from 'node-downloader-helper';

interface Args {
    channel: TextChannel,
    message_id: string,
    content: string,
}

export default class EditMessageCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'editmessage',
            aliases: ['editmsg'],
            group: 'admin',
            memberName: 'editmessage',
            description: 'edits a text message with the supplied content',
            examples: ['editmessage 12345 foobar'],
            userPermissions: ['ADMINISTRATOR'],
            args: [
                {
                    key: 'channel',
                    label: 'channel',
                    prompt: 'In which channel should a message be edited?',
                    type: 'text-channel',
                },
                {
                    key: 'message_id',
                    label: 'messageID',
                    prompt: 'Which message should be edited? (ID)',
                    type: 'string',
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

    async run(msg: CommandoMessage, { channel, message_id, content }: Args): Promise<Message | null> {
        console.log('>>> editmessage by', msg.author.tag);

        const message = await channel.messages.fetch(message_id);

        if (!message) {
            msg.reply('Couldn\'t find the message.');
            msg.react('❌');
            return null;
        }

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
                        message.edit(content, new MessageEmbed(embed));
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
            return message.edit(content);
        }

        return null;
    }
}
