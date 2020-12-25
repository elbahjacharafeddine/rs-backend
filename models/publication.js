const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PublicationSchema = new Schema({
  title: {
    type: String,
  },
  authors: {
    type: Array,
  },
  citation: {
    type: String,
  },
  year: {
    type: String,
  },
  searchedFor: {
    type: String,
    required: false,
  },
  IF: {
    type: String,
    required: false,
  },
  SJR: {
    type: String,
    required: false,
  },
  extraInformation: {
    type: Object,
    required: false,
  },
  source: {
    type: String,
    required: false,
  },
});

const Publication = mongoose.model("publication", PublicationSchema);
module.exports.Publication = Publication;
module.exports.PublicationSchema = PublicationSchema;
