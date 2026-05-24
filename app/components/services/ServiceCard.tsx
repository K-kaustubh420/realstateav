// components/services/ServiceCard.tsx
import Image from 'next/image';

type ServiceCardProps = {
  imageUrl: string;
  title: string;
  description: string;
};

const ServiceCard = ({ imageUrl, title, description }: ServiceCardProps) => {
  return (
    <div className="dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-amber-50 shadow-2xl rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-brand-gold/10 hover:-translate-y-2">
      <div className="relative">
        <Image 
          src={imageUrl} 
          alt={title} 
          width={600} 
          height={400} 
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
          <h3 className="font-serif text-3xl text-white font-bold">{title}</h3>
        </div>
      </div>
      <div className="p-6 bg-dark-bg">
        <p className="text-zinc-400 mb-4 h-12">{description}</p>
        <a href="#" className="font-semibold text-brand-gold hover:underline flex items-center group">
          Learn More
          <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </a>
      </div>
    </div>
  );
};

export default ServiceCard;