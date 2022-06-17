require('dotenv').config();

// processing environment variables
const { ENV } = process.env;
const TWILIO_ACCOUNT_SID = (ENV === 'dev') ? process.env.TWILIO_ACCOUNT_SID_DEV : process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = (ENV === 'dev') ? process.env.TWILIO_AUTH_TOKEN_DEV : process.env.TWILIO_AUTH_TOKEN;
const TWILIO_MESSAGING_SERVICE_SID = (ENV === 'dev') ? process.env.TWILIO_MESSAGING_SERVICE_SID_DEV : process.env.TWILIO_MESSAGING_SERVICE_SID;

const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

module.exports = { twilio, TWILIO_MESSAGING_SERVICE_SID };
