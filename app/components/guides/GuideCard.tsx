// components/guides/GuideCard.tsx
import Image from 'next/image';
import Link from 'next/link';

type GuideCardProps = {
  imageUrl: string;
  category: string;
  title: string;
  href: string;
};

const GuideCard = ({ imageUrl, category, title, href }: GuideCardProps) => {
  return (
    <Link href={href} className="group block">
      <div className="overflow-hidden rounded-lg">
        <Image src={imageUrl} alt={title} width={400} height={250} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="mt-4">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-2">{category}</p>
        <h3 className="font-serif text-2xl font-semibold dark:text-white text-black/90 dark:group-hover:text-zinc-300  group-hover:text-zinc-500 transition-colors">{title}</h3>
      </div>
    </Link>
  );
};

export default GuideCard;

