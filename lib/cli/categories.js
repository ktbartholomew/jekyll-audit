var util = require('util');
var _ = require('lodash');
var jekyll = require('../util/jekyll');
var chalk = require('chalk');


module.exports = {
  listSimilar: require('./categories/list-similar'),
  listUnderused: function () {
    var underused = [];
    var categories = jekyll.getCategories();

    underused = _.filter(categories, function (category) {
      return jekyll.isCategoryUnderused(category);
    });

    underused = _.sortBy(underused, function (item) {
      return item.count * -1;
    });

    if(underused.length === 0) {
      process.stdout.write(util.format('No underused categories found!'));
      return;
    }

    underused.forEach(function (category) {
      process.stdout.write(util.format('Category \'%s\' only has %s post%s', category.slug, category.count, (category.count != 1) ? 's' : ''));
    });
  }
};
