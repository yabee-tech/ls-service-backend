const fs = require('fs');
const fetch = require('node-fetch');
const { sendNotification } = require('../bot/actions');
require('dotenv').config();

// process environment variables
const { ENV } = process.env;
const SECRET = (ENV === 'dev') ? process.env.NOTION_SECRET_DEV : process.env.NOTION_SECRET;
const REPAIR_DB_ID = (ENV === 'dev') ? process.env.NOTION_REPAIR_DB_ID_DEV : process.env.NOTION_REPAIR_DB_ID;

// requeat payload
const options = {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Notion-Version': '2022-02-22',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SECRET}`,
  },
  body: JSON.stringify({ page_size: 10, filter: { property: 'Status', select: { equals: 'Resolved' } }, sorts: [{ property: 'CreatedTime', direction: 'ascending' }] }),
};

fetch(`https://api.notion.com/v1/databases/${REPAIR_DB_ID}/query`, options)
  .then((response) => response.json())
  .then((response) => {
    let oldIds;
    let differences;

    const ids = [];

    // get id array from response
    response.results?.map((result) => ids.push(JSON.stringify(
      { id: result.id, booking: result.properties.Booking?.relation[0]?.id },
    )));

    // check if temp file exists
    fs.stat('/tmp/repair-done.tmp', (err) => {
      // file exists, extract and deserialize data from temp file and compare with response id
      if (err == null) {
        fs.readFile('/tmp/repair-done.tmp', 'utf8', (error, data) => {
          if (error) { return console.error('Read file : ', error); }
          oldIds = data.split('\n');
          differences = ids.filter((x) => !oldIds.includes(x));
          differences.forEach((element) => {
            // fet individual contacts via booking
            const optionsBooking = {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'Notion-Version': '2022-02-22',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NOTION_SECRET}`,
              },
            };
            const elemParsed = JSON.parse(element);
            fetch(`https://api.notion.com/v1/pages/${elemParsed.booking.replace('-/g', '')}`, optionsBooking)
              .then((res) => res.json())
              .then((res) => {
                // need to do result parent db validation
                if (!res.properties) {
                  elemParsed.Contact = null;
                  return;
                }
                elemParsed.Contact = res.properties.Contact?.phone_number;
                sendNotification(`A repair has been marked as done ✅\n${JSON.stringify(elemParsed)}`);
              })
              .catch((e) => console.log('error ', e));
          });
          fs.writeFile('/tmp/repair-done.tmp', ids.join('\n'), (writeErr) => (writeErr ? console.error('overwrite file : ', writeErr) : null));
          return 0;
        });
      } else if (err.code === 'ENOENT') {
        // doest exist, create temp file and write serialized idarray to temp file
        fs.writeFile('/tmp/repair-done.tmp', ids.join('\n'), (writeNewErr) => (writeNewErr ? console.error('Write new file : ', writeNewErr) : null));
      } else {
        console.error('fs stat ', err.code);
      }
    });
  })
  .catch((err) => console.error(err));
