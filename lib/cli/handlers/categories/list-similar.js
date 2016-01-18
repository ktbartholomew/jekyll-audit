var path = require('path');
var util = require('util');

var natural = require('natural');

module.exports = {
  name: 'list-similar',
  run: function () {
    var posts = this.jekyll.getPosts();
    var categories = this.jekyll.getCategories();
    var postsDir = this.config.postsDir;
    var threshold = this.config.threshold;
    var output = '';


    categories.forEach(function (category, index, array) {
      array.forEach(function (pair, pairIndex, pairArray) {
        if (pairIndex == index || category.slug == pair.slug) {
          return;
        }

        if (natural.JaroWinklerDistance(category.slug, pair.slug) >= threshold) {
          var smaller = (category.count < pair.count) ? category : pair;
          var bigger = (category.count >= pair.count) ? category : pair;

          output += util.format('\nConsider merging category %s(%s) into %s(%s).\n', smaller.slug, smaller.count, bigger.slug, bigger.count);
          output += 'Affected posts:\n';

          posts.forEach(function (post) {
            if(post.frontmatter.categories.indexOf(smaller.name) != -1) {
              output += util.format('  - %s\n', path.relative(postsDir, post.filename));
            }
          });
        }
      });
    });

    this.return((output === '') ? 0 : 1, output);
  }
};
