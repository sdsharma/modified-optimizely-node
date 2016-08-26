/*eslint-disable */
/**
 * Project Config JSON Schema file used to validate the project json datafile
 */
module.exports = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "projectId": {
      "type": "string"
    },
    "accountId": {
      "type": "string"
    },
    "experiments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "key": {
            "type": "string"
          },
          "variations": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string"
                },
                "key": {
                  "type": "string"
                }
              },
              "required": [
                "id",
                "key"
              ]
            }
          },
          "trafficAllocation": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "entityId": {
                  "type": "string"
                },
                "endOfRange": {
                  "type": "integer"
                }
              },
              "required": [
                "entityId",
                "endOfRange"
              ]
            }
          },
          "percentageIncluded": {
            "type": "integer"
          },
          "audienceIds": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "id",
          "key",
          "variations",
          "trafficAllocation",
          "percentageIncluded",
          "audienceIds"
        ]
      }
    },
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "key": {
            "type": "string"
          },
          "experimentIds": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "id": {
            "type": "string"
          }
        },
        "required": [
          "key",
          "experimentIds",
          "id"
        ]
      }
    },
    "audiences": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "conditions": {
            "type": "string"
          }
        },
        "required": [
          "id",
          "name",
          "conditions"
        ]
      }
    },
    "dimensions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "key": {
            "type": "string"
          },
          "segmentId": {
            "type": "string"
          }
        },
        "required": [
          "id",
          "key",
          "segmentId",
        ]
      }
    },
    "version": {
      "type": "string"
    },
    "revision": {
      "type": "string"
    },
  },
  "required": [
    "projectId",
    "accountId",
    "experiments",
    "events",
    "audiences",
    "dimensions",
    "version",
    "revision",
  ]
};
