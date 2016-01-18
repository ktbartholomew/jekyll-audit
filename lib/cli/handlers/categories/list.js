module.exports = {
  name: 'list',
  run: function () {
    var categories = this.jekyll.getCategories();
    var output = '';

    categories.forEach(function (category) {
      output += category.name + '\n';
    });

    this.return(0, output);
  }
};
