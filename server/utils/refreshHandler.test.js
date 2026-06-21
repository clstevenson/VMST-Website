const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const cookieParser = require("cookie-parser");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Isolated in-memory Mongo instance, separate from resolvers.test.js's --
// auth.js opens its own connection lazily via the User model, so this file
// doesn't need to touch config/connection.js at all.
let mongod;
let mongoose;
let User;
let refreshHandler;
let signRefreshToken;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  mongoose = require("mongoose");
  await mongoose.connect(mongod.getUri());
  User = require("../models/Users");
  ({ refreshHandler, signRefreshToken } = require("./auth"));
});

test.after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

function buildApp() {
  const app = express();
  app.use(cookieParser());
  app.post("/refresh", refreshHandler);
  return app;
}

test("refreshHandler: issues a new access token for an active user", async () => {
  const user = await User.create({
    firstName: "Active",
    lastName: "User",
    email: "active-refresh-test@example.com",
    password: "irrelevant-not-used-by-this-test",
  });
  const token = signRefreshToken(user);

  const res = await request(buildApp())
    .post("/refresh")
    .set("Cookie", `refresh_token=${token}`);

  assert.equal(res.status, 200);
  assert.ok(res.body.accessToken);
});

test("refreshHandler: rejects a banned user and clears the refresh cookie", async () => {
  const user = await User.create({
    firstName: "Banned",
    lastName: "User",
    email: "banned-refresh-test@example.com",
    password: "irrelevant-not-used-by-this-test",
    accountStatus: "banned",
  });
  const token = signRefreshToken(user);

  const res = await request(buildApp())
    .post("/refresh")
    .set("Cookie", `refresh_token=${token}`);

  assert.equal(res.status, 403);
  const setCookie = res.headers["set-cookie"]?.join(";") ?? "";
  // an expired/empty refresh_token cookie means the client can't just retry
  assert.match(setCookie, /refresh_token=;/);
});

test("refreshHandler: rejects a missing/invalid refresh token", async () => {
  const res = await request(buildApp())
    .post("/refresh")
    .set("Cookie", "refresh_token=not-a-real-token");

  assert.equal(res.status, 403);
});
