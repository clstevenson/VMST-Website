// import { useState } from "react";
import EmailForm from "../components/EmailPage/FormElement";
import AsideSelector from "../components/EmailPage/AsideSelector";
import "../components/GenPageSetUp/index.css";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_LEADERS } from '../utils/queries';
import { EMAIL_LEADERS } from '../utils/mutations';

export default function EmailPage2() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const onSubmit = (data) => console.log(data);

    // you will use a call like const { loading, data } = useQuery(QUERY_LEADERS);
    // Look at activity 13-14 in module 21
    // once data is resolved it will have a property called getLeaders that is an array of objects

    // for useMutation, look at activities 17-18 and also my UploadMembers page

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
