import { Client, Guild, Message, MessageCollector, TextChannel } from 'discord.js';
import { autoReactChannelSchema } from '../schemas/autoreactchannel-schema';
import { mongo } from './mongo';

export interface AutoReactChannel {
    guild_id: string,
    channel_id: string,
    emojis: string[],
    media_only?: boolean,
    _id?: unknown,
    _v?: number,
}

const auto_reactors: Map<string, MessageCollector> = new Map();

export async function setAutoReactChannel(ar_channel:AutoReactChannel): Promise<boolean> {
    const result = await mongo().then(async (mongoose) => {
        try {
            return await autoReactChannelSchema.findOneAndUpdate({
                guild_id: ar_channel.guild_id,
                channel_id: ar_channel.channel_id,
            }, {
                guild_id: ar_channel.guild_id,
                channel_id: ar_channel.channel_id,
                media_only: ar_channel.media_only,
                emojis: ar_channel.emojis,
            }, {
                upsert: true,
                new: true,
            });
        }
        finally {
            mongoose.connection.close();
        }
    });

    if (result) return true;
    return false;
}

export async function getAutoReactChannels(guild_id?:string): Promise<AutoReactChannel[]> {
    if (guild_id) {
        return await mongo().then(async (mongoose) => {
            try {
                return await autoReactChannelSchema.find({
                    guild_id,
                });
            }
            finally {
                mongoose.connection.close();
            }
        });
    }
    // NO GUILD ID - ALL DOCUMENTS REQUESTED
    return await mongo().then(async (mongoose) => {
        try {
            return await autoReactChannelSchema.find({});
        }
        finally {
            mongoose.connection.close();
        }
    });
}

export async function deleteAutoReactChannel(guild_id:string, channel_id:string): Promise<boolean> {
    const result = await mongo().then(async (mongoose) => {
        try {
            return await autoReactChannelSchema.findOneAndDelete({
                guild_id,
                channel_id,
            });
        }
        finally {
            mongoose.connection.close();
        }
    });

    if (result) return true;
    return false;
}

export async function refreshAutoReactors(client:Client, ar_channel?:AutoReactChannel, stop?:boolean): Promise<void> {
    if (ar_channel) {
        const old_collector = auto_reactors.get(ar_channel.guild_id + ar_channel.channel_id);
        old_collector?.stop('refresh');

        if (stop) return;

        const filter = (() => {
            if (ar_channel.media_only) {
                return ((m:Message) => (m.attachments.size != 0 || m.embeds.length != 0));
            }
            else {
                return (() => true);
            }
        })();

        const new_collector = new MessageCollector(
            new TextChannel(
                new Guild(client, { id: ar_channel.guild_id }),
                { id: ar_channel.channel_id })
            , filter, { dispose: true });

        new_collector.on('collect', msg => {
            ar_channel.emojis.forEach(emoji => msg.react(emoji));
        });

        auto_reactors.set(ar_channel.guild_id + ar_channel.channel_id, new_collector);
        return;
    }

    const ar_channels = await getAutoReactChannels();
    ar_channels.forEach(entry => refreshAutoReactors(client, entry));
    return;
}
