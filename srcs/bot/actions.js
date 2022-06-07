const { bot } = require('./telegram');
const { notion, SUBSCRIBER_DB_ID } = require('./notion');

async function sendNotification(message) {
  // fetch subscribers
  const res = await notion.databases.query({ database_id: SUBSCRIBER_DB_ID });
  const subscribers = res.results;

  // handle no subscribers
  if (subscribers.length === 0) {
    console.error('Message not sent: there are 0 subscribers');
    return;
  }

  // send message to every subscriber
  subscribers.forEach((result) => {
    const chatId = result.properties.ChatID.rich_text[0].text.content;
    bot.telegram.sendMessage(chatId, message);
  });

  console.log(`Message was sent to ${subscribers.length} subscribers`);
}

module.exports = { sendNotification };
