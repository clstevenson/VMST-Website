const Sentry = require("../instrument");

// Codes this app throws intentionally as normal control flow (validation
// failures, expected auth/limit rejections) -- not bugs, so they shouldn't
// show up in Sentry's Issues stream. Anything else -- including
// graphql-js's own default INTERNAL_SERVER_ERROR bucket, which covers raw
// Mongoose validation errors and genuine bugs alike -- gets reported.
// Starting broad and narrowing this allowlist later if a particular code
// turns out to be noisy is the right default; see NearTermTasks.org.
const EXPECTED_ERROR_CODES = new Set([
  "UNAUTHENTICATED", // requireRole/AuthenticationError, utils/auth.js
  "BAD_USER_INPUT", // graphql-js's own missing-required-field coercion
  "DUPLICATE_EMAIL",
  "UPLOAD_FAILED",
  "UPLOAD_PARTIAL_FAILURE",
  "EMAIL_LIMIT_EXCEEDED",
  // malformed/invalid queries (unknown arg, wrong type, parse error) --
  // a client mistake, not a server bug; confirmed these reach this plugin
  // via manual testing and would otherwise spam Sentry with every typo
  "GRAPHQL_VALIDATION_FAILED",
  "GRAPHQL_PARSE_FAILED",
]);

// Apollo Server doesn't get the same free ride as plain Express -- resolver
// errors are caught and formatted by Apollo's own error layer before they'd
// ever look like an uncaught exception to Sentry's default instrumentation.
// This plugin is the explicit hook needed to forward genuine errors.
module.exports = {
  async requestDidStart() {
    return {
      async didEncounterErrors(requestContext) {
        for (const err of requestContext.errors) {
          if (EXPECTED_ERROR_CODES.has(err.extensions?.code)) continue;
          Sentry.captureException(err);
        }
      },
    };
  },
};
