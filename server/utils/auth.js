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

const AuthenticationError = new GraphQLError("Could not authenticate user.", {
  extensions: {
    code: "UNAUTHENTICATED",
  },
});

module.exports = {
  AuthenticationError,

  // throws AuthenticationError unless user exists and (when roles are given) has one of them;
  // bakes the null-check into the role check so it can't be omitted by accident
  requireRole: function (user, ...roles) {
    if (!user || (roles.length && !roles.includes(user.role))) {
      throw AuthenticationError;
    }
  },

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

  // non-expiring by design -- an unsubscribe link should keep working
  // indefinitely. Scoped via `purpose` so it can't be replayed as (or
  // confused with) a normal access token, even though it reuses `secret`
  signUnsubscribeToken: function ({ _id }) {
    return jwt.sign({ _id, purpose: "unsubscribe" }, secret);
  },

  // returns the target user's _id if `token` is a validly-signed,
  // correctly-scoped unsubscribe token, otherwise null
  verifyUnsubscribeToken: function (token) {
    try {
      const { _id, purpose } = jwt.verify(token, secret);
      return purpose === "unsubscribe" ? _id : null;
    } catch {
      return null;
    }
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

  // Mount as a REST route: POST /logout
  // clears the httpOnly refresh cookie, which client JS can never do on its own
  logoutHandler: function (_req, res) {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(204).end();
  },

  // Mount as a REST route: POST /refresh
  refreshHandler: async function (req, res) {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
      const { _id } = jwt.verify(token, refreshSecret);
      // look up current role/group so a refreshed access token carries the
      // same authorization data as a fresh login, not just the user id --
      // also the only place a stateless-JWT setup can cheaply re-check
      // current DB state, eg a ban applied after the token was issued
      const user = await User.findById(_id);
      if (!user) {
        return res.status(403).json({ message: "User no longer exists" });
      }
      if (user.accountStatus === "banned") {
        // clear the cookie so the client can't just keep retrying
        res.clearCookie("refresh_token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        return res.status(403).json({ message: "Account suspended" });
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
