const nameRegex = /^[A-Za-z0-9]+$/;
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const titleRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(\;+=._\s]{1,40}$/;
const messageRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(\;+=._\s]+$/;

export default function EmailForm({register, errors}) {
    //returning the form component
    return(
        <div>
            {errors.recipients && <p>choose one please</p>}

            <label>Name:</label>
            <input
                ype="text"
                placeholder="Your name"
                {...register('name', {required: true}, { pattern: {nameRegex} })}
            />
            {errors.name && <p>This field is required</p>}

            <br />
            <label>Email:</label>
            <input
                type="email"
                placeholder="Your email"
                {...register('email', { required: true }, { pattern: {emailRegex} })}
            />
            {errors.email && <p>This field is required</p>}

            <br />
            <label>Title:</label>
            <input
                type="text"
                placeholder="Title of your email"
                {...register('title', { required: true }, { pattern: { titleRegex } })}
            />
            {errors.title && <p>This field is required</p>}

            <br />
            <label>Message: </label>
            <textarea
                type="textarea"
                placeholder="The body of your message to the recipient"
                rows={10}
                {...register('message', { required: true }, { pattern: { messageRegex } })}
            />
            {errors.message && <p>This field is required</p>}


            <br />
            <button type="submit">Submit</button>
        </div>
    ) 
}