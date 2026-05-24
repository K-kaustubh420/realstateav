// components/properties/FeaturedProperties.tsx
import PropertyCard from './PropertyCard';

const properties = [
    { imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYavV0EyrwfJakk-Ih4b7czh6QYtfUk7bnZQ&s', price: '$2,100,000', address: '123 Luxury Ave, Beverly Hills, CA', beds: 5, baths: 4, parking: 3, sqft: '4,500 sqft' },
    { imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCeI1CCakeHepBykGuJLsTs0Uzj0nYsDscKA&s', price: 'Contact Agent', address: '456 Ocean Dr, Miami, FL', beds: 4, baths: 5, parking: 2, sqft: '3,800 sqft' },
    { imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnC31h0TpdGH_PmKbHcUiD-a8TWRvio1E-mw&s', price: '$3,500,000', address: '789 Skyline Blvd, Aspen, CO', beds: 6, baths: 6, parking: 4, sqft: '6,200 sqft' },
];

const FeaturedProperties = () => {
  return (
    <section className="dark:bg-dark-bg bg-light-bg py-20 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-4xl font-bold text-center dark:text-white text-black  mb-4">New Properties on Bhu Market</h2>
        <p className="text-center dark:text-zinc-400 text-zinc-700 max-w-2xl mx-auto mb-12">
          Discover the latest collection of exquisite properties, curated for the discerning buyer.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop, index) => (
            <PropertyCard key={index} {...prop} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;