const { Client } = require('@notionhq/client');
require('dotenv').config();

// processing environment variables
const { ENV } = process.env;
const SECRET = (ENV === 'dev') ? process.env.NOTION_SECRET_DEV : process.env.NOTION_SECRET;
const SUBSCRIBER_DB_ID = (ENV === 'dev') ? process.env.NOTION_SUBSCRIBER_DB_ID_DEV : process.env.NOTION_SUBSCRIBER_DB_ID;

// Initializing a client
const notion = new Client({ auth: SECRET });

module.exports = { notion, SUBSCRIBER_DB_ID };
