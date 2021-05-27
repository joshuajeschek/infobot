import { CommandoClient } from 'discord.js-commando';
import levenshtein from 'js-levenshtein';
import { archivableSchema } from '../../schemas/archivable-schema';
import { mongo } from './../mongo';
import { Archivable, ArchivableData } from './archivable';

/**
 * All currently active Archivables
 */
const archivables: Map<string, Archivable> = new Map();

/**
 * Sets an Archivable for a guild in the database
 */
export async function setArchivable(archivable:ArchivableData): Promise<boolean> {
    const result = await mongo().then(async (mongoose) => {
        try {
            return await archivableSchema.findOneAndUpdate({
                channel_id: archivable.channel_id,
            }, {
                guild_id: archivable.guild_id,
                parent_id: archivable.parent_id,
                channel_id: archivable.channel_id,
                archive_msg_id: archivable.archive_msg_id,
                archived: archivable.archived,
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
 * Get all Archivables for a certain guild,
 * when no ID ist specified, all entries are returned.
 */
export async function getArchivables(guild_id?:string): Promise<ArchivableData[]> {
    if (guild_id) {
        return await mongo().then(async (mongoose) => {
            try {
                return await archivableSchema.find({
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
            return await archivableSchema.find({});
        }
        finally {
            mongoose.connection.close();
        }
    });
}

/**
 * Deletes an Archivable from the database
 */
export async function deleteArchivable(channel_id:string): Promise<ArchivableData> {
    const result = await mongo().then(async (mongoose) => {
        try {
            return await archivableSchema.findOneAndDelete({
                channel_id,
            }) as ArchivableData;
        }
        finally {
            mongoose.connection.close();
        }
    });

    return result;
}

/**
 * Refresh a single AutoReactChannel, or all (at startup)
 * can also stop a single ar_channel (e.g. when deleted)
 */
export async function refreshArchivables(client:CommandoClient, archivable_data?:ArchivableData, stop?:boolean): Promise<void> {
    if (archivable_data) {
        const old_archivable = archivables.get(archivable_data.parent_id + archivable_data.channel_id);
        old_archivable?.stop();

        if (stop) return;
        const new_archivable = new Archivable(client, archivable_data);

        archivables.set(archivable_data.parent_id + archivable_data.channel_id, new_archivable);
        return;
    }

    const archivables_data = await getArchivables();
    archivables_data.forEach(entry => refreshArchivables(client, entry));
    console.log('♻ Refreshed Archivables');
    return;
}

/**
 * checks if there are already channels with the same name
 * in the category, if yes, return Archivable, else null
 */
export function checkForExistingChannels(name:string, category_id:string): Archivable | null {
    // get all Archivables in category
    const archivables_in_cat:Archivable[] = [];
    archivables.forEach((archivable, key) => {
        if (key.startsWith(category_id)) {
            archivables_in_cat.push(archivable);
        }
    });

    // no Archivables in category
    if (archivables_in_cat.length === 0) return null;

    // sort by levenshtein distance to name
    let lowest_levenshtein = Infinity;

    // only one -> set lowest levenshtein to that
    if (archivables_in_cat.length === 1) {
        const c_name = archivables_in_cat[0].getName();
        if (c_name) lowest_levenshtein = levenshtein(name, c_name);
    }

    // sort by levenshtein and update lowest_levenshtein
    archivables_in_cat.sort((a, b) => {
        const a_name = a.getName();
        const b_name = b.getName();
        if (!a_name) return 1;
        if (!b_name) return -1;
        const lev_a = levenshtein(name, a_name);
        const lev_b = levenshtein(name, b_name);

        if (lev_a < lowest_levenshtein) lowest_levenshtein = lev_a;
        if (lev_b < lowest_levenshtein) lowest_levenshtein = lev_b;

        return lev_a - lev_b;
    });

    // if distance is < 3 -> similar
    if (lowest_levenshtein < 3) {
        return archivables_in_cat[0];
    }

    // else not similar
    return null;
}

