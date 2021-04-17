import InfoBot from './modules/infobot.js';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CommandoClient = new InfoBot({
    owner: config.ids.owner,
    commandPrefix: config.prefix,
});
