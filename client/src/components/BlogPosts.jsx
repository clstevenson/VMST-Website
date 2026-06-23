/* 
 This component outputs an array of posts: images, title, (abbreviated) content, and post date. Only 2 lines of the content are rendered.

 Eventual improvements:
 - except props to limit to a subset of posts (by index? by date/date range?)
 - display summary if present instead of appreviated content
 */

import { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import parse from "html-react-parser";
import { useQuery } from "@apollo/client";
import { Pin } from "lucide-react";
import { QUERY_POSTS } from "../utils/queries";
import sanitizeHtml from "../utils/sanitizeHtml";

import Spinner from "./Spinner";
import PaginationNav from "./PaginationNav";
import PostsPerPage from "./PostsPerPage";
import { COLORS, QUERIES } from "../utils/constants";

// at some point will accept props capable of limiting
// the posts to a subset of all possible posts
export default function BlogPosts() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(3);

  // cache-and-network so a pin/unpin elsewhere is reflected in sort order
  // (not just the pinned badge) the next time this page is visited, rather
  // than serving the previously-fetched, now-stale-ordered list from cache
  const { loading, data } = useQuery(QUERY_POSTS, {
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) {
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    );
  }

  const posts = data?.posts ?? [];
  const maxPages = Math.max(1, Math.ceil(posts.length / perPage));
  const pagedPosts = posts.slice((page - 1) * perPage, page * perPage);

  return (
    // do not change to a wrapper HTML element unless you are willing
    // to move the grid layout to this component rather than the Home page
    <>
      {pagedPosts.map((post) => {
        return (
          <Post key={post._id} to={`/post/${post._id}`} $draft={!post.posted}>
            {post.pinned && (
              <PinBadge title="Pinned post">
                <Pin size={16} />
              </PinBadge>
            )}
            {post.photo && (
              <Image src={post.photo.url} alt={post.photo.caption} />
            )}
            <Title>{!post.posted && "DRAFT: "}{post.title}</Title>
            {post.summary ? (
              <Content>{post.summary}</Content>
            ) : (
              <Content>{parse(sanitizeHtml(post.content))}</Content>
            )}
            <Date>Posted {post.createdAt}</Date>
          </Post>
        );
      })}
      {/* no pagination clutter when everything already fits on one page */}
      {maxPages > 1 && (
        <PaginationRow>
          <PaginationNav
            page={page}
            setPage={setPage}
            maxPages={maxPages}
            displayJump={false}
          />
          <PostsPerPage
            perPage={perPage}
            setPerPage={setPerPage}
            setPage={setPage}
          />
        </PaginationRow>
      )}
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
  background-color: ${(props) =>
    props.$draft ? COLORS.urgent_light : COLORS.accent[1]};
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

// spans the full width of the parent grid (Home.jsx's PostWrapper) since
// this component renders as a fragment, so this row is a sibling grid item
// alongside the post cards rather than nested inside its own container
const PaginationRow = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 4px 0;
`;

const PinBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  padding: 4px;
  background-color: white;
  color: ${COLORS.accent[9]};
  border-radius: 50%;
  box-shadow: 1px 1px 3px ${COLORS.gray[8]};
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
const Content = styled.div`
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
