const { Client } = require('@notionhq/client');
require('dotenv').config();

const SECRET = process.env.NOTION_SECRET_DEV;
const BOOKING_DB_ID = process.env.NOTION_BOOKING_DB_ID_DEV;
const REPAIR_DB_ID = process.env.NOTION_REPAIR_DB_ID_DEV;
const FEEDBACK_DB_ID = process.env.NOTION_FEEDBACK_DB_ID_DEV;

// Initializing a client
const NOTION = new Client({
  auth: SECRET,
});

const runBookingMigrations = async () => {
  // get all entries
  const response = await NOTION.databases.query({
    database_id: BOOKING_DB_ID,
  });

  // iterate through the entries
  response.results.forEach(async (result) => {
    // delete (archive) the page
    await NOTION.blocks.delete({ block_id: result.id });
  });

  // add sample datas
  await NOTION.pages.create({
    parent: {
      database_id: BOOKING_DB_ID,
    },
    properties: {
      Reason: {
        title:
        [
          {
            text:
            {
              content: 'new title',
            },
          },
        ],
      },

      Attachment: {
        url: 'image.jpeg',
      },

      Name: {
        rich_text:
        [
          {
            text:
            {
              content: 'name name',
            },
          },
        ],
      },

      Email: {
        email: 'name@email.com',

      },

      Contact: {
        phone_number: '0987654213',
      },

      Status: {
        select:
        {
          name: 'Pending',
        },
      },

      SuggestedDate: {
        date:
        {
          start: '2022-06-21',
          end: null,
        },
      },
    },
  });

  await NOTION.pages.create({
    parent: {
      database_id: BOOKING_DB_ID,
    },
    properties: {
      Reason: {
        title:
        [
          {
            text:
            {
              content: '2 new title',
            },
          },
        ],
      },

      Attachment: {
        url: '2 image.jpeg',
      },

      Name: {
        rich_text:
        [
          {
            text:
            {
              content: '2name name',
            },
          },
        ],
      },

      Email: {
        email: '2name@email.com',

      },

      Contact: {
        phone_number: '20987654213',
      },

      Status: {
        select:
        {
          name: '2Pending',
        },
      },

      SuggestedDate: {
        date:
        {
          start: '2022-06-22',
          end: null,
        },
      },
    },
  });
};

const runRepairMigrations = async () => {
  // get all entries
  const response = await NOTION.databases.query({
    database_id: REPAIR_DB_ID,
  });

  // iterate through the entries
  response.results.forEach(async (result) => {
    // delete (archive) the page
    await NOTION.blocks.delete({ block_id: result.id });
  });

  // get booking ids
  const bookingIds = [];
  const bookings = await NOTION.databases.query({
    database_id: BOOKING_DB_ID,
  });
  bookings.results.forEach((booking) => {
    bookingIds.push(booking.id);
  });

  // add sample data
  await NOTION.pages.create({
    parent:
    {
      database_id: REPAIR_DB_ID,
    },
    properties:
    {
      TechnicianName:
      {
        title:
        [
          {
            text:
            {
              content: 'techname',
            },
          },
        ],
      },

      Booking:
      {
        relation: [
          { id: bookingIds[0] },
        ],
      },

      TechnicianContact:
      {
        phone_number: '123456787654',
      },

      Status:
      {
        select:
        {
          name: 'OTW',
        },
      },
    },
  });

  await NOTION.pages.create({
    parent:
    {
      database_id: REPAIR_DB_ID,
    },
    properties:
    {
      TechnicianName:
      {
        title:
        [
          {
            text:
            {
              content: 'techname2',
            },
          },
        ],
      },

      Booking:
      {
        relation: [
          { id: bookingIds[0] },
        ],
      },

      TechnicianContact:
      {
        phone_number: '1234567872654',
      },

      Status:
      {
        select:
        {
          name: 'OTW',
        },
      },
    },
  });
};

const runFeedbackMigrations = async () => {
  // get all entries
  const response = await NOTION.databases.query({
    database_id: FEEDBACK_DB_ID,
  });

  // iterate through the entries
  response.results.forEach(async (result) => {
    // delete (archive) the page
    await NOTION.blocks.delete({ block_id: result.id });
  });

  // get repair ids
  const reapirIds = [];
  const reapirs = await NOTION.databases.query({
    database_id: REPAIR_DB_ID,
  });
  reapirs.results.forEach((reapir) => {
    reapirIds.push(reapir.id);
  });
  // add sample data
  await NOTION.pages.create({
    parent: { database_id: FEEDBACK_DB_ID },
    properties: {
      Remarks: {
        title:
            [
              {
                text:
                {
                  content: 'remark',
                },
              },
            ],
      },

      Attachment: { url: '123456.jpeg' },

      Repair: { relation: [{ id: reapirIds[0] }] },

      Type: {
        select: { name: 'Customer' },
      },

      Rating: { number: 12 },
    },
  });

  await NOTION.pages.create({
    parent: { database_id: FEEDBACK_DB_ID },
    properties: {
      Remarks: {
        title:
            [
              {
                text:
                {
                  content: '2remark',
                },
              },
            ],
      },

      Attachment: { url: '123456.jpeg' },

      Repair: { relation: [{ id: reapirIds[0] }] },

      Type: {
        select: { name: 'Technician' },
      },

      Rating: { number: 12 },
    },
  });
};

const runMigrations = async () => {
  await runBookingMigrations();
  await runRepairMigrations();
  await runFeedbackMigrations();
  console.log('testing migrations done');
};

runMigrations();
