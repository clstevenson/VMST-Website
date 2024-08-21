const { Meets, Member, Photo, Post, User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");
const connection = require("../config/connection");
const Mail = require("../utils/emailHandler");
const generatePassword = require("../utils/password-generator");
const bcrypt = require("bcrypt");
const {
  getAlbums,
  getAlbumPhotos,
  getFeaturedPhotos,
  getPhotos,
  getPhotoSizes,
  getPhotoInfo,
} = require("../utils/get-flickr-photos");
const { findByIdAndDelete } = require("../models/Posts");
const Meet = require("../models/Meets");

const resolvers = {
  Query: {
    // get all USMS members of the VA LMSC
    members: async () => await Member.find().sort({ lastName: 1 }),
    // get website users (or maybe a single user)
    users: async (_, { id }) => {
      if (id) {
        // return a single user (as an array to match typedef)
        const user = await User.findById(id);
        return [user];
      } else {
        const users = await User.find();
        return users;
      }
    },
    // test if a given email address already exists (since it must be unique)
    emailExists: async (_, { email }) => {
      const user = await User.findOne({ email: email });
      return user;
    },
    // get all posts, sorted most recent first
    posts: async () => await Post.find().sort({ createdAt: -1 }),
    // get a single post with all comments
    // can't populate users directly, need to populate comments that are nested
    onePost: async (_, { id }) =>
      await Post.findById(id).populate("comments.user"),
    // get list of unique workout groups
    // GraphQL returns an object of the form { groups: [...list of unique groups ...] }
    // Note that there is a client-side JS utility that does the same thing, given
    // an input of members, without having to query the DB
    groups: async () =>
      await Member.find({ club: "VMST" }).distinct("workoutGroup"),
    // get all members of VMST
    vmstMembers: async () => {
      try {
        const swimmers = await Member.find({
          club: "VMST",
        });
        if (swimmers.length === 0) {
          throw new Error("Didn't find any VMST swimmers");
        }
        return swimmers;
      } catch (err) {
        console.log(err);
      }
    },
    meets: async () => await Meet.find(),
    getLeaders: async () => await User.find({ role: "leader" }),
    getAlbums: async (_, { perPage, page }) => {
      const response = await getAlbums(page, perPage);
      if (!response) throw new Error("Something went wrong");
      return response;
    },
    getAlbumPhotos: async (_, { id, page, perPage }) => {
      const response = await getAlbumPhotos(id, page, perPage);
      if (!response) throw new Error("Something went wrong");
      return response;
    },
    getFeaturedPhotos: async (_, { page, perPage }) => {
      const response = await getFeaturedPhotos(page, perPage);
      if (!response) throw new Error("Something went wrong");
      return response;
    },
    getPhotoSizes: async (_, { id }) => {
      const response = await getPhotoSizes(id);
      if (!response) throw new Error("Something went wrong");
      return response;
    },
    getPhotos: async (_, { page, perPage }) => {
      const response = await getPhotos(page, perPage);
      if (!response) throw new Error("Something went wrong");
      return response;
    },
    getPhotoInfo: async (_, { id }) => {
      const response = await getPhotoInfo(id);
      if (!response) throw new Error("Something went wrong");
      return response;
    },
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
    // a logged-in user can change their own info
    // the webmaster can change anyone's info
    // user ID is as an argument (so the webmaster can change it)
    // but a token is needed in order to edit a user
    editUser: async (_, args, { user }) => {
      try {
        // must be logged-in to proceed
        if (!user) throw AuthenticationError;
        // don't attempt to update password here
        delete args.user.password;
        // only admins can update roles
        if (user.role !== "webmaster") delete args.user.role;
        // ID must be part of the args (not obtained from token)
        const updatedUser = await User.findByIdAndUpdate(args._id, args.user, {
          new: true,
        });
        if (!updatedUser) throw AuthenticationError;
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
      const updatedUser = await User.findOneAndUpdate({ email: email }, user, {
        new: true,
      });

      if (!updatedUser) {
        throw new Error("No account with that email exists.");
      }
      // email the user the new password
      // first get the email address(es) of the webmaster(s) for user email replying
      const webmasterEmail = await User.findOne({ role: "webmaster" }).select(
        "email"
      );
      // put together the email data
      const mailArgs = {
        from: "VMST webmaster",
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
    // logged-in users can change their password
    changePassword: async (_, { password }, { user }) => {
      try {
        // need to has the new password then save it to the args
        const hashedPassword = await bcrypt.hash(password, 10);
        let updatedUser = {
          password: hashedPassword,
        };
        // update user by ID
        updatedUser = await User.findByIdAndUpdate(user._id, updatedUser, {
          new: true,
        });
        if (!updatedUser) {
          throw new Error("Something went wrong, password was not updated.");
        }
        return updatedUser;
      } catch (err) {
        console.log(err);
      }
    },
    // add a new meet
    addMeet: async (_, { meet, meetSwimmers, relays }, { user }) => {
      // only leaders can add meets
      if (user.role !== "leader") throw AuthenticationError;
      const newMeet = {
        ...meet,
        meetSwimmers,
        relays,
      };
      try {
        return await Meet.create(newMeet);
      } catch (error) {
        console.log(error);
      }
    },
    // delete a meet
    deleteMeet: async (_, { _id }, { user }) => {
      // only leaders can delete meets
      if (user.role !== "leader") throw AuthenticationError;
      try {
        const deletedMeet = await Meet.findByIdAndDelete(_id);
        return deletedMeet;
      } catch (error) {
        console.log(error);
      }
    },
    // add a new post
    addPost: async (_, { title, summary, content, photo }, { user }) => {
      // only team leaders can create posts
      if (user.role !== "leader") throw AuthenticationError;
      const post = {
        title,
        summary,
        content,
        photo,
      };
      return await Post.create(post);
    },
    editPost: async (_, { _id, title, summary, content, photo }, { user }) => {
      // only leaders can delete posts
      if (user.role !== "leader") throw AuthenticationError;
      const post = {
        title,
        summary,
        content,
        photo,
      };
      try {
        let updatedPost;
        if (photo.id) {
          updatedPost = await Post.findOneAndUpdate({ _id }, post, {
            new: true,
          });
        } else {
          updatedPost = await Post.findOneAndUpdate(
            { _id },
            { title, summary, content, $unset: { photo: 1 } },
            { new: true }
          );
        }
        if (!updatedPost) {
          throw new Error("Something went wrong, post was not updated");
        }
      } catch (error) {
        console.log(error);
      }
    },
    deletePost: async (_, { _id }, { user }) => {
      // only leaders can delete posts
      if (user.role !== "leader") throw AuthenticationError;
      try {
        const deletedPost = await Post.findByIdAndDelete(_id);
        // return is null if the post is not deleted (ie, ID not found)
        return deletedPost;
      } catch (error) {
        console.log(error);
      }
    },
    uploadMembers: async (_, { memberData }, { user }) => {
      // only the Membership Coordinator is allowed to update the Member collection
      if (user.role !== "membership") throw AuthenticationError;

      // update the Members collection in the DB
      // first delete the members collection if it exists
      let membersCheck = await connection.db
        .listCollections({ name: "members" })
        .toArray();
      if (membersCheck.length) {
        await connection.dropCollection("members");
      }
      return await Member.insertMany(memberData);
    },
    emailLeaders: async (_, { emailData }) => {
      // retrieve the emails of the leaders from the DB
      const emails = await User.find({ role: "leader" }).select("email");
      // returned an array of objects with property "email" (one array item per leader)
      const mailArgs = { ...emailData };
      delete mailArgs.id;
      // add the leader's emails (as an array) to the argument object
      mailArgs.emails = emails.map((leader) => leader.email);

      // call mail() with mailArgs
      if (mailArgs.emails.length > 0) {
        try {
          Mail(mailArgs);
        } catch {
          console.error;
          return false;
        }
      } else {
        throw new Error("No Leaders found");
      }

      // returning "true" to client means emails successfully sent
      return true;
    },
    emailLeadersWebmaster: async (_, { emailData }) => {
      // retrieve the emails of the leaders and webmaster from the DB
      const emails = await User.find({
        $or: [{ role: "leader" }, { role: "webmaster" }],
      }).select("email");
      // returned an array of objects with property "email" (one array item per email address)
      const mailArgs = { ...emailData };
      delete mailArgs.id;
      // add the emails (as an array) to the argument object
      mailArgs.emails = emails.map((user) => user.email);

      // call mail() with mailArgs
      if (mailArgs.emails.length > 0) {
        try {
          Mail(mailArgs);
        } catch {
          console.error;
          return false;
        }
      } else {
        throw new Error("No Recipients found");
      }

      // returning "true" to client means emails successfully sent
      return true;
    },
    emailWebmaster: async (_, { emailData }) => {
      // retrieve the emails of the webmaster(s) from the DB
      // (there could potentially be more than one)
      const emails = await User.find({ role: "webmaster" }).select("email");
      // returned an array of objects with property "email" (one array item per webmaster)
      const mailArgs = { ...emailData };
      delete mailArgs.id;
      // add the leader's emails (as an array) to the argument object
      mailArgs.emails = emails.map((user) => user.email);

      // call mail() with mailArgs
      if (mailArgs.emails.length > 0) {
        try {
          Mail(mailArgs);
        } catch {
          console.error;
          return false;
        }
      } else {
        throw new Error("No webmasters found");
      }

      // returning "true" to client means emails successfully sent
      return true;
    },
    emailGroup: async (_, { emailData }, { user }) => {
      // only team leaders or coaches can email WO groups
      if (user.role !== "leader" && user.role !== "coach")
        throw AuthenticationError;
      // retrieve the emails of the recipients (from their id's)
      const group = await Member.find({ _id: { $in: emailData.id } }).select(
        "emails"
      );

      // returned an array of objects with property "email" (one array item per leader in input)
      const mailArgs = { ...emailData };
      delete mailArgs.id;
      let emailArray = [];
      group.forEach((member) => {
        emailArray = [...emailArray, ...member.emails];
      });
      mailArgs.emails = emailArray;

      // need to know who to reply to (ie the leader or coach who is sending the message)
      const sender = await User.findById(user._id).select("email");
      mailArgs.from = sender.email;
      mailArgs.replyTo = sender.email;

      // call mail() with mailArgs
      if (mailArgs.emails.length > 0) {
        try {
          Mail(mailArgs);
        } catch {
          console.error;
          return false;
        }
      } else {
        throw new Error("No Recipients for Members");
      }

      // returning "true" to client means emails successfully sent
      return true;
    },
  },
};

module.exports = resolvers;
