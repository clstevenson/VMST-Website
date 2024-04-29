import { useState } from 'react';
import { Form, Button, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Login from '../Login';

// import { createUser } from '../utils/API';
// import Auth from '../utils/auth';

// const SignupForm = () => {
//   // set initial form state
//   const [userFormData, setUserFormData] = useState({ username: '', email: '', password: '' });
//   // set state for form validation
//   const [validated] = useState(false);
//   // set state for alert
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
//       const response = await createUser(userFormData);

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
//       {/* This is needed for the validation functionality above */}
//       <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
//         {/* show alert if server response is bad */}
//         <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
//           Something went wrong with your signup!
//         </Alert>

//         <Form.Group className='mb-3'>
//           <Form.Label htmlFor='username'>Username</Form.Label>
//           <Form.Control
//             type='text'
//             placeholder='Your username'
//             name='username'
//             onChange={handleInputChange}
//             value={userFormData.username}
//             required
//           />
//           <Form.Control.Feedback type='invalid'>Username is required!</Form.Control.Feedback>
//         </Form.Group>

//         <Form.Group className='mb-3'>
//           <Form.Label htmlFor='email'>Email</Form.Label>
//           <Form.Control
//             type='email'
//             placeholder='Your email address'
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
//           disabled={!(userFormData.username && userFormData.email && userFormData.password)}
//           type='submit'
//           variant='success'>
//           Submit
//         </Button>
//       </Form>
//     </>
//   );
// };

// export default SignupForm;

function SignUp(props) {
  function displayLoginModal() {
    props.showLoginModal();
    props.onHide();
  }
    return (
      <>
        <Button variant="dark" onClick={props.onShow}>
          Sign Up
        </Button>
  
        <Modal show={props.show} onHide={props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Sign Up</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="First Name"
                    autoFocus
                />
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Last Name"
                    autoFocus
                />
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    autoFocus
                />
                <Form.Label>New Password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Enter your secure password"
                    autoFocus
                />
                <br />
                <Button variant="secondary" onClick={props.onHide}>
            Cancel
          </Button>
          <Button id="signUpColor" onClick={props.onHide}>
            Sign Up
          </Button>
            </Form.Group>
          </Form>
          </Modal.Body>
          <Modal.Footer>
            <p>Already have an account?</p>
            <button onClick={displayLoginModal}>Login</button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
  
  export default SignUp;