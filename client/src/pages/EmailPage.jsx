import { useState } from "react";
import EmailForm from "../components/EmailForm/FormElement";
import AsideSelector from "../components/EmailForm/AsideSelector";

export default function EmailPage() {
    // establishing useStates for the variables
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [recipients, setRecipients] = useState([])
    const [error, setError] = useState('');
    const [checkReturn, setCheckReturn] = useState([]);

    //regex for checking forms
    //(I know the forms have regex, but they don't catch as much)
    const nameRegex = /^[A-Za-z0-9]+$/;
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const titleRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(\;+=._\s]{1,40}$/;
    const messageRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(\;+=._\s]+$/;


    // handles react updating for the inputs
    const handleInputChange = (element) => {
        const { target } = element;
        const inputType = target.name;
        const inputValue = target.value;

        //checks if the name updates
        if (inputType === 'name') {
            setName(inputValue);
        }
        //checks if the recipient updates
        else if (inputType === 'recipient') {
            if (target.checked){
                setRecipients(recipients => [...recipients, inputValue]);
            } else {
                setRecipients(
                    recipients.filter((value) => {
                    if (value !== inputValue) {
                        return value;
                    } else {
                        return;
                    }
                }));
            }
        } else if (inputType === 'email') {
            setEmail(inputValue);
        } else if (inputType === 'title') {
            setTitle(inputValue);
        } else if (inputType === 'message') {
            setMessage(inputValue);
        }
    }

    //checks all the values changed by the fields to ensure that they are actually filled out.
    //returns an error and a variable that will be used to make a component if any of the fields fail
    //the regex test(s)
    const formInputCheck = async (event) =>{
        event.preventDefault();

        setCheckReturn([]);
        setError();

        // checks every field of the form
        // can't use a switch statement because it needs to check all of them,
        // not break once it finds a case that applies.

        if(name === '' || /\s+/.test(String(name))){
            setCheckReturn(checkReturn =>[...checkReturn, 'Please enter a name, blank space is not counted.']);
            setError('n-1');
        }

        if(!nameRegex.test(String(name))){
            setCheckReturn(checkReturn => [...checkReturn, 'Please Ensure the name is Alpha - Numeric(no special Characters).']);
            setError('n-2');
        }

        if(email === '' || /^\s+[\s]$/.test(String(email))){
            setCheckReturn(checkReturn => [...checkReturn, 'Please enter an email, blank space is not counted.']);
            setError('e-1');
        }

        if(!emailRegex.test(String(email))){
            setCheckReturn(checkReturn => [...checkReturn, 'Please enter a valid email address (E.g. test@gmail.com).']);
            setError('e-2');
        }

        if(title === '' || /^\s+[\s]$/.test(String(title))){
            setCheckReturn(checkReturn => [...checkReturn, 'Please enter a title, blank space is not counted.']);
            setError('t-1');
        }

        if(!titleRegex.test(String(title))){
            setCheckReturn(checkReturn => [...checkReturn, 'Please keep the title simple and between 1 and 40 characters long.']);
            setError('t-2');
        }
        if(message === '' || /^\s+[\s]$/.test(String(message))){
            setCheckReturn(checkReturn => [...checkReturn, 'Please enter a message, blank space is not counted.']);
            setError('m-1');
        }

        if(!messageRegex.test(String(message))){
            setCheckReturn(checkReturn => [...checkReturn, 'Something went wrong, try to avoid complex characters or emojis / emoticons in the message please.']);
            setError('m-2');
        }
        
        if(((recipients.length) <= 0)){
            setCheckReturn(checkReturn => [...checkReturn, 'You must Select at least One Recipient to send this message to.']);
            setError('r-1');
        }

        if(await error || await checkReturn.length > 0) {
            await console.log(error);
            await console.log(...checkReturn);
            return;
        } else {
            submitHandler();
        }
    }

    //handles the submit after all the field values are checked
    const submitHandler = async () => {
        //will have code for sending the values to the back end for nodemailer to utilize

        setName('');
        setRecipients([]);
        setCheckReturn();
        setError('')
        setEmail('');
        setTitle('');
        setMessage('');
    }

    const errorCheck = (e) => {
        if (e) {
            return true
        } else {
            return false
        }
    }

    return (
        <main className="">
            <h2 className="">
                Contact Us
            </h2>

            <AsideSelector 
                setError={setError}
                handleInputChange={handleInputChange}
                recipients={recipients}
            />
            
            <EmailForm 
                formInputCheck={formInputCheck}
                handleInputChange={handleInputChange} 
                setError={setError}
                errorCheck={errorCheck}
                nameRegex={nameRegex}
                emailRegex={emailRegex}
                titleRegex={titleRegex}
                messageRegex={messageRegex}
                name={name} 
                recipients={recipients}
                email={email} 
                title={title}
                message={message}
                error={error}
                checkReturn={checkReturn}
            />
        </main>
    );
}