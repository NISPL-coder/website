/**
 * Customer Users Utility
 * Calculates how many users are taken/provisioned for a customer based on:
 * 1. customer.users (explicit number)
 * 2. matching contract(s) (name, service, description, or linked product)
 * 3. customer.plan string (e.g. "Enterprise Cloud Server — 3 User" -> 3)
 */

export function getCustomerUserCount(customer, contracts = [], products = []) {
  if (!customer) return 0;

  // 1. Explicit numeric property on customer
  if (customer.users != null && !Number.isNaN(Number(customer.users)) && Number(customer.users) > 0) {
    return Number(customer.users);
  }

  const cId = String(customer.id || customer.customerId || '').trim().toLowerCase();
  const cEmail = String(customer.email || customer.loginEmail || '').trim().toLowerCase();
  const cCompany = String(customer.company || '').trim().toLowerCase();

  // 2. Check matching contracts (most authoritative active agreements)
  const matchingContracts = (contracts || []).filter((ctr) => {
    if (!ctr) return false;
    const ctrCustId = String(ctr.customerId || ctr.id || '').trim().toLowerCase();
    const ctrEmail = String(ctr.email || '').trim().toLowerCase();
    const ctrCompany = String(ctr.company || '').trim().toLowerCase();

    return (
      (cId && ctrCustId && (cId === ctrCustId || ctrCustId.includes(cId))) ||
      (cEmail && ctrEmail && cEmail === ctrEmail) ||
      (cCompany && ctrCompany && cCompany === ctrCompany)
    );
  });

  for (const ctr of matchingContracts) {
    // Check if contract has linked productId
    if (ctr.productId && Array.isArray(products) && products.length > 0) {
      const prod = products.find((p) => p.productId === ctr.productId || p.id === ctr.productId);
      if (prod?.users != null && Number(prod.users) > 0) {
        return Number(prod.users);
      }
    }

    // Check regex in contract text (name, service, description)
    const text = `${ctr.name || ''} ${ctr.service || ''} ${ctr.description || ''}`;
    const match = text.match(/(\d+)\s*(?:user|users|usr)/i);
    if (match && Number(match[1]) > 0) {
      return Number(match[1]);
    }
  }

  // 3. Check customer.plan string (e.g. "Enterprise Cloud Server — 3 User")
  const planText = String(customer.plan || '').trim();
  if (planText) {
    const match = planText.match(/(\d+)\s*(?:user|users|usr)/i);
    if (match && Number(match[1]) > 0) {
      return Number(match[1]);
    }
    const num = Number(planText);
    if (!Number.isNaN(num) && num > 0 && num < 1000) {
      return num;
    }
  }

  return 0;
}

export function computeTotalCloudUsers(customers = [], contracts = [], products = []) {
  return (customers || []).reduce((acc, cust) => {
    return acc + getCustomerUserCount(cust, contracts, products);
  }, 0);
}
