var _ = require('lodash');

var configData = {
  postsDir: process.cwd()
};

module.exports = configData;

module.exports.apply = function (data) {
  _.merge(this, data);
};
