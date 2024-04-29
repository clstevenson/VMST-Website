const connection = require('../config/connection');
const { Member, User, Competitor } = require('../models');
// Membership Data as of 04/28/24 (with emails replaced)

connection.on('error', (err) => err);

/*
 * Function to seed the USMS members collection with VA LMSC members
 * In production this will be done by the membership coordinator by uploading
 * a data file (eg as a CSV) but for now we'll use the supplied JSON (which has fake emails)
 */
const seedMembers = async () => {
  // used an altered CSV and https://codebeautify.org/excel-to-json to produce the data
  const memberData = require('./members.json');

  // delete the members collection if it exists
  let membersCheck = await connection.db.listCollections({ name: 'members' }).toArray();
  if (membersCheck.length) {
    await connection.dropCollection('members');
  }

  lmscMembers = memberData.map(member => {
    if (member.emails) {
      // member may have two emails in one string
      member.emails = member.emails.split(', ');
    } else {
      // member may not have an email address, catch the error
      member.emails = [];
    }
    return member;
  });

  // add to the members collection
  return await Member.insertMany(lmscMembers);
}

/*
 * Function to seed the Users with 10 random USMS members
 * Added four leaders with real emails for email testing purposes in dev
 * Also added the real Membership Coordinator as a user to test that functionality in dev
 */
const seedUsers = async (members) => {
  // if the users collection exists, delete it
  let usersCheck = await connection.db.listCollections({ name: 'users' }).toArray();
  if (usersCheck.length) {
    await connection.dropCollection('users');
  }
  // randomly select 10 to be users
  const userData = [];
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * members.length + 1);
    const { firstName, lastName, usmsId } = members[randomIndex];
    const obj = {
      firstName,
      lastName,
      usmsId,
      password: 'password',
      // email is required and must be unique
      email: `email${i}@email.com`,
    };
    userData.push(obj);
  }
  // add four leaders for email testing
  userData.push({
    firstName: 'Ian',
    lastName: 'Stevenson',
    password: 'password',
    email: 'ianmstevenson1@gmail.com',
    role: 'leader'
  });
  userData.push({
    firstName: 'Chris',
    lastName: 'Stevenson',
    password: 'password',
    email: 'chrislstevenson@gmail.com',
    role: 'leader'
  });
  userData.push({
    firstName: 'Leonidas',
    lastName: 'Stevenson',
    password: 'password',
    email: 'cstevens@richmond.edu',
    role: 'leader'
  });
  userData.push({
    firstName: 'Michael',
    lastName: 'Stevenson',
    password: 'password',
    email: 'junodog2@gmail.com',
    role: 'leader'
  });
  // add membership coordinator for membership CSV upload
  userData.push({
    firstName: 'Christopher',
    lastName: 'Stevenson',
    password: 'password',
    email: 'VAMembership@usms.org',
    role: 'membership'
  });

  // now add to the users collection
  return await User.insertMany(userData);
}

/*
 * Function to see the Competitors collection with VMST swimmers who participated in a real meet:
 * the Colonies Zone Championship held Apr 19-21 in Stafford, VA.
 *
 * CA link: https://www.clubassistant.com/club/meet_information.cfm?c=2606&smid=17817
 * Entry rosters link: https://www.clubassistant.com/club/competitions/team_rosters.cfm?c=2606&smid=17817
 *
 * After downloading the CSV of the VMST entries, the column headings were modified to match the schema
 * and the relay numbers were collapsed into a single string. Then an XL to JSON converter was used:
 *
 * https://codebeautify.org/excel-to-json
 *
 * In production the CSV file would be uploaded directly and the user would be prompted to enter the
 * meet information. There would need to be some additional data munging to match what I did in XL.
 */
const seedCompetitors = async () => {
  // import the data (see comment above for origin)
  const competitorData = require('./competitors.json');

  // delete collection if it exists; in production this wouldn't happen
  let collCheck = await connection.db.listCollections({ name: 'competitors' }).toArray();
  if (collCheck.length) {
    await connection.dropCollection('competitors');
  }

  const swimmers = competitorData.map(swimmer => {
    // meet information
    swimmer.meet = {
      title: 'Colonies Zone SCY Champioinship',
      startDate: new Date('4/19/2024'),
      endDate: new Date('4/21/2024'),
    };

    // make relay event numbers into an array of numbers
    let relayEvtNums;
    if (swimmer.relays && isNaN(swimmer.relays)) {
      relayEvtNums = swimmer.relays.split(', ');
    } else if (typeof swimmer.relays === 'number') {
      // a single relay value
      relayEvtNums = [swimmer.relays];
    } else {
      // does not want to be on any relays
      relayEvtNums = [];
    }

    // now build the array of relay objects for this swimmer
    swimmer.relay = relayEvtNums.map(evtNum => {
      const relay = {};
      relay.eventNum = evtNum;
      // add relay info by event number
      switch (evtNum) {
        case '13':
          relay.distance = 200;
          relay.relayStroke = 'Free';
          relay.relayGender = 'F';
          break;
        case '14':
          relay.distance = 200;
          relay.relayStroke = 'Free';
          relay.relayGender = 'M';
          break;
        case '15':
          relay.distance = 200;
          relay.relayStroke = 'Free';
          relay.relayGender = 'X';
          break;
        case '25':
          relay.distance = 400;
          relay.relayStroke = 'Medley';
          relay.relayGender = 'F';
          break;
        case '26':
          relay.distance = 400;
          relay.relayStroke = 'Medley';
          relay.relayGender = 'M';
          break;
        case '27':
          relay.distance = 400;
          relay.relayStroke = 'Medley';
          relay.relayGender = 'X';
          break;
        case '37':
          relay.distance = 400;
          relay.relayStroke = 'Free';
          relay.relayGender = 'F';
          break;
        case '38':
          relay.distance = 400;
          relay.relayStroke = 'Free';
          relay.relayGender = 'M';
          break;
        case '39':
          relay.distance = 400;
          relay.relayStroke = 'Free';
          relay.relayGender = 'X';
          break;
        case '49':
          relay.distance = 200;
          relay.relayStroke = 'Medley';
          relay.relayGender = 'F';
          break;
        case '50':
          relay.distance = 200;
          relay.relayStroke = 'Medley';
          relay.relayGender = 'M';
          break;
        case '51':
          relay.distance = 200;
          relay.relayStroke = 'Medley';
          relay.relayGender = 'X';
          break;
        case '53':
          relay.distance = 800;
          relay.relayStroke = 'Free';
          relay.relayGender = 'F';
          break;
        case '54':
          relay.distance = 800;
          relay.relayStroke = 'Free';
          relay.relayGender = 'M';
          break;
        case '55':
          relay.distance = 800;
          relay.relayStroke = 'Free';
          relay.relayGender = 'X';
          break;
      }
      return relay;
    });

    return swimmer;
  })

  const competitors = await Competitor.insertMany(swimmers);
  return competitors;
}

connection.once('open', async () => {
  console.log('Connected to DB');

  // seed the data from the VA members of the LMSC
  const members = await seedMembers();
  console.log(`${members.length} members added`);

  // seed Users data using some random USMS members
  const users = await seedUsers(members);
  console.log(`${users.length} users added`);

  // seed Competitors using 2024 SCY Zone Championship
  const competitors = await seedCompetitors();
  console.log(`${competitors.length} competitors added`);

  process.exit(0);
});
