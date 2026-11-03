import type {ReactNode} from "react";
import ProtectedRoute from "@/components/protectedRoute";

export default function UserLayout({children}: {children: ReactNode}) {
    return <ProtectedRoute allowedRole="user">{children}</ProtectedRoute>;
}
