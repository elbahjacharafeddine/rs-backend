const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LaboratorySchema = new Schema({
  name: {
    type: String,
    required: [true],
  },
  abbreviation: {
    type: String,
    required: [true],
  },
  establishment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Establishment",
    required: [true],
  },
  head_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false,
  },
  head_history: [
    {
      head: Object,
      start: String,
      end: String,
      active: Boolean,
    },
  ],
    budget : {
      type: Object
    },
 
});

const Laboratory = mongoose.model("laboratory", LaboratorySchema);
module.exports = Laboratory;
