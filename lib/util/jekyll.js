var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var config = require('../config');
var glob = require('glob');
var slug = require('slug');
var yaml = require('js-yaml');

var categoryStore = null;
var postStore = null;

/**
 * @description This is some ugly badness. This has to be called before you do
 * anything with posts or categories, because this is what parses them. But you
 * can't call this before the config stuff has been parsed otherwise you'll load
 * posts from the wrong directory. It's just bad.
 *
 */
var parsePosts = function () {
  if(categoryStore !== null && postStore !== null) {
    return;
  }

  categoryStore = [];
  postStore = [];

  var postFiles = glob.sync(path.resolve(config.postsDir, '*'));

  var addPost = function (post) {
    postStore.push(post);

    if(!post.frontmatter.categories) {
      // TODO: Complain that post has no categories
      return;
    }

    post.frontmatter.categories.forEach(function (category, index, array) {
      addCategory(category);
    });
  };

  var addCategory = function (category) {
    var categorySlug = slug(category, {
      separator: '-',
      lower: true
    });

    if (_.findWhere(categoryStore, {slug: categorySlug})) {
      // existing is passed by reference, so we can update right here.
      var existing = _.findWhere(categoryStore, {slug: categorySlug});
      existing.count = existing.count + 1;
      return;
    }

    var catObject = {
      name: category,
      slug: categorySlug,
      count: 1
    };

    categoryStore.push(catObject);
  };

  // Seed the data variables: posts and categories
  postFiles.forEach(function (post, index, array) {
    addPost({
      filename: post,
      frontmatter: getFrontmatter(post)
    });
  });
};

var getFrontmatter = function (file) {
  var contents = fs.readFileSync(file, 'utf8');
  var frontmatter = contents.match(/^---\n([\s\S]+?)---/m);

  if(!frontmatter[1]) {
    return null;
  }

  return yaml.safeLoad(frontmatter[1], {filename: file});
};

module.exports = {
  getCategories: function () {
    parsePosts();
    return categoryStore;
  },
  getPosts: function () {
    parsePosts();
    return postStore;
  },
  isCategoryUnderused: function (category) {
    var threshold = postStore.length * config.threshold;
    return category.count < threshold;
  },
  getFrontmatter: function (file) {
    var contents = fs.readFileSync(file, 'utf8');
    var frontmatter = contents.match(/^---\n([\s\S]+?)---/m);

    if(!frontmatter[1]) {
      return null;
    }

    return yaml.safeLoad(frontmatter[1], {filename: file});
  },
  setFrontmatter: function (file, data) {
    var contents = fs.readFileSync(file, 'utf8');
    // Replace the existing frontmatter with our modified frontmatter
    contents = contents.replace(/^---\n[\s\S]+?---/m, '---\n' + yaml.safeDump(data) + '---');
    console.log('Updating frontmatter in %s', path.relative(__dirname + '/..', file));
    fs.writeFileSync(file, contents, 'utf8');
  }
};
