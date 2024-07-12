/* 
 Displays a hero image chosen from among the VMST photos.
 Should display the range of activities (and fun) of VMST swimming.
 */

import styled from "styled-components";
import { QUERIES } from "../utils/constants";
import bannerPhotos from "../utils/banner-photos";

export default function Banner() {
  const image = bannerPhotos[0];
  // eventually want to set a timer to cycle through the images
  return (
    <Wrapper>
      <Image src={image.url} alt={image.alt} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 16px 0;
`;

const Image = styled.img`
  display: block;
  height: 300px;
  width: 100%;
  object-fit: cover;
  border-radius: 8px;

  @media ${QUERIES.mobile} {
    height: 200px;
  }
`;
