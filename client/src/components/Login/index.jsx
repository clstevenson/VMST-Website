import { useState } from 'react';
import '../GenPageSetUp/index.css';
import { Form, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../../utils/mutations';
import Auth from '../../utils/auth';
import Nav from 'react-bootstrap/Nav';

function Login(props) {
  function displaySignUpModal() {
      props.showSignUpModal();
      props.onHide();
    }
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [login, { error, data }] = useMutation(LOGIN_USER);

  // update state based on form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // submit form
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log(formState);
    try {
      const { data } = await login({
        variables: { ...formState },
      });

      Auth.login(data.login.token);
    } catch (e) {
      console.error(e);
    }

    // clear form values
    setFormState({
      email: '',
      password: '',
    });
  };

  return (
    <>
        <Nav.Link variant="dark" onClick={props.onShow}>
          Login
        </Nav.Link>
        <Modal show={props.show} onHide={props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <div className="card-body">
            {data ? (
              <p>
                Success! You may now head{' '}
                <Link to="/">back to the homepage.</Link>
              </p>
            ) : (
              <Form onSubmit={handleFormSubmit}>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                   className="form-input"
                   placeholder="Your email"
                   name="email"
                   type="email"
                   value={formState.email}
                   onChange={handleChange}
                />
                <Form.Label>Password</Form.Label>
                <Form.Control
                  className="form-input"
                  placeholder="******"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleChange}
                />
                <br />
                <Button
                  id="loginColor" onClick={props.onHide}
                  variant="info"
                  style={{ cursor: 'pointer' }}
                  type="submit"
                >
                  Login
                </Button>
                </Form.Group>
              </Form>
            )}

            {error && (
              <div className="my-3 p-3 bg-danger text-white">
                {error.message}
              </div>
            )}
            </div>
             </Modal.Body>
          <Modal.Footer>
            <p>Don't have an account yet?</p>
            <Button variant="info" onClick={displaySignUpModal}>Sign Up</Button>
          </Modal.Footer>
        </Modal>
          </>
  )};
              
                
          
              
         
  
  export default Login;