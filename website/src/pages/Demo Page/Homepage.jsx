import React from 'react';
import Navbar from './sections/Navbar/Navbar';
import HeroCarousel from './sections/HeroCarousel/HeroCarousel';
import InnovatorsPartnersSection from './sections/InnovatorsPartners/InnovatorsPartnersSection';
import StrategicServicesAccordion from './sections/StrategicServices/StrategicServicesAccordion';
import AuthorizedPartnersSection from './sections/AuthorizedPartners/AuthorizedPartnersSection';
import CtrlSKolkataSection from './sections/CtrlSKolkata/CtrlSKolkataSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import OurClientsSection from './sections/OurClients/OurClientsSection';
import Footer from '../../components/Footer';
import './Homepage.css';

export default function Homepage({ 
  onOpenContact, 
  onOpenConsultation 
}) {
  return (
    <div className="demo-page-container">
      {/* 1. Floating Pill Header Navbar (Mega Menus & Mobile Drawer) */}
      <Navbar 
        onOpenContact={onOpenContact} 
        onOpenConsultation={onOpenConsultation} 
      />

      {/* 2. Hero Carousel Section (Background Video + Controls) */}
      <HeroCarousel 
        onOpenContact={onOpenContact} 
        onOpenConsultation={onOpenConsultation} 
      />

      {/* 3. Innovators. Partners. Catalysts. (Photo Collage & Narrative) */}
      <InnovatorsPartnersSection />

      {/* 4. Strategic Services Horizontal Accordion Slider */}
      <StrategicServicesAccordion 
        onOpenConsultation={onOpenConsultation} 
      />

      {/* 5. CtrlS Kolkata Rated-4 Datacenter Showcase */}
      <CtrlSKolkataSection 
        onOpenConsultation={onOpenConsultation} 
      />

      {/* 6. Authorized Enterprise Technology Partners Showcase */}
      <AuthorizedPartnersSection />

      {/* 6. Testimonials Section (Cyberswift 3-Card Style) */}
      <TestimonialsSection />

      {/* 7. Premier Clients Showcase Grid */}
      <OurClientsSection />

      {/* 8. Comprehensive Official Footer */}
      <Footer />
    </div>
  );
}
