import styled from "styled-components";
import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";

import CaptionedImage from "../components/PhotoGallery/CaptionedImage";
import { COLORS, QUERIES, WEIGHTS } from "../utils/constants";
import {
  QUERY_ALBUMS,
  QUERY_FEATUREDPHOTOS,
  QUERY_PHOTOS,
} from "../utils/queries";
import Spinner from "../components/Spinner";
import SelectPhotos from "../components/PhotoGallery/SelectPhotos";
import NavPhotos from "../components/PhotoGallery/NavPhotos";
import PhotosPerPage from "../components/PhotoGallery/PerPageInput";

export default function Gallery() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  // possible values of photoset: 'featured', 'albums', 'all'
  const [photoset, setPhotoset] = useState("featured");
  const [photos, setPhotos] = useState([]);
  const [numPhotos, setNumPhotos] = useState(0);
  const [maxPages, setMaxPages] = useState(0);

  const [getFeatured, { loading }] = useLazyQuery(QUERY_FEATUREDPHOTOS, {
    onCompleted: (data) => {
      setPhotos(data.getFeaturedPhotos.photos);
      setNumPhotos(data.getFeaturedPhotos.numPhotos);
      setMaxPages(data.getFeaturedPhotos.pages);
    },
    onError: (error) => <div>`Something went wrong: ${error.message}.`</div>,
  });

  const [getAlbums] = useLazyQuery(QUERY_ALBUMS, {
    onCompleted: (data) => {
      setPhotos(data.getAlbums.album);
      setNumPhotos(data.getAlbums.numAlbums);
      setMaxPages(data.getAlbums.pages);
    },
    onError: (error) => <div>`Something went wrong: ${error.message}.`</div>,
  });

  const [getAllPhotos] = useLazyQuery(QUERY_PHOTOS, {
    onCompleted: (data) => {
      setPhotos(data.getPhotos.photos);
      setNumPhotos(data.getPhotos.numPhotos);
      setMaxPages(data.getPhotos.pages);
    },
    onError: (error) => <div>`Something went wrong: ${error.message}.`</div>,
  });

  useEffect(() => {
    if (photoset === "featured") {
      getFeatured({ variables: { page, perPage } });
    } else if (photoset === "albums") {
      getAlbums({ variables: { page, perPage } });
    } else if (photoset === "all") {
      getAllPhotos({ variables: { page, perPage } });
    }
  }, [getFeatured, page, perPage, photoset, getAlbums, getAllPhotos]);

  // early return while loading
  if (loading)
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    );

  return (
    <Wrapper>
      <Title>
        Photo Gallery{" "}
        <span>
          (click image to{" "}
          <a href="https://www.flickr.com/photos/va_swims/" target="_new">
            go to Flickr
          </a>
          )
        </span>
      </Title>

      <HeaderWrapper>
        {/* select which album/photoset to view */}
        <SelectPhotos
          photoset={photoset}
          setPhotoset={setPhotoset}
          numPhotos={numPhotos}
          setPage={setPage}
        />

        {/* click to increment/decrement page */}
        <NavWrapper>
          <NavPhotos page={page} setPage={setPage} maxPages={maxPages} />
        </NavWrapper>

        {/* control how many photos per page, resetting to page 1 on change */}
        <PhotosPerPage
          perPage={perPage}
          setPerPage={setPerPage}
          setPage={setPage}
        />
      </HeaderWrapper>

      {/* Display the photos according to the photos array */}
      {!photos ? (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      ) : (
        <GalleryWrapper>
          {photos.map((photo) => (
            <a href={photo.flickrURL} target="_new" key={photo.id}>
              <CaptionedImage
                src={photo.url}
                alt={photo.caption}
                caption={photo.caption}
              />
            </a>
          ))}
        </GalleryWrapper>
      )}

      {/* click to increment/decrement page */}
      {photos && (
        <NavWrapper>
          <NavPhotos
            page={page}
            setPage={setPage}
            maxPages={maxPages}
            displaySelect={false}
          />
        </NavWrapper>
      )}
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
  & span {
    font-weight: ${WEIGHTS.normal};
  }
  & a:hover {
    text-decoration: underline;
  }

  @media ${QUERIES.mobile} {
    & span {
      display: none;
    }
  }
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
