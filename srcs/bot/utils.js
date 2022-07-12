const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const DEFAULT_COUNTRY_CODE = 'MY';

function getFormattedPhoneNumber(rawPhoneNumber) {
  // parse the raw input with libphonenumber
  const number = phoneUtil.parseAndKeepRawInput(rawPhoneNumber, DEFAULT_COUNTRY_CODE);
  // concatenate into this format `+60123456789` and return
  return `+${number.getCountryCode()}${number.getNationalNumber()}`;
}

module.exports = { getFormattedPhoneNumber };
