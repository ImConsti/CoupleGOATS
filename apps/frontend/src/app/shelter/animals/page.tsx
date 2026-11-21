import "../../globals.css";
import "./animalsPage.css";
import Link from "next/link";
import NavigationBar from "@/components/navigationBar";

export default function AnimalsPage() {
    return (
        <main>
            <NavigationBar userType="shelter"/>

            <div className="animalsPage">
                <header className="animalsHeader">
                    <div>
                        <p className="animalsEyebrow">Tierprofile</p>
                        <h1 className="animalsTitle">Alle Tiere</h1>
                        <p className="animalsSubtitle">Verwalte alle Tierprofile und halte die Vermittlungsdaten aktuell.</p>
                    </div>
                    <Link href="/shelter/animals/new" className="animalsAddButton">
                        <span aria-hidden="true">+</span> Tier hinzufügen
                    </Link>
                </header>
            </div>
        </main>
    );
}