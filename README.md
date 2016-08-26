#Optimizely Node SDK

This Node SDK allows you to use the Optimizely testing framework to set up and manage your Custom experiments.

##Usage

###Create an instance
```
var optimizely = require('optimizely-testing-sdk-node');

var optimizelyInstance = optimizely.createInstance({
  datafile: datafile,
  errorHandler: errorHandler,
  eventDispatcher: eventDispatcher,
  logger: logger
});
```

###APIs
```
optimizelyInstance.activate(experimentKey, userId, attributes);

optimizelyInstance.activateVariation(experimentKey, userId, variationKey, attributes);

optimizelyInstance.track(eventKey, userId, attributes, eventValue);

optimizelyInstance.getVariation(experimentKey, userId, attributes);
```

###Added Functionality

Do manual bucketing of variations and simply provide the variation key to activate the instance.

###Directory structure

Main file is `index.js` at the root of the directory

All other source code should be put into `lib/`.

Each "class" should follow the module pattern:
```js
lib/optimizely/
├── index.js // MAIN ENTRY POINT - facade that exposes a public api for the module
└── tests.js // API tests for the module's facade (index.js)
```

###Unit tests

#####Run all tests
You can trigger all unit tests by typing the following command:
```
npm test
```
