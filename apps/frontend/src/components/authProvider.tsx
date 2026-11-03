"use client";

import {createContext, useCallback, useContext, useEffect, useState, type ReactNode} from "react";
import {fetchMe, saveToken, type AuthUser} from "@/lib/auth";
import {logout} from "@/lib/logout";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
    status: AuthStatus;
    user: AuthUser | null;
    /** Nach erfolgreichem Login/Registrieren aufrufen: speichert das Token und lädt den Nutzer. */
    signIn: (token: string) => Promise<void>;
    /** Meldet beim Backend ab, löscht das Token und setzt den Status zurück. */
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth muss innerhalb von <AuthProvider> verwendet werden");
    }
    return context;
}

export default function AuthProvider({children}: {children: ReactNode}) {

    const [status, setStatus] = useState<AuthStatus>("loading");
    const [user, setUser] = useState<AuthUser | null>(null);

    const applyUser = useCallback((me: AuthUser | null) => {
        setUser(me);
        setStatus(me ? "authenticated" : "unauthenticated");
    }, []);

    // Beim ersten Laden prüfen, ob schon jemand angemeldet ist
    useEffect(() => {
        let cancelled = false;
        fetchMe()
            .then((me) => { if (!cancelled) applyUser(me); })
            .catch(() => { if (!cancelled) applyUser(null); }); // z.B. Backend nicht erreichbar
        return () => { cancelled = true; };
    }, [applyUser]);

    const signIn = useCallback(async (token: string) => {
        saveToken(token);
        try {
            applyUser(await fetchMe());
        } catch {
            applyUser(null);
        }
    }, [applyUser]);

    const signOut = useCallback(async () => {
        await logout();
        applyUser(null);
    }, [applyUser]);

    return (
        <AuthContext.Provider value={{status, user, signIn, signOut}}>
            {children}
        </AuthContext.Provider>
    );
}
