import { Message, MessageReaction, User } from 'discord.js';

/**
 * asks the user for confirmation on something, bound to a message
 */
export default async function getConfirmation(msg:Message, prompt:string): Promise<boolean> {
    const filter = (r:MessageReaction, u:User) => {
        return u.equals(msg.author) && ['✅', '❌'].includes(r.emoji.toString());
    };
    const decider = await msg.reply(prompt);
    decider.react('✅');
    decider.react('❌');

    const collector = decider.createReactionCollector(filter, { time: 30 * 1000 });
    return new Promise((resolve) => {
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
            resolve(true);
        }, 60 * 1000);
    });
}
