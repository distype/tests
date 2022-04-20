import { config } from 'dotenv';

/**
 * Configures dotenv and checks to make sure variables are defined.
 */
export function configDotenv (): void {
    config();

    if (typeof process.env.BOT_TOKEN !== `string`) throw new Error(`BOT_TOKEN must be defined`);
    if (typeof process.env.TESTING_GUILD !== `string`) throw new Error(`TESTING_GUILD must be defined`);
    if (typeof process.env.TESTING_TEXT_CHANNEL !== `string`) throw new Error(`TESTING_GUILD must be defined`);
    if (typeof process.env.TESTING_VOICE_CHANNEL !== `string`) throw new Error(`TESTING_GUILD must be defined`);
}
