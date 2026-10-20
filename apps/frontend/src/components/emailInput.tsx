"use client";

import "./emailInput.css";
import {InputHTMLAttributes} from "react";

type EmailInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function EmailInput({...props}: EmailInputProps) {
    return(
        <input type="email" className="textfield" placeholder=" you@example.com" {...props}></input>
    )
}