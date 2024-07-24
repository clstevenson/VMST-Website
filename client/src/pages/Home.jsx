/*
 Display posts, allowing the display of single posts at some point.

 TODO: Eventually add the ability to search and filter:
 - search titles and content (or just leave it at both)
 - control how many posts are displayed, allowing for pagination
 - filter by date
 - maybe eventually allow tags on posts?
 */

import styled from "styled-components";
import BlogPosts from "../components/BlogPosts";
import { COLORS, QUERIES } from "../utils/constants";

export default function Home() {
  return (
    <Wrapper>
      <Title>Check out the latest from VMST!</Title>
      <PostWrapper>
        {/* Will want 1-2 "featured" posts */}
        {/* The rest will be photos and titles only (I think) */}
        {/* Photos are optional */}
        <BlogPosts />
      </PostWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 8px 0;

  @media ${QUERIES.mobile} {
    margin: 2px 0;
  }
`;

const PostWrapper = styled.div`
  display: grid;
  gap: 8px;
  margin: 2px;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));

  @media ${QUERIES.mobile} {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
`;

const Title = styled.h2`
  color: ${COLORS.accent[12]};
  font-size: 1.4em;
  padding-bottom: 8px;
`;
