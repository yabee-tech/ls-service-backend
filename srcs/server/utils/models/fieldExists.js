/**
 * Checks if field exists in a given modekfield
 *
 * @param {Model} modelfields Model object defined in server/models
 * @param {string} field the field to check for
 * @returns true if field exists and false otherwise
 */
const fieldExists = (modelfields, field) => {
  const foundFields = modelfields.filter((elem) => elem.name === field);
  return foundFields.length > 0;
};

module.exports = {
  fieldExists,
};
