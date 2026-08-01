import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL !== undefined 
  ? import.meta.env.VITE_BACKEND_URL 
  : (import.meta.env.DEV ? 'http://localhost:8000' : '');

export default function Login() {
    const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Signup

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email || !password || (!isLogin && !name)) {
            setError("Please fill out all required identity fields.");
            return;
        }

        try {
            let response;

            if (isLogin) {
                // --- LOGIN LOGIC ---
                const formData = new URLSearchParams();
                formData.append("username", email);
                formData.append("password", password);

                response = await fetch(`${BACKEND_URL}/api/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formData,
                });
            } else {
                // --- SIGNUP LOGIC ---
                response = await fetch(`${BACKEND_URL}/api/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Authentication failed.");
            }

            setSuccess(isLogin ? "System Engaged! Welcome back." : "Identity registered! Welcome.");

            // Save the secure token to the browser's local storage
            localStorage.setItem("agentic_token", data.access_token);

            // Wait 1 second so they can see the success message, then teleport to dashboard
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1000);

        } catch (err) {
            setError(err.message);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
        setSuccess("");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen w-full bg-[#FAFAFA] flex items-center justify-center p-4 font-sans relative overflow-hidden">

            <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -left-[10%] w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[20%] -right-[10%] w-[30rem] h-[30rem] bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md relative z-10">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.06)] border border-white p-8 sm:p-10 relative overflow-hidden">

                    <motion.div className="absolute top-0 left-0 w-[200%] h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" animate={{ x: ["-50%", "0%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />

                    <motion.div variants={containerVariants} initial="hidden" animate="visible">

                        <motion.div variants={itemVariants} className="text-center mb-8 mt-2 relative">
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Agentic Growth</h1>
                            <p className="text-sm text-gray-500 mt-2">
                                {isLogin ? "Initialize your cognitive session." : "Register your new cognitive identity."}
                            </p>
                        </motion.div>

                        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">{error}</motion.div>}
                        {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-lg text-center font-medium">{success}</motion.div>}

                        <form className="space-y-4" onSubmit={handleSubmit}>

                            {/* Smoothly animate the Name field in and out based on isLogin state */}
                            <AnimatePresence>
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 mt-1">Designation (Name)</label>
                                        <motion.input
                                            whileFocus={{ scale: 1.02 }}
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your Name"
                                            className="w-full px-4 py-3.5 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-gray-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-colors outline-none text-gray-900 placeholder-gray-400"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div variants={itemVariants}>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Identity Vector</label>
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@domain.com"
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-gray-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-colors outline-none text-gray-900 placeholder-gray-400"
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Security Key</label>
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-gray-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-colors outline-none text-gray-900 placeholder-gray-400"
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <motion.button
                                    whileHover="hover"
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full relative overflow-hidden bg-gray-900 text-white font-semibold py-4 rounded-xl shadow-lg shadow-gray-900/20 mt-4 cursor-pointer"
                                >
                                    <span className="relative z-10">{isLogin ? "Engage System" : "Register Identity"}</span>
                                    <motion.div variants={{ hover: { x: ["-100%", "100%"] } }} transition={{ duration: 0.6, ease: "easeInOut" }} className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full" />
                                </motion.button>
                            </motion.div>
                        </form>

                        {/* Toggle Text */}
                        <motion.div variants={itemVariants} className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                {isLogin ? "Don't have an access code?" : "Already initialized?"}{" "}
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer"
                                >
                                    {isLogin ? "Sign up here" : "Login here"}
                                </button>
                            </p>
                        </motion.div>

                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}