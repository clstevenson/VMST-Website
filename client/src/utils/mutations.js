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
    $posted: Boolean
  ) {
    addPost(
      title: $title
      summary: $summary
      content: $content
      photo: $photo
      posted: $posted
    ) {
      _id
      title
      summary
      content
      posted
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
    $posted: Boolean
  ) {
    editPost(
      _id: $id
      title: $title
      content: $content
      summary: $summary
      photo: $photo
      posted: $posted
    ) {
      _id
      posted
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

export const UNSUBSCRIBE = gql`
  mutation Unsubscribe($token: String!) {
    unsubscribe(token: $token)
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
      accountStatus
    }
  }
`;

// webmaster only
export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(_id: $id) {
      _id
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
      emailExclude
      emails {
        address
        formatValid
        deliverable
      }
    }
  }
`;

export const UPDATE_EMAIL_DELIVERABILITY = gql`
  mutation UpdateEmailDeliverability($updates: [EmailDeliverabilityInput]) {
    updateEmailDeliverability(updates: $updates) {
      usmsId
      emails {
        address
        deliverable
      }
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
    $meetSwimmers: [MeetSwimmerData]
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
    $meetSwimmers: [MeetSwimmerData]
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
