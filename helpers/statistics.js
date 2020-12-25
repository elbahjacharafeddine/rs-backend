const User = require("../models/user");
const FollowedUser = require("../models/followed-user");
const TeamMemberShip = require("../models/team-membership");
const Laboratory = require("../models/laboratory");
const Team = require("../models/team");

const getFollowedUsers = async (query) => {
  const { laboratoryAbbreviation, teamAbbreviation } = query;
  const followedUsers = await FollowedUser.find();
  const followedUsersIds = followedUsers.map(({ user_id }) => user_id);

  if (!laboratoryAbbreviation && !teamAbbreviation)
    return await FollowedUser.find();

  if (laboratoryAbbreviation) {
    const laboratory = await Laboratory.findOne({
      abbreviation: laboratoryAbbreviation,
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

    const followedUsers = await Promise.all(
      teamsMemberShips
        .flatMap((t) => t)
        .map(({ user_id }) => FollowedUser.findOne({ user_id }))
    );

    const followedUsersAcounts = await Promise.all(
      teamsMemberShips
        .flatMap((t) => t)
        .map(({ user_id }) => User.findById(user_id))
    );

    const result = followedUsersAcounts.map(
      ({ firstName, lastName }, index) => ({
        ...followedUsers[index]._doc,
        firstName,
        lastName,
      })
    );
    console.log(result);
    return result;
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

    const followedUsers = await Promise.all(
      teamsMemberShips.map(({ user_id }) => FollowedUser.findOne({ user_id }))
    );

    const followedUsersAcounts = await Promise.all(
      teamsMemberShips.map(({ user_id }) => User.findById(user_id))
    );

    const result = followedUsersAcounts.map(
      ({ firstName, lastName }, index) => ({
        ...followedUsers[index]._doc,
        firstName,
        lastName,
      })
    );

    console.log(result);
    return result;
  }
};

exports.getStatistics = async (req, resp) => {
  const laboratoryAbbreviation = req.param("laboratory_abbreviation");
  const teamAbbreviation = req.param("team_abbreviation");

  const followedUsers = await getFollowedUsers({
    laboratoryAbbreviation,
    teamAbbreviation,
  });

  const followedUsersStatistics = followedUsers.map(
    ({ firstName, lastName, publications, profilePicture, ...user }) => {
      const yearlyPublications = publications
        .map((publication) => publication.year)
        .reduce((r, c) => ((r[c] = (r[c] || 0) + 1), r), {});

      return {
        name: firstName + " " + lastName,
        profilePicture,
        yearlyPublications,
      };
    }
  );

  resp.status(200).send(followedUsersStatistics);
};

exports.getPublicationsPerTeamPerYear = async (req, resp) => {
  const teamAbbreviation = req.param("team_abbreviation");
  const year = req.param("year");
  console.log(teamAbbreviation);
  console.log(year);
  
  const followedUsers = await getFollowedUsers({
    teamAbbreviation,
  });
 
  const followedUsersStatistics = followedUsers.map(
    ({ firstName, lastName, publications, profilePicture, ...user }) => {
      const yearlyPublications = publications
        .map((publication) => publication.year)
        .reduce((r, c) => ((r[c] = (r[c] || 0) + 1), r), {});
     
        
      return {
      
        name: firstName + " " + lastName,
        profilePicture,
        yearlyPublications,
        publications,
        
       
      };
    }
  );

  const publications =[];
  console.log(year);
  followedUsersStatistics.map((researcher)=>{
      researcher.publications.map(publication =>{
        if(publication.year===year)
          publications.push(publication)        
      })
    })
    console.log(publications);
  resp.status(200).send(publications);
}

exports.getAllStatistics = async function (req, resp) {
  try {
    let stats = await Promise.all([
      getNumberOfLabsPerEstablishment(),
      getNumberOfPublicationsPerUser(req.query.start, req.query.end),
      getNumberOfLabsPerUniv(),
    ]);

    resp.status(200).send({
      numberOfLabsPerEstablishment: stats[0],
      numberOfLabsPerUniv: stats[2],
      numberOfPublicationsPerUser: stats[1],
    });
  } catch (error) {
    resp.status(500).send(error);
  }
};

async function getNumberOfPublicationsPerUser(start, end) {
  let years = [];
  let statistic = null;
  for (let i = start; i <= end; i++) years.push(i);

  await FollowedUser.find({}, "name id publications")
    .then((followedUsers) => {
      followedUsers.forEach((user) => {
        let publicationsStatistics = {};
        years.forEach((year) => {
          let numberOfPublication = 0;
          user.publications.forEach((publication) => {
            if (publication.year == year) numberOfPublication++;
          });

          publicationsStatistics[year] = numberOfPublication;
        });
        user._doc.publicationStatistics = publicationsStatistics;
        delete user._doc.publications;
      });
      statistic = followedUsers;
    })
    .catch((error) => {
      throw error;
      console.log(error);
    });

  return statistic;
}

async function getNumberOfLabsPerUniv() {
  let statistic = null;
  await University.find()
    .then((universities) =>
      Promise.all(
        universities.map(async (university) => {
          let numberOfLabs = 0;
          const establishments = await Establishment.find({
            university_id: university._id,
          }).then((establishments) =>
            Promise.all(
              establishments.map(async (establishment) => {
                numberOfLabs += await Laboratory.countDocuments({
                  establishment_id: establishment.id,
                });
              })
            )
          );

          return {
            ...university._doc,
            numberOfLabs: numberOfLabs,
          };
        })
      )
    )
    .then((stat) => {
      statistic = stat;
    })
    .catch((error) => {
      throw error;
      console.log(error);
    });

  return statistic;
}

async function getNumberOfLabsPerEstablishment() {
  let statistic = null;
  const establishments = await Establishment.find();
  return Promise.all(
    establishments.map(async (establishment) => {
      let numberOfLabs = 0;
      numberOfLabs += await Laboratory.countDocuments({
        establishment_id: establishment._id,
      });
      return {
        ...establishment._doc,
        numberOfLabs: numberOfLabs,
      };
    })
  ).catch((error) => {
    throw error;
  });

  return statistic;
}
