const { Competitor, Member, Photo, Post, User }  = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    // get all USMS members
    members: async () => await Member.find(),
    // get all website users
    users: async () => await User.find(),
    // get all posts
    posts: async () => await Post.find(),
    // get all VMST members (with workout group affiliations)

    // get list of unique workout groups
  },
};

module.exports = resolvers;
