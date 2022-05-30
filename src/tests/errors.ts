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

    // Invalid ID
    await client.rest.createMessage(`Not an ID!`, { content: `some content` }).catch(console.log);

    await wait(5000);

    // @ts-expect-error Invalid content
    await client.rest.createMessage(process.env.TESTING_TEXT_CHANNEL, { content: [`this isn't content!`] }).catch(console.log);

    await wait(5000);

    client.gateway.shards.get(0)?.kill();

    logger.log(`Completed Tests`);
});

client.gateway.connect();
