import { motion, AnimatePresence } from "framer-motion";
import { Home, Info, Contact, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "../../../assets/logo-login.png";

const Header = ({ showLogin, scrollToSection, handleLoginClick, mobileMenuOpen, setMobileMenuOpen }) => {
    return (
        <motion.header
            // Deep Blue Background
            className="fixed top-0 left-0 right-0 z-40 bg-blue-950/95 backdrop-blur-lg border-b border-orange-500/20 shadow-xl"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <div className="container mx-auto px-6 sm:px-12 lg:px-20 py-4">
                <div className="flex items-center justify-between">
                    <LogoSection />
                    
                    <DesktopNav 
                        showLogin={showLogin} 
                        scrollToSection={scrollToSection} 
                        handleLoginClick={handleLoginClick} 
                    />
                    
                    <MobileMenuButton 
                        mobileMenuOpen={mobileMenuOpen} 
                        setMobileMenuOpen={setMobileMenuOpen} 
                    />
                </div>
                
                <MobileMenu 
                    mobileMenuOpen={mobileMenuOpen}
                    showLogin={showLogin}
                    scrollToSection={scrollToSection}
                    handleLoginClick={handleLoginClick}
                    setMobileMenuOpen={setMobileMenuOpen}
                />
            </div>
        </motion.header>
    );
};

const LogoSection = () => (
    <motion.div 
    className="flex items-center gap-3"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
>
    {/* Orange Gradient Border for Logo */}
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 p-0.5 shadow-lg shadow-orange-900/20">
        <div className="bg-blue-900 w-full h-full rounded-lg flex items-center justify-center p-1">
            <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
        </div>
    </div>

    <div className="flex flex-col leading-tight">
        <h1 className="text-sm font-bold text-white uppercase tracking-wider">
            Republic of the Philippines
        </h1>

        <p className="text-xs text-gray-300 uppercase tracking-wide">
            Province of Biliran
        </p>

        <p className="text-orange-400 font-black text-lg tracking-tighter uppercase">
            Naval, Biliran
        </p>
    </div>
</motion.div>

);

const DesktopNav = ({ showLogin, scrollToSection, handleLoginClick }) => {
    const [activeNav, setActiveNav] = useState('home');
    
    const handleNavClick = (section) => {
        setActiveNav(section);
        scrollToSection(section);
    };

    return (
        <nav className="hidden md:flex items-center gap-6">
            <NavItem icon={Home} text="Home" isActive={activeNav === 'home'} onClick={() => handleNavClick('home')} showLogin={showLogin} />
            <NavItem icon={Info} text="About" isActive={activeNav === 'about'} onClick={() => handleNavClick('about')} showLogin={showLogin} />
            <NavItem icon={Contact} text="Contact" isActive={activeNav === 'contact'} onClick={() => handleNavClick('contact')} showLogin={showLogin} />
        </nav>
    );
};

const NavItem = ({ icon: Icon, text, onClick, showLogin, isActive }) => {
    return (
        <motion.div
            onClick={onClick}
            className={`relative cursor-pointer flex items-center gap-2 px-3 py-2 transition-colors ${
                isActive ? "text-orange-400" : "text-blue-100 hover:text-orange-300"
            } ${showLogin ? "opacity-50 pointer-events-none" : ""}`}
            whileHover={{ y: -2 }}
        >
            <Icon size={18} className={isActive ? "text-orange-400" : "text-orange-500/70"} />
            <span className="font-medium">{text}</span>
            {isActive && (
                <motion.div 
                    layoutId="underline" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" 
                />
            )}
        </motion.div>
    );
};

const MobileMenuButton = ({ mobileMenuOpen, setMobileMenuOpen }) => (
    <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-orange-500 p-2 rounded-lg bg-blue-900/50 border border-blue-800"
    >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
);

const MobileMenu = ({ mobileMenuOpen, showLogin, scrollToSection, setMobileMenuOpen }) => {
    const [activeNav, setActiveNav] = useState('home');
    
    const handleMobileNavClick = (section) => {
        setActiveNav(section);
        scrollToSection(section);
        setMobileMenuOpen(false);
    };

    return (
        <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="md:hidden mt-4 bg-blue-900 border border-orange-500/30 rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="p-4 flex flex-col gap-2">
                        <MobileNavItem icon={Home} text="Home" isActive={activeNav === 'home'} onClick={() => handleMobileNavClick('home')} />
                        <MobileNavItem icon={Info} text="About" isActive={activeNav === 'about'} onClick={() => handleMobileNavClick('about')} />
                        <MobileNavItem icon={Contact} text="Contact" isActive={activeNav === 'contact'} onClick={() => handleMobileNavClick('contact')} />
                        <button className="w-full mt-2 bg-orange-500 text-white p-3 rounded-xl font-bold">LOGIN</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const MobileNavItem = ({ icon: Icon, text, onClick, isActive }) => (
    <div 
        onClick={onClick}
        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
            isActive ? "bg-orange-500 text-white" : "text-blue-100 hover:bg-blue-800"
        }`}
    >
        <Icon size={20} />
        <span className="font-bold">{text}</span>
    </div>
);

export default Header;