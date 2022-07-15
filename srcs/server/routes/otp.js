const express = require('express');
require('dotenv').config();
const otpGenerator = require('otp-generator');
const CryptoJS = require('crypto-js');
const {
  genSaltSync, hashSync, compareSync,
} = require('bcrypt');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const router = express.Router();
const { Client } = require('@notionhq/client');
const OTP = require('../models/OTP');
const { sendSMSNotification } = require('../../bot/actions');

// TODO Update docs on new routes

// encrypts a raw json object
const generateEncKey = (id, model, check, secret) => {
  const res = {};

  res.id = id;
  res.check = check;
  res.expTime = model.getExpirationTime;
  return CryptoJS.AES.encrypt(JSON.stringify(res), secret).toString();
};

// recodes a raw encryption object
const decodeEncKey = (key, secret) => {
  const decrypted = CryptoJS.AES.decrypt(key, secret);
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};

// declaring constants
const { ENV } = process.env;
const SECRET = (ENV === 'dev') ? process.env.NOTION_SECRET_DEV : process.env.NOTION_SECRET;
const OTP_DB_ID = (ENV === 'dev') ? process.env.NOTION_OTP_DB_ID_DEV : process.env.NOTION_OTP_DB_ID;
const COMPANY_DB_ID = ENV === 'dev'
  ? process.env.NOTION_COMPANY_DB_ID_DEV
  : process.env.NOTION_COMPANY_DB_ID;

/**
 * Takes in a raw notion api object and converts it into a
 * more redable and less verbose json response
 *
 * @param {*} raw Raw notion api response object
 * @returns a less verbose JSON response of the object
 */
const serializeCompanyObject = (raw) => {
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

// To add minutes to the current time
const AddMinutesToDate = (date, minutes) => new Date(date.getTime() + minutes * 60000);

// The expiration time in minutes
const OTP_EXPIRATION_TIME = 10;

const notion = new Client({
  auth: SECRET,
});

// send new otp to body phone number
router.post('/phoneNumber', async (req, res) => {
  try {
    // obtain phone number from body
    const { phoneNumber } = req.body;

    // generate ex date
    const now = new Date();
    const expirationTime = AddMinutesToDate(now, OTP_EXPIRATION_TIME);

    // generate OTP
    const otp = otpGenerator.generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });

    // generate database object
    const model = OTP;

    // check phoneNumber exist
    if (!phoneNumber) return res.status(400).json({ status: 400, error: 'No phone number provided' });

    // check phoneNumber if it is a valid Malaysian phone number
    const number = phoneUtil.parseAndKeepRawInput(phoneNumber, 'MY');
    if (!phoneUtil.isValidNumberForRegion(number, 'MY')) return res.status(400).json({ status: 400, error: 'Not a valid Malaysian phone number' });

    // formatted phone number
    const formattedPhoneNumber = phoneUtil.format(number, PNF.E164);

    // check if phone number is registered
    const notionRes2 = await notion.databases.query({ database_id: COMPANY_DB_ID, page_size: 1, filter: { property: 'ContactPhone', phone_number: { equals: formattedPhoneNumber } } });
    if (notionRes2.results.length === 0) return res.status(404).json({ status: 404, error: `${formattedPhoneNumber} is not registered` });

    // generate model object
    const salt = genSaltSync();
    model.setOTP = hashSync(otp, salt);// encrypt here
    model.setExpirationTime = expirationTime.toISOString();
    model.setVerified = false;

    // save model in db
    const notionRes = await notion.pages.create({
      parent: {
        database_id: OTP_DB_ID,
      },
      properties: model.model,
    });

    // send otp
    console.log(`Sending OTP of ${otp} to ${formattedPhoneNumber}...`);
    await sendSMSNotification(formattedPhoneNumber, `Your OTP for LS Machinery's App is ${otp}`);

    return res.status(200).json({
      status: 201,
      data: { key: generateEncKey(notionRes.id, model, formattedPhoneNumber, 'secret123'), check: formattedPhoneNumber },
    });
  } catch (error) {
    console.error(error);
    return res.status(error.status ? error.status : 500)
      .json({ status: error.status ? error.status : 500, error });
  }
});

// verify otp
router.post('/verify', async (req, res) => {
  // obtain otp and key from body
  const { otp, key, check } = req.body;
  let decodedKey;

  if (!otp || !key || !check) { return res.status(400).json({ status: 400, error: 'No otp, key or check provided' }); }

  try {
    // decode key and check phoneNumber
    decodedKey = decodeEncKey(key, 'secret123');
    if (decodedKey.check !== check) return res.status(400).json({ status: 400, error: 'OTP not for this check' });
  } catch (error) {
    if (error.message === 'Malformed UTF-8 data') return res.status(400).json({ status: 400, error: 'Bad key' });
  }

  // verify otp
  if (!decodedKey) return res.status(400).json({ status: 400, error: 'Bad key' });
  const notionRes = await notion.pages.retrieve({
    page_id: decodedKey.id,
  });
  if (!notionRes) return res.status(404).json({ status: 404, error: 'No OTP found' });

  // check otp correctness
  if (!compareSync(otp, notionRes.properties.OTP.title[0]?.text.content)) return res.status(404).json({ status: 404, error: 'OTP Incorrect' });

  // check for expiry date
  const expDate = new Date(notionRes
    .properties
    .ExpirationTime
    .rich_text[0]
    .text
    .content);
  const now = new Date();
  console.log(expDate.getTime() > now.getTime());
  if (expDate.getTime() < now.getTime()) return res.status(400).json({ status: 400, error: 'OTP Expired' });

  // check for verified status
  if (notionRes
    .properties
    .Verified
    .checkbox) return res.status(400).json({ status: 400, error: 'OTP Used' });

  // update verified status
  try {
    await notion.pages.update({
      page_id: decodedKey.id,
      properties: {
        Verified: {
          checkbox: true,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, error: error.message });
  }

  // fetch the company data
  const notionRes2 = await notion.databases.query({ database_id: COMPANY_DB_ID, page_size: 1, filter: { property: 'ContactPhone', phone_number: { equals: check } } });
  if (notionRes2.results.length === 0) return res.status(404).json({ status: 404, error: `${check} is not registered` });

  return res.json({ status: 200, data: serializeCompanyObject(notionRes2.results[0]) });
});

module.exports = router;
