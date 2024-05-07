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
import { Link } from 'react-router-dom';

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
      case '/gallery':
        setActivePage('Gallery');
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
        <Navbar.Brand ><Link to='/'><img id="navLogo" src={vmstLogo} /></Link></Navbar.Brand>
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
          <Nav.Link ><Link id="nav" to='/'  className={activePage === 'Home' ? 'active' : ''}>Home</ Link></Nav.Link>
          <Nav.Link ><Link id="nav" to='/gallery'  className={activePage === 'Gallery' ? 'active' : ''}>Gallery</ Link></Nav.Link>
          <Nav.Link ><Link id="nav" to='/about-us'  className={activePage === 'About Us' ? 'active' : ''}>About Us</Link></Nav.Link>
          <Nav.Link ><Link id="nav" to='/contact'  className={activePage === 'Contact' ? 'active' : ''}>Contact</Link></Nav.Link>
          {role === 'membership' && <Nav.Link><Link id="nav" to="/upload"  className={activePage === 'Upload Members' ? 'active' : ''}>Upload Members</Link></Nav.Link> }

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
    {/* <PageIndicator /> */}
    </>
    
  );
}

export default Navigation;

