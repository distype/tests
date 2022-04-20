import { configDotenv } from '../dotenv';

import { Logger, wait } from '@br88c/node-utils';
import { ChatCommand, CommandHandler, ContextMenuCommand, Modal } from '@distype/cmd';
import { Client } from 'distype';
import { inspect } from 'util';

configDotenv();

const logger = new Logger({
    enabledOutput: { log: [`DEBUG`, `INFO`, `WARN`, `ERROR`] },
    sanitizeTokens: {
        replacement: `%bot_token%`, token: process.env.BOT_TOKEN!
    }
});

const client = new Client(process.env.BOT_TOKEN!, { gateway: { intents: `nonPrivileged` } }, logger.log, logger);

const commandHandler = new CommandHandler(client, logger.log, logger)
    .add(new ChatCommand()
        .setName(`foo`)
        .setDescription(`Foo command`)
        .addStringParameter(true, `bar`, `Describe bar`)
        .addUserParameter(true, `baz`, `Which user is baz?`)
        .setExecute(async (ctx) => {
            await ctx.send(`\`\`\`js\n${inspect(ctx.parameters)}\n\`\`\``);
        })
    )
    .add(new ChatCommand()
        .setName(`error`)
        .setDescription(`This command throws an error!`)
        .setExecute(() => {
            throw new Error(`Oops! I threw an error`);
        })
    )
    .add(new ChatCommand()
        .setName(`defer`)
        .setDescription(`This command waits 10 seconds to send a response!`)
        .setExecute(async (ctx) => {
            await ctx.defer();
            await wait(10000);
            await ctx.send(`It worked!`);
        })
    )
    .add(new ChatCommand()
        .setName(`modal`)
        .setDescription(`This command opens up a modal!`)
        .setExecute(async (ctx) => {
            await ctx.showModal(new Modal()
                .setId(`foobar`)
                .setTitle(`A cool modal!`)
                .addField(true, `field0`, `How are you?`, `paragraph`, { placeholder: `Doing great!` })
                .addField(false, `field1`, `A non-required field`, `short`)
                .setExecute(async (ctx) => {
                    await ctx.send(`This is how you said you were feeling:\n${ctx.parameters.field0}\n\nThis was what you put in the non-required field:\n${ctx.parameters.field1 ?? `\`nothing :(\``}`);
                })
            );
            await ctx.send({
                content: `This is a message after the modal was opened`,
                flags: 64
            });
        })
    )
    .add(new ContextMenuCommand()
        .setType(`message`)
        .setName(`Message Command`)
        .setExecute(async (ctx) => {
            await ctx.send(`\`\`\`js\n${inspect(ctx.target)}\n\`\`\``);
        })
    )
    .add(new ContextMenuCommand()
        .setType(`user`)
        .setName(`User Command`)
        .setExecute(async (ctx) => {
            await ctx.send(`\`\`\`js\n${inspect(ctx.target)}\n\`\`\``);
        })
    );

client.gateway.on(`SHARDS_READY`, () => {
    commandHandler.push();
});

client.gateway.connect();


