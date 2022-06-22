const { dataTypes } = require('../utils/utils');

const STATUS_ENUM = ['Resolved', 'Resolving', 'Immenent', 'OTW', 'Incomplete'];
const FIELDS = [
  {
    name: 'OTP',
    type: dataTypes.TITLE,
  },
  {
    name: 'ExpirationTime',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'Verified',
    type: dataTypes.CHECKBOX,
  },
];

const OTPModel = {

};

const OTP = {
  model: OTPModel,

  fields: FIELDS,

  get getOTP() { return this.model.OTP?.title[0].text.content; },
  get getExpirationTime() { return this.model.ExpirationTime.rich_text[0]?.text.content; },
  get getVerified() { return this.model.Verified?.checkbox; },

  set setOTP(value) {
    this.model.OTP = {
      title:
    [
      {
        text:
      {
        content: value,
      },
      },
    ],
    };
  },
  set setExpirationTime(value) {
    this.model.ExpirationTime = {
      rich_text:
      [
        {
          text:
        {
          content: value,
        },
        },
      ],
    };
  },
  set setVerified(value) {
    this.model.Verified = {
      checkbox: value,
    };
  },

  STATUS_ENUM,
};

module.exports = OTP;
