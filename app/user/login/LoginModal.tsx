'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, easeInOut } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { IoMdClose } from 'react-icons/io';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

// Make sure this path is correct
import { login, signup, googleLogin } from "@/auth/userauth"; 

// --- PROPS ---
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- SUB-COMPONENTS ---
interface InputFieldProps {
  id: string;
  type: string;
  placeholder: string;
  icon: React.ElementType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPassword?: boolean;
  showPassword?: boolean;
  togglePassword?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({ 
  id, type, placeholder, icon: Icon, value, onChange, isPassword = false, showPassword, togglePassword 
}) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-zinc-500">
      <Icon size={20} />
    </span>
    <input
      id={id}
      name={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className="w-full py-3.5 pl-12 pr-12 bg-slate-100/80 dark:bg-transparent border-2 border-slate-300/80 dark:border-zinc-700 rounded-xl 
                 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 
                 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500
                 transition-all duration-300"
    />
    {isPassword && (
      <button
        type="button"
        onClick={togglePassword}
        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 dark:text-zinc-500 hover:text-yellow-500 transition-colors"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    )}
  </div>
);

// --- MAIN COMPONENT ---
export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // --- FORM STATE ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const title = isLoginView ? 'Welcome Back' : 'Create Your Account';
  const subtitle = isLoginView ? 'Sign in to access your exclusive portfolio.' : 'Join the market for luxury properties.';

  const handleSwitchView = () => {
    setIsLoginView(!isLoginView);
    setShowPassword(false);
    setError(null);
    setFullName('');
    setEmail('');
    setPassword('');
  };
  
  // --- FORM SUBMISSION HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        // PASS FULLNAME HERE!
        await signup(email, password, fullName);
      }
      onClose(); 
    } catch (err: unknown) {
      // Firebase throws specific errors. You can format them to look nicer.
      let message = "An unexpected error occurred.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }
      if (message.includes("auth/invalid-credential")) message = "Invalid email or password.";
      if (message.includes("auth/email-already-in-use")) message = "An account with this email already exists.";
      if (message.includes("auth/weak-password")) message = "Password should be at least 6 characters.";
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- SOCIAL SIGN-IN HANDLER ---
  const handleSocialSubmit = async (socialAction: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);
    try {
      await socialAction();
      onClose();
    } catch (err: any) {
      if (err.message !== "Firebase: Error (auth/popup-closed-by-user).") {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const socialButtons = [
    { icon: <FcGoogle size={22} />, label: 'Continue with Google', action: googleLogin },
  ];

  // --- VARIANTS ---
  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }};
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { damping: 25, stiffness: 200 } },
    exit: { opacity: 0, scale: 0.95, y: 30, transition: { duration: 0.2 } },
  };
  const inputFieldAnimation = {
      initial: { opacity: 0, y: -20, height: 0, marginBottom: '0px' },
      animate: { opacity: 1, y: 0, height: 'auto', marginBottom: '1rem', transition: { duration: 0.4, ease: easeInOut } },
      exit: { opacity: 0, y: -20, height: 0, marginBottom: '0px', transition: { duration: 0.3, ease: easeInOut } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
        >
          <div onClick={onClose} className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" />

          <motion.div
            className="relative w-full max-w-md p-6 sm:p-8 md:p-10
                       bg-white dark:bg-black/60 dark:backdrop-blur-xl 
                       rounded-2xl border border-slate-200 dark:border-zinc-800/50
                       shadow-2xl shadow-slate-500/10 dark:shadow-yellow-500/5"
            variants={modalVariants}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <IoMdClose size={24} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-slate-900 dark:text-white mb-2">{title}</h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm">{subtitle}</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <AnimatePresence>
                {!isLoginView && (
                    <motion.div {...inputFieldAnimation}>
                        <InputField 
                          id="fullname" 
                          type="text" 
                          placeholder="Full Name" 
                          icon={User} 
                          value={fullName} 
                          onChange={(e) => setFullName(e.target.value)} 
                        />
                    </motion.div>
                )}
              </AnimatePresence>
              
              <InputField 
                id="email" 
                type="email" 
                placeholder="Email Address" 
                icon={Mail} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <InputField 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                icon={Lock} 
                isPassword 
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm text-red-500 dark:text-red-400 font-medium px-2"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.03, boxShadow: isLoading ? 'none' : '0 12px 35px -8px rgba(212, 175, 55, 0.55)' }}
                whileTap={{ scale: isLoading ? 1 : 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="w-full py-4 bg-linear-to-r from-[#af902b] to-[#dabc0f] text-black font-bold text-xl rounded-2xl tracking-wide shadow-[0_4px_12px_rgba(0,0,0,0.25)] focus:outline-none focus:ring-4 focus:ring-[#FFD700]/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Create Account')}
              </motion.button>
            </form>

            <div className="flex items-center my-6">
              <hr className="grow border-slate-300 dark:border-zinc-700" />
              <span className="mx-4 text-xs font-medium text-slate-400 dark:text-zinc-500">OR</span>
              <hr className="grow border-slate-300 dark:border-zinc-700" />
            </div>

            <div className="space-y-3">
              {socialButtons.map((btn, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => handleSocialSubmit(btn.action)}
                  disabled={isLoading}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-300/80 dark:border-zinc-700 rounded-xl text-slate-700 dark:text-white font-medium hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {btn.icon}
                  {btn.label}
                </motion.button>
              ))}
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-zinc-400 mt-8">
              {isLoginView ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={handleSwitchView}
                className="font-medium text-[#FFD700] hover:text-yellow-600 dark:hover:text-yellow-400 relative ml-2 transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-yellow-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {isLoginView ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}