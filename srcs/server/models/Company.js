const { dataTypes } = require('../utils/utils');

const FIELDS = [
  {
    name: 'Name',
    type: dataTypes.TITLE,
  },
  {
    name: 'Contact',
    type: dataTypes.PHONE_NUMBER,
  },
  {
    name: 'AddressLine1',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'AddressLine2',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'State',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'Postcode',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'Email',
    type: dataTypes.EMAIL,
  },
  {
    name: 'RegistrationNumber',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'Website',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'ContactName',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'ContactPhone',
    type: dataTypes.PHONE_NUMBER,
  },
  {
    name: 'ContactEmail',
    type: dataTypes.EMAIL,
  },
];

const CompanyModel = {

};

const Company = {
  model: CompanyModel,

  fields: FIELDS,

  get getName() { return this.model.Name?.title[0].text.content; },
  get getContact() { return this.model.Contact?.phone_number; },
  get getAddressLine1() { return this.model.AddressLine1.rich_text[0]?.text.content; },
  get getAddressLine2() { return this.model.AddressLine2.rich_text[0]?.text.content; },
  get getState() { return this.model.State.rich_text[0]?.text.content; },
  get getPostcode() { return this.model.Postcode.rich_text[0]?.text.content; },
  get getEmail() { return this.model.Email?.email; },
  get getRegistrationNumber() { return this.model.RegistrationNumber.rich_text[0]?.text.content; },
  get getWebsite() { return this.model.Website.rich_text[0]?.text.content; },
  get getContactName() { return this.model.ContactName.rich_text[0]?.text.content; },
  get getContactPhone() { return this.model.ContactPhone?.phone_number; },
  get getContactEmail() { return this.model.contactEmail?.email; },

  set setName(value) {
    this.model.Name = {
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
  set setContact(value) {
    this.model.Contact = {
      phone_number: value,
    };
  },
  set setAddressLine1(value) {
    this.model.AddressLine1 = {
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
  set setAddressLine2(value) {
    this.model.AddressLine2 = {
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
  set setState(value) {
    this.model.State = {
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
  set setPostcode(value) {
    this.model.Postcode = {
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
  set setEmail(value) {
    this.model.Email = {
      email: value,
    };
  },
  set setRegistrationNumber(value) {
    this.model.RegistrationNumber = {
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
  set setWebsite(value) {
    this.model.Website = {
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
  set setContactName(value) {
    this.model.ContactName = {
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
  set setContactEmail(value) {
    this.model.ContactEmail = {
      email: value,
    };
  },
  set setContactPhone(value) {
    this.model.ContactPhone = {
      phone_number: value,
    };
  },
};

module.exports = Company;
