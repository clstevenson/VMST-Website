/* 
 A spinning circle meant to convey "busy." It is a simple (block display) animated SVG image.
 Any image properties (notably height and width) used as props are passed to the img tag.

 Adapted from JWC's CSS Course.
 */
import styled, { keyframes } from "styled-components";

const Spinner = ({ ...delegated }) => {
  return <Image {...delegated} alt="Busy..." src="./assets/loader.svg" />;
};

const spinning = keyframes`
  from {transform: rotate(0turn)};
  to {transform: rotate(1turn);}
`;

const Image = styled.img`
  display: block;
  animation: ${spinning} 1000ms linear infinite;
`;

export default Spinner;
