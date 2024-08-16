/* 
 The purpose of this function is to find matches of a user or competitor with
 the registered USMS swimmers. Matches will be based on first and last names.

 Input parameters:
 - object containing two properties, firstName and lastName, that are concatenated and used for the match
 - members array of objects, each object must at a minimum contain the matching properties used for the search (ie firstName and lastName)

 Note that since match-sorter only supports a single input string, the two names are concatenated (with a space between)
 */

import { matchSorter } from "match-sorter";

export default function matchUSMS({ firstName, lastName }, members) {
  const fullName = `${firstName} ${lastName}`;
  const allMembers = members.map((member) => {
    return {
      name: `${member.firstName} ${member.lastName}`,
      ...member,
    };
  });
  const matches = matchSorter(allMembers, fullName, { keys: ["name"] });
  return matches.map((match) => {
    delete match.name;
    return match;
  });
}
