const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EstablishmentSchema = new Schema({
  name: {
    type: String,
    required: [true],
  },
  abbreviation: {
    type: String,
    required: [true],
  },
  address: {
    type: String,
    required: [true],
  },
  university_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    required: [true],
  },
  research_director_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [false],
  },
  direction_history : [{
    start: String,
    end: String,
    director: Object
  }  
]
});

const Establishment = mongoose.model("establishment", EstablishmentSchema);
module.exports = Establishment;
