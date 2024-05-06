import "../components/GenPageSetUp/index.css";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FAQs from '../components/FAQs/FAQs';
import AboutCarousel from '../components/AboutCarousel/AboutCarousel';
import AboutHeader from '../components/AboutHeader/AboutHeader';

function AboutUs() {
    return <>
    <AboutHeader />
    <div className="formatpage">
    <h3>The Legacy of VMST</h3>
    <div id="content">
    <Container style={{margin:"0", padding:"0"}}>
    <Row>
    <Col sm={8} id="Text-Content">
    <div id="introduction">
    <p style={{marginLeft:"12px"}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
    <div id="Frequently-Asked-Questions">
    <h3>Frequently Asked Questions</h3>
    <FAQs />
    </div>
    </Col>
    <Col sm={4} id="Image-Widget">
    <h3 style={{textAlign: 'center'}}>Gallery</h3>
    <AboutCarousel />
    </Col>
    </Row>
    </Container>
    </div>
    </div>
    </>
}

export default AboutUs;