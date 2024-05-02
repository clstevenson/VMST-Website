const { Competitor, Member, Photo, Post, User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');
const importCsvFile = require('../utils/importCsvFile');
const connection = require('../config/connection');

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
    // add a new post
    addPost: async (_, args, { user }) => {
      // only team leaders can create posts
      if (user.role !== 'leader') throw new Error('Unauthorized');
      return await Post.create(args);
    },
    uploadMembers: async (_, { file }, { user }) => {
      // input is the file path

      // only the Membership Coordinator is allowed to update the Member collection
      if (user.role !== 'membership') throw new Error('Unauthorized');

      // use importCsvFile to return the data
      const allMemberData = await importCsvFile(file);

      // extract the parts that we need
      // note that USMS seems to make the last line of the CSV blank, need to protect against that
      const memberData = allMemberData.map(member => {
        const obj = {};
        obj.usmsRegNo = member['USMS Number'] || '';
        obj.firstName = member['First Name'] || '';
        obj.lastName = member['Last Name'] || '';
        obj.gender = member.Gender || '';
        obj.club = member.Club || '';
        obj.workoutGroup = member['WO Group'];
        obj.regYear = member['Reg. Year'] || 0;
        obj.emails = [];
        if (member['(P) Email Address']) obj.emails.push(member['(P) Email Address']);
        if (member['(S) Email Address']) obj.emails.push(member['(S) Email Address']);
        obj.emailExclude = member['Exclude LMSC Group Email'] === 'Y';
        return obj;
      });

      // update the Members collection in the DB
      // first delete the members collection if it exists
      let membersCheck = await connection.db.listCollections({ name: 'members' }).toArray();
      if (membersCheck.length) {
        await connection.dropCollection('members');
      }

      // if the USMS registration number is blank consider that record invalid
      // (it is usuall due to a blank line at the end of the CSV)
      return await Member.insertMany(memberData.filter(member => member.usmsRegNo !== ''));
    }
  }
};

module.exports = resolvers;
