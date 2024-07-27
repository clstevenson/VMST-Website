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
import { COLORS, QUERIES, WEIGHTS } from "../utils/constants";

export default function SinglePost() {
  // retrieve post ID from the route param
  const { id } = useParams();
  // query the DB for that post and store
  const { loading, data } = useQuery(QUERY_SINGLEPOST, {
    variables: { onePostId: id },
  });
  const post = data?.onePost;

  if (loading)
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    );
  else {
    return (
      <article>
        <figure>
          <img alt={post.photoCaption} src={post.photoURL} />
          <figcaption>{post.photoCaption}</figcaption>
        </figure>
        <h2>{post.title}</h2>
        {post.summary && (
          <div>
            <h3>Summary</h3>
            <p>{post.summary}</p>
          </div>
        )}

        <div>{post.content}</div>

        {post.comments.length > 0 && (
          <div>
            <h3>Comments</h3>
            <ul>
              {post.comments.map((comment) => {
                return (
                  <li key={comment._id}>
                    {comment.content} <br />
                    -- posted by {comment.user.firstName} on {comment.createdAt}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </article>
    );
  }
}

// want to center spinner on the viewport
const SpinnerWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
