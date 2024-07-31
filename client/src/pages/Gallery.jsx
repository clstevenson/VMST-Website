import styled from "styled-components";
import { useState } from "react";
import { useQuery } from "@apollo/client";

import CaptionedImage from "../components/PhotoGallery/CaptionedImage";
import { COLORS, QUERIES } from "../utils/constants";
import { QUERY_FEATUREDPHOTOS } from "../utils/queries";
import Spinner from "../components/Spinner";
import SelectPhotos from "../components/PhotoGallery/SelectPhotos";
import NavPhotos from "../components/PhotoGallery/NavPhotos";
import PhotosPerPage from "../components/PhotoGallery/PerPageInput";

export default function Gallery() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  // possible values of photoset: 'featured', 'albums', 'all'
  const [photoset, setPhotoset] = useState("featured");

  const { loading, data, error } = useQuery(QUERY_FEATUREDPHOTOS, {
    variables: { page, perPage },
  });

  // early return while loading
  if (loading)
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    );

  if (error) return `Error: ${error.message}`;

  const photos = data && data?.getFeaturedPhotos.photos;
  const numPhotos = data && data?.getFeaturedPhotos.numPhotos;
  const maxPages = data && data?.getFeaturedPhotos.pages;

  return (
    <Wrapper>
      <Title>Photo Gallery</Title>

      <HeaderWrapper>
        {/* select which album/photoset to view */}
        <SelectPhotos
          photoset={photoset}
          setPhotoset={setPhotoset}
          numPhotos={numPhotos}
        />

        {/* click to increment/decrement page */}
        <NavWrapper>
          <NavPhotos page={page} setPage={setPage} maxPages={maxPages} />
        </NavWrapper>

        {/* control how many photos per page */}
        <PhotosPerPage
          perPage={perPage}
          setPerPage={setPerPage}
          numPhotos={numPhotos}
        />
      </HeaderWrapper>

      {/* Display the photos according to the photos array */}
      <GalleryWrapper>
        {photos.map((photo) => (
          <CaptionedImage
            key={photo.id}
            src={photo.url}
            alt={photo.caption}
            caption={photo.caption}
          />
        ))}
      </GalleryWrapper>

      {/* click to increment/decrement page */}
      <NavWrapper>
        <NavPhotos page={page} setPage={setPage} maxPages={maxPages} />
      </NavWrapper>
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
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));

  @media ${QUERIES.mobile} {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
`;

const SpinnerWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const NavWrapper = styled.div`
  margin: 0 auto;
`;

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
`;
