import { CategoryChannel, Message, TextChannel, VoiceState } from 'discord.js';
import { Command, CommandoClient, CommandoGuild, CommandoMessage } from 'discord.js-commando';
import def_settings from '../../modules/settings.json';
import Filter from 'bad-words';

interface Args {
    name: string,
}

/**
 * creates a voice channel,
 * deletes it after set amount of inactivity minutes
 */
async function createAutoVC(guild:CommandoGuild, cat:CategoryChannel, name:string, msg:Message): Promise<void> {
    const cooldown = guild.settings.get('auto_vc_cooldown', def_settings.auto_vc_cooldown);

    // create vc
    const vc = await guild.channels.create(name, {
        parent: cat,
        type: 'voice',
    });

    let last_disconnect = new Date().getTime();
    const confirmation = await msg.channel.send(`Created voicechannel ${vc}, which will self.destruct() after ${cooldown} minutes of inactivity`);

    // watches the channel
    const startCountdown = (prev_state?:VoiceState, cur_state?:VoiceState) => {
        if (!prev_state || !cur_state || prev_state.channel?.id === vc.id && cur_state.channel?.id != vc.id) {
            if (vc.members.size > 0) return; // still people in channel
            last_disconnect = new Date().getTime();

            setTimeout(async () => {
                if (vc.members.size != 0) return;
                const since_last_disconnect = new Date().getTime() - last_disconnect;

                if (since_last_disconnect >= cooldown * 60 * 1000) {
                    confirmation.edit(`Created voicechannel \`🔊${vc.name}\`, which has self.destructed() after ${cooldown} minutes of inactivity`);
                    vc.delete('inactivity');

                    guild.client.removeListener('voiceStateUpdate', startCountdown);
                    guild.client.setMaxListeners(guild.client.getMaxListeners() - 1);
                }
            }, cooldown * 60 * 1000);
        }
    };

    // start watching the channel
    guild.client.setMaxListeners(guild.client.getMaxListeners() + 1);
    guild.client.on('voiceStateUpdate', startCountdown);
    startCountdown();

    // join then leave again
    vc.join().then(() => setTimeout(() => {
        vc.leave();
    }, 5 * 1000));
}


export default class VoiceChannelCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'voicechannel',
            aliases: ['vc'],
            group: 'channels',
            memberName: 'voicechannel',
            description: 'Create a self-destructing voice channel, with a name you can choose',
            examples: ['voicechannel foobar'],
            guildOnly: true,
            args: [
                {
                    key: 'name',
                    label: 'name',
                    prompt: 'What should the voicechannel be called?',
                    type: 'string',
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { name }:Args): Promise<Message | null> {
        console.log('>>> voicehannel by', msg.author.tag);

        const cat = (msg.channel as TextChannel).parent;
        if (!cat) return msg.reply('not possible in an uncategorized channel');
        const auto_vc_enabled: [string] = msg.guild.settings.get('auto_vc_enabled', def_settings.protected.auto_vc_enabled);

        if (name === 'enable' && msg.guild.member(msg.author)?.hasPermission('MANAGE_CHANNELS')) {
            if (!auto_vc_enabled.includes(cat.id)) {
                auto_vc_enabled.push(cat.id);
                await msg.guild.settings.set('auto_vc_enabled', auto_vc_enabled);
                return msg.channel.send(`Enabled auto VoiceChats in ${cat}`);
            }
            return msg.channel.send(`Auto VoiceChats were already enabled in ${cat}`);
        }

        if (name === 'disable' && msg.guild.member(msg.author)?.hasPermission('MANAGE_CHANNELS')) {
            if (auto_vc_enabled.includes(cat.id)) {
                auto_vc_enabled.splice(auto_vc_enabled.indexOf(cat.id), 1);
                await msg.guild.settings.set('auto_vc_enabled', auto_vc_enabled);
                return msg.channel.send(`Disabled auto VoiceChats in ${cat}`);
            }
            return msg.channel.send(`Auto VoiceChats weren't enabled in ${cat}`);
        }

        if (!auto_vc_enabled.includes(cat.id)) {
            return msg.channel.send('This feature is not enabled in this category. Ask an admin to enable it for you.');
        }

        name = (new Filter().clean(name).substr(0, 96) + ' (⏳)');

        createAutoVC(msg.guild, cat, name, msg);
        return null;
    }
}
