"use client";

import {useEffect, type ReactNode} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/components/authProvider";
import {canAccess, homePathForRole, type AreaRole} from "@/lib/auth";

type ProtectedRouteProps = {
    allowedRole: AreaRole;
    children: ReactNode;
};

/**
 * Schützt einen Bereich:
 * - nicht angemeldet        -> /auth/login
 * - angemeldet, falsche Rolle -> eigene Startseite
 * Die Inhalte werden erst gerendert, wenn beides passt.
 */
export default function ProtectedRoute({allowedRole, children}: ProtectedRouteProps) {

    const router = useRouter();
    const {status, user} = useAuth();

    const isAllowed = status === "authenticated" && user !== null && canAccess(user.role, allowedRole);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/auth/login");
        } else if (status === "authenticated" && user && !isAllowed) {
            router.replace(homePathForRole(user.role));
        }
    }, [status, user, isAllowed, router]);

    if (!isAllowed) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500 text-sm">Wird geladen...</p>
            </main>
        );
    }

    return <>{children}</>;
}
