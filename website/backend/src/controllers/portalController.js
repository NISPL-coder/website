import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Contract from '../models/Contract.js';
import Payment from '../models/Payment.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

const PAID_STATUSES = new Set(['received', 'cleared', 'paid']);
const DUE_STATUSES = new Set(['pending', 'overdue', 'unpaid']);

// Money is stored as display text ("₹1,00,000", "₹6500 / 1 year"), so totals are
// taken from the numeric head of the string rather than trusting how a row was typed.
export const parseAmount = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const head = String(value).split('/')[0].replace(/[^0-9.]/g, '');
  const parsed = parseFloat(head);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysUntil = (date) => {
  if (!date) return null;
  const utc = (value) => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  return Math.round((utc(date) - utc(new Date())) / 86400000);
};

const isoDate = (date) => (date ? date.toISOString().slice(0, 10) : null);

// Payments and contracts carry the customer as free text, not as an ObjectId, so
// every row that names this account on any of its identity fields belongs to it.
const IDENTITY_FIELDS = ['email', 'company', 'customer', 'accountName', 'customerId', 'accountId'];

const buildIdentityMatch = (values) => ({
  $or: values.flatMap((value) => IDENTITY_FIELDS.map((field) => ({ [field]: value })))
});

const collectIdentityValues = (user, customer) => {
  const values = [
    user?.email,
    user?.customerId,
    customer?.email,
    customer?.customerId,
    customer?.company
  ];
  return [...new Set(values.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim()))];
};

const mapContract = (contract) => {
  const expiry = toDate(contract.expiryDate) || toDate(contract.endDate);
  const start = toDate(contract.startDate);
  return {
    id: contract.contractId || String(contract._id),
    name: contract.name || contract.service || contract.productCategory || 'Subscription',
    category: contract.productCategory || null,
    contractType: contract.contractType || null,
    status: contract.status || null,
    startDate: isoDate(start),
    expiryDate: isoDate(expiry),
    daysLeft: daysUntil(expiry),
    amount: parseAmount(contract.value || contract.totalContractValue),
    amountLabel: contract.value || contract.totalContractValue || null,
    expired: Boolean(expiry) && daysUntil(expiry) < 0,
    source: 'contract'
  };
};

const mapPayment = (payment) => {
  const date = toDate(payment.invoiceDate) || toDate(payment.date) || toDate(payment.createdAt);
  const due = toDate(payment.expectedPaymentDate);
  const status = String(payment.status || '').trim();
  const amount = parseAmount(payment.amount);
  const received = parseAmount(payment.receivedAmount);
  const isPaid = PAID_STATUSES.has(status.toLowerCase());
  const isDue = DUE_STATUSES.has(status.toLowerCase());
  const pending = isDue
    ? parseAmount(payment.pendingPayment) || Math.max(amount - received, 0)
    : 0;

  return {
    id: payment.paymentId || payment.id || String(payment._id),
    invoiceNumber: payment.invoiceNumber || payment.invoiceRef || payment.paymentId || null,
    service: payment.solutionCategory || payment.productName || payment.service || 'Services',
    date: isoDate(date),
    dueDate: isoDate(due),
    daysLeft: daysUntil(due),
    amount,
    received: isPaid ? (received || amount) : received,
    pending,
    status: status || null,
    paymentMethod: payment.paymentMethod || payment.method || null
  };
};

const pickRenewal = (products) =>
  products
    .filter((product) => product.expiryDate && product.daysLeft !== null && product.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0] || null;

const pickReminder = (payments, renewal) => {
  const dues = payments
    .filter((payment) => payment.pending > 0)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  if (dues.length > 0) {
    const soonest = dues[0];
    return {
      kind: 'payment',
      title: soonest.service,
      invoiceNumber: soonest.invoiceNumber,
      amount: soonest.pending,
      dueDate: soonest.dueDate,
      daysLeft: soonest.daysLeft,
      overdue: soonest.daysLeft !== null && soonest.daysLeft < 0
    };
  }

  if (renewal) {
    return {
      kind: 'renewal',
      title: renewal.name,
      invoiceNumber: null,
      amount: renewal.amount,
      dueDate: renewal.expiryDate,
      daysLeft: renewal.daysLeft,
      overdue: false
    };
  }

  return null;
};

export const getCustomerOverview = async (req, res) => {
  try {
    const user = req.user || {};
    let customer = null;

    if (isMongoConnected()) {
      if (user.customerId) {
        customer = await Customer.findOne({ customerId: user.customerId }).lean();
      }
      if (!customer && user.email) {
        customer = await Customer.findOne({ email: user.email }).lean();
      }
    }

    const identity = collectIdentityValues(user, customer);

    let products = [];
    let payments = [];

    if (isMongoConnected() && identity.length > 0) {
      const match = buildIdentityMatch(identity);
      const [contracts, paymentRows] = await Promise.all([
        Contract.find(match).lean(),
        Payment.find(match).lean()
      ]);
      products = contracts.map(mapContract);
      payments = paymentRows.map(mapPayment);
    }

    products.sort((a, b) => (a.expiryDate || '9999').localeCompare(b.expiryDate || '9999'));

    // The account record still names the subscribed plan, so an account with no
    // contract rows is not the same as an account with nothing running.
    if (products.length === 0 && customer?.plan) {
      products = [
        {
          id: customer.customerId || 'account-plan',
          name: customer.plan,
          category: null,
          contractType: null,
          status: customer.status || 'active',
          startDate: customer.registered || null,
          expiryDate: null,
          daysLeft: null,
          amount: parseAmount(customer.mrr),
          amountLabel: customer.mrr || null,
          expired: false,
          source: 'account'
        }
      ];
    }

    payments.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const totalPaid = payments.reduce((sum, payment) => sum + payment.received, 0);
    const totalPending = payments.reduce((sum, payment) => sum + payment.pending, 0);
    const renewal = pickRenewal(products);
    const activeProducts = products.filter((product) => !product.expired).length;

    res.json({
      success: true,
      data: {
        account: {
          customerId: customer?.customerId || user.customerId || null,
          name: customer?.name || user.name || null,
          company: customer?.company || user.company || null,
          email: customer?.email || user.email || null,
          phone: customer?.phone || null,
          plan: customer?.plan || null,
          status: customer?.status || null,
          serverNode: customer?.serverNode || null,
          gstNo: customer?.gstNo || null,
          registered: customer?.registered || null
        },
        kpi: {
          activeProducts,
          totalPaid,
          totalPending,
          pendingInvoices: payments.filter((payment) => payment.pending > 0).length,
          renewalName: renewal?.name || null,
          renewalDate: renewal?.expiryDate || null,
          renewalDaysLeft: renewal?.daysLeft ?? null
        },
        products,
        recentPayments: payments.slice(0, 5),
        reminder: pickReminder(payments, renewal),
        identityMatched: identity.length > 0 && Boolean(customer)
      }
    });
  } catch (err) {
    console.error('Error building customer overview:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
