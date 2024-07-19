/* 
 This component outputs an array of posts: images, title, (abbreviated) content, and post date. Only 2 lines of the content are rendered.

 Eventual improvements:
 - except props to limit to a subset of posts (by index? by date/date range?)
 - display summary if present instead of appreviated content
 */

import styled from "styled-components";

import { useQuery } from "@apollo/client";
import { QUERY_POSTS } from "../utils/queries";

import Spinner from "./Spinner";
import postPhotos from "../utils/post-photos";
import shuffle from "../utils/shuffle";
import { COLORS, QUERIES } from "../utils/constants";

// at some point will accept props capable of limiting
// the posts to a subset of all possible posts
export default function BlogPosts() {
  const { loading, data } = useQuery(QUERY_POSTS);
  const posts = data?.posts;

  if (loading)
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    );

  // randomize order of image array
  const shuffledImages = shuffle(postPhotos);

  return (
    // do not change to a wrapper HTML element unless you are willing
    // to move the grid layout to this component rather than the Home page
    <>
      {posts.map((post, index) => {
        // use modulo operator to repeat array if necessary
        const randomImage = shuffledImages[index % shuffledImages.length];
        return (
          <Post key={post._id}>
            <Image src={randomImage.url} alt={randomImage.alt} />
            <Title>{post.title}</Title>
            <Content>{post.content}</Content>
            <Date>Posted {post.createdAt}</Date>
          </Post>
        );
      })}
    </>
  );
}

// want to center spinner on the viewpor
const SpinnerWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Post = styled.article`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background-color: ${COLORS.accent[1]};
  position: relative;

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
`;

const Date = styled.p`
  font-size: 0.8rem;
  font-style: italic;
  line-height: 0;
  margin-top: auto;
  align-self: flex-end;
  transform: translate(8px, 12px);

  @media ${QUERIES.mobile} {
    transform: translate(0, 0);
  }
`;
