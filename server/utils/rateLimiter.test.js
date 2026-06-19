const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");

const createLoginLimiter = require("./rateLimiter");

// Builds a minimal app -- just body parsing + a fresh limiter + a stub
// "success" handler -- so the limiter is tested in isolation from the
// real GraphQL/Apollo/DB stack.
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/graphql", createLoginLimiter(), (req, res) => {
    res.status(200).json({ data: { ok: true } });
  });
  return app;
}

function loginRequest(app) {
  return request(app)
    .post("/graphql")
    .send({ operationName: "login", query: "mutation login { login }" });
}

test("allows login attempts up to the configured limit", async () => {
  const app = buildApp();

  for (let attempt = 1; attempt <= 10; attempt++) {
    const res = await loginRequest(app);
    assert.equal(res.status, 200, `attempt ${attempt} should not be limited`);
  }
});

test("blocks login attempts once the limit is exceeded", async () => {
  const app = buildApp();

  for (let attempt = 1; attempt <= 10; attempt++) {
    await loginRequest(app);
  }

  const blocked = await loginRequest(app);
  assert.equal(blocked.status, 429);
  assert.match(blocked.body.errors[0].message, /too many login attempts/i);
});

test("does not rate-limit non-login GraphQL operations", async () => {
  const app = buildApp();

  // exhaust the login limit
  for (let attempt = 1; attempt <= 11; attempt++) {
    await loginRequest(app);
  }

  const res = await request(app)
    .post("/graphql")
    .send({ operationName: "getPosts", query: "{ posts { _id } }" });

  assert.equal(res.status, 200);
});
