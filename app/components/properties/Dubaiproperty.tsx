// components/properties/Dubaiproperty.tsx
import Link from 'next/link';
import PropertyCard from './PropertyCard';

const dubaiProperties = [
    { imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800', price: 'AED 3,500,000', address: 'Downtown Dubai, Dubai, UAE', beds: 3, baths: 4, parking: 2, sqft: '2,500 sqft' },
    { imageUrl: 'https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&q=80&w=800', price: 'AED 8,200,000', address: 'Palm Jumeirah, Dubai, UAE', beds: 5, baths: 6, parking: 3, sqft: '5,200 sqft' },
    { imageUrl: 'https://images.unsplash.com/photo-1582653291997-079a1c04e5d1?auto=format&fit=crop&q=80&w=800', price: 'AED 1,800,000', address: 'Dubai Marina, Dubai, UAE', beds: 2, baths: 2, parking: 1, sqft: '1,200 sqft' },
];

const Dubaiproperty = () => {
  return (
    <section className="dark:bg-dark-bg bg-light-bg py-20 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-4xl font-bold text-center dark:text-white text-black mb-4">Invest in Dubai Properties</h2>
        <p className="text-center dark:text-zinc-400 text-zinc-700 max-w-2xl mx-auto mb-12">
          Explore premium real estate opportunities in Dubai. High ROI, tax-free environment, and luxury living.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dubaiProperties.map((prop, index) => (
            <Link href="/dubai-properties/buy" key={index} className="block cursor-pointer">
              <PropertyCard {...prop} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dubaiproperty;
