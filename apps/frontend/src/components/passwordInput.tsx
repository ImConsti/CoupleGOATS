"use client";

import "./passwordInput.css";
import {useState, InputHTMLAttributes} from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function PasswordInput({...props}: PasswordInputProps){

    const [isEyeVisible, setIsEyeVisible] = useState(true);

    async function switchEye() {
        setIsEyeVisible(!isEyeVisible);
    }

    return(
        <div className="password-wrapper">
            <input type={isEyeVisible ? "password" : "text"} className="textfield" {...props}/>
            <button className="password-toggle" onClick={switchEye}>
                <img src={isEyeVisible ? "/showEye.svg" : "/hideEye.svg"} alt="showPW" />
            </button>
        </div>
    )
}