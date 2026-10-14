import imgCelebration from '../../../../assets/client_team_celebration.jpg';

export const NAV_ITEMS = [
  { id: 'about', label: 'About Us', path: '/about' },
  { id: 'products', label: 'Products', path: '/products' },
  { id: 'industries', label: 'Industries', path: '/industries' },
  { id: 'services', label: 'Services', path: '/services' },
  { id: 'solutions', label: 'Solutions', path: '/solutions' },
  { id: 'career', label: 'Career', path: '/career' }
];

export const MEGA_MENU_CONFIG = {
  // 1. Products (Work in progress)
  products: {
    id: 'products',
    label: 'Products',
    title: 'Products',
    isComingSoon: true,
    message: 'Work in progress...',
    subMessage: 'Please check back soon.',
    columns: [],
    items: []
  },

  // 2. Industries (Work in progress)
  industries: {
    id: 'industries',
    label: 'Industries',
    title: 'Industries',
    isComingSoon: true,
    message: 'Work in progress...',
    subMessage: 'Please check back soon.',
    columns: [],
    items: []
  },

  // 3. Services (Work in progress)
  services: {
    id: 'services',
    label: 'Services',
    title: 'Services',
    isComingSoon: true,
    message: 'Work in progress...',
    subMessage: 'Please check back soon.',
    columns: [],
    items: []
  },

  // 4. Solutions (Work in progress)
  solutions: {
    id: 'solutions',
    label: 'Solutions',
    title: 'Solutions',
    isComingSoon: true,
    message: 'Work in progress...',
    subMessage: 'Please check back soon.',
    columns: [],
    items: []
  },

  // 5. About Us (Active Work Culture)
  about: {
    id: 'about',
    label: 'About Us',
    title: 'Work Culture',
    isComingSoon: false,
    columns: [
      {
        id: 'col-about-culture',
        title: 'Work Culture',
        image: imgCelebration,
        path: '/about#work-culture',
        links: [
          { label: 'Inside NISPL: Work Culture', path: '/about#work-culture', badge: 'HOT' },
          { label: 'Workplace Excellence Award', path: '/about#work-culture', badge: 'TALLY' },
          { label: 'Aikyam: One Team Synergy', path: '/about#work-culture' },
          { label: 'Continuous Skill Sprints', path: '/about#work-culture' },
          { label: 'Festive Traditions & Events', path: '/about#work-culture' },
          { label: 'Collaborative Open Floors', path: '/about#work-culture' }
        ]
      }
    ],
    items: [
      { id: 'work-culture', label: 'Work Culture & Life at NISPL', path: '/about#work-culture' }
    ]
  }
};
