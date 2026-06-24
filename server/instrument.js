// Must be required before anything else in server.js, so Sentry's default
// integrations can instrument modules (eg express) before they're first
// required elsewhere.
require("dotenv").config();
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  // request bodies/cookies can contain the access/refresh JWT cookies or
  // member emails -- don't send them to a third party by default
  sendDefaultPii: false,
});

module.exports = Sentry;
