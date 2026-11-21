"use client";

import type {ReactNode} from "react";
// TODO: Beim Wiedereinschalten der Auth diese Imports einkommentieren (und den Import von ReactNode oben beibehalten):
// import {useEffect} from "react";
// import {useRouter} from "next/navigation";
// import {useAuth} from "@/components/authProvider";
// import {canAccess, homePathForRole} from "@/lib/auth";
import type {AreaRole} from "@/lib/auth";

type ProtectedRouteProps = {
    allowedRole: AreaRole;
    children: ReactNode;
};

/**
 * Schützt einen Bereich:
 * - nicht angemeldet        -> /auth/login
 * - angemeldet, falsche Rolle -> eigene Startseite
 * Die Inhalte werden erst gerendert, wenn beides passt.
 *
 * ACHTUNG: Die Auth ist aktuell DEAKTIVIERT (zum Entwickeln), jeder kann alle Seiten sehen.
 * TODO: Vor dem Livegang die echte Auth unten wieder einkommentieren und den
 *       temporären "return <>{children}</>" entfernen.
 */
export default function ProtectedRoute({allowedRole, children}: ProtectedRouteProps) {

    void allowedRole; // TODO: entfernen, sobald die echte Auth wieder aktiv ist

    // ---------- TODO: ECHTE AUTH - WIEDER EINKOMMENTIEREN ----------
    // const router = useRouter();
    // const {status, user} = useAuth();
    //
    // const isAllowed = status === "authenticated" && user !== null && canAccess(user.role, allowedRole);
    //
    // useEffect(() => {
    //     if (status === "unauthenticated") {
    //         router.replace("/auth/login");
    //     } else if (status === "authenticated" && user && !isAllowed) {
    //         router.replace(homePathForRole(user.role));
    //     }
    // }, [status, user, isAllowed, router]);
    //
    // if (!isAllowed) {
    //     return (
    //         <main className="flex min-h-screen items-center justify-center">
    //             <p className="text-gray-500 text-sm">Wird geladen...</p>
    //         </main>
    //     );
    // }
    // ---------------------------------------------------------------

    // TEMPORÄR: kein Zugriffsschutz
    return <>{children}</>;
}
