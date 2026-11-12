/**
 * Helper to compute profile completion percentage and status breakdown.
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
    isAdmin
      ? {
          id: 'designation',
          label: 'Designation & Security Level',
          completed: Boolean(user.designation || user.securityLevel || user.isPrimaryAdmin),
          weight: 20
        }
      : {
          id: 'company',
          label: 'Company / Business Details',
          completed: Boolean(user.company || user.companyName || user.gstNo),
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

  percentage = Math.min(100, Math.max(0, percentage));

  return {
    percentage,
    completedCount,
    totalCount: items.length,
    items
  };
}

