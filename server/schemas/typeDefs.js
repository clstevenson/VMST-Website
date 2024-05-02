const typeDefs = `
# Meet is embedded in Competitors
type Member {
  usmsRegNo: String!
  usmsId: String!
  firstName: String!
  lastName: String!
  gender: String!
  club: String!
  workoutGroup: String
  regYear: Int!
  emails: [String]
  emailExclude: Boolean
}

type User {
  _id: ID!
  firstName: String!
  lastName: String!
  email: String!
  password: String!
  role: String!
  notifications: Boolean
  emailPermission: Boolean
}

type Meet {
  _id: ID!
  title: String!
  startDate: String!
  endDate: String
}

# Relay is embedded in Competitors
type Relay {
  _id: ID!
  eventNum: String!
  distance: Int
  relayStroke: String
  relayGender: String
}

type Competitor {
  _id: ID!
  firstName: String!
  lastName: String!
  gender: String!
  age: Int!
  meet: Meet!
  relay: [Relay]
  usmsId: String
}

# Comments are embedded in Posts
type Comment {
  _id: ID!
  content: String!
  user: User
  createdAt: String
}

type Post {
  _id: ID!
  title: String!
  summary: String
  content: String!
  createdAt: String
  comments: [Comment]
}

type Photo {
  _id: ID!
  url: String!
  caption: String
  names: [String]
  permission: Boolean
  uplodatedAt: String
  uploadedBy: ID
}

# type for issuing tokens and user data
type Auth {
  token: ID!
  user: User
}

input UserData {
  firstName: String
  lastName: String
  email: String
  password: String
  role: String
  notifications: Boolean
  emailPermission: Boolean
}

input MemberData {
  usmsRegNo: String!
  firstName: String!
  lastName: String!
  gender: String!
  club: String!
  workoutGroup: String
  regYear: Int!
  emails: [String]
  emailExclude: Boolean
}

type Query {
  members: [Member]
  users: [User]
  posts: [Post]
  onePost(id: String!): Post
  competitors: [Competitor]
  groups: [String]
  vmstMembers(workoutGroup: String): [Member]
}

type Mutation {
  login(email: String!, password: String!): Auth
  addUser(firstName: String!, lastName: String!, email: String!, password: String!): Auth
  editUser(user: UserData): User
  addPost(title: String!, summary: String, content: String!): Post
  uploadMembers(memberData: [MemberData]): [Member]
}
`;

module.exports = typeDefs;
