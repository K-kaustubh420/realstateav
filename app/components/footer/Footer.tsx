// components/footer/Footer.tsx
import Link from 'next/link';
import { SiHomebridge } from "react-icons/si";
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
});

const Footer = () => {
  const linkSections = [
    { title: 'Real estate for sale', links: ['Berwick real estate', 'Craigieburn real estate', 'Doreen real estate', 'More...'] },
    { title: 'Real estate for rent', links: ['Berwick rentals', 'Craigieburn rentals', 'Doreen rentals', 'More...'] },
    { title: 'Top rated suburbs', links: ['Berwick reviews', 'Craigieburn reviews', 'Doreen reviews', 'More...'] },
    { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Contact Us'] },
    { title: 'Support', links: ['Help Center', 'Agent Finder', 'Suburb Reviews', 'Questions'] },
  ];

  return (
    <footer className="bg-black border-t border-zinc-800 text-zinc-400">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 pr-8">
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <SiHomebridge className="h-8 w-8 text-brand-gold" />
              <span className={`${playfair.className} font-bold text-2xl text-white`}>Bhu Market</span>
            </Link>
            <p className="text-sm">Elevating Real Estate, Defining Luxury. Your premier destination for the world's most exclusive properties.</p>
          </div>

          {/* Link Columns */}
          {linkSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-brand-gold transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-dark-bg border-t border-zinc-800 py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Bhu Market. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;