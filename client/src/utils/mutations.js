import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export const ADD_POST = gql`
  mutation AddPost(
    $title: String!
    $summary: String
    $content: String!
    $photo: PhotoData
  ) {
    addPost(
      title: $title
      summary: $summary
      content: $content
      photo: $photo
    ) {
      _id
      title
      summary
      content
      photo {
        url
        caption
        flickrURL
      }
    }
  }
`;

export const EDIT_POST = gql`
  mutation EditPost(
    $id: ID!
    $title: String!
    $content: String!
    $summary: String
    $photo: PhotoData
  ) {
    editPost(
      _id: $id
      title: $title
      content: $content
      summary: $summary
      photo: $photo
    ) {
      _id
      photo {
        id
      }
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(_id: $id) {
      _id
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
  ) {
    addUser(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
    ) {
      token
      user {
        _id
      }
    }
  }
`;

export const EDIT_USER = gql`
  mutation EditUser($id: ID!, $user: UserData) {
    editUser(_id: $id, user: $user) {
      firstName
      lastName
      email
      role
      group
      notifications
      emailPermission
    }
  }
`;

// upload CSV file with LMSC Membership data
// (only allowed for Membership Coordinator)
export const UPLOAD_MEMBERS = gql`
  mutation UploadMembers($memberData: [MemberData]) {
    uploadMembers(memberData: $memberData) {
      usmsRegNo
      usmsId
      firstName
      lastName
      club
      workoutGroup
      regYear
    }
  }
`;

export const EMAIL_LEADERS = gql`
  mutation EmailLeaders($emailData: emailData) {
    emailLeaders(emailData: $emailData)
  }
`;

export const EMAIL_LEADERSWEBMASTER = gql`
  mutation EmailLeadersWebmaster($emailData: emailData) {
    emailLeadersWebmaster(emailData: $emailData)
  }
`;

export const EMAIL_WEBMASTER = gql`
  mutation EmailWebmaster($emailData: emailData) {
    emailWebmaster(emailData: $emailData)
  }
`;

export const EMAIL_GROUP = gql`
  mutation EmailGroup($emailData: emailData) {
    emailGroup(emailData: $emailData)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($email: String!) {
    resetPassword(email: $email) {
      email
      firstName
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($password: String!) {
    changePassword(password: $password) {
      firstName
      lastName
      email
      role
      notifications
      emailPermission
    }
  }
`;

export const ADD_MEET = gql`
  mutation AddMeet(
    $meet: MeetData
    $meetSwimmers: [CompetitorData]
    $relays: [RelayData]
  ) {
    addMeet(meet: $meet, meetSwimmers: $meetSwimmers, relays: $relays) {
      _id
      meetName
      course
      startDate
      endDate
    }
  }
`;

export const EDIT_MEET = gql`
  mutation EditMeet(
    $id: ID!
    $meet: MeetData
    $meetSwimmers: [CompetitorData]
    $relays: [RelayData]
  ) {
    editMeet(
      _id: $id
      meet: $meet
      meetSwimmers: $meetSwimmers
      relays: $relays
    ) {
      _id
      course
      meetName
      startDate
    }
  }
`;

export const DELETE_MEET = gql`
  mutation DeleteMeet($id: ID!) {
    deleteMeet(_id: $id) {
      _id
      meetName
      course
      startDate
    }
  }
`;
