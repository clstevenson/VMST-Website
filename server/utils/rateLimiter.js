const rateLimit = require("express-rate-limit");

// Throttles login attempts to slow down brute-force/credential-stuffing
// and the cheap DoS lever of forcing repeated bcrypt comparisons.
// Scoped to the "login" GraphQL operation only (via skip) since /graphql
// is a single endpoint shared with normal, frequent, legitimate queries.
//
// Exported as a factory (rather than a single shared instance) so each
// caller gets its own independent store -- this is what lets tests build
// a fresh, unexhausted limiter per test case.
function createLoginLimiter() {
  return rateLimit({
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
}

module.exports = createLoginLimiter;
