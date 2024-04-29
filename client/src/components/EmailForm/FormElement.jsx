export default function EmailForm({
    // passing all the props from the EmailPage.jsx
        formInputCheck,
        handleInputChange,
        setError,
        errorCheck,
        nameRegex,
        emailRegex,
        titleRegex,
        messageRegex,
        name,
        recipients,
        email,
        title,
        message,
        error,
        checkReturn
    }) {

    function ShowCheckReturn({checkReturn}) {
        if(checkReturn){
            return (
                checkReturn.map(check => (
                    <p key={Math.random()}>{check}</p>
                ))
            )
        } else {
            return (<p>All Clear!</p>)
        }
    }

    //returning the form component
    return(
        <form className="" onSubmit={formInputCheck}>

            <p>Recipient:</p>
            <input className="input"
                required
                disabled
                value={recipients}
                name="recipientsBox"
                type="text"
                placeholder="Please Select a Recipient from the tab to the right"
            ></input>

            <p className="">Name:</p>
            <input className="input"
                required
                value={name}
                name="name"
                type="text"
                placeholder="Your name"
                onChange={handleInputChange}
                onBlur={() => {
                    if (name === '' || /\s+/.test(String(name))) {
                        setError('Please enter a name, blank space is not counted.');
                    } else if (!nameRegex.test(String(name))) {
                        setError('Please Ensure the name is Alpha-Numeric (no special Characters).');
                    } else {
                        setError('');
                    }
                }}
            />

            <p className="">Email:</p>
            <input className=""
                required
                value={email}
                name="email"
                type="email"
                placeholder="Your email"
                onChange={handleInputChange}
                onBlur={() => {
                    if (email === '' || /^\s+[\s]$/.test(String(email))) {
                        setError('Please enter an email, blank space is not counted.');
                    } else if (!emailRegex.test(String(email))) {
                        setError('Please enter a valid email address (E.g. test@gmail.com).');
                    } else {
                        setError('');
                    }
                }}
            />

            <p className="">Title:</p>
            <input className=""
                required
                value={title}
                name="title"
                type="title"
                placeholder="Title of your email"
                onChange={handleInputChange}
                onBlur={() => {
                    if (title === '' || /^\s+[\s]$/.test(String(title))) {
                        setError('Please enter a title, blank space is not counted.');
                    } else if (!titleRegex.test(String(title))) {
                        setError('Please keep the title simple and between 1 and 40 characters long');
                    } else {
                        setError('');
                    }
                }}
            />

            <p className="">Message: </p>
            <textarea className=""
                required
                value={message}
                name="message"
                type="textarea"
                placeholder="The body of your message to the recipient"
                rows={10}
                onChange={handleInputChange}
                onBlur={() => {
                    if (message === '' || /^\s+[\s]$/.test(String(message))) {
                        setError('Please enter a message, blank space is not counted.');
                    } else if (!messageRegex.test(String(message))) {
                        setError('Something went wrong. Try to avoid complex characters or emojis/emoticons in the message please.');
                    } else {
                        setError('');
                    }
                }}
            />

            {error && <div className="">{error}</div>}

            <ShowCheckReturn checkReturn={checkReturn}/>

            <br />
            <button className="" type="submit" disabled={errorCheck(error)}>Submit</button>
        </form>
    ) 
}