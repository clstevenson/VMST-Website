const rateLimit = require("express-rate-limit");

// Throttles login attempts to slow down brute-force/credential-stuffing
// and the cheap DoS lever of forcing repeated bcrypt comparisons.
// Scoped to the "login" GraphQL operation only (via skip) since /graphql
// is a single endpoint shared with normal, frequent, legitimate queries.
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.body?.operationName !== "login",
  message: {
    errors: [
      { message: "Too many login attempts. Please try again later." },
    ],
  },
});

module.exports = loginLimiter;
