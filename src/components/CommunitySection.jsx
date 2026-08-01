import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Zap, 
  AlertCircle, 
  MessageSquare,
  Volume2,
  Lock
} from 'lucide-react';
import { 
  getCommunityGroup, 
  getCommunityMessages, 
  sendCommunityMessage, 
  triggerCommunityAnnouncement 
} from '../lib/backendApi';

export default function CommunitySection({ isDarkMode = false, currentUser = null }) {
  const userId = currentUser?.id || 'usr_default';
  const userName = currentUser?.name || 'User';

  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [error, setError] = useState(null);

  const chatEndRef = useRef(null);

  // Cohort Mock Members (Simulating active online presence)
  const [cohortMembers, setCohortMembers] = useState([]);

  const mockUsersList = {
    'ai-ml': [
      { name: 'Sophia Chen', title: 'ML Researcher', status: 'online' },
      { name: 'Liam Vance', title: 'Rust Concurrency Eng', status: 'online' },
      { name: 'Elena Rostova', title: 'DL Systems Architect', status: 'away' }
    ],
    'full-stack': [
      { name: 'Alex Mercer', title: 'Senior Full-Stack', status: 'online' },
      { name: 'Emily Watson', title: 'Frontend Lead', status: 'online' },
      { name: 'Marcus Aurelius', title: 'Backend Dev', status: 'away' }
    ],
    'growth': [
      { name: 'Dan Koe', title: 'Productivity Architect', status: 'online' },
      { name: 'Clara Oswald', title: 'Creative Founder', status: 'online' },
      { name: 'David G.', title: 'Biohacking Specialist', status: 'away' }
    ]
  };

  useEffect(() => {
    async function loadCommunityData() {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch community group allocation
        const groupData = await getCommunityGroup(userId);
        if (!groupData) {
          throw new Error("Failed to load community group configuration.");
        }
        setCommunity(groupData);
        setCohortMembers(mockUsersList[groupData.id] || []);

        // 2. Fetch community messages
        const msgsResult = await getCommunityMessages(groupData.id);
        if (msgsResult && msgsResult.messages) {
          const allMsgs = msgsResult.messages;
          setMessages(allMsgs.filter(m => !m.is_announcement));
          setAnnouncements(allMsgs.filter(m => m.is_announcement));
        }
      } catch (err) {
        console.error(err);
        setError("Unable to connect to the community space. Make sure the FastAPI backend is running.");
      } finally {
        setLoading(false);
      }
    }
    loadCommunityData();
  }, [userId]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !community) return;

    const userMessageText = chatInput.trim();
    setChatInput('');

    // Optimistically add user message to UI
    const tempUserMsg = {
      id: Date.now(),
      community_id: community.id,
      sender_id: userId,
      sender_name: userName + " (You)",
      role: 'user',
      text: userMessageText,
      is_announcement: false,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Send message to FastAPI
      const result = await sendCommunityMessage(community.id, userId, userName, userMessageText, 'user');
      
      // Trigger AI/Simulated Response Sequence
      if (result) {
        // Trigger agent typing indicator shortly
        setTimeout(() => {
          setTypingUser(community.agent_name);
          setIsTyping(true);
        }, 800);

        // Fetch new messages after a short delay (FastAPI returns message + triggers AI reply)
        setTimeout(async () => {
          const refreshed = await getCommunityMessages(community.id);
          if (refreshed && refreshed.messages) {
            const allMsgs = refreshed.messages;
            setMessages(allMsgs.filter(m => !m.is_announcement));
            setAnnouncements(allMsgs.filter(m => m.is_announcement));
          }
          setIsTyping(false);
        }, 2200);

        // Occasionally, let another mock member join the conversation
        if (Math.random() > 0.4 && cohortMembers.length > 0) {
          const randomMember = cohortMembers[Math.floor(Math.random() * cohortMembers.length)];
          setTimeout(() => {
            setTypingUser(randomMember.name);
            setIsTyping(true);
          }, 4500);

          setTimeout(async () => {
            // Pick a message aligned with the community
            let replyText = "Interesting focus task! Let's schedule a session.";
            if (community.id === 'ai-ml') {
              replyText = `Agreed. I ran a training calibration earlier and local model loss is stabilising around ${0.08 + Math.random() * 0.05}.`;
            } else if (community.id === 'full-stack') {
              replyText = "Indeed. Client-side state transitions can introduce visual delays if not wrapped in suspense fallbacks.";
            } else {
              replyText = "Yes! I also anchored my daily workout review right after closing my session. High momentum today.";
            }

            // Post simulated member message to backend
            await sendCommunityMessage(community.id, `usr_${randomMember.name.toLowerCase().replace(' ', '_')}`, randomMember.name, replyText, 'user');
            
            const refreshed = await getCommunityMessages(community.id);
            if (refreshed && refreshed.messages) {
              const allMsgs = refreshed.messages;
              setMessages(allMsgs.filter(m => !m.is_announcement));
            }
            setIsTyping(false);
          }, 6500);
        }
      }
    } catch (err) {
      console.warn("Failed to deliver community message:", err);
    }
  };

  // Trigger Facilitator Announcement manually
  const handleRequestAnnouncement = async () => {
    if (!community) return;
    setIsTyping(true);
    setTypingUser(community.agent_name);
    try {
      const res = await triggerCommunityAnnouncement(community.id);
      if (res && res.status === 'success') {
        const refreshed = await getCommunityMessages(community.id);
        if (refreshed && refreshed.messages) {
          const allMsgs = refreshed.messages;
          setAnnouncements(allMsgs.filter(m => m.is_announcement));
        }
      }
    } catch (err) {
      console.warn("Failed to request announcement:", err);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className={`w-8 h-8 rounded-full border-4 border-t-transparent animate-spin ${isDarkMode ? 'border-indigo-400' : 'border-teal-500'}`} />
        <p className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>Connecting to Cohort Neural Network...</p>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className={`rounded-3xl border p-8 text-center max-w-lg mx-auto mt-10 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-stone-200 text-stone-900'}`}>
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Workspace Offline</h3>
        <p className={`text-xs leading-relaxed mb-6 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>{error || "FastAPI connection failed."}</p>
        <button 
          onClick={() => window.location.reload()}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
      
      {/* LEFT COLUMN: Pinned Announcements */}
      <div className="flex-1 flex flex-col gap-6 lg:max-w-md">
        <div className={`rounded-3xl border p-6 flex flex-col gap-6 shadow-xs ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-stone-200/50 text-stone-900'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-teal-50 text-teal-600 border-teal-100/60'}`}>
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-wider">ANNOUNCEMENTS</h3>
                <span className={`text-[10px] font-mono font-bold ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>PINNED DIRECTIVES</span>
              </div>
            </div>
            
            <button
              onClick={handleRequestAnnouncement}
              title="Request a new challenge announcement from the AI Facilitator"
              className={`p-2 rounded-xl border flex items-center justify-center transition cursor-pointer hover:scale-105 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-indigo-300 hover:text-indigo-200' : 'bg-stone-50 border-stone-200 text-teal-600 hover:text-teal-700'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[480px] pr-1">
            {announcements.length === 0 ? (
              <div className="text-center py-10">
                <Bot className="w-8 h-8 text-stone-300 dark:text-slate-700 mx-auto mb-2" />
                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>No announcements compiled yet.</p>
              </div>
            ) : (
              announcements.slice().reverse().map((ann) => (
                <div 
                  key={ann.id} 
                  className={`rounded-2xl p-4 border relative overflow-hidden flex flex-col gap-2.5 transition group hover:shadow-xs ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-teal-50/30 border-teal-100/80'}`}
                >
                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${isDarkMode ? 'bg-indigo-500' : 'bg-teal-500'}`} />
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-indigo-950 text-indigo-400 border-indigo-500/30' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>
                      {ann.sender_name}
                    </span>
                    <span className={`text-[8px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>
                      {new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className={`text-xs font-medium leading-relaxed whitespace-pre-line ${isDarkMode ? 'text-slate-200' : 'text-stone-700'}`}>
                    {ann.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Online Cohort Members Capsule */}
        <div className={`rounded-3xl border p-6 flex flex-col gap-4 shadow-xs ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-stone-200/50 text-stone-900'}`}>
          <h4 className="text-xs font-extrabold tracking-wider font-mono border-b pb-2.5 border-stone-100 dark:border-slate-800">
            COHORT MEMBERS ({cohortMembers.filter(m => m.status === 'online').length + 1} ONLINE)
          </h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs ${isDarkMode ? 'bg-gradient-to-tr from-indigo-500 to-violet-500' : 'bg-gradient-to-tr from-teal-400 to-cyan-500'}`}>
                  {userName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h5 className="text-xs font-bold">{userName}</h5>
                  <p className={`text-[9px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>Identity Owner</p>
                </div>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {cohortMembers.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-stone-50 border-stone-100 text-stone-600'}`}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">{member.name}</h5>
                    <p className={`text-[9px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>{member.title}</p>
                  </div>
                </div>
                <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Community Cohort Live Chat */}
      <div className={`flex-1 rounded-3xl border flex flex-col h-[650px] shadow-xs relative overflow-hidden ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-stone-200/50 text-stone-900'}`}>
        
        <header className="p-5 border-b flex items-center justify-between border-stone-100 dark:border-slate-800 bg-stone-50/40 dark:bg-slate-950/20">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm ${isDarkMode ? 'bg-gradient-to-tr from-indigo-500 to-violet-600' : 'bg-gradient-to-tr from-teal-400 to-cyan-500'}`}>
              <Users className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide uppercase">{community.name}</h2>
              <p className={`text-[10px] font-mono leading-none mt-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>
                Facilitator: <span className="font-bold text-indigo-400">{community.agent_name}</span>
              </p>
            </div>
          </div>
          
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-mono font-bold ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
            <Lock className="w-3 h-3 text-amber-500" />
            <span>COMMUNITY BROADCAST ONLY</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed max-w-2xl mx-auto mb-2 text-center flex flex-col gap-1 shadow-2xs ${isDarkMode ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-stone-50/80 border-stone-200/50 text-stone-500'}`}>
            <p className="font-semibold text-stone-600 dark:text-slate-300">👋 Cohort Discussion Agreement</p>
            <p>Welcome to your goal-based collaboration board. You have been grouped here based on your career trajectory. Personal chats are locked; all insights must compile publicly to train other members' models.</p>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender_id === userId;
            const isAgent = msg.role === 'assistant';
            
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                  isMe 
                    ? isDarkMode ? 'bg-gradient-to-tr from-indigo-500 to-violet-500 text-white' : 'bg-gradient-to-tr from-teal-400 to-cyan-500 text-white'
                    : isAgent 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 border border-stone-200/55 dark:border-slate-700'
                }`}>
                  {isAgent ? community.agent_avatar : (msg.sender_name || 'U').slice(0, 1)}
                </div>

                <div className="flex flex-col gap-1">
                  <div className={`flex items-center gap-2 text-[9px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className={`font-bold ${isAgent ? 'text-indigo-400' : isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                      {msg.sender_name}
                    </span>
                    <span className={`text-[8px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed border transition shadow-2xs ${
                    isMe 
                      ? isDarkMode 
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-slate-100 rounded-tr-xs' 
                        : 'bg-teal-500/5 border-teal-200/60 text-stone-850 rounded-tr-xs'
                      : isAgent
                        ? isDarkMode
                          ? 'bg-indigo-950/60 border-indigo-500/30 text-indigo-200 rounded-tl-xs'
                          : 'bg-indigo-50/60 border-indigo-100 text-indigo-850 rounded-tl-xs'
                        : isDarkMode
                          ? 'bg-slate-900 border-slate-800 text-slate-300 rounded-tl-xs'
                          : 'bg-stone-50 border-stone-150 text-stone-700 rounded-tl-xs'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%] self-start animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xs shrink-0">
                {typingUser === community.agent_name ? community.agent_avatar : <User className="w-4 h-4 text-stone-400" />}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400">{typingUser}</span>
                <div className={`rounded-2xl px-4 py-3 text-xs border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                  <div className="flex gap-1.5 items-center justify-center h-4">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form 
          onSubmit={handleSendMessage}
          className="p-4 border-t border-stone-100 dark:border-slate-800 bg-stone-50/20 dark:bg-slate-950/10 flex items-center gap-3 shrink-0"
        >
          <input 
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Message community cohort as ${userName}...`}
            className={`flex-1 px-4 py-3.5 rounded-2xl border text-xs outline-none transition-all ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10' 
                : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/5'
            }`}
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className={`p-3.5 rounded-2xl text-white shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              chatInput.trim() 
                ? isDarkMode
                  ? 'bg-gradient-to-tr from-indigo-500 to-violet-600 hover:shadow-indigo-500/20'
                  : 'bg-gradient-to-tr from-teal-400 to-cyan-500 hover:shadow-teal-500/20'
                : 'bg-stone-300 dark:bg-slate-800 text-stone-400 dark:text-slate-600 shadow-none cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
