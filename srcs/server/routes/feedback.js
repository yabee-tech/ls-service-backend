const express = require('express');

const router = express.Router();
const { Client } = require('@notionhq/client');
const Feedback = require('../models/Feedback');

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const serializeObject = (raw) => {
  const serializedElem = {};
  serializedElem.id = raw.id;
  serializedElem.Remarks = raw.properties.Remarks.title[0]?.text.content;
  serializedElem.Attachment = raw.properties.Attachment?.url;
  serializedElem.Repair = raw.properties.Repair.rich_text[0]?.text.content;
  serializedElem.Type = raw.properties.Type.select?.name;
  serializedElem.Rating = raw.properties.Rating.number?.value;

  return serializedElem;
};

// check if repair exists
const repairExists = async (repairId) => {
  let notionRes;

  const payload = { page_id: repairId };
  try {
    notionRes = await notion.pages.retrieve(payload);
    if (notionRes && notionRes.parent.database_id.replaceAll('-', '') !== process.env.NOTION_REPAIR_DB_ID) { return false; }
  } catch (error) {
    return false;
  }
  return true;
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

  if ((filterOn && !Object.keys(Feedback.model).includes(filterOn))
  || (sortOn && !Object.keys(Feedback.model).includes(sortOn))) { return res.status(400).json({ status: 400, error: 'Unknown filterOn or sortOn field' }); }

  if (sortBy && (sortBy !== 'ascending' && sortBy !== 'descending')) { return res.status(400).json({ status: 400, error: 'Invalid sortBy field' }); }

  if ((!filterOn && filterBy) || (!filterBy && filterOn)) { return res.status(400).json({ status: 400, error: 'Missing filterOn/filterBy but not filterBy/filterOn is present' }); }

  if ((!sortOn && sortBy) || (!sortBy && sortOn)) { return res.status(400).json({ status: 400, error: 'Missing sortOn/sortBy but not sortBy/sortOn is present' }); }

  const payload = {};
  payload.database_id = process.env.NOTION_FEEDBACK_DB_ID;
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
    if (notionRes && notionRes.parent.database_id.replaceAll('-', '') !== process.env.NOTION_FEEDBACK_DB_ID) { return res.status(404).json({ status: 404, error: 'Item not found' }); }
  } catch (error) {
    return res.status(error.status).send({ status: error.status, error });
  }
  if (noSerialize && noSerialize === 'true') { return res.status(200).send({ status: 200, data: notionRes }); }

  return res.json({ status: 200, data: serializeObject(notionRes) });
});

router.post('/', async (req, res) => {
  let notionRes;
  let rating;

  const { body } = req;
  const { noSerialize } = req.query;
  const model = Feedback;
  if (Object.keys(body).length === 0) { return res.status(400).json({ status: 400, error: 'No JSON body found' }); }
  if (body.Remarks) { model.setRemarks = body.Remarks; }
  if (body.Repair) {
    if (!await repairExists(body.Repair)) { return res.status(400).json({ status: 404, error: 'Repair does not exist' }); }
    model.setRepair = body.Repair;
  }
  if (body.Attachment) { model.setAttachment = body.Attachment; }
  if (body.Type) {
    if (!model.TYPE_ENUM.includes(body.Type)) { return res.status(400).json({ status: 400, error: 'Invalid type' }); }
    model.setType = body.Type;
  }
  if (body.Rating) {
    rating = parseInt(body.rating, 10);

    if (rating <= 0 || rating > 5) { return res.status(400).json({ status: 400, error: 'Rating must be > 0 and <= 5' }); }
    model.setRating = body.Rating;
  }
  try {
    notionRes = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_FEEDBACK_DB_ID,
      },
      properties: model.model,
    });
    if (noSerialize === 'true') { return res.status(200).json({ status: 200, data: notionRes }); }
    return res.status(200).json({ status: 200, data: serializeObject(notionRes) });
  } catch (error) {
    return res.status(error.status).json({ status: error.status, error });
  }
});

router.put('/', async (req, res) => {
  let notionRes;
  let rating;

  const { body } = req;
  const { noSerialize } = req.query;
  const model = Feedback;
  if (Object.keys(body).length === 0) { return res.status(400).json({ status: 400, error: 'No JSON body found' }); }
  if (body.Remarks) { model.setRemarks = body.Remarks; }
  if (body.Repair) {
    if (!await repairExists(body.Repair)) { return res.status(400).json({ status: 404, error: 'Repair does not exist' }); }
    model.setBooking = body.Repair;
  }
  if (body.Attachment) { model.setAttachment = body.Attachment; }
  if (body.Type) {
    if (!model.TYPE_ENUM.includes(body.Type)) { return res.status(400).json({ status: 400, error: 'Invalid type' }); }
    model.setStatus = body.Type;
  }
  if (body.Rating) {
    rating = parseInt(body.rating, 10);

    if (rating <= 0 || rating > 5) { return res.status(400).json({ status: 400, error: 'Rating must be > 0 and <= 5' }); }
    model.setRating = body.Rating;
  }
  try {
    notionRes = await notion.pages.update({
      parent: {
        database_id: process.env.NOTION_FEEDBACK_DB_ID,
      },
      properties: model.model,
    });
    if (noSerialize === 'true') { return res.status(200).json({ status: 200, data: notionRes }); }
    return res.status(200).json({ status: 200, data: serializeObject(notionRes) });
  } catch (error) {
    return res.status(error.status).json({ status: error.status, error });
  }
});

module.exports = router;
