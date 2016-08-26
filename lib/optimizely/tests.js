var Optimizely = require('./');
var bucketer = require('../core/bucketer');
var eventDispatcher = require('../core/event_dispatcher');
var packageJSON = require('../../package.json');
var testData = require('../../tests/test_data');

var _ = require('lodash');
var bluebird = require('bluebird');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var sinon = require('sinon');
var sprintf = require('sprintf');

describe('lib/optimizely', function() {
  describe('constructor', function() {
    var stubErrorHandler = { handleError: function() {}};
    beforeEach(function() {
      sinon.stub(stubErrorHandler, 'handleError');
    });

    afterEach(function() {
      stubErrorHandler.handleError.restore();
    });

    it('should construct an instance of the Optimizely class', function() {
      var optlyInstance = new Optimizely({ datafile: testData.getTestProjectConfig() });
      expect(optlyInstance).to.be.an.instanceOf(Optimizely);

      assert.isObject(optlyInstance.logger);
      assert.isFunction(optlyInstance.logger.log);

      assert.isObject(optlyInstance.errorHandler);
      assert.isFunction(optlyInstance.errorHandler.handleError);

      assert.isObject(optlyInstance.eventDispatcher);
      assert.isFunction(optlyInstance.eventDispatcher.dispatchEvent);
    });

    it('should throw an error if a datafile is not passed into the constructor', function() {
      new Optimizely({ errorHandler: stubErrorHandler });
      sinon.assert.calledWith(stubErrorHandler.handleError, new Error('No datafile specified. Cannot start optimizely.'));
    });

    it('should throw an error if the datafile is not valid', function() {
      var invalidDatafile = testData.getTestProjectConfig();
      delete invalidDatafile['projectId'];

      new Optimizely({ errorHandler: stubErrorHandler, datafile: invalidDatafile });
      sinon.assert.calledOnce(stubErrorHandler.handleError);
    });
  });

  describe('APIs', function() {
    var optlyInstance;
    var bucketStub;

    var url = 'https://111001.log.optimizely.com/event';

    beforeEach(function() {
      optlyInstance = new Optimizely({ datafile: testData.getTestProjectConfig() });
      bucketStub = sinon.stub(bucketer, 'bucket');
      sinon.stub(eventDispatcher, 'dispatchEvent').returns(bluebird.resolve());
    });

    afterEach(function() {
      bucketer.bucket.restore();
      eventDispatcher.dispatchEvent.restore();
    });

    describe('activate', function() {
      it('should call bucketer and dispatchEvent with proper args and return variation key', function() {
        var expectedParams1 = {
          d: '12001',
          a: '111001',
          n: 'visitor-event',
          'x111127': '111129',
          g: '111127',
          u: 'oeu-testUser',
          src: sprintf('node-sdk-%s', packageJSON.version),
          time: Math.round(new Date().getTime() / 1000.0),
        };

        var expectedVariation1 = 'variation';

        bucketStub.returns('111129');
        // activate without attributes
        var activate1 = optlyInstance.activate('testExperiment', 'testUser');

        var expectedParams2 = {
          d: '12001',
          a: '111001',
          n: 'visitor-event',
          'x122227': '122229',
          g: '122227',
          u: 'oeu-testUser',
          src: sprintf('node-sdk-%s', packageJSON.version),
          time: Math.round(new Date().getTime() / 1000.0),
          's5175100584230912': 'firefox',
        };

        var expectedVariation2 = 'variationWithAudience';

        bucketStub.returns('122229');
        // activate with attributes
        var activate2 = optlyInstance.activate('testExperimentWithAudiences', 'testUser', {browser_type: 'firefox'});

        bluebird.all([activate1, activate2]).spread(function(variation1, variation2) {
          assert(bucketer.bucket.calledTwice);
          assert(eventDispatcher.dispatchEvent.calledTwice);

          var eventDispatcherCall1 = eventDispatcher.dispatchEvent.args[0];
          assert.strictEqual(eventDispatcherCall1[0], url);
          assert.deepEqual(eventDispatcherCall1[1], expectedParams1);

          var eventDispatcherCall2 = eventDispatcher.dispatchEvent.args[1];
          assert.strictEqual(eventDispatcherCall2[0], url);
          assert.deepEqual(eventDispatcherCall2[1], expectedParams2);

          assert.strictEqual(expectedVariation1, variation1);
          assert.strictEqual(expectedVariation2, variation2);
        });
      });

      it('should return null if user is not in audience or experiment is not running', function() {
        var activateReturnsNull1 = optlyInstance.activate('testExperimentWithAudiences', 'testUser', {});
        var activateReturnsNull2 = optlyInstance.activate('testExperimentNotRunning', 'testUser');

        bluebird.all([activateReturnsNull1, activateReturnsNull2]).spread(function(variation1, variation2) {
          assert.isNull(variation1);
          assert.isNull(variation2);
        });
      });
    });

    describe('track', function() {
      it('should call bucketer and dispatchEvent with proper args', function() {
        // track event without attributes or event value
        var expectedParams1 = {
          d: '12001',
          a: '111001',
          n: 'testEvent',
          'x111127': '111129',
          g: '111095',
          u: 'oeu-testUser',
          src: sprintf('node-sdk-%s', packageJSON.version),
          time: Math.round(new Date().getTime() / 1000.0),
        };

        bucketStub.returns('111129');
        var track1 = optlyInstance.track('testEvent', 'testUser');

        // track event with attributes
        var expectedParams2 = {
          d: '12001',
          a: '111001',
          n: 'testEventWithAudiences',
          'x122227': '122229',
          g: '111097',
          u: 'oeu-testUser',
          src: sprintf('node-sdk-%s', packageJSON.version),
          time: Math.round(new Date().getTime() / 1000.0),
          's5175100584230912': 'firefox',
        };

        bucketStub.returns('122229');
        var track2 = optlyInstance.track('testEventWithAudiences', 'testUser', {browser_type: 'firefox'});

        // track event with event value
        var expectedParams3 = _.cloneDeep(expectedParams1);
        expectedParams3.v = 4200;
        expectedParams3.g = '111095,111096';

        bucketStub.returns('111129');
        var track3 = optlyInstance.track('testEvent', 'testUser', undefined, 4200);

        bluebird.all([track1, track2, track3]).spread(function(result1, result2, result3) {
          assert(bucketer.bucket.calledThrice);
          assert(eventDispatcher.dispatchEvent.calledThrice);

          var eventDispatcherCall1 = eventDispatcher.dispatchEvent.args[0];
          assert.strictEqual(eventDispatcherCall1[0], url);
          assert.deepEqual(eventDispatcherCall1[1], expectedParams1);

          var eventDispatcherCall2 = eventDispatcher.dispatchEvent.args[1];
          assert.strictEqual(eventDispatcherCall2[0], url);
          assert.deepEqual(eventDispatcherCall2[1], expectedParams2);

          var eventDispatcherCall3 = eventDispatcher.dispatchEvent.args[2];
          assert.strictEqual(eventDispatcherCall3[0], url);
          assert.deepEqual(eventDispatcherCall3[1], expectedParams3);
        });
      });
    });

    describe('getVariation', function() {
      it('should call bucketer and return variation key', function() {
        var expected1 = 'variation';

        bucketStub.returns('111129');
        // get variation without attributes
        var getVariation1 = optlyInstance.getVariation('testExperiment', 'testUser');

        var expected2 = 'variationWithAudience';

        bucketStub.returns('122229');
        // get variation with attributes
        var getVariation2 = optlyInstance.getVariation('testExperimentWithAudiences',
                                                       'testUser',
                                                       {browser_type: 'firefox'});

        bluebird.all([getVariation1, getVariation2]).spread(function(variation1, variation2) {
          assert.strictEqual(expected1, variation1);
          assert.strictEqual(expected2, variation2);
          assert(bucketer.bucket.calledTwice);
        });
      });

      it('should return null if user is not in audience or experiment is not running', function() {
        var getVariationReturnsNull1 = optlyInstance.getVariation('testExperimentWithAudiences', 'testUser', {});
        var getVariationReturnsNull2 = optlyInstance.getVariation('testExperimentNotRunning', 'testUser');

        bluebird.all([getVariationReturnsNull1, getVariationReturnsNull2]).spread(function(variation1, variation2) {
          assert.isNull(variation1);
          assert.isNull(variation2);
        });
      });
    });
  });
});
