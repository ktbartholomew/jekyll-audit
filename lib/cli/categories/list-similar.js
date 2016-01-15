var path = require('path');
var util = require('util');

var natural = require('natural');

var config = require('../../config');
var jekyll = require('../../util/jekyll');

module.exports = function () {
  var posts = jekyll.getPosts();
  var categories = jekyll.getCategories();

  categories.forEach(function (category, index, array) {
    array.forEach(function (pair, pairIndex, pairArray) {
      if (pairIndex == index || category.slug == pair.slug) {
        return;
      }

      if (natural.JaroWinklerDistance(category.slug, pair.slug) >= config.threshold) {
        var smaller = (category.count < pair.count) ? category : pair;
        var bigger = (category.count >= pair.count) ? category : pair;

        process.stdout.write(util.format('\nConsider merging category %s(%s) into %s(%s).\n', smaller.slug, smaller.count, bigger.slug, bigger.count));
        process.stdout.write('Affected posts:\n');

        posts.forEach(function (post) {
          if(post.frontmatter.categories.indexOf(smaller.name) != -1) {
            process.stdout.write(util.format('  - %s\n', path.relative(config.postsDir, post.filename)));
          }
        });
      }
    });
  });
};
