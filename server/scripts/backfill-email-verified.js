// Optional one-time backfill for the "Add a verification step when creating
// an account" feature. Existing users (created before this feature existed)
// read as emailVerified:false purely because Mongoose applies the schema
// default in memory -- the stored document has no such field at all. This
// script grandfathers them in as verified, on the theory that an account
// that could already log in with that email address is "reachable" in the
// sense the verification flag is meant to capture.
//
// Not required for the feature to work correctly: nothing currently gates on
// emailVerified, so leaving existing users at the (in-memory) default false
// has no visible effect beyond the "unverified" banner/resend prompt on
// their account page. Run this only if that banner showing up for everyone
// who signed up pre-launch is undesirable.
//
// Usage:
//   mongosh "<connection-string>" server/scripts/backfill-email-verified.js
// or paste the body into an interactive mongosh session connected to the
// target database.
//
// Safe to run more than once: only touches documents missing emailVerified.

const result = db.users.updateMany(
  { emailVerified: { $exists: false } },
  { $set: { emailVerified: true } },
);

print(`Backfilled ${result.modifiedCount} user(s).`);
