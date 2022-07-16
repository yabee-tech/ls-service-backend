const { dataTypes } = require('../utils/utils');

const STATUS_ENUM = ['Paid', 'Confirmed', 'Pending'];
const FIELDS = [
  {
    name: 'Reason',
    type: dataTypes.TITLE,
  },
  {
    name: 'Attachment1',
    type: dataTypes.URL,
  },
  {
    name: 'Attachment2',
    type: dataTypes.URL,
  },
  {
    name: 'Attachment3',
    type: dataTypes.URL,
  },
  {
    name: 'Name',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'Machine',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'CompanyName',
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
  {
    name: 'ConfirmedTime',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'Address',
    type: dataTypes.RICH_TEXT,
  },
];

const BookingModel = {

};

const Booking = {
  model: BookingModel,

  fields: FIELDS,

  get getReason() { return this.model.Reason?.title[0].text.content; },
  get getAttachment1() { return this.model.Attachment1?.url; },
  get getAttachment2() { return this.model.Attachment2?.url; },
  get getAttachment3() { return this.model.Attachment3?.url; },
  get getName() { return this.model.Name.rich_text[0]?.text.content; },
  get getMachine() { return this.model.Machine.rich_text[0]?.text.content; },
  get getCompanyName() { return this.model.CompanyName.rich_text[0]?.text.content; },
  get getEmail() { return this.model.Email?.email; },
  get getContact() { return this.model.Contact?.phone_number; },
  get getStatus() { return this.model.Status?.select; },
  get getSuggestedDate() { return this.model.SuggestedDate?.date.start; },
  get getConfimedDate() { return this.model.ConfirmedDate?.date.start; },
  get getConfirmedTime() { return this.model.ConfirmedTime.rich_text[0]?.text.content; },
  get getAddress() { return this.model.Address.rich_text[0]?.text.content; },

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
  set setAttachment1(value) {
    this.model.Attachment1 = {
      url: value,
    };
  },
  set setAttachment2(value) {
    this.model.Attachment2 = {
      url: value,
    };
  },
  set setAttachment3(value) {
    this.model.Attachment3 = {
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
  set setMachine(value) {
    this.model.Machine = {
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
  set setCompanyName(value) {
    this.model.CompanyName = {
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
  set setConfirmedDate(value) {
    this.model.ConfirmedDate = {
      date:
      {
        start: value,
        end: null,
      },
    };
  },
  set setConfirmedTime(value) {
    this.model.ConfirmedTime = {
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

  set setAddress(value) {
    this.model.Address = {
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

  STATUS_ENUM,
};

module.exports = Booking;
