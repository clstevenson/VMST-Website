const connection = require('../config/connection');
const { Member, User } = require('../models');
// Membership Data as of 04/28/24 (with emails replaced)
const memberData = require('../seeders/members.json');

connection.on('error', (err) => err);

connection.once('open', async () => {
  console.log('Connected to DB');
  // delete the members collection if it exists
  let membersCheck = await connection.db.listCollections({ name: 'members' }).toArray();
  if (membersCheck.length) {
    await connection.dropCollection('members');
  }

  lmscMembers = memberData.map(member => {
    if (member.emails) {
      member.emails = member.emails.split(', ');
    } else {
      member.emails = [];
    }
    return member;
  });

  // add to the members collection
  const members = await Member.insertMany(lmscMembers);

  // if the users collection exists, delte it
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
  const users = await User.insertMany(userData);

  process.exit(0);
});
