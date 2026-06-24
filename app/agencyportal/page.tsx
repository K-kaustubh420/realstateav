"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, KeyRound, ShieldCheck, UserPlus, TrendingUp, Users } from 'lucide-react';

export default function AgencyPortalLobby() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-zinc-900 dark:text-white flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Gradients using Framer Motion for subtle movement */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.03, 0.08, 0.03],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-200 h-200 bg-amber-500/30 dark:bg-amber-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.02, 0.06, 0.02],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-160 h-160 bg-blue-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] pointer-events-none"
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 z-10 relative mt-10 lg:mt-0">
        
        {/* Left Side - Information / Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 w-fit mb-8 shadow-xl dark:shadow-2xl">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-600 dark:text-zinc-300">Agency Exclusive Portal</span>
          </div>
          
          <h1 className="font-serif text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-zinc-900 dark:text-white">
            Scale Your <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-200 dark:via-amber-400 dark:to-amber-600">Agency</span> <br />
            Operations.
          </h1>
          
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10 max-w-lg leading-relaxed font-light">
            Bring your entire team to the Arvista Real Estate network. Manage premium properties, invite your agents, and oversee performance across your entire real estate firm.
          </p>

          <div className="space-y-6">
            {[
              { icon: Building2, title: "Manage Your Firm", desc: "Build an agency profile and establish your brand." },
              { icon: Users, title: "Agent Roster", desc: "Add, remove, and track the agents within your agency." },
              { icon: TrendingUp, title: "Portfolio Overview", desc: "View all properties listed under your agency umbrella." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + (idx * 0.15) }}
                className="flex items-start gap-5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center backdrop-blur-sm border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-inner group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 group-hover:border-amber-200 dark:group-hover:border-amber-500/20 transition-colors duration-300 mt-1 shrink-0">
                  <feature.icon className="w-5 h-5 text-amber-600 dark:text-amber-500 group-hover:text-amber-700 dark:group-hover:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-200 mb-1">{feature.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-500 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Action Cards */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col justify-center gap-6"
        >
          {/* Login Card */}
          <Link href="/agencyportal/login">
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-8 rounded-3xl bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-white/5 hover:border-amber-300 dark:hover:border-amber-500/30 shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-linear-to-br from-amber-100 to-transparent dark:from-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-black flex items-center justify-center mb-6 shadow-sm dark:shadow-lg border border-zinc-200 dark:border-white/10 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/10 transition-colors duration-300">
                    <KeyRound className="w-6 h-6 text-zinc-600 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 font-serif tracking-wide text-zinc-900 dark:text-white">Agency Dashboard</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed pr-6 text-sm">Access your agency console to manage listings and track your team's progress.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300 shrink-0 shadow-sm dark:shadow-lg">
                  <ArrowRight className="w-5 h-5 text-zinc-400 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-colors duration-300" />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Register Card */}
          <Link href="/agencyportal/register">
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-8 rounded-3xl bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-white/5 hover:border-amber-300 dark:hover:border-amber-500/30 shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-linear-to-br from-amber-100 to-transparent dark:from-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-black flex items-center justify-center mb-6 shadow-sm dark:shadow-lg border border-zinc-200 dark:border-white/10 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/10 transition-colors duration-300">
                    <UserPlus className="w-6 h-6 text-zinc-600 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 font-serif tracking-wide text-zinc-900 dark:text-white">Open an Agency</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed pr-6 text-sm">Register your real estate agency with us and start inviting your agents.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300 shrink-0 shadow-sm dark:shadow-lg">
                  <ArrowRight className="w-5 h-5 text-zinc-400 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-colors duration-300" />
                </div>
              </div>
            </motion.div>
          </Link>

        </motion.div>
      </div>

      {/* Footer Info inside lobby */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 left-0 right-0 text-center z-10"
      >
        <p className="text-xs text-zinc-500 dark:text-zinc-600 font-medium tracking-wide">
          © {new Date().getFullYear()} ARVISTA REAL ESTATE. ALL RIGHTS RESERVED.
        </p>
      </motion.div>
    </div>
  );
}
