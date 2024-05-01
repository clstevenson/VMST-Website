const { Competitor, Member, Photo, Post, User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    // get all USMS members
    members: async () => await Member.find(),
    // get all website users
    users: async () => await User.find(),
    // get all posts
    // can't populate users directly, need to populate comments that are nested
    posts: async () => await Post.find(),
    // get a single post with all comments
    onePost: async (_, { id }) => await Post.findById(id).populate('comments.user'),
    // get all competitors
    competitors: async () => await Competitor.find(),
    // get list of unique workout groups
    // GraphQL returns an object of the form { groups: [...list of unique groups ...] }
    groups: async () => await Member.find({ club: 'VMST' }).distinct('workoutGroup'),
    // get members of a specific workout group (or all of VMST)
    vmstMembers: async (_, { workoutGroup }) => {
      let swimmers = [];
      try {
        if (workoutGroup.toLowerCase() === 'vmst') {
          swimmers = await Member.find({ club: 'VMST' });
        } else {
          swimmers = await Member.find({ workoutGroup: workoutGroup });
        }
        return swimmers;
      } catch (err) {
        console.log(err);
      }
    }
  },
  Mutation: {
    // login with email and password which returns signed JWT
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email: email });
      // no user with that email
      if (!user) throw AuthenticationError;
      // check password
      const correctPW = await user.isCorrectPassword(password);
      if (!correctPW) throw AuthenticationError;
      // sign the token and return it with the user
      const token = signToken(user);
      return { token, user };
    },
    // create new user, four required inputs, returns signed JWT
    addUser: async (_, { firstName, lastName, email, password }) => {
      const user = await User.create({ firstName, lastName, email, password });
      // return with error message if no user created
      if (!user) return 'Error: Something is wrong!';
      // sign the JWT and return with the user
      const token = signToken(user);
      return { token, user };
    },
    // user info is passed by context (ie in the token)
    editUser: async (_, args, { user }) => {
      try {
        if (user.role !== 'admin') {
          // only admins can update roles (or passwords for now)
          delete args.user.role;
          delete args.user.password;
        }
        // find user by email, which should be unique
        const updatedUser = User.findByIdAndUpdate(user._id, args.user, { new: true });
        return updatedUser;
      } catch (err) {
        console.log(err);
      }
    },
  }
};

module.exports = resolvers;
