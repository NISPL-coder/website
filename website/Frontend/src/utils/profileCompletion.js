/**
 * Helper to compute profile completion percentage and status breakdown.
 * Evaluates dynamically based on the exact profile sections filled by the customer:
 *   - Contact Overview: Name, Email, Phone (10 digits), Designation, Company, GSTIN, Tally Serial No.
 *   - Address Information: Physical Street/Area & City/State, 6-digit Postal PIN Code
 *   - Account Security & Verification: Verified Email
 */
export function getProfileCompletion(user = {}) {
  if (!user || typeof user !== 'object') {
    return {
      percentage: 20,
      completedCount: 1,
      totalCount: 5,
      items: []
    };
  }

  const role = String(user.role || '').toLowerCase();
  const isAdmin = ['admin', 'manager', 'support'].includes(role);

  if (isAdmin) {
    const items = [
      {
        id: 'name',
        label: 'Full Name',
        completed: Boolean(user.name && String(user.name).trim().length > 1),
        weight: 20
      },
      {
        id: 'email',
        label: 'Email Address',
        completed: Boolean(user.email && String(user.email).includes('@')),
        weight: 20
      },
      {
        id: 'email_verified',
        label: 'Verified Email',
        completed: Boolean(user.isEmailVerified),
        weight: 20
      },
      {
        id: 'phone',
        label: 'Phone Number',
        completed: Boolean(user.phone && String(user.phone).trim().length >= 6),
        weight: 20
      },
      {
        id: 'designation',
        label: 'Designation & Security Level',
        completed: Boolean(user.designation || user.securityLevel || user.isPrimaryAdmin),
        weight: 20
      }
    ];

    let percentage = 0;
    let completedCount = 0;
    for (const item of items) {
      if (item.completed) {
        percentage += item.weight;
        completedCount += 1;
      }
    }

    return {
      percentage: Math.min(100, Math.max(0, percentage)),
      completedCount,
      totalCount: items.length,
      items
    };
  }

  // Customer Profile Checklist: exactly aligns with Customer Profile form sections
  // 10 items, each with 10% weight = 100% total
  const rawName = String(user.name || user.firstName || '').trim();
  const phoneDigits = String(user.phone || '').replace(/\D/g, '');
  const addr = user.address || {};
  const postalCodeDigits = String(addr.postalCode || user.postalCode || '').replace(/\D/g, '');
  const hasAdditionalChannels = (Array.isArray(user.additionalEmails) && user.additionalEmails.some((e) => e && String(e).trim())) ||
                                (Array.isArray(user.additionalPhones) && user.additionalPhones.some((p) => p && String(p).trim()));

  const items = [
    {
      id: 'name',
      label: 'Full Name',
      completed: Boolean(rawName.length > 1),
      weight: 10
    },
    {
      id: 'email',
      label: 'Primary Email Address',
      completed: Boolean(user.email && String(user.email).includes('@')),
      weight: 10
    },
    {
      id: 'phone',
      label: 'Primary Phone Number (10 digits)',
      completed: Boolean(phoneDigits.length === 10),
      weight: 10
    },
    {
      id: 'company',
      label: 'Company / Business Name',
      completed: Boolean(
        (user.company && String(user.company).trim().length > 0) ||
        (user.companyName && String(user.companyName).trim().length > 0)
      ),
      weight: 10
    },
    {
      id: 'designation',
      label: 'Designation / Role',
      completed: Boolean(user.designation && String(user.designation).trim().length > 0),
      weight: 10
    },
    {
      id: 'gstNo',
      label: 'GSTIN (Tax ID)',
      completed: Boolean(user.gstNo && String(user.gstNo).trim().length >= 10),
      weight: 10
    },
    {
      id: 'tallySerialNo',
      label: 'Tally Serial Number',
      completed: Boolean(user.tallySerialNo && String(user.tallySerialNo).trim().length > 0),
      weight: 10
    },
    {
      id: 'address_location',
      label: 'Country, State & City',
      completed: Boolean(addr.city && String(addr.city).trim().length > 0 && addr.state && String(addr.state).trim().length > 0),
      weight: 10
    },
    {
      id: 'address_street',
      label: 'Physical Address (Street / Area)',
      completed: Boolean(
        (addr.street && String(addr.street).trim().length > 0) ||
        (addr.area && String(addr.area).trim().length > 0)
      ),
      weight: 10
    },
    {
      id: 'address_pincode',
      label: 'Postal / PIN Code (6 digits)',
      completed: Boolean(postalCodeDigits.length === 6),
      weight: 10
    }
  ];

  // Optional substitution: If an optional enterprise ID (GSTIN or Tally Serial No) is not present,
  // having Additional Communication Channels or Verified Email provides credit towards 100% completion.
  let bonusCredits = 0;
  if (hasAdditionalChannels) bonusCredits += 1;
  if (user.isEmailVerified) bonusCredits += 1;

  for (const item of items) {
    if (!item.completed && (item.id === 'gstNo' || item.id === 'tallySerialNo') && bonusCredits > 0) {
      item.completed = true;
      bonusCredits -= 1;
    }
  }

  let percentage = 0;
  let completedCount = 0;

  for (const item of items) {
    if (item.completed) {
      percentage += item.weight;
      completedCount += 1;
    }
  }

  percentage = Math.min(100, Math.max(0, percentage));

  return {
    percentage,
    completedCount,
    totalCount: items.length,
    items
  };
}
