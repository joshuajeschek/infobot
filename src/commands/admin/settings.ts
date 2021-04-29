import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import def_settings from '../../modules/settings.json';
import getConfirmation from '../../modules/util/confirmation';

interface Args {
    key: 'translatable-emoji',
    value: string | number | boolean,
}

export default class SettingsCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'settings',
            aliases: ['set'],
            group: 'admin',
            memberName: 'settings',
            description: 'Get / Set settings',
            examples: ['set translatable-emoji 🗣'],
            args: [
                {
                    key: 'key',
                    label: 'key',
                    prompt: 'Which setting would you like to change / see?',
                    type: 'string',
                    default: false,
                },
                {
                    key: 'value',
                    label: 'value',
                    prompt: 'What should the settings value be?',
                    type: 'string',
                    default: false,
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { key, value }: Args): Promise<Message | null> {
        console.log('>>> settings by', msg.author.tag);

        if (!key) {
            const embed = new MessageEmbed({ title: 'Current settings in this guild:', color: '#005F50' })
                .setTimestamp();
            for (const [ k, v ] of Object.entries(def_settings)) {
                embed.addField(k, await msg.guild.settings.get(k, v) || 'undefined');
            }
            return msg.channel.send(embed);
        }

        if (!(key in def_settings)) return msg.channel.send('That\'s not a valid key');

        if (!value) {
            const confirmation = await getConfirmation(msg, msg.author.id, `reset the setting \`${key}\` to \`${def_settings[key] || 'undefined'}\`?`);
            if (confirmation) {
                msg.guild.settings.remove(key);
            }
            return null;
        }

        if (typeof def_settings[key] == 'boolean') value = value === 'true' ? true : false;
        if (typeof def_settings[key] == 'number') {
            value = Number(value);
            if (isNaN(value)) return msg.channel.send('That\'s not a valid value!');
        }

        const confirmation = await getConfirmation(msg, msg.author.id, `set the setting \`${key}\` to \`${value}\`?`);
        if (!confirmation) return null;

        msg.guild.settings.set(key, value);
        msg.react('✅');

        return null;
    }
}
