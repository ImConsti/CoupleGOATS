"use client";

import {useState} from "react";
import PasswordInput from "@/components/passwordInput";
import EmailInput from "@/components/emailInput";
import {useAuth} from "@/components/authProvider";
import type {AuthRole} from "@/components/authFlow";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function LoginForm({role}: {role: AuthRole}) {

    const {signIn} = useAuth();

    const [isLoginValid, setIsLoginValid] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/v1/auth/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password, role}),
            });

            if (!response.ok) {
                setIsLoginValid(false);
                return;
            }

            const data = await response.json();

            // Token speichern + Anmeldestatus laden, die Weiterleitung übernimmt AuthFlow
            await signIn(data.token);
        } catch {
            setIsLoginValid(false);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <h3 className="descriptionText">E-Mail:</h3>
            <EmailInput value={email} onChange={(e) => setEmail(e.target.value)}/>
            <br />
            <br />
            <h3 className="descriptionText">Passwort:</h3>
            <PasswordInput placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <br />
            <br />
            {!isLoginValid && (
                <span className="block text-red-500 mb-2">E-Mail oder Passwort ist falsch</span>
            )}
            <button type="submit" className="submitButton" disabled={isLoading}>
                {isLoading ? "Wird angemeldet..." : role === "user" ? "Als Adoptierender anmelden" : "Als Tierheim anmelden"}
            </button>
        </form>
    );
}
