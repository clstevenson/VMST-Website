import styled from "styled-components";
import GalleryContent from "../components/GalleryContent/GalleryContent";

export default function Gallery() {
  return (
    <Wrapper>
      <Title>Gallery</Title>
      <GalleryContent />
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const Title = styled.h2`
  font-size: 1.4rem;
`;
