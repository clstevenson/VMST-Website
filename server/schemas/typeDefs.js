const typeDefs = `
# formatValid: pure function of the address string, recomputed on every upload.
# deliverable: sticky -- true until the membership coordinator marks a
# specific address as bouncing/dead (see updateEmailDeliverability).
type EmailEntry {
  address: String!
  formatValid: Boolean!
  deliverable: Boolean!
}

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
  emails: [EmailEntry]
  emailExclude: Boolean
}

type User {
  _id: ID!
  firstName: String!
  lastName: String!
  email: String!
  role: String!
  group: String
  notifications: Boolean
  emailPermission: Boolean
  accountStatus: String
  emailVerified: Boolean!
  linkedMember: ID
}

# MeetSwimmer is embedded in Meet
type MeetSwimmer {
  _id: ID!
  firstName: String!
  lastName: String!
  gender: String!
  meetAge: Int!
  relays: [Int]
  usmsId: String
  includeEmail: Boolean
}

# Relay event object embedded in Meet
type Relay {
  _id: ID!
  eventNum: Int!
  distance: Int
  relayStroke: String
  relayGender: String
}

type Meet {
  _id: ID!
  meetName: String!
  course: String!
  startDate: String!
  endDate: String
  meetSwimmers: [MeetSwimmer]
  relayEvents: [Relay]
}

# Comments are embedded in Posts
type Comment {
  _id: ID!
  content: String!
  user: User
  createdAt: String
}

type Author {
  userId: ID!
}

type Post {
  _id: ID!
  title: String!
  summary: String
  content: String!
  createdAt: String
  posted: Boolean!
  postedAt: String
  pinned: Boolean!
  author: Author
  photo: Photo
  comments: [Comment]
}

# type for issuing tokens and user data
type Auth {
  token: ID!
  user: User
}

# rolling 24h recipient count against the daily Gmail sending limit
type EmailUsage {
  count: Int!
  limit: Int!
}
####### input data types for convenience

input UserData {
  firstName: String
  lastName: String
  email: String
  role: String
  group: String
  notifications: Boolean
  emailPermission: Boolean
  accountStatus: String
}

input MemberData {
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

input EmailDeliverabilityInput {
  usmsId: String!
  address: String!
  deliverable: Boolean!
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

input MeetData {
  meetName: String!
  course: String!
  startDate: String!
  endDate: String
}

input MeetSwimmerData {
  firstName: String!
  lastName: String!
  gender: String!
  meetAge: Int!
  relays: [Int]
  usmsId: String
  includeEmail: Boolean!
}

input RelayData {
  eventNum: Int!
  distance: Int
  relayStroke: String
  relayGender: String
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
  user(id: ID!): User
  emailExists(email: String!): User
  posts: [Post]
  onePost(id: String!): Post
  groups: [String]
  vmstMembers(workoutGroup: String): [Member]
  membersByUsmsId(usmsIds: [String]!): [Member]
  meets: [Meet]
  getLeaders: [User]
  users: [User]
  getAlbums(page: Int!, perPage: Int!): AlbumCollection
  getAlbumPhotos(id: String!, page: Int!, perPage: Int!): PhotoCollection
  getFeaturedPhotos(page: Int!, perPage: Int!): PhotoCollection
  getPhotos(page: Int!, perPage: Int!, search: String): PhotoCollection
  getPhotoSizes(id: String!): Photo
  getPhotoInfo(id: String!): Photo
  emailUsage: EmailUsage
}

type Mutation {
  login(email: String!, password: String!): Auth
  addUser(firstName: String!, lastName: String!, email: String!, password: String!): Auth
  editUser(_id: ID!, user: UserData): User
  deleteUser(_id: ID!): User
  resetPassword(email: String!): User
  changePassword(password: String!): User
  addPost(title: String!, summary: String, content: String!, photo: PhotoData, posted: Boolean): Post
  editPost(_id: ID!, title: String!, summary: String, content: String!, photo: PhotoData, posted: Boolean): Post
  deletePost(_id: ID!): Post
  addMeet(meet: MeetData, meetSwimmers: [MeetSwimmerData], relayEvents: [RelayData]): Meet
  deleteMeet(_id: ID!): Meet
  editMeet(_id: ID!, meet: MeetData, meetSwimmers: [MeetSwimmerData], relayEvents: [RelayData]): Meet
  uploadMembers(memberData: [MemberData]): [Member]
  updateEmailDeliverability(updates: [EmailDeliverabilityInput]): [Member]
  emailLeaders(emailData: emailData): Boolean
  emailWebmaster(emailData: emailData): Boolean
  emailLeadersWebmaster(emailData: emailData): Boolean
  emailGroup(emailData: emailData): Boolean
  unsubscribe(token: String!): Boolean
  verifyEmail(token: String!): Boolean
  resendVerificationEmail: Boolean
  linkMember(usmsId: String!): Member
  togglePin(_id: ID!): Post
}
`;

module.exports = typeDefs;
