import { Message, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

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
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { channel, content }: Args): Promise<Message> {
        console.log('>>> sendmessage by', msg.author.tag);

        msg.react('✅');

        return channel.send(content);
    }
}
