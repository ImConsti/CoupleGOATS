const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function logout() {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            await fetch(`${API_URL}/api/v1/auth/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch{}
    }
    localStorage.removeItem("token");
}