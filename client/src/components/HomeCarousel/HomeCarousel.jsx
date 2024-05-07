import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import HomeImagery from '../ImageAltConfig/ImageAltConfigHome';

function HomeCarousel() {
  return (
    <div id='CarouselContainer' style={{ height: '500px', overflow: 'hidden' }}>
      <Carousel fade interval={15000} // 15 seconds
        nextIcon={null} prevIcon={null} // Hide navigation icons for fully automated carousel
      >
        {HomeImagery.map((image, index) => (
          <Carousel.Item key={index}>
            <img
              className="d-block w-100"
              src={image.url}
              alt={image.alt}
              style={{ height: '500px', objectFit: 'cover' }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default HomeCarousel;
