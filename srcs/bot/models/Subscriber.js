const { dataTypes } = require('../../server/utils/utils');

const FIELDS = [
  {
    name: 'Name',
    type: dataTypes.TITLE,
  },
  {
    name: 'Username',
    type: dataTypes.RICH_TEXT,
  },
  {
    name: 'ChatID',
    type: dataTypes.RICH_TEXT,
  },
];

const SubscriberModel = {

};

const Subscriber = {
  model: SubscriberModel,

  fields: FIELDS,

  get getName() { return this.model.Name.title[0].text.content; },
  get getUsername() { return this.model.Username.rich_text[0].text.content; },
  get getChatID() { return this.model.ChatID.rich_text[0].text.content; },

  set setName(value) {
    this.model.Name = { title: [{ text: { content: value } }] };
  },
  set setUsername(value) {
    this.model.Username = { rich_text: [{ text: { content: value } }] };
  },
  set setChatID(value) {
    this.model.ChatID = { rich_text: [{ text: { content: value } }] };
  },
};

module.exports = Subscriber;
