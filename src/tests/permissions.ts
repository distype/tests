import { configDotenv } from '../dotenv';

import { Logger } from '@br88c/node-utils';
import { Client, PermissionsUtils } from 'distype';
import { setTimeout as wait } from 'node:timers/promises';

configDotenv();

const logger = new Logger({
    enabledOutput: { log: [`DEBUG`, `INFO`, `WARN`, `ERROR`] },
    sanitizeTokens: {
        replacement: `%bot_token%`, token: process.env.BOT_TOKEN!
    }
});

const client = new Client(process.env.BOT_TOKEN!, {
    cache: {
        channels: [`permission_overwrites`],
        guilds: [`owner_id`, `roles`],
        members: [`communication_disabled_until`, `roles`],
        roles: [`permissions`]
    },
    gateway: { intents: `nonPrivileged` }
}, logger.log, logger);

client.gateway.on(`MANAGER_READY`, async () => {
    await wait(5000);
    console.log(PermissionsUtils.toReadable(await client.getSelfPermissions(process.env.TESTING_GUILD!, process.env.TESTING_TEXT_CHANNEL!)));
});

client.gateway.connect();
