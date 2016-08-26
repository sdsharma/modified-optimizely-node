/**
 * Bucketer API for determining the variation id from the specified parameters
 */
var murmurhash = require('murmurhash');
var sprintf = require('sprintf');

var HASH_SEED = 1;
var MAX_HASH_VALUE = Math.pow(2, 32);
var MAX_TRAFFIC_VALUE = 10000;

module.exports = {
  /**
   * Determines ID of variation to be shown for the given input params
   * @param  {string}   experimentId
   * @param  {string}   userId
   * @param  {Object[]} trafficAllocationConfig
   * @param  {number}   trafficAllocationConfig[].endOfRange
   * @param  {number}   trafficAllocationConfig[].entityId
   * @return {string}
   */
  bucket: function(experimentId, userId, trafficAllocationConfig) {
    var bucketingId = sprintf('%s%s', experimentId, userId);
    var bucketValue = module.exports._generateBucketValue(bucketingId);
    var entityId = null;
    for (var i = 0; i < trafficAllocationConfig.length; i++) {
      if (bucketValue <= trafficAllocationConfig[i].endOfRange) {
        entityId = trafficAllocationConfig[i].entityId;
        break;
      }
    }
    return entityId;
  },

  /**
   * Helper function to generate bucket value in half-closed interval [0, MAX_TRAFFIC_VALUE)
   * @param  {string} bucketingId String ID for bucketing
   * @return {string} the generated bucket value
   */
  _generateBucketValue: function(bucketingId) {
    try {
      // NOTE: the mmh library already does cast the hash value as an unsigned 32bit int
      // https://github.com/perezd/node-murmurhash/blob/master/murmurhash.js#L115
      var hashValue = murmurhash.v3(bucketingId, HASH_SEED);
      var ratio = hashValue / MAX_HASH_VALUE;
      return parseInt(ratio * MAX_TRAFFIC_VALUE, 10);
    } catch(ex) {
      throw new Error(sprintf('Unable to generate hash for key %s: %s', bucketingId, ex.message));
    }
  },
};
