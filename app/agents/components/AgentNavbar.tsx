'use client';

import React, {
  useState,
  useEffect,
  JSX,
} from 'react';

import Link from 'next/link';

import {
  SiHomebridge,
} from "react-icons/si";

import {
  FiMenu,
} from 'react-icons/fi';

import {
  Playfair_Display,
} from 'next/font/google';

import {
  onAuthStateChanged,
} from 'firebase/auth';

import {
  auth,
} from '@/lib/firebase';

import {
  agentLogout,
} from '@/lib/agentAuth';

import AgentLoginModal
from "./AgentLoginModal";

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-playfair',
});

const AgentNavbar = (): JSX.Element => {

  const [user, setUser] =
    useState<any>(null);

  const [hasScrolled, setHasScrolled] =
    useState(false);

  const [isLoginModalOpen,
    setIsLoginModalOpen] =
    useState(false);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {

          setUser(currentUser);

        }
      );

    return () => unsubscribe();

  }, []);

  useEffect(() => {

    const handleScroll = () => {

      const isScrolled =
        window.scrollY > 20;

      if (isScrolled !== hasScrolled) {

        setHasScrolled(isScrolled);

      }

    };

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        'scroll',
        handleScroll
      );

  }, [hasScrolled]);

  const openModal = () =>
    setIsLoginModalOpen(true);

  const closeModal = () =>
    setIsLoginModalOpen(false);

  return (
    <>

      <header
        className={`navbar fixed top-0 left-0
        w-full z-50 px-4 sm:px-6
        lg:px-10 py-4 transition-all
        duration-300

        ${hasScrolled
          ? 'bg-black/85 backdrop-blur-lg border-b border-zinc-800 shadow-lg'
          : 'bg-transparent'
        }`}
      >

        {/* LEFT */}
        <div className="navbar-start flex-1">

          <Link
            href="/agents"
            className="transition-opacity hover:opacity-90 flex items-center gap-2 sm:gap-3 group whitespace-nowrap"
          >

            <SiHomebridge className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 transition-transform group-hover:scale-105" />

            <span
              className={`${playfair.className}
              font-bold text-lg sm:text-2xl
              text-white tracking-tight`}
            >
              Bhu Market Agents
            </span>

          </Link>

        </div>

        {/* RIGHT */}
        <div className="navbar-end flex items-center gap-3">

          {user ? (

            <div className="dropdown dropdown-end">

              <div
                tabIndex={0}
                role="button"
                className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-lg cursor-pointer"
              >

                {user.email
                  ?.charAt(0)
                  .toUpperCase()}

              </div>

              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-black border border-zinc-800 rounded-box w-52 mt-4 text-white"
              >

                <li>

                  <Link href="/agents/dashboard">
                    Agent Dashboard
                  </Link>

                </li>

                <li>

                  <button
                    onClick={agentLogout}
                    className="text-red-400"
                  >
                    Logout
                  </button>

                </li>

              </ul>

            </div>

          ) : (

            <>

              <button
                className="btn btn-ghost text-white hover:bg-white/10"
                onClick={openModal}
              >
                Login
              </button>

              <button
                className="btn btn-warning rounded-full"
                onClick={openModal}
              >
                Sign Up
              </button>

            </>

          )}

          {/* MOBILE MENU */}
          <div className="dropdown dropdown-end lg:hidden">

            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle text-zinc-300 hover:bg-white/10"
            >

              <FiMenu className="h-5 w-5" />

            </div>

          </div>

        </div>

      </header>

      <AgentLoginModal
        isOpen={isLoginModalOpen}
        onClose={closeModal}
      />

    </>
  );
};

export default AgentNavbar;