var _ = require('lodash');
var audienceEvaluator = require('../core/audience_evaluator');
var bluebird = require('bluebird');
var bucketer = require('../core/bucketer');
var defaultErrorHandler = require('../core/error_handler');
var defaultEventDispatcher = require('../core/event_dispatcher');
var eventBuilder = require('../core/event_builder');
var eventDispatcher = require('../core/event_dispatcher');
var jsonSchemaValidator = require('../utils/json_schema_validator');
var logger = require('../core/logger');
var projectConfig = require('../core/project_config');
var projectConfigSchema = require('./project_config_schema');
var sprintf = require('sprintf');

var LOG_LEVEL = logger.enums.LOG_LEVEL;
/**
 * The Optimizely class
 * @param {Object} config
 * @param {Object} config.datafile
 * @param {Object} config.errorHandler
 * @param {Object} config.eventDispatcher
 * @param {Object} config.logger
 */
function Optimizely(config) {
  this.logger = config.logger || logger.createLogger({ logLevel: LOG_LEVEL.INFO });
  this.eventDispatcher = config.eventDispatcher || defaultEventDispatcher;
  this.errorHandler = config.errorHandler || defaultErrorHandler;

  if (!config.datafile) {
    var errorMessage = 'No datafile specified. Cannot start optimizely';
    this.logger.log(LOG_LEVEL.ERROR, errorMessage);
    this.errorHandler.handleError(new Error(errorMessage));
  } else {
    try {
      if (jsonSchemaValidator.validate(projectConfigSchema, config.datafile)) {
        this.configObj = projectConfig.createProjectConfig(config.datafile);
        this.logger.log(LOG_LEVEL.INFO, 'Datafile is valid');
      }
    } catch (ex) {
      this.logger.log(LOG_LEVEL.ERROR, 'Datafile is invalid: ' + ex.message);
      this.errorHandler.handleError(ex);
    }
  }
}

/**
 * Buckets visitor and sends impression event to Optimizely.
 * @param  {string} experimentKey
 * @param  {string} userId
 * @param  {Object} attributes
 * @return {Promise<string>}
 */
Optimizely.prototype.activate = function(experimentKey, userId, attributes) {
  var variationId;
  var audiences = projectConfig.getAudiencesForExperiment(this.configObj, experimentKey);
  if (!audienceEvaluator.evaluate(audiences, attributes) || !projectConfig.isExperimentRunning(this.configObj, experimentKey)) {
    var failedEvaluationLogMessage = sprintf('User: %s failed audience evaluation and was not bucketed into experiment: %s', userId, experimentKey);
    this.logger.log(LOG_LEVEL.INFO, failedEvaluationLogMessage);
    return bluebird.resolve(null);
  }
  var trafficAllocationConfig = projectConfig.getTrafficAllocation(this.configObj, experimentKey);
  var variationId = bucketer.bucket(experimentKey, userId, trafficAllocationConfig);
  var impressionEventParams = eventBuilder.createImpressionEventParams(this.configObj, experimentKey, variationId, userId, attributes);

  var url = eventBuilder.getUrl(this.configObj);
  return eventDispatcher.dispatchEvent(url, impressionEventParams)
    .then(function() {
      var variationKey = projectConfig.getVariationKeyFromId(this.configObj, experimentKey, variationId);
      var activatedLogMessage = sprintf('Activated experiment: %s with variation: %s', experimentKey, variationKey);
      this.logger.log(LOG_LEVEL.INFO, activatedLogMessage);
      return variationKey;
    }.bind(this));
};

Optimizely.prototype.activateVariation = function(experimentKey, userId, variationKey, attributes) {
  var variationId = projectConfig.getVariationIdFromKey(this.configObj, experimentKey, variationKey);
  var impressionEventParams = eventBuilder.createImpressionEventParams(this.configObj, experimentKey, variationId, userId, attributes);

  var url = eventBuilder.getUrl(this.configObj);
  return eventDispatcher.dispatchEvent(url, impressionEventParams)
    .then(function() {
      var activatedLogMessage = sprintf('Activated experiment: %s with variation: %s', experimentKey, variationKey);
      this.logger.log(LOG_LEVEL.INFO, activatedLogMessage);
      return variationKey;
    }.bind(this));
};

/**
 * Sends conversion event to Optimizely.
 * @param  {string} eventKey
 * @param  {string} userId
 * @param  {string} attributes
 * @param  {string} eventValue
 * @return {Promise<Object>}
 */
Optimizely.prototype.track = function(eventKey, userId, attributes, eventValue) {
  var variationIds = this.__getVariationIdsFromEventKey(this.configObj, eventKey, userId);
  var conversionEventParams = eventBuilder.createConversionEventParams(
    this.configObj,
    eventKey,
    userId,
    attributes,
    eventValue,
    variationIds
  );

  var url = eventBuilder.getUrl(this.configObj);
  return eventDispatcher.dispatchEvent(url, conversionEventParams)
    .then(function() {
      this.logger.log(LOG_LEVEL.INFO, 'Tracked conversion for event: ' + eventKey);
    }.bind(this));
};

/**
 * Gets variation where visitor will be bucketed.
 * @param  {string} experimentKey
 * @param  {string} userId
 * @param  {Object} attributes
 * @return {string} the active variation
 */
Optimizely.prototype.getVariation = function(experimentKey, userId, attributes) {
  var trafficAllocationConfig = projectConfig.getTrafficAllocation(this.configObj, experimentKey);
  var audiences = projectConfig.getAudiencesForExperiment(this.configObj, experimentKey);
  if (!audienceEvaluator.evaluate(audiences, attributes) || !projectConfig.isExperimentRunning(this.configObj, experimentKey)) {
    return null;
  }

  try {
    var variationId = bucketer.bucket(experimentKey, userId, trafficAllocationConfig);
    return projectConfig.getVariationKeyFromId(this.configObj, experimentKey, variationId);
  } catch (ex) {
    this.errorHandler.handleError(ex);
  }
  return null;
};

/**
 * Given a user ID and an event key, returns variation ID
 * @param {string} eventKey Event key being tracked for conversion event
 * @param {string} userId   ID of user
 * @returns {Array<string>}
 */
Optimizely.prototype.__getVariationIdsFromEventKey = function(configObj, eventKey, userId) {
  var experimentKeys = _.filter(Object.keys(configObj.experimentKeyMap), function(experimentKey) {
    var experimentId = projectConfig.getExperimentId(configObj, experimentKey);
    var experimentIdsForGoal = projectConfig.getExperimentIdsForGoal(configObj, eventKey);

    return experimentId && (experimentIdsForGoal.indexOf(experimentId) !== -1);
  });

  var variationIds = _.map(experimentKeys, function(experimentKey) {
    var trafficAllocationConfig = projectConfig.getTrafficAllocation(configObj, experimentKey);
    return bucketer.bucket(experimentKey, userId, trafficAllocationConfig);
  });

  return variationIds;
};

module.exports = Optimizely;
