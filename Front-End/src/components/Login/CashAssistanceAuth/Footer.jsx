import React, { useState, useEffect, useRef } from "react";
import logo from "../../../assets/republic.png";

const FooterQuickAccess = ({ currentPage, setCurrentPage, onNavigateToSection }) => {
    const lastClickedPageRef = useRef(null);

    const pages = [
        { id: "hero", label: "Home" },
        { id: "news", label: "News & Info" },
        { id: "gallery", label: "Tourism" },
        { id: "about", label: "About Us" },
    ];

    const governmentLinks = [
        { name: "Office of the President", url: "#" },
        { name: "Office of the Vice President", url: "https://www.ovp.gov.ph" },
        { name: "Senate of the Philippines", url: "https://legacy.senate.gov.ph" },
        { name: "House of Representatives", url: "https://www.congress.gov.ph" },
        { name: "Sandiganbayan", url: "https://sb.judiciary.gov.ph" },
        { name: "Supreme Court", url: "https://sc.judiciary.gov.ph" },
        { name: "GOV.PH", url: "https://www.gov.ph" },
    ];

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const top = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    const handlePageClick = (pageId) => {
        if (onNavigateToSection) {
            onNavigateToSection(pageId);
            return;
        }

        const isSamePage = lastClickedPageRef.current === pageId && currentPage === pageId;

        if (isSamePage) {
            scrollToSection(pageId);
            return;
        }

        setCurrentPage(pageId);
        lastClickedPageRef.current = pageId;

        if (pageId === "hero") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            scrollToSection(pageId);
        }
    };

    return (
        <footer className="border-t border-blue-800 bg-blue-950 shadow-lg">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
                {/* MAIN FOOTER CONTENT - RESPONSIVE LAYOUT */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 lg:gap-12">
                    {/* COLUMN 1: BRAND & DESCRIPTION - Full width on mobile, 2 cols on medium, 1 col on large */}
                    <div className="sm:col-span-2 md:col-span-1">
                        <div className="flex flex-col items-center md:items-start">
                            <div className="mb-4 flex flex-col items-center gap-4 sm:flex-row">
                                <div className="h-14 w-14 flex-shrink-0 sm:h-16 sm:w-16">
                                    <img
                                        src={logo}
                                        alt="Republic of the Philippines Seal"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg font-bold text-white">Republic of the Philippines</h3>
                                    <p className="mt-1 text-xs text-blue-300">Province of Biliran</p>
                                </div>
                            </div>
                            <p className="text-center text-sm text-blue-200 md:text-left">
                                Serving with integrity, transparency, and dedication for the progress of every Biliranon.
                            </p>
                        </div>

                        {/* PUBLIC DOMAIN NOTE - Hidden on small mobile, shown on larger */}
                        <div className="mt-4 sm:mt-6">
                            <p className="text-xs italic text-blue-300">All content is in the public domain unless otherwise stated.</p>
                        </div>
                    </div>
                    {/* COLUMN 3: GOVERNMENT LINKS */}
                    <div className="mt-4 sm:mt-0">
                        <h4 className="mb-4 border-b-2 border-red-600 pb-2 text-base font-bold text-white md:mb-6 md:text-lg">Government Links</h4>
                        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-1">
                            {governmentLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-xs text-blue-200 transition-colors duration-200 hover:text-yellow-300 sm:text-sm"
                                    >
                                        <span className="mr-2 text-xs">›</span>
                                        <span className="truncate">{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="mt-6 border-t border-blue-800 pt-4 md:mt-8 md:pt-6">
                    <div className="flex flex-col items-center justify-between gap-3 md:flex-row md:gap-4">
                        <p className="order-2 text-center text-xs text-blue-300 sm:text-sm md:order-1 md:text-left">
                            &copy; {new Date().getFullYear()} Biliran Province Cash Assistance Distribution Program All rights reserved.
                        </p>
                        <div className="order-1 mb-3 flex flex-wrap justify-center gap-4 md:order-2 md:mb-0 md:gap-6">
                            <a className="cursor-pointer text-xs text-blue-300 transition-colors duration-200 hover:text-white sm:text-sm">
                                Privacy Policy
                            </a>
                            <a className="cursor-pointer text-xs text-blue-300 transition-colors duration-200 hover:text-white sm:text-sm">
                                Terms of Service
                            </a>
                            <a className="cursor-pointer text-xs text-blue-300 transition-colors duration-200 hover:text-white sm:text-sm">Sitemap</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterQuickAccess;
