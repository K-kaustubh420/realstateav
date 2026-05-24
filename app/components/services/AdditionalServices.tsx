// components/services/AdditionalServices.tsx
import ServiceCard from './ServiceCard';

const services = [
    {
        imageUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'Business for Sale',
        description: 'Explore exclusive opportunities to acquire established and promising businesses.'
    },
    {
        imageUrl: 'https://images.pexels.com/photos/731082/pexels-photo-731082.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        title: 'Bank Mortgage',
        description: 'Secure the best financing options and mortgage rates for your dream property.'
    }
];

const AdditionalServices = () => {
  return (
    <section className="dark:bg-dark-bg bg-light-bg pt-8 pb-20 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdditionalServices;