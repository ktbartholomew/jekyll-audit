var util = require('util');
var _ = require('lodash');

module.exports = {
  name: 'list-underused',
  run: function () {
    var underused = [];
    var categories = this.jekyll.getCategories();
    var output = '';

    underused = _.filter(categories, function (category) {
      return this.jekyll.isCategoryUnderused(category);
    }.bind(this));

    underused = _.sortBy(underused, function (item) {
      return item.count * -1;
    });

    if(underused.length === 0) {
      return this.return(0);
    }

    underused.forEach(function (category) {
      output += util.format('Category \'%s\' only has %s post%s\n', category.slug, category.count, (category.count != 1) ? 's' : '');
    });

    this.return(1, output);
  }
};
