import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

import { compileMenuEmbed, getMenu, numbers } from '../../modules/mensa/mensa';
import levenshteinNormalize from '../../modules/util/levenshtein_normalize';
import { convertToDate } from '../../modules/util/date';
import location_levenshtein from './resources/location_levenshtein.json';

interface Args {
    location: string;
    day: string,
}

export default class MenuCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'menu',
            aliases: ['m', 'essen', 'e', 'speiseplan'],
            group: 'mensa',
            memberName: 'menu',
            description: 'Presents the meals that are available at the mensa',
            examples: ['menu reichenhainer today'],
            args: [
                {
                    key: 'location',
                    label: 'location',
                    prompt: 'Which venue\'s menu do you want to look at?',
                    default: 'reichenhainer',
                    type: 'string',
                },
                {
                    key: 'day',
                    label: 'day',
                    prompt: 'Which days menu do you want to look at?',
                    default: 'today',
                    type: 'string',
                },
            ],
        });
    }

    async run(msg: CommandoMessage, { location, day }: Args): Promise<Message> {
        console.log('>>> menu by', msg.author.tag);

        location = `${levenshteinNormalize(location, location_levenshtein)}`;

        const date = convertToDate(day);

        if (!date) {
            return msg.reply('Couldn\'t process your request.');
        }

        const menu = await getMenu(location, date);
        const embed = compileMenuEmbed(menu);
        const answer = await msg.reply(embed);

        for (let i = 0; i < menu.meals.length; i++) {
            answer.react(numbers[i]);
        }

        return answer;
    }
}
