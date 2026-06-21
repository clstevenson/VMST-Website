const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const papa = require("papaparse");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Authorization tests for the Query resolvers fixed alongside the password-field
// removal: members, vmstMembers, meets, getLeaders, emailExists, user. These run
// directly against the real schema/resolvers via Apollo's executeOperation, with
// a hand-built context.user (skipping JWT/cookies entirely, the same way the rate
// limiter tests skip the full GraphQL/DB stack) against an isolated in-memory Mongo
// instance seeded with one user per role.
//
// `server/config/connection.js` opens mongoose's default connection eagerly at
// require-time (pointed at MONGODB_URI). To redirect that at our in-memory
// instance instead of the real dev DB, MONGODB_URI must be set *before* anything
// that transitively requires connection.js (resolvers.js, via schemas/index.js)
// is required -- hence the deferred requires below, inside before().
let mongod;
let mongoose;
let server;
let User;
let Member;
let Meet;
let Post;

const users = {}; // role -> { _id, role }

// emailGroup/resetPassword etc. call Mail (server/utils/emailHandler.js), which
// hits a real (hardcoded) Ethereal SMTP server -- not something an automated
// test suite should depend on. resolvers.js captures `Mail` as a plain const at
// require-time, so the only way to intercept it is to swap the cached module's
// exports *before* resolvers.js is first required below. sentMail collects
// whatever a test sends so it can assert on it without a real network call.
const sentMail = [];
// toggled by individual tests (then reset to false) to exercise a failed
// send without a real network call -- see resetPassword's atomicity test
let mailShouldFail = false;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  const emailHandlerPath = require.resolve("../utils/emailHandler");
  require.cache[emailHandlerPath] = {
    id: emailHandlerPath,
    filename: emailHandlerPath,
    loaded: true,
    exports: async (mailArgs) => {
      if (mailShouldFail) throw new Error("Simulated mail delivery failure");
      sentMail.push(mailArgs);
    },
  };

  mongoose = require("mongoose");
  const { ApolloServer } = require("@apollo/server");
  const { typeDefs, resolvers } = require("./index");
  User = require("../models/Users");
  Member = require("../models/Members");
  Meet = require("../models/Meets");
  Post = require("../models/Posts");

  await mongoose.connection.asPromise();

  server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  for (const role of ["user", "leader", "coach", "membership", "webmaster"]) {
    const doc = await User.create({
      firstName: "Test",
      lastName: role,
      email: `${role}@example.com`,
      password: "irrelevant-not-used-by-these-tests",
      role,
    });
    users[role] = { _id: doc._id.toString(), role };
  }

  await Member.create({
    usmsRegNo: "123456",
    usmsId: "12345",
    firstName: "Swimmer",
    lastName: "One",
    gender: "F",
    club: "VMST",
    regYear: 2026,
    emails: [makeEmail("swimmer@example.com")],
  });

  await Meet.create({
    meetName: "Test Meet",
    course: "SCY",
    startDate: "2026-01-01",
  });
});

test.after(async () => {
  await server.stop();
  await mongoose.disconnect();
  await mongod.stop();
});

async function run(query, variables, contextUser) {
  const response = await server.executeOperation(
    { query, variables },
    { contextValue: { user: contextUser } },
  );
  return response.body.singleResult;
}

// login/addUser call setRefreshCookie(res, ...), which does res.cookie(...) --
// a real Express response isn't available here, so this stub stands in for it
function stubRes() {
  return { cookie: () => {} };
}

async function runWithRes(query, variables, contextUser) {
  const response = await server.executeOperation(
    { query, variables },
    { contextValue: { user: contextUser, res: stubRes() } },
  );
  return response.body.singleResult;
}

// mirrors the field mapping in client/src/components/Membership/UploadMembers.jsx,
// so the test exercises uploadMembers with the same shape the real upload sends
function parseMemberReportCSV(filePath) {
  const csv = fs.readFileSync(filePath, "utf8");
  const { data } = papa.parse(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return data.map((member) => {
    const obj = {};
    obj.usmsRegNo = member["USMS Number"];
    obj.usmsId = String(member["USMS Number"]).slice(-5);
    obj.firstName = member["First Name"];
    obj.lastName = member["Last Name"];
    obj.gender = member.Gender;
    obj.club = member.Club.toString();
    obj.workoutGroup = member["WO Group"];
    obj.regYear = member["Reg. Year"];
    obj.emails = [];
    if (member["(P) Email Address"]) obj.emails.push(member["(P) Email Address"]);
    if (member["(S) Email Address"]) obj.emails.push(member["(S) Email Address"]);
    obj.emailExclude = member["Exclude LMSC Group Email"] === "Y";
    return obj;
  });
}

// mirrors the parsing in client/src/components/Meets/MeetUpload.jsx (the matching
// against members itself is a separate, already-tested client utility -- here we
// just need swimmer/relay shapes built from the real file to drive addMeet)
function parseMeetRosterCSV(filePath) {
  const csv = fs.readFileSync(filePath, "utf8");
  const { data } = papa.parse(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  const relayEvents = Object.keys(data[0]).filter((prop) => /R\d+/.test(prop));
  const ageProp = Object.keys(data[0]).find(
    (prop) => prop.includes("Meet") && prop.includes("Age"),
  );
  const swimmers = data
    .filter(({ Club }) => Club === "VMST")
    .map((swimmer) => ({
      firstName: swimmer.First,
      lastName: swimmer.Last,
      gender: swimmer.Sex,
      meetAge: swimmer[ageProp],
      relays: relayEvents
        .map((relay) => swimmer[relay])
        .filter((number) => number !== null),
    }));
  return { swimmers, relayEvents };
}

// Member.emails is [{ address, formatValid, deliverable }] -- this builds one
// entry for direct Member.create() calls in tests (the uploadMembers mutation
// itself still takes plain address strings; the resolver computes this shape)
function makeEmail(address, { formatValid = true, deliverable = true } = {}) {
  return { address, formatValid, deliverable };
}

test("members: rejects an unauthenticated caller", async () => {
  const { errors } = await run("{ members { firstName } }", {}, null);
  assert.ok(errors?.length, "expected an authorization error");
});

test("members: rejects a logged-in leader (wrong role)", async () => {
  const { errors } = await run("{ members { firstName } }", {}, users.leader);
  assert.ok(errors?.length, "expected an authorization error");
});

test("members: allows the membership role", async () => {
  const { data, errors } = await run(
    "{ members { firstName } }",
    {},
    users.membership,
  );
  assert.equal(errors, undefined);
  assert.equal(data.members[0].firstName, "Swimmer");
});

test("vmstMembers: allows leader and coach, rejects others", async () => {
  for (const role of ["leader", "coach"]) {
    const { errors } = await run(
      "{ vmstMembers { firstName } }",
      {},
      users[role],
    );
    assert.equal(errors, undefined, `${role} should be allowed`);
  }
  const { errors } = await run(
    "{ vmstMembers { firstName } }",
    {},
    users.membership,
  );
  assert.ok(errors?.length, "membership role should not be allowed");
});

test("membersByUsmsId: rejects an unauthenticated caller and a non-leader/coach role", async () => {
  const query = `query($usmsIds: [String]!) {
    membersByUsmsId(usmsIds: $usmsIds) { firstName }
  }`;

  const unauth = await run(query, { usmsIds: ["12345"] }, null);
  assert.ok(unauth.errors?.length);

  const { errors } = await run(query, { usmsIds: ["12345"] }, users.membership);
  assert.ok(errors?.length, "membership role should not be allowed");
});

test("membersByUsmsId: leader can find a member regardless of their current club", async () => {
  const switched = await Member.create({
    usmsRegNo: "999999",
    usmsId: "99999",
    firstName: "Switched",
    lastName: "Teams",
    gender: "M",
    club: "OtherClub",
    workoutGroup: "Distance",
    regYear: 2026,
    emails: [makeEmail("switched@example.com")],
  });

  const { data, errors } = await run(
    `query($usmsIds: [String]!) {
      membersByUsmsId(usmsIds: $usmsIds) { firstName lastName club }
    }`,
    { usmsIds: ["99999"] },
    users.leader,
  );
  assert.equal(errors, undefined);
  assert.equal(data.membersByUsmsId.length, 1);
  assert.equal(data.membersByUsmsId[0].club, "OtherClub");

  await Member.findByIdAndDelete(switched._id);
});

test("membersByUsmsId: a coach only gets back members in their own workout group", async () => {
  const inGroup = await Member.create({
    usmsRegNo: "888801",
    usmsId: "88801",
    firstName: "InGroup",
    lastName: "Swimmer",
    gender: "F",
    club: "VMST",
    workoutGroup: "Distance",
    regYear: 2026,
    emails: [makeEmail("ingroup@example.com")],
  });
  const outOfGroup = await Member.create({
    usmsRegNo: "888802",
    usmsId: "88802",
    firstName: "OutOfGroup",
    lastName: "Swimmer",
    gender: "F",
    club: "VMST",
    workoutGroup: "Sprint",
    regYear: 2026,
    emails: [makeEmail("outofgroup@example.com")],
  });
  const coachInDistance = { _id: users.coach._id, role: "coach", group: "Distance" };

  const { data, errors } = await run(
    `query($usmsIds: [String]!) {
      membersByUsmsId(usmsIds: $usmsIds) { firstName workoutGroup }
    }`,
    { usmsIds: ["88801", "88802"] },
    coachInDistance,
  );
  assert.equal(errors, undefined);
  assert.equal(data.membersByUsmsId.length, 1);
  assert.equal(data.membersByUsmsId[0].firstName, "InGroup");

  await Member.deleteMany({ _id: { $in: [inGroup._id, outOfGroup._id] } });
});

test("meets: rejects an unauthenticated caller, allows leader", async () => {
  const unauth = await run("{ meets { meetName } }", {}, null);
  assert.ok(unauth.errors?.length);

  const { data, errors } = await run(
    "{ meets { meetName } }",
    {},
    users.leader,
  );
  assert.equal(errors, undefined);
  assert.equal(data.meets[0].meetName, "Test Meet");
});

test("getLeaders: only allows webmaster", async () => {
  const asLeader = await run("{ getLeaders { firstName } }", {}, users.leader);
  assert.ok(asLeader.errors?.length, "leader should not be allowed");

  const { data, errors } = await run(
    "{ getLeaders { firstName } }",
    {},
    users.webmaster,
  );
  assert.equal(errors, undefined);
  assert.equal(data.getLeaders[0].firstName, "Test");
});

test("users: only allows webmaster", async () => {
  const asLeader = await run("{ users { firstName } }", {}, users.leader);
  assert.ok(asLeader.errors?.length, "leader should not be allowed");

  const { data, errors } = await run(
    "{ users { firstName role } }",
    {},
    users.webmaster,
  );
  assert.equal(errors, undefined);
  const roles = data.users.map((u) => u.role);
  for (const role of ["user", "leader", "coach", "membership", "webmaster"]) {
    assert.ok(roles.includes(role), `expected a ${role} user in the results`);
  }
});

test("emailExists: rejects unauthenticated, allows any logged-in user", async () => {
  const unauth = await run(
    '{ emailExists(email: "user@example.com") { _id } }',
    {},
    null,
  );
  assert.ok(unauth.errors?.length);

  const { data, errors } = await run(
    '{ emailExists(email: "user@example.com") { _id } }',
    {},
    users.user,
  );
  assert.equal(errors, undefined);
  assert.equal(data.emailExists._id, users.user._id);
});

test("user: a logged-in user can fetch their own record", async () => {
  const { data, errors } = await run(
    "query($id: ID!) { user(id: $id) { firstName role } }",
    { id: users.user._id },
    users.user,
  );
  assert.equal(errors, undefined);
  assert.equal(data.user.role, "user");
});

test("user: cannot fetch another user's record, even as webmaster", async () => {
  const { errors } = await run(
    "query($id: ID!) { user(id: $id) { firstName } }",
    { id: users.user._id },
    users.webmaster,
  );
  assert.ok(errors?.length, "webmaster should not be able to read another user");
});

test("user: rejects an unauthenticated caller", async () => {
  const { errors } = await run(
    "query($id: ID!) { user(id: $id) { firstName } }",
    { id: users.user._id },
    null,
  );
  assert.ok(errors?.length);
});

test("editUser: a logged-in user can edit their own record", async () => {
  const { data, errors } = await run(
    `mutation($id: ID!, $user: UserData) {
      editUser(_id: $id, user: $user) { firstName }
    }`,
    { id: users.user._id, user: { firstName: "Updated" } },
    users.user,
  );
  assert.equal(errors, undefined);
  assert.equal(data.editUser.firstName, "Updated");
});

test("editUser: rejects a user editing someone else's record", async () => {
  const { errors } = await run(
    `mutation($id: ID!, $user: UserData) {
      editUser(_id: $id, user: $user) { firstName }
    }`,
    { id: users.leader._id, user: { firstName: "Hacked" } },
    users.user,
  );
  assert.ok(errors?.length, "expected an authorization error");

  const stillOriginal = await User.findById(users.leader._id);
  assert.equal(stillOriginal.firstName, "Test");
});

test("editUser: webmaster can edit another user's record", async () => {
  const { data, errors } = await run(
    `mutation($id: ID!, $user: UserData) {
      editUser(_id: $id, user: $user) { firstName }
    }`,
    { id: users.coach._id, user: { firstName: "UpdatedByWebmaster" } },
    users.webmaster,
  );
  assert.equal(errors, undefined);
  assert.equal(data.editUser.firstName, "UpdatedByWebmaster");
});

test("editUser: a malformed email is rejected by the schema validator (restored via query-then-save) instead of being silently saved", async () => {
  const { data, errors } = await run(
    `mutation($id: ID!, $user: UserData) {
      editUser(_id: $id, user: $user) { email }
    }`,
    { id: users.user._id, user: { email: "not-an-email" } },
    users.user,
  );
  // editUser's catch block logs and swallows errors rather than
  // rethrowing (pre-existing style, not changed here) -- so the
  // regression to guard against is the DB write, not a GraphQL error
  assert.equal(errors, undefined);
  assert.equal(data.editUser, null);

  const stillOriginal = await User.findById(users.user._id);
  assert.equal(stillOriginal.email, "user@example.com");
});

test("editUser: a non-webmaster cannot change their own role or accountStatus", async () => {
  const { data, errors } = await run(
    `mutation($id: ID!, $user: UserData) {
      editUser(_id: $id, user: $user) { role accountStatus }
    }`,
    { id: users.user._id, user: { role: "webmaster", accountStatus: "banned" } },
    users.user,
  );
  assert.equal(errors, undefined);
  assert.equal(data.editUser.role, "user");
  assert.equal(data.editUser.accountStatus, "active");
});

test("editUser: webmaster can change another user's role and accountStatus", async () => {
  const { data, errors } = await run(
    `mutation($id: ID!, $user: UserData) {
      editUser(_id: $id, user: $user) { role accountStatus }
    }`,
    { id: users.user._id, user: { role: "coach", accountStatus: "silent" } },
    users.webmaster,
  );
  assert.equal(errors, undefined);
  assert.equal(data.editUser.role, "coach");
  assert.equal(data.editUser.accountStatus, "silent");

  // restore so later tests relying on users.user's role aren't affected
  await User.findByIdAndUpdate(users.user._id, {
    role: "user",
    accountStatus: "active",
  });
});

test("deleteUser: only allows webmaster, removes the document", async () => {
  const target = await User.create({
    firstName: "ToDelete",
    lastName: "User",
    email: "to-delete@example.com",
    password: "irrelevant-not-used-by-these-tests",
  });

  const asLeader = await run(
    `mutation($id: ID!) { deleteUser(_id: $id) { _id } }`,
    { id: target._id.toString() },
    users.leader,
  );
  assert.ok(asLeader.errors?.length, "leader should not be allowed");

  const { data, errors } = await run(
    `mutation($id: ID!) { deleteUser(_id: $id) { _id } }`,
    { id: target._id.toString() },
    users.webmaster,
  );
  assert.equal(errors, undefined);
  assert.equal(data.deleteUser._id, target._id.toString());

  const stillThere = await User.findById(target._id);
  assert.equal(stillThere, null);
});

test("password is not a queryable field on User, regardless of role", async () => {
  const { errors } = await run(
    "{ getLeaders { firstName password } }",
    {},
    users.webmaster,
  );
  assert.ok(errors?.length, "expected a schema validation error");
  assert.match(errors[0].message, /Cannot query field "password"/);
});

test("login: succeeds with correct credentials, rejects wrong password and unknown email", async () => {
  const password = "Correct-Password-123!";
  await User.create({
    firstName: "Login",
    lastName: "Test",
    email: "login-test@example.com",
    password,
    role: "user",
  });
  const query = `mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) { token user { email } }
  }`;

  const good = await runWithRes(
    query,
    { email: "login-test@example.com", password },
    null,
  );
  assert.equal(good.errors, undefined);
  assert.ok(good.data.login.token);
  assert.equal(good.data.login.user.email, "login-test@example.com");

  const wrongPassword = await runWithRes(
    query,
    { email: "login-test@example.com", password: "not-the-password" },
    null,
  );
  assert.ok(wrongPassword.errors?.length, "wrong password should be rejected");

  const unknownEmail = await runWithRes(
    query,
    { email: "nobody@example.com", password },
    null,
  );
  assert.ok(unknownEmail.errors?.length, "unknown email should be rejected");
});

test("login: rejects a banned user even with the correct password", async () => {
  const password = "Correct-Password-123!";
  await User.create({
    firstName: "Banned",
    lastName: "Test",
    email: "banned-login-test@example.com",
    password,
    role: "user",
    accountStatus: "banned",
  });
  const query = `mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) { token }
  }`;

  const { errors } = await runWithRes(
    query,
    { email: "banned-login-test@example.com", password },
    null,
  );
  assert.ok(errors?.length, "banned user should be rejected");
});

test("addUser: creates an account (default role) and returns a token", async () => {
  const query = `mutation($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
    addUser(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
      token
      user { email role }
    }
  }`;
  const { data, errors } = await runWithRes(
    query,
    {
      firstName: "New",
      lastName: "Signup",
      email: "new-signup@example.com",
      password: "Whatever-123!",
    },
    null,
  );
  assert.equal(errors, undefined);
  assert.ok(data.addUser.token);
  assert.equal(data.addUser.user.email, "new-signup@example.com");
  assert.equal(data.addUser.user.role, "user");
});

test("changePassword: rejects an unauthenticated caller, succeeds for a logged-in user", async () => {
  const target = await User.create({
    firstName: "Change",
    lastName: "Pw",
    email: "change-pw@example.com",
    password: "Old-Password-123!",
    role: "user",
  });
  const ctx = { _id: target._id.toString(), role: "user" };
  const query = `mutation($password: String!) {
    changePassword(password: $password) { _id }
  }`;

  const unauth = await run(query, { password: "New-Password-456!" }, null);
  assert.ok(unauth.errors?.length);

  const { data, errors } = await run(
    query,
    { password: "New-Password-456!" },
    ctx,
  );
  assert.equal(errors, undefined);
  assert.equal(data.changePassword._id, target._id.toString());

  const updated = await User.findById(target._id);
  assert.ok(await updated.isCorrectPassword("New-Password-456!"));
});

test("changePassword: rejects a too-short password without touching the stored hash", async () => {
  const target = await User.create({
    firstName: "Short",
    lastName: "Pw",
    email: "short-pw@example.com",
    password: "Original-Password-1!",
    role: "user",
  });
  const ctx = { _id: target._id.toString(), role: "user" };

  // changePassword's catch block logs and swallows errors rather than
  // rethrowing (pre-existing style, not changed here) -- so the
  // regression to guard against is the DB write, not a GraphQL error
  const { data, errors } = await run(
    `mutation($password: String!) { changePassword(password: $password) { _id } }`,
    { password: "abc" },
    ctx,
  );
  assert.equal(errors, undefined);
  assert.equal(data.changePassword, null);

  const stillOriginal = await User.findById(target._id);
  assert.ok(await stillOriginal.isCorrectPassword("Original-Password-1!"));
});

test("resetPassword: emails a new password to an existing account, errors for an unknown email", async () => {
  const target = await User.create({
    firstName: "Reset",
    lastName: "Pw",
    email: "reset-pw@example.com",
    password: "Original-Password-1!",
    role: "user",
  });
  const query = `mutation($email: String!) { resetPassword(email: $email) { _id } }`;

  const before = sentMail.length;
  const { data, errors } = await run(
    query,
    { email: "reset-pw@example.com" },
    null,
  );
  assert.equal(errors, undefined);
  assert.equal(data.resetPassword._id, target._id.toString());
  assert.equal(sentMail.length, before + 1, "resetPassword should send one email");
  assert.equal(sentMail[sentMail.length - 1].emails, "reset-pw@example.com");

  const unknown = await run(query, { email: "nobody-resets@example.com" }, null);
  assert.ok(unknown.errors?.length, "unknown email should error");
});

test("resetPassword: a failed send leaves the old password intact instead of locking the user out", async () => {
  const target = await User.create({
    firstName: "AtomicReset",
    lastName: "Pw",
    email: "atomic-reset@example.com",
    password: "Original-Password-1!",
    role: "user",
  });
  const query = `mutation($email: String!) { resetPassword(email: $email) { _id } }`;

  mailShouldFail = true;
  try {
    const { data, errors } = await run(
      query,
      { email: "atomic-reset@example.com" },
      null,
    );
    assert.equal(errors, undefined);
    assert.equal(data.resetPassword, null);
  } finally {
    mailShouldFail = false;
  }

  // the whole point of the fix: a failed send must not have touched the DB
  const stillOriginal = await User.findById(target._id);
  assert.ok(await stillOriginal.isCorrectPassword("Original-Password-1!"));
});

test("uploadMembers: rejects a non-membership role", async () => {
  const { errors } = await run(
    `mutation($memberData: [MemberData]) {
      uploadMembers(memberData: $memberData) { firstName }
    }`,
    { memberData: [] },
    users.leader,
  );
  assert.ok(errors?.length, "expected an authorization error");
});

test("uploadMembers: membership role can upload the real USMS member report", async () => {
  const memberData = parseMemberReportCSV(
    path.join(__dirname, "../seeders/USMSMemberReport_06-15-2026.csv"),
  );

  const { data, errors } = await run(
    `mutation($memberData: [MemberData]) {
      uploadMembers(memberData: $memberData) { firstName lastName club usmsId }
    }`,
    { memberData },
    users.membership,
  );
  assert.equal(errors, undefined);
  assert.equal(data.uploadMembers.length, memberData.length);

  // real, contemporary LMSC export -- not a fixed/synthetic count, just a
  // sanity floor that the VMST roster came through intact
  const vmstCount = data.uploadMembers.filter((m) => m.club === "VMST").length;
  assert.ok(vmstCount > 100, `expected a substantial VMST roster, got ${vmstCount}`);
});

test("addPost: rejects a non-leader, succeeds for a leader", async () => {
  const query = `mutation($title: String!, $summary: String, $content: String!) {
    addPost(title: $title, summary: $summary, content: $content) { _id title }
  }`;
  const variables = {
    title: "Test post",
    summary: "A test post",
    content: "<p>Hello, VMST!</p>",
  };

  const { errors: rejected } = await run(query, variables, users.coach);
  assert.ok(rejected?.length, "only leaders should be able to add posts");

  const { data, errors } = await run(query, variables, users.leader);
  assert.equal(errors, undefined);
  assert.equal(data.addPost.title, "Test post");

  const stored = await Post.findById(data.addPost._id);
  assert.equal(stored.title, "Test post");

  await Post.findByIdAndDelete(data.addPost._id);
});

test("editPost: leader can edit a post", async () => {
  const post = await Post.create({
    title: "Original title",
    summary: "Original summary",
    content: "<p>Original content</p>",
  });

  try {
    const { data, errors } = await run(
      `mutation($id: ID!, $title: String!, $summary: String, $content: String!, $photo: PhotoData) {
        editPost(_id: $id, title: $title, summary: $summary, content: $content, photo: $photo) {
          title
        }
      }`,
      {
        id: post._id.toString(),
        title: "Updated title",
        summary: "Updated summary",
        content: "<p>Updated content</p>",
        photo: {
          id: "photo-1",
          url: "https://example.com/photo.jpg",
          flickrURL: "https://flickr.com/photo-1",
        },
      },
      users.leader,
    );
    assert.equal(errors, undefined);

    // the update itself does succeed in the database -- it's specifically
    // the resolver's return value that's wrong, not the underlying write
    const stored = await Post.findById(post._id);
    assert.equal(stored.title, "Updated title");

    assert.equal(data.editPost?.title, "Updated title");
  } finally {
    await Post.findByIdAndDelete(post._id);
  }
});

test("editPost: a photo missing its required flickrURL is rejected by the schema validator (restored via query-then-save), and omitting photo entirely unsets it", async () => {
  const post = await Post.create({
    title: "Has a photo",
    content: "<p>Content</p>",
    photo: {
      id: "photo-1",
      url: "https://example.com/photo.jpg",
      flickrURL: "https://flickr.com/photo-1",
    },
  });

  const mutation = `mutation($id: ID!, $title: String!, $summary: String, $content: String!, $photo: PhotoData) {
    editPost(_id: $id, title: $title, summary: $summary, content: $content, photo: $photo) {
      title
      photo { id }
    }
  }`;

  try {
    // editPost's catch block logs and swallows errors rather than
    // rethrowing (pre-existing style, not changed here) -- so the
    // regression to guard against is the DB write, not a GraphQL error
    const { data: badData, errors: badErrors } = await run(
      mutation,
      {
        id: post._id.toString(),
        title: "Updated title",
        content: "<p>Updated content</p>",
        // missing flickrURL -- PhotoData allows it (nullable at the
        // GraphQL layer) but the Post schema requires it
        photo: { id: "photo-2", url: "https://example.com/photo2.jpg" },
      },
      users.leader,
    );
    assert.equal(badErrors, undefined);
    assert.equal(badData.editPost, null);

    const stillOriginal = await Post.findById(post._id);
    assert.equal(stillOriginal.title, "Has a photo");
    assert.equal(stillOriginal.photo.id, "photo-1");

    // omitting photo (id: "") removes it entirely, equivalent to the
    // previous $unset: { photo: 1 }
    const { data, errors } = await run(
      mutation,
      {
        id: post._id.toString(),
        title: "Updated title",
        content: "<p>Updated content</p>",
        photo: { id: "", url: "" },
      },
      users.leader,
    );
    assert.equal(errors, undefined);
    assert.equal(data.editPost.photo, null);

    const stored = await Post.findById(post._id);
    assert.equal(stored.photo, undefined);
  } finally {
    await Post.findByIdAndDelete(post._id);
  }
});

test("deletePost: rejects a non-leader, succeeds for a leader", async () => {
  const post = await Post.create({
    title: "To be deleted",
    summary: "",
    content: "<p>Bye</p>",
  });
  const query = `mutation($id: ID!) { deletePost(_id: $id) { _id } }`;

  const { errors: rejected } = await run(
    query,
    { id: post._id.toString() },
    users.coach,
  );
  assert.ok(rejected?.length, "only leaders should be able to delete posts");

  const { data, errors } = await run(
    query,
    { id: post._id.toString() },
    users.leader,
  );
  assert.equal(errors, undefined);
  assert.equal(data.deletePost._id, post._id.toString());

  const stillThere = await Post.findById(post._id);
  assert.equal(stillThere, null);
});

test("addMeet and deleteMeet: reject a coach (leader-only, unlike meets/vmstMembers)", async () => {
  const { errors: addRejected } = await run(
    `mutation($meet: MeetData) { addMeet(meet: $meet) { _id } }`,
    { meet: { meetName: "Coach Test Meet", course: "SCY", startDate: "2026-01-01" } },
    users.coach,
  );
  assert.ok(addRejected?.length, "a coach should not be able to add a meet");

  const existingMeet = await Meet.findOne({ meetName: "Test Meet" });
  const { errors: deleteRejected } = await run(
    `mutation($id: ID!) { deleteMeet(_id: $id) { _id } }`,
    { id: existingMeet._id.toString() },
    users.coach,
  );
  assert.ok(deleteRejected?.length, "a coach should not be able to delete a meet");

  // confirm the rejected delete didn't actually go through
  assert.ok(await Meet.findById(existingMeet._id));
});

test("editMeet: a leader can edit a meet; an invalid course is rejected by the schema validator (restored via query-then-save) without touching unrelated fields", async () => {
  const meet = await Meet.create({
    meetName: "Editable Meet",
    course: "SCY",
    startDate: "2026-02-01",
  });

  try {
    // MeetData's fields (meetName/course/startDate) are all String! at the
    // GraphQL layer, so a `meet` object must supply all three whenever it's
    // provided at all -- there's no partial-update shape for it
    const { data, errors } = await run(
      `mutation($id: ID!, $meet: MeetData) {
        editMeet(_id: $id, meet: $meet) { meetName course startDate }
      }`,
      {
        id: meet._id.toString(),
        meet: { meetName: "Renamed Meet", course: "SCY", startDate: "2026-02-01" },
      },
      users.leader,
    );
    assert.equal(errors, undefined);
    assert.equal(data.editMeet.meetName, "Renamed Meet");
    assert.equal(data.editMeet.course, "SCY");

    // editMeet's catch block logs and swallows errors rather than
    // rethrowing (pre-existing style, not changed here) -- so the
    // regression to guard against is the DB write, not a GraphQL error
    const { data: badData, errors: badErrors } = await run(
      `mutation($id: ID!, $meet: MeetData) {
        editMeet(_id: $id, meet: $meet) { meetName course startDate }
      }`,
      {
        id: meet._id.toString(),
        meet: {
          meetName: "Renamed Meet",
          course: "not-a-real-course",
          startDate: "2026-02-01",
        },
      },
      users.leader,
    );
    assert.equal(badErrors, undefined);
    assert.equal(badData.editMeet, null);

    const stillThere = await Meet.findById(meet._id);
    assert.equal(stillThere.course, "SCY");
    assert.equal(stillThere.meetName, "Renamed Meet");
  } finally {
    await Meet.findByIdAndDelete(meet._id);
  }
});

test("addMeet, emailGroup, deleteMeet: real Nationals roster matched against the just-uploaded members", async () => {
  const { swimmers, relayEvents } = parseMeetRosterCSV(
    path.join(__dirname, "../seeders/NationalsRoster_2026.csv"),
  );

  // match against the VMST members uploaded in the previous test, the same
  // pool a leader would see via the vmstMembers query (Member.find({ club:
  // "VMST" })). Pairing a slightly-dated meet roster against a contemporary
  // member list is the realistic case -- some swimmers won't match due to
  // member drift (see the Andrews assertion below for a concrete example
  // found in this real data).
  const vmstMembers = await Member.find({ club: "VMST" });
  const meetSwimmers = swimmers.map((swimmer) => {
    const match = vmstMembers.find(
      (m) =>
        m.firstName.toLowerCase() === swimmer.firstName.toLowerCase() &&
        m.lastName.toLowerCase() === swimmer.lastName.toLowerCase(),
    );
    return {
      ...swimmer,
      usmsId: match?.usmsId || "",
      includeEmail: Boolean(match),
    };
  });

  const matched = meetSwimmers.filter((s) => s.includeEmail);
  assert.equal(meetSwimmers.length, 21);
  // Harrison Andrews is on this roster but his member record uses the
  // numeric club code "1693" rather than the text "VMST" in the real USMS
  // export -- a genuine data inconsistency, not a bug in this test
  assert.equal(matched.length, 20);
  assert.equal(
    meetSwimmers.find((s) => s.lastName === "Andrews").includeEmail,
    false,
  );

  const relays = relayEvents.map((eventNum) => ({ eventNum }));

  const { data: addData, errors: addErrors } = await run(
    `mutation($meet: MeetData, $meetSwimmers: [MeetSwimmerData], $relays: [RelayData]) {
      addMeet(meet: $meet, meetSwimmers: $meetSwimmers, relays: $relays) {
        _id
        meetSwimmers { firstName lastName usmsId includeEmail }
      }
    }`,
    {
      meet: {
        meetName: "Nationals Test Meet",
        course: "LCM",
        startDate: "2026-08-01",
      },
      meetSwimmers,
      relays,
    },
    users.leader,
  );
  assert.equal(addErrors, undefined);
  assert.equal(addData.addMeet.meetSwimmers.length, 21);
  const meetId = addData.addMeet._id;

  // email the matched participants (Mail is stubbed in test.before(); see
  // sentMail)
  const recipientIds = matched
    .map((s) => vmstMembers.find((m) => m.usmsId === s.usmsId)?._id)
    .filter(Boolean)
    .map(String);

  const sentBefore = sentMail.length;
  const { data: emailData, errors: emailErrors } = await run(
    `mutation($emailData: emailData) {
      emailGroup(emailData: $emailData)
    }`,
    {
      emailData: {
        id: recipientIds,
        subject: "Nationals meet info",
        plainText: "test message",
      },
    },
    users.leader,
  );
  assert.equal(emailErrors, undefined);
  assert.equal(emailData.emailGroup, true);
  assert.equal(sentMail.length, sentBefore + 1);
  assert.ok(sentMail[sentMail.length - 1].emails.length > 0);

  const { data: deleteData, errors: deleteErrors } = await run(
    "mutation($id: ID!) { deleteMeet(_id: $id) { _id } }",
    { id: meetId },
    users.leader,
  );
  assert.equal(deleteErrors, undefined);
  assert.equal(deleteData.deleteMeet._id, meetId);

  const stillThere = await Meet.findById(meetId);
  assert.equal(stillThere, null);
});

test("emailGroup: rejects an unauthenticated caller and a non-leader/coach role", async () => {
  const query = `mutation($emailData: emailData) { emailGroup(emailData: $emailData) }`;
  const variables = {
    emailData: { id: [], subject: "Hi", plainText: "test" },
  };

  const unauth = await run(query, variables, null);
  assert.ok(unauth.errors?.length);

  const { errors } = await run(query, variables, users.membership);
  assert.ok(errors?.length, "membership role should not be allowed");
});

test("emailGroup: a coach can email members (success path, not just leader)", async () => {
  const member = await Member.create({
    usmsRegNo: "555501",
    usmsId: "55501",
    firstName: "Coach",
    lastName: "Recipient",
    gender: "M",
    club: "VMST",
    regYear: 2026,
    emails: [makeEmail("coach-recipient@example.com")],
  });

  const before = sentMail.length;
  const { data, errors } = await run(
    `mutation($emailData: emailData) { emailGroup(emailData: $emailData) }`,
    {
      emailData: {
        id: [member._id.toString()],
        subject: "Workout group update",
        plainText: "practice moved to 6am",
      },
    },
    users.coach,
  );
  assert.equal(errors, undefined);
  assert.equal(data.emailGroup, true);
  assert.equal(sentMail.length, before + 1);
  assert.deepEqual(sentMail[sentMail.length - 1].emails, [
    "coach-recipient@example.com",
  ]);

  await Member.findByIdAndDelete(member._id);
});

test("emailLeaders: succeeds for an anonymous visitor (no email address exposed)", async () => {
  const before = sentMail.length;
  const { data, errors } = await run(
    `mutation($emailData: emailData) { emailLeaders(emailData: $emailData) }`,
    { emailData: { id: [], subject: "Hello leaders", plainText: "hi" } },
    null,
  );
  assert.equal(errors, undefined);
  assert.equal(data.emailLeaders, true);
  assert.equal(sentMail.length, before + 1);
  assert.deepEqual(sentMail[sentMail.length - 1].emails, ["leader@example.com"]);
});

test("emailWebmaster: succeeds for an anonymous visitor", async () => {
  const before = sentMail.length;
  const { data, errors } = await run(
    `mutation($emailData: emailData) { emailWebmaster(emailData: $emailData) }`,
    { emailData: { id: [], subject: "Hello webmaster", plainText: "hi" } },
    null,
  );
  assert.equal(errors, undefined);
  assert.equal(data.emailWebmaster, true);
  assert.equal(sentMail.length, before + 1);
  assert.deepEqual(sentMail[sentMail.length - 1].emails, [
    "webmaster@example.com",
  ]);
});

test("emailLeadersWebmaster: succeeds for an anonymous visitor, reaches both", async () => {
  const before = sentMail.length;
  const { data, errors } = await run(
    `mutation($emailData: emailData) { emailLeadersWebmaster(emailData: $emailData) }`,
    { emailData: { id: [], subject: "Hello both", plainText: "hi" } },
    null,
  );
  assert.equal(errors, undefined);
  assert.equal(data.emailLeadersWebmaster, true);
  assert.equal(sentMail.length, before + 1);
  const emails = sentMail[sentMail.length - 1].emails;
  assert.ok(emails.includes("leader@example.com"));
  assert.ok(emails.includes("webmaster@example.com"));
});

// uploadMembers wholesale-replaces "the truth" on every call (anyone missing
// from memberData is hard-deleted), so these tests must run after every other
// test that depends on a particular Member collection state -- in particular,
// after the real-CSV upload test and the Nationals roster test that consumes
// it. Hence they're appended at the very end of the file.
test("uploadMembers: dedupes by usmsId keeping the higher regYear, preserves deliverable for an unchanged address, resets it for a changed one, and hard-deletes anyone missing from the new upload", async () => {
  const firstUpload = [
    {
      usmsRegNo: "TEST-2026-A",
      usmsId: "TESTA",
      firstName: "Old",
      lastName: "Data",
      gender: "F",
      club: "VMST",
      regYear: 2026,
      emails: ["a@example.com"],
      emailExclude: false,
    },
    {
      // same person as above (registered early for next year), should win
      // the dedupe by having the higher regYear
      usmsRegNo: "TEST-2027-A",
      usmsId: "TESTA",
      firstName: "New",
      lastName: "Data",
      gender: "F",
      club: "VMST",
      regYear: 2027,
      emails: ["a@example.com", "second@example.com"],
      emailExclude: false,
    },
    {
      usmsRegNo: "TEST-2026-B",
      usmsId: "TESTB",
      firstName: "WillLeave",
      lastName: "Person",
      gender: "M",
      club: "VMST",
      regYear: 2026,
      emails: ["b@example.com"],
      emailExclude: false,
    },
  ];

  const mutation = `mutation($memberData: [MemberData]) {
    uploadMembers(memberData: $memberData) {
      usmsId
      firstName
      regYear
      emails { address formatValid deliverable }
    }
  }`;

  const { data: firstResult, errors: firstErrors } = await run(
    mutation,
    { memberData: firstUpload },
    users.membership,
  );
  assert.equal(firstErrors, undefined);
  assert.equal(firstResult.uploadMembers.length, 2);

  const testAFirst = firstResult.uploadMembers.find((m) => m.usmsId === "TESTA");
  assert.equal(testAFirst.firstName, "New");
  assert.equal(testAFirst.regYear, 2027);

  // simulate the membership-coordinator tool (updateEmailDeliverability,
  // tested separately below) flagging a real bounce on one address
  await Member.updateOne(
    { usmsId: "TESTA", "emails.address": "a@example.com" },
    { $set: { "emails.$.deliverable": false } },
  );

  // second upload: TESTB has left the LMSC (absent here); TESTA keeps
  // "a@example.com" unchanged (deliverable:false should survive) and drops
  // "second@example.com" in favor of a brand new "third@example.com"
  const secondUpload = [
    {
      usmsRegNo: "TEST-2027-A",
      usmsId: "TESTA",
      firstName: "New",
      lastName: "Data",
      gender: "F",
      club: "VMST",
      regYear: 2027,
      emails: ["a@example.com", "third@example.com"],
      emailExclude: false,
    },
  ];

  const { data: secondResult, errors: secondErrors } = await run(
    mutation,
    { memberData: secondUpload },
    users.membership,
  );
  assert.equal(secondErrors, undefined);
  assert.equal(secondResult.uploadMembers.length, 1);

  const byAddress = Object.fromEntries(
    secondResult.uploadMembers[0].emails.map((e) => [e.address, e]),
  );
  assert.equal(byAddress["a@example.com"].deliverable, false);
  assert.equal(byAddress["a@example.com"].formatValid, true);
  assert.equal(byAddress["third@example.com"].deliverable, true);
  assert.equal(byAddress["second@example.com"], undefined);

  assert.equal(await Member.findOne({ usmsId: "TESTB" }), null);

  await Member.deleteOne({ usmsId: "TESTA" });
});

test("uploadMembers: a malformed email gets formatValid:false without failing the rest of the upload, while case, plus-addressing, and long TLDs are accepted", async () => {
  const memberData = [
    {
      usmsRegNo: "TEST-BADEMAIL",
      usmsId: "BADEM",
      firstName: "Bad",
      lastName: "Email",
      gender: "M",
      club: "VMST",
      regYear: 2026,
      emails: [
        "not-an-email",
        "good@example.com",
        // previously false-flagged by the old lowercase-only,
        // 6-char-TLD-capped regex -- real addresses we shouldn't give up on
        "User.Name@EXAMPLE.COM",
        "user+tag@gmail.com",
        "user@example.technology",
      ],
      emailExclude: false,
    },
  ];

  const { data, errors } = await run(
    `mutation($memberData: [MemberData]) {
      uploadMembers(memberData: $memberData) {
        usmsId
        emails { address formatValid deliverable }
      }
    }`,
    { memberData },
    users.membership,
  );
  assert.equal(errors, undefined);

  const member = data.uploadMembers.find((m) => m.usmsId === "BADEM");
  const byAddress = Object.fromEntries(
    member.emails.map((e) => [e.address, e]),
  );
  assert.equal(byAddress["not-an-email"].formatValid, false);
  assert.equal(byAddress["good@example.com"].formatValid, true);
  assert.equal(byAddress["User.Name@EXAMPLE.COM"].formatValid, true);
  assert.equal(byAddress["user+tag@gmail.com"].formatValid, true);
  assert.equal(byAddress["user@example.technology"].formatValid, true);

  await Member.deleteOne({ usmsId: "BADEM" });
});

test("updateEmailDeliverability: rejects a non-membership role", async () => {
  const { errors } = await run(
    `mutation($updates: [EmailDeliverabilityInput]) {
      updateEmailDeliverability(updates: $updates) { usmsId }
    }`,
    { updates: [] },
    users.leader,
  );
  assert.ok(errors?.length, "expected an authorization error");
});

test("updateEmailDeliverability: flips deliverable for the matching address only, leaving formatValid and other addresses untouched", async () => {
  const member = await Member.create({
    usmsRegNo: "TEST-DELIVER",
    usmsId: "DELIV1",
    firstName: "Deliver",
    lastName: "Ability",
    gender: "F",
    club: "VMST",
    regYear: 2026,
    emails: [
      makeEmail("primary@example.com"),
      makeEmail("secondary@example.com"),
    ],
  });

  const { data, errors } = await run(
    `mutation($updates: [EmailDeliverabilityInput]) {
      updateEmailDeliverability(updates: $updates) {
        usmsId
        emails { address formatValid deliverable }
      }
    }`,
    {
      updates: [
        {
          usmsId: "DELIV1",
          address: "primary@example.com",
          deliverable: false,
        },
      ],
    },
    users.membership,
  );
  assert.equal(errors, undefined);

  const updated = data.updateEmailDeliverability.find(
    (m) => m.usmsId === "DELIV1",
  );
  const byAddress = Object.fromEntries(
    updated.emails.map((e) => [e.address, e]),
  );
  assert.equal(byAddress["primary@example.com"].deliverable, false);
  assert.equal(byAddress["primary@example.com"].formatValid, true);
  assert.equal(byAddress["secondary@example.com"].deliverable, true);

  await Member.findByIdAndDelete(member._id);
});

test("emailGroup: skips addresses that are not formatValid or not deliverable", async () => {
  const member = await Member.create({
    usmsRegNo: "555502",
    usmsId: "55502",
    firstName: "Mixed",
    lastName: "Addresses",
    gender: "F",
    club: "VMST",
    regYear: 2026,
    emails: [
      makeEmail("good@example.com"),
      makeEmail("bad-format", { formatValid: false }),
      makeEmail("bounced@example.com", { deliverable: false }),
    ],
  });

  const before = sentMail.length;
  const { data, errors } = await run(
    `mutation($emailData: emailData) { emailGroup(emailData: $emailData) }`,
    {
      emailData: {
        id: [member._id.toString()],
        subject: "Test",
        plainText: "test",
      },
    },
    users.leader,
  );
  assert.equal(errors, undefined);
  assert.equal(data.emailGroup, true);
  assert.equal(sentMail.length, before + 1);
  assert.deepEqual(sentMail[sentMail.length - 1].emails, ["good@example.com"]);

  await Member.findByIdAndDelete(member._id);
});
