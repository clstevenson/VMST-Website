const { Competitor, Member, Photo, Post, User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');
const connection = require('../config/connection');
const Mail = require('../utils/emailHandler');
const generatePassword = require('../utils/password-generator');
const bcrypt = require('bcrypt');

const resolvers = {
  Query: {
    // get all USMS members of the VA LMSC
    members: async () => await Member.find().sort({ lastName: 1 }),
    // get all website users
    users: async () => await User.find(),
    // get all posts, sorted most recent first
    posts: async () => await Post.find().sort({ createdAt: -1 }),
    // get a single post with all comments
    // can't populate users directly, need to populate comments that are nested
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
        // don't attempt to update password here
        delete args.user.password;
        // only admins can update roles
        if (user.role !== 'webmaster') delete args.user.role;
        // find user by ID
        const updatedUser = await User.findByIdAndUpdate(user._id, args.user, { new: true });
        return updatedUser;
      } catch (err) {
        console.log(err);
      }
    },
    // anyone can request a password reset, which is mailed to them
    // input has to have the email address
    resetPassword: async (_, { email }) => {
      // generate a new password
      const newPassword = generatePassword(3);
      // hash it before saving to arguments
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = {
        password: hashedPassword,
      };
      // update the user profile with this password and return the updated value
      const updatedUser = await User.findOneAndUpdate({email: email}, user, { new: true });
      // email the user the new password
      // first get the email address(es) of the webmaster(s) for user email replying
      const webmasterEmail = await User.findOne({ role: 'webmaster' }).select('email');
      // put together the email data
      const mailArgs = {
        from: 'VMST webmaster',
        replyTo: webmasterEmail.email,
        emails: email,
        id: [],
        subject: "Your VMST password has been reset",
        plainText: `
Hello,

You have requested a password reset for the VMST website. Your new password is:

${newPassword}

After you use it to log in, if you wish you may change it to something more memorable.

If you feel you have received this message in error, please
contact the webmaster immediately by replying to this message.`,
      };

      try {
        Mail(mailArgs);
      } catch (err) {
        console.error;
        return false;
      }

      return updatedUser;
    },
    // add a new post
    addPost: async (_, args, { user }) => {
      // only team leaders can create posts
      if (user.role !== 'leader') throw AuthenticationError;
      return await Post.create(args);
    },
    uploadMembers: async (_, { memberData }, { user }) => {
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
      const emails = await User.find({ role: 'leader' }).select('email');
      // returned an array of objects with property "email" (one array item per leader)
      const mailArgs = { ...emailData };
      delete mailArgs.id;
      // add the leader's emails (as an array) to the argument object
      mailArgs.emails = emails.map(leader => leader.email);

      // call mail() with mailArgs
      if (mailArgs.emails.length > 0) {
        try {
          Mail(mailArgs)
        } catch {
          console.error;
          return false;
        };
      } else {
        throw new Error('No Leaders found')
      }

      // returning "true" to client means emails successfully sent
      return true;
    },
    emailLeadersWebmaster: async (_, { emailData }) => {
      // retrieve the emails of the leaders and webmaster from the DB
      const emails = await User.find({
        $or: [{ role: 'leader' }, { role: 'webmaster' }]
      }).select('email');
      // returned an array of objects with property "email" (one array item per email address)
      const mailArgs = { ...emailData };
      delete mailArgs.id;
      // add the emails (as an array) to the argument object
      mailArgs.emails = emails.map(user => user.email);

      // call mail() with mailArgs
      if (mailArgs.emails.length > 0) {
        try {
          Mail(mailArgs)
        } catch {
          console.error;
          return false;
        };
      } else {
        throw new Error('No Recipients found')
      }

      // returning "true" to client means emails successfully sent
      return true;
    },
    emailWebmaster: async (_, { emailData }) => {
      // retrieve the emails of the webmaster(s) from the DB
      // (there could potentially be more than one)
      const emails = await User.find({ role: 'webmaster' }).select('email');
      // returned an array of objects with property "email" (one array item per webmaster)
      const mailArgs = { ...emailData };
      delete mailArgs.id;
      // add the leader's emails (as an array) to the argument object
      mailArgs.emails = emails.map(user => user.email);

      // call mail() with mailArgs
      if (mailArgs.emails.length > 0) {
        try {
          Mail(mailArgs)
        } catch {
          console.error;
          return false;
        };
      } else {
        throw new Error('No webmasters found')
      }

      // returning "true" to client means emails successfully sent
      return true;
    },
    emailGroup: async (_, { emailData }, { user }) => {
      // only team leaders or coaches can email WO groups
      if (user.role !== 'leader' && user.role !== 'coach') throw AuthenticationError;
      // retrieve the emails of the workout group me
      const group = await Member.find({ _id: { $in: emailData.id } }).select('emails');
      // returned an array of objects with property "email" (one array item per leader in input)
      const mailArgs = { ...emailData };
      delete mailArgs.id;
      let emailArray = [];
      group.forEach(member => {
        emailArray = [...emailArray, ...member.emails];
      })

      mailArgs.emails = emailArray;

      // call mail() with mailArgs
      if (mailArgs.emails.length > 0) {
        try {
          Mail(mailArgs)
        } catch {
          console.error;
          return false;
        };
      } else {
        throw new Error('No Recipients for Members')
      }

      // returning "true" to client means emails successfully sent
      return true;
    },
  }
};

module.exports = resolvers;
