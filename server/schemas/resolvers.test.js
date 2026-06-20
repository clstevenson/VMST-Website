const test = require("node:test");
const assert = require("node:assert/strict");
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

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

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
