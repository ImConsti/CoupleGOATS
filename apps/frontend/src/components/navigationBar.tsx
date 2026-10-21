"use client";

import {useRouter, usePathname } from "next/navigation";
import "./navigationBar.css";

type NavBarAttributes = {userType: "user" | "shelter"};

export default function NavigationBar({userType}:NavBarAttributes) {

    const router = useRouter();
    const pathName = usePathname();
    const isUser = userType === "user";

    const basePath = isUser ? "/user" : "/shelter";

    const firstPath  = isUser ? `${basePath}/discover` : `${basePath}/overview`;
    const secondPath = isUser ? `${basePath}/matches`  : `${basePath}/animals`;

    return (
        <nav className="navbar">

            <div className="navbarLogo">
                <div className="iconDiv">
                    <img src="/paw.svg" alt="Paw Icon" className="w-6 h-6 scale-200"/>
                </div>

                <h1>
                    <span className="coupleGoatsFont greenFont text-4xl">Couple</span>
                    <span className="coupleGoatsFont orangeFont text-4xl">GOATS</span>
                </h1>
            </div>

            <div className="navbarItemGroup">
                <div className={pathName === firstPath ? "navItem selectedTab" : "navItem"} onClick={()=>router.push(firstPath)}>
                    <p>{isUser ? "Entdecken" : "Übersicht"}</p>
                </div>
                <div className={pathName === secondPath ? "navItem selectedTab" : "navItem"} onClick={()=>router.push(secondPath)}>
                    <p>{isUser ? "Matches" : "Tiere"}</p>
                </div>
                <div className={pathName === basePath+"/appointments" ? "navItem selectedTab" : "navItem"} onClick={()=>router.push(`${basePath}/appointments`)}>
                    <p>Termine</p>
                </div>
                <div className={pathName === basePath+"/profile" ? "navItem selectedTab" : "navItem"} onClick={()=>router.push(`${basePath}/profile`)}>
                    <p>Profil</p>
                </div>
            </div>
        </nav>
    );
}