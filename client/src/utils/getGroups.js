// Return the number of VMST workout groups in the membership data

// Input: array of objects (ie, the member data)
// Ouput: sorted array of strings for the workout groups (null not included)

// Uses the ES6 Set object, adapted from https://codeburst.io/javascript-array-distinct-5edc93501dc4

const getGroups = (members) => {
  console.log(members);
  // first filter the input for members of VMST and then return non-null WO groups
  const groups = [...new Set(members
                             .filter(member => member.club === 'VMST')
                             .map(member => member.workoutGroup))];
  console.log(groups)
  return groups.filter(group => group !== null).sort();
}

export default getGroups;
