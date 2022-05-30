import { configDotenv } from '../dotenv';

import { Logger } from '@br88c/node-utils';
import { Cache, Gateway, Rest } from 'distype';
import { setTimeout as wait } from 'node:timers/promises';

configDotenv();

const logger = new Logger({
    enabledOutput: { log: [`DEBUG`, `INFO`, `WARN`, `ERROR`] },
    sanitizeTokens: {
        replacement: `%bot_token%`, token: process.env.BOT_TOKEN!
    }
});

const cache = new Cache({
    channels: [`name`, `type`],
    guilds: [`icon`, `name`, `owner_id`, `unavailable`],
    members: [`user`, `nick`, `joined_at`],
    presences: [`user`, `activities`],
    roles: [`color`, `hoist`, `name`, `permissions`],
    users: [`avatar`, `discriminator`, `username`],
    voiceStates: [`channel_id`, `member`, `mute`, `self_mute`]
}, logger.log, logger);

const rest = new Rest(process.env.BOT_TOKEN!, {}, logger.log, logger);
const gateway = new Gateway(process.env.BOT_TOKEN!, rest, cache, { intents: `all` }, logger.log, logger);

gateway.on(`SHARDS_RUNNING`, async () => {
    console.log(cache);

    await wait(10000);

    console.log(cache);

    logger.log(`Completed tests`);
});

gateway.connect();
