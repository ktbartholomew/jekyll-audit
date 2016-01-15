var _ = require('lodash');

module.exports = function (program) {
  return _.map(program.commands, '_name');
};
