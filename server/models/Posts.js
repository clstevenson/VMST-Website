///////////////////////////////////////////////////////////////////////////////
//                                Posts Model                                //
///////////////////////////////////////////////////////////////////////////////

/*
 * Simple blog-post style model, with comments/responses to posts included
 * as embedded subdocs. Team leaders can post but any (registered) users can
 * add comments in response to posts.
 */

const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    // user who made the comment
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      get: d => d.toLocaleString(),
    },
  },
  {
    toJSON: {
      getters: true,
    },
  },
);

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    summary: { // meant to be a teaser displayed on home page
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // user (leader) who made the post
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      get: d => d.toLocaleString(),
    },
    // comments on the post (by any user)
    comments: [commentSchema],
  },
  {
    toJSON: { getters: true },
  },
);

const Post = model('post', postSchema);
module.exports = Post;
