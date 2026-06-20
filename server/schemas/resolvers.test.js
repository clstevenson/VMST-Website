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

const users = {}; // role -> { _id, role }

// emailGroup/resetPassword etc. call Mail (server/utils/emailHandler.js), which
// hits a real (hardcoded) Ethereal SMTP server -- not something an automated
// test suite should depend on. resolvers.js captures `Mail` as a plain const at
// require-time, so the only way to intercept it is to swap the cached module's
// exports *before* resolvers.js is first required below. sentMail collects
// whatever a test sends so it can assert on it without a real network call.
const sentMail = [];

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  const emailHandlerPath = require.resolve("../utils/emailHandler");
  require.cache[emailHandlerPath] = {
    id: emailHandlerPath,
    filename: emailHandlerPath,
    loaded: true,
    exports: async (mailArgs) => {
      sentMail.push(mailArgs);
    },
  };

  mongoose = require("mongoose");
  const { ApolloServer } = require("@apollo/server");
  const { typeDefs, resolvers } = require("./index");
  User = require("../models/Users");
  Member = require("../models/Members");
  Meet = require("../models/Meets");

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
    emails: ["swimmer@example.com"],
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

test("password is not a queryable field on User, regardless of role", async () => {
  const { errors } = await run(
    "{ getLeaders { firstName password } }",
    {},
    users.webmaster,
  );
  assert.ok(errors?.length, "expected a schema validation error");
  assert.match(errors[0].message, /Cannot query field "password"/);
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
  assert.equal(sentMail.length, 1);
  assert.ok(sentMail[0].emails.length > 0);

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
