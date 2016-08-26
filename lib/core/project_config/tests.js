var projectConfig = require('./');
var parsedAudiences = require('../../../tests/test_data').getParsedAudiences;
var testData = require('../../../tests/test_data').getTestProjectConfig();

var chai = require('chai');
var assert = chai.assert;

describe('lib/core/project_config', function() {

  describe('createProjectConfig method', function() {
    it('should set properties correctly when createProjectConfig is called', function() {
      var configObj = projectConfig.createProjectConfig(testData);

      assert.strictEqual(configObj.accountId, testData.accountId);
      assert.strictEqual(configObj.projectId, testData.projectId);
      assert.strictEqual(configObj.revision, testData.revision);
      assert.deepEqual(configObj.experiments, testData.experiments);
      assert.deepEqual(configObj.events, testData.events);

      var expectedAttributeKeyMap = {
        browser_type: testData.dimensions[0],
      };

      var expectedExperimentKeyMap = {
        testExperiment: testData.experiments[0],
        testExperimentWithAudiences: testData.experiments[1],
        testExperimentNotRunning: testData.experiments[2],
      };

      var expectedEventKeyMap = {
        testEvent: testData.events[0],
        'Total Revenue': testData.events[1],
        testEventWithAudiences: testData.events[2],
      };

      assert.deepEqual(configObj.attributeKeyMap, expectedAttributeKeyMap);
      assert.deepEqual(configObj.experimentKeyMap, expectedExperimentKeyMap);
      assert.deepEqual(configObj.eventKeyMap, expectedEventKeyMap);
    });
  });

  describe('projectConfig helper methods', function() {
    var configObj;

    beforeEach(function() {
      configObj = projectConfig.createProjectConfig(testData);
    });

    it('should retrieve experiment ID for valid experiment key in getExperimentId', function() {
      assert.strictEqual(projectConfig.getExperimentId(configObj, testData.experiments[0].key),
                         testData.experiments[0].id);
    });

    it('should return null for invalid experiment key in getExperimentId', function() {
      assert.isNull(projectConfig.getExperimentId(configObj, 'invalidExperimentKey'));
    });

    it('should retrieve experiment status for valid experiment key in getExperimentStatus', function() {
      assert.strictEqual(projectConfig.getExperimentStatus(configObj, testData.experiments[0].key),
                         testData.experiments[0].status);
    });

    it('should return null for invalid experiment key in getExperimentStatus', function() {
      assert.isNull(projectConfig.getExperimentStatus(configObj, 'invalidExperimentKey'));
    });

    it('should retrieve audiences for valid experiment key in getAudiencesForExperiment', function() {
      assert.deepEqual(projectConfig.getAudiencesForExperiment(configObj, testData.experiments[1].key),
                       parsedAudiences);
    });

    it('should return null for invalid experiment key in getAudiencesForExperiment', function() {
      assert.isNull(projectConfig.getAudiencesForExperiment(configObj, 'invalidExperimentKey'));
    });

    it('should retrieve variation key for valid experiment key and variation ID in getVariationKeyFromId', function() {
      assert.deepEqual(projectConfig.getVariationKeyFromId(configObj,
                                                           testData.experiments[0].key,
                                                           testData.experiments[0].variations[0].id),
                       testData.experiments[0].variations[0].key);
    });

    it('should return null for invalid experiment key in getVariationKeyFromId', function() {
      assert.isNull(projectConfig.getVariationKeyFromId(configObj,
                                                        'invalidExperimentKey',
                                                        testData.experiments[0].variations[0].id));
    });

    it('should return null for invalid variation ID in getVariationKeyFromId', function() {
      assert.isNull(projectConfig.getVariationKeyFromId(configObj, testData.experiments[0].key, '666'));
    });

    it('should retrieve all goal keys except Total Revenue in getGoalKeys', function() {
      assert.deepEqual(projectConfig.getGoalKeys(configObj), [testData.events[0].key, testData.events[2].key]);
    });

    it('should retrieve revenue goal ID in getRevenueGoalId', function() {
      assert.strictEqual(projectConfig.getRevenueGoalId(configObj), testData.events[1].id);
    });

    it('should retrieve experiment IDs for goal given valid goal key in getExperimentIdsForGoal', function() {
      assert.deepEqual(projectConfig.getExperimentIdsForGoal(configObj, testData.events[0].key),
                       testData.events[0].experimentIds);
    });

    it('should return empty array given invalid goal key in', function() {
      assert.deepEqual(projectConfig.getExperimentIdsForGoal(configObj, 'invalidGoalKey'), []);
    });

    it('should retrieve traffic allocation given valid experiment key in getTrafficAllocation', function() {
      assert.deepEqual(projectConfig.getTrafficAllocation(configObj, testData.experiments[0].key),
                       testData.experiments[0].trafficAllocation);
    });

    it('should return null given invalid experient key in getTrafficAllocation', function() {
      assert.isNull(projectConfig.getTrafficAllocation(configObj, 'invalidExperimentKey'));
    });
  });
});
