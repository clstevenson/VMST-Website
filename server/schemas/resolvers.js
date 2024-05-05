const { Competitor, Member, Photo, Post, User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');
const connection = require('../config/connection');
const Mail = require('../utils/emailHandler');

const resolvers = {
  Query: {
    // get all USMS members
    members: async () => await Member.find(),
    // get all website users
    users: async () => await User.find(),
    // get all posts
    // can't populate users directly, need to populate comments that are nested
    posts: async () => await Post.find().sort({ createdAt:-1 }),
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
    },
    getLeaders: async () => await User.find({ role: 'leader' }),
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
      if (!user) throw AuthenticationError;
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
    // add a new post
    addPost: async (_, args, { user }) => {
      // only team leaders can create posts
      if (user.role !== 'leader') throw AuthenticationError;
      return await Post.create(args);
    },
    uploadMembers: async (_, { memberData }, { user }) => {

      // input is the file path to the CSV file containing the membership data
      // only the Membership Coordinator is allowed to update the Member collection
      if (user.role !== 'membership') throw AuthenticationError;

      // update the Members collection in the DB
      // first delete the members collection if it exists
      let membersCheck = await connection.db.listCollections({ name: 'members' }).toArray();
      if (membersCheck.length) {
        await connection.dropCollection('members');
      }

      return await Member.insertMany(memberData);
    },
    emailLeaders: async (_, { emailData }) => {
      // retrieve the emails of the leaders from the DB
      const leaders = await User.find({ _id: { $in: emailData.id } }).select('email');
      // returned an array of objects with property "email" (one array item per leader in input)
      const mailArgs = { ...emailData };
      delete mailArgs.id;
      mailArgs.emails = leaders.map(leader => leader.email);

      // call mail() with mailArgs
      try {
        Mail(mailArgs)
      } catch {
        console.error;
        return false;
      };

      // returning "true" to client means emails successfully sent
      return true;
    },
  }
};

module.exports = resolvers;
