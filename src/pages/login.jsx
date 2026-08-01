import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
// Ensure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co",
    import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key"
);

// Zod Validation Schema
const loginSchema = z.object({
    email: z.string().email("Invalid email format detected. Please recalibrate."),
    password: z.string().min(8, "Security protocol requires at least 8 characters."),
});

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        // Handle Email/Password Login via Supabase
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (error) {
            console.error("Authentication failed:", error.message);
        }
        setIsLoading(false);
    };

    const handleGoogleSignIn = async () => {
        // Handle Google OAuth via Supabase
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 text-white">
            {/* Background Glowing Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">

                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                        >
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Agentic Growth</h2>
                        <p className="text-gray-400 mt-2 text-sm">Initialize your cognitive session.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                                Identity Vector (Email)
                            </label>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="you@domain.com"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                            />
                            {errors.email && (
                                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-xs mt-2">
                                    {errors.email.message}
                                </motion.p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                                Security Key (Password)
                            </label>
                            <input
                                {...register("password")}
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                            />
                            {errors.password && (
                                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-xs mt-2">
                                    {errors.password.message}
                                </motion.p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black font-semibold rounded-xl py-3 mt-4 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                            ) : (
                                "Engage System"
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 flex items-center gap-4">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-xs text-gray-500 uppercase">Or bypass with</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    {/* Google OAuth Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleSignIn}
                        type="button"
                        className="w-full mt-6 bg-white/[0.05] border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl py-3 transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </motion.button>

                </div>
            </motion.div>
        </div>
    );
}