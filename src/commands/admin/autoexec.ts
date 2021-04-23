import { parseExpression } from 'cron-parser';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Channel, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
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

        // LIST ALL AUTO EXECS IN GUILD
        if (!channel) {
            const result = await getAutoExecs(msg.guild.id);
            const embed = new MessageEmbed({ title: 'Currently active autoexecs: ' });
            result.forEach(ae => {
                embed.addField(msg.guild.channels.resolve(ae.channel_id)?.name,
                    `${ae.type}: ${ae.cron_expression} ${ae.msg_content ? `(${ae.msg_content})` : ''}`);
            });
            return msg.reply(embed);
        }

        // TYPE RECOGINITION
        if (!type) {
            return msg.reply('Please provide a type');
        }
        if (type != 'menu') {
            return msg.reply('Type not recognized');
        }

        // DELETE AUTO EXEC
        if (!cron_expression) {
            const filter = (reaction:MessageReaction, user:User) => {
                return ['✅', '❌'].includes(reaction.emoji.name) && user.id === msg.author.id;
            };

            const decider_msg = await msg.reply(`Disable the auto exec ${type} in the channel ${channel}? React with the corresponding emoji.`);
            decider_msg.react('✅');
            decider_msg.react('❌');

            const collector = decider_msg.createReactionCollector(filter, { time: 30 * 6 * 1000 });

            collector.on('collect', async (reaction) => {
                if (reaction.emoji.name === '❌') {
                    collector.stop('abort');
                }
                else {
                    collector.stop('confirm');
                    const success = await deleteAutoExec(msg.guild.id, channel.id, type);
                    if (success) {
                        refreshAutoExecs(this.client, { guild_id: msg.guild.id, channel_id: channel.id, type, cron_expression: '' }, true);
                        msg.react('✅');
                    }
                    else {msg.react('❌');}
                }
            });

            collector.on('end', (_, reason) => {
                if (reason != 'confirm') msg.react('❌');
            });

            return null;
        }

        // CHECK IF CRON IS VALID
        let parsed_cron;
        try { parsed_cron = parseExpression(cron_expression); }
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
            msg.react('✅');
            refreshAutoExecs(this.client, autoexec);
            return msg.channel.send('Next execution: ' + parsed_cron.next().toISOString());
        }

        msg.react('❌');
        return null;
    }
}
