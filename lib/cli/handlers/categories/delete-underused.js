module.exports = {
  name: 'delete-underused',
  run: function () {
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
  }
};
