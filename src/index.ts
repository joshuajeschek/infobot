import InfoBot from './modules/infobot.js';
import dotenv from 'dotenv';
dotenv.config();

import config from '../config.json';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CommandoClient = new InfoBot({
    owner: config.ids.owner,
    commandPrefix: config.prefix,
});
