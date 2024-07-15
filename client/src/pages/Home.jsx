import styled from "styled-components";
import BlogPosts from "../components/BlogPosts/index";
import { COLORS } from "../utils/constants";

export default function Home() {
  return (
    <Wrapper>
      <Title>Check out the latest news from VMST!</Title>
      <PostWrapper>
        {/* Will want 1-2 "featured" posts */}
        {/* The rest will be photos and titles only (I think) */}
        {/* Photos are optional */}
        <BlogPosts />
      </PostWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const PostWrapper = styled.div``;

const Title = styled.h2`
  color: ${COLORS.accent[12]};
  font-size: 1.4em;
`;
