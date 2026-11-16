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

/**
 * Without MongoDB the ledger falls back to payments.json, and a cheque photo is
 * several hundred kilobytes of base64. Uploading one there would put a customer's
 * bank document into git, so offline proofs are kept beside the ledger instead.
 */
const PROOF_DIR = path.resolve(__dirname, '../data/proofs');

const proofFileName = (paymentId) => {
  const safe = String(paymentId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  return safe ? `${safe}.json` : '';
};

export const savePaymentProof = ({ paymentId, fileName, mimeType, sizeBytes, data }) => {
  const file = proofFileName(paymentId);
  if (!file || !data) return false;
  try {
    if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(PROOF_DIR, file),
      JSON.stringify({ paymentId, fileName, mimeType, sizeBytes, data }, null, 2),
      'utf-8'
    );
    return true;
  } catch (err) {
    console.error('[PaymentModel] Error saving payment proof file:', err.message);
    return false;
  }
};

export const getPaymentProof = (paymentId) => {
  const file = proofFileName(paymentId);
  if (!file) return null;
  try {
    const target = path.join(PROOF_DIR, file);
    if (!fs.existsSync(target)) return null;
    return JSON.parse(fs.readFileSync(target, 'utf-8'));
  } catch (err) {
    console.error('[PaymentModel] Error reading payment proof file:', err.message);
    return null;
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
    finalPrice: { type: Number, default: 0 },
    // Ordered detail copied from the order form at settlement. `quantity`
    // above is how many of this line were bought; planQuantity is the number of
    // units the line itself covers.
    unitPrice: { type: Number, default: 0 },
    planQuantity: { type: Number, default: 1 },
    durationMonths: { type: Number, default: 0 },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    description: { type: String, default: '' }
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
      default: ''
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
    // One purchase can hold several products, and each becomes its own
    // subscription. contractId above stays the first one for older readers.
    contractIds: {
      type: [String],
      default: []
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
    // ── Money that arrived outside the gateway ────────────────────────────────
    // The bank's own identifier is what a statement is reconciled against, so it
    // is kept even when the money came in without any invoice behind it.
    referenceNumber: {
      type: String,
      default: '',
      index: true
    },
    bankName: {
      type: String,
      default: ''
    },
    depositDate: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    // Only the description of the attachment is read with the ledger; the bytes
    // are fetched per payment so a list call never carries a cheque image.
    proof: {
      fileName: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      sizeBytes: { type: Number, default: 0 },
      data: { type: String, select: false, default: '' }
    },
    source: {
      type: String,
      enum: ['', 'portal', 'gateway', 'admin', 'manual', 'import', 'sync'],
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

