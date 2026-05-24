// components/properties/PropertyCard.tsx
import Image from 'next/image';
import { BedDouble, Bath, Car, Heart } from 'lucide-react';

type PropertyCardProps = {
  imageUrl: string;
  price: string;
  address: string;
  beds: number;
  baths: number;
  parking: number;
  sqft: string;
};

const PropertyCard = ({ imageUrl, price, address, beds, baths, parking, sqft }: PropertyCardProps) => {
  return (
    <div className="dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-amber-50 shadow-2xl rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-brand-gold/10 hover:-translate-y-2">
      <div className="relative">
        <Image src={imageUrl} alt={address} width={400} height={250} className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute top-3 right-3 bg-dark-bg/50 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-brand-gold/20 transition-colors">
          <Heart className="w-5 h-5 dark:text-white text-black" />
        </div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent w-full p-4">
           <p className="text-zinc-300  text-sm">{address}</p>
          <h3 className="font-serif text-2xl text-white  font-bold">{price}</h3>
        </div>
      </div>
      <div className="p-4 flex justify-between items-center dark:text-zinc-400 text-zinc-700 bg-dark-bg">
        <div className="flex items-center gap-2">
          <BedDouble className="w-5 h-5 text-brand-gold" />
          <span>{beds}</span>
        </div>
        <div className="flex items-center gap-2">
          <Bath className="w-5 h-5 text-brand-gold" />
          <span>{baths}</span>
        </div>
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-brand-gold" />
          <span>{parking}</span>
        </div>
        <div className="font-bold text-sm">{sqft}</div>
      </div>
    </div>
  );
};

export default PropertyCard;