import { Message, NewsChannel, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { ArchivableData } from '../../modules/archivables/archivable';
import { deleteArchivable, getArchivables, refreshArchivables, setArchivable } from '../../modules/archivables/archivablemanager';
import getConfirmation from '../../modules/util/confirmation';

interface Args {
    list: string,
}

export default class ArchivableCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'archivable',
            aliases: ['arch'],
            group: 'admin',
            memberName: 'archivable',
            description: 'turn any channel into an archivable channel',
            examples: ['archivable'],
            guildOnly: true,
            args: [
                {
                    key: 'list',
                    label: 'list',
                    prompt: 'List all Archivables?',
                    type: 'string',
                    default: false,
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { list }:Args): Promise<null | Message> {
        console.log('>>> archivable by', msg.author.tag);

        const archivables = await getArchivables(msg.guild.id);

        if (list) {
            let content = 'Currently active Archivables:\n>>> ';
            archivables.forEach(archivable => {
                content += `<#${archivable.channel_id}>: ${archivable.archived ? 'archived' : 'not archived'}\n`;
            });
            return msg.channel.send(content);
        }

        const cat = (msg.channel as TextChannel | NewsChannel).parent;
        if (!cat) return msg.reply('Not possible in uncategorized channels');

        const arch_enabled = archivables.some(archivable => {
            return archivable.channel_id === msg.channel.id;
        });

        let confirmation: boolean;
        switch (arch_enabled) {
        case true:
            confirmation = await getConfirmation(msg, msg.author.id, 'Turn off archivability of this channel?');
            break;
        default:
            confirmation = await getConfirmation(msg, msg.author.id, 'Turn on archivability of this channel?');
            break;
        }

        if (confirmation && arch_enabled) {
            const data = await deleteArchivable(msg.channel.id);
            refreshArchivables(this.client, data, true);
            return msg.reply('Turned the archivability of this channel off.');
        }
        else if (confirmation && !arch_enabled) {
            const archive_category:string = msg.guild.settings.get('tc_archive', undefined);
            if (archive_category === cat.id) {
                return msg.reply('Channel is already in the archive category, move it to its "normal" category first.');
            }
            const data:ArchivableData = {
                archived: false,
                channel_id: msg.channel.id,
                guild_id: msg.guild.id,
                parent_id: cat.id,
            };
            const success = await setArchivable(data);
            if (!success) return msg.reply('Something went wrong');
            refreshArchivables(this.client, data);
        }
        else {
            return msg.reply('Cancelled the process.');
        }
        return null;
    }
}
