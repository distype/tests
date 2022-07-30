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

const client = new Client(process.env.BOT_TOKEN!, { gateway: {
    intents: `nonPrivileged`,
    sharding: { shards: 1 }
} }, logger.log, logger);

client.gateway.on(`MANAGER_READY`, async () => {
    await wait(5000);

    // @ts-expect-error Invalid opcode
    await client.gateway.shards.first()?.send({ op: 100 });

    await wait(5000);

    await client.gateway.shards.first()?.send({
        op: 2,
        d: {
            intents: 0,
            properties: {
                browser: `distype`,
                device: `distype`,
                os: process.platform
            },
            shard: [0, client.gateway.shards.first()!.numShards],
            token: `haha`
        }
    });

    await wait(5000);

    // Invalid ID
    await client.rest.createMessage(`Not an ID!`, { content: `some content` }).catch(console.log);

    await wait(5000);

    // @ts-expect-error Invalid content
    await client.rest.createMessage(process.env.TESTING_TEXT_CHANNEL, { content: [`this isn't content!`] }).catch(console.log);

    await wait(5000);

    logger.log(`Ping before kill: ${await client.gateway.getAveragePing()}ms`);
    client.gateway.shards.first()?.kill();

    logger.log(`Completed Tests`);
});

client.gateway.connect();
