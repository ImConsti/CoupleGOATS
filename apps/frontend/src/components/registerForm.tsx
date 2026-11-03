"use client";

import {useState} from "react";
import PasswordInput from "@/components/passwordInput";
import EmailInput from "@/components/emailInput";
import {useAuth} from "@/components/authProvider";
import type {AuthRole} from "@/components/authFlow";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function RegisterForm({role}: {role: AuthRole}) {

    const {signIn} = useAuth();

    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // gemeinsame Felder
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");

    // Adoptierende
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [houseType, setHouseType] = useState<"apartment" | "house">("apartment");
    const [hasGarden, setHasGarden] = useState(false);
    const [hasChildren, setHasChildren] = useState(false);
    const [roamingPossible, setRoamingPossible] = useState(false);

    // Tierheim
    const [shelterName, setShelterName] = useState("");

    function validate(): string {
        if (role === "user" && (!firstName.trim() || !lastName.trim())) {
            return "Bitte gib Vor- und Nachname an.";
        }
        if (role === "shelter" && !shelterName.trim()) {
            return "Bitte gib den Namen des Tierheims an.";
        }
        if (!email.trim()) {
            return "Bitte gib eine E-Mail-Adresse an.";
        }
        if (password.length < 8 || password.length > 72) {
            return "Das Passwort muss zwischen 8 und 72 Zeichen lang sein.";
        }
        if (password !== passwordRepeat) {
            return "Die Passwörter stimmen nicht überein.";
        }
        if (!streetAddress.trim() || !city.trim()) {
            return "Bitte gib Straße und Ort an.";
        }
        if (!/^\d{5}$/.test(postalCode)) {
            return "Die Postleitzahl muss aus 5 Ziffern bestehen.";
        }
        return "";
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();

        const validationError = validate();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        const body = role === "user"
            ? {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email,
                password,
                streetAddress: streetAddress.trim(),
                postalCode,
                city: city.trim(),
                houseType,
                hasGarden,
                hasChildren,
                roamingPossible,
            }
            : {
                name: shelterName.trim(),
                email,
                password,
                streetAddress: streetAddress.trim(),
                postalCode,
                city: city.trim(),
            };

        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch(`${API_URL}/api/v1/auth/register/${role}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                setErrorMessage(
                    response.status === 409
                        ? "Mit dieser E-Mail-Adresse existiert bereits ein Account."
                        : "Registrierung fehlgeschlagen. Bitte überprüfe deine Eingaben."
                );
                return;
            }

            const data = await response.json();

            // Token speichern + Anmeldestatus laden, die Weiterleitung übernimmt AuthFlow
            await signIn(data.token);
        } catch {
            setErrorMessage("Der Server ist nicht erreichbar. Bitte versuche es später erneut.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleRegister}>
            {role === "user" ? (
                <div className="registerRow">
                    <div>
                        <h3 className="descriptionText">Vorname:</h3>
                        <input type="text" className="textfield" placeholder=" Max" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                    </div>
                    <div>
                        <h3 className="descriptionText">Nachname:</h3>
                        <input type="text" className="textfield" placeholder=" Mustermann" value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                    </div>
                </div>
            ) : (
                <div>
                    <h3 className="descriptionText">Name des Tierheims:</h3>
                    <input type="text" className="textfield" placeholder=" Tierheim Musterstadt" value={shelterName} onChange={(e) => setShelterName(e.target.value)}/>
                </div>
            )}
            <br />

            <h3 className="descriptionText">E-Mail:</h3>
            <EmailInput value={email} onChange={(e) => setEmail(e.target.value)}/>
            <br />
            <br />
            <h3 className="descriptionText">Passwort:</h3>
            <PasswordInput placeholder="Mindestens 8 Zeichen" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <br />
            <br />
            <h3 className="descriptionText">Passwort wiederholen:</h3>
            <PasswordInput placeholder="Passwort wiederholen" value={passwordRepeat} onChange={(e) => setPasswordRepeat(e.target.value)}/>
            <br />
            <br />

            <h3 className="descriptionText">Straße und Hausnummer:</h3>
            <input type="text" className="textfield" placeholder=" Musterstraße 1" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)}/>
            <br />
            <br />
            <div className="registerRow registerRowPostal">
                <div>
                    <h3 className="descriptionText">PLZ:</h3>
                    <input type="text" inputMode="numeric" maxLength={5} className="textfield" placeholder=" 12345" value={postalCode} onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}/>
                </div>
                <div>
                    <h3 className="descriptionText">Ort:</h3>
                    <input type="text" className="textfield" placeholder=" Musterstadt" value={city} onChange={(e) => setCity(e.target.value)}/>
                </div>
            </div>
            <br />

            {role === "user" && (
                <div>
                    <h3 className="descriptionText">Wohnsituation:</h3>
                    <select className="textfield" value={houseType} onChange={(e) => setHouseType(e.target.value as "apartment" | "house")}>
                        <option value="apartment">Wohnung</option>
                        <option value="house">Haus</option>
                    </select>
                    <br />
                    <br />
                    <label className="checkboxRow">
                        <input type="checkbox" checked={hasGarden} onChange={(e) => setHasGarden(e.target.checked)}/>
                        <span>Ich habe einen Garten</span>
                    </label>
                    <label className="checkboxRow">
                        <input type="checkbox" checked={hasChildren} onChange={(e) => setHasChildren(e.target.checked)}/>
                        <span>Es leben Kinder in meinem Haushalt</span>
                    </label>
                    <label className="checkboxRow">
                        <input type="checkbox" checked={roamingPossible} onChange={(e) => setRoamingPossible(e.target.checked)}/>
                        <span>Freigang ist möglich</span>
                    </label>
                    <br />
                </div>
            )}

            {errorMessage && (
                <span className="block text-red-500 mb-2">{errorMessage}</span>
            )}
            <button type="submit" className="submitButton" disabled={isLoading}>
                {isLoading ? "Wird erstellt..." : role === "user" ? "Als Adoptierender registrieren" : "Als Tierheim registrieren"}
            </button>
        </form>
    );
}
