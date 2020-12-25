const expressJwt = require("express-jwt");
const config = require("../config");

function authorize(roles = []) {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return [
    expressJwt({
      secret: config.JWT_SECRET,
      algorithms: ["HS256"],
    }),
    (req, res, next) => {
      if (roles.length && !req.user.user.roles.some(r=> roles.includes(r))) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      next();
    },
  ];
}

module.exports = authorize;
