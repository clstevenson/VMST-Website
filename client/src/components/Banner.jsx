/* eslint-disable react/prop-types */
/* 
 Cycles through hero images chosen from among the VMST photos.
 Should display the range of activities (and fun) of VMST swimming.
 Input prop is the duration (in sec) that each image should be displayed
 */

import styled from "styled-components";
import { useState, useEffect } from "react";

import { QUERIES } from "../utils/constants";
import bannerPhotos from "../utils/banner-photos";

export default function Banner({ duration }) {
  const numHeroes = bannerPhotos.length;
  const random = (max) => Math.floor(Math.random() * max);
  const [imageIndex, setImageIndex] = useState(random(numHeroes));

  useEffect(() => {
    // go to the next image, cycling back to beginning at the end
    const nextIndex = () => {
      const currentIndex = imageIndex + 1;
      setImageIndex(currentIndex % numHeroes);
    };

    const intervalID = setInterval(nextIndex, duration * 1000);

    return () => {
      clearInterval(intervalID);
    };
  }, [imageIndex, numHeroes, duration]);

  // eventually want to set a timer to cycle through the images
  return (
    <Wrapper>
      <Image
        src={bannerPhotos[imageIndex].url}
        alt={bannerPhotos[imageIndex].alt}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: var(--content-padding);
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
