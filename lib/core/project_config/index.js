var _ = require('lodash');

var EXPERIMENT_RUNNING_STATUS = 'Running';
var REVENUE_GOAL_KEY = 'Total Revenue';

module.exports = {
  /**
   * Creates projectConfig object to be used for quick project property lookup
   * @param  {Object} datafile JSON datafile representing the project
   * @return {Object} Object representing project configuration
   */
  createProjectConfig: function(datafile) {
    var projectConfig = _.cloneDeep(datafile);

    // Manually parsed for audience targeting
    _.forEach(projectConfig.audiences, function(audience) {
      audience.conditions = JSON.parse(audience.conditions);
    });

    projectConfig.attributeKeyMap = module.exports._generateKeyMap(projectConfig.dimensions, 'key');
    projectConfig.eventKeyMap = module.exports._generateKeyMap(projectConfig.events, 'key');
    projectConfig.experimentKeyMap = module.exports._generateKeyMap(projectConfig.experiments, 'key');
    return projectConfig;
  },

  /**
   * Helper method to generate map from key to object in array of objects
   * @param  {Array<Object>} array Array consisting of objects.
   * @param  {string}        key Key in each object which will be key in the map
   * @return {Object}        Map mapping key to object
   */
  _generateKeyMap: function(array, key) {
    var keyMap = {};
    var obj;
    for (var i = 0; i < array.length; i++) {
      obj = array[i];
      keyMap[obj[key]] = obj;
    }
    return keyMap;
  },

  /**
   * Get experiment ID for the provided experiment key
   * @param  {Object} projectConfig Object representing project configuration
   * @param  {string} experimentKey Experiment key for which ID is to be determined
   * @return {string} Experiment ID corresponding to the provided experiment key
   */
  getExperimentId: function(projectConfig, experimentKey) {
    var experiment = projectConfig.experimentKeyMap[experimentKey];
    if (_.isEmpty(experiment)) {
      return null;
    }
    return experiment.id;
  },

  /**
   * Get experiment status for the provided experiment key
   * @param  {Object} projectConfig Object representing project configuration
   * @param  {string} experimentKey Experiment key for which status is to be determined
   * @return {string} Experiment status corresponding to the provided experiment key
   */
  getExperimentStatus: function(projectConfig, experimentKey) {
    var experiment = projectConfig.experimentKeyMap[experimentKey];
    if (_.isEmpty(experiment)) {
      return null;
    }
    return experiment.status;
  },

  /**
   * Returns whether experiment has a status of 'Running'
   * @param  {Object}  projectConfig Object representing project configuration
   * @param  {string}  experimentKey Experiment key for which status is to be compared with 'Running'
   * @return {Boolean}               true if experiment status is set to 'Running', false otherwise
   */
  isExperimentRunning: function(projectConfig, experimentKey) {
    return module.exports.getExperimentStatus(projectConfig, experimentKey) === EXPERIMENT_RUNNING_STATUS;
  },

  /**
   * Get audiences for the experiment
   * @param  {Object}         projectConfig Object representing project configuration
   * @param  {string}         experimentKey Experiment key for which audience IDs are to be determined
   * @return {Array<Object>}  Audiences corresponding to the experiment
   */
  getAudiencesForExperiment: function(projectConfig, experimentKey) {
    var experiment = projectConfig.experimentKeyMap[experimentKey];
    if (_.isEmpty(experiment)) {
      return null;
    }

    var audienceIds = experiment.audienceIds;
    var audiencesInExperiment = [];
    var audiencesInExperiment = _.filter(projectConfig.audiences, function(audience) {
      return audienceIds.indexOf(audience.id) !== -1;
    });
    return audiencesInExperiment;
  },

  /**
   * Get variation key given experiment key and variation ID
   * @param  {Object} projectConfig Object representing project configuration
   * @param  {string} experimentKey Key representing parent experiment of variation
   * @param  {string} variationId   ID of the variation
   * @return {string} Variation key
   */
  getVariationKeyFromId: function(projectConfig, experimentKey, variationId) {
    var experiment = projectConfig.experimentKeyMap[experimentKey];

    if (experiment) {
      var variationMatch = _.find(experiment.variations, function(variation) {
        return variation.id === variationId;
      });
      if (variationMatch) {
        return variationMatch.key;
      }
    }

    return null;
  },

  getVariationIdFromKey: function(projectConfig, experimentKey, variationKey) {
    var experiment = projectConfig.experimentKeyMap[experimentKey];

    if (experiment) {
      var variationMatch = _.find(experiment.variations, function(variation) {
        return variation.key === variationKey;
      });
      if (variationMatch) {
        return variationMatch.id;
      }
    }

    return null;
  },

  /**
   * Get event variation ID for an experiment from experiment key and event's variation IDs
   * @param {Object}  projectConfig     Object representing project configuration
   * @param {string}  experimentKey     Key representing an experiment that has event
   * @param {Array}   eventVariationIds Variation IDs associated with the event
   * @return {string} Event variation ID
   */
  getEventVariationIdFromExperimentKey: function(projectConfig, experimentKey, eventVariationIds) {
    var experiments = projectConfig.experiments;

    var experiment = _.find(experiments, function(exp) {
      return exp.key === experimentKey;
    });

    var experimentVariationIds = [];
    _.forEach(experiment.variations, function(variation) {
      experimentVariationIds.push(variation.id);
    });

    return _.find(eventVariationIds, function(eventVariationId) {
      return experimentVariationIds.indexOf(eventVariationId) !== -1;
    });
  },

  /**
   * Retrieves all goals in the project except 'Total Revenue'
   * @param  {Object}          projectConfig Object representing project configuration
   * @return {Array<string>}  All goal keys except Total Revenue
   */
  getGoalKeys: function(projectConfig) {
    var goalKeys = Object.keys(projectConfig.eventKeyMap);

    var goalKeysIndex = goalKeys.indexOf(REVENUE_GOAL_KEY);
    if (goalKeysIndex !== -1) {
      goalKeys.splice(goalKeysIndex, 1);
    }

    return goalKeys;
  },

  /**
   * Get ID of the revenue goal for the project
   * @param  {Object} projectConfig Object representing project configuration
   * @return {string} Revenue goal ID
   */
  getRevenueGoalId: function(projectConfig) {
    var revenueGoal = projectConfig.eventKeyMap[REVENUE_GOAL_KEY];
    return revenueGoal ? revenueGoal.id : null;
  },

  /**
   * Get experiment IDs for the provided goal key
   * @param  {Object} projectConfig Object representing project configuration
   * @param  {string} goalKey Goal key for which experiment IDs are to be retrieved
   * @return {Array<string>}  All experiment IDs for the goal
   */
  getExperimentIdsForGoal: function(projectConfig, goalKey) {
    var goal = projectConfig.eventKeyMap[goalKey];
    return goal ? goal.experimentIds : [];
  },

  /**
   * Given an experiment key, returns the traffic allocation within that experiment
   * @param  {Object} projectConfig Object representing project configuration
   * @param  {string} experimentKey Key representing the experiment
   * @return {Array<Object>}  Traffic allocation for the experiment
   */
  getTrafficAllocation: function(projectConfig, experimentKey) {
    var experiment = projectConfig.experimentKeyMap[experimentKey];
    if (_.isEmpty(experiment)) {
      return null;
    }
    return experiment.trafficAllocation;
  },
};
