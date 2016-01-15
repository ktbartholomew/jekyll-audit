//
// Don't use this file. Move things to better places
//

var entrypoints = {
  // Check categories for sanity
  categories: function () {
    var postFiles = glob.sync(path.resolve(POST_DIR, '*'));
    var posts = [],
      categories = [];

    var addPost = function (post) {
      posts.push(post);

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

      if (_.findWhere(categories, {slug: categorySlug})) {
        // existing is passed by reference, so we can update right here.
        var existing = _.findWhere(categories, {slug: categorySlug});
        existing.count = existing.count + 1;
        return;
      }

      var catObject = {
        name: category,
        slug: categorySlug,
        count: 1
      };

      categories.push(catObject);
    };

    var getFrontmatter = function (file) {
      var contents = fs.readFileSync(file, 'utf8');
      var frontmatter = contents.match(/^---\n([\s\S]+?)---/m);

      if(!frontmatter[1]) {
        return null;
      }

      return yaml.safeLoad(frontmatter[1], {filename: file});
    };

    var setFrontmatter = function (file, data) {
      var contents = fs.readFileSync(file, 'utf8');
      // Replace the existing frontmatter with our modified frontmatter
      contents = contents.replace(/^---\n[\s\S]+?---/m, '---\n' + yaml.safeDump(data) + '---');
      console.log('Updating frontmatter in %s', path.relative(__dirname + '/..', file));
      fs.writeFileSync(file, contents, 'utf8');
    };

    var isCategoryUnderused = function (category) {
      var threshold = posts.length * UNDERUSED_THRESHOLD / 100;

      return category.count < threshold;
    };

    var subcommands = {
      /**
       * Find categories accounting for les than <UNDERUSED_THRESHOLD> percent
       * of all posts and output them
       */
      'list-underused': function () {
        var underused = [];

        underused = _.filter(categories, function (category) {
          return isCategoryUnderused(category);
        });

        underused = _.sortBy(underused, function (item) {
          return item.count * -1;
        });

        underused.forEach(function (category) {
          console.log('Category \'%s\' only has %s post%s', category.slug, category.count, (category.count != 1) ? 's' : '');
        });
      },

      /**
       * Find categories accounting for les than <UNDERUSED_THRESHOLD> percent
       * of all posts, then find posts that are assigned to those categories and
       * remove the underused category from the frontmatter of each.
       *
       * WARNING: This function could potentially modify many of your post files
       */
      'delete-underused': function () {
        categories.forEach(function (category, index, array) {
          if(!isCategoryUnderused(category)) {
            return;
          }

          posts.forEach(function (post) {
            // Some posts just don't have categories
            if(!post.frontmatter.categories) {
              return;
            }

            if(post.frontmatter.categories.indexOf(category.name) != -1) {
              post.dirty = true;
              post.frontmatter.categories.splice(post.frontmatter.categories.indexOf(category.name), 1);
            }
          });
        });

        posts.forEach(function (post) {
          if(!post.dirty) {
            return;
          }

          setFrontmatter(post.filename, post.frontmatter);
        });
      },

      /**
       * Find pairs of categories with similar slugs (>= SIMILARITY_INDEX
       * Jaro-Winkler distance). Determine which has more posts and suggest
       * merging the smaller category into the larger one.
       */
      'list-similar': function () {
        categories.forEach(function (category, index, array) {
          array.forEach(function (pair, pairIndex, pairArray) {
            if (pairIndex == index || category.slug == pair.slug) {
              return;
            }

            if (natural.JaroWinklerDistance(category.slug, pair.slug) >= SIMILARITY_INDEX) {
              var smaller = (category.count < pair.count) ? category : pair;
              var bigger = (category.count >= pair.count) ? category : pair;

              if(isCategoryUnderused(bigger)) {
                // Don't bother if the larger category will probably be deleted
                return;
              }

              console.log('Consider merging category %s(%s) into %s(%s).', smaller.slug, smaller.count, bigger.slug, bigger.count);
              console.log('Affected posts:');

              posts.forEach(function (post) {
                if(post.frontmatter.categories.indexOf(smaller.name) != -1) {
                  console.log('  - %s', path.relative(__dirname + '/..', post.filename));
                }
              });
            }
          });
        });
      }
    };

    // Seed the data variables: posts and categories
    postFiles.forEach(function (post, index, array) {
      addPost({
        filename: post,
        frontmatter: getFrontmatter(post)
      });
    });

    // Run the chosen subcommand!
    subcommands[arguments[1]].apply(null, arguments);
  }
};


module.exports.categories = require('./categories');
