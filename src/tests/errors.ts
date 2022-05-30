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

const client = new Client(process.env.BOT_TOKEN!, { gateway: { intents: `nonPrivileged` } }, logger.log, logger);

client.gateway.on(`SHARDS_RUNNING`, async () => {
    await wait(5000);

    // @ts-expect-error Invalid opcode
    await client.gateway.shards.get(0)?.send({ op: 100 });

    await wait(5000);

    // @ts-expect-error Invalid ID, invalid content
    await client.rest.createMessage(`Not an ID!`, { content: [`this isn't content!`] }).catch(() => {});

    await wait(5000);

    client.gateway.shards.get(0)?.kill();

    logger.log(`Completed Tests`);
});

client.gateway.connect();
