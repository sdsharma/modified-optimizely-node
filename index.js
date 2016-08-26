var Optimizely = require('./lib/optimizely');

/**
 * Entry point into the Optimizely Node testing SDK
 */
module.exports = {
  /**
   * Creates an instance of the Optimizely class
   * @param  {Object} config
   * @param  {Object} config.datafile
   * @param  {Object} config.errorHandler
   * @param  {Object} config.eventDispatcher
   * @param  {Object} config.logger
   * @return {Object} the Optimizely object
   */
  createInstance: function(config) {
    return new Optimizely(config);
  }
};
