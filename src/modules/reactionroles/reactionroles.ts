import { Client, Guild, Message, MessageReaction, PartialUser, TextChannel, User } from 'discord.js';

export interface ReactionRoleData {
    guild_id:string,
    channel_id:string,
    message_id?:string,
    role_id?:string,
    emoji?:string,
    _v?: string,
    _id?: string
}

/**
 * Initiates and ends a Message Reaction Collector that sets a role
 */
export class ReactionRole {
    private client: Client;
    private message?: Message;
    private channel_id: string;
    private message_id: string;
    private guild_id: string;
    private role_id: string;
    private emoji: string;

    constructor(client:Client, rr_data:ReactionRoleData) {
        if(!rr_data.message_id || !rr_data.role_id || !rr_data.emoji) {
            throw new Error('Insufficient ReactionRoleData');
        }

        this.client = client;

        this.guild_id = rr_data.guild_id;
        this.channel_id = rr_data.channel_id;
        this.message_id = rr_data.message_id;

        this.emoji = rr_data.emoji;
        this.role_id = rr_data.role_id;

        try {
            this.message = new Message(client, { id: this.message_id },
                new TextChannel(new Guild(client, { id: this.guild_id }),
                    { id: this.channel_id }));
            this.message.react(this.emoji);
        }
        catch {
            console.log('guild / channel / message deleted?', rr_data._id);
        }

        this.client.on('messageReactionAdd', this.giveRole);
        this.client.on('messageReactionRemove', this.removeRole);
    }

    /**
     * checks if MessageReaction belongs to this ReactionRole
     */
    public filter(r:MessageReaction, u:User | PartialUser): boolean {
        if (u.id === this.client.user?.id) return false;
        if (r.message.guild?.id != this.guild_id) return false;
        if (r.message.channel.id != this.channel_id) return false;
        if (r.message.id != this.message_id) return false;
        if (r.emoji.id != this.emoji && r.emoji.toString() != this.emoji) return false;
        return true;
    }

    /**
     * called on messageReactionAdd Event
     */
    private giveRole = async (r:MessageReaction, u:User | PartialUser): Promise<void> => {
        if (this.filter(r, u) === false) return;

        const member = await r.message.guild?.members.fetch(u.id);
        const role = await r.message.guild?.roles.fetch(this.role_id);

        if (!member || !role) {
            const msg = await r.message.channel.send('⚠ Role not available, please contact an admin.');
            setTimeout(() => msg.delete(), 5 * 1000);
            return;
        }

        member.roles.add(role);
        const msg = await r.message.channel.send(`✅ You have been given the role \`${role.name}\``);
        setTimeout(() => msg.delete(), 5 * 1000);
        return;
    }

    /**
     * called on messageReactionRemove event
     */
    private removeRole = async (r:MessageReaction, u:User | PartialUser): Promise<void> => {
        if (this.filter(r, u) === false) return;

        const member = await r.message.guild?.members.fetch(u.id);
        const role = await r.message.guild?.roles.fetch(this.role_id);

        if (!member || !role) {
            const msg = await r.message.channel.send('⚠ Role not available, please contact an admin.');
            setTimeout(() => msg.delete(), 5 * 1000);
            return;
        }

        member.roles.remove(role);
        const msg = await r.message.channel.send(`🗑 Your role \`${role.name}\` has been removed.`);
        setTimeout(() => msg.delete(), 5 * 1000);
        return;
    }

    /**
     * stop the collector
     */
    public end(): void {
        this.client.removeListener('messageReactionAdd', this.giveRole);
        this.client.removeListener('messageReactionRemove', this.removeRole);
        this.message?.reactions.cache.get(this.emoji)?.users.remove(this.client.user?.id);
    }

}
