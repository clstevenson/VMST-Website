// Pure, framework-free member-list filtering used by Communication.jsx and
// GroupSelection.jsx. Extracted into its own module (no React/JSX/DOM) so
// this logic can be unit-tested directly with node:test -- see
// memberFilters.test.js. The two derivations below are deliberately kept
// mutually exclusive: a member who has opted out should be explained by
// that fact alone, not also listed as unreachable for lacking a working
// email.

// true when a member has not opted out and has at least one formatValid +
// deliverable address on file
export function isReachable(member) {
  return (
    !member.emailExclude &&
    member.emails?.some((email) => email.formatValid && email.deliverable)
  );
}

// members who have explicitly opted out of receiving team emails
export function selectOptedOut(members) {
  return members.filter((member) => member.emailExclude);
}

// members who have NOT opted out, but have no usable email address at all --
// every address on file is either malformed or marked undeliverable, or
// they have none. For a coach, scoped down to their own workout group,
// matching every other recipient-selection control on this page.
export function selectUnreachable(members, userProfile) {
  let unreachable = members
    .filter((member) => !member.emailExclude)
    .filter(
      (member) =>
        member.emails.length === 0 ||
        member.emails.every(
          (email) => !email.formatValid || !email.deliverable,
        ),
    );
  if (userProfile.role === "coach") {
    unreachable = unreachable.filter(
      (member) => member.workoutGroup === userProfile.group,
    );
  }
  return unreachable;
}
