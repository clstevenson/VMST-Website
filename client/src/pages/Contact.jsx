// import { useState } from "react";
import EmailForm from "../components/EmailPage/FormElement";
import AsideSelector from "../components/EmailPage/AsideSelector";
import "../components/GenPageSetUp/index.css";
import { useForm } from "react-hook-form";

import { useMutation } from '@apollo/client';
import { EMAIL_LEADERS } from '../utils/mutations';
import { EMAIL_GROUP } from "../utils/mutations";

export default function EmailPage2() {
    const [emailLeaders, { error: leaderError }] = useMutation(EMAIL_LEADERS);
    const [emailGroup, { error: groupError }] = useMutation(EMAIL_GROUP);
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
        try {
            if (emailData.id.length > 0){
                // try{
                //     emailLeaders({ variables: { emailData } });
                // } catch(err) {
                //     console.log(err);
                // }
                try{
                    emailGroup({ variables: { emailData } });
                } catch(err){
                    console.log(err);
                }
            } else {
                throw new TypeError;
            }
        } catch (err) {
            if (err instanceof TypeError) {
                setError('recipient', { type: 'custom', message: "please select at least 1 recipient" })
            } else {
                console.log(err);
            }
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
