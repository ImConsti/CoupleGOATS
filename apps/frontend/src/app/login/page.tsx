"use client";

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import "../css/loginPage.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function LoginPage() {

    const router = useRouter();

    const [isAdopterLoginVisible, setIsAdopterLoginVisible] = useState(false);
    const [isShelterLoginVisible, setIsShelterLoginVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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

    async function handleLogin(role: "user" | "shelter") {
        const response = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password, role}),
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        localStorage.setItem("token", data.token);
        router.push(role === "shelter" ? "/dashboard" : "/swipe");
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

                <button className={`selectRoleButton ${isAdopterLoginVisible ? "buttonSelected" : ""}`} onClick={()=>showInputDiv("adopter")}>
                    <div className="iconDiv">
                        <img src="/heart.svg" alt="Heart Icon" className="w-6 h-6"/>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 text-lg">Ich bin Adoptierender</span>
                        <span className="descriptionText">Finde und treffe Tiere</span>
                    </div>
                </button>
                
                <button className={`selectRoleButton ${isShelterLoginVisible ? "buttonSelected" : ""}`} onClick={()=>showInputDiv("shelter")}>
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
                        <input type="email" className="textfield" placeholder=" you@example.com"  onChange={(e) => setEmail(e.target.value)}></input>
                        <br />
                        <br />
                        <h3 className="descriptionText">Passwort:</h3>
                        <input type="password" className="textfield" placeholder=" Enter your password" onChange={(e) => setPassword(e.target.value)}></input>
                        <br />
                        <br />
                        <button className="submitButton" onClick={()=>handleLogin("user")}>Als Adoptierender anmelden</button>
                        <h3 className="descriptionText">Neu bei CoupleGOATS? <Link href="/register" className="greenFont underline">erstelle einen Account</Link></h3>
                    </div>    
                )}

                {isShelterLoginVisible && (
                    <div>
                        <hr />
                        <br />
                        <h3 className="descriptionText">E-Mail:</h3>
                        <input type="email" className="textfield" placeholder=" team@your-shelter.org" onChange={(e) => setEmail(e.target.value)}></input>
                        <br />
                        <br />
                        <h3 className="descriptionText">Passwort:</h3>
                        <input type="password" className="textfield" placeholder=" Enter your password" onChange={(e) => setPassword(e.target.value)}></input>
                        <br />
                        <br />
                        <button className="submitButton" onClick={()=>handleLogin("shelter")}>Als Tierheim anmelden</button>
                        <h3 className="descriptionText">Neu bei CoupleGOATS? <Link href="/register" className="greenFont underline">erstelle einen Account</Link></h3>
                    </div>
                )}
                
            </div>
        </main>
    );
}