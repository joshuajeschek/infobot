import { mongo } from './mongo';
import { translatableSchema } from '../schemas/translatable-schema';
import { Message, MessageEmbed, MessageEmbedOptions, MessageReaction, PartialUser, User } from 'discord.js';
import { Client, CommandoGuild } from 'discord.js-commando';
import getConfirmation from './util/confirmation';
import { downloadJSON } from './util/download_attachment';
import { translatable_emoji } from './settings.json';

export interface Translatable {
    message_id: string,
    channel_id: string,
    guild_id: string,
    content?: string,
    embed?: MessageEmbedOptions,
    _id?: string,
    _v?: string,
}

/**
 * Sets a Translatable for a message in the database
 */
async function setTranslatable(t:Translatable): Promise<boolean> {
    const result = await mongo().then(async (mongoose) => {
        try {
            return await translatableSchema.findOneAndUpdate({
                message_id: t.message_id,
            }, t, {
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

/**
 * Get the Translatable for a certain message,
 * or for all in guild (guild = true, id of guild)
 */
export async function getTranslatable(id:string, guild?:boolean): Promise<Translatable | Translatable[] | undefined> {
    if (!guild) {
        return await mongo().then(async (mongoose) => {
            try {
                return await translatableSchema.findOne({
                    message_id: id,
                });
            }
            finally {
                mongoose.connection.close();
            }
        });
    }
    return await mongo().then(async (mongoose) => {
        try {
            return await translatableSchema.find({
                guild_id: id,
            });
        }
        finally {
            mongoose.connection.close();
        }
    });
}


/**
 * Deletes a Translatable from the database
 */
async function deleteTranslatable(message_id:string): Promise<boolean> {
    const result = await mongo().then(async (mongoose) => {
        try {
            return await translatableSchema.findOneAndDelete({
                message_id,
            });
        }
        finally {
            mongoose.connection.close();
        }
    });

    if (result) return true;
    return false;
}

/**
 * Asks the user for a translation and adds it to the DB
 */
async function addTranslatable(r:MessageReaction, u:User | PartialUser): Promise<void> {

    if (!r.message.guild) return;

    let dm = u.dmChannel;
    if (!dm) dm = await u.createDM();
    const msg = await dm.send(`You reacted to a message in ${r.message.channel} with ${r.emoji.toString()}. A matching translation could not be found.`);

    const confirmation = await getConfirmation(msg, u.id, 'Do you want to create one?');
    if (!confirmation) {
        dm.send('Okay, I cancelled the process.');
        r.remove();
        return;
    }

    dm.send('Please send the translated content as a message. This process will be cancelled in 5 minutes.');
    const collector = dm.createMessageCollector((m:Message) => m.author.id != m.client.user?.id, { time: 5 * 60 * 1000 });

    collector.on('collect', async (m:Message) => {
        collector.stop('collect');
        let json: Record<string, unknown> | undefined;
        if (m.attachments.size > 0) {
            json = await downloadJSON(m);
        }
        const success = await setTranslatable({
            message_id: r.message.id,
            channel_id: r.message.channel.id,
            guild_id: r.message.guild?.id || 'NO_GUILD',
            content: m.content || undefined,
            embed: json ? new MessageEmbed(json).toJSON() || undefined : undefined,
        });
        if (success) {
            r.message.react(r.emoji);
            dm?.send('Success!');
        }
    });

    collector.on('end', (_, reason) => {
        if (reason == 'collect') return;
        dm?.send('Okay, I cancelled the process.');
        r.remove();
    });
}

/**
 * Starts the event listeners for message translation
 */
export function startTranslatableManager(client:Client): void {
    client.setMaxListeners(client.getMaxListeners() + 2);

    /**
     * checks if translation exists, shows it or adds it
     */
    client.on('messageReactionAdd', async (r, u) => {

        if (r.me) return;
        if (!r.message.guild) return;

        const emoji = (r.message.guild as CommandoGuild)
            .settings.get('translatable_emoji', translatable_emoji);

        if (!(r.emoji.toString() === emoji)) return;

        /* === reaction is specified emoji === */

        const result = await getTranslatable(r.message.id) as Translatable;
        if (!result) return addTranslatable(r, u);

        let dm = u.dmChannel;
        if (!dm) dm = await u.createDM();
        dm.send({
            content: `${r.emoji} Translation to the message in ${r.message.channel}:\n` + result.content,
            embed: result.embed,
        });

    });

    /**
     * deletion if bot reaction is removed (by admin)
     */
    client.on('messageReactionRemove', (r, u) => {

        if (!r.message.guild) return;
        const emoji = (r.message.guild as CommandoGuild)
            .settings.get('translatable_emoji', translatable_emoji);

        if (r.emoji.toString() === emoji && u.id === client.user?.id) {
            deleteTranslatable(r.message.id);
        }
    });

    client.on('messageReactionRemoveAll', (m) => {
        deleteTranslatable(m.id);
    });
}
