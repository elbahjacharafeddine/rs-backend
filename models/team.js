const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: {
    type: String,
    required: [true],
  },
  abbreviation: {
    type: String,
    required: [true],
  },
  head_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false,
  },
  laboratory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Laboratory",
    required: [true],
  },
  head_history: [
    {
      head: Object,
      start: String,
      end: String,
      active: Boolean,
    },
  ],
});

const Team = mongoose.model("team", TeamSchema);
module.exports = Team;
