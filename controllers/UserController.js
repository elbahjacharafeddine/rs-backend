const fs = require("fs");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const FollowedUser = require("../models/followed-user");
const TeamMemberShip = require("../models/team-membership");
const Laboratory = require("../models/laboratory");
const Team = require("../models/team");
const mailSender = require("../helpers/mail-sender");
const differentRoles = require("../helpers/role");
const userHelper = require("../helpers/user-helper");
const PhdStudent = require("../models/phdStudent");
const Establishment = require("../models/establishment");

exports.createUser = async (req, resp) => {
  const { email, password, roles, creatorId } = req.body;
  const rolesArray = [differentRoles.CED_HEAD, differentRoles.LABORATORY_HEAD, differentRoles.RESEARCHER];
  if (!rolesArray.includes(req.body.roles)) {
    resp.status(400).send({ error: "Incorrect roles value" });
  } else {
    try {
      const user = await User.create({
        email,
        password,
        roles,
        generatedPassword: password,
        creatorId,
      });
      const result = await mailSender.sendEmail(user);
      resp.status(200).send(result);
    } catch (error) {
      console.log(error);
      resp.status(500).send(error);
    }
  }
};

exports.updateUser = async (req, resp) => {
  try {
    const result = await User.updateOne({ _id: req.body._id }, { $set: req.body, hasConfirmed: true, generatedPassword: "" });
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.findUser = async (req, resp) => {
  const user = await User.findOne({ _id: req.params._id });

  const laboratoriesHeaded = await Laboratory.find({
    head_id: user._id,
  });

  const teamsHeaded = await Team.find({
    head_id: user._id,
  });

  const teamsMemberships = await TeamMemberShip.find({
    user_id: user._id,
    active: true,
  });
  const phdStudents = await PhdStudent.find({
    supervisor: user._id,
  });

  await Promise.all(teamsMemberships.map((teamsMembership) => Team.findOne({ _id: teamsMembership.team_id })));

  const correspondingFollowedUser = await FollowedUser.findOne({
    user_id: user._id,
  });

  resp.status(200).send({
    ...user._doc,
    laboratoriesHeaded,
    teamsHeaded,
    teamsMemberships,
    correspondingFollowedUser,
    phdStudents,
  });
};

exports.findAllUsers = async (req, resp) => {
  try {
    const users = await User.find().select("-password");
    resp.status(200).send(users);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.deleteUser = async (req, resp) => {
  try {
    const result = await User.deleteOne({ _id: req.params._id });
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.followUser = async (req, resp) => {
  try {
    const result = await FollowedUser.create(req.body);

    resp.status(200).send({ status: "User followed" });
  } catch (error) {
    console.log(error);

    resp.status(500).send(error);
  }
};
exports.updateFollowedUser = async (req, resp) => {
  try {
    const result = await FollowedUser.findOneAndUpdate({ authorId: req.body.authorId }, { $set: { ...req.body } });
    resp.status(200).send({ status: "User Updated" });
  } catch (error) {
    resp.status(500).send(error);
  }
};

exports.unfollowUser = async (req, resp) => {
  try {
    const result = await FollowedUser.findOneAndDelete({
      authorId: req.params.authorId,
    });
    resp.status(200).send({ status: "User unfollowed" });
  } catch (error) {
    resp.status(500).send(error);
  }
};

exports.isFollowing = async (req, resp) => {
  const users = await FollowedUser.find({ authorId: req.params.authorId });
  if (users.length == 0)
    resp.status(200).send({
      isFollowing: false,
    });
  else
    resp.status(200).send({
      isFollowing: true,
      oldNumberOfPublications: users[0].publications.length,
    });
};

exports.getFollowedUsers = async (req, resp) => {
  const laboratoryAbbreviation = req.param("laboratory_abbreviation");
  const teamAbbreviation = req.param("team_abbreviation");

  const followedUsers = await FollowedUser.find();
  const followedUsersIds = followedUsers.map(({ user_id }) => user_id);

  if (!laboratoryAbbreviation && !teamAbbreviation) {
    resp.status(200).send(await FollowedUser.find());
  }

  if (laboratoryAbbreviation) {
    const laboratory = await Laboratory.findOne({
      abbreviation: req.param("laboratory_abbreviation"),
    });

    const teams = await Team.find({
      laboratory_id: laboratory._id,
    });

    const teamsMemberShips = await Promise.all(
      teams.map((team) =>
        TeamMemberShip.find({
          team_id: team._id,
          active: true,
          user_id: { $in: followedUsersIds },
        })
      )
    );

    const followedUsers = await Promise.all(teamsMemberShips.flatMap((t) => t).map(({ user_id }) => FollowedUser.findOne({ user_id })));

    const followedUsersAcounts = await Promise.all(teamsMemberShips.flatMap((t) => t).map(({ user_id }) => User.findById(user_id)));

    const result = followedUsersAcounts.map(({ firstName, lastName }, index) => ({
      ...followedUsers[index]._doc,
      firstName,
      lastName,
    }));
    resp.status(200).send(result);
  }

  if (teamAbbreviation) {
    const team = await Team.findOne({
      abbreviation: teamAbbreviation,
    });

    const teamsMemberShips = await TeamMemberShip.find({
      team_id: team._id,
      active: true,
      user_id: { $in: followedUsersIds },
    });

    const followedUsers = await Promise.all(teamsMemberShips.map(({ user_id }) => FollowedUser.findOne({ user_id })));

    const followedUsersAcounts = await Promise.all(teamsMemberShips.map(({ user_id }) => User.findById(user_id)));

    const result = followedUsersAcounts.map(({ firstName, lastName }, index) => ({
      ...followedUsers[index]._doc,
      firstName,
      lastName,
    }));
    resp.status(200).send(result);
  }
};

exports.updatePassword = async (req, resp) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  return User.updateOne({ _id: req.params._id }, { $set: { password: hash } })
    .then((result) => {
      resp.status(200).send(result);
    })
    .catch((error) => {
      console.log(error);
      resp.status(500).send(error);
    });
};

exports.getLaboratoryHeads = async (req, resp) => {
  try {
    const laboratoryHeads = await User.find({ roles: differentRoles.LABORATORY_HEAD });
    resp.status(200).send(laboratoryHeads);
  } catch (error) {
    resp.status(500).send(error);
  }
};

exports.getResearchers = async (req, resp) => {
  try {
    const users = await User.find();
    const researchers = users.filter(user => user.roles.includes(differentRoles.RESEARCHER));
    resp.status(200).send(researchers);
  } catch (error) {
    resp.status(500).send(error);
  }
};

exports.updateProfilePicture = async (req, resp) => {
  let file = req.files.file;
  let user = userHelper.requesterUser(req);
  let userFromDB = await User.findById(user._id, "profilePicture");
  if (userFromDB.profilePicture !== undefined && userFromDB.profilePicture !== "default.png") {
    fs.unlink(__dirname + "/../public/images/" + userFromDB.profilePicture, (err) => {
      if (err) resp.status(500).send(err);
    });
  }

  let fileUrl = user._id + file.name;
  let filePath = __dirname + "/../public/images/" + fileUrl;
  file.mv(filePath, function (err) {
    if (err) resp.status(500).send(err);
    else {
      User.updateOne({ _id: user._id }, { $set: { profilePicture: fileUrl } })
        .then((done) => {
          resp.status(200).send({ message: "file uploaded", profilePicture: fileUrl });
        })
        .catch((error) => {
          resp.status(500).send(error);
        });
    }
  });
};

exports.getFilteringOptions = async (req, resp) => {
  const user_id = req.params.laboratoryHeadId;
  let teams = [];
  const laboratory = await Laboratory.findOne({
    head_id: user_id,
  });

  
  if (!laboratory) {
    teams = await Team.find({
      head_id: user_id,
    });
  } else {
    teams = await Team.find({
      laboratory_id: laboratory._id,
    });
  }



  console.log(teams);

  const followedUsers = await FollowedUser.find();
  const followedUsersIds = followedUsers.map(({ user_id }) => user_id);

  const teamsOptionsPromises = teams.map(async (team) => {
    const teamsMemberShips = await TeamMemberShip.find({
      team_id: team._id,
      user_id: { $in: followedUsersIds },
      active: true,
    });

    return {
      ...team._doc,
      membershipCount: teamsMemberShips.length,
      optionType: "team",
    };
  });

  /*   const laboratories = await Laboratory.find();

  const laboratoriesOptionsPromises = laboratories.map(async (laboratory) => {
    const teams = await Team.find({
      laboratory_id: laboratory._id,
    });

    const teamsMemberShips = await Promise.all(
      teams.map((team) =>
        TeamMemberShip.find({
          team_id: team._id,
          user_id: { $in: followedUsersIds },
          active: true,
        })
      )
    );

    return {
      ...laboratory._doc,
      membershipCount: teamsMemberShips.flatMap((t) => t).length,
      optionType: "laboratory",
    };
  });

  const laboratoriesOptions = await Promise.all(laboratoriesOptionsPromises);

 */
  const teamsOptions = await Promise.all(teamsOptionsPromises);

  resp.status(200).send([...teamsOptions]);
};


exports.getDirectorFilteringOptions = async (req, resp) => {
  const user_id = req.params.user_id;
  let establishment = await Establishment.findOne({research_director_id: user_id});
  let laboratories = await Laboratory.find({establishment_id: establishment._id});

  let teams = [];
  for(let lab of laboratories){
    let innerTeams = await Team.find({laboratory_id: lab._id});
    teams = [...teams, ...innerTeams];
  }

  const followedUsers = await FollowedUser.find();
  const followedUsersIds = followedUsers.map(({ user_id }) => user_id);

  const teamsOptionsPromises = teams.map(async (team) => {
    const teamsMemberShips = await TeamMemberShip.find({
      team_id: team._id,
      user_id: { $in: followedUsersIds },
      active: true,
    });

    return {
      ...team._doc,
      membershipCount: teamsMemberShips.length,
      optionType: "team",
    };
  });

  const teamsOptions = await Promise.all(teamsOptionsPromises);

  resp.status(200).send([...teamsOptions]);
};
// exports.getPhdStudents = async (req, resp) => {
//   let user = userHelper.requesterUser(req);
//   try {
//     let userFromDB = await User.findById(user._id, { phdStudents: 1 });
//     let phdStudents = await PhdStudent.find({supervisor:user._id})
//     resp.status(200).json(userFromDB);
//   } catch (err) {
//     console.log(err);
//   }
// };
