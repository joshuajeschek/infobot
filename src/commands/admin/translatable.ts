import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { getTranslatable, Translatable } from '../../modules/translatablemanager';

export default class TranslatableCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'translatable',
            aliases: ['tl'],
            group: 'admin',
            memberName: 'translatable',
            description: 'List all Translatables in this guild.',
            examples: ['translatable'],
            guildOnly: true,
            userPermissions: ['ADMINISTRATOR'],
        });
    }

    async run(msg: CommandoMessage): Promise<Message> {
        console.log('>>> translatable by', msg.author.tag);

        // get list of translatables
        const translatables = await getTranslatable(msg.guild.id, true) as Translatable[];

        // compile message
        let content = 'Currently active translatables:\n>>> ';
        if (translatables.length === 0) content += 'none';
        translatables.forEach(translatable => {
            const channel = msg.guild.channels.resolve(translatable.channel_id);
            content += `${channel ? channel : 'DELETED_CHANNEL'} : ${translatable.message_id}\n` +
                `\t${translatable.content}${translatable.embed ? ' `+embed`' : ''}\n`;
        });

        // send message
        return msg.channel.send(content);
    }
}
