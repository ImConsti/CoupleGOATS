"use client";

import "./navigationBar.css";

export default function NavigationBar() {
    return (
        <nav className="navbar">
            <div className="navbarContent">
                <div className="iconDiv">
                    <img src="/paw.svg" alt="Paw Icon" className="w-6 h-6 scale-200"/>
                </div>

                <h1>
                    <span className="coupleGoatsFont greenFont text-4xl">Couple</span>
                    <span className="coupleGoatsFont orangeFont text-4xl">GOATS</span>
                </h1>
            </div>
        </nav>
    );
}