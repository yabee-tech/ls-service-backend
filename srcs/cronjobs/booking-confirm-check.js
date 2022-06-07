const fs = require('fs');
const fetch = require('node-fetch');
const { sendNotification } = require('../bot/actions');
require('dotenv').config();

// process environment variables
const { ENV } = process.env;
const SECRET = (ENV === 'dev') ? process.env.NOTION_SECRET_DEV : process.env.NOTION_SECRET;
const BOOKING_DB_ID = (ENV === 'dev') ? process.env.NOTION_BOOKING_DB_ID_DEV : process.env.NOTION_BOOKING_DB_ID;

// request payload
const options = {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Notion-Version': '2022-02-22',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SECRET}`,
  },
  body: JSON.stringify({ page_size: 10, filter: { property: 'Status', select: { equals: 'Confirmed' } }, sorts: [{ property: 'CreatedTime', direction: 'descending' }] }),
};

fetch(`https://api.notion.com/v1/databases/${BOOKING_DB_ID}/query`, options)
  .then((response) => response.json())
  .then((response) => {
    let oldIds;
    let differences;

    const ids = [];

    // get id array from response
    response.results?.map((result) => ids.push(JSON.stringify(
      { id: result.id, contact: result.properties.Contact?.phone_number },
    )));

    // check if temp file exists
    fs.stat('/tmp/booking-confirmed.tmp', (err) => {
      // file exists, extract and deserialize data from temp file and compare with response id
      if (err == null) {
        fs.readFile('/tmp/booking-confirmed.tmp', 'utf8', (error, data) => {
          if (error) { return console.error('Read file : ', error); }
          oldIds = data.split('\n');
          differences = ids.filter((x) => !oldIds.includes(x));
          differences.forEach((element) => {
            sendNotification(`A booking has been confirmed ✅\n${element}`);
          });
          fs.writeFile('/tmp/booking-confirmed.tmp', ids.join('\n'), (writeErr) => (writeErr ? console.error('overwrite file : ', writeErr) : null));
          return 0;
        });
      } else if (err.code === 'ENOENT') {
        // doest exist, create temp file and write serialized idarray to temp file
        fs.writeFile('/tmp/booking-confirmed.tmp', ids.join('\n'), (writeNewErr) => (writeNewErr ? console.error('Write new file : ', writeNewErr) : null));
      } else {
        console.error('fs stat ', err.code);
      }
    });
  })
  .catch((err) => console.error(err));
