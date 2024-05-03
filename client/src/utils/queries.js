import { gql } from '@apollo/client';

export const QUERY_USER = gql`
  query user($username: String!) {
    user(username: $username) {
      _id
      username
      email
      thoughts {
        _id
        thoughtText
        createdAt
      }
    }
  }
`;

export const QUERY_POSTS = gql`
  query getPosts {
    posts {
      _id
      title
      content
  }
}
`;

export const QUERY_LEADERS=gql`
query GetLeaders {
  getLeaders {
    _id
    firstName
    lastName
  }
}
`;
