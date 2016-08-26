var _ = require('lodash');

var config = {
  revision: '42',
  version: '9001',
  events: [{
    key: 'testEvent',
    experimentIds: ['111127'],
    id: '111095'
  }, {
    key: 'Total Revenue',
    experimentIds: ['111127'],
    id: '111096'
  }, {
    key: 'testEventWithAudiences',
    experimentIds: ['122227'],
    id: '111097'
  }],
  experiments: [{
    key: 'testExperiment',
    percentageIncluded: 9000,
    status: 'Running',
    audienceIds: [],
    trafficAllocation: [{
      entityId: '111128',
      endOfRange: 3999
    }, {
      entityId: '111129',
      endOfRange: 8999
    }],
    id: '111127',
    variations: [{
      key: 'control',
      id: '111128'
    }, {
      key: 'variation',
      id: '111129'
    }]
  }, {
    key: 'testExperimentWithAudiences',
    percentageIncluded: 10000,
    status: 'Running',
    audienceIds: ['11154'],
    trafficAllocation: [{
      entityId: '122228',
      endOfRange: 3999,
    }, {
      entityId: '122229',
      endOfRange: 9999
    }],
    id: '122227',
    variations: [{
      key: 'controlWithAudience',
      id: '122228'
    }, {
      key: 'variationWithAudience',
      id: '122229'
    }]
  }, {
    key: 'testExperimentNotRunning',
    percentageIncluded: 10000,
    status: 'Not started',
    audienceIds: [],
    trafficAllocation: [{
      entityId: '133338',
      endOfRange: 3999
    }, {
      entityId: '133339',
      endOfRange: 9999
    }],
    id: '133337',
    variations: [{
      key: 'controlNotRunning',
      id: '133338'
    }, {
      key: 'variationNotRunning',
      id: '133339'
    }]
  }],
  accountId: '12001',
  dimensions: [{
    key: 'browser_type',
    id: '111094',
    segmentId: '5175100584230912'
  }],
  audiences: [{
    name: 'Firefox users',
    conditions: '["and", ["or", ["or", {"name": "browser_type", "type": "custom_dimension", "value": "firefox"}]]]',
    id: '11154'
  }],
  projectId: '111001'
};

var getParsedAudiences = [{
  name: 'Firefox users',
  conditions: ["and", ["or", ["or", {"name": "browser_type", "type": "custom_dimension", "value": "firefox"}]]],
  id: '11154'
}];

var getTestProjectConfig = function() {
  return _.cloneDeep(config);
};

module.exports = {
  getTestProjectConfig: getTestProjectConfig,
  getParsedAudiences: getParsedAudiences,
};
