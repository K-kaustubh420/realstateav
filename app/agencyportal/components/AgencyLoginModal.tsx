"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAgencyLogin } from '@/hooks/useAgencyLogin';

export default function AgencyLoginModal() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleEmailLogin,
    handleGoogleLogin,
  } = useAgencyLogin();

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-black font-sans">
      {/* Left Column: Image & Branding */}
      <div className="relative hidden md:block">
        <Image
          src="https://i.pinimg.com/1200x/31/ad/d6/31add634f92ccd0004daf12b6a571722.jpg"
          alt="Modern office interior for real estate agents"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent p-12 flex flex-col justify-between">
          <div>
            <Link href="/" className="font-serif text-3xl font-bold text-white">
              Bhu Market
            </Link>
          </div>
          <div className="text-white">
            <h1 className="font-serif text-5xl font-bold leading-tight">
              Agency Portal
            </h1>
            <p className="mt-4 text-xl text-zinc-300">
              Access your exclusive dashboard to manage your agency and listings.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              Agency Login
            </h2>
            <p className="text-gray-600 dark:text-zinc-400">
              Please sign in to your agency account.
            </p>
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong className="font-semibold">Note:</strong> Please use the same credentials as your Agent account to log in.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                </span>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Password
                </label>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                </span>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 hover:bg-yellow-500 hover:shadow-lg hover:shadow-brand-gold/20 transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="grow border-gray-200 dark:border-zinc-800" />
            <span className="mx-4 text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              Or continue with
            </span>
            <hr className="grow border-gray-200 dark:border-zinc-800" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FcGoogle size={22} />
            Sign in with Google
          </button>

          <p className="mt-8 text-center text-gray-600 dark:text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link href="/agencyportal/register" className="font-semibold text-[#D4AF37] hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}