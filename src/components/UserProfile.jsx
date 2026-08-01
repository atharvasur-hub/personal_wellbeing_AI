import React, { useState } from 'react';
import { Camera, Mail, Award, Clock, Flame, BookOpen } from 'lucide-react';

const UserProfile = () => {
    // Mock state: Ready to be swapped with your Supabase fetch logic
    const [user, setUser] = useState({
        name: "Tanish Kotian",
        email: "tanish.kotian@example.com",
        role: "Engineering Student",
        // Using DiceBear for a quick placeholder avatar until uploads are ready
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanish",
        stats: {
            focusHours: 142,
            currentStreak: 14,
            milestonesReached: 8
        }
    });

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">

            {/* Profile Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">

                    {/* Avatar Section */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-50 dark:border-indigo-900/30">
                            <img
                                src={user.avatarUrl}
                                alt={`${user.name}'s avatar`}
                                className="w-full h-full object-cover bg-gray-100"
                            />
                        </div>
                        {/* Hover overlay for changing avatar */}
                        <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Camera className="w-8 h-8 text-white" />
                        </button>
                    </div>

                    {/* User Data Section */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {user.name}
                        </h1>
                        <div className="mt-2 space-y-2">
                            <p className="flex items-center justify-center md:justify-start gap-2 text-gray-500 dark:text-gray-400">
                                <BookOpen className="w-4 h-4" />
                                {user.role}
                            </p>
                            <p className="flex items-center justify-center md:justify-start gap-2 text-gray-500 dark:text-gray-400">
                                <Mail className="w-4 h-4" />
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div>
                        <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Wellbeing & Focus Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Deep Work</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.focusHours} hrs</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                        <Flame className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.currentStreak} Days</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                        <Award className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Milestones</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.milestonesReached}</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserProfile;