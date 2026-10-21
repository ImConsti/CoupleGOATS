"use client";

import {useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import "./navigationBar.css";
import { useState } from "react";
import { logout } from "@/lib/logout";

type NavBarAttributes = {userType: "user" | "shelter"};

export default function NavigationBar({userType}:NavBarAttributes) {

    const router = useRouter();
    const pathName = usePathname();
    const isUser = userType === "user";
    const [isLogoutDivVisible, setIsLogoutDivVisible] = useState(false)

    const basePath = isUser ? "/user" : "/shelter";

    const firstPath  = isUser ? `${basePath}/discover` : `${basePath}/overview`;
    const secondPath = isUser ? `${basePath}/matches`  : `${basePath}/animals`;

    async function handleLogout() {
        await logout();
        router.push("/auth/login");
    }

    return (
        <nav className="navbar">

            <div className="navbarLogo">
                <div className="iconDivLogo">
                    <img src="/paw.svg" alt="Paw Icon" className="w-6 h-6 scale-200"/>
                </div>

                <h1>
                    <span className="coupleGoatsFont greenFont text-4xl">Couple</span>
                    <span className="coupleGoatsFont orangeFont text-4xl">GOATS</span>
                </h1>
            </div>

            <div className="navbarItemGroup">
                <Link href={firstPath} className={pathName === firstPath ? "navItem selectedTab" : "navItem"}>
                    <p className="navItemContent">{isUser ? <><img src="/compass.svg" alt="compass icon" className="navIcon"/> Entdecken</> : <><img src="/house.svg" alt="house icon" className="navIcon"/> Übersicht</>}</p>
                </Link>

                <Link href={secondPath} className={pathName === secondPath ? "navItem selectedTab" : "navItem"}>
                    <p className="navItemContent">{isUser ? <><img src="/heart.svg" alt="heart icon" className="navIcon"/> Matches</> : <><img src="/paw2.svg" alt="paw icon" className="navIcon"/> Tiere</>}</p>
                </Link>

                <Link href={basePath+"/appointments"} className={pathName === basePath+"/appointments" ? "navItem selectedTab" : "navItem"}>
                    <p className="navItemContent"><img src="/calender.svg" alt="calender icon" className="navIcon"/> Termine</p>
                </Link>

                <Link href={basePath+"/profile"} className={pathName === basePath+"/profile" ? "navItem selectedTab" : "navItem"}>
                    <p className="navItemContent"><img src="/person.svg" alt="person icon" className="navIcon"/> Profil</p>
                </Link>
            </div>

            <div className="userMenu">
                <div className="userIcon" onClick={()=>setIsLogoutDivVisible(!isLogoutDivVisible)}>
                    <img src="/userIcon.svg" alt="User Icon" className="w-5 h-5 scale-200"/>
                </div>

                {isLogoutDivVisible && (
                    <div className="logoutDiv">
                        <div className="logoutItem" onClick={handleLogout}>Logout<img src="/logout.svg" alt="logout icon"/></div>
                    </div>
                )}
            </div>
            
        </nav>
    );
}   