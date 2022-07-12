const AWS = require('aws-sdk');
const fs = require('fs');
const fetch = require('node-fetch');
const { sendNewBookingNotification } = require('../bot/actions');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY_ID_DEV,
  secretAccessKey: process.env.AWS_SECRET_DEV,
});

// helper function to check for differences
const checkDiff = (path, encoding, ids) => {
  let oldIds;
  let differences;

  fs.readFile(path, encoding, (readErr, data) => {
    if (readErr) { return console.error('Read file : ', readErr); }
    oldIds = data.split('\n');
    differences = ids.filter((x) => !oldIds.includes(x));
    differences.forEach((element) => {
      sendNewBookingNotification(element);
    });
    fs.writeFile(path, ids.join('\n'), (err) => (err ? console.error('overwrite file : ', err) : null));
    return 0;
  });
};

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
    const ids = [];

    // get id array from response
    response.results?.map((result) => ids.push(JSON.stringify(
      { id: result.id, contact: result.properties.Contact?.phone_number, raw: result },
    )));

    // check if temp file exists
    fs.stat('/tmp/new_bookings.tmp', (statErr) => {
      // file exists, extract and deserialize data from temp file and compare with response id
      if (statErr == null) {
        checkDiff('/tmp/new_bookings.tmp', 'utf8', ids);
      } else if (statErr.code === 'ENOENT') {
        // dosnt exist, try to download from backup
        s3.getObject({ Bucket: process.env.AWS_BUCKET_NAME_DEV, Key: '/tmp/new_bookings.tmp' }, (err, data) => {
          if (!err) {
            // backup exists, write to local
            console.log('⚠️ Getting tempfiles from backup');
            fs.writeFile('/tmp/new_bookings.tmp', data.Body.toString(), (writeErrBackup) => (writeErrBackup ? console.error('Write new file backup : ', writeErrBackup) : null));
          } else if (err.code === 'NoSuchKey') {
            // doest exist, create temp file and write serialized idarray to temp file
            fs.writeFile('/tmp/new_bookings.tmp', ids.join('\n'), (writeErrNew) => (writeErrNew ? console.error('Write new file : ', writeErrNew) : null));
          }
        });
      } else {
        console.error('fs stat ', statErr.code);
      }
    });
  })
  .catch((err) => console.error(err));
