// components/Agent.tsx

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * A section component to attract real estate agents, featuring a modern,
 * split-container design with light and dark theme support.
 */
const AgentSection = () => {
  return (
    // Section wrapper with theme-aware background colors and padding
    <section className="bg-white dark:bg-black py-20 lg:py-28 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        
        {/* 
          Main container: 
          - 'group' enables hover effects on child elements.
          - 'flex' with responsive direction (stacks on mobile, row on desktop).
          - 'overflow-hidden' is crucial for the child Image component's rounded corners.
          - Theme-aware borders and shadows for depth.
        */}
        <div className="group flex flex-col md:flex-row rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-lg transition-shadow duration-300 hover:shadow-2xl">
          
          {/* Column 1: Image Container */}
          <div className="relative w-full md:w-1/2 h-80 md:h-auto min-h-100">
            {/* 
              Using next/image for optimized image loading.
              - layout="fill" and objectFit="cover" make it behave like a background image.
              - The hover effect scales the image slightly for a dynamic feel.
            */}
            <Image
              src="https://i.pinimg.com/736x/df/b7/f6/dfb7f61cd947d9e217f75feb944654fd.jpg"
              alt="A professional real estate agent ready to partner with clients"
              layout="fill"
              objectFit="cover"
              className="transform transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
          </div>

          {/* Column 2: Text Content & Call to Action */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-8 lg:p-12 text-center md:text-left">
            <span className="font-semibold text-brand-gold tracking-wider uppercase mb-3">
              Partner with Bhu Market
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white leading-tight mb-5">
              Join Our Elite Network of Agents
            </h2>
            <p className="text-gray-600 dark:text-zinc-400 text-lg mb-8 max-w-lg mx-auto md:mx-0">
              Unlock exclusive tools, access a network of high-net-worth clients, and elevate your real estate career. We provide the platform, you close the deals.
            </p>

            {/* 
              The call-to-action button is always visible.
              It uses the Next.js Link component for fast, client-side navigation to '/agentportal'.
            */}
            <Link 
              href="/agentportal" 
              className="inline-flex items-center justify-center w-fit mx-auto md:mx-0 group/link bg-brand-gold text-black font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 bg-yellow-500 hover:shadow-lg hover:shadow-brand-gold/20 transform hover:-translate-y-1"
            >
              Register Now
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentSection;