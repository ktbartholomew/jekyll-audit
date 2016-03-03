var util = require('util');
var _ = require('lodash');

module.exports = {
  name: 'list-underused',
  run: function () {
    var underused = [];
    var categories = this.jekyll.getCategories();
    var output = '';
    var thresholdCount = Math.round(this.jekyll.getPosts().length * this.config.threshold);

    underused = _.filter(categories, function (category) {
      return this.jekyll.isCategoryUnderused(category);
    }.bind(this));

    underused = _.sortBy(underused, function (item) {
      return item.count * -1;
    });

    if(underused.length === 0) {
      return this.return(0);
    }

    output += util.format('Found %s underused %s!\n', underused.length, (underused.length != 1) ? 'categories' : 'category');
    output += util.format('There are %s total posts.\n', this.jekyll.getPosts().length);
    output += util.format(
      'Any categories accounting for less than %s\% of total posts (fewer than %s posts) are shown below:\n\n',
      (this.config.threshold * 100).toFixed(2),
      thresholdCount
    );

    underused.forEach(function (category) {
      output += util.format('Category \'%s\' only has %s post%s\n', category.slug, category.count, (category.count != 1) ? 's' : '');
    });

    output += util.format(
      '\n' +
      'To resolve this problem, ensure that all categories are used by at least %s\n' +
      'different posts. To do this, you could:\n\n',
      thresholdCount
    );
    output += util.format(
      '* Add each listed category to more posts, until at least %s posts include that \n' +
      '  category.\n',
      thresholdCount
    );
    output += util.format(
      '* Remove the underused categories from any post that uses them. To do this, run\n' +
      '  `jekyll-audit categories delete-underused --threshold %s -p {{ postsDir }}`\n\n' +
      '  See <https://github.com/ktbartholomew/jekyll-audit#categories-delete-underused>\n' +
      '  for more info.\n',
      this.config.threshold
    );

    this.return(1, output);
  }
};
