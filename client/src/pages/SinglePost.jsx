/*
 Display a single posts and its associated photo and any comments.
 */

import styled from "styled-components";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import * as Separator from "@radix-ui/react-separator";
import { Home, Trash2, Edit } from "react-feather";
import { Pin, PinOff } from "lucide-react";
import parse from "html-react-parser";

import { QUERY_SINGLEPOST } from "../utils/queries";
import { DELETE_POST, TOGGLE_PIN } from "../utils/mutations";
import sanitizeHtml from "../utils/sanitizeHtml";
import Spinner from "../components/Spinner";
import { COLORS, QUERIES } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import ToastMessage from "../components/ToastMessage";
import Alert from "../components/Alert";
import ErrorMessage from "../components/Styled/ErrorMessage";

export default function SinglePost() {
  // user's can add, edit, or delete posts
  const { user } = useAuth();
  const isLeader = user?.role === "leader";
  const canPost = isLeader || user?.role === "coach";
  // toggle to display Toast confirming deletion
  const [deleted, setDeleted] = useState(false);
  // toggle to display alert to confirm post deletion
  const [alertOpen, setAlertOpen] = useState(false);
  // error message from a failed pin/unpin attempt (e.g. 2-pin cap)
  const [pinError, setPinError] = useState("");

  // retrieve post ID from the route param
  const { id } = useParams();
  // query the DB for that post and store
  const { loading, data } = useQuery(QUERY_SINGLEPOST, {
    variables: { postId: id },
  });
  const post = data?.onePost;

  const [deletePost] = useMutation(DELETE_POST);
  const [togglePin] = useMutation(TOGGLE_PIN);
  const navigate = useNavigate();

  const handleTogglePin = async () => {
    setPinError("");
    try {
      await togglePin({ variables: { id } });
    } catch (error) {
      setPinError(error.message);
    }
  };

  const handleDeletePost = () => {
    try {
      const deletedPost = deletePost({ variables: { id } });

      if (deletedPost) {
        // trigger Toast message which navigates back to home page on close
        setDeleted(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (loading)
    // early return while loading
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    );

  // null here means either a bad/stale ID, or (deliberately) a draft this
  // visitor isn't the author of -- same message either way, so a draft's
  // existence isn't leaked to non-authors
  if (!post) {
    return (
      <Wrapper>
        <NotFound>
          Sorry, this post could not be found. <Link to="/">Return home</Link>
        </NotFound>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <PostWrapper>
        <Article>
          <Title>{post.title}</Title>

          <ContentWrapper>{parse(sanitizeHtml(post.content))}</ContentWrapper>
          <Attribution>-- posted on {post.createdAt}</Attribution>

          {/*
           Eventually will have comment functionality but for now
           let's not try to display them
           */}
          {/*
          {post.comments.length > 0 && (
            <CommentsWrapper>
              <CommentSeparator />
              <ul>
                {post.comments.map((comment) => {
                  return (
                    <li key={comment._id}>
                      &quot;{comment.content}&quot;
                      <Attribution>
                        -- comment posted by {comment.user.firstName} on{" "}
                        {comment.createdAt}
                      </Attribution>
                    </li>
                  );
                })}
              </ul>
            </CommentsWrapper>
          )}
                        */}
        </Article>
        {post.photo && (
          <Figure>
            <a href={post.photo.flickrURL} target="_new">
              <img alt={post.photo.caption} src={post.photo.url} />
            </a>
            <figcaption>{post.photo.caption}</figcaption>
          </Figure>
        )}
      </PostWrapper>
      <FooterWrapper>
        {canPost && (
          <>
            <IconButton>
              <Edit
                onClick={() => {
                  navigate(`/post/${id}/edit`);
                }}
              />{" "}
              Edit
            </IconButton>
            <Alert
              title="Delete Post"
              description="Are you sure? This action cannot be undone."
              confirmAction={() => {
                setAlertOpen(false);
                handleDeletePost();
              }}
              cancelAction={() => setAlertOpen(false)}
              actionText="Delete"
              onOpenChange={setAlertOpen}
              open={alertOpen}
            >
              <IconButton>
                <Trash2 /> Delete
              </IconButton>
            </Alert>
            {isLeader && post.posted && (
              <IconButton onClick={handleTogglePin}>
                {post.pinned ? <PinOff /> : <Pin />}
                {post.pinned ? "Unpin" : "Pin"}
              </IconButton>
            )}
          </>
        )}
        <IconButton onClick={() => navigate("/")}>
          <Home /> Home
        </IconButton>
      </FooterWrapper>
      {pinError && <PinError>{pinError}</PinError>}
      {deleted && (
        <ToastMessage
          duration={1000}
          toastCloseEffect={() => {
            // TODO: better manage memory cache and then use react-router's navigate
            // navigate("/");
            location = "/";
          }}
        >
          The post has been deleted. Returning home...
        </ToastMessage>
      )}
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
  margin: 0 auto;

  & img {
    width: 100%;
  }
  & figcaption {
    font-style: italic;
  }

  & a:hover {
    outline: auto;
  }

  @media ${QUERIES.mobile} {
    min-width: 300px;
  }
`;

const Article = styled.article`
  flex: 3;
  min-width: 400px;
  margin: 0 auto;
  max-width: 70ch;

  p {
    margin-block: 0.75em;
  }

  @media ${QUERIES.mobile} {
    min-width: 300px;
  }
`;

// this wraps around HTML content
const ContentWrapper = styled.div`
  margin: 16px 0;
  width: 100%;
  overflow-wrap: break-word;
  word-break: normal;
  hyphens: none;

  /* Standalone (unaligned) images: centered block */
  & img {
    max-width: 100%;
    display: block;
    margin: 16px auto;
  }

  /* Alignment wrappers produced by quill-blot-formatter2.
     Images are blocks with no text wrap; left/center/right means where
     the block sits horizontally, not which side text floats around. */
  & [class^="ql-image-align-"] {
    display: flex;
    flex-wrap: wrap;
    width: var(--resize-width, auto);
    max-width: 100%;
    margin: 16px 0;
  }

  & [class^="ql-image-align-"] > img {
    flex: 1 1 auto;
    display: block;
    max-width: 100%;
    margin: 0;
  }

  & .ql-image-align-left {
    margin-right: auto;
  }

  & .ql-image-align-center {
    margin: 16px auto;
  }

  & .ql-image-align-right {
    margin-left: auto;
  }

  /* Responsive width expansion on small screens, only for percentage-based
     resizes (data-relative="true" is set by the formatter in that case) */
  @media (max-width: 900px) {
    & [class^="ql-image-align-"][data-relative="true"] {
      width: calc(var(--resize-width) + 20%);
    }
  }
  @media (max-width: 800px) {
    & [class^="ql-image-align-"][data-relative="true"] {
      width: calc(var(--resize-width) + 40%);
    }
  }
  @media (max-width: 700px) {
    & [class^="ql-image-align-"][data-relative="true"] {
      width: calc(var(--resize-width) + 60%);
    }
  }
  @media (max-width: 600px) {
    & [class^="ql-image-align-"][data-relative="true"] {
      width: calc(var(--resize-width) + 80%);
    }
  }
  @media (max-width: 500px) {
    & [class^="ql-image-align-"][data-relative="true"] {
      width: 100%;
    }
  }

  & h1 {
    font-size: 1.2rem;
  }
  & h2 {
    font-size: 1.15rem;
  }
  & h3 {
    font-size: 1.1rem;
  }
  & h4,
  & h5,
  & h6 {
    font-size: 1.05rem;
  }
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
  clear: both;
`;

const CommentsWrapper = styled.div`
  width: 100%;

  & ul {
    list-style-type: none;
    padding-left: 0;
  }

  & li {
    margin: 16px 0;
  }
`;

const Attribution = styled.p`
  font-size: 0.9rem;
  font-style: italic;
  text-align: right;
  padding-right: 32px;
`;

const NotFound = styled.p`
  text-align: center;
  padding: 16px 0;
`;

const PinError = styled(ErrorMessage)`
  text-align: center;
`;

const FooterWrapper = styled.div`
  width: fit-content;
  color: ${COLORS.accent[12]};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  margin-top: 32px;

  & svg {
    width: 48px;
    height: 48px;
    stroke-width: 1.5;
    padding: 8px;
  }
`;

const IconButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: transparent;
  border: none;
  padding: 4px 8px;
  line-height: 1;

  &:hover {
    transform: scale(1.1);
    color: ${COLORS.accent[9]};
    cursor: pointer;
  }
  &:hover svg {
    stroke-width: 2;
  }
`;
