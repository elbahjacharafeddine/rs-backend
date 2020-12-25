const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PhdStudentSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  thesisTitle: { type: String, required: true },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true],
  },
  coSupervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [false],
  },
  cotutelle: { type: Boolean, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const PhdStudentModel = mongoose.model("phdStudent", PhdStudentSchema);

module.exports = PhdStudentModel;
