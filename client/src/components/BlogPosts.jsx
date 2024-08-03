/* 
 This component outputs an array of posts: images, title, (abbreviated) content, and post date. Only 2 lines of the content are rendered.

 Eventual improvements:
 - except props to limit to a subset of posts (by index? by date/date range?)
 - display summary if present instead of appreviated content
 */

import styled from "styled-components";
import { Link } from "react-router-dom";

import { useQuery } from "@apollo/client";
import { QUERY_POSTS } from "../utils/queries";

import Spinner from "./Spinner";
import { COLORS, QUERIES } from "../utils/constants";

// at some point will accept props capable of limiting
// the posts to a subset of all possible posts
export default function BlogPosts() {
  const { loading, data } = useQuery(QUERY_POSTS);
  const posts = data?.posts;

  if (loading) {
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    );
  }

  return (
    // do not change to a wrapper HTML element unless you are willing
    // to move the grid layout to this component rather than the Home page
    <>
      {posts.map((post) => {
        return (
          <Post key={post._id} to={`/post/${post._id}`}>
            {post.photo && (
              <Image src={post.photo.url} alt={post.photo.caption} />
            )}
            <Title>{post.title}</Title>
            {post.summary ? (
              <Content>{post.summary}</Content>
            ) : (
              <Content>{post.content}</Content>
            )}
            <Date>Posted {post.createdAt}</Date>
          </Post>
        );
      })}
    </>
  );
}

// want to center spinner on the viewport
const SpinnerWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Post = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background-color: ${COLORS.accent[1]};
  position: relative;
  border: 1px solid ${COLORS.gray[8]};
  border-radius: 4px;
  box-shadow: 1px 2px 4px ${COLORS.gray[8]};

  &:hover {
    background-color: ${COLORS.accent[3]};
    /* mimics a link to the full post, which isn't in place yet */
    /* outline: auto; */
    /* cursor: pointer; */
  }

  @media ${QUERIES.mobile} {
    padding: 8px;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  color: ${COLORS.accent[9]};
`;

// limit to 2 lines of text, with ellipses...
const Content = styled.p`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${COLORS.accent[12]};
`;

const Date = styled.p`
  font-size: 0.8rem;
  font-style: italic;
  line-height: 0;
  margin-top: auto;
  align-self: flex-end;
  transform: translate(8px, 12px);
  color: ${COLORS.accent[12]};

  @media ${QUERIES.mobile} {
    transform: translate(0, 0);
  }
`;
