import styled from "styled-components";
import postPhotos from "../utils/post-photos";
import CaptionedImage from "../components/CaptionedImage";
import { COLORS } from "../utils/constants";

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

const Wrapper = styled.div``;

const Title = styled.h2`
  font-size: var(--subheading-size);
  color: ${COLORS.accent[12]};
`;

const GalleryWrapper = styled.div`
  display: grid;
  gap: 2px;
  margin: 2px;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  border: 1px solid ${COLORS.accent[10]};
  background-color: white;
`;
