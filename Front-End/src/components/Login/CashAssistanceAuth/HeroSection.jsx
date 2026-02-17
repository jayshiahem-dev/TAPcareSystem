import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import background from "../../../assets/image4.jpg";
import logo from "../../../assets/logoTap.png";

const HeroSection = ({ handleLoginClick }) => {
    const floatVariants = {
        animate: {
            y: [0, -15, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center py-20">
            {/* Background */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${background})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-blue-800/50 to-emerald-900/70 backdrop-blur-sm"></div>
            </div>
            
            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Logo */}
                    <div className="flex justify-center mb-10">
                        <motion.div
                            className="flex h-40 w-40 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md p-6 border border-white/20"
                            variants={floatVariants}
                            animate="animate"
                        >
                            <img 
                                src={logo} 
                                alt="Biliran Cash Assistance Logo" 
                                className="h-32 w-32 object-contain"
                            />
                        </motion.div>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                        TapCare.Ph
                    </h1>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-orange-400 mb-8 leading-tight">
                        A Smart RFID-Enabled Platform for Fair and Transparent Government Aid Distribution
                    </h2>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-gray-100 max-w-4xl mx-auto mb-12 leading-relaxed">
                        A secure provincial government platform dedicated to providing financial assistance 
                        to eligible beneficiaries across Biliran's municipalities.
                    </p>

                    {/* CTA Button */}
                    <motion.button
                        onClick={handleLoginClick}
                        className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-full hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/50 mb-6"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Lock className="mr-3 h-6 w-6" />
                        Secure Login Portal
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;