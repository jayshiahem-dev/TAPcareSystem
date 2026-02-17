import { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PatientDisplayContext } from "../../contexts/PatientContext/PatientContext";
import { DoctorDisplayContext } from "../../contexts/DoctorContext/doctorContext";
import { StaffDisplayContext } from "../../contexts/StaffContext/StaffContext";
const RegisterFormModal = ({ isOpen, onClose, role }) => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        gender: "Select Gender",
        dob: "",
        role: role,
        email: "",
        password: "",
        address: "",
        confirm_password: "",
        emergency_contact_name: "",
        emergency_contact_number: "",
        contact_number: "",
        specialty: "",
    });

    const { AddPatient } = useContext(PatientDisplayContext);
    const { AddDoctor } = useContext(DoctorDisplayContext);
    const { AddStaff } = useContext(StaffDisplayContext);

    const [passwordError, setPasswordError] = useState("");
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    useEffect(() => {
        setFormData((prev) => ({ ...prev, role: role }));
    }, [role]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "password" || name === "confirm_password") {
            setPasswordError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            setPasswordError("Passwords do not match!");
            return;
        }

        const { confirm_password, ...dataToSend } = formData;

        if (role === "patient") {
            await AddPatient(dataToSend);
        } else if (role === "doctor") {
            const result = await AddDoctor(dataToSend);
            if (result?.Success === true) {
                console.log("Successfully Added");
            }

            console.log("Submitting doctor data:", dataToSend);
        } else if (role === "staff") {
            await AddStaff(dataToSend);

        }
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    const resetForm = () => {
        setFormData({
            first_name: "",
            last_name: "",
            gender: "Select Gender",
            dob: "",
            email: "",
            password: "",
            address: "",
            confirm_password: "",
            emergency_contact_name: "",
            emergency_contact_number: "",
            contact_number: "",
            specialty: "",
            role: role,
        });
        setPasswordError("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative mx-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:border dark:border-gray-700 dark:bg-gray-800 sm:p-8"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            <svg
                                className="h-6 w-6 text-gray-600 dark:text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <div className="mb-8 text-center">
                            <h2 className="text-xl font-extrabold text-blue-700 dark:text-blue-300 sm:text-2xl">
                                Register New {role === "doctor" ? "Doctor" : role === "staff" ? "Staff" : "Patient"} Account
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Please fill out all the details to create your new account.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {role === "patient" ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                            placeholder="Enter first name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                        >
                                            <option
                                                value="Select Gender"
                                                disabled
                                            >
                                                Select Gender
                                            </option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                            placeholder="Enter your password"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            required
                                            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600 ${
                                                passwordError
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-300 focus:border-blue-500"
                                            }`}
                                            placeholder="Confirm your password"
                                        />
                                        {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
                                    </div>

                                    {/* Emergency Contact Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact Name</label>
                                        <input
                                            type="text"
                                            name="emergency_contact_name"
                                            value={formData.emergency_contact_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                            placeholder="Contact person's name"
                                        />
                                    </div>

                                    {/* Emergency Contact Number */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact Number</label>
                                        <input
                                            type="text"
                                            name="emergency_contact_number"
                                            value={formData.emergency_contact_number}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                            placeholder="Contact person's phone number"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                            placeholder="Contact person's phone number"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                            placeholder="Enter first name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                            placeholder="Enter last name"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                            placeholder="Enter your password"
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            required
                                            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600 ${
                                                passwordError
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-300 focus:border-blue-500"
                                            }`}
                                            placeholder="Confirm your password"
                                        />
                                        {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
                                    </div>

                                    {/* Contact Number */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                                        <input
                                            type="text"
                                            name="contact_number"
                                            value={formData.contact_number}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                        />
                                    </div>
                                    {role === "doctor" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specialty</label>
                                            <input
                                                type="text"
                                                name="specialty"
                                                value={formData.specialty}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-8 flex justify-center">
                                <button
                                    type="submit"
                                    className="transform rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-10 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75"
                                >
                                    Register Account
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RegisterFormModal;
