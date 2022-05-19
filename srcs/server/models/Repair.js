const STATUS_ENUM = ['Resolved', 'Resolving', 'Immenent', 'OTW'];

const RepairModel = {

};

const Repair = {
  model: RepairModel,

  get getTechnicianName() { return this.model.TechnicianName?.title[0].text.content; },
  get getBooking() { return this.model.Booking.rich_text[0]?.text.content; },
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
