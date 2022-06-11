const express = require('express');
require('dotenv').config();

const router = express.Router();
const { Client } = require('@notionhq/client');
const Technician = require('../models/Technician');
const { fieldExists, generateFilter } = require('../utils/utils');

// declaring constants
const { ENV } = process.env;
const SECRET = (ENV === 'dev') ? process.env.NOTION_SECRET_DEV : process.env.NOTION_SECRET;
const TECHNICIAN_DB_ID = (ENV === 'dev') ? process.env.NOTION_TECHNICIAN_DB_ID_DEV : process.env.NOTION_TECHNICIAN_DB_ID;

// Initializing a client
const notion = new Client({
  auth: SECRET,
});

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
  serializedElem.Name = raw.properties.Name.title[0]?.text.content;
  serializedElem.LastSeen = raw.properties.LastSeen.rich_text[0]?.text.content;
  serializedElem.Contact = raw.properties.Contact?.phone_number;

  return serializedElem;
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

  if ((filterOn && !fieldExists(Technician.fields, filterOn))
  || (sortOn && !fieldExists(Technician.fields, sortOn))) { return res.status(400).json({ status: 400, error: 'Unknown filterOn or sortOn field' }); }

  if (sortBy && (sortBy !== 'ascending' && sortBy !== 'descending')) { return res.status(400).json({ status: 400, error: 'Invalid sortBy field' }); }

  if ((!filterOn && filterBy) || (!filterBy && filterOn)) { return res.status(400).json({ status: 400, error: 'Missing filterOn/filterBy but filterBy/filterOn is present' }); }

  if ((!sortOn && sortBy) || (!sortBy && sortOn)) { return res.status(400).json({ status: 400, error: 'Missing sortOn/sortBy but sortBy/sortOn is present' }); }

  const payload = {};
  payload.database_id = TECHNICIAN_DB_ID;
  if (filterBy && generateFilter(Technician.fields, filterBy, filterOn)) {
    payload.filter = generateFilter(Technician.fields, filterBy, filterOn);
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
    return res.status(error.status).json({ status: error.status, error });
  }
  if (noSerialize && noSerialize === 'true') { return res.status(200).json({ status: 200, data: notionRes }); }
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
    if (notionRes && notionRes.parent.database_id.replaceAll('-', '') !== TECHNICIAN_DB_ID) { return res.status(404).json({ status: 404, error: 'Item not found' }); }
  } catch (error) {
    return res.status(error.status).json({ status: error.status, error });
  }
  if (noSerialize && noSerialize === 'true') return res.status(200).json({ status: 200, data: notionRes });

  return res.json({ status: 200, data: serializeObject(notionRes) });
});

/**
 * Update endpoint
 *
 * 1. Check for body
 * 2. Set values and generate payload
 * 3. Send payload and return serialized/deserialized response
 */
router.patch('/:id', async (req, res) => {
  let notionRes;

  const { noSerialize } = req.query;
  const { id } = req.params;
  const payload = {};
  payload.page_id = id;
  const { body } = req;
  const model = Technician;
  if (Object.keys(body).length === 0) { return res.status(400).json({ status: 400, error: 'No JSON body found' }); }
  if (body.Password) { return res.status(400).json({ status: 400, error: 'Password cant be changed' }); }
  if (body.Name) { model.setName = body.Name; }
  if (body.LastSeen) { model.setLastSeen = body.LastSeen; }
  if (body.Contact) { model.setContact = body.Contact; }

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
