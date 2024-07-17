const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.SECRET_KEY;
const expiration = "6h";
// 10-min expiration for dev purposes
// const expiration = 60 * 10;

module.exports = {
  AuthenticationError: new GraphQLError("Could not authenticate user.", {
    extensions: {
      code: "UNAUTHENTICATED",
    },
  }),
  authMiddleware: function ({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // split the token string into an array and return actual token
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    // if there is no token, return the request unchanged
    if (!token) return req;

    /* VERIFY THE TOKEN */
    // if token can be verified, add the decoded user's data to the request
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      // token could not be verified which throws an error
      console.log("Invalid token");
    }

    // return the request object so it can be passed to the resolver as `context`
    return req;
  },
  signToken: function ({ email, role, _id }) {
    const payload = { email, role, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
