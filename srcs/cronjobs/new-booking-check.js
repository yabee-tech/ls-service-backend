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
  body: JSON.stringify({ page_size: 10, sorts: [{ property: 'CreatedTime', direction: 'descending' }] }),
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
    fs.stat('/tmp/new_bookings.tmp', (statErr) => {
      // file exists, extract and deserialize data from temp file and compare with response id
      if (statErr == null) {
        fs.readFile('/tmp/new_bookings.tmp', 'utf8', (readErr, data) => {
          if (readErr) { return console.error('Read file : ', readErr); }
          oldIds = data.split('\n');
          differences = ids.filter((x) => !oldIds.includes(x));
          differences.forEach((element) => {
            sendNotification(`A new booking has been added ✅\n${element}`);
          });
          fs.writeFile('/tmp/new_bookings.tmp', ids.join('\n'), (err) => (err ? console.error('overwrite file : ', err) : null));
          return 0;
        });
      } else if (statErr.code === 'ENOENT') {
        // doest exist, create temp file and write serialized idarray to temp file
        fs.writeFile('/tmp/new_bookings.tmp', ids.join('\n'), (err) => (err ? console.error('Write new file : ', err) : null));
      } else {
        console.error('fs stat ', statErr.code);
      }
    });
  })
  .catch((err) => console.error(err));
