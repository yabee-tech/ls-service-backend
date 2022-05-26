const { dataTypes } = require('../utils/utils');

const STATUS_ENUM = ['Paid', 'Confirmed', 'Pending'];
const FIELDS = [
  {
    name: 'Reason',
    type: dataTypes.TITLE,
  },
  {
    name: 'Attachment',
    type: dataTypes.URL,
  },
  {
    name: 'Name',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'Email',
    type: dataTypes.EMAIL,
  },
  {
    name: 'Contact',
    type: dataTypes.PHONE_NUMBER,
  },
  {
    name: 'Status',
    type: dataTypes.SELECT,
  },
  {
    name: 'SuggestedDate',
    type: dataTypes.DATE,
  },
  {
    name: 'ConfirmedDate',
    type: dataTypes.DATE,
  },
];

const BookingModel = {

};

const Booking = {
  model: BookingModel,

  fields: FIELDS,

  get getReason() { return this.model.Reason?.title[0].text.content; },
  get getAttachment() { return this.model.Attachment?.url; },
  get getName() { return this.model.Name.rich_text[0]?.text.content; },
  get getEmail() { return this.model.Email?.email; },
  get getContact() { return this.model.Contact?.phone_number; },
  get getStatus() { return this.model.Status?.select; },
  get getSuggestedDate() { return this.model.SuggestedDate?.date.start; },
  get getConfimedDate() { return this.model.ConfirmedDate?.date.start; },

  set setReason(value) {
    this.model.Reason = {
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
  set setAttachment(value) {
    this.model.Attachment = {
      url: value,
    };
  },
  set setName(value) {
    this.model.Name = {
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
  set setContact(value) {
    this.model.Contact = {
      phone_number: value,
    };
  },
  set setStatus(value) {
    this.model.Status = {
      select:
      {
        name: value,
      },
    };
  },
  set setSuggestedDate(value) {
    this.model.SuggestedDate = {
      date:
      {
        start: value,
        end: null,
      },
    };
  },
  set setConfimedDate(value) {
    this.model.ConfirmedDate = {
      date:
      {
        start: value,
        end: null,
      },
    };
  },

  STATUS_ENUM,
};

module.exports = Booking;
