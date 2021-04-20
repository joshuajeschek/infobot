import { Message, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

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
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { channel, message_id, content }: Args): Promise<Message | null> {
        console.log('>>> editmessage by', msg.author.tag);

        const message = channel.messages.resolve(message_id);

        if (!message) {
            msg.react('❌');
            return null;
        }

        msg.react('✅');
        return message.edit(content);
    }
}
