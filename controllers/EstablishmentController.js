const Establishment = require("../models/establishment");
const Laboratory = require("../models/laboratory");
const University = require("../models/university");
const User = require("../models/user");
const { findOne } = require("../models/university");

exports.createEstablishment = async (req, resp) => {
  try {
    let establishment = await Establishment.create(req.body);
    resp.status(200).send(establishment);
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};

exports.updateEstablishment = async (req, resp) => {
  try {
    let result = await Establishment.updateOne(
      { _id: req.body._id },
      { $set: req.body }
    );
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.findEstablishment = async (req, resp) => {
  try {
    let establishment = await Establishment.findById(req.params._id);
    const university = await University.findById(establishment.university_id);
    resp.status(200).send({ ...establishment, university });
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};

exports.findAllEstablishments = async (req, resp) => {
  try {
    const establishments = await Establishment.find();
    const establishments_1 = await Promise.all(
      establishments.map(async (establishment) => ({
        ...establishment._doc,
        university: await University.findOne({
          _id: establishment.university_id,
        }),

        laboratories: await Establishment.find({
          establishment_id: establishment._id,
        }),
        research_director: await User.findOne({ _id: establishment.research_director_id })
      }))
    );
    resp.status(200).send(establishments_1);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.deleteEstablishment = async (req, resp) => {
  try {
    const result = await Establishment.deleteOne({ _id: req.params._id });
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};

exports.getEstablishmentLaboratories = async (req, resp) => {
  try {
    const labos = await Laboratory.find({ establishment_id: req.params._id });
    resp.status(200).send(labos);
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};


exports.getResearchDirector = async (req, resp) => {
  try {
    const establishment = await Establishment.findOne({ _id: req.params.establishment_id });
  }
  catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.changeResearchDirector = async (req, resp) => {


  let establishment = await Establishment.findOne({ _id: req.params.establishment_id });
  if (!establishment)
    resp.status(404).send({ message: "Establishment not found" });

  await User.findOneAndUpdate({ _id: establishment.research_director_id }, { $pull: { roles: "RESEARCH_DIRECTOR" } });
  let newDirector = await User.findOneAndUpdate({ _id: req.params.user_id }, { $push: { roles: "RESEARCH_DIRECTOR" } });

  const date = new Date();
  const today = `${date.getFullYear()}/${
    date.getMonth() + 1
    }/${date.getDate()}`;

  establishment.direction_history.forEach((element) => {
    if (!element.end) {
      element.end = today;
    }
  });

  let direction_history_item = {
    director: newDirector,
    start: today,
    end: null,
  };

  establishment.direction_history.push(direction_history_item);
  establishment.research_director_id = newDirector._id;
  const result = await establishment.save();

  resp.send(result);

};


exports.getEstablishmentOfDirector = async (req, resp) => {

  let establishment = await Establishment.find({ research_director_id: req.params.user_id });
  if (!establishment) resp.status(404).send({ message: "Establishment not foud" });
  resp.send(establishment);

}
