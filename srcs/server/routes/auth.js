const express = require('express');
require('dotenv').config();

const router = express.Router();
const { Client } = require('@notionhq/client');
const { genSaltSync, hashSync, compareSync } = require('bcrypt');
const Technician = require('../models/Technician');
const { generateFilter } = require('../utils/utils');
const { sendNotification } = require('../../bot/actions');

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
  serializedElem.Name = raw.properties.Name.title[0]?.text.content ?? null;
  serializedElem.LastSeen = raw.properties.LastSeen.rich_text[0]?.text.content ?? null;
  serializedElem.Contact = raw.properties.Contact?.phone_number ?? null;

  return serializedElem;
};

/**
 * Sign up / create new technician
 */
router.post('/signup', async (req, res) => {
  let notionRes;

  const { body } = req;
  const { noSerialize } = req.query;
  const model = Technician;
  const salt = genSaltSync();
  const payload = {};

  if (Object.keys(body).length === 0) { return res.status(400).json({ status: 400, error: 'No JSON body found' }); }
  for (let index = 0; index < model.fields.length; index += 1) {
    if (!body[model.fields[index].name] && model.fields[index].name !== 'LastSeen') return res.status(400).json({ status: 400, error: `${model.fields[index].name} field is required` });
  }
  if (body.LastSeen) model.setLastSeen = body.LastSeen;
  model.setName = body.Name;
  model.setContact = body.Contact;
  model.setPassword = hashSync(body.Password, salt);

  try {
    // check for duplicate name
    payload.database_id = TECHNICIAN_DB_ID;
    payload.filter = generateFilter(Technician.fields, body.Name, 'Name');
    notionRes = await notion.databases.query(payload);
    if (notionRes.results.length > 0) return res.status(400).json({ status: 400, error: 'Name already exists' });
    notionRes = await notion.pages.create({
      parent: {
        database_id: TECHNICIAN_DB_ID,
      },
      properties: model.model,
    });
    sendNotification(`New technician ${body.Name} has signed up 👨🏻‍🔧`);
    if (noSerialize === 'true') { return res.status(201).json({ status: 201, data: notionRes }); }
    return res.status(200).json({ status: 200, data: serializeObject(notionRes) });
  } catch (error) {
    return res.status(error.status).json({ status: error.status, error });
  }
});

/**
 * Login
 */
router.post('/login', async (req, res) => {
  let notionRes;

  const { body } = req;
  const { noSerialize } = req.query;
  const model = Technician;
  const payload = {};

  if (Object.keys(body).length === 0) { return res.status(400).json({ status: 400, error: 'No JSON body found' }); }
  for (let index = 0; index < model.fields.length; index += 1) {
    if (!body[model.fields[index].name]
      && model.fields[index].name !== 'LastSeen'
      && model.fields[index].name !== 'Contact') return res.status(400).json({ status: 400, error: `${model.fields[index].name} field is required` });
  }
  model.setName = body.Name;

  try {
    // check for duplicate name
    payload.database_id = TECHNICIAN_DB_ID;
    payload.filter = generateFilter(Technician.fields, body.Name, 'Name');
    notionRes = await notion.databases.query(payload);
    if (notionRes.results.length <= 0) return res.status(404).json({ status: 404, error: 'User not found' });
    if (!compareSync(body.Password, notionRes.results[0].properties.Password.rich_text[0]?.text.content)) { return res.status(404).json({ status: 403, error: 'Incorrect credentials' }); }
    if (noSerialize === 'true') { return res.status(200).json({ status: 200, data: notionRes }); }
    return res.status(200).json({ status: 200, data: serializeObject(notionRes.results[0]) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, error });
  }
});

module.exports = router;
