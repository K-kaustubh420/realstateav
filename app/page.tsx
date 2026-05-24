// app/page.tsx
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AdditionalServices from './components/services/AdditionalServices'; 
import MortgageCalculator from './components/properties/MortgageCalculator';
import FeaturedProperties from './components/properties/FeaturedProperties';
import Dubaiproperty from './components/properties/Dubaiproperty';
import ServiceHighlights from './components/services/ServiceHighlights';
import FeaturedGuides from './components/guides/FeaturedGuides';
import AdditionalInformation from './components/AdditionaInformation';
import Footer from './components/footer/Footer';

const Page = () => {
  return (
    <div className='bg-dark-bg text-white'>
      <div className="div z-10"><Navbar /></div>
      <main>
        <Hero />
        <AdditionalServices />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold font-[Playfair_Display] mb-4 text-[#D4AF37]">Calculate Your Home Loan Now</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Get pre-approved faster. Estimate your monthly mortgage payments and explore your budget before you start house hunting.</p>
          </div>
          <MortgageCalculator />
        </div>
        <FeaturedProperties />
        <Dubaiproperty />
        <ServiceHighlights />
        <AdditionalInformation />
        <FeaturedGuides />
      </main>
      <Footer />
    </div>
  );
};

export default Page;
