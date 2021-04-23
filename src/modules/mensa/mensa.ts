import axios from 'axios';
import { Client, Guild, MessageEmbed, TextChannel } from 'discord.js';
import { parseStringPromise } from 'xml2js';

import { days_de } from '../util/date';
import { Menu, MensaResult, Meal } from './mensa.d';

export const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '0️⃣'];

/**
 * retrieves a menu for the requested day and location
 */
export async function getMenu(location:string, date:Date):Promise<Menu> {
    let id: string;
    if (location === 'reichenhainer') {
        id = '1479835489';
    }
    else {
        id = '1';
    }
    const url = `https://www.swcz.de/bilderspeiseplan/xml.php?plan=${id}` +
        `&jahr=${date.getFullYear()}` +
        `&monat=${date.getMonth() + 1}` +
        `&tag=${date.getDate()}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result:MensaResult = await axios.get(url)
        .then(res => {
            return parseStringPromise(res.data);
        })
        .catch(err => {
            console.log(err);
            return undefined;
        });


    const menu: Menu = {
        meals: [],
        location: location === 'reichenhainer' ? 'Reichenhainer Straße' : 'Straße der Nationen',
        date,
    };

    if (!result.speiseplan.essen) {
        return menu;
    }

    for (let i = 0; i < result.speiseplan.essen.length; i++) {
        const cur_meal = result.speiseplan.essen[i];
        menu.meals.push({
            alcohol: cur_meal['$'].alkohol == 'true' ?
                true : false,

            beef: cur_meal['$'].rind == 'true' ?
                true : false,

            pork: cur_meal['$'].schwein == 'true' ?
                true : false,

            vegetarian: cur_meal['$'].vegetarisch == 'true' ?
                true : false,

            category: cur_meal['$'].kategorie ?
                cur_meal['$'].kategorie : undefined,

            img: cur_meal['$'].img == 'true' ? {
                img_big: cur_meal['$'].img_big,
                img_small: cur_meal['$'].img_small,
            } : undefined,

            description: cur_meal.deutsch[0] ?
                cur_meal.deutsch[0] : undefined,

            price: cur_meal.pr ? {
                student: Number(cur_meal.pr[0]._),
                staff: Number(cur_meal.pr[1]._),
                external: Number(cur_meal.pr[2]._),
            } : undefined,
        });
    }


    // move items without a price to the back
    for (let i = 0; i < menu.meals.length; i++) {
        if (!menu.meals[i].price) {
            menu.meals.push(menu.meals.splice(i, 1)[0]);
        }
    }

    return menu;
}

/**
 * compiles the description of a menu entry (price + descr)
 */
function compileDescription(meal:Meal): string {
    return `${meal.description ? meal.description.split(/\([\d,]*\)/).join('') : '\u200b'}` +
        `${meal.price ? `\n\`${meal.price.student.toFixed(2)}€\`` +
            `\n\`${meal.price.staff.toFixed(2)}€\`` +
            `\n\`${meal.price.external.toFixed(2)}€\`` : '\u200b'}`;
}

/**
 * renders a menu input into a formatted embed
 */
export function compileMenuEmbed(menu:Menu): MessageEmbed {
    if (menu.meals.length === 0) {
        return new MessageEmbed({
            title: `Menu, ${menu.location}, ${days_de[menu.date.getDay()]}, ${menu.date.toLocaleDateString()}`,
            description: 'Could not find a menu for that day.',
            color: '#FF0000',
        });
    }
    const embed = new MessageEmbed({
        title: `${menu.location}, ${days_de[menu.date.getDay()]}, ${menu.date.toLocaleDateString()}`,
        color: '#6A8A26',
    });

    for (let i = 0; i < menu.meals.length; i++) {
        embed.addField(
            `${numbers[i]} ${menu.meals[i].category}`,
            compileDescription(menu.meals[i]),
            true,
        );
    }

    return embed;
}

export async function autoMenu(client:Client, guild_id:string, channel_id:string, content?:string): Promise<void> {
    const r_menu = await getMenu('reichenhainer', new Date());
    const s_menu = await getMenu('strana', new Date());

    const embeds:MessageEmbed[] = [];
    if (r_menu.meals.length > 0) embeds.push(compileMenuEmbed(r_menu));
    if (s_menu.meals.length > 0) embeds.push(compileMenuEmbed(s_menu));

    if (embeds.length === 0) return;

    const channel = new TextChannel(new Guild(client, { id: guild_id }), { id: channel_id });
    for (let i = 0; i < embeds.length; i++) {
        channel.send(`${i === 0 ? content : ''}`, embeds[i]);
    }

}
