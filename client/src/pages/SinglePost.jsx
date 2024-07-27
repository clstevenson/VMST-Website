/*
 Display a single posts and its comments. Input prop is the post ID.

 Need to display:
 - post photo
 - post title
 - when the post happened
 - post summary and content
 - any comments associated with the post
 */

import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_SINGLEPOST } from "../utils/queries";
import Spinner from "../components/Spinner";
import { COLORS, QUERIES } from "../utils/constants";
import * as Separator from "@radix-ui/react-separator";
import { ChevronLeft, ChevronRight, Home } from "react-feather";

export default function SinglePost() {
  // retrieve post ID from the route param
  const { id } = useParams();
  // query the DB for that post and store
  const { loading, data } = useQuery(QUERY_SINGLEPOST, {
    variables: { onePostId: id },
  });
  const post = data?.onePost;

  if (loading)
    // early return while loading
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    );
  return (
    <Wrapper>
      <PostWrapper>
        <Article>
          <Title>{post.title}</Title>
          {post.summary && (
            <div>
              <h3>Summary</h3>
              <p>{post.summary}</p>
            </div>
          )}

          <ContentWrapper>{post.content}</ContentWrapper>

          {post.comments.length > 0 && (
            <CommentsWrapper>
              <CommentSeparator />
              <ul>
                {post.comments.map((comment) => {
                  return (
                    <li key={comment._id}>
                      &quot;{comment.content}&quot;
                      <CommentAttribution>
                        -- posted by {comment.user.firstName} on{" "}
                        {comment.createdAt}
                      </CommentAttribution>
                    </li>
                  );
                })}
              </ul>
            </CommentsWrapper>
          )}
        </Article>
        <Figure>
          <img alt={post.photoCaption} src={post.photoURL} />
          <figcaption>{post.photoCaption}</figcaption>
        </Figure>
      </PostWrapper>
      <PostNav>
        <ChevronLeft />
        <Home />
        <ChevronRight />
      </PostNav>
    </Wrapper>
  );
}

// want to center spinner on the viewport
const SpinnerWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Wrapper = styled.div`
  margin: 32px 0;
  background-color: ${COLORS.accent[3]};
  border: 1px solid ${COLORS.accent[12]};
  padding: 16px;
  border-radius: 8px;
  box-shadow: 2px 4px 8px ${COLORS.gray[10]};
`;

const PostWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
`;

const Figure = styled.figure`
  flex: 2;
  min-width: 400px;
  max-width: 700px;
  & img {
    width: 100%;
    object-fit: cover;
  }
  & figcaption {
    font-style: italic;
  }

  @media ${QUERIES.mobile} {
    min-width: 300px;
  }
`;

const Article = styled.article`
  flex: 3;
  min-width: 400px;

  @media ${QUERIES.mobile} {
    min-width: 300px;
  }
`;

// eventually this will wrap around HTML content, need to possibly adjust at that point
const ContentWrapper = styled.div`
  margin: 16px 0;
`;

const Title = styled.h2`
  font-size: var(--subheading-size);
  color: ${COLORS.accent[12]};
  margin-bottom: 16px;
`;

const CommentSeparator = styled(Separator.Root)`
  height: 1px;
  width: 60%;
  background-color: ${COLORS.gray[9]};
  margin: 16px auto;
`;

const CommentsWrapper = styled.div`
  & ul {
    list-style-type: none;
    padding-left: 0;
  }

  & li {
    margin: 16px 0;
  }
`;

const CommentAttribution = styled.p`
  font-size: 0.9rem;
  font-style: italic;
  text-align: right;
  padding-right: 32px;
`;

const PostNav = styled.nav`
  display: flex;
  gap: 48px;
  justify-content: center;
  margin-top: 48px;

  & svg {
    width: 48px;
    height: 48px;
    stroke-width: 1.5;
    padding: 8px;
  }
  & svg:hover {
    transform: scale(1.1);
    stroke-width: 2;
    cursor: pointer;
    color: ${COLORS.accent[8]};
  }
`;
