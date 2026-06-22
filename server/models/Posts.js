///////////////////////////////////////////////////////////////////////////////
//                                Posts Model                                //
///////////////////////////////////////////////////////////////////////////////

/*
 * Simple blog-post style model, with comments/responses to posts included
 * as embedded subdocs. Team leaders can post but any (registered) users can
 * add comments in response to posts.
 */

const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    content: { type: String, required: true },
    // user who made the comment
    user: { type: Schema.Types.ObjectId, ref: "user" },
    createdAt: {
      type: Date,
      default: () => new Date(),
      get: (d) => d.toLocaleDateString(),
    },
  },
  {
    toJSON: { getters: true },
  }
);

const photoSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    flickrURL: {
      type: String,
      required: true,
    },
    caption: String,
  },
  {
    _id: false,
  }
);

// embedded (not a ref) so a draft's authorship survives the author's
// account being deleted -- a future webmaster post-management tab can
// treat "no matching user" as a signal that a stale draft is safe to delete
const authorSchema = new Schema(
  {
    userId: { type: String, required: true },
  },
  {
    _id: false,
  }
);

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    // summary is meant to be a teaser for display on front page
    summary: String,
    // link to the photo (if any) to be displayed with the post
    content: { type: String, required: true },
    createdAt: {
      type: Date,
      default: () => new Date(),
      get: (d) => d.toLocaleDateString(),
    },
    // drafts (posted: false) are only visible/editable by their author;
    // default true so existing code that creates posts without specifying
    // this still behaves as "published" -- note this default is only
    // applied when Mongoose hydrates a document, not at the MongoDB query
    // level, so posts already in the DB before this field existed need a
    // one-time backfill (see server/scripts/backfill-post-fields.js)
    posted: { type: Boolean, default: true },
    // when the post actually went live; left unset for drafts and for
    // legacy posts predating this field (sort-order handling for that is a
    // separate, later task)
    postedAt: {
      type: Date,
      get: (d) => d?.toLocaleDateString(),
    },
    author: authorSchema,
    // below are for the posts photos, eventually replaced by sub-population document
    // comments on the post (by any user)
    photo: photoSchema,
    comments: [commentSchema],
  },
  {
    toJSON: { getters: true, virtuals: true },
  }
);

const Post = model("post", postSchema);
module.exports = Post;
