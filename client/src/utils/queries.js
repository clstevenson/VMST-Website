import { gql } from "@apollo/client";

export const QUERY_USER = gql`
  query getUser($id: ID) {
    users(id: $id) {
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

export const QUERY_EMAIL = gql`
  query EmailExists($email: String!) {
    emailExists(email: $email) {
      _id
    }
  }
`;

export const QUERY_POSTS = gql`
  query getPosts {
    posts {
      _id
      title
      summary
      content
      createdAt
      photo {
        id
        caption
        url
        flickrURL
      }
    }
  }
`;

export const QUERY_SINGLEPOST = gql`
  query OnePost($postId: String!) {
    onePost(id: $postId) {
      _id
      title
      summary
      content
      createdAt
      photo {
        id
        caption
        url
        flickrURL
      }
      comments {
        _id
        content
        createdAt
        user {
          _id
          firstName
          lastName
        }
      }
    }
  }
`;

export const QUERY_LEADERS = gql`
  query GetLeaders {
    getLeaders {
      _id
      firstName
      lastName
    }
  }
`;

// query called by membership coordinator
export const QUERY_MEMBERS = gql`
  query Members {
    members {
      usmsRegNo
      usmsId
      firstName
      lastName
      gender
      club
      workoutGroup
      regYear
      emails
      emailExclude
    }
  }
`;

// query called by team leaders and WO group coaches
export const QUERY_VMST = gql`
  query GetVMST {
    vmstMembers {
      _id
      usmsId
      firstName
      lastName
      gender
      workoutGroup
      regYear
      emailExclude
    }
  }
`;

// get a list of meets that have been saved into memory
export const QUERY_MEETS = gql`
  query getMeets {
    meets {
      _id
      meetName
      course
      startDate
      endDate
      meetSwimmers {
        _id
        firstName
        lastName
        gender
        meetAge
        relays
        usmsId
        includeEmail
      }
      relays {
        _id
        eventNum
        distance
        relayStroke
        relayGender
      }
    }
  }
`;

export const QUERY_FEATUREDPHOTOS = gql`
  query GetFeaturedPhotos($page: Int!, $perPage: Int!) {
    getFeaturedPhotos(page: $page, perPage: $perPage) {
      numPhotos
      pages
      flickrURL
      photos {
        id
        caption
        url
        flickrURL
      }
    }
  }
`;

export const QUERY_ALBUMS = gql`
  query GetAlbums($page: Int!, $perPage: Int!) {
    getAlbums(page: $page, perPage: $perPage) {
      numAlbums
      pages
      flickrURL
      album {
        id
        caption
        url
        flickrURL
      }
    }
  }
`;

export const QUERY_ALBUMPHOTOS = gql`
  query GetAlbumPhotos($albumId: String!, $page: Int!, $perPage: Int!) {
    getAlbumPhotos(id: $albumId, page: $page, perPage: $perPage) {
      title
      pages
      photos {
        id
        url
        flickrURL
        caption
      }
    }
  }
`;

export const QUERY_PHOTOS = gql`
  query GetPhotos($page: Int!, $perPage: Int!) {
    getPhotos(page: $page, perPage: $perPage) {
      title
      numPhotos
      pages
      flickrURL
      photos {
        id
        caption
        url
        flickrURL
      }
    }
  }
`;
