import type {ReactNode} from "react";
import ProtectedRoute from "@/components/protectedRoute";

export default function ShelterLayout({children}: {children: ReactNode}) {
    // DEMO-ANFANG (Login-Prüfung aus, damit die Seiten ohne Backend erreichbar sind)
    void ProtectedRoute;
    return <>{children}</>;
    // DEMO-ENDE
    // NORMAL-ANFANG
    // return <ProtectedRoute allowedRole="shelter">{children}</ProtectedRoute>;
    // NORMAL-ENDE
}
