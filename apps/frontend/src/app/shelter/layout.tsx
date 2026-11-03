import type {ReactNode} from "react";
import ProtectedRoute from "@/components/protectedRoute";

export default function ShelterLayout({children}: {children: ReactNode}) {
    return <ProtectedRoute allowedRole="shelter">{children}</ProtectedRoute>;
}
