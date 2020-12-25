const University = require("../models/university");
const Establishment = require("../models/establishment");
const User = require("../models/user");

exports.createUniversity = async (req, resp) => {
  try {
    const university = await University.create(req.body);
    resp.status(200).send(university);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.updateUniversity = async (req, resp) => {
  try {
    const result = await University.updateOne(
      { _id: req.body._id },
      { $set: req.body }
    );
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.findUniversity = async (req, resp) => {
  try {
    const university = await University.findById(req.params._id);
    resp.status(200).send(university);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.findAllUniversities = async (req, resp) => {
  try {
    const universities = await University.find();
    resp.status(200).send(universities);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.deleteUniversity = async (req, resp) => {
  try {
    const result = await University.deleteOne({ _id: req.params._id });
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.getUniversityEstablishments = async (req, resp) => {
  try {
    const universities = await Establishment.find({
      university_id: req.params._id,
    });
    resp.status(200).send(universities);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};


