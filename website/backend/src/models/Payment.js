import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/payments.json');

export const getPaymentsFromFile = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.error('[PaymentModel] Error reading payments.json:', err.message);
  }
  return [];
};

export const savePaymentsToFile = (payments) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(payments || [], null, 2), 'utf-8');
  } catch (err) {
    console.error('[PaymentModel] Error saving payments.json:', err.message);
  }
};

const paymentItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: '' },
    name: { type: String, default: '' },
    sku: { type: String, default: '' },
    category: { type: String, default: '' },
    provider: { type: String, default: '' },
    users: { type: Number, default: 0 },
    serverConfiguration: { type: String, default: '' },
    cores: { type: String, default: '' },
    ram: { type: String, default: '' },
    storage: { type: String, default: '' },
    billingCycle: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    basePrice: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 }
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    id: {
      type: String,
      index: true
    },
    invoiceNumber: {
      type: String,
      required: true,
      index: true
    },
    invoiceRef: {
      type: String,
      default: ''
    },
    customer: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    accountName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    customerId: {
      type: String,
      default: ''
    },
    amount: {
      type: String,
      required: true
    },
    receivedAmount: {
      type: String,
      default: '₹0'
    },
    pendingPayment: {
      type: String,
      default: '₹0'
    },
    paymentMethod: {
      type: String,
      default: 'NEFT Wire'
    },
    method: {
      type: String,
      default: 'NEFT Wire'
    },
    invoiceDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    paymentReceivedDate: {
      type: String,
      default: ''
    },
    expectedPaymentDate: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Received', 'Cleared', 'Pending', 'Overdue'],
      default: 'Received',
      index: true
    },
    solutionCategory: {
      type: String,
      default: 'Tally Prime & Customization'
    },
    razorpayOrderId: {
      type: String,
      default: '',
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      index: true
    },
    // The subscription this money was taken for. Free-text company/customer
    // naming is how the legacy rows identify an account, so this link is what
    // lets a receipt show the plan, term and sales person without guessing.
    contractId: {
      type: String,
      default: '',
      index: true
    },
    // What was sold, frozen at the moment of payment. Prices and specifications
    // are copied here rather than referenced, so editing the catalogue later
    // cannot rewrite an already-issued receipt.
    items: {
      type: [paymentItemSchema],
      default: []
    },
    taxableAmount: {
      type: String,
      default: ''
    },
    gstAmount: {
      type: String,
      default: ''
    },
    // How the split above was obtained, shown verbatim in the receipt so nobody
    // reads a reverse-calculated figure as one that was quoted line by line.
    gstBasis: {
      type: String,
      default: ''
    },
    salesPerson: {
      type: String,
      default: ''
    },
    source: {
      type: String,
      enum: ['', 'portal', 'gateway', 'admin', 'import'],
      default: ''
    },
    raisedBy: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      role: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.pre('save', function (next) {
  if (!this.id) this.id = this.paymentId;
  if (!this.accountName) this.accountName = this.company;
  if (!this.invoiceRef) this.invoiceRef = this.invoiceNumber;
  if (!this.date) this.date = this.invoiceDate;
  if (!this.method) this.method = this.paymentMethod;
  next();
});

export const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;

