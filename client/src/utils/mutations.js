import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
      }
    }
  }
`;

export const ADD_POST = gql`
  mutation Mutation($title: String!, $content: String!) {
    addPost(title: $title, content: $content) {
      _id
      title
      content
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
    addUser(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
      token
      user {
        _id
      }
    }
  }
`;

export const ADD_THOUGHT = gql`
  mutation addThought($thoughtText: String!) {
    addThought(thoughtText: $thoughtText) {
      _id
      thoughtText
      thoughtAuthor
      createdAt
      comments {
        _id
        commentText
      }
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation addComment($thoughtId: ID!, $commentText: String!) {
    addComment(thoughtId: $thoughtId, commentText: $commentText) {
      _id
      thoughtText
      thoughtAuthor
      createdAt
      comments {
        _id
        commentText
        createdAt
      }
    }
  }
`;

// upload CSV file with LMSC Membership data
// (only allowed for Membership Coordinator)
export const UPLOAD_MEMBERS=gql`
mutation UploadMembers($memberData: [MemberData]) {
  uploadMembers(memberData: $memberData) {
    usmsRegNo
    firstName
    lastName
    club
    workoutGroup
    regYear
  }
}`;

export const EMAIL_LEADERS=gql`
mutation EmailLeaders($emailData: emailData) {
  emailLeaders(emailData: $emailData)
}
`;
