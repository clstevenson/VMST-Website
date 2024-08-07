const typeDefs = `
# Meet is embedded in Competitors
type Member {
  _id: ID!
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
  photo: Photo
  comments: [Comment]
}

# type for issuing tokens and user data
type Auth {
  token: ID!
  user: User
}
####### input data types for convenience

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

input emailData {
  from: String
  replyTo: String
  cc: String
  id: [ID]!
  subject: String!
  plainText: String
  html: String
}

input PostData {
  title: String!
  summary: String
  content: String!
  photoURL: String
  flickrURL: String
  caption: String
}

input PhotoData {
  id: String!
  caption: String
  url: String!
  flickrURL: String
}

############## start Flickr typedefs ##############
type PhotoSize {
  label: String!
  width: Int!
  height: Int!
  url: String!
}

type Photo {
  id: String!
  url: String!
  flickrURL: String!
  caption: String
  sizes: [PhotoSize]
}

type Album {
  id: String!
  caption: String
  url: String!
  flickrURL: String
}

type AlbumCollection {
  numAlbums: Int!
  pages: Int!
  flickrURL: String
  album: [Album]
}

type PhotoCollection {
  title: String
  numPhotos: Int!
  pages: Int!
  flickrURL: String
  photos: [Photo]
}
############## end Flickr typedefs ##############

type Query {
  members: [Member]
  users: [User]
  posts: [Post]
  onePost(id: String!): Post
  competitors: [Competitor]
  groups: [String]
  vmstMembers(workoutGroup: String): [Member]
  getLeaders: [User]
  getAlbums(page: Int!, perPage: Int!): AlbumCollection
  getAlbumPhotos(id: String!, page: Int!, perPage: Int!): PhotoCollection
  getFeaturedPhotos(page: Int!, perPage: Int!): PhotoCollection
  getPhotos(page: Int!, perPage: Int!, search: String): PhotoCollection
  getPhotoSizes(id: String!): Photo
  getPhotoInfo(id: String!): Photo
}

type Mutation {
  login(email: String!, password: String!): Auth
  addUser(firstName: String!, lastName: String!, email: String!, password: String!): Auth
  editUser(user: UserData): User
  resetPassword(email: String!): User
  changePassword(password: String!): User
  addPost(title: String!, summary: String, content: String!, photo: PhotoData): Post
  editPost(_id: ID!, title: String!, summary: String, content: String!, photo: PhotoData): Post
  deletePost(_id: ID!): Post
  uploadMembers(memberData: [MemberData]): [Member]
  emailLeaders(emailData: emailData): Boolean
  emailWebmaster(emailData: emailData): Boolean
  emailLeadersWebmaster(emailData: emailData): Boolean
  emailGroup(emailData: emailData): Boolean
}
`;

module.exports = typeDefs;
