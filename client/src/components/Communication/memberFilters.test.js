import test from "node:test";
import assert from "node:assert/strict";
import { selectOptedOut, selectUnreachable } from "./memberFilters.js";

// Run with: node --test src/components/Communication/memberFilters.test.js
// (or `npm test`, from client/). Pure logic, no React/DOM -- this is the
// extracted decision logic behind two accordions on the Communication tab:
// "Swimmers Who Have Opted Out" and "Swimmers Not Reachable". Written after
// a real bug where an opted-out member with no email on file appeared in
// both lists.

const workingEmail = { address: "good@example.com", formatValid: true, deliverable: true };
const malformedEmail = { address: "not-an-email", formatValid: false, deliverable: true };
const bouncedEmail = { address: "bounced@example.com", formatValid: true, deliverable: false };

function makeMember(overrides) {
  return {
    usmsId: "X1",
    firstName: "Test",
    lastName: "Member",
    workoutGroup: "RVCM",
    emailExclude: false,
    emails: [workingEmail],
    ...overrides,
  };
}

const leader = { role: "leader" };

test("selectOptedOut: returns only members with emailExclude true, regardless of email validity", () => {
  const optedOutNoEmail = makeMember({ usmsId: "A", emailExclude: true, emails: [] });
  const optedOutWithEmail = makeMember({ usmsId: "B", emailExclude: true });
  const notOptedOut = makeMember({ usmsId: "C", emailExclude: false });

  const result = selectOptedOut([optedOutNoEmail, optedOutWithEmail, notOptedOut]);

  assert.deepEqual(
    result.map((m) => m.usmsId).sort(),
    ["A", "B"],
  );
});

test("selectUnreachable: a member opted out with no email is NOT also listed as unreachable", () => {
  // the actual bug: emailExclude:true + emails:[] previously appeared in
  // both lists
  const optedOutNoEmail = makeMember({ usmsId: "A", emailExclude: true, emails: [] });

  assert.deepEqual(selectOptedOut([optedOutNoEmail]).map((m) => m.usmsId), ["A"]);
  assert.deepEqual(selectUnreachable([optedOutNoEmail], leader), []);
});

test("selectUnreachable: a non-opted-out member with no working email IS listed as unreachable", () => {
  const noEmailAtAll = makeMember({ usmsId: "A", emails: [] });
  const onlyMalformed = makeMember({ usmsId: "B", emails: [malformedEmail] });
  const onlyBounced = makeMember({ usmsId: "C", emails: [bouncedEmail] });
  const malformedAndBounced = makeMember({
    usmsId: "D",
    emails: [malformedEmail, bouncedEmail],
  });

  const result = selectUnreachable(
    [noEmailAtAll, onlyMalformed, onlyBounced, malformedAndBounced],
    leader,
  );

  assert.deepEqual(
    result.map((m) => m.usmsId).sort(),
    ["A", "B", "C", "D"],
  );
});

test("selectUnreachable: a member with at least one working email is reachable, even alongside a bad one", () => {
  const mixedGoodAndBad = makeMember({
    usmsId: "A",
    emails: [malformedEmail, workingEmail],
  });

  assert.deepEqual(selectUnreachable([mixedGoodAndBad], leader), []);
});

test("selectUnreachable: a leader sees unreachable members across all workout groups", () => {
  const inGroup = makeMember({ usmsId: "A", workoutGroup: "RVCM", emails: [] });
  const outOfGroup = makeMember({ usmsId: "B", workoutGroup: "Other", emails: [] });

  const result = selectUnreachable([inGroup, outOfGroup], leader);

  assert.deepEqual(result.map((m) => m.usmsId).sort(), ["A", "B"]);
});

test("selectUnreachable: a coach only sees unreachable members in their own workout group", () => {
  const inGroup = makeMember({ usmsId: "A", workoutGroup: "RVCM", emails: [] });
  const outOfGroup = makeMember({ usmsId: "B", workoutGroup: "Other", emails: [] });
  const coach = { role: "coach", group: "RVCM" };

  const result = selectUnreachable([inGroup, outOfGroup], coach);

  assert.deepEqual(result.map((m) => m.usmsId), ["A"]);
});
