/**
 * Mock data for customer dashboard
 */

/**
 * Plan renewal reminders.
 * daysLeft < 0  => already expired
 * daysLeft 0-7  => critical
 * daysLeft 8-30 => warning
 * daysLeft > 30 => info
 */
export const PLAN_RENEWALS = [
  {
    id: 'renewal-cloud-8gb',
    planName: 'Dedicated Tally Cloud — 8 GB RAM Node',
    expiryDate: '24 Nov 2026',
    daysLeft: 28,
    price: '₹4,500 + GST / month',
    category: 'cloud'
  },
  {
    id: 'renewal-tss-single',
    planName: 'TSS Renewal — Single User License',
    expiryDate: '28 Oct 2027',
    daysLeft: 365,
    price: '₹4,500 + GST / year',
    category: 'tss'
  },
  {
    id: 'renewal-tally-prime',
    planName: 'Tally Prime Release 5.0 — Perpetual License',
    expiryDate: '28 Oct 2026',
    daysLeft: 1,
    price: '₹22,500 + GST',
    category: 'license'
  }
];

export const INITIAL_INVOICES = [
  {
    id: 'INV-2026-8941',
    date: '27 Oct 2026',
    expiryDate: '27 Oct 2027',
    service: 'Enterprise Cloud Instance Setup & Tally Prime License',
    sacCode: '998313',
    baseAmount: '₹4,500.00',
    cgst: '₹405.00',
    sgst: '₹405.00',
    gstRate: '18% GST',
    taxAmount: '₹810.00',
    totalAmount: '₹5,310.00',
    status: 'Paid',
    paymentMode: 'Online / Corporate Net Banking'
  },
  {
    id: 'INV-2026-8812',
    date: '28 Mar 2026',
    expiryDate: '28 Mar 2027',
    service: 'TSS Annual Renewal (Single User)',
    sacCode: '998319',
    baseAmount: '₹4,500.00',
    cgst: '₹405.00',
    sgst: '₹405.00',
    gstRate: '18% GST',
    taxAmount: '₹810.00',
    totalAmount: '₹5,310.00',
    status: 'Paid',
    paymentMode: 'UPI / GST Credit'
  },
  {
    id: 'INV-2026-7645',
    date: '15 Jan 2026',
    expiryDate: '15 Jan 2027',
    service: 'Dedicated Tally Cloud Node (8 GB Dedicated Xeon)',
    sacCode: '998315',
    baseAmount: '₹4,500.00',
    cgst: '₹405.00',
    sgst: '₹405.00',
    gstRate: '18% GST',
    taxAmount: '₹810.00',
    totalAmount: '₹5,310.00',
    status: 'Paid',
    paymentMode: 'NEFT / RTGS Corporate'
  },
  {
    id: 'INV-2025-6210',
    date: '10 Nov 2025',
    expiryDate: '10 Nov 2026',
    service: 'Biz Analyst Tally on Mobile App — 1 Year License',
    sacCode: '998313',
    baseAmount: '₹1,800.00',
    cgst: '₹162.00',
    sgst: '₹162.00',
    gstRate: '18% GST',
    taxAmount: '₹324.00',
    totalAmount: '₹2,124.00',
    status: 'Paid',
    paymentMode: 'Corporate Debit Card'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Cloud Node Ready',
    desc: 'Your dedicated Tally Prime cloud instance is now online and reachable.',
    time: 'Just now',
    unread: true
  },
  {
    id: 2,
    title: 'GST Invoice Generated',
    desc: 'Tax invoice INV-2026-8941 is ready for instant download with input tax credit.',
    time: '5 mins ago',
    unread: true
  },
  {
    id: 3,
    title: 'TSS 24/7 Priority Support',
    desc: 'Net Infotech System 5-star support team is assigned to your account.',
    time: '1 hour ago',
    unread: false
  }
];
