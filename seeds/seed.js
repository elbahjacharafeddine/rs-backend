const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const config = require("../config");

mongoose.set("useCreateIndex", true);
mongoose
    .connect(config.MONGODB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log("DB Connected!"))
    .catch((error) => console.log(`DB Connection Error: ${error.message}`));

const User = require("../models/user");
const University = require("../models/university");
const Establishment = require("../models/establishment");
const Laboratory = require("../models/laboratory");
const Team = require("../models/team");
const FollowedUser = require("../models/followed-user");
const TeamMembership = require("../models/team-membership");

const users = require("./data/users");
const universities = require("./data/universities");
const establishments = require("./data/establishments");
const laboratories = require("./data/laboratories");
const teams = require("./data/teams");

const clearData = () =>
    Promise.all([
        User.deleteMany(),
        University.deleteMany(),
        Establishment.deleteMany(),
        Laboratory.deleteMany(),
        Team.deleteMany(),
        FollowedUser.deleteMany(),
        TeamMembership.deleteMany(),
    ]);

const seedCEDHead = async () => Promise.all(users
    .filter(({roles}) => roles.includes("CED_HEAD"))
    .map((user) =>
        User.create({
            ...user,
            password: user.email.split("@")[0],
        })
    ));

const seedLaboratoryHeads = async () => {
    const CEDHeads = await User.find({roles: "CED_HEAD"});
    const seeding = users
        .filter(({roles}) => roles.includes("LABORATORY_HEAD"))
        .map((user) =>
            User.create({
                ...user,
                password: user.email.split("@")[0],
                creatorId: CEDHeads[0]._id,
            })
        );

    return Promise.all(seeding);
};

const seedResearchers = async () => {
    const LaboratoryHeads = await User.find({roles: "LABORATORY_HEAD"});

    const seeding = users
        .filter(({roles}) => roles.includes("RESEARCHER"))
        .map((user) =>
            User.create({
                ...user,
                password: user.email.split("@")[0],
                creatorId: LaboratoryHeads[0]._id,
            })
        );

    return Promise.all(seeding);
};

const confirmeUsers = () =>
    Promise.all(
        users.map((user) =>
            User.updateOne({email: user.email}, {$set: {hasConfirmed: true}})
        )
    );

const seedUniversities = () =>
    Promise.all(universities.map((university) => University.create(university)));

const seedEstablishments = () => Promise.all(
    establishments.map(async (establishment) => {
        const university = await University.findOne(establishment.university);

        return Establishment.create({
            ...establishment,
            university_id: university._id,
        });
    })
);

const seedLaboratories = () => {
    Promise.all(
        laboratories.map(async (laboratory) => {
            const head = await User.findOne(laboratory.head);
            const establishment = await Establishment.findOne(
                laboratory.establishment
            );

            return Laboratory.create({
                ...laboratory,
                establishment_id: establishment._id,
                head_id: head._id,
            });
        })
    );
};

const seedTeams = () => {
    Promise.all(
        teams.map(async (team) => {
            const head = await User.findOne();
            const laboratory = await Laboratory.findOne(team.laboratory);
            return Team.create({
                ...team,
                laboratory_id: laboratory._id,
                head_id: head._id,
            });
        })
    );
};

const timeDelay = () => {
    return new Promise((r) => setTimeout(r, 200));
};

clearData()
    .then(() => seedCEDHead())
    .then(() => timeDelay())
    .then(() => seedLaboratoryHeads())
    .then(() => timeDelay())
    .then(() => seedResearchers())
    .then(() => timeDelay())
    .then(() => confirmeUsers())
    .then(() => timeDelay())
    .then(() => seedUniversities())
    .then(() => timeDelay())
    .then(() => seedEstablishments())
    .then(() => timeDelay())
    .then(() => seedLaboratories())
    .then(() => timeDelay())
    .then(() => seedTeams())
    .then(() => {
        process.exit(0);
    })
    .catch((errors) => {
        console.log(errors);
        process.exit(0);
    });
