const mongoose = require('mongoose');

const careerApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    applyFor: { type: String, required: true },
    experience: { type: Number, required: true },
    details: { type: String, required: true },
    resumeFilename: { type: String },
    resumePath: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerApplication', careerApplicationSchema);
