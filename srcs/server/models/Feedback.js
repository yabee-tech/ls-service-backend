const { dataTypes } = require('../utils/utils');

const TYPE_ENUM = ['Customer', 'Technician'];
const FIELDS = [
  {
    name: 'Remarks',
    type: dataTypes.TITLE,
  },
  {
    name: 'Attachment',
    type: dataTypes.URL,
  },
  {
    name: 'Repair',
    type: dataTypes.RELATION,
  },
  {
    name: 'Type',
    type: dataTypes.SELECT,
  },
  {
    name: 'Rating',
    type: dataTypes.NUMBER,
  },
];

const FeedbackModel = {

};

const Feedback = {
  model: FeedbackModel,

  fields: FIELDS,

  get getRemarks() { return this.model.Remarks?.title[0].text.content; },
  get getAttachment() { return this.model.Attachment?.url; },
  get getRepair() { return this.model.Repair?.relation[0].id; },
  get getType() { return this.model.Type?.select; },
  get getRating() { return this.model.Rating?.number; },

  set setRemarks(value) {
    this.model.Remarks = {
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

  set setRepair(value) {
    this.model.Repair = {
      relation: [
        { id: value },
      ],
    };
  },

  set setType(value) {
    this.model.Type = {
      select:
            {
              name: value,
            },
    };
  },

  set setRating(value) {
    this.model.Rating = {
      number: value,
    };
  },

  TYPE_ENUM,
};

module.exports = Feedback;
