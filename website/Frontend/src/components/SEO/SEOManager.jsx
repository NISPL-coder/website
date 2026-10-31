import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route-specific SEO Metadata Configuration
 * Ensures maximum search engine visibility for every service and page.
 */
const PAGE_SEO = {
  '/': {
    title: 'Net Infotech System (NISPL) | Tally 3-Star Partner, Cloud Hosting, IT Infrastructure & Cybersecurity',
    description: 'Net Infotech System Pvt. Ltd. (NISPL) - Premier IT Solutions & Tally 3-Star Certified Partner in Kolkata & Eastern India. Specializing in Tally on Cloud, Enterprise Cloud Server & Hosting, IT Infrastructure Management, 24/7 Managed IT Services & AMC, Cybersecurity Solutions, Microsoft 365 Licensing, and CtrlS Kolkata Rated-4 Datacenter Colocation.',
    keywords: 'Net Infotech System, NISPL, Tally on Cloud, Tally Prime 3-Star Partner, Tally Certified Partner Kolkata, IT Infrastructure Management, Cloud Server Hosting, Cloud VPS, Managed IT Services, IT AMC Services Kolkata, 24/7 NOC Support, Cyber Security Solutions, UTM Firewall, Endpoint Security, Zero-Trust Architecture, Microsoft 365 Licensing Partner, Microsoft Licensing Solutions, Windows Server Migration, CtrlS Kolkata Datacenter, Bengal Silicon Valley Datacenter, Enterprise IT Solutions, Dedicated Servers, Colocation Services, Salt Lake Sector V Kolkata, IT Solutions Eastern India, Odisha, West Bengal',
    canonical: 'https://nispl.netlify.app/'
  },
  '/about': {
    title: 'About Us & Work Culture | Net Infotech System (NISPL) Kolkata',
    description: 'Learn about Net Infotech System Pvt. Ltd. (NISPL) - Over 25 years of excellence in enterprise IT solutions, Tally certifications, technology awareness conclaves, and workplace culture across Eastern India.',
    keywords: 'About Net Infotech System, NISPL Legacy, 25 Years IT Solutions, Tally Gold Partner Kolkata, Work Culture, Awareness Program, Annual Convention, Salt Lake Sector V Kolkata IT Company',
    canonical: 'https://nispl.netlify.app/about'
  },
  '/about-us': {
    title: 'About Us & Work Culture | Net Infotech System (NISPL) Kolkata',
    description: 'Learn about Net Infotech System Pvt. Ltd. (NISPL) - Over 25 years of excellence in enterprise IT solutions, Tally certifications, technology awareness conclaves, and workplace culture across Eastern India.',
    keywords: 'About Net Infotech System, NISPL Legacy, 25 Years IT Solutions, Tally Gold Partner Kolkata, Work Culture, Awareness Program, Annual Convention, Salt Lake Sector V Kolkata IT Company',
    canonical: 'https://nispl.netlify.app/about'
  },
  '/contact': {
    title: 'Contact Us | Net Infotech System (NISPL) - Webel Tower 1 Kolkata',
    description: 'Get in touch with Net Infotech System Pvt. Ltd. for Tally on Cloud, cloud hosting, managed IT AMC, cybersecurity audits, and Microsoft 365 licensing. Registered office at Webel Tower 1, Sector V, Salt Lake, Kolkata.',
    keywords: 'Contact Net Infotech System, NISPL Phone Number, Webel Tower 1 Sector V Kolkata, IT Support Kolkata, Tally Customer Care Kolkata, Cloud Server Consultation, IT AMC Inquiry Kolkata',
    canonical: 'https://nispl.netlify.app/contact'
  },
  '/career': {
    title: 'Careers & Current Job Openings | Net Infotech System (NISPL)',
    description: 'Join Net Infotech System Pvt. Ltd. (NISPL). Explore career opportunities for Cloud Engineers, Tally Consultants, Network Administrators, and Enterprise IT Sales Executives in Kolkata and Eastern India.',
    keywords: 'Net Infotech Careers, IT Jobs Kolkata, Tally Consultant Jobs, Cloud Engineer Vacancy Kolkata, Network Administrator Jobs Salt Lake Sector V, NISPL Hiring',
    canonical: 'https://nispl.netlify.app/career'
  },
  '/login': {
    title: 'Secure Client, Partner & Admin Login Portals | Net Infotech System (NISPL)',
    description: 'Unified login access for Net Infotech System (NISPL). Access NISPL Admin Infrastructure, Authorized Tally Partner Hub, and Enterprise Customer Tally on Cloud ERP.',
    keywords: 'NISPL Login, Net Infotech System Admin Login, Tally Cloud Login, Partner Portal NISPL, Customer Cloud Access Kolkata, IT Support Portal',
    canonical: 'https://nispl.netlify.app/login'
  }
};

/**
 * SEOManager Component
 * Dynamically updates document title, meta description, keywords, Open Graph,
 * and canonical tags based on the active route to ensure top search engine rankings.
 */
export default function SEOManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Find matching SEO config or fallback to homepage
    const seo = PAGE_SEO[pathname] || PAGE_SEO['/'];

    // 1. Update Document Title
    document.title = seo.title;

    // 2. Helper to set or create a <meta> tag
    const setMetaTag = (attribute, name, content) => {
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 3. Update Standard Meta Tags
    setMetaTag('name', 'description', seo.description);
    setMetaTag('name', 'keywords', seo.keywords);

    // 4. Update Open Graph Tags
    setMetaTag('property', 'og:title', seo.title);
    setMetaTag('property', 'og:description', seo.description);
    setMetaTag('property', 'og:url', seo.canonical);

    // 5. Update Twitter Card Tags
    setMetaTag('name', 'twitter:title', seo.title);
    setMetaTag('name', 'twitter:description', seo.description);

    // 6. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seo.canonical);
  }, [pathname]);

  return null;
}
