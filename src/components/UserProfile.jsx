import React, { useState, useEffect } from 'react';
import { Clock, Brain, Zap, TrendingUp, Sparkles, Pencil } from 'lucide-react';
// Update this import path to point to your actual Supabase client instance
// import { supabase } from '../lib/supabase'; 

export default function UserProfile() {
    // 1. Initialize State for Profile and Metrics
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        // Fallback data while loading or if API fails
        fullName: 'Tanish Kotian',
        title: 'Growth Catalyst • Tier 3',
        targetGoal: 'Senior ML Engineer',
        email: 'tanish@synapse.ai',
        level: 1,
        currentXp: 450, // Set to 450 to demonstrate the dynamic progress bar
        nextLevelXp: 1000,
        streak: 0
    });

    const [metrics, setMetrics] = useState({
        focusHours: 0,
        focusMinutes: 0,
        focusTrend: '+18.4%',
        conceptsMastered: 0,
        goalVelocity: 0,
        vpm: '0.00'
    });

    // 2. Fetch Data from Supabase / FastAPI
    useEffect(() => {
        async function fetchUserData() {
            try {
                setLoading(true);
                // EXAMPLE SUPABASE CALL:
                // const { data: userData, error } = await supabase.from('users').select('*').single();
                // if (userData) setProfile(userData);

                // Simulate a network request delay for now
                setTimeout(() => setLoading(false), 500);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }

        fetchUserData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-8 text-slate-800">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Profile Header Section */}
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                    <div className="flex gap-6 items-center">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl text-white font-bold shadow-md">
                                {profile.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-full border-4 border-slate-50 text-white">
                                <Sparkles size={14} />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{profile.fullName}</h1>
                                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                                    {profile.title}
                                </span>
                            </div>

                            <div className="text-sm text-slate-500 space-y-1">
                                <p>Target Goal: <span className="font-semibold text-slate-700">{profile.targetGoal}</span></p>
                                <p>ID / Email: {profile.email}</p>
                            </div>

                            {/* Badges - Desaturated */}
                            <div className="flex gap-3 pt-2">
                                <button className="flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors">
                                    <Pencil size={12} /> Edit Profile Info
                                </button>
                                <div className="flex items-center gap-1.5 text-xs font-medium bg-white border border-orange-200 text-orange-600 px-3 py-1.5 rounded-full shadow-sm">
                                    🔥 {profile.streak}-Day Focus Streak
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium bg-white border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-full shadow-sm">
                                    ⭐ Level {profile.level} • {profile.currentXp} / {profile.nextLevelXp} XP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VPM Metrics Section */}
                <div>
                    <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                        <Sparkles size={20} className="text-indigo-600" />
                        Value per Minute (VPM) Performance Metrics
                    </h2>
                    <p className="text-sm text-slate-500 mb-4">Real-time human potential optimization metrics and active recall verification.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* Focus Card */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-2/3">Focus Time Reclaimed</span>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Clock size={18} />
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold flex items-baseline gap-1">
                                    {metrics.focusHours}h {metrics.focusMinutes}m
                                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-2">
                                        {metrics.focusTrend}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">this week</p>
                                <p className="text-xs text-slate-500 mt-4 leading-relaxed">Dopamine doomscrolling converted into deep work flow.</p>
                            </div>
                        </div>

                        {/* Skills Card */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-2/3">Skills Verified</span>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Brain size={18} />
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold flex items-baseline gap-2">
                                    {metrics.conceptsMastered}
                                    <span className="text-lg text-slate-600 font-medium">Concepts</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Mastered via active recall</p>
                                <p className="text-xs text-slate-500 mt-4 leading-relaxed">94% retention rate on spaced repetition quizzes.</p>
                            </div>
                        </div>

                        {/* Goal Velocity Card */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-2/3">Goal Velocity</span>
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <Zap size={18} />
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold flex items-baseline gap-2">
                                    {metrics.goalVelocity}%
                                    <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                        +5.2% speedup
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">on track for Target Role</p>
                                <p className="text-xs text-slate-500 mt-4 leading-relaxed">Calculated trajectory towards Target Career Goal.</p>
                            </div>
                        </div>

                        {/* VPM Card */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-2/3">Value Per Minute</span>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <TrendingUp size={18} />
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">
                                    ${metrics.vpm}/min
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Cognitive ROI</p>
                                <p className="text-xs text-slate-500 mt-4 leading-relaxed">High-value synthesis vs passive media consumption.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}