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
        label: 'Awareness Program',
        desc: 'Conventions, leadership summits & knowledge sharing',
        path: '/about#awareness-program',
        icon: 'Award',
        badge: 'Programs'
      },
      {
        id: 'culture-festivals',
        label: 'Celebrations & Team Bonding',
        desc: 'Team celebrations, dinner feasts & festive traditions',
        path: '/about#festive-celebrations',
        icon: 'Sparkles',
        badge: 'Celebration'
      }
    ],
    items: [
      { id: 'culture-inside', label: 'Inside NISPL Work Culture', path: '/about#casual-office' },
      { id: 'culture-awards', label: 'Awareness Program', path: '/about#awareness-program' },
      { id: 'culture-festivals', label: 'Celebrations & Team Bonding', path: '/about#festive-celebrations' }
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
    title: 'Services We Deliver',
    subtitle: 'Tally Prime, Hardware and IT Services',
    categoryBadge: 'Industry Solutions',
    isComingSoon: true,
    message: 'Leading partner for TallyPrime 3-Star, Gold-Certified solutions, cloud integration, hardware and managed IT across Odisha and Eastern India.',
    ctaText: 'Contact Us',
    ctaPath: '/services',
    links: [],
    items: []
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
