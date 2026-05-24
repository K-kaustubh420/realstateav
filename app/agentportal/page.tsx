  "use client";
  import Link from 'next/link';
  import { motion } from 'framer-motion';
  import { ArrowRight, Building2, KeyRound, ShieldCheck, UserPlus, TrendingUp } from 'lucide-react';

  export default function AgentPortalLobby() {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center p-6 relative overflow-hidden bg-[#050505]">
        
        {/* Background Gradients using Framer Motion for subtle movement */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-200 h-200 bg-amber-500/30 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.02, 0.06, 0.02],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-160 h-160 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"
        />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 z-10 relative mt-10 lg:mt-0">
          
          {/* Left Side - Information / Branding */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 w-fit mb-8 shadow-2xl">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-300">Agent Exclusive Portal</span>
            </div>
            
            <h1 className="font-serif text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-amber-400 to-amber-600">Real Estate</span> <br />
              Business.
            </h1>
            
            <p className="text-lg text-zinc-400 mb-10 max-w-lg leading-relaxed font-light">
              Join the Arvista Real Estate network. Manage premium properties, connect with high-net-worth clients, and close deals seamlessly using our advanced agent tools.
            </p>

            <div className="space-y-6">
              {[
                { icon: Building2, title: "Manage Listings", desc: "Showcase your luxury properties to a global audience." },
                { icon: TrendingUp, title: "Performance Metris", desc: "Track leads, views, and interactions in real-time." },
                { icon: KeyRound, title: "Secure Closings", desc: "Manage contracts and secure transactions effortlessly." }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + (idx * 0.15) }}
                  className="flex items-start gap-5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-colors duration-300 mt-1 shrink-0">
                    <feature.icon className="w-5 h-5 text-amber-500 group-hover:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-zinc-200 mb-1">{feature.title}</h3>
                    <p className="text-zinc-500 text-sm">{feature.desc}</p>
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
            <Link href="/agentportal/login">
              <motion.div 
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-white/5 hover:border-amber-500/30 shadow-2xl overflow-hidden transition-all duration-300"
              >
                <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 shadow-lg border border-white/10 group-hover:bg-amber-500/10 transition-colors duration-300">
                      <KeyRound className="w-6 h-6 text-zinc-300 group-hover:text-amber-400 transition-colors duration-300" />
                    </div>
                    <h2 className="text-3xl font-bold mb-3 font-serif tracking-wide text-white">Agent Login</h2>
                    <p className="text-zinc-400 leading-relaxed pr-6 text-sm">Access your dashboard, manage your listings, and view your active leads in real-time.</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300 shrink-0 shadow-lg">
                    <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors duration-300" />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Register Card */}
            <Link href="/agentportal/register">
              <motion.div 
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-white/5 hover:border-amber-500/30 shadow-2xl overflow-hidden transition-all duration-300"
              >
                <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 shadow-lg border border-white/10 group-hover:bg-amber-500/10 transition-colors duration-300">
                      <UserPlus className="w-6 h-6 text-zinc-300 group-hover:text-amber-400 transition-colors duration-300" />
                    </div>
                    <h2 className="text-3xl font-bold mb-3 font-serif tracking-wide text-white">Become an Agent</h2>
                    <p className="text-zinc-400 leading-relaxed pr-6 text-sm">Join our exclusive network of premium real estate professionals and grow your portfolio.</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300 shrink-0 shadow-lg">
                    <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors duration-300" />
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
          <p className="text-xs text-zinc-600 font-medium tracking-wide">
            © {new Date().getFullYear()} ARVISTA REAL ESTATE. ALL RIGHTS RESERVED.
          </p>
        </motion.div>
      </div>
    );
  }
