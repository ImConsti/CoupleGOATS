
import "../css/loginPage.css";
export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col gap-4 w-full max-w-md">
                <div>
                    <h1 className="loginHeader">
                        Willkommen bei <span className="greenFont">Couple</span><span className="orangeFont">GOATS</span>
                    </h1>
                    <h3>Melde dich an um loszulegen</h3>
                </div>
                <button className="selectRoleButton">
                    <div className="iconDiv">
                        <img src="/heart.svg" alt="Heart Icon" className="w-6 h-6"/>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 text-lg">Ich bin Adoptierender</span>
                        <span className="block text-gray-500 text-sm">Finde und treffe Tiere</span>
                    </div>
                </button>
                
                <button className="selectRoleButton">
                    <div className="iconDiv">
                        <img src="/house.svg" alt="House Icon" className="w-6 h-6"/>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 text-lg">Ich repräsentiere ein Tierheim</span>
                        <span className="block text-gray-500 text-sm">Verwalte Tiere und Anfragen</span>
                    </div>
                </button>
            </div>
        </main>
    );
}
