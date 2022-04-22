import { configDotenv } from '../dotenv';

import { Logger, wait } from '@br88c/node-utils';
import { Button, ButtonStyle, ChatCommand, CommandHandler, ContextMenuCommand, Modal } from '@distype/cmd';
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
    .setButtonMiddleware((ctx) => {
        logger.log(`Got an interaction for button ${ctx.component.customId}`);
        return true;
    })
    .setChatCommandMiddleware((ctx) => {
        logger.log(`Got an interaction for chat command ${ctx.command.name}`);
        if (ctx.command.name === `middlewarefail`) return false;
        else return true;
    })
    .setContextMenuCommandMiddleware((ctx) => {
        logger.log(`Got an interaction for context menu command ${ctx.command.name}`);
        return true;
    })
    .setModalMiddleware((ctx) => {
        logger.log(`Got an interaction for modal ${ctx.modal.customId}`);
        return true;
    })
    .bindCommand(new ChatCommand()
        .setName(`foo`)
        .setDescription(`Foo command`)
        .addStringParameter(true, `bar`, `Describe bar`)
        .addUserParameter(true, `baz`, `Which user is baz?`)
        .setExecute(async (ctx) => {
            await ctx.send(`\`\`\`js\n${inspect(ctx.parameters)}\n\`\`\``);
        })
    )
    .bindCommand(new ChatCommand()
        .setName(`error`)
        .setDescription(`This command throws an error!`)
        .setExecute(() => {
            throw new Error(`Oops! I threw an error`);
        })
    )
    .bindCommand(new ChatCommand()
        .setName(`defer`)
        .setDescription(`This command waits 10 seconds to send a response!`)
        .setExecute(async (ctx) => {
            await ctx.defer();
            await wait(10000);
            await ctx.send(`It worked!`);
        })
    )
    .bindCommand(new ChatCommand()
        .setName(`buttons`)
        .setDescription(`This command sends buttons!`)
        .setExecute(async (ctx) => {
            const firstButton = new Button()
                .setId(`foobutton0`)
                .setStyle(ButtonStyle.PRIMARY)
                .setLabel(`Click me! (I only work once!)`)
                .setExecute(async (ctx) => {
                    await ctx.send(`Hello!`);
                    ctx.unbind();
                });

            const secondButton = new Button()
                .setId(`foobutton1`)
                .setStyle(ButtonStyle.SECONDARY)
                .setLabel(`Click for more buttons!`)
                .setExecute(async (ctx) => {
                    const anotherButton = new Button()
                        .setURL(`https://github.com/distype/cmd`)
                        .setStyle(ButtonStyle.LINK)
                        .setLabel(`Check out this link!`);

                    await ctx.send(`Here are some more buttons!`, new Array(5).fill(new Array(5).fill(anotherButton)));
                });

            const thirdButton = new Button()
                .setId(`foobutton2`)
                .setStyle(ButtonStyle.SUCCESS)
                .setLabel(`Edit this message after 10 seconds`)
                .setExecute(async (ctx) => {
                    await ctx.editParentDefer();
                    await wait(10000);
                    await ctx.editParent(`Edited!`);
                    ctx.unbind();
                });

            await ctx.send(`Cool buttons below!`, [firstButton, secondButton, thirdButton]);

            ctx.commandHandler.bindButton(firstButton);
            ctx.commandHandler.bindButton(secondButton);
            ctx.commandHandler.bindButton(thirdButton);
        })
    )
    .bindCommand(new ChatCommand()
        .setName(`modal`)
        .setDescription(`This command opens up a modal!`)
        .setExecute(async (ctx) => {
            await ctx.showModal(new Modal()
                .setId(`foomodal`)
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
    .bindCommand(new ChatCommand()
        .setName(`middlewarefail`)
        .setDescription(`I fail in middleware!`)
        .setExecute(async (ctx) => {
            await ctx.send(`Uh oh, I didn't fail in middleware...`);
        })
    )
    .bindCommand(new ContextMenuCommand()
        .setType(`message`)
        .setName(`Message Command`)
        .setExecute(async (ctx) => {
            await ctx.send(`\`\`\`js\n${inspect(ctx.target)}\n\`\`\``);
        })
    )
    .bindCommand(new ContextMenuCommand()
        .setType(`user`)
        .setName(`User Command`)
        .setExecute(async (ctx) => {
            await ctx.send(`\`\`\`js\n${inspect(ctx.target.user)}\n\`\`\``);
        })
    );

client.gateway.on(`SHARDS_READY`, () => {
    commandHandler.push();
});

client.gateway.connect();
