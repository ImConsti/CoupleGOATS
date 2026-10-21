import "../../globals.css";
import NavigationBar from "@/components/navigationBar";

export default function ProfilePage() {
    return (
        <main>
            <NavigationBar userType="user"/>
            <h1>Profile</h1>
            <p>Diese Seite befindet sich noch in Entwicklung.</p>
        </main>
    );
}