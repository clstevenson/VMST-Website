import styled from "styled-components";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as Label from "@radix-ui/react-label";

import { ErrorMessage } from "../components/NavBar/ModalStyles";

import { useMutation } from "@apollo/client";
import { EMAIL_LEADERS, EMAIL_LEADERSWEBMASTER, EMAIL_WEBMASTER } from "../utils/mutations";
import { QUERIES, COLORS, WEIGHTS } from "../utils/constants";

export default function EmailPage2() {
  const [emailLeaders, { error: leaderError }] = useMutation(EMAIL_LEADERS);
  const [emailWebmaster, { error: webmasterError }] = useMutation(EMAIL_WEBMASTER);
  const [emailLeadersWebmaster, { error: leaderWebmasterError }] = useMutation(EMAIL_LEADERSWEBMASTER);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
      leaders: true,
      webmaster: false,
    },
  });

  // focus on the first input field on page load
  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  // for email address validation
  const emailRegex = /^([a-zA-Z0-9_.-]+)@([\da-z.-]+)\.([a-z.]{2,6})$/;

  const onSubmit = async ({ name, email, message, leaders, webmaster }) => {
    // convert plain text message to simple HTML
    let html = "";
    const txtArray = message.split('\n');

    for (let i = 0; i < txtArray.length; i++) {
      // skip blank lines
      if (txtArray[i] === '') continue;
      // wrap p-tags around text blocks
      html += `<p>${txtArray[i]}</p>`;
    }

    const emailData = {
      from: name,
      replyTo: email,
      id: [],
      subject: "Message from a visitor to the VMST web site",
      plainText: message,
      html: html,
    };

    try {
      // send data to server
      if (leaders && webmaster) {
        await emailLeadersWebmaster({ variables: {emailData} });
      } else if (leaders) {
        await emailLeaders({ variables: {emailData} });
      } else if (webmaster) {
        await emailWebmaster({ variables: {emailData} });
      }

      reset();  // form back to default values
    } catch (err) {
      console.log({ err });
      // TODO: need to change this to output to form
      alert(`Error: ${err}`);
    }
  };

  return (
    <Wrapper>
      <Title>Contact Us</Title>
      <p>
        We would love to hear from you! Use this form to send a message to VMST
        leaders (President, Vice President, Secretary) and/or the webmaster of
        this site.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} aria-labelledby="contact">
        <InputWrapper>
          <NameWrapper>
            <Label.Root htmlFor="name">Your name</Label.Root>
            <Input
              type="text"
              id="name"
              aria-invalid={errors.firstName ? "true" : "false"}
              {...register("name", {
                required: "Name is required",
              })}
            />
            {/* output error message from validation */}
            {errors.name?.message && (
              <ErrorMessage>{errors.name.message}</ErrorMessage>
            )}
          </NameWrapper>

          <EmailWrapper>
            <Label.Root htmlFor="email">Your email address</Label.Root>
            <Input
              id="email"
              aria-invalid={errors.email ? "true" : "false"}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: emailRegex,
                  message: "Not a valid email address",
                },
              })}
            />
            {/* output error message from validation */}
            {errors.email?.message && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </EmailWrapper>
        </InputWrapper>

        <MessageWrapper>
          <Label.Root htmlFor="message">Message to send</Label.Root>
          <Message
            id="message"
            rows={10}
            {...register("message", {
              required: "Your message cannot be empty",
            })}
          ></Message>
          {/* output error message from validation */}
          {errors.message?.message && (
            <ErrorMessage>{errors.message.message}</ErrorMessage>
          )}
        </MessageWrapper>

        <SubmitWrapper>
          <SubmitButton disabled={isSubmitting} type="submit">
            {isSubmitting ? "sending..." : "Submit"}
          </SubmitButton>

          <RecipientsWrapper>
            <p>To: </p>
            <CheckboxWrapper>
              <input
                type="checkbox"
                id="leaders"
                {...register("leaders", {
                  validate: () => {
                    if (!getValues("leaders") && !getValues("webmaster"))
                      return "At least one checkbox must be selected";
                    return true;
                  },
                })}
              />
              <Label.Root htmlFor="leaders">VMST leaders</Label.Root>
            </CheckboxWrapper>
            <CheckboxWrapper>
              <input
                type="checkbox"
                id="webmaster"
                {...register("webmaster")}
              />
              <Label.Root htmlFor="webmaster">Webmaster</Label.Root>
            </CheckboxWrapper>
          </RecipientsWrapper>
        </SubmitWrapper>
        <ErrorWrapper>
          {/* output error message from checkbox validation */}
          {errors.leaders?.message && (
            <ErrorMessage>{errors.leaders.message}</ErrorMessage>
          )}
        </ErrorWrapper>
      </form>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: min(var(--max-prose-width), 100%);
  margin: 12px auto 32px;
  border: 1px solid ${COLORS.accent[12]};
  padding: 8px 24px 16px 48px;
  border-radius: 8px;
  box-shadow: 2px 4px 6px ${COLORS.gray[9]};
`;

const ErrorWrapper = styled.div`
  text-align: right;
  padding-right: 8px;
`;

const SubmitWrapper = styled.div`
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: center;

  @media ${QUERIES.tabletAndLess} {
    gap: 24px;
  }
`;

const RecipientsWrapper = styled.fieldset`
  border: none;
  display: flex;
  gap: 16px;

  @media ${QUERIES.mobile} {
    flex-direction: column;
    align-self: flex-start;
    gap: 2px;
    padding-left: 8px;
    /* get rid of "To" text on phones */
    & p {
      display: none;
    }
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;

  & input:hover,
  & label:hover {
    cursor: pointer;
  }
`;

const Title = styled.h2`
  font-size: var(--subheading-size);
  color: ${COLORS.accent[12]};
  margin-bottom: 16px;
`;

// Wrapper around the text inputs (name, email)
const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  gap: 16px;
  padding: 16px 0;
`;

const NameWrapper = styled.div`
  display: flex;
  flex: 1 1 200px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const EmailWrapper = styled.div`
  display: flex;
  flex: 1 1 260px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const Input = styled.input`
  all: unset;
  width: 100%;
  flex: 1;
  border-bottom: 1px solid ${COLORS.gray[700]};

  &:focus {
    background-color: ${COLORS.accent[2]};
    border-bottom: 2px solid ${COLORS.accent[8]};
  }
`;

const MessageWrapper = styled(InputWrapper)`
  flex-direction: column;
  gap: 4px;
  height: 100%;
`;

const Message = styled.textarea`
  padding: 8px;
  min-width: 100%;
  max-width: 100%;
  &:focus {
    background-color: ${COLORS.accent[1]};
    border: 2px solid ${COLORS.accent[8]};
    outline: none;
  }
`;

const SubmitButton = styled.button`
  /* display: block; */
  padding: 4px 24px;
  font-weight: ${WEIGHTS.medium};
  background-color: ${COLORS.accent[10]};
  border: 1px solid ${COLORS.accent[9]};
  border-radius: 4px;
  outline-offset: 0;
  color: white;

  @media ${QUERIES.tabletAndLess} {
    padding: 4px 16px;
  }

  &:hover,
  &:focus {
    background-color: ${COLORS.accent[11]};
    transform: scale(1.05);
  }
`;
