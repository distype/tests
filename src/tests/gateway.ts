import { configDotenv } from '../dotenv';

import { Logger } from '@br88c/node-utils';
import { Gateway, Rest } from 'distype';
import { setTimeout as wait } from 'node:timers/promises';

configDotenv();

const logger = new Logger({
    enabledOutput: { log: [`DEBUG`, `INFO`, `WARN`, `ERROR`] },
    sanitizeTokens: {
        replacement: `%bot_token%`, token: process.env.BOT_TOKEN!
    }
});
const rest = new Rest(process.env.BOT_TOKEN!, {}, logger.log, logger);

const gateway = new Gateway(process.env.BOT_TOKEN!, rest, false, { intents: `nonPrivileged` }, logger.log, logger);

gateway.once(`MANAGER_READY`, async () => {
    console.log(gateway.guildCount);

    await gateway.updatePresence({
        activities: [
            {
                name: `Testing`,
                type: 0
            }
        ],
        afk: false,
        since: null,
        status: `online`
    });


    await gateway.updateVoiceState(process.env.TESTING_GUILD!, process.env.TESTING_VOICE_CHANNEL!);

    await wait(60000);

    logger.log(`Ping before kill: ${await gateway.getAveragePing()}ms`);

    gateway.shards.first()?.kill();

    logger.log(`Completed Tests`);
});

gateway.connect();
