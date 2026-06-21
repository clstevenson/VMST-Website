const { Member, Post, User } = require("../models");
const {
  signToken,
  AuthenticationError,
  signRefreshToken,
  setRefreshCookie,
  requireRole,
} = require("../utils/auth");

// no longer used directly in this file (uploadMembers no longer drops the
// collection), but required here for its side effect: it's what opens
// mongoose's default connection. schemas/index.js doesn't require it
// independently, and resolvers.test.js relies on requiring this file (via
// ./index) to be what triggers that connection, after pointing MONGODB_URI
// at the in-memory test DB.
require("../config/connection");
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
    members: async (_, __, { user }) => {
      requireRole(user, "membership");
      return await Member.find().sort({ lastName: 1 });
    },
    // get a user's own profile (no one can look up anyone else's, including webmaster)
    user: async (_, { id }, { user }) => {
      requireRole(user);
      if (id !== user._id) throw AuthenticationError;
      return await User.findById(id);
    },
    // test if a given email address already exists (since it must be unique);
    // only used by an already-logged-in user changing their email
    emailExists: async (_, { email }, { user }) => {
      requireRole(user);
      return await User.findOne({ email: email });
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
    vmstMembers: async (_, __, { user }) => {
      requireRole(user, "leader", "coach");
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
    // look up current members by USMS ID regardless of their current club
    // used to email meet participants who may have since switched clubs
    membersByUsmsId: async (_, { usmsIds }, { user }) => {
      requireRole(user, "leader", "coach");
      const members = await Member.find({ usmsId: { $in: usmsIds } });
      // a coach may only email members of their own workout group
      if (user.role === "coach") {
        return members.filter((member) => member.workoutGroup === user.group);
      }
      return members;
    },
    meets: async (_, __, { user }) => {
      requireRole(user, "leader", "coach");
      return await Meet.find();
    },
    getLeaders: async (_, __, { user }) => {
      requireRole(user, "webmaster");
      return await User.find({ role: "leader" });
    },
    // full list of site accounts, for the webmaster's user-management page
    users: async (_, __, { user }) => {
      requireRole(user, "webmaster");
      return await User.find().sort({ lastName: 1 });
    },
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
    login: async (_, { email, password }, { res }) => {
      const user = await User.findOne({ email: email });
      // no user with that email
      if (!user) throw AuthenticationError;
      // check password
      const correctPW = await user.isCorrectPassword(password);
      if (!correctPW) throw AuthenticationError;
      // sign the token and return it with the user
      const accessToken = signToken(user);
      const refreshToken = signRefreshToken(user);
      setRefreshCookie(res, refreshToken);
      return { token: accessToken, user };
    },
    // create new user, four required inputs, returns signed JWT
    addUser: async (_, { firstName, lastName, email, password }, { res }) => {
      const user = await User.create({ firstName, lastName, email, password });
      if (!user) throw AuthenticationError;
      const accessToken = signToken(user);
      const refreshToken = signRefreshToken(user);
      setRefreshCookie(res, refreshToken);
      return { token: accessToken, user };
    },
    // a logged-in user can change their own info
    // the webmaster can change anyone's info
    // user ID is as an argument (so the webmaster can change it)
    // but a token is needed in order to edit a user
    editUser: async (_, args, { user }) => {
      requireRole(user);
      // only the user themselves or the webmaster can edit a given account
      if (args._id !== user._id && user.role !== "webmaster") {
        throw AuthenticationError;
      }
      try {
        // don't attempt to update password here
        delete args.user.password;
        // only admins can update roles
        if (user.role !== "webmaster") delete args.user.role;
        // query-then-save so schema validators actually run
        const updatedUser = await User.findById(args._id);
        if (!updatedUser) throw AuthenticationError;
        Object.assign(updatedUser, args.user);
        await updatedUser.save();
        return updatedUser;
      } catch (err) {
        console.log(err);
      }
    },
    // anyone can request a password reset, which is mailed to them
    // input has to have the email address
    resetPassword: async (_, { email }) => {
      // look up first; the DB isn't touched until the email send below
      // is confirmed, so a failed send can never leave the account in a
      // worse state than before the request
      const targetUser = await User.findOne({ email: email });
      if (!targetUser) {
        throw new Error("No account with that email exists.");
      }

      // generate a new password
      const newPassword = generatePassword(3);
      // hash it before saving to arguments
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // first get the email address(es) of the webmaster(s) for user email replying
      const webmasterEmail = await User.findOne({ role: "webmaster" }).select(
        "email",
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

      // send before persisting -- if this throws, return without ever
      // writing the new password, so the old one keeps working
      try {
        await Mail(mailArgs);
      } catch (err) {
        console.error(err);
        // resetPassword returns User (not Boolean) -- null is the
        // schema-valid way to signal failure here
        return null;
      }

      // query-then-save (not findOneAndUpdate) so schema validators
      // actually run; findOneAndUpdate skips them
      targetUser.password = hashedPassword;
      await targetUser.save();
      return targetUser;
    },
    // logged-in users can change their password
    changePassword: async (_, { password }, { user }) => {
      requireRole(user);
      try {
        // the schema's minlength validator runs against the already-hashed
        // value at save time (the hash is always ~60 chars), so it can
        // never actually enforce a minimum on the real password -- check
        // explicitly before hashing
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        // need to hash the new password then save it to the args
        const hashedPassword = await bcrypt.hash(password, 10);
        // query-then-save (not findByIdAndUpdate) -- the pre('save') hook
        // only hashes on document creation (`if (this.isNew)`), so hashing
        // stays manual regardless; .save() still restores any other
        // validators that findByIdAndUpdate would otherwise skip
        const updatedUser = await User.findById(user._id);
        if (!updatedUser) {
          throw new Error("Something went wrong, password was not updated.");
        }
        updatedUser.password = hashedPassword;
        await updatedUser.save();
        return updatedUser;
      } catch (err) {
        console.log(err);
      }
    },
    // add a new meet
    addMeet: async (_, { meet, meetSwimmers, relays }, { user }) => {
      // only leaders can add meets
      requireRole(user, "leader");
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
    // edit a meet
    editMeet: async (_, { _id, meet, meetSwimmers, relays }, { user }) => {
      // only leaders can edit meets
      requireRole(user, "leader");
      try {
        // query-then-save so schema validators actually run
        // each field is only assigned if actually provided
        const updatedMeet = await Meet.findById(_id);
        if (!updatedMeet) throw new Error("Meet not found");
        if (meet) Object.assign(updatedMeet, meet);
        if (meetSwimmers !== undefined) updatedMeet.meetSwimmers = meetSwimmers;
        if (relays !== undefined) updatedMeet.relays = relays;
        await updatedMeet.save();
        return updatedMeet;
      } catch (error) {
        console.log(error);
      }
    },
    // delete a meet
    deleteMeet: async (_, { _id }, { user }) => {
      // only leaders can delete meets
      requireRole(user, "leader");
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
      requireRole(user, "leader");
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
      requireRole(user, "leader");
      try {
        // query-then-save (not findOneAndUpdate) so schema validators --
        // required fields on the post and on the embedded photo subdoc --
        // actually run
        const updatedPost = await Post.findById(_id);
        if (!updatedPost) {
          throw new Error("Something went wrong, post was not updated");
        }
        updatedPost.title = title;
        updatedPost.summary = summary;
        updatedPost.content = content;
        // assigning undefined and saving unsets the subdocument entirely,
        // equivalent to the previous $unset: { photo: 1 }
        updatedPost.photo = photo.id ? photo : undefined;
        await updatedPost.save();
        return updatedPost;
      } catch (error) {
        console.log(error);
      }
    },
    deletePost: async (_, { _id }, { user }) => {
      // only leaders can delete posts
      requireRole(user, "leader");
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
      requireRole(user, "membership");

      // WHATWG HTML living-standard input[type=email] pattern -- the same
      // one browsers use for native email validation. Deliberately
      // permissive (case-insensitive, allows +, no TLD length cap) because
      // we want to avoid false positives
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

      // usmsId (not usmsRegNo) is the stable per-person key: someone who
      // registers for next year early appears twice with the same usmsId but
      // different regYear/usmsRegNo. Dedupe to one row per person, keeping
      // whichever entry has the higher regYear.
      const latestByUsmsId = new Map();
      for (const incoming of memberData) {
        const current = latestByUsmsId.get(incoming.usmsId);
        if (!current || incoming.regYear > current.regYear) {
          latestByUsmsId.set(incoming.usmsId, incoming);
        }
      }

      const newUsmsIds = [...latestByUsmsId.keys()];
      const existingMembers = await Member.find({
        usmsId: { $in: newUsmsIds },
      });
      const existingByUsmsId = new Map(
        existingMembers.map((member) => [member.usmsId, member]),
      );

      const finalMembers = newUsmsIds.map((usmsId) => {
        const incoming = latestByUsmsId.get(usmsId);
        const previous = existingByUsmsId.get(usmsId);
        // deliverable is sticky per-address: carry it forward only when the
        // exact address string is unchanged from the prior upload, otherwise
        // assume reachable (true) -- a new/changed address has no history yet
        const previousDeliverable = new Map(
          (previous?.emails ?? []).map((email) => [
            email.address,
            email.deliverable,
          ]),
        );
        const emails = (incoming.emails ?? []).map((address) => ({
          address,
          formatValid: emailRegex.test(address),
          deliverable: previousDeliverable.has(address)
            ? previousDeliverable.get(address)
            : true,
        }));

        return {
          usmsRegNo: incoming.usmsRegNo,
          usmsId,
          firstName: incoming.firstName,
          lastName: incoming.lastName,
          gender: incoming.gender,
          club: incoming.club,
          workoutGroup: incoming.workoutGroup,
          regYear: incoming.regYear,
          emails,
          emailExclude: incoming.emailExclude,
        };
      });

      // upsert everyone in the new upload -- never drop the collection, so a
      // bad record (or a partial failure) can't take the whole roster with it
      if (finalMembers.length > 0) {
        try {
          await Member.bulkWrite(
            finalMembers.map((member) => ({
              updateOne: {
                filter: { usmsId: member.usmsId },
                update: { $set: member },
                upsert: true,
              },
            })),
            { ordered: false },
          );
        } catch (err) {
          // ordered:false means whatever succeeded is already persisted;
          // log and continue rather than losing that progress
          console.error(err);
        }
      }

      // anyone in the DB but not in this upload has left the LMSC
      await Member.deleteMany({ usmsId: { $nin: newUsmsIds } });

      return await Member.find({ usmsId: { $in: newUsmsIds } });
    },
    // membership coordinator marks specific addresses as bouncing/dead (or
    // restores them) after reviewing the upload page; never touches formatValid
    updateEmailDeliverability: async (_, { updates }, { user }) => {
      requireRole(user, "membership");
      if (!updates || updates.length === 0) return [];

      try {
        await Member.bulkWrite(
          updates.map(({ usmsId, address, deliverable }) => ({
            updateOne: {
              filter: { usmsId, "emails.address": address },
              update: { $set: { "emails.$.deliverable": deliverable } },
            },
          })),
          { ordered: false },
        );
      } catch (err) {
        // ordered:false means whatever succeeded is already persisted;
        // log and continue rather than losing that progress
        console.error(err);
      }

      const usmsIds = [...new Set(updates.map((update) => update.usmsId))];
      return await Member.find({ usmsId: { $in: usmsIds } });
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
          await Mail(mailArgs);
        } catch (err) {
          console.error(err);
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
          await Mail(mailArgs);
        } catch (err) {
          console.error(err);
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
          await Mail(mailArgs);
        } catch (err) {
          console.error(err);
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
      requireRole(user, "leader", "coach");
      // retrieve the emails of the recipients (from their id's)
      const group = await Member.find({ _id: { $in: emailData.id } }).select(
        "emails",
      );

      // returned an array of objects with property "email" (one array item per leader in input)
      const mailArgs = { ...emailData };
      delete mailArgs.id;
      let emailArray = [];
      group.forEach((member) => {
        const usableEmails = member.emails
          .filter((email) => email.formatValid && email.deliverable)
          .map((email) => email.address);
        emailArray = [...emailArray, ...usableEmails];
      });
      mailArgs.emails = emailArray;

      // need to know who to reply to (ie the leader or coach who is sending the message)
      const sender = await User.findById(user._id).select("email");
      mailArgs.from = sender.email;
      mailArgs.replyTo = sender.email;

      // call mail() with mailArgs
      if (mailArgs.emails.length > 0) {
        try {
          await Mail(mailArgs);
        } catch (err) {
          console.error(err);
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
