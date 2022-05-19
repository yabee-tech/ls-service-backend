const express = require('express');

const router = express.Router();
const { Client } = require('@notionhq/client');
const Repair = require('../models/Repair');

const serializeObject = (raw) => {
  const serializedElem = {};

  serializedElem.id = raw.id;
  serializedElem.TechnicianName = raw.properties.TechnicianName.title[0]?.text.content;
  serializedElem.Booking = raw.properties.Booking.rich_text[0]?.text.content;
  serializedElem.TechnicianContact = raw.properties.TechnicianContact?.phone_number;
  serializedElem.Status = raw.properties.Status.select?.name;

  return serializedElem;
};

// const deserializeObject = (raw) => {
//   const deserializedElem = {
//     TechnicianName: {
//       title: [{
//         text: {
//           content: raw.TechnicianName,
//         },
//       },
//       ],
//     },

//     Booking:
//     {
//       rich_text:
//       [
//         {
//           type: 'text',
//           text: { content: raw.Booking },
//         },
//       ],
//     },

//     TechnicianContact:
//     {
//       phone_number: raw.TechnicianContact,
//     },

//     Status:
//     {
//       select:
//       {
//         name: raw.Status,
//       },
//     },
//   };

//   return deserializedElem;
// };

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

// check if booking exists
const bookingExists = async (bookingId) => {
  let notionRes;

  const payload = { page_id: bookingId };
  try {
    notionRes = await notion.pages.retrieve(payload);
    if (notionRes && notionRes.parent.database_id.replaceAll('-', '') !== process.env.NOTION_BOOKING_DB_ID) { return false; }
  } catch (error) {
    return false;
  }
  return true;
};

router.get('/', async (req, res) => {
  let notionRes;

  const {
    filterOn, filterBy, sortOn, sortBy, pageCursor, pageSize, noSerialize,
  } = req.query;

  if ((filterOn && !Object.keys(Repair.model).includes(filterOn))
  || (sortOn && !Object.keys(Repair.model).includes(sortOn))) { return res.status(400).json({ status: 400, error: 'Unknown filterOn or sortOn field' }); }

  if (sortBy && (sortBy !== 'ascending' && sortBy !== 'descending')) { return res.status(400).json({ status: 400, error: 'Invalid sortBy field' }); }

  if ((!filterOn && filterBy) || (!filterBy && filterOn)) { return res.status(400).json({ status: 400, error: 'Missing filterOn/filterBy but not filterBy/filterOn is present' }); }

  if ((!sortOn && sortBy) || (!sortBy && sortOn)) { return res.status(400).json({ status: 400, error: 'Missing sortOn/sortBy but not sortBy/sortOn is present' }); }

  const payload = {};
  payload.database_id = process.env.NOTION_REPAIR_DB_ID;
  if (filterBy) {
    payload.filter = {
      property: filterOn,
      equals: filterBy,
    };
  }
  if (sortBy) {
    payload.sorts = [
      {
        property: sortOn,
        direction: sortBy,
      },
    ];
  }
  if (pageCursor) { payload.start_cursor = pageCursor; }
  if (pageSize) { payload.pageSize = parseInt(pageSize, 10); }

  try {
    notionRes = await notion.databases.query(payload);
  } catch (error) {
    return res.status(error.status).send({ status: error.status, error });
  }
  if (noSerialize && noSerialize === 'true') { return res.status(200).send({ status: 200, data: notionRes }); }
  const serializedObject = [];
  notionRes.results.forEach((elem) => serializedObject.push(serializeObject(elem)));

  return res.json({ status: 200, data: serializedObject });
});

router.get('/:id', async (req, res) => {
  let notionRes;

  const { noSerialize } = req.query;
  const { id } = req.params;
  const payload = {};
  payload.page_id = id;

  try {
    notionRes = await notion.pages.retrieve(payload);
    if (notionRes && notionRes.parent.database_id.replaceAll('-', '') !== process.env.NOTION_REPAIR_DB_ID) { return res.status(404).json({ status: 404, error: 'Item not found' }); }
  } catch (error) {
    return res.status(error.status).send({ status: error.status, error });
  }
  if (noSerialize && noSerialize === 'true') { return res.status(200).send({ status: 200, data: notionRes }); }

  return res.json({ status: 200, data: serializeObject(notionRes) });
});

router.post('/', async (req, res) => {
  let notionRes;

  const { body } = req;
  const { noSerialize } = req.query;
  const model = Repair;
  if (Object.keys(body).length === 0) return res.status(400).json({ status: 400, error: 'No JSON body found' });
  if (body.TechnicianName) model.setTechnicianName = body.TechnicianName;
  if (body.Booking) {
    if (!await bookingExists(body.Booking)) return res.status(400).json({ status: 404, error: 'Booking does not exist' });
    model.setBooking = body.Booking;
  }
  if (body.TechnicianContact) model.setTechnicianContact = body.TechnicianContact;
  if (body.Status) {
    if (!model.STATUS_ENUM.includes(body.Status)) return res.status(400).json({ status: 400, error: 'Invalid status' });
    model.setStatus = body.Status;
  }
  try {
    notionRes = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_REPAIR_DB_ID,
      },
      properties: model.model,
    });
    if (noSerialize === 'true') return res.status(200).json({ status: 200, data: notionRes });
    return res.status(200).json({ status: 200, data: serializeObject(notionRes) });
  } catch (error) {
    return res.status(error.status).json({ status: error.status, error });
  }
});

router.patch('/:id', async (req, res) => {
  let notionRes;

  const { body } = req;
  const { id } = req.params;
  const { noSerialize } = req.query;
  const model = Repair;
  if (Object.keys(body).length === 0) return res.status(400).json({ status: 400, error: 'No JSON body found' });
  if (body.TechnicianName) model.setTechnicianName = body.TechnicianName;
  if (body.Booking) {
    if (!await bookingExists(body.Booking)) return res.status(400).json({ status: 404, error: 'Booking does not exist' });
    model.setBooking = body.Booking;
  }
  if (body.TechnicianContact) model.setTechnicianContact = body.TechnicianContact;
  if (body.Status) {
    if (!model.STATUS_ENUM.includes(body.Status)) return res.status(400).json({ status: 400, error: 'Invalid status' });
    model.setStatus = body.Status;
  }
  try {
    notionRes = await notion.pages.update({
      page_id: id,
      properties: model.model,
    });
    if (noSerialize === 'true') return res.status(200).json({ status: 200, data: notionRes });
    return res.status(200).json({ status: 200, data: serializeObject(notionRes) });
  } catch (error) {
    return res.status(error.status).json({ status: error.status, error });
  }
});

module.exports = router;
