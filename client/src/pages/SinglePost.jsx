/*
 Display a single posts and its associated photo and any comments.
 */

import styled from "styled-components";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import * as Separator from "@radix-ui/react-separator";
import { Home, Trash2, Edit } from "react-feather";

import { QUERY_SINGLEPOST } from "../utils/queries";
import { DELETE_POST } from "../utils/mutations";
import Spinner from "../components/Spinner";
import { COLORS, QUERIES } from "../utils/constants";
import Auth from "../utils/auth";
import ToastMessage from "../components/ToastMessage";
import * as ModalStyles from "../components/Styled/ModalStyles";
import Alert from "../components/Alert";

export default function SinglePost() {
  const [role, setRole] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [changed, setChanged] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  // retrieve post ID from the route param
  const { id } = useParams();
  // query the DB for that post and store
  const { loading, data } = useQuery(QUERY_SINGLEPOST, {
    variables: { onePostId: id },
  });
  const post = data?.onePost;

  const [deletePost] = useMutation(DELETE_POST);
  const navigate = useNavigate();

  useEffect(() => {
    if (Auth.loggedIn()) {
      const { data: userProfile } = Auth.getProfile();
      setRole(userProfile.role);
    }
  }, []);

  const handleDeletePost = () => {
    // need an alert dialog for user to confirm

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

  return (
    <Wrapper>
      <PostWrapper>
        <Article>
          <Title>{post.title}</Title>

          <ContentWrapper>{post.content}</ContentWrapper>
          <Attribution>-- posted on {post.createdAt}</Attribution>

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
        {role === "leader" && (
          <>
            <IconButton>
              <Edit /> Edit
            </IconButton>
            <Alert
              title="Delete Post"
              description="Are you sure? This action cannot be undone."
              confirmAction={() => {
                setAlertOpen(false);
                handleDeletePost();
              }}
              actionText="Delete"
              onOpenChange={setAlertOpen}
              open={alertOpen}
            >
              <IconButton>
                <Trash2 /> Delete
              </IconButton>
            </Alert>
          </>
        )}
        <IconButton onClick={() => navigate("/")}>
          <Home /> Home
        </IconButton>
      </FooterWrapper>
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
      {changed && (
        <ToastMessage
          duration={1000}
          toastCloseEffect={() => {
            // TODO: better manage memory cache and then use react-router's navigate
            // navigate("/");
            location = "/";
          }}
        >
          Post changes have been saved. Returning home...
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

  @media ${QUERIES.mobile} {
    min-width: 300px;
  }
`;

// eventually this will wrap around HTML content, need to possibly adjust at that point
const ContentWrapper = styled.div`
  margin: 16px 0;
  width: 100%;
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
  }
  &:hover svg {
    stroke-width: 2;
  }
`;
