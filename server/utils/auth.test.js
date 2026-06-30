// Must be set before auth.js is required so the module captures a known
// secret; dotenv (called inside auth.js) won't override an already-set var.
process.env.SECRET_KEY = "auth-test-secret";

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { authMiddleware, signToken } = require("./auth");

const TEST_SECRET = "auth-test-secret";

function makeReq(token) {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  };
}

const fakeRes = {};

const payload = { role: "leader", _id: "abc123", group: null };

test("authMiddleware: valid token attaches user to context", () => {
  const token = signToken(payload);
  const ctx = authMiddleware({ req: makeReq(token), res: fakeRes });
  assert.equal(ctx.user.role, payload.role);
  assert.equal(ctx.user._id, payload._id);
});

test("authMiddleware: missing Authorization header leaves user undefined", () => {
  const ctx = authMiddleware({ req: makeReq(null), res: fakeRes });
  assert.equal(ctx.user, undefined);
});

test("authMiddleware: tampered token (flipped signature byte) leaves user undefined", () => {
  const token = signToken(payload);
  const parts = token.split(".");
  // flip the last character of the signature segment
  parts[2] = parts[2].slice(0, -1) + (parts[2].endsWith("a") ? "b" : "a");
  const ctx = authMiddleware({ req: makeReq(parts.join(".")), res: fakeRes });
  assert.equal(ctx.user, undefined);
});

test("authMiddleware: token signed with wrong secret leaves user undefined", () => {
  const bad = jwt.sign({ data: payload }, "wrong-secret", { expiresIn: "15m" });
  const ctx = authMiddleware({ req: makeReq(bad), res: fakeRes });
  assert.equal(ctx.user, undefined);
});

test("authMiddleware: expired token leaves user undefined", () => {
  // expiresIn: -1 sets exp one second before iat, so verify throws immediately
  const expired = jwt.sign({ data: payload }, TEST_SECRET, { expiresIn: -1 });
  const ctx = authMiddleware({ req: makeReq(expired), res: fakeRes });
  assert.equal(ctx.user, undefined);
});
