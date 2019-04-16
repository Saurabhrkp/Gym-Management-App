var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;

var TrainerSchema = new Schema(
    {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: { type: Date },
    m_address: {type: String },
    m_number: {type: Number , required: true,min: 10},
    date_of_reg: {type: Date },
    salary: {type: Number, required: true}
    }
);

// Virtual for trainer "full" name.
TrainerSchema
.virtual('name')
.get(function () {
  return this.family_name +' '+this.first_name;
});

// Virtual for this trainer instance URL.
TrainerSchema
.virtual('url')
.get(function () {
  return '/catalog/trainer/'+this._id
});

TrainerSchema
.virtual('date_of_reg_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_reg).format('YYYY-MM-DD');
});


// Export model.
module.exports = mongoose.model('Trainer', TrainerSchema);
