"use client";

import {useState} from "react";
import Link from "next/link";
import "../css/loginPage.css";

export default function LoginPage() {

    const [isAdopterLoginVisible, setIsAdopterLoginVisible] = useState(false);
    const [isShelterLoginVisible, setIsShelterLoginVisible] = useState(false);

    function showInputDiv(role : string){
        if(role == "adopter"){
            setIsShelterLoginVisible(false);
            setIsAdopterLoginVisible(true);
        }
        else{
            setIsAdopterLoginVisible(false);
            setIsShelterLoginVisible(true);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col gap-4 w-full max-w-md">
                <div>
                    <h1 className="loginHeader">
                        Willkommen bei <span className="coupleGoatsFont greenFont text-6xl">Couple</span><span className="coupleGoatsFont orangeFont text-6xl">GOATS</span>
                    </h1>
                    <br />
                    <h3 className="descriptionText">Melde dich an um loszulegen</h3>
                </div>

                <button className="selectRoleButton" onClick={()=>showInputDiv("adopter")}>
                    <div className="iconDiv">
                        <img src="/heart.svg" alt="Heart Icon" className="w-6 h-6"/>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 text-lg">Ich bin Adoptierender</span>
                        <span className="descriptionText">Finde und treffe Tiere</span>
                    </div>
                </button>
                
                <button className="selectRoleButton" onClick={()=>showInputDiv("shelter")}>
                    <div className="iconDiv">
                        <img src="/house.svg" alt="House Icon" className="w-6 h-6"/>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 text-lg">Ich repräsentiere ein Tierheim</span>
                        <span className="descriptionText">Verwalte Tiere und Anfragen</span>
                    </div>
                </button>

                {isAdopterLoginVisible && (
                    <div>
                        <hr />
                        <br />
                        <h3 className="descriptionText">E-Mail:</h3>
                        <input type="email" className="textfield" placeholder=" you@example.com"></input>
                        <br />
                        <br />
                        <h3 className="descriptionText">Passwort:</h3>
                        <input type="password" className="textfield" placeholder=" Enter your password"></input>
                        <br />
                        <br />
                        <button className="submitButton">Als Adoptierender anmelden</button>
                        <h3 className="descriptionText">Neu bei CoupleGOATS? <Link href="/register" className="greenFont underline">erstelle einen Account</Link></h3>
                    </div>
                )}

                {isShelterLoginVisible && (
                    <div>
                        anmeldung Tierheim
                    </div>
                )}
                
            </div>
        </main>
    );
}