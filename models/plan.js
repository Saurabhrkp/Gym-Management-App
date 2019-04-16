var mongoose = require('mongoose');
// var moment = require('moment');

var Schema = mongoose.Schema;

var PlanSchema = new Schema({
    planName: {type: String, required: true},
    price: { type: Number, required: true },
    discription: {type: String, required: true},
    status: {type: String, required: true, enum:['Active', 'Inactive'], default:'Active'},
    member: [{ type: Schema.ObjectId, ref: 'Member' }], // Reference to the associated member.
});

// Virtual for this plan object's URL.
PlanSchema
.virtual('url')
.get(function () {
  return '/catalog/plan/'+this._id;
});


// Export model.
module.exports = mongoose.model('Plan', PlanSchema);
