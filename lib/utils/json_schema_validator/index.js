var _ = require('lodash');
var validate = require('jsonschema').validate;

module.exports = {
  /**
   * Validate the given json object against the specified schema
   * @param  {Object} jsonSchema The json schema to validate against
   * @param  {Object} jsonObject The object to validate against the schema
   * @return {Boolean}           True if the given object is valid
   */
  validate: function(jsonSchema, jsonObject) {
    if (!jsonSchema) {
      throw new Error('JSON schema expected');
    }

    if (!jsonObject) {
      throw new Error('No JSON object to validate against schema');
    }

    var result = validate(jsonObject, jsonSchema);

    if (result.valid) {
      return true;
    } else {
      if (_.isArray(result.errors)) {
        throw new Error(result.errors[0].stack);
      }
      throw new Error('JSON object is not valid.');
    }
  }
};
