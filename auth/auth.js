const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const Team = require("../models/user");
const TeamMemberShip = require("../models/team-membership");
const Laboratory = require("../models/laboratory");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const config = require("../config");
const roles = require("../helpers/role");

passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const rolesArray = [
          roles.CED_HEAD,
          roles.LABORATORY_HEAD,
          roles.RESEARCHER,
        ];
        if (req.body.roles.every((r) => rolesArray.includes(r))) {
          console.log("error occured");
        }

        const { email, password, roles } = req.body;

        const user = await User.create({
          email,
          password,
          roles,
        });

        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "User not found" });

        const validate = await user.isValidPassword(password);
        if (!validate) return done(null, false, { message: "Wrong Password" });

        return done(null, user, { message: "Logged in Successfully" });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: config.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme("Bearer"),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);
