// import { useState } from "react";
import EmailForm from "../components/EmailPage/FormElement";
import AsideSelector from "../components/EmailPage/AsideSelector";
import { useForm } from "react-hook-form";

import { useMutation } from '@apollo/client';
import { EMAIL_LEADERS } from '../utils/mutations';
import { EMAIL_GROUP } from "../utils/mutations";

import {Form, FormGroup, FormText} from 'react-bootstrap'


export default function EmailPage2() {
    const [emailLeaders, { error: leaderError }] = useMutation(EMAIL_LEADERS);
    const [emailGroup, { error: groupError }] = useMutation(EMAIL_GROUP);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
        reset,
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
                try{
                    emailLeaders({ variables: { emailData } });
                    reset();
                } catch(err) {
                    console.log(err);
                }
                try{
                    emailGroup({ variables: { emailData } });
                    reset();
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
            <Form name="form" onSubmit={handleSubmit(onSubmit)}>
                <FormGroup>
                    <AsideSelector register={register} handleSubmit={handleSubmit} errors={errors}/>
                    {errors.recipient && <FormText>{errors.recipient.message}</FormText>}
                </FormGroup>

                <EmailForm register={register} handleSubmit={handleSubmit} errors={errors}/>
            </Form>
        </main>
    );
}
