import { mongo } from './../mongo';
import { Client } from 'discord.js';
import { ReactionRole, ReactionRoleData } from './reactionroles';
import { reactionRoleSchema } from '../../schemas/reactionrole-schema';


/**
 * All currently active ReactionRoles
 */
const reaction_roles: Map<string, ReactionRole> = new Map();

/**
 * Sets an Reactionrole for a message in the database
 * refresh still needed!
 */
export async function setReactionRole(rr:ReactionRoleData): Promise<boolean> {
    const result = await mongo().then(async (mongoose) => {
        try {
            return await reactionRoleSchema.findOneAndUpdate({
                guild_id: rr.guild_id,
                channel_id: rr.channel_id,
                message_id: rr.message_id,
                role_id: rr.role_id,
            }, {
                guild_id: rr.guild_id,
                channel_id: rr.channel_id,
                message_id: rr.message_id,
                role_id: rr.role_id,
                emoji: rr.emoji,
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

/**
 * Get all ReactionRoles for a certain guild,
 * when no ID ist specified, all entries are returned.
 */
export async function getReactionRole(guild_id?:string): Promise<ReactionRoleData[]> {
    if (guild_id) {
        return await mongo().then(async (mongoose) => {
            try {
                return await reactionRoleSchema.find({
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
            return await reactionRoleSchema.find({});
        }
        catch (err) {
            console.log(err);
            return [];
        }
        finally {
            mongoose.connection.close();
        }
    });
}

/**
 * Deletes a ReactionRole from the database
 */
export async function deleteReactionRole(guild_id:string, channel_id:string, message_id?:string, role_id?:string): Promise<boolean> {
    const filter = { guild_id, channel_id, message_id, role_id };
    if (!message_id) delete filter.message_id;
    if (!role_id) delete filter.role_id;

    const result = await mongo().then(async (mongoose) => {
        try {
            return await reactionRoleSchema.deleteMany(filter);
        }
        finally {
            mongoose.connection.close();
        }
    });

    if (result) return true;
    return false;
}

/**
 * Refresh a single ReactionRole, or all (at startup)
 * can also stop a single rr (e.g. when deleted)
 */
export async function refreshReactionRoles(client:Client, rr?:ReactionRoleData, stop?:boolean): Promise<void> {
    if (rr) {
        const search_key = rr.guild_id + rr.channel_id + (rr.message_id ? rr.message_id : '') + (rr.role_id ? rr.role_id : '');
        reaction_roles.forEach((old_rr, key, map) => {
            if (key.startsWith(search_key)) {
                old_rr?.end();
                map.delete(key);
            }
        });

        if (stop) return;

        const new_rr = new ReactionRole(client, rr);
        new_rr.filter.bind(new_rr);

        reaction_roles.set(rr.guild_id + rr.channel_id + rr.message_id + rr.role_id, new_rr);
        return;
    }

    const rr_s = await getReactionRole();
    rr_s.forEach(entry => refreshReactionRoles(client, entry));
    console.log('👩‍⚕️ Refreshed ReactionRoles');
    return;
}
