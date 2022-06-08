const dataTypes = require('../enums/dataTypes');

/**
 * Resolves the data type given the model fields to search for and the field name
 *
 * @param {Fields} modelfields Model fields specified in each model
 * @param {string} field The field that you want to search for
 * @returns dataType if field is found or null if it isnt
 */
const resolveDataType = (modelfields, field) => {
  const foundField = modelfields.filter((e) => e.name === field);

  if (foundField.length !== 1) return null;
  return foundField[0].type;
};

/**
 * Generates filter object compatable with notion API
 *
 * @param {Model} modelfields Model object defined in services/models
 * @param {string} filterBy The filter value
 * @param {string} filterOn The filter subject
 */
const generateFilter = (modelfields, filterBy, filterOn) => {
  const filterObj = {};
  const type = resolveDataType(modelfields, filterOn);

  if (!type) return null;
  filterObj.property = filterOn;
  if (type === dataTypes.RICH_TEXT) filterObj.rich_text = { equals: filterBy };
  else if (type === dataTypes.PHONE_NUMBER) filterObj.phone_number = { equals: filterBy };
  else if (type === dataTypes.NUMBER) filterObj.number = { equals: parseInt(filterBy, 10) };
  else if (type === dataTypes.CHECKBOX) filterObj.checkbox = { equals: !!(filterBy === true || filterBy === 'true') };
  else if (type === dataTypes.SELECT) filterObj.select = { equals: filterBy };
  else if (type === dataTypes.MULTI_SELECT) filterObj.multi_select = { equals: filterBy };
  else if (type === dataTypes.DATE) filterObj.date = { equals: filterBy };
  else if (type === dataTypes.PEOPLE) filterObj.people = { equals: filterBy };
  else if (type === dataTypes.FILES) filterObj.files = { equals: filterBy };
  else if (type === dataTypes.RELATION) filterObj.relation = { contains: filterBy };
  else if (type === dataTypes.FORMULA) filterObj.formula = { equals: filterBy };
  else if (type === dataTypes.CREATED_TIME) filterObj.created_time = { equals: filterBy };
  else if (type === dataTypes.LAST_EDITED_TIME) filterObj.last_edited_time = { equals: filterBy };
  else if (type === dataTypes.URL) filterObj.url = { equals: filterBy };
  else if (type === dataTypes.TITLE) filterObj.title = { equals: filterBy };
  return filterObj;
};

module.exports = {
  generateFilter,
};
