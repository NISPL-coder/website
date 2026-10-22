export const NAV_ITEMS = [
  { id: 'about', label: 'About Us', path: '/about' },
  { id: 'products', label: 'Products', path: '/products' },
  { id: 'industries', label: 'Industries', path: '/industries' },
  { id: 'services', label: 'Services', path: '/services' },
  { id: 'solutions', label: 'Solutions', path: '/solutions' },
  { id: 'career', label: 'Career', path: '/career' }
];

export const MEGA_MENU_CONFIG = {
  // 1. About Us (Work Culture & Company)
  about: {
    id: 'about',
    label: 'About Us',
    title: 'Work Culture',
    subtitle: 'Life, people & values at NISPL',
    categoryBadge: 'Life at NISPL',
    headerPath: '/about',
    isComingSoon: false,
    links: [
      {
        id: 'culture-inside',
        label: 'Inside NISPL Work Culture',
        desc: 'Everyday agility, teamwork & open workspace life',
        path: '/about#casual-office',
        icon: 'Users',
        badge: 'Culture'
      },
      {
        id: 'culture-awards',
        label: 'Workplace Excellence & Awards',
        desc: 'Industry benchmarking, Aikyam & leadership conclaves',
        path: '/about#conventions-aikyam',
        icon: 'Award',
        badge: 'Honors'
      },
      {
        id: 'culture-festivals',
        label: 'Celebrations & Traditions',
        desc: 'Diwali festivities, Puja ceremonies & team bonding',
        path: '/about#festive-celebrations',
        icon: 'Sparkles',
        badge: 'Tradition'
      }
    ],
    items: [
      { id: 'culture-inside', label: 'Inside NISPL Work Culture', path: '/about#casual-office' },
      { id: 'culture-awards', label: 'Workplace Excellence & Awards', path: '/about#conventions-aikyam' },
      { id: 'culture-festivals', label: 'Celebrations & Traditions', path: '/about#festive-celebrations' }
    ],
    footer: {
      text: 'Want to become part of our team?',
      linkText: 'Explore Careers',
      path: '/career'
    }
  },

  // 2. Products
  products: {
    id: 'products',
    label: 'Products',
    title: 'Enterprise Products',
    subtitle: 'Tally Prime, Cloud ERP & IT Hardware Solutions',
    categoryBadge: 'Product Catalog',
    isComingSoon: true,
    message: 'We are assembling our full enterprise catalog including Tally Prime 3-Star certifications, dedicated cloud servers, and partner hardware.',
    ctaText: 'Inquire About Products',
    ctaPath: '/contact',
    links: [],
    items: []
  },

  // 3. Industries
  industries: {
    id: 'industries',
    label: 'Industries',
    title: 'Industries We Empower',
    subtitle: 'Government, Manufacturing, Healthcare & Retail',
    categoryBadge: 'Industry Solutions',
    isComingSoon: true,
    message: 'Tailored technology architectures for enterprise sectors across Eastern India. Reach out for customized case studies.',
    ctaText: 'Consult an Expert',
    ctaPath: '/contact',
    links: [],
    items: []
  },

  // 4. Services
  services: {
    id: 'services',
    label: 'Services',
    title: 'Enterprise Datacenter & Cloud',
    subtitle: 'CtrlS Kolkata Rated-4 Hub, Cloud Infrastructure & Zero-Trust',
    categoryBadge: 'Enterprise Services',
    isComingSoon: false,
    links: [
      {
        id: 'service-ctrls',
        label: 'CtrlS Kolkata Rated-4 Datacenter',
        desc: '16 MW AI-ready facility at Bengal Silicon Valley, New Town',
        path: '/#ctrls-kolkata-datacenter',
        icon: 'Server',
        badge: 'Premier Hub'
      },
      {
        id: 'service-cloud',
        label: 'Cloud Server & Hosting',
        desc: 'Private, public & hybrid cloud hosting with high redundancy',
        path: '/#strategic-services',
        icon: 'Sparkles',
        badge: 'Cloud'
      },
      {
        id: 'service-security',
        label: 'Cybersecurity & Managed IT',
        desc: 'Zero-trust perimeter security, automated backups & 24/7 SOC',
        path: '/#strategic-services',
        icon: 'Award',
        badge: 'Security'
      }
    ],
    items: [
      { id: 'service-ctrls', label: 'CtrlS Kolkata Rated-4 Datacenter', path: '/#ctrls-kolkata-datacenter' },
      { id: 'service-cloud', label: 'Cloud Server & Hosting', path: '/#strategic-services' },
      { id: 'service-security', label: 'Cybersecurity & Managed IT', path: '/#strategic-services' }
    ],
    footer: {
      text: 'Need dedicated colocation or cloud architecture?',
      linkText: 'Inquire Now',
      path: '/contact'
    }
  },

  // 5. Solutions
  solutions: {
    id: 'solutions',
    label: 'Solutions',
    title: 'Strategic Solutions',
    subtitle: 'Enterprise Digital Transformation & Compliance',
    categoryBadge: 'Strategic Solutions',
    isComingSoon: true,
    message: 'End-to-end consulting for cloud migration, Tally on cloud, and high-uptime business network deployment.',
    ctaText: 'Get Solution Architecture',
    ctaPath: '/contact',
    links: [],
    items: []
  }
};
