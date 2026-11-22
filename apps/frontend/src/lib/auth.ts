const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Role = "admin" | "user" | "shelter";
export type AreaRole = "user" | "shelter";
export type AuthUser = { id: string; role: Role };

export function getToken(): string | null {
    return localStorage.getItem("token");
}

export function saveToken(token: string) {
    localStorage.setItem("token", token);
}

export function clearToken() {
    localStorage.removeItem("token");
}

export async function fetchMe(): Promise<AuthUser | null> {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
        clearToken();
        return null;
    }
    if (!response.ok) {
        throw new Error("Anmeldestatus konnte nicht geladen werden");
    }

    const data = await response.json();
    return { id: data.id ?? data.userOrShelterId, role: data.role };
}

export function homePathForRole(role: Role): string {
    return role === "shelter" ? "/shelter/overview" : "/user/discover";
}

export function canAccess(role: Role, area: AreaRole): boolean {
    if (role === "admin") return area === "user";
    return role === area;
}
