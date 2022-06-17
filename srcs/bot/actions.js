const { bot } = require('./telegram');
const { notion, SUBSCRIBER_DB_ID } = require('./notion');
const { twilio, TWILIO_MESSAGING_SERVICE_SID } = require('./twilio');
const { getFormattedPhoneNumber } = require('./utils');

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

async function sendSMSNotification(phoneNumber, message) {
  // send SMS message with twilio
  const { errorCode, errorMessage } = await twilio
    .messages
    .create({
      messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
      to: getFormattedPhoneNumber(phoneNumber),
      body: message,
    });

  // handle the error returned
  if (errorCode && errorMessage) {
    console.error(`Notification not sent: failed to send SMS on twilio, Code (${errorCode}) - ${errorMessage}`);
  } else {
    console.log(`SMS sent to ${phoneNumber}`);
  }
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
      } else {
        console.log(result.properties);
        throw new Error('subscriber has no ChatID');
      }
    });

    console.log(`Notification sent to ${subscribers.length} subscribers`);
  } catch (err) {
    if (err.message.includes('ChatID')) {
      console.error('Notification not sent: subscriber has no ChatID');
    } else {
      console.error('Notification not sent: there are 0 subscribers');
    }
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
        bot.telegram.sendMessage(chatId, JSON.stringify(booking));
      } else {
        console.log(result.properties);
        throw new Error('subscriber has no ChatID');
      }
    });
  } catch (err) {
    if (err.message.includes('ChatID')) {
      console.error('Notification not sent: subscriber has no ChatID');
    } else {
      console.error('Notification not sent: there are 0 subscribers');
    }
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
        bot.telegram.sendMessage(chatId, JSON.stringify(booking));
      } else {
        console.log(result.properties);
        throw new Error('subscriber has no ChatID');
      }
    });
  } catch (err) {
    if (err.message.includes('ChatID')) {
      console.error('Notification not sent: subscriber has no ChatID');
    } else {
      console.error('Notification not sent: there are 0 subscribers');
    }
  }
}

async function sendRepairDoneNotification(repair) {
  try {
    // fetch subscribers from Notion db
    const subscribers = await getSubscribers();

    // do something on each subscriber
    subscribers.forEach((result) => {
      if (result.properties.ChatID && result.properties.ChatID.rich_text) {
        const chatId = result.properties.ChatID.rich_text[0].text.content;
        // TODO: format this message
        bot.telegram.sendMessage(chatId, JSON.stringify(repair));
      } else {
        console.log(result.properties);
        throw new Error('subscriber has no ChatID');
      }
    });
  } catch (err) {
    if (err.message.includes('ChatID')) {
      console.error('Notification not sent: subscriber has no ChatID');
    } else {
      console.error('Notification not sent: there are 0 subscribers');
    }
  }
}

module.exports = {
  sendSMSNotification,
  sendNotification,
  sendBookingConfirmedNotification,
  sendNewBookingNotification,
  sendRepairDoneNotification,
};
