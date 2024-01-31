const jwt = require("jsonwebtoken");
const { User } = require("../model/user.model");
const { blacklist } = require("../blacklist.js");
require("dotenv").config();
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  // const token =req.body.token || req.header("Authorisation").replace("Bearer ", "");
  try {
    if (blacklist.includes(token)) {
      res.send("Unauthorized");
    } else {
      if (token) {
        const decodedToken = jwt.verify(token, process.env.securityKey);
        if (decodedToken) {
          const { UserId } = decodedToken;

          const user = await User.findOne({ _id: UserId });
          if (user) {
            req.user = user;
            req.UserId = UserId;

            next();
          } else {
            return res
              .status(403)
              .send({ msg: "Forbidden. Insufficient privileges" });
          }
        }
      } else {
        return res.send("Please login");
      }
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ msg: "error please try after some time or try to login again" });
  }
};

module.exports = {
  authMiddleware,
};
