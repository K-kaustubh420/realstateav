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
  IoPersonOutline,
} from 'react-icons/io5';

import {
  FiMenu,
} from 'react-icons/fi';

import {
  Playfair_Display,
  Orbitron,
} from 'next/font/google';

import {
  onAuthStateChanged,
} from 'firebase/auth';

import {
  auth,
} from '@/lib/firebase';

import {
  logout,
} from '@/auth/userauth';

import LoginModal from '../user/login/LoginModal';

// Fonts
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-playfair',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-orbitron',
});

const mainNavLinks = [
  { href: '/buy', label: 'Buy' },
  { href: '/rent', label: 'Rent' },
  { href: '/sell', label: 'Sell' },
  { href: '#', label: 'Agent Finder' },
  { href: '#', label: 'Suburb Reviews' },
  { href: '#', label: 'Questions' },
  { href: '#', label: 'Blog' },
];

const secondaryNavLinks = [
  { href: '#', label: 'Collections' },
  { href: '#', label: 'My Alerts' },
];

const NavLink = ({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) => (

  <Link
    href={href}
    className={`${orbitron.className}
      relative text-zinc-300 hover:text-white
      transition-colors text-[11px]
      xl:text-[12px] font-bold px-1 pb-1
      uppercase tracking-wider
      after:content-['']
      after:absolute after:left-0
      after:-bottom-1.5 after:h-0.5
      after:w-0 after:bg-white
      after:transition-all after:duration-300
      hover:after:w-full ${className}`}
  >
    {label}
  </Link>

);

const Navbar = (): JSX.Element => {

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

  const closeDropdown = () => {

    const elem =
      document.activeElement as HTMLElement;

    if (elem) {

      elem.blur();

    }

  };

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
        <div className="navbar-start flex-1 w-auto">

          <Link
            href="/"
            className="transition-opacity hover:opacity-90 flex items-center gap-2 sm:gap-3 group whitespace-nowrap"
          >

            <SiHomebridge className="h-6 w-6 sm:h-8 sm:w-8 text-white transition-transform group-hover:scale-105" />

            <span
              className={`${playfair.className}
              font-bold text-lg sm:text-2xl
              text-white tracking-tight`}
            >
              Bhu Market
            </span>

          </Link>

        </div>

        {/* CENTER */}
        <div className="navbar-center hidden lg:flex items-center justify-center">

          <ul className="menu menu-horizontal items-center gap-3 xl:gap-5 px-1">

            {mainNavLinks.map((link) => (

              <li key={link.label}>

                <NavLink
                  href={link.href}
                  label={link.label}
                />

              </li>

            ))}

          </ul>

          <div className="h-4 w-px bg-zinc-700 mx-4 xl:mx-6"></div>

          <ul className="menu menu-horizontal items-center gap-4 xl:gap-6 px-1">

            {secondaryNavLinks.map((link) => (

              <li key={link.label}>

                <NavLink
                  href={link.href}
                  label={link.label}
                />

              </li>

            ))}

          </ul>

        </div>

        {/* RIGHT */}
        <div className="navbar-end flex-none w-auto gap-2 sm:gap-4 pl-2">

          {user ? (

            <div className="flex items-center gap-4">

              <Link
                href="/user/dashboard"
                className="btn btn-sm h-8 sm:h-9 bg-[#FBBF24] text-black hover:bg-[#d9a520] border-none rounded-full capitalize text-xs sm:text-sm font-bold px-4 sm:px-5 hidden sm:inline-flex transition-transform hover:scale-105"
              >
                Dashboard
              </Link>

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

                    <Link href="/user/dashboard">
                      My Dashboard
                    </Link>

                  </li>

                  <li>

                    <button
                      onClick={logout}
                      className="text-red-400"
                    >
                      Logout
                    </button>

                  </li>

                </ul>

              </div>

            </div>

          ) : (

            <>

              <button
                className="btn btn-sm h-8 sm:h-9 bg-white text-black hover:bg-white/90 border border-white rounded-full capitalize text-xs sm:text-sm font-bold px-4 sm:px-5 hidden sm:inline-flex transition-transform hover:scale-105"
                onClick={openModal}
              >
                Sign Up
              </button>

              <div
                className="indicator cursor-pointer group"
                onClick={openModal}
              >

                <span className="indicator-item badge badge-xs sm:badge-sm bg-white text-black border-white font-semibold top-1 right-1">

                  0

                </span>

                <button className="btn btn-ghost btn-circle btn-sm sm:btn-md text-zinc-300 hover:bg-white/10 hover:text-white transition-colors">

                  <IoPersonOutline
                    size={20}
                    className="sm:w-5.5 sm:h-5.5"
                  />

                </button>

              </div>

            </>

          )}

          {/* MOBILE MENU */}
          <div className="dropdown dropdown-end lg:hidden">

            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle btn-sm sm:btn-md text-zinc-300 hover:bg-white/10"
            >

              <FiMenu className="h-5 w-5 sm:h-6 sm:w-6" />

            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-black/95 backdrop-blur-md border border-zinc-800 rounded-lg z-[1] mt-4 w-64 p-4 shadow-2xl right-0"
            >

              {mainNavLinks.map(link => (

                <li key={link.label}>

                  <Link
                    href={link.href}
                    className={`${orbitron.className}
                    text-zinc-300 hover:text-white
                    py-2 uppercase text-xs tracking-wider`}
                    onClick={closeDropdown}
                  >

                    {link.label}

                  </Link>

                </li>

              ))}

              <div className="divider my-2 before:bg-zinc-800 after:bg-zinc-800"></div>

              {secondaryNavLinks.map(link => (

                <li key={link.label}>

                  <Link
                    href={link.href}
                    className={`${orbitron.className}
                    text-zinc-300 hover:text-white
                    py-2 uppercase text-xs tracking-wider`}
                    onClick={closeDropdown}
                  >

                    {link.label}

                  </Link>

                </li>

              ))}

              {!user && (

                <li className="mt-3">

                  <button
                    className="btn btn-warning"
                    onClick={() => {
                      closeDropdown();
                      openModal();
                    }}
                  >
                    Sign Up
                  </button>

                </li>

              )}

            </ul>

          </div>

        </div>

      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeModal}
      />

    </>
  );
};

export default Navbar;