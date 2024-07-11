import Carousel from "react-bootstrap/Carousel";
import bannerPhotos from "../../utils/banner-photos";

function HomeCarousel() {
  return (
    <div id="CarouselContainer" style={{ height: "400px", overflow: "hidden" }}>
      <Carousel
        fade
        interval={15000} // 15 seconds
        nextIcon={null}
        prevIcon={null} // Hide navigation icons for fully automated carousel
      >
        {bannerPhotos.map((image, index) => (
          <Carousel.Item key={index}>
            <img
              className="d-block w-100"
              src={image.url}
              alt={image.alt}
              style={{ height: "400px", objectFit: "cover" }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default HomeCarousel;
