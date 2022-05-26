const { dataTypes } = require('../utils/utils');

const STATUS_ENUM = ['Resolved', 'Resolving', 'Immenent', 'OTW'];
const FIELDS = [
  {
    name: 'TechnicianName',
    type: dataTypes.TITLE,
  },
  {
    name: 'Booking',
    type: dataTypes.RELATION,
  },
  {
    name: 'TechnicianContact',
    type: dataTypes.PHONE_NUMBER,
  },
  {
    name: 'Status',
    type: dataTypes.SELECT,
  },
];

const RepairModel = {

};

const Repair = {
  model: RepairModel,

  fields: FIELDS,

  get getTechnicianName() { return this.model.TechnicianName?.title[0].text.content; },
  get getBooking() { return this.model.Booking.relation[0]?.id; },
  get getTechnicianContact() { return this.model.TechnicianContact?.phone_number; },
  get getStatus() { return this.model.Status?.select; },

  set setTechnicianName(value) {
    this.model.TechnicianName = {
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
  set setBooking(value) {
    this.model.Booking = {
      relation: [
        { id: value },
      ],
    };
  },
  set setTechnicianContact(value) {
    this.model.TechnicianContact = {
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

  STATUS_ENUM,
};

module.exports = Repair;
