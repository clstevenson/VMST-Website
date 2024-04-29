// see SignupForm.js for comments
import React, { useState } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import SignUp from '../SignUp';
// import { loginUser } from '../utils/API';
// import Auth from '../utils/auth';

// const LoginForm = () => {
//   const [userFormData, setUserFormData] = useState({ email: '', password: '' });
//   const [validated] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);

//   const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     setUserFormData({ ...userFormData, [name]: value });
//   };

//   const handleFormSubmit = async (event) => {
//     event.preventDefault();

//     // check if form has everything (as per react-bootstrap docs)
//     const form = event.currentTarget;
//     if (form.checkValidity() === false) {
//       event.preventDefault();
//       event.stopPropagation();
//     }

//     try {
//       const response = await loginUser(userFormData);

//       if (!response.ok) {
//         throw new Error('something went wrong!');
//       }

//       const { token, user } = await response.json();
//       console.log(user);
//       Auth.login(token);
//     } catch (err) {
//       console.error(err);
//       setShowAlert(true);
//     }

//     setUserFormData({
//       username: '',
//       email: '',
//       password: '',
//     });
//   };

//   return (
//     <>
//       <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
//         <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
//           Something went wrong with your login credentials!
//         </Alert>
//         <Form.Group className='mb-3'>
//           <Form.Label htmlFor='email'>Email</Form.Label>
//           <Form.Control
//             type='text'
//             placeholder='Your email'
//             name='email'
//             onChange={handleInputChange}
//             value={userFormData.email}
//             required
//           />
//           <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
//         </Form.Group>

//         <Form.Group className='mb-3'>
//           <Form.Label htmlFor='password'>Password</Form.Label>
//           <Form.Control
//             type='password'
//             placeholder='Your password'
//             name='password'
//             onChange={handleInputChange}
//             value={userFormData.password}
//             required
//           />
//           <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
//         </Form.Group>
//         <Button
//           disabled={!(userFormData.email && userFormData.password)}
//           type='submit'
//           variant='success'>
//           Submit
//         </Button>
//       </Form>
//     </>
//   );
// };

// export default LoginForm;

function Login(props) {
    function displaySignUpModal() {
        props.showSignUpModal();
        props.onHide();
      }

    return (
      <>
        <Button variant="dark" onClick={props.onShow}>
          Login
        </Button>
  
        <Modal show={props.show} onHide={props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email address"
                  autoFocus
                />
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  autoFocus
                />
                <br />
                <Button variant="secondary" onClick={props.onHide}>
                  Cancel
                </Button>
                <Button id="loginColor" onClick={props.onHide}>
                  Login
                </Button>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <p>Don't have an account yet?</p>
            <button onClick={displaySignUpModal}>Sign Up</button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
  
  export default Login;