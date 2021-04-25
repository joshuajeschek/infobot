import { Emoji, Message, MessageEmbed, MessageReaction, Role, TextChannel, User } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteReactionRole, getReactionRole, refreshReactionRoles, setReactionRole } from '../../modules/reactionroles/reactionrolemanager';
import { ReactionRoleData } from '../../modules/reactionroles/reactionroles';

interface Args {
    channel: TextChannel,
    message: Message,
    role: Role,
    reaction: Emoji,
}

/**
 * asks the user for confirmation on something, bound to a message
 */
async function getConfirmation(msg:Message, prompt:string): Promise<boolean> {
    const filter = (r:MessageReaction, u:User) => {
        return u.equals(msg.author) && ['✅', '❌'].includes(r.emoji.toString());
    };
    const decider = await msg.reply(prompt);
    decider.react('✅');
    decider.react('❌');

    const collector = decider.createReactionCollector(filter, { time: 30 * 1000 });
    return new Promise((resolve, reject) => {
        collector.on('collect', r => {
            if (r.emoji.toString() === '✅') {
                collector.stop('confirm');
                msg.react('✅');
                resolve(true);
            }
            else { resolve(false); }
        });
        collector.on('end', (_, reason) => {
            if (reason != 'confirm') {
                msg.react('❌');
            }
        });
        setTimeout(() => {
            reject('Timeout');
        }, 60 * 1000);
    });
}

export default class ReactionRoleCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'reactionrole',
            aliases: ['rr'],
            group: 'admin',
            memberName: 'reactionrole',
            description: 'Create reaction roles, bound to messages',
            examples: ['reactionrole #getroles 53917 @happy 😀'],
            userPermissions: ['ADMINISTRATOR'],
            args: [
                {
                    key: 'channel',
                    label: 'channel',
                    prompt: 'In which channel should the reaction role be created / deleted',
                    type: 'text-channel',
                    default: false,
                },
                {
                    key: 'message',
                    label: 'message',
                    prompt: 'To which message does the reaction role belong?',
                    type: 'message',
                    default: false,
                },
                {
                    key: 'role',
                    label: 'role',
                    prompt: 'Which role should be given?',
                    type: 'role',
                    default: false,
                },
                {
                    key: 'reaction',
                    label: 'reaction',
                    prompt: 'What should the emoji be?',
                    type: 'default-emoji|custom-emoji',
                    default: false,
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { channel, message, role, reaction }:Args): Promise<Message | null> {
        console.log('>>> reactionrole by', msg.author.tag);

        /* LIST ALL */
        if (!channel) {
            const result = await getReactionRole(msg.guild.id);
            const embed = new MessageEmbed({ title: 'Currently active ReactionRoles:' });
            result.forEach(rr => {
                embed.addField(rr.message_id,
                    `${msg.guild.channels.resolve(rr.channel_id)}: ` +
                    `${rr.role_id ? msg.guild.roles.resolve(rr.role_id) : 'unknown role'} - ` +
                    `${rr.emoji ? (rr.emoji?.length === 18 ? msg.guild.emojis.resolve(rr.emoji) : rr.emoji) : 'unknown emoji'}`);
            });
            if (result.length === 0) embed.setDescription('no active reaction roles found.');
            msg.channel.send(embed);
            return null;
        }
        if (!message) {
            /* DELETE ALL OF CHANNEL */
            const choice = await getConfirmation(msg, `Delete all reaction roles in ${channel}?`)
                .catch(err => console.log(err));
            if (choice) {
                const success = await deleteReactionRole(msg.guild.id, channel.id);
                if (success) {
                    refreshReactionRoles(this.client,
                        { guild_id: msg.guild.id, channel_id: channel.id }, true);
                    msg.react('✅');
                }
                return null;
            }
            msg.react('❌');
            return null;
        }
        if (!role) {
            /* DELETE ALL REACTIONROLES OF MESSAGE */
            const choice = await getConfirmation(msg, `Delete all reaction roles of message ${message.id} in ${channel}?`)
                .catch(err => console.log(err));
            if (choice) {
                const success = await deleteReactionRole(msg.guild.id, channel.id, message.id);
                if (success) {
                    refreshReactionRoles(this.client,
                        { guild_id: msg.guild.id, channel_id: channel.id, message_id: message.id }, true);
                    msg.react('✅');
                }
                return null;
            }
            msg.react('❌');
            return null;
        }
        if (!reaction) {
            /* DELETE  REACTIONROLE */
            const choice = await getConfirmation(msg, `Delete reaction role ${role} of message ${message.id} in ${channel}?`)
                .catch(err => console.log(err));
            if (choice) {
                const success = await deleteReactionRole(msg.guild.id, channel.id, message.id, role.id);
                if (success) {
                    refreshReactionRoles(this.client,
                        { guild_id: msg.guild.id, channel_id: channel.id, message_id: message.id, role_id: role.id }, true);
                    msg.react('✅');
                }
                return null;
            }
            msg.react('❌');
            return null;
        }

        const rr_data: ReactionRoleData = {
            guild_id: msg.guild.id,
            channel_id: channel.id,
            message_id: message.id,
            emoji: reaction.id ? reaction.id : reaction.toString(),
            role_id: role.id,
        };

        const success = await setReactionRole(rr_data);
        if (success) {
            msg.react('✅');
            refreshReactionRoles(this.client, rr_data);
            return null;
        }

        msg.react('❌');
        return null;
    }
}
