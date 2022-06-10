const { dataTypes } = require('../utils/utils');

const FIELDS = [
  {
    name: 'Name',
    type: dataTypes.TITLE,
  },
  {
    name: 'Password',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'Contact',
    type: dataTypes.PHONE_NUMBER,
  },
  {
    name: 'LastSeen',
    type: dataTypes.RICH_TEXT,
  },
];

const TechnicianModel = {

};

const Technician = {
  model: TechnicianModel,

  fields: FIELDS,

  get getName() { return this.model.Name?.title[0].text.content; },
  get getPassword() { return this.model.Password.rich_text[0]?.text.content; },
  get getLastSeen() { return this.model.LastSeen.rich_text[0]?.text.content; },
  get getContact() { return this.model.Contact?.phone_number; },

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
  set setPassword(value) {
    this.model.Password = {
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
  set setLastSeen(value) {
    this.model.LastSeen = {
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
  set setContact(value) {
    this.model.Contact = {
      phone_number: value,
    };
  },

};

module.exports = Technician;
