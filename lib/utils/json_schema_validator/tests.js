var chai = require('chai');
var assert = chai.assert;
var jsonSchemaValidator = require('./');

describe('lib/utils/json_schema_validator', function() {
  describe('APIs', function() {
    describe('validate', function() {
      it('should validate the given object against the specified schema', function() {
        assert.isTrue(jsonSchemaValidator.validate({'type': 'number'}, 4));
      });

      it('should throw an error if the object is not valid', function() {
        assert.throws(function() {
          jsonSchemaValidator.validate({'type': 'number'}, 'not a number');
        });
      });

      it('should throw an error if no schema is passed in', function() {
        assert.throws(function() {
          jsonSchemaValidator.validate();
        }, 'JSON schema expected');
      });

      it('should throw an error if no json object is passed in', function() {
        assert.throws(function() {
          jsonSchemaValidator.validate({'type': 'number'});
        }, 'No JSON object to validate against schema');
      });
    });
  });
});
