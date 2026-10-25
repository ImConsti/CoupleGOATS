"use client";

import { useState } from "react";
import "./authFlow.css";
import "../app/auth/login/loginPage.css";
import "../app/globals.css";
import LoginForm from "@/components/loginForm";
import RegisterForm from "@/components/registerForm";

export type AuthRole = "user" | "shelter";
type AuthMode = "login" | "register";

type AuthFlowProps = {
    initialMode: AuthMode;
};

export default function AuthFlow({ initialMode }: AuthFlowProps) {

    const [role, setRole] = useState<AuthRole | null>(null);
    const [mode, setMode] = useState<AuthMode>(initialMode);

    function switchMode(newMode: AuthMode) {
        if (newMode === mode) return;
        setMode(newMode);
        // URL anpassen, ohne die Seite neu zu laden
        window.history.replaceState(null, "", `/auth/${newMode}`);
    }

    return (
        <main className="flex min-h-screen items-center justify-center py-10">
            <div className="flex flex-col gap-4 w-full max-w-md">
                <div>
                    <h1 className="loginHeader">
                        Willkommen bei <span className="coupleGoatsFont greenFont text-6xl">Couple</span><span className="coupleGoatsFont orangeFont text-6xl">GOATS</span>
                    </h1>
                    <br />
                    <h3 className="descriptionText">
                        {role === null
                            ? "Melde dich an oder erstelle einen Account um loszulegen"
                            : mode === "login"
                                ? "Melde dich an um loszulegen"
                                : "Erstelle einen Account um loszulegen"}
                    </h3>
                </div>

                {role === null ? (
                    <>
                        <button className="selectRoleButton" onClick={() => setRole("user")}>
                            <div className="iconDiv">
                                <img src="/heart.svg" alt="Heart Icon" className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-900 text-lg">Ich bin Adoptierender</span>
                                <span className="descriptionText">Finde und treffe Tiere</span>
                            </div>
                        </button>

                        <button className="selectRoleButton" onClick={() => setRole("shelter")}>
                            <div className="iconDiv">
                                <img src="/house.svg" alt="House Icon" className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-900 text-lg">Ich repräsentiere ein Tierheim</span>
                                <span className="descriptionText">Verwalte Tiere und Anfragen</span>
                            </div>
                        </button>
                    </>
                ) : (
                    <>
                        <button className="backButton" onClick={() => setRole(null)}>
                            ← Rolle ändern ({role === "user" ? "Adoptierender" : "Tierheim"})
                        </button>

                        <div>
                            {/* Reiter: der "Hügel" gleitet zwischen links und rechts */}
                            <div className="authTabs">
                                <div className={`authHill ${mode === "register" ? "authHillRight" : ""}`} />
                                <button
                                    className={`authTab ${mode === "login" ? "authTabActive" : ""}`}
                                    onClick={() => switchMode("login")}
                                >
                                    Login
                                </button>
                                <button
                                    className={`authTab ${mode === "register" ? "authTabActive" : ""}`}
                                    onClick={() => switchMode("register")}
                                >
                                    Registrieren
                                </button>
                            </div>

                            {/* Karte: Inhalt wechselt, key sorgt für die Animation */}
                            <div className={`authBody ${mode === "login" ? "authBodyLogin" : "authBodyRegister"}`}>
                                <div key={mode} className={mode === "login" ? "slideInLeft" : "slideInRight"}>
                                    {mode === "login"
                                        ? <LoginForm role={role} />
                                        : <RegisterForm role={role} />}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
