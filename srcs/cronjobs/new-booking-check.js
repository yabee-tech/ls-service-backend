const fs = require('fs');

// request payload
const options = {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Notion-Version': '2022-02-22',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.NOTION_SECRET}`,
  },
  body: JSON.stringify({ page_size: 10, sorts: [{ property: 'CreatedTime', direction: 'descending' }] }),
};

fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_BOOKING_DB_ID}/query`, options)
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
            console.log('new booking ', element);
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
