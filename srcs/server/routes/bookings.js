const express = require('express');

const router = express.Router();
const { Client } = require('@notionhq/client');
const Booking = require('../models/Booking');

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const serializeObject = (raw) => {
  const serializedElem = {};
  serializedElem.id = raw.id;
  serializedElem.Reason = raw.properties.Reason.title[0]?.text.content;
  serializedElem.Attachment = raw.properties.Attachment?.url;
  serializedElem.Name = raw.properties.Name.rich_text[0]?.text.content;
  serializedElem.Email = raw.properties.Email?.email;
  serializedElem.Contact = raw.properties.Contact?.phone_number;
  serializedElem.Status = raw.properties.Status.select?.name;
  serializedElem.SuggestedDate = raw.properties.SuggestedDate.date?.start;
  serializedElem.ConfirmedDate = raw.properties.ConfirmedDate.date?.start;

  return serializedElem;
};

router.get('/', async (req, res) => {
  let notionRes;

  const { filterOn } = req.query;
  const { filterBy } = req.query;
  const { sortOn } = req.query;
  const { sortBy } = req.query;
  const { pageCursor } = req.query;
  const { pageSize } = req.query;
  const { noSerialize } = req.query;

  if ((filterOn && !Object.keys(Booking.model).includes(filterOn))
  || (sortOn && !Object.keys(Booking.model).includes(sortOn))) { return res.status(400).json({ status: 400, error: 'Unknown filterOn or sortOn field' }); }

  if (sortBy && (sortBy !== 'ascending' && sortBy !== 'descending')) { return res.status(400).json({ status: 400, error: 'Invalid sortBy field' }); }

  if ((!filterOn && filterBy) || (!filterBy && filterOn)) { return res.status(400).json({ status: 400, error: 'Missing filterOn/filterBy but not filterBy/filterOn is present' }); }

  if ((!sortOn && sortBy) || (!sortBy && sortOn)) { return res.status(400).json({ status: 400, error: 'Missing sortOn/sortBy but not sortBy/sortOn is present' }); }

  const payload = {};
  payload.database_id = process.env.NOTION_BOOKING_DB_ID;
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
    return res.status(error.status).json({ status: error.status, error });
  }
  if (noSerialize && noSerialize === 'true') { return res.status(200).json({ status: 200, data: notionRes }); }
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
    if (notionRes && notionRes.parent.database_id.replaceAll('-', '') !== process.env.NOTION_BOOKING_DB_ID) { return res.status(404).json({ status: 404, error: 'Item not found' }); }
  } catch (error) {
    return res.status(error.status).json({ status: error.status, error });
  }
  if (noSerialize && noSerialize === 'true') { return res.status(200).json({ status: 200, data: notionRes }); }

  return res.json({ status: 200, data: serializeObject(notionRes) });
});

router.post('/', async (req, res) => {
  let notionRes;

  const { body } = req;
  const { noSerialize } = req.query;
  const model = Booking;
  if (Object.keys(body).length === 0) { return res.status(400).json({ status: 400, error: 'No JSON body found' }); }
  if (body.Reason) { model.setReason = body.Reason; }
  if (body.Attachment) { model.setAttachment = body.Attachment; }
  if (body.Name) { model.setName = body.Name; }
  if (body.Email) { model.setEmail = body.Email; }
  if (body.Contact) { model.setContact = body.Contact; }
  if (body.Status) {
    if (!model.STATUS_ENUM.includes(body.Status)) { return res.status(400).json({ status: 400, error: 'Invalid status' }); }
    model.setStatus = body.Status;
  }
  if (body.SuggestedDate) { model.setSuggestedDate = body.SuggestedDate; }
  if (body.ConfirmedDate) { model.setConfimedDate = body.ConfirmedDate; }
  try {
    notionRes = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_BOOKING_DB_ID,
      },
      properties: model.model,
    });
    if (noSerialize === 'true') { return res.status(200).json({ status: 200, data: notionRes }); }
    return res.status(200).json({ status: 200, data: serializeObject(notionRes) });
  } catch (error) {
    return res.status(error.status).json({ status: error.status, error });
  }
});

router.patch('/:id', async (req, res) => {
  let notionRes;

  const { noSerialize } = req.query;
  const { id } = req.params;
  const payload = {};
  payload.page_id = id;
  const { body } = req;
  const model = Booking;
  if (Object.keys(body).length === 0) { return res.status(400).json({ status: 400, error: 'No JSON body found' }); }
  if (body.Reason) { model.setReason = body.Reason; }
  if (body.Attachment) { model.setAttachment = body.Attachment; }
  if (body.Name) { model.setName = body.Name; }
  if (body.Email) { model.setEmail = body.Email; }
  if (body.Contact) { model.setContact = body.Contact; }
  if (body.Status) {
    if (!model.STATUS_ENUM.includes(body.Status)) { return res.status(400).json({ status: 400, error: 'Invalid status' }); }
    model.setStatus = body.Status;
  }
  if (body.SuggestedDate) { model.setSuggestedDate = body.SuggestedDate; }
  if (body.ConfirmedDate) { model.setConfimedDate = body.ConfirmedDate; }
  try {
    notionRes = await notion.pages.update({
      page_id: id,
      properties: model.model,
    });
    if (noSerialize === 'true') { return res.status(200).json({ status: 200, data: notionRes }); }
    return res.status(200).json({ status: 200, data: serializeObject(notionRes) });
  } catch (error) {
    return res.status(error.status).json({ status: error.status, error });
  }
});

module.exports = router;
