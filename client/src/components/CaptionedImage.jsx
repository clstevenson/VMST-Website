/* eslint-disable react/prop-types */
import styled from "styled-components";
import { COLORS } from "../utils/constants";

export default function CaptionedImage({
  alt,
  src,
  caption,
  height = "300px",
}) {
  return (
    <Figure>
      <Image alt={alt} src={src} style={{ height }} />
      <FigCaption>{caption}</FigCaption>
    </Figure>
  );
}

const Figure = styled.figure`
  padding: 8px;
  /* same styling as posts on home page */
  border: 1px solid ${COLORS.gray[8]};
  border-radius: 4px;
  box-shadow: 1px 2px 4px ${COLORS.gray[8]};

  &:hover {
    outline: auto;
    background-color: ${COLORS.accent[2]};
    /* mimics a link to the full post, which isn't in place yet */
    cursor: pointer;
  }
`;

const Image = styled.img`
  width: 100%;
  object-fit: cover;
`;

const FigCaption = styled.figcaption`
  font-style: italic;
  /* only allow a single line of caption */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  text-overflow: ellipsis;
  overflow: hidden;
`;
