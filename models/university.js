const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UniversitySchema = new Schema({
  name: {
    type: String,
    required: [true],
  },
  abbreviation: {
    type: String,
    required: [true],
  },
  country: {
    type: String,
    required: [true],
  },
  city: {
    type: String,
    required: [true],
  }
});

const University = mongoose.model("univerity", UniversitySchema);
module.exports = University;
