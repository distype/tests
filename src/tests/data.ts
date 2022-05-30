import { configDotenv } from '../dotenv';

import { Logger } from '@br88c/node-utils';
import { Client } from 'distype';
import { setTimeout as wait } from 'node:timers/promises';

configDotenv();

const logger = new Logger({
    enabledOutput: { log: [`DEBUG`, `INFO`, `WARN`, `ERROR`] },
    sanitizeTokens: {
        replacement: `%bot_token%`, token: process.env.BOT_TOKEN!
    }
});

const client = new Client(process.env.BOT_TOKEN!, {
    cache: { channels: [`name`, `permission_overwrites`] },
    gateway: { intents: `nonPrivileged` }
}, logger.log, logger);

client.gateway.on(`SHARDS_RUNNING`, async () => {
    await wait(5000);
    console.log(await client.getChannelData(process.env.TESTING_TEXT_CHANNEL!, `id`, `name`, `permission_overwrites`));
    console.log(await client.getGuildData(process.env.TESTING_GUILD!, `id`, `name`, `owner_id`));
});

client.gateway.connect();
