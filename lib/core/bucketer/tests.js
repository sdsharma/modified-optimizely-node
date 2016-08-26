var bucketer = require('./');
var sprintf = require('sprintf');

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var sinon = require('sinon');

describe('lib/core/bucketer', function() {
  describe('APIs', function() {
    describe('bucket', function() {
      beforeEach(function() {
        sinon.stub(bucketer, '_generateBucketValue')
          .onFirstCall().returns(50)
          .onSecondCall().returns(5000)
          .onThirdCall().returns(50000);
      });

      afterEach(function() {
        bucketer._generateBucketValue.restore();
      });

      it('should return correct variation ID when provided bucket value', function() {
        var experimentId = 1886780721;
        var trafficAllocation = [
          {
            entityId: '1234',
            endOfRange: 4999,
          },
          {
            entityId: '4321',
            endOfRange: 9499,
          }
        ];

        expect(bucketer.bucket(experimentId, 'ppid1', trafficAllocation)).to.equal('1234');
        expect(bucketer.bucket(experimentId, 'ppid2', trafficAllocation)).to.equal('4321');
        expect(bucketer.bucket(experimentId, 'ppid3', trafficAllocation)).to.equal(null);
      });
    });

    describe('_generateBucketValue', function() {
      it('should return a bucket value for different inputs', function() {
        var experimentId = 1886780721;
        var bucketingId1 = sprintf('%s%s', 'ppid1', experimentId);
        var bucketingId2 = sprintf('%s%s', 'ppid2', experimentId);
        var bucketingId3 = sprintf('%s%s', 'ppid2', 1886780722);
        var bucketingId4 = sprintf('%s%s', 'ppid3', experimentId);

        expect(bucketer._generateBucketValue(bucketingId1)).to.equal(5254);
        expect(bucketer._generateBucketValue(bucketingId2)).to.equal(4299);
        expect(bucketer._generateBucketValue(bucketingId3)).to.equal(2434);
        expect(bucketer._generateBucketValue(bucketingId4)).to.equal(5439);
      });

      it('should return an error if it cannot generate the hash value', function() {
        assert.throws(function() {
          bucketer._generateBucketValue(null);
        }, 'Unable to generate hash for key null: Cannot read property \'length\' of null');
      });
    });
  });
});
