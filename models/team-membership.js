const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamMembershipSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true],
  },
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "team",
    require: [true],
  },
  active: {
    type: Boolean,
    required: true,
  },
});

const TeamMembership = mongoose.model("team-membership", TeamMembershipSchema);
module.exports = TeamMembership;
