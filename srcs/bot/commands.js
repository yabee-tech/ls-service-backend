const { notion, SUBSCRIBER_DB_ID } = require('./notion');
const { generateFilter } = require('../server/utils/utils');
const Subscriber = require('./models/Subscriber');

// subscribe a user to the notifications
async function subscribe(ctx) {
  // send a message to client
  const msg = await ctx.reply('🔄 Subscribing to notifications...');

  // add chat_id to database
  try {
    // find if chat_id exists
    let resp = await notion.databases.query({
      database_id: SUBSCRIBER_DB_ID,
      filter: generateFilter(Subscriber.fields, ctx.chat.id.toString(), 'ChatID'),
      page_size: 1,
    });

    // throw error if already exist
    if (resp.results.length > 0) throw new Error(`${ctx.chat.first_name} already subscribed`);

    // create subscriber with chat_id
    const model = Subscriber;
    model.setName = `${ctx.chat.first_name}${ctx.from.last_name ? ` ${ctx.from.last_name}` : ''}`;
    model.setUsername = ctx.chat.username;
    model.setChatID = ctx.chat.id.toString();
    resp = await notion.pages.create({
      parent: { database_id: SUBSCRIBER_DB_ID },
      properties: model.model,
    });

    // tell user it is done
    ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '🎉 You are now subscribed to notifications!');
  } catch (error) {
    if (error.message.includes('already subscribed')) {
      ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '⚠️ Already subscribed');
    } else {
      ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '⛔ Unable to subscribe at the moment');
    }
  }
}

// unsubscribe a user from the notifications
async function unsubscribe(ctx) {
  // send a message to client
  const msg = await ctx.reply('🔄 Unsubscribing from notifications...');

  // remove chat_id from database
  try {
    // find if chat_id exists
    const resp = await notion.databases.query({
      database_id: SUBSCRIBER_DB_ID,
      filter: generateFilter(Subscriber.fields, ctx.chat.id.toString(), 'ChatID'),
      page_size: 1,
    });

    // throw error if not exist
    if (resp.results.length < 1) throw new Error(`no subscribers found with chat_id of ${ctx.chat.id.toString()}`);

    // get the page_id and archive it
    const pageId = resp.results[0].id;
    await notion.pages.update({ page_id: pageId, archived: true });

    // tell user it is done
    ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '🔇 You will now stop receiving notifications');
  } catch (error) {
    if (error.message.includes('no subscribers found')) {
      ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '⚠️ You are not subscribed');
    } else {
      ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '🚫 Unable to unsubscribe, please try again later');
    }
  }
}

module.exports = { subscribe, unsubscribe };
