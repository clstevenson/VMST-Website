const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const ms = require("ms");
const User = require("../models/Users");
require("dotenv").config();

const secret = process.env.SECRET_KEY;
const refreshSecret = process.env.REFRESH_SECRET_KEY;
// use short expiration in development to test token in dev
const accessExpiration = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const refreshExpiration = process.env.REFRESH_TOKEN_EXPIRY || "7d";

module.exports = {
  AuthenticationError: new GraphQLError("Could not authenticate user.", {
    extensions: {
      code: "UNAUTHENTICATED",
    },
  }),

  authMiddleware: function ({ req, res }) {
    // if present token is in the header of the request
    let token = req.headers.authorization;
    if (token) token = token.split(" ").pop().trim();
    if (!token) return { req, res };

    // verify the token and return it as resolver context
    try {
      const { data } = jwt.verify(token, secret, { maxAge: accessExpiration });
      req.user = data;
    } catch {
      console.log("Invalid or expired token");
    }

    return { req, res, user: req.user };
  },

  signToken: function ({ role, _id, group }) {
    const payload = { role, _id, group };
    return jwt.sign({ data: payload }, secret, { expiresIn: accessExpiration });
  },

  signRefreshToken: function ({ _id }) {
    return jwt.sign({ _id }, refreshSecret, { expiresIn: refreshExpiration });
  },

  // Call this in login resolver after signing both tokens
  setRefreshCookie: function (res, refreshToken) {
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ms(refreshExpiration),
    });
  },

  // Mount as a REST route: POST /refresh
  refreshHandler: async function (req, res) {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
      const { _id } = jwt.verify(token, refreshSecret);
      // look up current role/group so a refreshed access token carries the
      // same authorization data as a fresh login, not just the user id
      const user = await User.findById(_id);
      if (!user) {
        return res.status(403).json({ message: "User no longer exists" });
      }
      const newAccessToken = jwt.sign(
        { data: { role: user.role, _id: user._id, group: user.group } },
        secret,
        { expiresIn: accessExpiration },
      );
      return res.json({ accessToken: newAccessToken });
    } catch {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }
  },
};
