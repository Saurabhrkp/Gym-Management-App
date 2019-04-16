var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;

var MemberSchema = new Schema({
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: { type: Date },
    m_address: {type: String },
    m_number: {type: Number , required: true, min: 10},
    date_of_reg: {type: Date },
    trainer: { type: Schema.ObjectId, ref: 'Trainer', required: true },
    plan: { type: Schema.ObjectId, ref: 'Plan'},
    plan_end_on: { type: Date},
    type: { type: Schema.ObjectId, ref: 'Type' }
});

// Virtual for Member "full" name.
MemberSchema
.virtual('name')
.get(function () {
  return this.family_name + ' '+this.first_name;
});

MemberSchema
.virtual('date_of_reg_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_reg).format('YYYY-MM-DD');
});

MemberSchema
.virtual('plan_end_on_yyyy_mm_dd')
.get(function () {
  return moment(this.plan_end_on).format('YYYY-MM-DD');
});

MemberSchema
.virtual('date_of_birth_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_birth).format('YYYY-MM-DD');
});

// Virtual for this member instance URL.
MemberSchema
.virtual('url')
.get(function () {
  return '/catalog/member/'+this._id;
});

// Export model.
module.exports = mongoose.model('Member', MemberSchema);
