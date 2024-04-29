import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import "./index.css";
import Navbar from 'react-bootstrap/Navbar';
import vmstLogo from '../../assets/VMST-logo.gif';
import Button from 'react-bootstrap/Button';
import SignUp from '../SignUp';
import Login from '../Login';
import { useState } from 'react';

function Navigation() {
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <Navbar id="navColor" collapseOnSelect expand="lg">
    <Container>
      <Navbar.Brand href="/"><img id="navLogo" src={ vmstLogo }/></Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mx-auto">
          <Button href="/me" id="accountButton">Account</Button>{' '}
          <Nav.Link href="/">Home Page</Nav.Link>
          <Nav.Link href="/about-us">About Us</Nav.Link>
          <Nav.Link href="/contact-us">Contact Us</Nav.Link>
          <SignUp show={showSignUpModal} onHide={() => setShowSignUpModal(false)} onShow={() => setShowSignUpModal(true)} showLoginModal={() => setShowLoginModal(true)}/>
          <Login show={showLoginModal} onHide={() => setShowLoginModal(false)} onShow={() => setShowLoginModal(true)} showSignUpModal={() => setShowSignUpModal(true)}/>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  );
}

export default Navigation;

