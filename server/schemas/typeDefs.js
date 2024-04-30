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
  userId: ID!
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

type Query {
  members: [Member]
  users: [User]
  posts: [Post]
  competitors: [Competitor]
}

type Mutation {
  login(email: String!, password: String!): Auth
}
`;

module.exports = typeDefs;
