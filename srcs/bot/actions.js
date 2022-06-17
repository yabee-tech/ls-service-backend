const { bot } = require('./telegram');
const { notion, SUBSCRIBER_DB_ID } = require('./notion');

function generateNewBookingMessage(raw) {
  const rawObj = JSON.parse(raw);
  const res = `
  ID: ${rawObj.id}
  Contact Number: ${rawObj.contact}
  Address: ${rawObj.raw.properties.Address.rich_text[0]?.text.content}
  Email: ${rawObj.raw.properties.Email?.email}
  Status: ${rawObj.raw.properties.Status?.select.name}
  SuggestedDate: ${rawObj.raw.properties.SuggestedDate.date?.start}
  ConfirmedDate: ${rawObj.raw.properties.ConfirmedDate.date?.start}
  `;

  return res;
}

async function generateNewRepairMessage(raw) {
  const rawObj = raw;
  let techUrl;
  let bookingUrl;

  if (rawObj.raw.properties.Technician) {
    techUrl = await notion.pages.retrieve(
      {
        page_id: rawObj.raw.properties.Technician.relation[0].id,
      },
    );
  }
  if (rawObj.raw.properties.Booking) {
    bookingUrl = await notion.pages.retrieve(
      { page_id: rawObj.raw.properties.Booking.relation[0].id },
    );
  }
  const res = `
  ID: ${rawObj.id}
  Technician: ${techUrl.url}
  Booking: ${bookingUrl.url}
  `;

  return res;
}

async function getSubscribers() {
  // fetch subscribers
  const res = await notion.databases.query({ database_id: SUBSCRIBER_DB_ID });
  const subscribers = res.results;

  // handle no subscribers
  if (subscribers.length === 0) {
    throw new Error('No subscribers found');
  }

  return subscribers;
}

async function sendNotification(message) {
  try {
    // fetch subscribers from Notion db
    const subscribers = await getSubscribers();

    // send message to every subscriber
    subscribers.forEach((result) => {
      if (result.properties.ChatID && result.properties.ChatID.rich_text) {
        const chatId = result.properties.ChatID.rich_text[0].text.content;
        bot.telegram.sendMessage(chatId, message);
      }
    });

    console.log(`Notification sent to ${subscribers.length} subscribers`);
  } catch (err) {
    console.error('Notification not sent: there are 0 subscribers');
  }
}

async function sendBookingConfirmedNotification(booking) {
  try {
    // fetch subscribers from Notion db
    const subscribers = await getSubscribers();

    // do something on each subscriber
    subscribers.forEach((result) => {
      if (result.properties.ChatID && result.properties.ChatID.rich_text) {
        const chatId = result.properties.ChatID.rich_text[0].text.content;
        // TODO: format this message
        bot.telegram.sendMessage(chatId, `Booking confirmed\n${generateNewBookingMessage(booking)}`);
      }
    });
  } catch (err) {
    console.error('Notification not sent: there are 0 subscribers');
  }
}

async function sendNewBookingNotification(booking) {
  try {
    // fetch subscribers from Notion db
    const subscribers = await getSubscribers();

    // do something on each subscriber
    subscribers.forEach((result) => {
      if (result.properties.ChatID && result.properties.ChatID.rich_text) {
        const chatId = result.properties.ChatID.rich_text[0].text.content;
        // TODO: format this message
        bot.telegram.sendMessage(chatId, `New booking\n${generateNewBookingMessage(booking)}`);
      }
    });
  } catch (err) {
    console.error('Notification not sent: there are 0 subscribers');
  }
}

async function sendRepairDoneNotification(repair) {
  const repairMsg = await generateNewRepairMessage(repair);
  try {
    // fetch subscribers from Notion db
    const subscribers = await getSubscribers();

    // do something on each subscriber
    subscribers.forEach((result) => {
      if (result.properties.ChatID && result.properties.ChatID.rich_text) {
        const chatId = result.properties.ChatID.rich_text[0].text.content;
        // TODO: format this message
        bot.telegram.sendMessage(chatId, repairMsg);
      }
    });
  } catch (err) {
    console.error('Notification not sent: there are 0 subscribers');
  }
}

module.exports = {
  sendNotification,
  sendBookingConfirmedNotification,
  sendNewBookingNotification,
  sendRepairDoneNotification,
};
