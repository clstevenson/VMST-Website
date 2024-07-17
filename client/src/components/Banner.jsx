/* eslint-disable react/prop-types */
/* 
 Cycles through hero images chosen from among the VMST photos.
 Should display the range of activities (and fun) of VMST swimming.
 Input prop is the duration (in sec) that each image should be displayed
 */

import styled from "styled-components";
import { useState, useEffect, useCallback } from "react";

import { COLORS, QUERIES } from "../utils/constants";
import bannerPhotos from "../utils/banner-photos";
import { ArrowLeft, ArrowRight } from "react-feather";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default function Banner({ duration }) {
  const numHeroes = bannerPhotos.length;
  const random = (max) => Math.floor(Math.random() * max);
  const [imageIndex, setImageIndex] = useState(random(numHeroes));

  const nextImage = useCallback(() => {
    const nextIndex = imageIndex + 1;
    setImageIndex(nextIndex % numHeroes);
  }, [imageIndex, numHeroes]);

  const previousImage = () => {
    if (imageIndex === 0) setImageIndex(numHeroes - 1);
    else setImageIndex(imageIndex - 1);
  };

  useEffect(() => {
    // go to the next image, cycling back to beginning at the end
    const intervalID = setInterval(nextImage, duration * 1000);

    return () => {
      clearInterval(intervalID);
    };
  }, [imageIndex, duration, nextImage]);

  // eventually want to set a timer to cycle through the images
  return (
    <Wrapper>
      <Image
        src={bannerPhotos[imageIndex].url}
        alt={bannerPhotos[imageIndex].alt}
      />
      <ArrowsWrapper>
        <ArrowButton onClick={() => previousImage()}>
          <ArrowLeft color={COLORS.accent[12]} strokeWidth={1.5} />
          <VisuallyHidden.Root>go to next banner image</VisuallyHidden.Root>
        </ArrowButton>
        <ArrowButton onClick={() => nextImage()}>
          <ArrowRight color={COLORS.accent[12]} strokeWidth={1.5} />
          <VisuallyHidden.Root>go to previous banner image</VisuallyHidden.Root>
        </ArrowButton>
      </ArrowsWrapper>
    </Wrapper>
  );
}

// arrows to pick previous or next image
const ArrowsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  color: ${COLORS.accent[12]};
  /* take it out of flow */
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translateY(100%);

  // not for phones
  @media ${QUERIES.mobile} {
    display: none;
  }
`;

const ArrowButton = styled.button`
  border: none;
  background-color: transparent;

  &:hover {
    transform: scale(1.2);
    transition: 300ms transform;
  }
`;

const Wrapper = styled.div`
  margin: 16px 0;
  position: relative;
`;

const Image = styled.img`
  display: block;
  height: 300px;
  width: 100%;
  object-fit: cover;
  /* border-radius: 8px; */

  @media ${QUERIES.mobile} {
    height: 200px;
  }
`;
