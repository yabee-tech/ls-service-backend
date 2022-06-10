const express = require('express');
require('dotenv').config();

const router = express.Router();
const { Client } = require('@notionhq/client');
const Feedback = require('../models/Feedback');
const { fieldExists, generateFilter } = require('../utils/utils');

// declaring constants
const { ENV } = process.env;
const SECRET = (ENV === 'dev') ? process.env.NOTION_SECRET_DEV : process.env.NOTION_SECRET;
const FEEDBACK_DB_ID = (ENV === 'dev') ? process.env.NOTION_FEEDBACK_DB_ID_DEV : process.env.NOTION_FEEDBACK_DB_ID;
const REPAIR_DB_ID = (ENV === 'dev') ? process.env.NOTION_REPAIR_DB_ID_DEV : process.env.NOTION_REPAIR_DB_ID;

// Initializing a client
const notion = new Client({
  auth: SECRET,
});

// TODO fix rating not serialIed
/**
 * Takes in a raw notion api object and converts it into a
 * more redable and less verbose json response
 *
 * @param {*} raw Raw notion api response object
 * @returns a less verbose JSON response of the object
 */
const serializeObject = (raw) => {
  const serializedElem = {};
  serializedElem.id = raw.id;
  serializedElem.Remarks = raw.properties.Remarks.title[0]?.text.content;
  serializedElem.Attachment = raw.properties.Attachment?.url;
  serializedElem.Repair = raw.properties.Repair.relation[0]?.id;
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
    if (notionRes && (notionRes.archived || notionRes.parent.database_id.replaceAll('-', '') !== REPAIR_DB_ID)) { return false; }
  } catch (error) {
    return false;
  }
  return true;
};

/**
 * List endpoint
 *
 * 1. Checks for bad filteron and sorton values
 * 2. Checks for bad sortby values
 * 3. Checks for missing sorton/filteron
 * 4. Generate payload to send to notion api
 * 5. Send payload to notion api
 * 6. serialize data if needed before responding back to client
 */
router.get('/', async (req, res) => {
  let notionRes;

  const { filterOn } = req.query;
  const { filterBy } = req.query;
  const { sortOn } = req.query;
  const { sortBy } = req.query;
  const { pageCursor } = req.query;
  const { pageSize } = req.query;
  const { noSerialize } = req.query;

  if ((filterOn && !fieldExists(Feedback.fields, filterOn))
  || (sortOn && !fieldExists(Feedback.fields, sortOn))) { return res.status(400).json({ status: 400, error: 'Unknown filterOn or sortOn field' }); }

  if (sortBy && (sortBy !== 'ascending' && sortBy !== 'descending')) { return res.status(400).json({ status: 400, error: 'Invalid sortBy field' }); }

  if ((!filterOn && filterBy) || (!filterBy && filterOn)) { return res.status(400).json({ status: 400, error: 'Missing filterOn/filterBy but not filterBy/filterOn is present' }); }

  if ((!sortOn && sortBy) || (!sortBy && sortOn)) { return res.status(400).json({ status: 400, error: 'Missing sortOn/sortBy but not sortBy/sortOn is present' }); }

  const payload = {};
  payload.database_id = FEEDBACK_DB_ID;
  if (filterBy && generateFilter(Feedback.fields, filterBy, filterOn)) {
    payload.filter = generateFilter(Feedback.fields, filterBy, filterOn);
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
  if (pageSize) { payload.page_size = parseInt(pageSize, 10); }

  try {
    notionRes = await notion.databases.query(payload);
  } catch (error) {
    return res.status(error.status).send({ status: error.status, error });
  }
  if (noSerialize && noSerialize === 'true') { return res.status(200).send({ status: 200, data: notionRes }); }
  const serializedObject = [];
  notionRes.results.forEach((elem) => serializedObject.push(serializeObject(elem)));

  return res.json({
    status: 200,
    data: serializedObject,
    next_cursor: notionRes.next_cursor,
    has_more: notionRes.has_more,
  });
});

/**
 * Retreive endpoint
 *
 * 1. Generate payload to send to notion api
 * 2. Send payload to notion api
 * 3. serialize data if needed before responding back to client
 */
router.get('/:id', async (req, res) => {
  let notionRes;

  const { noSerialize } = req.query;
  const { id } = req.params;
  const payload = {};
  payload.page_id = id;

  try {
    notionRes = await notion.pages.retrieve(payload);
    if (notionRes && notionRes.parent.database_id.replaceAll('-', '') !== FEEDBACK_DB_ID) { return res.status(404).json({ status: 404, error: 'Item not found' }); }
  } catch (error) {
    return res.status(error.status).send({ status: error.status, error });
  }
  if (noSerialize && noSerialize === 'true') { return res.status(200).send({ status: 200, data: notionRes }); }

  return res.json({ status: 200, data: serializeObject(notionRes) });
});

/**
 * Create endpoint
 *
 * 1. Check for body
 * 2. check for mandatory fields
 * 3. Set values and generate payload
 * 4. Send payload and return serialized/deserialized response
 */
router.post('/', async (req, res) => {
  let notionRes;

  const { body } = req;
  const { noSerialize } = req.query;
  const model = Feedback;
  if (Object.keys(body).length === 0) { return res.status(400).json({ status: 400, error: 'No JSON body found' }); }
  for (let index = 0; index < model.fields.length; index += 1) {
    if (!body[model.fields[index].name]) return res.status(400).json({ status: 400, error: `${model.fields[index].name} field is required` });
  }
  model.setRemarks = body.Remarks;
  if (!await repairExists(body.Repair)) { return res.status(400).json({ status: 404, error: 'Repair does not exist' }); }
  model.setRepair = body.Repair;
  model.setAttachment = body.Attachment;
  if (!model.TYPE_ENUM.includes(body.Type)) { return res.status(400).json({ status: 400, error: 'Invalid type' }); }
  model.setType = body.Type;

  const rating = parseInt(body.rating, 10);
  if (rating <= 0 || rating > 5) { return res.status(400).json({ status: 400, error: 'Rating must be > 0 and <= 5' }); }
  model.setRating = body.Rating;

  try {
    notionRes = await notion.pages.create({
      parent: {
        database_id: FEEDBACK_DB_ID,
      },
      properties: model.model,
    });
    if (noSerialize === 'true') { return res.status(200).json({ status: 200, data: notionRes }); }
    return res.status(200).json({ status: 200, data: serializeObject(notionRes) });
  } catch (error) {
    return res.status(error.status).json({ status: error.status, error });
  }
});

/**
 * Update endpoint
 *
 * 1. Check for body
 * 2. Set values and generate payload
 * 3. Send payload and return serialized/deserialized response
 */
router.patch('/', async (req, res) => {
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
        database_id: FEEDBACK_DB_ID,
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
