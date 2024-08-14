// Returns an array of objects containing the names and membership counts of
// all workout groups in the input

// Input: array of objects representing the membership data
// Ouput: array of objects with properties "name" and "count", sorted by name

// Uses the ES6 Set object, adapted from https://codeburst.io/javascript-array-distinct-5edc93501dc4

const getGroups = (members) => {
  // first filter the input for members of VMST and then return non-null WO groups
  const groups = [...new Set(members.map((member) => member.workoutGroup))];
  const sortedGroups = groups.filter((group) => group !== null).sort();
  const groupCounts = sortedGroups.map((group) => {
    const count = members.filter(
      ({ workoutGroup }) => workoutGroup === group
    ).length;
    const groupObject = { name: group, count };
    return groupObject;
  });
  return groupCounts;
};

export default getGroups;
