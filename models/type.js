var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TypeSchema = new Schema({
    name: {type: String, required: true, min: 3, max: 100}
});

// Virtual for this type instance URL.
TypeSchema
.virtual('url')
.get(function () {
  return '/catalog/type/'+this._id;
});

// Export model.
module.exports = mongoose.model('Type', TypeSchema);
