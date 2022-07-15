const express = require('express');
require('dotenv').config();

const router = express.Router();
const { Client } = require('@notionhq/client');
const Company = require('../models/Company');
const { fieldExists, generateFilter } = require('../utils/utils');

// declaring constants
const { ENV } = process.env;
const SECRET = (ENV === 'dev') ? process.env.NOTION_SECRET_DEV : process.env.NOTION_SECRET;
const COMPANY_DB_ID = (ENV === 'dev') ? process.env.NOTION_COMPANY_DB_ID_DEV : process.env.NOTION_COMPANY_DB_ID;

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
  serializedElem.Contact = raw.properties.Contact?.phone_number;
  serializedElem.AddressLine1 = raw.properties.AddressLine1.rich_text[0]?.text.content;
  serializedElem.AddressLine2 = raw.properties.AddressLine2.rich_text[0]?.text.content;
  serializedElem.State = raw.properties.State.rich_text[0]?.text.content;
  serializedElem.Postcode = raw.properties.Postcode.rich_text[0]?.text.content;
  serializedElem.Website = raw.properties.Website.rich_text[0]?.text.content;
  serializedElem.RegistrationNumber = raw.properties.RegistrationNumber.rich_text[0]?.text.content;
  serializedElem.Email = raw.properties.Email?.email;
  serializedElem.ContactName = raw.properties.ContactName.rich_text[0]?.text.content;
  serializedElem.ContactPhone = raw.properties.ContactPhone?.phone_number;
  serializedElem.ContactEmail = raw.properties.ContactEmail?.email;

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

  if ((filterOn && !fieldExists(Company.fields, filterOn))
    || (sortOn && !fieldExists(Company.fields, sortOn))) { return res.status(400).json({ status: 400, error: 'Unknown filterOn or sortOn field' }); }

  if (sortBy && (sortBy !== 'ascending' && sortBy !== 'descending')) { return res.status(400).json({ status: 400, error: 'Invalid sortBy field' }); }

  if ((!filterOn && filterBy) || (!filterBy && filterOn)) { return res.status(400).json({ status: 400, error: 'Missing filterOn/filterBy but filterBy/filterOn is present' }); }

  if ((!sortOn && sortBy) || (!sortBy && sortOn)) { return res.status(400).json({ status: 400, error: 'Missing sortOn/sortBy but sortBy/sortOn is present' }); }

  const payload = {};
  payload.database_id = COMPANY_DB_ID;
  if (filterBy && generateFilter(Company.fields, filterBy, filterOn)) {
    payload.filter = generateFilter(Company.fields, filterBy, filterOn);
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
    if (notionRes && notionRes.parent.database_id.replaceAll('-', '') !== COMPANY_DB_ID) { return res.status(404).json({ status: 404, error: 'Item not found' }); }
  } catch (error) {
    console.error('error ', error);
    return res.status(error.status ? error.status : 500)
      .json({ status: error.status ? error.status : 500, error });
  }
  if (noSerialize && noSerialize === 'true') return res.status(200).json({ status: 200, data: notionRes });

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
  const model = Company;
  if (Object.keys(body).length === 0) { return res.status(400).json({ status: 400, error: 'No JSON body found' }); }
  for (let index = 0; index < model.fields.length; index += 1) {
    // && model.fields[index].name !== 'ConfirmedDate'
    // && model.fields[index].name !== 'ConfirmedTime'
    if (!body[model.fields[index].name]) return res.status(400).json({ status: 400, error: `${model.fields[index].name} field is required` });
  }
  model.setName = body.Name;
  model.setContact = body.Contact;
  model.setAddressLine1 = body.AddressLine1;
  model.setAddressLine2 = body.AddressLine2;
  model.setState = body.State;
  model.setPostcode = body.Postcode;
  model.setEmail = body.Email;
  model.setRegistrationNumber = body.RegistrationNumber;
  model.setWebsite = body.Website;
  model.setContactName = body.ContactName;
  model.setContactEmail = body.ContactEmail;
  model.setContactPhone = body.ContactPhone;

  // if (body.ConfirmedDate) model.setConfirmedDate = body.ConfirmedDate;
  // if (body.ConfirmedTime) model.setConfirmedTime = body.ConfirmedTime;
  try {
    notionRes = await notion.pages.create({
      parent: {
        database_id: COMPANY_DB_ID,
      },
      properties: model.model,
    });
    if (noSerialize === 'true') { return res.status(201).json({ status: 201, data: notionRes }); }
    return res.status(201).json({ status: 201, data: serializeObject(notionRes) });
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
router.patch('/:id', async (req, res) => {
  let notionRes;

  const { noSerialize } = req.query;
  const { id } = req.params;
  const payload = {};
  payload.page_id = id;
  const { body } = req;
  const model = Company;
  if (Object.keys(body).length === 0) { return res.status(400).json({ status: 400, error: 'No JSON body found' }); }
  if (body.Name) { model.setName = body.Name; }
  if (body.Contact) { model.setContact = body.Contact; }
  if (body.AddressLine1) { model.setAddressLine1 = body.AddressLine1; }
  if (body.AddressLine2) { model.setAddressLine2 = body.AddressLine2; }
  if (body.State) { model.setState = body.State; }
  if (body.Postcode) { model.setPostcode = body.Postcode; }
  if (body.Email) { model.setEmail = body.Email; }
  if (body.RegistrationNumber) { model.setRegistrationNumber = body.RegistrationNumber; }
  if (body.Website) { model.setWebsite = body.Website; }
  if (body.ContactName) { model.setContactName = body.ContactName; }
  if (body.ContactEmail) { model.setContactEmail = body.ContactEmail; }
  if (body.ContactPhone) { model.setContactPhone = body.ContactPhone; }
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
