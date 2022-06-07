const { Telegraf } = require('telegraf');
require('dotenv').config();

const { Client } = require('@notionhq/client');

// declaring constants
const { ENV } = process.env;
const SECRET = (ENV === 'dev') ? process.env.NOTION_SECRET_DEV : process.env.NOTION_SECRET;
const SUBSCRIBER_DB_ID = (ENV === 'dev') ? process.env.NOTION_SUBSCRIBER_DB_ID_DEV : process.env.NOTION_SUBSCRIBER_DB_ID;

// Initializing a client
const notion = new Client({ auth: SECRET });

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome to LS Machinery BOT!'));

bot.command('subscribe', async (ctx) => {
  // add chat_id to database
  try {
    // find if chat_id exists
    let resp = await notion.databases.query({
      database_id: SUBSCRIBER_DB_ID,
      filter: { property: 'ChatID', rich_text: { equals: ctx.chat.id.toString() } },
      page_size: 1,
    });

    // throw error if already exist
    if (resp.results.length > 0) throw new Error(`${ctx.chat.first_name} already subscribed`);

    // create subscriber with chat_id
    resp = await notion.pages.create({
      parent: { database_id: SUBSCRIBER_DB_ID },
      properties: {
        Name: { title: [{ text: { content: `${ctx.chat.first_name}${ctx.from.last_name ? ` ${ctx.from.last_name}` : ''}` } }] },
        Username: { rich_text: [{ text: { content: ctx.chat.username } }] },
        ChatID: { rich_text: [{ text: { content: ctx.chat.id.toString() } }] },
      },
    });
  } catch (error) {
    if (error.message.includes('already subscribed')) {
      ctx.reply('Already subscribed');
    } else {
      ctx.reply('Unable to subscribe at the moment');
    }
    return;
  }

  ctx.reply('You are now subscribed to the notifications! 🎉');
});

bot.command('unsubscribe', async (ctx) => {
  // remove chat_id from database
  try {
    // find if chat_id exists
    const resp = await notion.databases.query({
      database_id: SUBSCRIBER_DB_ID,
      filter: { property: 'ChatID', rich_text: { equals: ctx.chat.id.toString() } },
      page_size: 1,
    });

    // throw error if not exist
    if (resp.results.length < 1) throw new Error(`no subscribers found with chat_id of ${ctx.chat.id.toString()}`);

    // get the page_id and archive it
    const pageId = resp.results[0].id;
    notion.pages.update({ page_id: pageId, archived: true });
  } catch (error) {
    if (error.message.includes('no subscribers found')) {
      ctx.reply('You are not subscribed');
    } else {
      ctx.reply('Unable to unsubscribe, please try again later.');
    }
    return;
  }

  ctx.reply('You will stop receiving notifications.');
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
