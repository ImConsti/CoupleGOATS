"use client";

import "./emailInput.css";
import {InputHTMLAttributes} from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function EmailInput({...props}: PasswordInputProps) {
    return(
        <input type="email" className="textfield" placeholder=" you@example.com" {...props}></input>
    )
}