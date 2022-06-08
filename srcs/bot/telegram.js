const { Telegraf } = require('telegraf');
require('dotenv').config();

// processing environment variables
const { ENV } = process.env;
const TELEGRAM_BOT_TOKEN = (ENV === 'dev') ? process.env.BOT_TOKEN_DEV : process.env.BOT_TOKEN;

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

module.exports = { bot };
