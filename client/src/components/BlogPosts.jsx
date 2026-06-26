/* 
 This component outputs an array of posts: images, title, (abbreviated) content, and post date. Only 2 lines of the content are rendered.

 Eventual improvements:
 - except props to limit to a subset of posts (by index? by date/date range?)
 - display summary if present instead of appreviated content
 */

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import parse from "html-react-parser";
import { useQuery } from "@apollo/client";
import { Pin, Search } from "lucide-react";
import { QUERY_POSTS } from "../utils/queries";
import { useAuth } from "../context/AuthContext";
import sanitizeHtml from "../utils/sanitizeHtml";

import Spinner from "./Spinner";
import PaginationNav from "./PaginationNav";
import PostsPerPage from "./PostsPerPage";
import { COLORS, QUERIES } from "../utils/constants";

const PER_PAGE_OPTIONS = [3, 6, 9, 12];
const PER_PAGE_STORAGE_KEY = "postsPerPage";

function initialPerPage() {
  const stored = parseInt(localStorage.getItem(PER_PAGE_STORAGE_KEY), 10);
  return PER_PAGE_OPTIONS.includes(stored) ? stored : 3;
}

// used only to match search text against the post body, not for display
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, "");
}

// at some point will accept props capable of limiting
// the posts to a subset of all possible posts
export default function BlogPosts() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [search, setSearch] = useState("");
  const { user: userProfile, isLoading } = useAuth();

  // remember the user's preferred page size across visits
  useEffect(() => {
    localStorage.setItem(PER_PAGE_STORAGE_KEY, String(perPage));
  }, [perPage]);

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

  const query = search.trim().toLowerCase();
  const filteredPosts = query
    ? posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.summary?.toLowerCase().includes(query) ||
          stripHtml(post.content).toLowerCase().includes(query),
      )
    : posts;

  const maxPages = Math.max(1, Math.ceil(filteredPosts.length / perPage));
  const pagedPosts = filteredPosts.slice((page - 1) * perPage, page * perPage);

  const handleSearchChange = (evt) => {
    setSearch(evt.target.value);
    setPage(1);
  };

  const handleSearchKeyDown = (evt) => {
    if (evt.key === "Escape") {
      setSearch("");
      setPage(1);
    }
  };

  return (
    // do not change to a wrapper HTML element unless you are willing
    // to move the grid layout to this component rather than the Home page
    <>
      {pagedPosts.map((post) => {
        return (
          <Post key={post._id} to={`/post/${post._id}`} $draft={!post.posted}>
            {post.pinned && userProfile?.role === "leader" && (
              <PinBadge title="Pinned post">
                <Pin size={16} />
              </PinBadge>
            )}
            {post.photo && (
              <Image src={post.photo.url} alt={post.photo.caption} />
            )}
            <Title>
              {!post.posted && "DRAFT: "}
              {post.title}
            </Title>
            {post.summary ? (
              <Content>{post.summary}</Content>
            ) : (
              <Content>{parse(sanitizeHtml(post.content))}</Content>
            )}
            <Date>Posted {post.createdAt}</Date>
          </Post>
        );
      })}
      {query && pagedPosts.length === 0 && (
        <NoResults>No posts match &quot;{search}&quot;.</NoResults>
      )}
      {/* search has value even with few posts; pagination controls
          only add value (and are only shown) once there's more than
          one page of results */}
      {posts.length > 0 && (
        <PaginationRow>
          <SearchWrapper>
            <Search size={18} />
            <SearchInput
              type="text"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search posts"
              aria-label="Search posts"
            />
          </SearchWrapper>
          {maxPages > 1 && (
            <NavWrapper>
              <PaginationNav
                page={page}
                setPage={setPage}
                maxPages={maxPages}
                displayJump={false}
              />
            </NavWrapper>
          )}
          {maxPages > 1 && (
            <PerPageWrapper>
              <PostsPerPage
                perPage={perPage}
                setPerPage={setPerPage}
                setPage={setPage}
              />
            </PerPageWrapper>
          )}
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
// alongside the post cards rather than nested inside its own container.
// the outer 1fr columns are equal, so the middle (nav) column is always
// truly centered on the row regardless of how wide search/per-page are
const PaginationRow = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  margin: 4px 0;

  @media ${QUERIES.mobile} {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const NavWrapper = styled.div`
  justify-self: center;
`;

const PerPageWrapper = styled.div`
  justify-self: end;
`;

const NoResults = styled.p`
  grid-column: 1 / -1;
  text-align: center;
  padding: 16px 0;
  font-style: italic;
  color: ${COLORS.accent[12]};
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-self: start;
  color: ${COLORS.accent[9]};
`;

const SearchInput = styled.input`
  border: 1px solid ${COLORS.gray[8]};
  background-color: ${COLORS.accent[2]};
  padding: 4px 8px;
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
  overflow-wrap: break-word;
  word-break: normal;
  hyphens: none;
`;

// limit to 2 lines of text, with ellipses...
const Content = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${COLORS.accent[12]};
  overflow-wrap: break-word;
  word-break: normal;
  hyphens: none;
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
