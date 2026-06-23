// One-time backfill for the "Add the ability to save drafts of a post"
// feature. Run this once against any database (local/dev/prod) that has
// posts predating the posted/postedAt fields, or those posts won't show up
// on the home page -- MongoDB's query engine checks the literal stored
// field, not the Mongoose schema default, so `Post.find({ posted: true })`
// would otherwise silently exclude them.
//
// Usage:
//   mongosh "<connection-string>" server/scripts/backfill-post-fields.js
// or paste the body into an interactive mongosh session connected to the
// target database.
//
// Safe to run more than once: only touches documents missing `posted`.

const result = db.posts.updateMany({ posted: { $exists: false } }, [
  {
    $set: {
      posted: true,
      // best-effort: treat existing posts as having gone live when they
      // were created, so a later sort-by-postedAt doesn't need a fallback
      // for this legacy data
      postedAt: { $ifNull: ["$postedAt", "$createdAt"] },
    },
  },
]);

print(`Backfilled ${result.modifiedCount} post(s).`);
