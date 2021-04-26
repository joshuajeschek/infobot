import InfoBot from './modules/infobot.js';
import { Intents } from 'discord.js';
import dotenv from 'dotenv';

/*
load .env file!
required values:
    - PROD_TOKEN
    - DEV_TOKEN
    - MONGO_IP
    - MONGO_PW
*/

dotenv.config();

import config from '../config.json';

new InfoBot({
    owner: config.ids.owner,
    commandPrefix: config.prefix,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'],
    ws: {
        intents: Intents.ALL,
    },
});
