import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import "./index.css";
import Navbar from 'react-bootstrap/Navbar';
import PageIndicator from '../PageIndicator/PageIndicator';
import vmstLogo from '../../assets/VMST_logo.png';
import Button from 'react-bootstrap/Button';
import SignUp from '../SignUp';
import Login from '../Login';
import { useState } from 'react';
import Auth from '../../utils/auth';

function Navigation() {
  const logout = (event) => {
    event.preventDefault();
    Auth.logout();
  };
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
        <Navbar id="navColor" collapseOnSelect expand="lg">
    
    <Navbar.Brand href="/"><img id="navLogo" src={ vmstLogo }/></Navbar.Brand>
    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
    <Navbar.Collapse id="responsive-navbar-nav">
      {Auth.loggedIn() ? (
          <>
           <Button href="/me" id="accountButton">Account</Button>{' '}
          </>
        ) : (
          <>
           
          </>
        )}
        <Nav.Link href="/">Home</Nav.Link>
        <Nav.Link href="/about-us">About Us</Nav.Link>
        <Nav.Link href="/contact">Contact</Nav.Link>
        <div>
        {Auth.loggedIn() ? (
          <>
            <Nav.Link onClick={logout}>
              Logout
            </Nav.Link>
          </>
        ) : (
          <>
            <SignUp show={showSignUpModal} onHide={() => setShowSignUpModal(false)} onShow={() => setShowSignUpModal(true)} showLoginModal={() => setShowLoginModal(true)}/>
            <Login show={showLoginModal} onHide={() => setShowLoginModal(false)} onShow={() => setShowLoginModal(true)} showSignUpModal={() => setShowSignUpModal(true)}/>
          </>
        )}
      </div>
    </Navbar.Collapse>
  
</Navbar>
<PageIndicator /> 
    </>
  
  );
}

export default Navigation;