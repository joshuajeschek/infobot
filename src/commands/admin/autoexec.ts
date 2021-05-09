import { time } from 'cron';
import { Channel, Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

import getConfirmation from '../../modules/util/confirmation';
import { AutoExec, deleteAutoExec, getAutoExecs, refreshAutoExecs, setAutoExec } from '../../modules/autoexecmanager';

interface Args {
    channel: Channel | false,
    type: string | false,
    cron_expression: string | false,
    content: string | false,
}

export default class AutoExecCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'autoexec',
            aliases: ['ae'],
            group: 'admin',
            memberName: 'autoexec',
            description: 'Registers / deletes / lists autoexec jobs',
            examples: ['autoexec #general menu "5 4 * * sun" This is the menu:'],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    label: 'channel',
                    prompt: 'Which channel should the autoexec be in?',
                    type: 'channel',
                    default: false,
                },
                {
                    key: 'type',
                    label: 'type',
                    prompt: 'Which type should the autoexec be? (menu)',
                    type: 'string',
                    default: false,
                },
                {
                    key: 'cron_expression',
                    label: 'cron',
                    prompt: 'When should it be executed? Check out https://crontab.guru/!',
                    type: 'string',
                    default: false,
                },
                {
                    key: 'content',
                    label: 'content',
                    prompt: 'What should the message say additionally?',
                    type: 'string',
                    default: false,
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { channel, type, cron_expression, content }:Args): Promise<Message | null> {
        console.log('>>> autoexec by', msg.author.tag);

        // #region LIST ALL
        if (!channel) {
            const result = await getAutoExecs(msg.guild.id);
            const embed = new MessageEmbed({ title: 'Currently active autoexecs: ' });
            result.forEach(ae => {
                embed.addField(msg.guild.channels.resolve(ae.channel_id)?.name,
                    `${ae.type}: ${ae.cron_expression} ${ae.msg_content ? `(${ae.msg_content})` : ''}`);
            });
            return msg.reply(embed);
        }
        // #endregion LIST ALL

        // TYPE RECOGINITION
        if (!type) {
            return msg.reply('Please provide a type');
        }
        if (type != 'menu') {
            return msg.reply('Type not recognized');
        }

        // #region DELETE
        if (!cron_expression) {
            const confimation = await getConfirmation(msg, msg.author.id, `disable the auto exec ${type} in the channel ${channel}?`);

            if (confimation) {
                const success = await deleteAutoExec(msg.guild.id, channel.id, type);
                if (success) {
                    refreshAutoExecs(this.client, { guild_id: msg.guild.id, channel_id: channel.id, type, cron_expression: '' }, true);
                    msg.react('✅');
                }
                else {msg.react('❌');}
                return null;
            }

            msg.react('❌');
            return null;
        }
        // #endregion DELETE

        // CHECK IF CRON IS VALID
        try { time(cron_expression); }
        catch (err) {
            console.log(err);
            return msg.reply('Couldn\'t parse the cron expression. Please take a look at https://crontab.guru/');
        }

        const autoexec:AutoExec = {
            guild_id: msg.guild.id,
            channel_id: channel.id,
            type,
            cron_expression,
            msg_content: content ? content : undefined,
        };

        const success = await setAutoExec(autoexec);
        if (success) {
            const next_dates = await refreshAutoExecs(this.client, autoexec);
            if (!next_dates) return msg.channel.send('Next runtime could not be parsed.');

            msg.react('✅');

            let next_dates_string = '';
            next_dates.forEach(date => {
                next_dates_string += '\t' + date.toLocaleString() + '\n';
            });

            return msg.channel.send('Next runtimes:\n' + next_dates_string);
        }

        msg.react('❌');
        return null;
    }
}
