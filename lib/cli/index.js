var path = require('path');
var util = require('util');

var _ = require('lodash');
var glob = require('glob');

var config = require('../config');
var jekyll = require('../util/jekyll');

var Handler = function (options) {
  this.config = config;
  this.jekyll = jekyll;
  this.name = options.name;
  this.run = options.run;
};

Handler.prototype.run = function () {
  return null;
};

var handlers = [];

module.exports = {
  init: function (configData) {
    config.apply(configData);

    glob.sync(path.resolve(__dirname, './handlers/**/*.js'))
    .forEach(function (handlerFile, index, array) {
      handlers.push(new Handler(require(handlerFile)));
    });
  },
  run: function (name) {
    var handler = _.find(handlers, function (handler) {
      return handler.name == name;
    });

    try {
      handler.run();
    }
    catch (e) {
      this.return(1, e.stack);
    }
  },
  return: function (code, message) {
    if(!message) {
      return process.exit(code);
    }

    if(code !== 0) {
      process.stderr.write(message);
    }
    else {
      process.stdout.write(message);
    }

    return process.exit(code);
  }
};
