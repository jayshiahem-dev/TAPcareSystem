import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Shield, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import logo from "../../../assets/logo-login.png";
import logoTap from "../../../assets/logoTap.png";

const LoginForm = ({ 
    show, 
    values, 
    handleInput, 
    handleLoginSubmit, 
    isLoading, 
    handleBackToHome, 
    setForgotPassword 
}) => {
    const [showPassword, setShowPassword] = useState(false);
    
    const slideInVariants = {
        hidden: { x: "100%", opacity: 0 },
        visible: { 
            x: 0, 
            opacity: 1, 
            transition: { 
                duration: 0.6, 
                ease: "easeOut" 
            } 
        },
        exit: { 
            x: "100%", 
            opacity: 0,
            transition: { 
                duration: 0.5,
                ease: "easeIn" 
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    return (
        <AnimatePresence mode="wait">
            {show && (
                <motion.div
                    key="login-form"
                    className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-white via-orange-50 to-white"
                    variants={slideInVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div
                        className="w-full max-w-md"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <BackButton handleBackToHome={handleBackToHome} />
                        <LoginHeader logo={logoTap} />
                        <LoginFormContent 
                            values={values}
                            handleInput={handleInput}
                            handleLoginSubmit={handleLoginSubmit}
                            isLoading={isLoading}
                            setForgotPassword={setForgotPassword}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                        />
                        <SecurityFooter />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const BackButton = ({ handleBackToHome }) => (
    <button
        onClick={handleBackToHome}
        className="mb-6 flex items-center gap-2 text-gray-700 hover:text-orange-600 transition group"
    >
        <motion.div
            className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200"
            whileHover={{ x: -5 }}
            transition={{ duration: 0.3 }}
        >
            <ArrowLeft className="h-5 w-5" />
        </motion.div>
        <span className="font-medium">Back to Home</span>
    </button>
);

const LoginHeader = ({ logo }) => (
    <motion.div
        className="text-center mb-8"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
    >
        <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center rounded-xl shadow-lg">
                <img 
                    src={logo} 
                    alt="Biliran Cash Assistance Logo" 
                    className="h-16 w-16 object-contain"
                />
            </div>
        </div>
        <h3 className="text-3xl font-extrabold text-gray-800 mb-2">
            TapCare.Ph
        </h3>
        <p className="text-gray-600">
            Provincial Government Personnel Access Only
        </p>
    </motion.div>
);

const LoginFormContent = ({ values, handleInput, handleLoginSubmit, isLoading, setForgotPassword, showPassword, setShowPassword }) => (
    <form className="space-y-6" onSubmit={handleLoginSubmit}>
        <EmailInput 
            value={values.email} 
            onChange={handleInput} 
            disabled={isLoading} 
        />
        <PasswordInput 
            value={values.password} 
            onChange={handleInput} 
            disabled={isLoading}
            showPassword={showPassword}
        />
        <ShowPasswordCheckbox 
            showPassword={showPassword}
            setShowPassword={setShowPassword}
        />
        <LoginButton isLoading={isLoading} />
    </form>
);

const EmailInput = ({ value, onChange, disabled }) => (
    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
        </label>
        <div className="relative">
            <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
            />
            <input
                type="email"
                name="email"
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-800 placeholder-gray-500 transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 disabled:opacity-50"
                placeholder="employee@biliran.gov.ph"
                required
            />
        </div>
    </motion.div>
);

const PasswordInput = ({ value, onChange, disabled, showPassword }) => (
    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
        </label>
        <div className="relative">
            <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
            />
            <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 text-gray-800 placeholder-gray-500 transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 disabled:opacity-50"
                placeholder="••••••••"
                required
            />
            <button
                type="button"
                onClick={() => {}}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex="-1"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    </motion.div>
);

const ShowPasswordCheckbox = ({ showPassword, setShowPassword }) => (
    <motion.div
        className="flex items-center justify-between text-sm"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
    >
        <div className="flex items-center">
            <input
                id="show-password"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 bg-white text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="show-password" className="ml-2 text-gray-700 cursor-pointer">
                Show password
            </label>
        </div>
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="font-medium text-orange-600 hover:text-orange-500 transition"
        >
            {showPassword ? "Hide" : "Show"}
        </button>
    </motion.div>
);


const LoginButton = ({ isLoading }) => (
    <motion.button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 ${
            isLoading
                ? "cursor-not-allowed bg-orange-400"
                : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 active:scale-95"
        }`}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
    >
        {isLoading ? (
            <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
            </span>
        ) : "Login"}
    </motion.button>
);

const SecurityFooter = () => (
    <motion.div
        className="mt-8 pt-6 border-t border-gray-300 text-center text-sm text-gray-600"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
    >
        <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-orange-500" />
            <span>256-bit SSL Encryption • Provincial Government Secure Platform</span>
        </div>
        <p>© 2024 Provincial Government of Biliran</p>
    </motion.div>
);

export default LoginForm;