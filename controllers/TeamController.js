const Team = require("../models/team");
const Laboratory = require("../models/laboratory");
const University = require("../models/university");
const Establishment = require("../models/establishment");
const TeamMemberShip = require("../models/team-membership");
const User = require("../models/user");

exports.createTeam = async (req, resp) => {
  try {
    const team = await Team.create(req.body);
    resp.status(200).send(team);
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};

exports.updateTeam = async (req, resp) => {
  try {
    const result = await Team.updateOne(
      { _id: req.body._id },
      { $set: req.body }
    );
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.findTeam = async (req, resp) => {
  try {
    const team = await Team.findById(req.params._id);
    const laboratory = await Laboratory.findById(team.laboratory_id);
    const establishment = await Establishment.findById(
      laboratory.establishment_id
    );
    const university = await University.findById(establishment.university_id);

    const teamMemberShips = await TeamMemberShip.find({
      team_id: team._id,
      active: true,
    });
    const teamHead = await User.findOne({ _id: team.head_id });

    const members = await Promise.all(
      teamMemberShips.map(async (teamMemberShip) => {
        return await User.findById(teamMemberShip.user_id);
      })
    );

    resp.status(200).send({
      ...team._doc,
      laboratory,
      establishment,
      university,
      members,
      teamHead,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};

exports.findAllTeams = async (req, resp) => {
  try {
    const teams = await Team.find();
    const result = await Promise.all(
      teams.map(async (team) => {
        return {
          ...team._doc,
          laboratory: await Laboratory.findById(team.laboratory_id),
          teamMemberShip: await TeamMemberShip.find({
            team_id: team._id,
            active: true,
          }),
        };
      })
    );

    console.log(result);
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.deleteTeam = async (req, resp) => {
  try {
    const team = await Team.findOne({ _id: req.params._id });
    const teamHead = await User.findOne({ _id: team.head_id });

    const resultUserUpdate = await User.updateOne(
      { _id: teamHead._id },
      { $set: { roles: teamHead.roles.filter((r) => r != "TEAM_HEAD") } }
    );
    const resultTeamMemberShipUpdate = await TeamMemberShip.updateMany(
      { team_id: req.params._id },
      { $set: { active: false } }
    );

    const resultTeamDelete = await Team.deleteOne({ _id: req.params._id });

    resp.status(200).send(resultTeamDelete);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.addUserToTeam = async (req, resp) => {
  try {
    const result = await TeamMemberShip.create({
      user_id: req.params.user_id,
      team_id: req.params.team_id,
      active: true,
    });
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.removeFromTeam = async (req, resp) => {
  try {
    const result = await TeamMemberShip.updateMany(
      {
        user_id: req.params.user_id,
        team_id: req.params.team_id,
        active: true,
      },
      { active: false }
    );
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.associateHeadToTeam = async (req, resp) => {
  try {
    let team = await Team.findById(req.params.team_id);
    if (team.head_id) {
      const oldTeamHead = await User.findById(team.head_id);
      await User.updateOne(
        { _id: team.head_id },
        {
          $set: {
            roles: [...oldTeamHead.roles.filter((r) => r !== "TEAM_HEAD")],
            hasConfirmed: true,
          },
        }
      );
    }
    const newTeamHead = await User.findById(req.params.head_id);

    const update = await User.updateOne(
      { _id: req.params.head_id },
      {
        $set: {
          roles: ["TEAM_HEAD", ...newTeamHead.roles],
          hasConfirmed: true,
        },
      }
    );

    const head = await User.findById(req.params.head_id);

    const date = new Date();
    const today = `${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()}`;

    team.head_history.forEach((element) => {
      if (element.active) {
        element.active = false;
        element.end = today;
      }
    });

    let head_history_item = {
      head: head,
      start: today,
      end: null,
      active: true,
    };

    team.head_history.push(head_history_item);
    team.head_id = head._id;
    const result = await team.save();

    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};
