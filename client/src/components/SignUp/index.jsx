import { Form, Button, Alert, Modal } from 'react-bootstrap';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { ADD_USER } from '../../utils/mutations';
import Auth from '../../utils/auth';

function SignUp(props) {
  function displayLoginModal() {
    props.showLoginModal();
    props.onHide();
  }
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [addUser, { error, data }] = useMutation(ADD_USER);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log(formState);

    try {
      const { data } = await addUser({
        variables: { ...formState },
      });

      Auth.login(data.addUser.token);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
    <Modal show={props.show} onHide={props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Sign Up</Modal.Title>
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
                <Form.Label>First Name</Form.Label>
                <Form.Control
                    className="form-input"
                    placeholder="Your First Name"
                    name="firstName"
                    type="text"
                    value={formState.name}
                    onChange={handleChange}
                />
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                    className="form-input"
                    placeholder="Your Last Name"
                    name="lastName"
                    type="text"
                    value={formState.name}
                    onChange={handleChange}
                />
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    className="form-input"
                    placeholder="Your email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                />
                <Form.Label>New Password</Form.Label>
                <Form.Control
                    className="form-input"
                    placeholder="******"
                    name="password"
                    type="password"
                    value={formState.password}
                    onChange={handleChange}
                />
                <br />
          <Button id="signUpColor" onClick={props.onHide}
          variant="info"
          style={{ cursor: 'pointer' }}
          type="submit">
            Sign Up
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
            <p>Already have an account?</p>
            <Button variant="info" onClick={displayLoginModal}>Login</Button>
          </Modal.Footer>
        </Modal>
          </>
  );
};
  
  export default SignUp;