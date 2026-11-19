/**
 * Customer Users Utility
 * Calculates how many users are taken/provisioned for a customer by summing
 * all purchased plans / agreements (contracts), matching plans, or explicit users.
 * Example: if customer purchased 1 user plan, then 2 users, then 3 users,
 * total users is 1 + 2 + 3 = 6 users.
 */

function parseUsersFromText(text) {
  if (!text || typeof text !== 'string') return 0;
  const plusMatch = text.match(/(\d+)\s*\+\s*(\d+)\s*(?:user|users|usr)/i);
  if (plusMatch) {
    return Number(plusMatch[1]) + Number(plusMatch[2]);
  }
  const match = text.match(/(\d+)\s*(?:user|users|usr)/i);
  if (match && Number(match[1]) > 0) {
    return Number(match[1]);
  }
  return 0;
}

export function getCustomerUserCount(customer, contracts = [], products = []) {
  if (!customer) return 0;

  const cId = String(customer.id || customer.customerId || '').trim().toLowerCase();
  const cEmail = String(customer.email || customer.loginEmail || '').trim().toLowerCase();
  const cCompany = String(customer.company || '').trim().toLowerCase();

  // Check matching contracts (all agreements provisioned for this customer)
  const matchingContracts = (contracts || []).filter((ctr) => {
    if (!ctr) return false;
    const ctrCompany = String(ctr.company || '').trim().toLowerCase();
    // Guard against mismatching non-empty companies
    if (cCompany && ctrCompany && cCompany !== ctrCompany) return false;

    const ctrCustId = String(ctr.customerId || ctr.id || '').trim().toLowerCase();
    const ctrEmail = String(ctr.email || '').trim().toLowerCase();

    return (
      (cId && ctrCustId && (cId === ctrCustId || ctrCustId.includes(cId))) ||
      (cEmail && ctrEmail && cEmail === ctrEmail) ||
      (cCompany && ctrCompany && cCompany === ctrCompany)
    );
  });

  let paidUsersSum = 0;
  let demoUsersSum = 0;

  for (const ctr of matchingContracts) {
    const isDemo = Boolean(
      ctr.isDemoTrial ||
      ctr.contractType === 'Trial' ||
      ctr.productCategory === 'Trial' ||
      String(ctr.status).toUpperCase() === 'DEMO' ||
      String(ctr.status).toUpperCase() === 'DEMO-INACTIVE' ||
      ctr.convertedToContractId ||
      /demo|trial/i.test(ctr.name || '') ||
      /demo|trial/i.test(ctr.service || '')
    );

    let u = 0;
    // Check if contract has linked productId in products master (only if not a demo trial)
    if (!isDemo && ctr.productId && Array.isArray(products) && products.length > 0) {
      const prod = products.find((p) => p.productId === ctr.productId || p.id === ctr.productId);
      if (prod?.users != null && Number(prod.users) > 0) {
        u = Number(prod.users);
      }
    }

    if (!u) {
      const text = `${ctr.name || ''} ${ctr.service || ''} ${ctr.description || ''}`;
      u = parseUsersFromText(text);
    }

    if (isDemo) {
      if (String(ctr.status).toUpperCase() === 'DEMO' && !ctr.convertedToContractId) {
        demoUsersSum += u;
      }
    } else {
      paidUsersSum += u;
    }
  }

  // If customer has paid contracts, return paidUsersSum (exclude demo trials!)
  if (paidUsersSum > 0) {
    return paidUsersSum;
  }

  // If customer has only an active demo trial running
  if (demoUsersSum > 0) {
    return demoUsersSum;
  }

  // Check customer.plan string (ignoring demo/trial plans)
  let planUsers = 0;
  const planText = String(customer.plan || '').trim();
  if (planText && !/demo|trial/i.test(planText)) {
    planUsers = parseUsersFromText(planText);
    if (!planUsers) {
      const num = Number(planText);
      if (!Number.isNaN(num) && num > 0 && num < 1000) {
        planUsers = num;
      }
    }
  }

  const storedUsers = Number(customer.users) || 0;
  return Math.max(storedUsers, planUsers);
}

export function computeTotalCloudUsers(customers = [], contracts = [], products = []) {
  return (customers || []).reduce((acc, cust) => {
    return acc + getCustomerUserCount(cust, contracts, products);
  }, 0);
}

/**
 * Calculates total orders and breakdown (e.g., "1 demo + 3 active product")
 * dynamically for any customer based on their provisioned contracts/agreements.
 */
export function getCustomerOrderBreakdown(customer, contracts = []) {
  if (!customer) return { total: 0, demo: 0, active: 0, text: '' };

  const cId = String(customer.id || customer.customerId || '').trim().toLowerCase();
  const cEmail = String(customer.email || customer.loginEmail || '').trim().toLowerCase();
  const cCompany = String(customer.company || '').trim().toLowerCase();

  const matchingContracts = (contracts || []).filter((ctr) => {
    if (!ctr) return false;
    const ctrCompany = String(ctr.company || '').trim().toLowerCase();
    if (cCompany && ctrCompany && cCompany !== ctrCompany) return false;

    const ctrCustId = String(ctr.customerId || ctr.id || '').trim().toLowerCase();
    const ctrEmail = String(ctr.email || '').trim().toLowerCase();

    return (
      (cId && ctrCustId && (cId === ctrCustId || ctrCustId.includes(cId))) ||
      (cEmail && ctrEmail && cEmail === ctrEmail) ||
      (cCompany && ctrCompany && cCompany === ctrCompany)
    );
  });

  let demo = customer.demoOrderCount || 0;
  let active = customer.activeProductCount || 0;

  if (matchingContracts.length > 0) {
    demo = 0;
    active = 0;
    for (const ctr of matchingContracts) {
      const isDemo = Boolean(
        ctr.isDemoTrial ||
        ctr.contractType === 'Trial' ||
        ctr.productCategory === 'Trial' ||
        String(ctr.status).toUpperCase() === 'DEMO' ||
        String(ctr.status).toUpperCase() === 'DEMO-INACTIVE' ||
        ctr.convertedToContractId ||
        /demo|trial/i.test(ctr.name || '') ||
        /demo|trial/i.test(ctr.service || '')
      );
      if (isDemo) {
        demo += 1;
      } else {
        active += 1;
      }
    }
  } else if (!demo && !active) {
    if (customer.orderBreakdown) {
      return {
        total: customer.orderCount || 0,
        demo: 0,
        active: 0,
        text: customer.orderBreakdown
      };
    }
    const total = customer.orderCount || 0;
    if (total > 0) {
      if (customer.demoTrialUsed) {
        demo = 1;
        active = Math.max(0, total - 1);
      } else {
        active = total;
      }
    }
  }

  const total = matchingContracts.length > 0
    ? matchingContracts.length
    : (customer.orderCount != null ? customer.orderCount : (demo + active));

  let text = '';
  if (demo > 0 && active > 0) {
    text = `${demo} demo + ${active} active product`;
  } else if (demo > 0) {
    text = `${demo} demo`;
  } else if (active > 0) {
    text = `${active} active product`;
  }

  return { total, demo, active, text };
}
