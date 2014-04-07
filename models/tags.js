var mongoose = require('mongoose');

var TagsSchema = new mongoose.Schema({
  tagName : {type: String},
  scheme: {type: String}
});

TagsSchema.methods = {
  newTag : function (name, scheme, cb) {
    this.name = name;
    this.schem = scheme;
    this.save(function (err, i) {
      if (err) {
        cb(err);
      } else {
        cb(i);
      }
    });
  }
}

mongoose.model('tag', TagsSchema);

module.exports = mongoose.model('tag');