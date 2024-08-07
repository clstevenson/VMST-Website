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
