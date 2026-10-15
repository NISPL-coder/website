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

  // 5. About Us (Active Work Culture Tree)
  about: {
    id: 'about',
    label: 'About Us',
    title: 'Work Culture',
    isComingSoon: false,
    columns: [
      {
        id: 'col-about-culture',
        title: 'Work Culture',
        path: '/about#work-culture',
        links: [
          { label: 'Inside NISPL work culture', path: '/about#casual-office' },
          { label: 'Workplace Excell Award', path: '/about#conventions-aikyam' },
          { label: 'Celebration & puja', path: '/about#festive-celebrations' }
        ]
      }
    ],
    items: [
      { id: 'inside-nispl', label: 'Inside NISPL work culture', path: '/about#casual-office' },
      { id: 'workplace-award', label: 'workplace Excell Award', path: '/about#conventions-aikyam' },
      { id: 'celebration-puja', label: 'Celebration & puja', path: '/about#festive-celebrations' }
    ]
  }
};
