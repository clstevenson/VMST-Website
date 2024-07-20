/* eslint-disable react/prop-types */
import styled from "styled-components";

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

const Image = styled.img`
  width: 100%;
  object-fit: cover;
`;

const Figure = styled.figure`
  padding: 8px;
  margin-bottom: 8px;
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
