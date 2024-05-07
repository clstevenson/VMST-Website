import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import GeneralImagery from '../ImageAltConfig/ImageAltConfigGen';

function AboutCarousel() {
  return (
    <div id='CarouselContainer' style={{ height: '400px', overflow: 'hidden' }}>
      <Carousel fade interval={15000} // 15 seconds
      >
        {GeneralImagery.map((image, index) => (
          <Carousel.Item key={index}>
            <img
              className="d-block w-100"
              src={image.url}
              alt={image.alt}
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default AboutCarousel;
