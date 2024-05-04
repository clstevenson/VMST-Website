import { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { ADD_POST } from '../../utils/mutations';
import Auth from '../../utils/auth';
import "./index.css";

function AddPosts() {

  let role;
  Auth.loggedIn()
  ? role = Auth.getProfile().data.role
  : role = '';

  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const [formState, setFormState] = useState({ title: '', content: '' });
  const [addPost, { error, data }] = useMutation(ADD_POST);

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
      const { data } = await addPost({
        variables: { ...formState },
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }

    // clear form values
    setFormState({
      title: '',
      content: '',
    });
  };

  return (
    <>
    {Auth.loggedIn() && role === 'leader' ? (
      <>
        <Button id="button" variant="primary" onClick={handleShowModal}>
            +
          </Button>
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Create Blog Post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleFormSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Post Title</Form.Label>
                  <textArea name="title" value={formState.title} onChange={handleChange} className="textarea" id="textarea1" placeholder="Enter post title"></textArea>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Post Summary</Form.Label>
                  <textArea name="content" value={formState.content} onChange={handleChange} className="textarea" placeholder="Enter post summary" minLength="200" required></textArea>
                </Form.Group>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </>
    ) : (
      <>
      </>
    )}
         </>
  )};
              
                
          
              
         
  
  export default AddPosts;