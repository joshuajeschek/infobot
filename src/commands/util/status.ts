import si from 'systeminformation';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

import status_embed from './resources/status-embed.json';
import { version, homepage, bugs } from '../../../package.json';

let osInfo: string;

/**
 * finds out on which os the bot is running
 * @returns nicely formatted os information
 */
async function getOsInfo() {
    if (!osInfo) {
        const info = await si.osInfo();
        osInfo =
            `Platform: ${info.platform}
            Distribution: ${info.distro}
            Release: ${info.release}`;
    }
    return osInfo;
}

/**
 * formats a milliseconds input to the format "W days X hours Y minutes Z days"
 * @param milliseconds uptime of the bot
 * @returns nicely formatted time information
 */
function convertUptime(milliseconds:number | null): string {
    if (milliseconds === null) {
        return 'N/A';
    }
    const seconds = Math.round((milliseconds / 1000) % 60);
    const minutes = Math.round((milliseconds / (1000 * 60)) % 60);
    const hours = Math.round((milliseconds / (1000 * 60 * 60)) % 24);
    const days = Math.round((milliseconds / (1000 * 60 * 60 * 24)) % 60);

    if (seconds + minutes + hours + days === 0) {
        return 'N/A';
    }

    return `${days != 0 ? `${days} ${days === 1 ? 'day' : 'days'}, ` : ''}` +
        `${hours != 0 ? `${hours} ${hours === 1 ? 'hour' : 'hours'}, ` : ''}` +
        `${minutes != 0 ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}, ` : ''}` +
        `${seconds != 0 ? `${seconds} ${seconds === 1 ? 'second' : 'seconds'}` : ''}`;
}

export default class StatusCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'status',
            aliases: ['st'],
            group: 'util',
            memberName: 'status',
            description: 'Get Information about the bots status, such as uptime and ping.',
            examples: ['status'],
        });
    }

    async run(msg: CommandoMessage): Promise<Message> {
        console.log('>>> status by', msg.author.tag);

        const ping = `${this.client.ws.ping ? `${Math.round(this.client.ws.ping)} ms` : 'N/A'}`;

        const embed = new MessageEmbed(status_embed)
            .addField('ping: ', ping)
            .addField('uptime: ', convertUptime(this.client.uptime))
            .addField('running on:', await getOsInfo())
            .addField('bot version:', version)
            .addField('GitHub:', homepage)
            .addField('report bugs and request features: ', bugs.url);

        return msg.reply(embed);
    }
}
