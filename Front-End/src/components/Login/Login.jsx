import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";


// Import Components
import LoadingIntro from "../../ReusableFolder/loadingIntro";
import LoginStatusModal from "../../ReusableFolder/LogInStatusModal";
import Header from "../Login/CashAssistanceAuth/Header";
import HeroSection from "../Login/CashAssistanceAuth/HeroSection";
import StatsSection from "../Login/CashAssistanceAuth/StatsSection";
import AboutSection from "../Login/CashAssistanceAuth/AboutSection";
import ContactSection from "../Login/CashAssistanceAuth/ContactSection";
import LoginForm from "../Login/CashAssistanceAuth/LoginForm";
import Footer from "../Login/CashAssistanceAuth/Footer";
import logo from "../../assets/logo-login.png"

import image4 from "../../assets/image4.jpg"

export default function CashAssistanceAuthForm() {
    const [showLogin, setShowLogin] = useState(false);
    const [isForgotPassword, setForgotPassword] = useState(false);
    const [loginStatus, setLoginStatus] = useState({
        show: false,
        status: "success",
        message: "",
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [values, setValues] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    // Handler Functions
    const handleInput = useCallback((event) => {
        const { name, value } = event.target;
        setValues(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSubmitted(true);

        const response = await login(values.email, values.password);

        if (response.success) {
            setLoginStatus({
                show: true,
                status: "success",
                message: "Login successful!",
            });
            setIsLoading(false);
        } else {
            setIsLoading(false);
            setSubmitted(false);
            setLoginStatus({
                show: true,
                status: "error",
                message: response.message || "Login failed. Please check your credentials.",
            });
        }
    };

    const handleModalClose = () => {
        setLoginStatus(prev => ({ ...prev, show: false }));
        if (loginStatus.status === "success") {
            navigate("/dashboard");
        }
    };

    const handleLoginClick = () => {
        setShowLogin(true);
        setMobileMenuOpen(false);
        window.scrollTo(0, 0);
    };

    const handleBackToHome = () => {
        setShowLogin(false);
        setSubmitted(false);
        setValues({ email: "", password: "" });
        window.scrollTo(0, 0);
    };

    const scrollToSection = (sectionId) => {
        if (showLogin) {
            handleBackToHome();
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                element?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const element = document.getElementById(sectionId);
            element?.scrollIntoView({ behavior: 'smooth' });
        }
    };

 return (
    <>
        {/* Modern Grid Background for entire page */}
        <div className="fixed inset-0 pointer-events-none">
            {/* Base Gradient Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950"></div>
            
            {/* Radial Gradients - BLUE ONLY */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(30,64,175,0.15),transparent_50%)]"></div>
            
            {/* Animated Blobs - BLUE ONLY */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
            
            {/* Corner Accents - BLUE ONLY */}
            <div className="absolute top-10 left-10 w-24 h-24 border border-blue-500/20 rounded-xl transform rotate-45 opacity-50"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 border border-blue-400/20 rounded-xl transform rotate-45 opacity-50"></div>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    key="loading-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <LoadingIntro />
                </motion.div>
            )}
        </AnimatePresence>

        {/* Login Status Modal */}
        <LoginStatusModal
            isOpen={loginStatus.show}
            onClose={handleModalClose}
            status={loginStatus.status}
            customMessage={loginStatus.message}
        />

        {/* Header */}
        <Header
            showLogin={showLogin}
            scrollToSection={scrollToSection}
            handleLoginClick={handleLoginClick}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content */}
        {!showLogin ? (
            <div className="min-h-screen pt-20 overflow-hidden relative z-10">
                {/* Hero Section with Grid Effect */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/50 to-blue-950 pointer-events-none"></div>
                    <HeroSection handleLoginClick={handleLoginClick} />
                </div>
                
                {/* Stats Section with Grid Overlay */}
                <div className="relative z-20 -mt-20 mb-20">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/30 via-transparent to-transparent pointer-events-none"></div>
                    <StatsSection />
                </div>

                {/* About Section with Grid Container */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent pointer-events-none"></div>
                    <AboutSection />
                </div>

                {/* Contact Section */}
                <ContactSection />
                
                {/* Footer */}
                <Footer />
            </div>
        ) : (
            <div className="min-h-screen flex relative overflow-hidden">
                {/* Grid Overlay for Login Page */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Additional Grid Layer for Login */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
                </div>
                
                {/* Login Background Side with Image (Desktop) */}
                <LoginBackgroundSide />
                
                {/* Login Form */}
                <LoginForm
                    show={showLogin}
                    values={values}
                    handleInput={handleInput}
                    handleLoginSubmit={handleLoginSubmit}
                    isLoading={isLoading}
                    handleBackToHome={handleBackToHome}
                    setForgotPassword={setForgotPassword}
                />
            </div>
        )}

        {/* Floating Grid Particles Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-[1px] h-[1px] bg-blue-400/20 rounded-full"
                    initial={{
                        x: Math.random() * 100 + 'vw',
                        y: Math.random() * 100 + 'vh',
                    }}
                    animate={{
                        x: [
                            Math.random() * 100 + 'vw',
                            Math.random() * 100 + 'vw',
                            Math.random() * 100 + 'vw'
                        ],
                        y: [
                            Math.random() * 100 + 'vh',
                            Math.random() * 100 + 'vh',
                            Math.random() * 100 + 'vh'
                        ],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>

        {/* Subtle Grid Lines Effect */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
                {/* Vertical Lines */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"
                        style={{ left: `${(i + 1) * 8.33}%` }}
                    />
                ))}
                {/* Horizontal Lines */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
                        style={{ top: `${(i + 1) * 12.5}%` }}
                    />
                ))}
            </div>
        </div>
    </>
);
}

const LoginBackgroundSide = () => (
    <div 
        className="hidden lg:flex w-1/2 relative overflow-hidden"
        style={{
            backgroundImage: `url(${image4})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
    >
        {/* Blue Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-blue-700/70"></div>
        
        {/* Additional subtle gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 via-transparent to-blue-800/30"></div>
        
        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full pt-40 p-10">
            
            {/* Logo Container */}
            <div className="mb-8 flex flex-col items-center">
                {/* Logo Image with shadow and effects */}
                <div className="mb-4 relative">
                    {/* Glow effect behind logo */}
                    <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full transform scale-125"></div>
                    
                    {/* Logo */}
                    <img 
                        src={logo} 
                        alt="Biliran Cash Assistance Logo" 
                        className="relative w-48 h-48 object-contain drop-shadow-2xl"
                    />
                </div>
                
                {/* Logo Text */}
                <h1 className="text-4xl font-bold text-white text-center mb-2">
                    Biliran Province
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full mb-4"></div>
                <p className="text-xl text-blue-100 font-semibold">
                    Cash Assistance Program
                </p>
            </div>

            {/* Tagline */}
            <div className="text-center max-w-lg">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/30 via-emerald-500/20 to-cyan-500/20 backdrop-blur-md border border-white/20">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-300 to-emerald-300 animate-pulse"></div>
                    <span className="text-sm font-medium bg-gradient-to-r from-blue-200 to-emerald-200 bg-clip-text text-transparent tracking-wide">
                        SECURE GOVERNMENT PORTAL
                    </span>
                </div>
                
                <p className="text-lg text-blue-100 leading-relaxed mb-8">
                    Providing financial support and assistance services 
                    to the people of Biliran with transparency and efficiency
                </p>
                
                {/* Decorative Divider */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-300/50"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-300/50"></div>
                </div>
            </div>

            {/* Simple Feature Indicators */}
            <div className="grid grid-cols-2 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-400/10 backdrop-blur-sm border border-blue-300/30 flex items-center justify-center mb-3">
                        <span className="text-2xl text-blue-200">🏛️</span>
                    </div>
                    <h3 className="font-bold text-white mb-1">Government</h3>
                    <p className="text-sm text-blue-100">Official Platform</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 backdrop-blur-sm border border-emerald-300/30 flex items-center justify-center mb-3">
                        <span className="text-2xl text-emerald-200">🔐</span>
                    </div>
                    <h3 className="font-bold text-white mb-1">Secure</h3>
                    <p className="text-sm text-blue-100">Protected Access</p>
                </div>
            </div>

            {/* Bottom Text */}
            <div className="mt-12 text-center">
                <p className="text-blue-100 text-sm italic">
                    "Serving Biliran with integrity and compassion"
                </p>
                <div className="mt-2 text-xs text-blue-200/60">
                    Province of Biliran • Government Services
                </div>
            </div>
        </div>
    </div>
);