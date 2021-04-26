import { CronJob } from 'cron';
import { mongo } from './mongo';
import { Client } from 'discord.js';
import { autoMenu } from './mensa/mensa';
import { autoExecSchema } from '../schemas/autoexec-schema';

export interface AutoExec {
    guild_id: string,
    channel_id: string,
    type: 'menu',
    cron_expression: string,
    msg_content?: string,
}

/**
 * All currently active CronJobs (auto_execs)
 */
const auto_execs: Map<string, CronJob> = new Map();

/**
 * Sets an Autoexec for a guild in the database
 * refresh still needed!
 */
export async function setAutoExec(ae:AutoExec): Promise<boolean> {
    const result = await mongo().then(async (mongoose) => {
        try {
            return await autoExecSchema.findOneAndUpdate({
                guild_id: ae.guild_id,
                channel_id: ae.channel_id,
                type: ae.type,
            }, {
                guild_id: ae.guild_id,
                channel_id: ae.channel_id,
                type: ae.type,
                cron_expression: ae.cron_expression,
                msg_content: ae.msg_content,
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
 * Get all AutoExecs for a certain guild,
 * when no ID ist specified, all entries are returned.
 */
export async function getAutoExecs(guild_id?:string): Promise<AutoExec[]> {
    if (guild_id) {
        return await mongo().then(async (mongoose) => {
            try {
                return await autoExecSchema.find({
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
            return await autoExecSchema.find({});
        }
        finally {
            mongoose.connection.close();
        }
    });
}

/**
 * Deletes an AutoExec from the database
 */
export async function deleteAutoExec(guild_id:string, channel_id:string, type:string): Promise<boolean> {
    const result = await mongo().then(async (mongoose) => {
        try {
            return await autoExecSchema.findOneAndDelete({
                guild_id,
                channel_id,
                type,
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
 * Refresh a single AutoExec, or all (at startup)
 * can also stop a single ae (e.g. when deleted)
 */
export async function refreshAutoExecs(client:Client, ae?:AutoExec, stop?:boolean): Promise<void> {
    if (ae) {
        const old_job = auto_execs.get(ae.guild_id + ae.channel_id + ae.type);
        old_job?.stop();

        if (stop) return;

        const new_job = new CronJob(ae.cron_expression, () => autoMenu(client, ae.guild_id, ae.channel_id, ae.msg_content));
        new_job.start();

        auto_execs.set(ae.guild_id + ae.channel_id + ae.type, new_job);
        return;
    }

    const ae_s = await getAutoExecs();
    ae_s.forEach(entry => refreshAutoExecs(client, entry));
    return;
}
