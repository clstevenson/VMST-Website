import { gql } from '@apollo/client';

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
