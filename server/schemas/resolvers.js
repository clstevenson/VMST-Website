const { GraphQLError } = require("graphql");
const { Member, Post, User } = require("../models");
const {
  signToken,
  AuthenticationError,
  signRefreshToken,
  setRefreshCookie,
  requireRole,
  signUnsubscribeToken,
  verifyUnsubscribeToken,
  signVerificationToken,
  verifyVerificationToken,
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
const EmailLog = require("../models/EmailLog");

// fires once, the moment a post transitions to published (never on a
// routine re-save of an already-published post). Sent as individual
// emails rather than one bulk send, since each one needs its own
// personalized one-click unsubscribe link -- a shared bulk body can't
// embed a different link per recipient. One recipient's failed send
// doesn't block the others.
async function notifySubscribers(post) {
  const subscribers = await User.find({ notifications: true }).select(
    "_id email",
  );
  if (subscribers.length === 0) return;

  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const postUrl = `${baseUrl}/post/${post._id}`;
  // mirrors the home page's summary-or-content fallback (see BlogPosts.jsx),
  // simplified for an email body: strip tags and truncate rather than
  // trying to carry Quill's HTML formatting into the message
  const teaser =
    post.summary || post.content.replace(/<[^>]+>/g, "").slice(0, 200);

  let sentCount = 0;
  for (const subscriber of subscribers) {
    const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${signUnsubscribeToken(
      { _id: subscriber._id },
    )}`;
    try {
      await Mail({
        from: "VMST",
        replyTo: process.env.EMAIL,
        emails: subscriber.email,
        subject: `New VMST post: ${post.title}`,
        plainText: `Hello, a new article has been posted on the VMST website: ${post.title}

        Summary: ${teaser}

Read the full post: ${postUrl}

---
You're receiving this because you opted in to post notifications.
Unsubscribe with one click: ${unsubscribeUrl}
Or log in and update your preferences from your account page.`,
        html: `
        <p>Hello, a new article has been posted on the VMST website: <strong>${post.title}</strong></p>
        <p>Summary: ${teaser}</p>
          <p><a href="${postUrl}">Read the full post</a></p>
          <hr />
          <p style="font-size: 0.85em; color: #666;">
            You're receiving this because you opted in to post notifications.
            <a href="${unsubscribeUrl}">Unsubscribe</a> with one click, or log
            in and update your preferences from your account page.
          </p>
        `,
      });
      sentCount++;
    } catch (err) {
      console.error(
        `Failed to send post notification to ${subscriber.email}:`,
        err,
      );
    }
  }
  await logEmailSend(sentCount);
}

// sent on signup, and again whenever a user changes their email address.
// Confirms the address is reachable; not currently a gate on anything
// (no feature checks emailVerified yet) -- just tracked and surfaced as a
// gentle reminder on the account page.
async function sendVerificationEmail(user) {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify-email?token=${signVerificationToken({
    _id: user._id,
  })}`;
  await Mail({
    from: "VMST",
    replyTo: process.env.EMAIL,
    emails: user.email,
    subject: "Verify your VMST account email",
    plainText: `Hello ${user.firstName},

Please confirm this is your email address by clicking the link below. This link expires in 48 hours.

${verifyUrl}

If you didn't create this account, you can ignore this email.`,
    html: `
      <p>Hello ${user.firstName},</p>
      <p>Please confirm this is your email address by clicking the link below. This link expires in 48 hours.</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p style="font-size: 0.85em; color: #666;">If you didn't create this account, you can ignore this email.</p>
    `,
  });
  await logEmailSend(1);
}

// In production, a bulk send's real recipients go in bcc (so they can't
// see each other's addresses), with `emails` (-> Mail()'s `to` field) left
// as the sending account's own address. In dev, recipients stay in
// `emails` for easy visibility on Ethereal, which never delivers anywhere
// real anyway.
function bulkRecipientFields(recipients) {
  if (process.env.NODE_ENV === "production") {
    return { emails: process.env.EMAIL, bcc: recipients };
  }
  return { emails: recipients };
}

// Appended to emailGroup sends only -- the one bulk-email path with no
// existing unsubscribe mechanism of its own (unlike notifySubscribers, which
// already carries a one-click unsubscribe link, and unlike
// emailLeaders/emailWebmaster/emailLeadersWebmaster, whose recipients are
// the leaders/webmaster themselves, not members opting out of anything).
async function unsubscribeFooter() {
  const coordinator = await User.findOne({ role: "membership" }).select(
    "email",
  );
  const coordinatorEmail = coordinator?.email || process.env.EMAIL;
  const text =
    "You are receiving this email because you are a member of VMST. " +
    "Messages such as this are how VMST leaders and coaches communicate " +
    "club business. If you wish to stop receiving such emails you will " +
    "need to login to your MyUSMS account at " +
    "https://www.usms.org/myusmslogin and change your Email Preferences. " +
    "Uncheck the box to receive Local USMS Communications. If you have " +
    `any questions, please email ${coordinatorEmail}.`;
  return {
    plainText: `\n\n---\n${text}`,
    html: `<hr /><p style="font-size: 0.85em; color: #666;">${text.replace(
      "https://www.usms.org/myusmslogin",
      '<a href="https://www.usms.org/myusmslogin">https://www.usms.org/myusmslogin</a>',
    )}</p>`,
  };
}

// For any Member linked to a User account, that account's emailPermission
// is the sole source of truth for whether they receive coach/leader email --
// it overrides Member.emailExclude in both directions (a member who opted
// out via the USMS CSV but grants permission via their account still gets
// emailed; one who didn't opt out but revokes permission doesn't). Returns a
// Map keyed by member _id (string) -> { emailPermission, email }, built with
// a single batched query so checking N members costs one round-trip, not N.
async function getLinkedUserOverrides(memberIds) {
  const linkedUsers = await User.find({
    linkedMember: { $in: memberIds },
  }).select("linkedMember emailPermission email");
  return new Map(
    linkedUsers.map((u) => [
      u.linkedMember.toString(),
      { emailPermission: u.emailPermission, email: u.email },
    ]),
  );
}

// Overrides each member's in-memory emailExclude (not persisted) to reflect
// a linked account's emailPermission, so every recipient-selection list
// downstream (all client-side filtering keys off this one field) reflects
// the override without needing its own awareness of linking at all.
async function applyMemberOverrides(members) {
  const overrides = await getLinkedUserOverrides(members.map((m) => m._id));
  members.forEach((member) => {
    const override = overrides.get(member._id.toString());
    if (override) member.emailExclude = !override.emailPermission;
  });
  return members;
}

// Gmail's free-account sending limit counts recipients, not messages sent
// (one email bcc'd to 80 people uses 80 of the day's 500) -- see
// https://support.google.com/mail/answer/22839. Every resolver that calls
// Mail() shares this one tracked total, since they share one real Gmail
// account in production.
const DAILY_RECIPIENT_LIMIT = Number(process.env.EMAIL_DAILY_RECIPIENT_LIMIT) || 500;
const ROLLING_WINDOW_MS = 24 * 60 * 60 * 1000;

// records a completed send for rolling-limit tracking; call after every
// successful Mail() call, regardless of which resolver triggered it
async function logEmailSend(recipientCount) {
  if (recipientCount > 0) {
    await EmailLog.create({ recipientCount });
  }
}

// total recipients emailed (across every resolver) in the last 24h, a
// strict rolling window matching Gmail's own description of the restriction
async function getEmailUsage() {
  const cutoff = new Date(Date.now() - ROLLING_WINDOW_MS);
  const [result] = await EmailLog.aggregate([
    { $match: { sentAt: { $gte: cutoff } } },
    { $group: { _id: null, total: { $sum: "$recipientCount" } } },
  ]);
  return result?.total || 0;
}

// when would there be room for `additionalCount` more recipients? Walks the
// rolling window oldest-first, "expiring" each entry in turn (the order
// they'll actually drop out of the window) until what's left plus the new
// batch fits under the limit -- that entry's own expiry is the answer.
async function nextAvailableSendTime(additionalCount) {
  const cutoff = new Date(Date.now() - ROLLING_WINDOW_MS);
  const entries = await EmailLog.find({ sentAt: { $gte: cutoff } }).sort({
    sentAt: 1,
  });
  let total = entries.reduce((sum, entry) => sum + entry.recipientCount, 0);
  for (const entry of entries) {
    total -= entry.recipientCount;
    if (total + additionalCount <= DAILY_RECIPIENT_LIMIT) {
      return new Date(entry.sentAt.getTime() + ROLLING_WINDOW_MS);
    }
  }
  return new Date();
}

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
    // pinned posts first, then most recently posted first (not created --
    // a post drafted long ago but published today should show as recent).
    // drafts have no postedAt and are never pinned, so they naturally sort
    // last; a draft (posted: false) is only included for its own author
    posts: async (_, __, { user }) => {
      const filter = user
        ? {
            $or: [
              { posted: true },
              { posted: false, "author.userId": user._id },
            ],
          }
        : { posted: true };
      return await Post.find(filter).sort({ pinned: -1, postedAt: -1 });
    },
    // get a single post with all comments
    // can't populate users directly, need to populate comments that are nested
    // a draft is only returned to its own author -- everyone else gets null,
    // same as a nonexistent post
    onePost: async (_, { id }, { user }) => {
      const post = await Post.findById(id).populate("comments.user");
      if (post && !post.posted && post.author?.userId !== user?._id) {
        return null;
      }
      return post;
    },
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
        return await applyMemberOverrides(swimmers);
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
      const scoped =
        user.role === "coach"
          ? members.filter((member) => member.workoutGroup === user.group)
          : members;
      return await applyMemberOverrides(scoped);
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
    emailUsage: async (_, __, { user }) => {
      requireRole(user, "leader", "coach");
      return { count: await getEmailUsage(), limit: DAILY_RECIPIENT_LIMIT };
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
      // a banned user cannot log back in
      if (user.accountStatus === "banned") throw AuthenticationError;
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
      // fire-and-forget: a slow/failed send shouldn't hold up signup
      sendVerificationEmail(user).catch((err) =>
        console.error("sendVerificationEmail failed:", err),
      );
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
      // don't attempt to update password here
      delete args.user.password;
      // only the webmaster can change roles or account status (eg a
      // banned user could otherwise just un-ban themselves)
      if (user.role !== "webmaster") {
        delete args.user.role;
        delete args.user.accountStatus;
      }
      // query-then-save so schema validators actually run
      const updatedUser = await User.findById(args._id);
      if (!updatedUser) throw AuthenticationError;
      // changing email means "verified" would otherwise keep referring
      // to an address the account no longer uses
      const emailChanged =
        args.user.email && args.user.email !== updatedUser.email;
      Object.assign(updatedUser, args.user);
      if (emailChanged) updatedUser.emailVerified = false;
      try {
        await updatedUser.save();
      } catch (err) {
        // email's uniqueness is enforced by a DB-level index, not a Mongoose
        // validator, so a collision surfaces as a raw driver error (eg
        // "E11000 duplicate key error collection: ... dup key: { email:
        // ... }") -- not something to show a user directly. Any other save
        // failure (eg the match validator rejecting a malformed email)
        // already has a clean, client-presentable message, so it propagates
        // unwrapped, same as addPost/editPost.
        if (err.code === 11000) {
          throw new GraphQLError("That email address is already in use.", {
            extensions: { code: "DUPLICATE_EMAIL" },
          });
        }
        throw err;
      }
      if (emailChanged) {
        sendVerificationEmail(updatedUser).catch((err) =>
          console.error("sendVerificationEmail failed:", err),
        );
      }
      return updatedUser;
    },
    // permanently removes a user's account; webmaster only
    deleteUser: async (_, { _id }, { user }) => {
      requireRole(user, "webmaster");
      try {
        const deletedUser = await User.findByIdAndDelete(_id);
        return deletedUser;
      } catch (error) {
        console.log(error);
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
        await logEmailSend(1);
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
      // a schema-validator failure (eg an invalid course) throws naturally
      // here and propagates to Apollo, same as addPost -- no try/catch
      // swallowing it into a silent no-op
      return await Meet.create(newMeet);
    },
    // edit a meet
    editMeet: async (_, { _id, meet, meetSwimmers, relays }, { user }) => {
      // only leaders can edit meets
      requireRole(user, "leader");
      // query-then-save so schema validators actually run
      // each field is only assigned if actually provided
      const updatedMeet = await Meet.findById(_id);
      if (!updatedMeet) throw new Error("Meet not found");
      if (meet) Object.assign(updatedMeet, meet);
      if (meetSwimmers !== undefined) updatedMeet.meetSwimmers = meetSwimmers;
      if (relays !== undefined) updatedMeet.relays = relays;
      // a schema-validator failure (eg an invalid course) throws naturally,
      // same as addMeet/addPost/editPost -- no try/catch swallowing it
      await updatedMeet.save();
      return updatedMeet;
    },
    // delete a meet
    deleteMeet: async (_, { _id }, { user }) => {
      // only leaders can delete meets
      requireRole(user, "leader");
      const deletedMeet = await Meet.findByIdAndDelete(_id);
      return deletedMeet;
    },
    // add a new post
    addPost: async (
      _,
      { title, summary, content, photo, posted },
      { user },
    ) => {
      // only team leaders can create posts
      requireRole(user, "leader");
      const isPosted = posted ?? true;
      const post = {
        title,
        summary,
        content,
        photo,
        posted: isPosted,
        postedAt: isPosted ? new Date() : undefined,
        author: { userId: user._id },
      };
      const created = await Post.create(post);
      // fire-and-forget: the post is already safely saved, so the response
      // (and the client's success toast) shouldn't wait on every individual
      // subscriber email finishing its own SMTP round-trip
      if (isPosted) {
        notifySubscribers(created).catch((err) =>
          console.error("notifySubscribers failed:", err),
        );
      }
      return created;
    },
    editPost: async (
      _,
      { _id, title, summary, content, photo, posted },
      { user },
    ) => {
      // only leaders can edit posts
      requireRole(user, "leader");
      // query-then-save (not findOneAndUpdate) so schema validators --
      // required fields on the post and on the embedded photo subdoc --
      // actually run
      const updatedPost = await Post.findById(_id);
      if (!updatedPost) {
        throw new Error("Something went wrong, post was not updated");
      }
      // a draft is only editable by the leader who created it, so other
      // leaders don't unknowingly alter or delete someone's in-progress
      // post; once published, any leader can edit as before. Thrown outside
      // the try/catch below so it isn't swallowed by the generic catch.
      if (!updatedPost.posted && updatedPost.author?.userId !== user._id) {
        throw AuthenticationError;
      }
      updatedPost.title = title;
      updatedPost.summary = summary;
      updatedPost.content = content;
      // assigning undefined and saving unsets the subdocument entirely,
      // equivalent to the previous $unset: { photo: 1 }
      updatedPost.photo = photo.id ? photo : undefined;
      // only stamp postedAt the moment a draft actually goes live;
      // re-saving an already-published post must not change it
      const isPosted = posted ?? updatedPost.posted;
      const isPublishing = isPosted && !updatedPost.posted;
      if (isPublishing) {
        updatedPost.postedAt = new Date();
      }
      updatedPost.posted = isPosted;
      // a schema-validator failure (eg a malformed embedded photo subdoc)
      // throws naturally here and propagates to Apollo, same as addPost --
      // no try/catch swallowing it into a silent no-op
      await updatedPost.save();
      // fire-and-forget -- see addPost for why this isn't awaited
      if (isPublishing) {
        notifySubscribers(updatedPost).catch((err) =>
          console.error("notifySubscribers failed:", err),
        );
      }
      return updatedPost;
    },
    deletePost: async (_, { _id }, { user }) => {
      // only leaders can delete posts
      requireRole(user, "leader");
      const post = await Post.findById(_id);
      if (!post) return null;
      // same author-only restriction on drafts as editPost, thrown outside
      // the try/catch below so it isn't swallowed by the generic catch
      if (!post.posted && post.author?.userId !== user._id) {
        throw AuthenticationError;
      }
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
        // address is unchanged from the prior upload, otherwise assume
        // reachable (true) -- a new/changed address has no history yet.
        // Matched case-insensitively: the domain is always case-insensitive
        // (DNS), and every major provider treats the local part the same
        // way in practice, even though the SMTP spec technically allows a
        // case-sensitive local part. Stored address keeps its original
        // casing -- only the comparison is normalized.
        const previousDeliverable = new Map(
          (previous?.emails ?? []).map((email) => [
            email.address.toLowerCase(),
            email.deliverable,
          ]),
        );
        const emails = (incoming.emails ?? []).map((address) => ({
          address,
          formatValid: emailRegex.test(address),
          deliverable: previousDeliverable.has(address.toLowerCase())
            ? previousDeliverable.get(address.toLowerCase())
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
      let failures = [];
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
          if (!err.writeErrors?.length) {
            // not a per-row failure shape (eg a dropped connection
            // mid-batch) -- we have no reliable idea what succeeded, so
            // don't run the "anyone missing has left" cleanup below against
            // an untrustworthy comparison; just surface that it failed
            throw new GraphQLError(`Member upload failed: ${err.message}`, {
              extensions: { code: "UPLOAD_FAILED" },
            });
          }
          // ordered:false means whatever succeeded is already persisted;
          // collect the per-row failures (eg a duplicate usmsRegNo across two
          // different usmsIds violating its unique index) so they can be
          // reported below, rather than losing that progress *or* the fact
          // that some rows didn't make it
          failures = err.writeErrors.map((writeError) => {
            const member = finalMembers[writeError.index];
            return {
              usmsId: member?.usmsId,
              name: member ? `${member.firstName} ${member.lastName}` : null,
              message: writeError.errmsg,
            };
          });
        }
      }

      // anyone in the DB but not in this upload has left the LMSC
      await Member.deleteMany({ usmsId: { $nin: newUsmsIds } });

      if (failures.length > 0) {
        throw new GraphQLError(
          `${failures.length} of ${newUsmsIds.length} members failed to upload`,
          {
            extensions: {
              code: "UPLOAD_PARTIAL_FAILURE",
              succeededCount: newUsmsIds.length - failures.length,
              failedCount: failures.length,
              failures,
            },
          },
        );
      }

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
      const recipients = emails.map((leader) => leader.email);
      const mailArgs = { ...emailData };
      delete mailArgs.id;

      // call mail() with mailArgs
      if (recipients.length > 0) {
        Object.assign(mailArgs, bulkRecipientFields(recipients));
        try {
          await Mail(mailArgs);
          await logEmailSend(recipients.length);
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
      const recipients = emails.map((user) => user.email);
      const mailArgs = { ...emailData };
      delete mailArgs.id;

      // call mail() with mailArgs
      if (recipients.length > 0) {
        Object.assign(mailArgs, bulkRecipientFields(recipients));
        try {
          await Mail(mailArgs);
          await logEmailSend(recipients.length);
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
      const recipients = emails.map((user) => user.email);
      const mailArgs = { ...emailData };
      delete mailArgs.id;

      // call mail() with mailArgs
      if (recipients.length > 0) {
        Object.assign(mailArgs, bulkRecipientFields(recipients));
        try {
          await Mail(mailArgs);
          await logEmailSend(recipients.length);
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
        "emails emailExclude",
      );

      const mailArgs = { ...emailData };
      delete mailArgs.id;
      const overrides = await getLinkedUserOverrides(
        group.map((member) => member._id),
      );
      // use only one address per recipient: the lowest-index address that
      // is both formatValid and deliverable. Emails are pushed primary-
      // first/secondary-second at upload time, so this naturally means
      // "use primary unless it's bad, then fall back to secondary".
      // A linked account's emailPermission is the sole source of truth for
      // that member (overriding emailExclude either way) and, when linked,
      // the verified login email is used instead of the USMS-uploaded one.
      // This is also the one server-side enforcement of either flag --
      // recipient-selection UI already excludes these members, but this is
      // what makes that exclusion binding rather than a UI-only courtesy.
      let emailArray = [];
      group.forEach((member) => {
        const override = overrides.get(member._id.toString());
        if (override) {
          if (override.emailPermission) emailArray.push(override.email);
          return;
        }
        if (member.emailExclude) return;
        const usableEmail = member.emails.find(
          (email) => email.formatValid && email.deliverable,
        );
        if (usableEmail) emailArray.push(usableEmail.address);
      });

      // need to know who to reply to (ie the leader or coach who is sending the message)
      const sender = await User.findById(user._id).select("email");
      mailArgs.from = sender.email;
      mailArgs.replyTo = sender.email;

      // call mail() with mailArgs
      if (emailArray.length > 0) {
        // refuse rather than push the shared Gmail account over its daily
        // recipient limit -- tell the leader/coach exactly when there will
        // be room, rather than just rejecting outright
        const usage = await getEmailUsage();
        if (usage + emailArray.length > DAILY_RECIPIENT_LIMIT) {
          const nextAvailable = await nextAvailableSendTime(emailArray.length);
          throw new GraphQLError(
            `Sending this batch (${emailArray.length} recipients) would exceed the daily limit of ${DAILY_RECIPIENT_LIMIT}.`,
            {
              extensions: {
                code: "EMAIL_LIMIT_EXCEEDED",
                nextAvailable: nextAvailable.toISOString(),
              },
            },
          );
        }
        Object.assign(mailArgs, bulkRecipientFields(emailArray));
        const footer = await unsubscribeFooter();
        mailArgs.plainText = (mailArgs.plainText || "") + footer.plainText;
        mailArgs.html = (mailArgs.html || "") + footer.html;
        try {
          await Mail(mailArgs);
          await logEmailSend(emailArray.length);
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
    // no login required -- the signed token in the link is the only
    // credential, scoped to exactly this one action
    unsubscribe: async (_, { token }) => {
      const userId = verifyUnsubscribeToken(token);
      if (!userId) return false;
      const result = await User.findByIdAndUpdate(userId, {
        notifications: false,
      });
      return !!result;
    },
    // no login required -- same reasoning as unsubscribe above, except
    // this token expires after 48h (see signVerificationToken)
    verifyEmail: async (_, { token }) => {
      const userId = verifyVerificationToken(token);
      if (!userId) return false;
      const result = await User.findByIdAndUpdate(userId, {
        emailVerified: true,
      });
      return !!result;
    },
    // logged-in only, sends to the caller's own current email -- lets
    // them get a fresh link if the first one expired or got lost
    resendVerificationEmail: async (_, __, { user }) => {
      requireRole(user);
      const target = await User.findById(user._id);
      if (!target) return false;
      try {
        await sendVerificationEmail(target);
        return true;
      } catch (err) {
        console.error("resendVerificationEmail failed:", err);
        return false;
      }
    },
    // links the caller's account to their USMS membership record by USMS ID.
    // One Member can be linked from at most one User account -- enforced
    // here, not via a unique index, since `null` is the common case and
    // this is the only write path anyway
    linkMember: async (_, { usmsId }, { user }) => {
      requireRole(user);
      const member = await Member.findOne({ usmsId });
      if (!member) {
        const coordinator = await User.findOne({
          role: "membership",
        }).select("email");
        throw new Error(
          "That USMS ID wasn't found. Please check it and try again." +
            (coordinator
              ? ` If you believe this is an error, contact the membership coordinator at ${coordinator.email}.`
              : ""),
        );
      }
      const alreadyLinked = await User.findOne({
        linkedMember: member._id,
        _id: { $ne: user._id },
      });
      if (alreadyLinked) {
        throw new Error(
          "That USMS ID is already linked to a different account.",
        );
      }
      await User.findByIdAndUpdate(user._id, { linkedMember: member._id });
      return member;
    },
    // pin/unpin a post to the front of the home page; at most 2 can be
    // pinned at once (rejected, not auto-evicted, per the user's call), and
    // pinning a draft is refused since it would have no visible effect
    togglePin: async (_, { _id }, { user }) => {
      requireRole(user, "leader");
      const post = await Post.findById(_id);
      if (!post) {
        throw new Error("Post not found");
      }
      if (!post.pinned) {
        if (!post.posted) {
          throw new Error("A draft can't be pinned until it's published.");
        }
        const pinnedCount = await Post.countDocuments({ pinned: true });
        if (pinnedCount >= 2) {
          throw new Error("Only two posts can be pinned, unpin one first.");
        }
      }
      post.pinned = !post.pinned;
      await post.save();
      return post;
    },
  },
};

module.exports = resolvers;
