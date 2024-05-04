// import { useState } from "react";
import EmailForm from "../components/EmailPage/FormElement";
import AsideSelector from "../components/EmailPage/AsideSelector";
import "../components/GenPageSetUp/index.css";
import { useForm } from "react-hook-form";

import { useMutation } from '@apollo/client';
import { EMAIL_LEADERS } from '../utils/mutations';

export default function EmailPage2() {
    const [emailLeaders, { error }] = useMutation(EMAIL_LEADERS);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        const emailData = 
        {
            from: data.name,
            html: '<b>'+data.message+'</b>',
            id: data.recipient,
            plainText: data.message,
            subject: data.title,
            replyTo: data.email
        }

        if(emailData.id.length > 0){
            try {
                emailLeaders({ variables: { emailData } })
            } catch {
                console.log(error);
            }
        } else {
            setError('recipient', {type: 'custom', message: "please select at least 1 recipient"})
        }
    };

    return (
        <main className="formatpage">
            <h2>
                Contact Us
            </h2>
            <form name="form" onSubmit={handleSubmit(onSubmit)}>
                <AsideSelector register={register} handleSubmit={handleSubmit} errors={errors}/>
                {errors.recipient && <p>{errors.recipient.message}</p>}

                <EmailForm register={register} handleSubmit={handleSubmit} errors={errors}/>
            </form>
        </main>
    );
}
