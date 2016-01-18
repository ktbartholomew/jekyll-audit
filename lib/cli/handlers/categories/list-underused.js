var util = require('util');
var _ = require('lodash');

module.exports = {
  name: 'list-underused',
  run: function () {
    var underused = [];
    var categories = this.jekyll.getCategories();

    underused = _.filter(categories, function (category) {
      return this.jekyll.isCategoryUnderused(category);
    }.bind(this));

    underused = _.sortBy(underused, function (item) {
      return item.count * -1;
    });

    if(underused.length === 0) {
      process.stdout.write(util.format('No underused categories found!'));
      return;
    }

    underused.forEach(function (category) {
      process.stdout.write(util.format('Category \'%s\' only has %s post%s\n', category.slug, category.count, (category.count != 1) ? 's' : ''));
    });
  }
};
