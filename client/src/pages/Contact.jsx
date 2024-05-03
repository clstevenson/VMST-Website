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
        try{
            emailLeaders({variables: { emailData }})
        } catch {
            console.log(error);
        }
    };

    return (
        <main className="formatpage">
            <h2>
                Contact Us
            </h2>
            <form name="form" onSubmit={handleSubmit(onSubmit)}>
                <AsideSelector register={register} handleSubmit={handleSubmit} errors={errors}/>

                <EmailForm register={register} handleSubmit={handleSubmit} errors={errors}/>
            </form>
        </main>
    );
}
