// import { useState } from "react";
import EmailForm from "../components/EmailPage2/FormElement2";
import AsideSelector from "../components/EmailPage2/AsideSelector2";

import { useForm } from "react-hook-form";

export default function EmailPage2() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const onSubmit = (data) => console.log(data);

    return (
        <main>
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