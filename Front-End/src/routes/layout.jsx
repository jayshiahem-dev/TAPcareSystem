import { Outlet } from "react-router-dom";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "@/hooks/use-click-outside";
import { Sidebar } from "@/layouts/sidebar";
import { Header } from "@/layouts/header";
import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";

const Layout = () => {
    const isDesktopDevice = useMediaQuery("(min-width: 768px)");
    
    // DEFAULT: Laging true (collapsed) sa simula kahit desktop o mobile
    const [collapsed, setCollapsed] = useState(true);

    const sidebarRef = useRef(null);

    // Inalis o ni-comment out natin ang useEffect na nag-o-auto open 
    // para hindi ma-override ang "collapsed: true" state mo.
    /* useEffect(() => {
        setCollapsed(!isDesktopDevice);
    }, [isDesktopDevice]); 
    */

    useClickOutside([sidebarRef], () => {
        // Sa mobile lang dapat gumana ang click outside para i-close ang sidebar
        if (!isDesktopDevice && !collapsed) {
            setCollapsed(true);
        }
    });

    return (
        <div className="min-h-screen bg-slate-100 transition-colors dark:bg-slate-950">
            {/* Overlay para sa Mobile */}
            <div
                className={cn(
                    "pointer-events-none fixed inset-0 -z-10 bg-black opacity-0 transition-opacity",
                    !collapsed && "max-md:pointer-events-auto max-md:z-50 max-md:opacity-30",
                )}
            />
            
            <Sidebar
                ref={sidebarRef}
                collapsed={collapsed}
            />

            <div 
                className={cn(
                    "transition-[margin] duration-300", 
                    // Tinitiyak na tama ang margin depende sa state
                    collapsed ? "md:ml-[70px]" : "md:ml-[260px]" 
                )}
            >
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />
                
                <main className="h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;