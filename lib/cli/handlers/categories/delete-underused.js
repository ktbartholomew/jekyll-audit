module.exports = {
  name: 'delete-underused',
  run: function () {
    var categories = this.jekyll.getCategories();
    var posts = this.jekyll.getPosts();

    categories.forEach(function (category, index, array) {
      if(!this.jekyll.isCategoryUnderused(category)) {
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
    }.bind(this));

    posts.forEach(function (post) {
      if(!post.dirty) {
        return;
      }

      this.jekyll.setFrontmatter(post.filename, post.frontmatter);
    }.bind(this));

    this.return(0);
  }
};
