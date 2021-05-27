import { GuildChannel, Message, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import def_settings from '../../modules/settings.json';
import Filter from 'bad-words';
import { checkForExistingChannels, refreshArchivables } from '../../modules/archivables/archivablemanager';
import getConfirmation from '../../modules/util/confirmation';


interface Args {
    name: string,
}

export default class TextChannelCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'textchannel',
            aliases: ['tc'],
            group: 'channels',
            memberName: 'textchannel',
            description: 'Create a text channel, that can be archived automatically or manually',
            examples: ['textchannel important topic'],
            guildOnly: true,
            args: [
                {
                    key: 'name',
                    label: 'name',
                    prompt: 'What should the voicechannel be called?',
                    type: 'string',
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { name }:Args): Promise<Message | null> {
        console.log('>>> textchannel by', msg.author.tag);

        // get category
        const cat = (msg.channel as GuildChannel).parent;
        if (!cat) return msg.reply('not possible in an uncategorized channel');

        // get categories where feature is enabled
        const auto_tc_enabled: [string] = msg.guild.settings.get('auto_tc_enabled', def_settings.protected.auto_tc_enabled);

        // enable if permissions allow it
        if (name === 'enable' && msg.guild.member(msg.author)?.hasPermission('MANAGE_CHANNELS')) {
            if (!auto_tc_enabled.includes(cat.id)) {
                auto_tc_enabled.push(cat.id);
                await msg.guild.settings.set('auto_tc_enabled', auto_tc_enabled);
                return msg.channel.send(`Enabled auto TextChannels in ${cat}`);
            }
            return msg.channel.send(`Auto TextChannels were already enabled in ${cat}`);
        }

        // disable if permissions allow it
        if (name === 'disable' && msg.guild.member(msg.author)?.hasPermission('MANAGE_CHANNELS')) {
            if (auto_tc_enabled.includes(cat.id)) {
                auto_tc_enabled.splice(auto_tc_enabled.indexOf(cat.id), 1);
                await msg.guild.settings.set('auto_tc_enabled', auto_tc_enabled);
                return msg.channel.send(`Disabled auto TextChannels in ${cat}`);
            }
            return msg.channel.send(`Auto TextChannels weren't enabled in ${cat}`);
        }

        // not enabled in category
        if (!auto_tc_enabled.includes(cat.id)) {
            return msg.channel.send('This feature is not enabled in this category. Ask an admin to enable it for you.');
        }

        // compile channel name
        name = new Filter({ placeHolder: '§' }).clean(name).substr(0, 96) + '-♻'.replace(' ', '-');

        // check for similar channels already existent in category
        const existing_channel = checkForExistingChannels(name, cat.id);
        if (existing_channel) {
            let content:string;
            switch (existing_channel.archived) {
            case true:
                content = `A channel with a similar name (\`${existing_channel.getName()}\`) has been found in the archives.` +
                        'Would you like to bring it back to life?';
                break;
            default:
                content = `A channel with a similar name (\`${existing_channel.getName()}\`) already exists.` +
                        'Would you like to create a new channel nevertheless?';
                break;
            }

            // confirmed -> create new channel / dearchive
            const confirmation = await getConfirmation(msg, msg.author.id, content);

            // archived, no new channel
            if (existing_channel.archived && confirmation) {
                existing_channel.deArchiveChannel(msg.channel as TextChannel);
                return null;
            }
            // not archived, no new channel
            if (!existing_channel.archived && !confirmation) return null;

            // every other case -> new channel
        }

        // create channel
        const new_channel = await msg.guild.channels.create(name, {
            parent: cat.id,
            reason: `Auto TextChannel by ${msg.author.tag}`,
            topic: 'Archive / Unarchive this channel by reacting to the pinned message. ' +
                'This will happen automatically after long periods of inactivity. ' +
                `Channel originally created by: ${msg.author.tag}`,
            type: 'text',
        });
        // sync permissions
        new_channel.lockPermissions();

        const archivable_data = {
            guild_id: msg.guild.id,
            channel_id: new_channel.id,
            parent_id: cat.id,
            archived: false,
        };

        // create Archivable from channel
        refreshArchivables(this.client, archivable_data);
        return msg.channel.send('✅ The channel has been created.');

    }
}
