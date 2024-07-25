import {
  Button,
  FormControl,
  FormGroup,
  FormLabel,
  FormText,
} from "react-bootstrap";

const nameRegex = /^[A-Za-z0-9]+$/;
const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const titleRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(\;+=._\s]{1,40}$/;
const messageRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(\;+=._\s]+$/;

export default function EmailForm({ register, errors }) {
  //returning the form component

  return (
    <FormGroup>
      <FormGroup>
        <FormLabel>Name:</FormLabel>
        <FormControl
          type="text"
          placeholder="Your name"
          {...register("name", { required: true }, { pattern: { nameRegex } })}
        />
        {errors.name && <FormText>This field is required</FormText>}
      </FormGroup>

      <FormGroup>
        <FormLabel>Email:</FormLabel>
        <FormControl
          type="email"
          placeholder="Your email"
          {...register(
            "email",
            { required: true },
            { pattern: { emailRegex } }
          )}
        />
        {errors.email && <FormText>This field is required</FormText>}
      </FormGroup>

      <FormGroup>
        <FormLabel>Title:</FormLabel>
        <FormControl
          type="text"
          placeholder="Title of your email"
          {...register(
            "title",
            { required: true },
            { pattern: { titleRegex } }
          )}
        />
        {errors.title && <FormText>This field is required</FormText>}
      </FormGroup>

      <FormGroup>
        <FormLabel>Message: </FormLabel>
        <FormControl
          as="textarea"
          placeholder="The body of your message to the recipient"
          rows={4}
          {...register(
            "message",
            { required: true },
            { pattern: { messageRegex } }
          )}
        />
        {errors.message && <FormText>This field is required</FormText>}
      </FormGroup>
      <FormGroup>
        <Button style={{ marginTop: 10 }} type="submit">
          Submit
        </Button>
      </FormGroup>
    </FormGroup>
  );
}
