import styled from "styled-components";
import postPhotos from "../utils/post-photos";
import CaptionedImage from "../components/CaptionedImage";
import { COLORS, QUERIES } from "../utils/constants";

export default function Gallery() {
  return (
    <Wrapper>
      <Title>Photo Gallery</Title>

      <GalleryWrapper>
        {postPhotos.map((image) => (
          <CaptionedImage
            key={image.id}
            src={image.url}
            alt={image.alt}
            caption={image.alt}
          />
        ))}
      </GalleryWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: var(--subheading-size);
  color: ${COLORS.accent[12]};
  margin-bottom: 16px;
`;

const GalleryWrapper = styled.div`
  display: grid;
  gap: 8px;
  /* margin: 2px; */
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  /* border: 1px solid ${COLORS.accent[10]}; */
  /* background-color: white; */

  @media ${QUERIES.mobile} {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
`;
