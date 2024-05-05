import Nav from 'react-bootstrap/Nav';
import "./index.css";
import Navbar from 'react-bootstrap/Navbar';
import PageIndicator from '../PageIndicator/PageIndicator';
import vmstLogo from '../../assets/VMST_logo.png';
import Button from 'react-bootstrap/Button';
import SignUp from '../SignUp';
import Login from '../Login';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Auth from '../../utils/auth';

function Navigation() {
  const logout = (event) => {
    event.preventDefault();
    Auth.logout();
  };
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);


  let role;
  Auth.loggedIn()
    ? role = Auth.getProfile().data.role
    : role = '';

  const location = useLocation();
  const [activePage, setActivePage] = useState('Home');

  useEffect(() => {
    const path = location.pathname;
    switch (path) {
      case '/':
        setActivePage('Home');
        break;
      case '/about-us':
        setActivePage('About Us');
        break;
      case '/contact':
        setActivePage('Contact');
        break;
      case '/upload':
        setActivePage('Upload Members');
        break;
      case '/me':
        setActivePage('Account');
        break;
      default:
        setActivePage('Home');
    }
  }, [location.pathname]);

  return (
    <>
    <Navbar id="navColor" collapseOnSelect expand="lg">
      <Navbar.Brand href="/"><img id="navLogo" src={vmstLogo} /></Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        {Auth.loggedIn() ? (
          <>
            <Button href="/me" id="accountButton" className= {activePage === 'Account' ? 'active' : ''}>Account</Button>{' '}
          </>
        ) : (
          <>

          </>
        )}
        <Nav.Link href="/" className={activePage === 'Home' ? 'active' : ''}>Home</Nav.Link>
        <Nav.Link href="/about-us" className={activePage === 'About Us' ? 'active' : ''}>About Us</Nav.Link>
        <Nav.Link href="/contact" className={activePage === 'Contact' ? 'active' : ''}>Contact</Nav.Link>
        { role === 'membership' && <Nav.Link href="/upload" className={activePage === 'Upload Members' ? 'active' : ''}>Upload Members</Nav.Link> }
        <div>
          {Auth.loggedIn() ? (
            <>
              <Nav.Link onClick={logout}>
                Logout
              </Nav.Link>
            </>
          ) : (
            <>
              <SignUp show={showSignUpModal} onHide={() => setShowSignUpModal(false)} onShow={() => setShowSignUpModal(true)} showLoginModal={() => setShowLoginModal(true)} />
              <Login show={showLoginModal} onHide={() => setShowLoginModal(false)} onShow={() => setShowLoginModal(true)} showSignUpModal={() => setShowSignUpModal(true)} />
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

