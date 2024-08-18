/* eslint-disable react/prop-types */
import styled from "styled-components";
import { COLORS } from "../../utils/constants";

export default function CaptionedImage({
  alt,
  src,
  url,
  caption,
  height = "400px",
}) {
  return (
    <Figure>
      <Image alt={alt} src={src} style={{ height }} />
      <a href={url} target="_new">
        <FigCaption>{caption}</FigCaption>
      </a>
    </Figure>
  );
}

const Figure = styled.figure`
  padding: 8px;
  /* same styling as posts on home page */
  border: 1px solid ${COLORS.gray[8]};
  border-radius: 4px;
  box-shadow: 1px 2px 4px ${COLORS.gray[8]};
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

  &:hover {
    text-decoration: underline;
  }
`;
