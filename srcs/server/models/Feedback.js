const TYPE_ENUM = ['Customer', 'Technician'];

const FeedbackModel = {

};

const Feedback = {
  model: FeedbackModel,

  get getRemarks() { return this.model.Remarks?.title[0].text.content; },
  get getAttachment() { return this.model.Attachment?.url; },
  get getRepair() { return this.model.Repair.rich_text[0]?.text.content; },
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
