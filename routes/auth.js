const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config");

const User = require("../models/user");
const Team = require("../models/team");
const TeamMemberShip = require("../models/team-membership");
const Laboratory = require("../models/laboratory");
const Establishment = require("../models/establishment");

const router = express.Router();

router.post(
  "/signup",
  passport.authenticate("signup", { session: false }),
  async (req, res, next) => {
    res.json({
      message: "Signup successful",
      user: req.user,
    });
  }
);

router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err || !user) {
        // return next(info);
        return res.send("error condition if")
      }
    //   req.login(user, { session: false }, async (error) => {
    //     if (error) return next(error);
    //     const body = { _id: user._id, email: user.email, roles: user.roles };
    //     const token = jwt.sign({ user: body }, config.JWT_SECRET);
    //
    //     const laboratoriesHeaded = await Laboratory.find({
    //       head_id: user._id,
    //     });
    //
    //     const teamsHeaded = await Team.find({
    //       head_id: user._id,
    //     });
    //
    //     const teamsMemberships = await TeamMemberShip.find({
    //       user_id: user._id,
    //       active: true,
    //     });
    //
    //
    //     const establishmentsDirected = await Establishment.find({research_director_id: user._id});
    //
    //     await Promise.all(
    //       teamsMemberships.map((teamsMembership) =>
    //         Team.findOne({ _id: teamsMembership.team_id })
    //       )
    //     );
    //
    //     return res.json({
    //       ...user._doc,
    //       token,
    //       laboratoriesHeaded,
    //       teamsHeaded,
    //       teamsMemberships,
    //       establishmentsDirected
    //     });
    //   });
    } catch (error) {
      // return next(error);
      return res.send("error catch")
    }
    return res.send("api for auth")
  })(req, res, next);
});

module.exports = router;
