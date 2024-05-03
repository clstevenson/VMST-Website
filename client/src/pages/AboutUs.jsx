import "../components/GenPageSetUp/index.css";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FAQs from '../components/FAQs/FAQs';

function AboutUs() {
    return <>
    <div className="formatpage">
    <h1>About Us</h1>
    <div id="content">
    <Container>
    <Row>
    <Col sm={8} id="Text-Content">
    <div id="introduction">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
    <div id="Frequently-Asked-Questions">
    <h3>Frequently Asked Questions</h3>
    <FAQs />
    </div>
    </Col>
    <Col sm={4} id="Image-Widget">
    </Col>
    </Row>
    </Container>
    </div>
    </div>
    </>
}

export default AboutUs;