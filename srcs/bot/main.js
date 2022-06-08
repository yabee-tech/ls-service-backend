const { subscribe, unsubscribe } = require('./commands');
const { bot } = require('./telegram');

// welcome message
bot.start((ctx) => ctx.reply('👏🏽 Welcome to LS Machinery BOT!'));

// register commands
bot.command('subscribe', subscribe);
bot.command('unsubscribe', unsubscribe);

// start the bot
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
