import { CategoryChannel, Client, Message, MessageReaction, TextChannel } from 'discord.js';
import { CommandoClient, CommandoGuild } from 'discord.js-commando';
import { setArchivable } from './archivablemanager';

export interface ArchivableData {
    guild_id: string,
    parent_id: string,
    channel_id: string,
    archive_msg_id?: string,
    archived: boolean,
}

/**
 * Manages the archiving and de-archiving of auto text channels
 */
export class Archivable {
    client: Client;
    guild_id: string;
    parent_id: string;
    channel_id: string;
    archive_msg_id?: string;
    archived: boolean;
    constructor(client:CommandoClient, archivable_data:ArchivableData) {
        this.client = client;
        ({
            guild_id: this.guild_id,
            parent_id: this.parent_id,
            channel_id: this.channel_id,
            archived: this.archived,
        } = archivable_data);

        this.update(archivable_data.archive_msg_id);
    }

    /**
     * gets the name of the channel
     */
    getName(): string | null {
        const channel = this.client.channels.resolve(this.channel_id) as TextChannel;
        if (!channel) return null;
        else return channel.name;
    }

    /**
     * Archives a channel,
     * either through a MessageReaction to the archive message,
     * or by providing a TextChannel as ctxt
     */
    archiveChannel = async (ctxt:MessageReaction | TextChannel): Promise<void | Message> => {

        // not ready yet
        if (!this.archive_msg_id) return;

        // called through messageReactionAdd event,
        // check if reaction to archive_msg
        if (ctxt.constructor.name === MessageReaction.name) {
            ctxt = (ctxt as MessageReaction);
            if (ctxt.me || ctxt.message.id != this.archive_msg_id) return;
            if (!(ctxt.emoji.name === '📥')) return;
            ctxt = (ctxt.message.channel as TextChannel);
        }

        // get archive category
        const to = (this.client.guilds.resolve(this.guild_id) as CommandoGuild)
            .settings.get('tc_archive', undefined) as string | undefined;

        // not set up
        if (!to) {
            return (ctxt as TextChannel)
                .send('Archive Category not set up. Please set it up / ask an admin and try again.');
        }

        // delete archive listener
        this.client.setMaxListeners(this.client.getMaxListeners() - 1);
        this.client.removeListener('messageReactionAdd', this.archiveChannel);

        // get channel
        const channel = await this.client.channels.fetch(this.channel_id) as TextChannel;
        // move it
        channel.setParent(to, { lockPermissions: false });
        // set to read only
        channel.permissionOverwrites.forEach(async (overwrite) => {
            overwrite.update({ 'SEND_MESSAGES': false });
        });
        // was accessible to everyone
        if (channel.permissionOverwrites.size === 0) {
            channel.createOverwrite(channel.guild.roles.everyone, {
                'SEND_MESSAGES': false,
            });
        }

        // delete archive_msg
        channel.messages.resolve(this.archive_msg_id)?.delete();

        // switch state
        this.archived = true;
        // set up new message and update in database
        this.update();
    }

    /**
     * De-Archives a channel,
     * either through a MessageReaction to the archive message,
     * or by providing a TextChannel as ctxt
     */
    deArchiveChannel = async (ctxt:MessageReaction | TextChannel): Promise<void | Message> => {

        // not ready yet
        if (!this.archive_msg_id) return;

        // called through messageReactionAdd event,
        // check if reaction to archive_msg
        if (ctxt.constructor.name === MessageReaction.name) {
            ctxt = (ctxt as MessageReaction);
            if (ctxt.me || ctxt.message.id != this.archive_msg_id) return;
            if (!(ctxt.emoji.name === '📤')) return;
            ctxt = (ctxt.message.channel as TextChannel);
        }

        // get parent category
        const to = await this.client.channels.fetch(this.parent_id) as CategoryChannel;
        if (!to) {
            return (ctxt as TextChannel)
                .send('The original Category seems to be deleted. Please ask an admin to fix this.');
        }

        // delete deArchive listener
        this.client.setMaxListeners(this.client.getMaxListeners() - 1);
        this.client.removeListener('messageReactionAdd', this.deArchiveChannel);

        // get channel
        const channel = await this.client.channels.fetch(this.channel_id) as TextChannel;
        // move it + sync permissions
        await channel.setParent(to.id, { lockPermissions: true });
        // delete archive_msg
        channel.messages.resolve(this.archive_msg_id)?.delete();

        // switch state
        this.archived = false;
        // set up new message and update in database
        this.update();
    }

    /**
     * Sets up the Message with which the channel can be (de)archived,
     * Sets Archivable in database
     */
    private async update(msg_id?:string): Promise<void> {
        let msg:Message | null = null;

        // msg doesn't exist yet, send it
        if (!msg_id) {
            let content:string;
            switch (this.archived) {
            case true:
                content = 'This channel is archived. React with 📤 to bring it back to life.';
                break;
            default:
                content = 'This channel is archivable. React with 📥 to archive it.';
                break;
            }
            try {
                const chnl = await this.client.channels.fetch(this.channel_id) as TextChannel;
                msg = await chnl.send(content);
            }
            catch (err) {
                console.log(`Error while setting up channel ${this.channel_id}: ${err}`);
                return;
            }
        }
        else {
            // fetch msg
            try {
                msg = await (await this.client.channels.fetch(this.channel_id) as TextChannel)
                    .messages.fetch(msg_id);
            }
            catch (err) {
                if (err.message != 'Unknown Message') {
                    console.log(`Error while setting up channel ${this.channel_id}: ${err}`);
                    return;
                }
            }
        }

        // original message deleted
        if (!msg) return this.update();

        msg.pin();

        // set up listeners
        this.client.setMaxListeners(this.client.getMaxListeners() + 1);
        if (this.archived) {
            msg.react('📤');
            this.client.on('messageReactionAdd', this.deArchiveChannel);
        }
        else {
            msg.react('📥');
            this.client.on('messageReactionAdd', this.archiveChannel);
        }

        // set archive_msg_id
        this.archive_msg_id = msg.id;

        // update in database
        if (!msg_id) {
            setArchivable({
                guild_id: this.guild_id,
                parent_id: this.parent_id,
                channel_id: this.channel_id,
                archive_msg_id: this.archive_msg_id,
                archived: this.archived,
            });
        }
    }

    /**
     * stops the listeners for the Archivable,
     * deletes the archive_msg,
     * and the info from DB
     */
    async stop(): Promise<void> {
        if (this.archived) {
            this.client.removeListener('messageReactionAdd', this.deArchiveChannel);
            this.client.setMaxListeners(this.client.getMaxListeners() - 1);
        }
        else {
            this.client.removeListener('messageReactionAdd', this.archiveChannel);
            this.client.setMaxListeners(this.client.getMaxListeners() - 1);
        }

        if (!this.archive_msg_id) return;

        // get archive_msg and delete it
        const msg = await (await this.client.channels.fetch(this.channel_id) as TextChannel)
            .messages.fetch(this.archive_msg_id);
        msg.delete();

        // delete info from DB!
        // FIRST DELETE -> GET INFO (CATEGORY) -> THEN REFRESH! (this gets called)

    }
}
