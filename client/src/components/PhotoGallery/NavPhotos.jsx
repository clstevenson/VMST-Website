import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "react-feather";
import { COLORS } from "../../utils/constants";

export default function NavPhotos({ page, setPage, maxPages }) {
  const nextPage = () => {
    if (page === maxPages) setPage(1);
    else setPage(page + 1);
  };
  const previousPage = () => {
    if (page === 1) setPage(maxPages);
    else setPage(page - 1);
  };

  return (
    <Wrapper>
      <button onClick={previousPage} disabled={page === 1}>
        <ChevronLeft style={{ display: "block" }} />
      </button>
      <p>
        Page {page} of {maxPages}
      </p>
      <button onClick={nextPage} disabled={page === maxPages}>
        <ChevronRight style={{ display: "block" }} />
      </button>
    </Wrapper>
  );
}

const Wrapper = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 4px 0;

  & button {
    background-color: transparent;
    border: none;
    border-radius: 50%;
  }

  & button:hover:not([disabled]) {
    background-color: ${COLORS.accent[3]};
    cursor: pointer;
    transform: scale(1.3);
  }

  & svg {
    width: 34px;
    height: 34px;
  }
`;
