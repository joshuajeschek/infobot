import { Channel, Emoji, GuildEmoji, Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { AutoReactChannel, deleteAutoReactChannel, getAutoReactChannels, refreshAutoReactors, setAutoReactChannel } from '../../modules/autoreactmanager';
import getConfirmation from '../../modules/util/confirmation';

interface Args {
    channel: Channel | false,
    media_only: boolean,
    emojis: Emoji[] | false,
}

export default class AutoReactCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'autoreact',
            aliases: ['ar'],
            group: 'admin',
            memberName: 'autoreact',
            description: 'Set an autoreact channel or see a list of active auto react channels (no arguments)',
            examples: ['autoreact #memes 👍 👎'],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    label: 'channel',
                    prompt: 'Which channel do you want to add / modify?',
                    type: 'channel',
                    default: false,
                },
                {
                    key: 'media_only',
                    label: 'media_only',
                    prompt: 'Should the bot only react to messages containing media?',
                    type: 'boolean',
                    default: false,
                },
                {
                    key: 'emojis',
                    label: 'emojis',
                    prompt: 'Which emojis should be auto added?',
                    type: 'custom-emoji|default-emoji',
                    default: false,
                    infinite: true,
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { channel, media_only, emojis }: Args): Promise<Message | null> {
        console.log('>>> autoreact by', msg.author.tag);

        // #region LIST ALL
        if (!channel) {
            const results = await getAutoReactChannels(msg.guild.id);
            const embed = new MessageEmbed({ title: 'Currently active auto react channels:' });

            results.forEach(ar_channel => {
                const channel_emojis:(Emoji | string)[] = [];

                ar_channel.emojis.forEach(emoji => {
                    if (emoji.length === 18) {
                        channel_emojis.push(new GuildEmoji(this.client, { id: emoji }, msg.guild));
                    }
                    else {
                        channel_emojis.push(emoji);
                    }
                });

                embed.addField(
                    msg.guild.channels.resolve(ar_channel.channel_id)?.name,
                    `${channel_emojis}`.split(',').join(' ') + ` ${ar_channel.media_only ? 'MEDIA' : 'EVERYTHING'}`,
                    true
                );
            });

            if (results.length === 0) embed.setDescription('No active auto react channels found');
            return msg.reply(embed);
        }
        // #endregion LIST ALL

        // #region DELETE AR CHANNEL
        if (!emojis) {
            const confimation = await getConfirmation(msg, `disable the auto reaction channel ${channel}?`);

            if (confimation) {
                const success = await deleteAutoReactChannel(msg.guild.id, channel.id);
                if (success) {
                    refreshAutoReactors(this.client, { guild_id: msg.guild.id, channel_id: channel.id, emojis: [] }, true);
                    msg.react('✅');
                }
                else {msg.react('❌');}
                return null;
            }
            msg.react('❌');
            return null;
        }
        // #endregion DELETE AR CHANNEL

        /* ADD CHANNEL */
        const ar_channel:AutoReactChannel = {
            guild_id: msg.guild.id,
            channel_id: channel.id,
            media_only,
            emojis: [],
        };

        emojis.forEach(emoji => ar_channel.emojis.push(emoji.id ? emoji.id : emoji.toString()));

        const success = setAutoReactChannel(ar_channel);

        if (success) {
            refreshAutoReactors(this.client, ar_channel);
            msg.react('✅');
        }
        else {msg.react('❌');}

        return null;
    }
}
