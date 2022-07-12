const { bot } = require('./telegram');
const { notion, SUBSCRIBER_DB_ID } = require('./notion');
const { twilio, TWILIO_MESSAGING_SERVICE_SID } = require('./twilio');
const { getFormattedPhoneNumber } = require('./utils');

function generateNewBookingMessage(raw) {
  const rawObj = JSON.parse(raw);
  const res = `
  ID: ${rawObj.id}
  Name: ${rawObj.raw.properties.Name.rich_text[0]?.text.content}
  Contact Number: ${rawObj.contact}
  Address: ${rawObj.raw.properties.Address.rich_text[0]?.text.content}
  Email: ${rawObj.raw.properties.Email?.email}
  Status: ${rawObj.raw.properties.Status?.select.name}
  SuggestedDate: ${rawObj.raw.properties.SuggestedDate.date?.start}
  ConfirmedDate: ${rawObj.raw.properties.ConfirmedDate ? rawObj.raw.properties.ConfirmedDate.date?.start : 'no confirmed date yet'}
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
    console.error(err);
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
        const rawObj = JSON.parse(booking);
        sendSMSNotification(rawObj.contact, `Dear ${rawObj.raw.properties.Name.rich_text[0]?.text.content}, your booking on ${rawObj.raw.properties.ConfirmedDate ? rawObj.raw.properties.ConfirmedDate.date?.start : 'no confirmed date yet'} has been confirmed. Check out https://ls-service-frontend.vercel.app/booking/${rawObj.id} for latest updates!`);
        bot.telegram.sendMessage(chatId, `Booking confirmed\n${generateNewBookingMessage(booking)}`);
      } else {
        console.log(result.properties);
        throw new Error('subscriber has no ChatID');
      }
    });
  } catch (err) {
    console.error(err);
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
        const rawObj = JSON.parse(booking);
        let title = 'New Booking';
        if (rawObj.raw.properties.Status?.select.name === 'Confirmed') {
          title = 'Booking Confirmed!';
          sendSMSNotification(rawObj.contact, `Dear ${rawObj.raw.properties.Name.rich_text[0]?.text.content}, your booking on ${rawObj.raw.properties.ConfirmedDate ? rawObj.raw.properties.ConfirmedDate.date?.start : 'no confirmed date yet'} has been confirmed. Check out https://ls-service-frontend.vercel.app/booking/${rawObj.id} for latest updates!`);
        } else {
          sendSMSNotification(rawObj.contact, `Dear ${rawObj.raw.properties.Name.rich_text[0]?.text.content}, you had just made a service booking with LS Smart Machinery, our staff will contact you soon. Meanwhile, check out https://ls-service-frontend.vercel.app/booking/${rawObj.id} for latest updates on your booking.`);
        }
        bot.telegram.sendMessage(chatId, `${title}\n${generateNewBookingMessage(booking)}`);
      } else {
        console.log(result.properties);
        throw new Error('subscriber has no ChatID');
      }
    });
  } catch (err) {
    console.error(err);
    if (err.message.includes('ChatID')) {
      console.error('Notification not sent: subscriber has no ChatID');
    } else {
      console.error('Notification not sent: there are 0 subscribers');
    }
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
        bot.telegram.sendMessage(chatId, repairMsg);
      } else {
        console.log(result.properties);
        throw new Error('subscriber has no ChatID');
      }
    });
  } catch (err) {
    console.error(err);
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
