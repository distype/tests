import { configDotenv } from '../dotenv';

import { Logger } from '@br88c/node-utils';
import { Button, ButtonStyle, ChatCommand, CommandHandler, Expire, MentionableSelect, MessageCommand, Modal, ModalTextFieldStyle, StringSelect, UserCommand } from '@distype/cmd';
import { Client } from 'distype';
import { setTimeout as wait } from 'node:timers/promises';
import { inspect } from 'node:util';

configDotenv();

const logger = new Logger({
    enabledOutput: { log: [`DEBUG`, `INFO`, `WARN`, `ERROR`] },
    sanitizeTokens: {
        replacement: `%bot_token%`, token: process.env.BOT_TOKEN!
    }
});

const client = new Client(process.env.BOT_TOKEN!, { gateway: { intents: `nonPrivileged` } }, logger.log, logger);

const commandHandler = new CommandHandler(client)
    .setError(async (ctx, error) => void await ctx.send(inspect(error)))
    .setMiddleware(async (ctx, meta) => {
        if (meta?.fail) {
            await ctx.send(`Failed in middleware!`);
            return false;
        } else {
            return true;
        }
    });

const command0 = new ChatCommand()
    .setName(`foo`)
    .setDescription(`Foo command`)
    .addStringOption(true, `bar`, `Describe bar`)
    .addUserOption(true, `baz`, `Which user is baz?`)
    .setExecute(async (ctx) => {
        await ctx.send(`\`\`\`js\n${inspect(ctx.options)}\n\`\`\``);
    });

const command1 = new ChatCommand()
    .setName(`error`)
    .setDescription(`This command throws an error!`)
    .setExecute(() => {
        throw new Error(`Oops! I threw an error`);
    });

const command2 = new ChatCommand()
    .setName(`middlewarefail`)
    .setDescription(`I fail in middleware!`)
    .setMiddlewareMeta({ fail: true })
    .setExecute(async (ctx) => {
        await ctx.send(`Uh oh, I didn't fail in middleware...`);
    });

const command3 = new ChatCommand()
    .setName(`defer`)
    .setDescription(`This command waits 10 seconds to send a response!`)
    .setExecute(async (ctx) => {
        await ctx.defer();
        await wait(10000);
        await ctx.send(`It worked!`);
    });

const command4 = new ChatCommand()
    .setName(`buttons`)
    .setDescription(`This command sends buttons!`)
    .setExecute(async (ctx) => {
        const firstButton = new Button()
            .setId(`foobutton0`)
            .setStyle(ButtonStyle.PRIMARY)
            .setLabel(`Click me! (I only work once!)`)
            .setExecute(async (ctx) => {
                await ctx.send(`Hello!`);
                firstButton.unbind(ctx.commandHandler);
            });

        const secondButton = new Button()
            .setId(`foobutton1`)
            .setStyle(ButtonStyle.PRIMARY)
            .setLabel(`Click me! (You can click me forever!)`)
            .setExecute(async (ctx) => {
                await ctx.send(`Hello!`);
            });

        const thirdButton = new Button()
            .setId(`foobutton2`)
            .setStyle(ButtonStyle.SUCCESS)
            .setLabel(`Edit this message after 5 seconds`)
            .setExecute(async (ctx) => {
                await ctx.editParentDefer();
                await wait(5000);
                await ctx.editParent(`Edited!`);
                secondButton.unbind(ctx.commandHandler);
            });

        await ctx.send(`Cool buttons below! (They expire after 10 seconds)`, [firstButton, secondButton, thirdButton]);

        new Expire([firstButton, secondButton, thirdButton], 10000, async () => {
            await ctx.edit(`@original`, `Oops! The buttons expired!`);
        }).bind(commandHandler);
    });

const command5 = new ChatCommand()
    .setName(`selects`)
    .setDescription(`This command sends select menus!`)
    .setExecute(async (ctx) => {
        const firstSelect = new StringSelect()
            .setId(`fooselect0`)
            .setPlaceholder(`Select a string!`)
            .addOption(`First`, `first`, `The first option`, { name: `😄` })
            .addOption(`Second`, `second`, `The second option`, { name: `🥶` })
            .addOption(`Third`, `third`, `The third option`, { name: `🐈` })
            .setExecute(async (ctx) => {
                await ctx.send(`\`\`\`js\n${inspect(ctx.options)}\n\`\`\``);
            });

        const secondSelect = new MentionableSelect()
            .setId(`fooselect1`)
            .setPlaceholder(`Select some mentionables!`)
            .setMinValues(1)
            .setMaxValues(3)
            .setExecute(async (ctx) => {
                await ctx.send(`\`\`\`js\n${inspect(ctx.options)}\n\`\`\``);
            });

        await ctx.send(`Try out these select menus!`, [firstSelect, secondSelect]);
        firstSelect.bind(ctx.commandHandler);
        secondSelect.bind(ctx.commandHandler);
    });

const command6 = new ChatCommand()
    .setName(`modal`)
    .setDescription(`This command opens up a modal!`)
    .setExecute(async (ctx) => {
        await ctx.showModal(new Modal()
            .setId(`foomodal`)
            .setTitle(`A cool modal!`)
            .addTextField(true, `field0`, `How are you?`, ModalTextFieldStyle.PARAGRAPH, { placeholder: `Doing great!` })
            .addTextField(false, `field1`, `A non-required field`, ModalTextFieldStyle.PARAGRAPH)
            .setExecute(async (ctx) => {
                await ctx.send(`This is how you said you were feeling:\n${ctx.fields.field0}\n\nThis was what you put in the non-required field:\n${ctx.fields.field1 ?? `\`nothing :(\``}`);
            }).bind(ctx.commandHandler)
        );
    });

const command7 = new MessageCommand()
    .setName(`Message Command`)
    .setExecute(async (ctx) => {
        await ctx.send(`\`\`\`js\n${inspect(ctx.target)}\n\`\`\``);
    });

const command8 = new UserCommand()
    .setName(`User Command`)
    .setExecute(async (ctx) => {
        await ctx.send(`\`\`\`js\n${inspect(ctx.target)}\n\`\`\``);
    });


client.gateway.on(`MANAGER_READY`, async () => {
    await commandHandler.pushCommands(command0, command1, command2, command3, command4, command5, command6, command7, command8);
});

client.gateway.connect();
