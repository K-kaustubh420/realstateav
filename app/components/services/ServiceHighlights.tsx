// components/services/ServiceHighlights.tsx
import { HandCoins, KeyRound, Landmark  } from 'lucide-react';
import Link from 'next/link';

const services = [
  { icon: Landmark, title: 'Find Homes for Sale', description: 'With new homes added daily and 45+ search filters, we make finding your next home simpler.', href: '#' },
  { icon: KeyRound, title: 'Find Rental Properties', description: 'Millions of renters use our platform to find properties for lease and easily apply for them online.', href: '#' },
  { icon: HandCoins, title: 'Research Sold Properties', description: 'Wanting to find a sold property price or see what sold on the weekend? Explore our vast database.', href: '#' },
];

const ServiceHighlights = () => {
  return (
    <section className="bg-black py-20 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="font-serif text-4xl font-bold text-white mb-12">Make Better Property Decisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-zinc-900 border border-zinc-800 rounded-full p-5 mb-6">
                <service.icon className="w-10 h-10 text-brand-gold" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-white mb-3">{service.title}</h3>
              <p className="text-zinc-400 mb-6 max-w-xs">{service.description}</p>
              <Link href={service.href} className="font-bold text-brand-gold hover:text-yellow-500 transition-colors duration-300 flex items-center gap-2">
                View Properties
                <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlights;