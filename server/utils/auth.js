const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
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
      // needs to match refreshExpiration (in units of ms)
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  },

  // Mount as a REST route: POST /refresh
  refreshHandler: function (req, res) {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
      const { _id } = jwt.verify(token, refreshSecret);
      // possible friction point: role change since last login
      // user needs to manually log out and log back in to pick up change
      const newAccessToken = jwt.sign({ data: { _id } }, secret, {
        expiresIn: accessExpiration,
      });
      return res.json({ accessToken: newAccessToken });
    } catch {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }
  },
};
