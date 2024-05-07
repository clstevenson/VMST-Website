const nameRegex = /^[A-Za-z0-9]+$/;
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const titleRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(\;+=._\s]{1,40}$/;
const messageRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(\;+=._\s]+$/;
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default function EmailForm({register, errors}) {
    //returning the form component

    return (
        <Form>
            {errors.recipients && <p>Choose one please</p>}
            <Form.Group controlId="name">
                <Form.Label>Name:</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Your name"
                    {...register('name', { required: true, pattern: nameRegex })}
                />
                {errors.name && <p>This field is required</p>}
            </Form.Group>

            <Form.Group controlId="email">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Your email"
                    {...register('email', { required: true, pattern: emailRegex })}
                />
                {errors.email && <p>This field is required</p>}
            </Form.Group>

            <Form.Group controlId="title">
                <Form.Label>Title:</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Title of your email"
                    {...register('title', { required: true, pattern: titleRegex })}
                />
                {errors.title && <p>This field is required</p>}
            </Form.Group>

            <Form.Group controlId="message">
                <Form.Label>Message:</Form.Label>
                <Form.Control
                    as="textarea"
                    placeholder="The body of your message to the recipient"
                    rows={10}
                    {...register('message', { required: true, pattern: messageRegex })}
                />
                {errors.message && <p>This field is required</p>}
            </Form.Group>
            <br></br>
            <Button type="submit" variant="info">Submit</Button>
        </Form>
    );
}
