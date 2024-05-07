import GeneralImagery from "../ImageAltConfig/ImageAltConfigGen";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function GalleryContent() {
  return (
    <div>
      <Row style={{ marginLeft: "15px", marginRight: "15px" }}>
        {GeneralImagery.map((image, index) => (
          <Col key={index} xs={12} sm={6} md={4} style={{ marginBottom: "20px" }}>
            <Card style={{ height: "400px" }}>
              <Card.Img style={{ height: "400px" }} src={image.url} alt={image.alt} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default GalleryContent;
