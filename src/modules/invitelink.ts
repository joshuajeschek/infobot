import { mongo } from './mongo';
import { inviteLinkSchema } from '../schemas/invitelink-schema';

const invite_link_cache = new Map();

/**
 * Return the set invite link for a guild.
 * @param guild_id the guild in question
 * @returns the invite link that is set, or undefined
 */
export async function getInviteLink(guild_id:string): Promise<string | undefined> {
    if (invite_link_cache.has(guild_id)) {
        return invite_link_cache.get(guild_id);
    }
    let invite_link:string | undefined;
    await mongo().then(async (mongoose) => {
        try {
            const result = await inviteLinkSchema.findOne({
                guild_id,
            });
            invite_link = result?.invite_link;
        }
        finally {
            mongoose.connection.close();
        }
    });
    return invite_link;
}

/**
 * Removes the set invite link from the cache and DB
 * @param guild_id the affected guild
 */
export async function removeInviteLink(guild_id: string): Promise<void> {
    if (invite_link_cache.has(guild_id)) {
        invite_link_cache.delete(guild_id);
    }
    await mongo().then(async (mongoose) => {
        try {
            await inviteLinkSchema.findOneAndDelete({
                guild_id,
            });
        }
        finally {
            mongoose.connection.close();
        }
    });
}

/**
 * Sets an invite link for the specified guild
 * @param guild_id the id of the affected guild
 * @param invite_link the invite link that should be set for it
 */
export async function setInviteLink(guild_id:string, invite_link: string): Promise<void> {
    invite_link_cache.set(guild_id, invite_link);
    await mongo().then(async (mongoose) => {
        try {
            await inviteLinkSchema.findOneAndUpdate({
                guild_id,
            }, {
                guild_id: guild_id,
                invite_link: invite_link,
            }, {
                upsert: true,
            });
        }
        finally {
            mongoose.connection.close();
        }
    });
}
