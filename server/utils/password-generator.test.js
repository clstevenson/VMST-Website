const test = require("node:test");
const assert = require("node:assert/strict");
const generatePassword = require("./password-generator");

test("generatePassword: returns a non-empty string", () => {
  const pwd = generatePassword();
  assert.equal(typeof pwd, "string");
  assert.ok(pwd.length > 0);
});

test("generatePassword: output contains only alphanumeric characters", () => {
  // Documents current behavior: no special chars, no spaces
  const pwd = generatePassword();
  assert.match(pwd, /^[a-zA-Z0-9]+$/);
});

test("generatePassword: output contains at least one uppercase letter", () => {
  const pwd = generatePassword();
  assert.match(pwd, /[A-Z]/);
});

test("generatePassword: output contains at least one lowercase letter", () => {
  const pwd = generatePassword();
  assert.match(pwd, /[a-z]/);
});

test("generatePassword: output contains at least one digit", () => {
  const pwd = generatePassword();
  assert.match(pwd, /[0-9]/);
});

test("generatePassword: output is at least 12 characters (production call: length=3)", () => {
  // The production call site uses length=3 (3 × 64-bit values in base-36).
  // In practice this yields ~36 chars; asserting >= 12 provides a regression
  // floor without being sensitive to the variable-length nature of base-36.
  const pwd = generatePassword(3);
  assert.ok(pwd.length >= 12, `expected >= 12 chars, got ${pwd.length}`);
});

test("generatePassword: two consecutive calls return different passwords", () => {
  // With 3+ × 64 bits of entropy a collision is astronomically unlikely.
  const a = generatePassword();
  const b = generatePassword();
  assert.notEqual(a, b);
});
