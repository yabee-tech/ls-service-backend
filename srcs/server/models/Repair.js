const { dataTypes } = require('../utils/utils');

const STATUS_ENUM = ['Resolved', 'Resolving', 'Immenent', 'OTW', 'Incomplete'];
const FIELDS = [
  {
    name: 'Technician',
    type: dataTypes.RELATION,
  },
  {
    name: 'Booking',
    type: dataTypes.RELATION,
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

  get getTechnician() { return this.model.Technician.relation[0]?.id; },
  get getBooking() { return this.model.Booking.relation[0]?.id; },
  get getStatus() { return this.model.Status?.select; },

  set setTechnician(value) {
    this.model.Technician = {
      relation: [
        { id: value },
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
