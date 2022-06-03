const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply('Welcome to LS Machinery BOT!'));
bot.command('subscribe', (ctx) => {
  // add chat_id to database

  ctx.reply('You are subscribed to the notifications! 🎉');
});
bot.command('unsubscribe', (ctx) => {
  // remove chat_id from database

  ctx.reply('You will stop receiving notifications.');
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
