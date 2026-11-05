/**
 * Column inventory for every admin module whose list is a table.
 *
 * `id` matches the column id used by the frontend table definition, so a hidden
 * column disappears from the table and from the API payload with the same key.
 * `fields` lists the record fields that column renders; they are the fields a
 * staff member loses when an admin withholds the column. Fields that belong to
 * no column (row identity, form-only values) are never redacted, so hiding a
 * column cannot break a table key or an edit form.
 *
 * This is the only copy of the inventory. The grant UI reads it from
 * GET /api/permissions/columns instead of keeping a second list that can drift.
 */
export const MODULE_COLUMNS = {
  customer: [
    { id: 'id', label: 'Customer ID', fields: ['customerId'] },
    { id: 'company', label: 'Organization & Client', fields: ['company', 'name'] },
    { id: 'loginEmail', label: 'Login Email', fields: ['loginEmail', 'email'] },
    { id: 'password', label: 'Password', fields: ['password', 'portalPassword'] },
    { id: 'lastLogin', label: 'Last Login', fields: ['lastLoginAt'] },
    { id: 'phone', label: 'Phone & Mobile', fields: ['phone', 'alternatePhone'] },
    { id: 'plan', label: 'Subscribed Plan', fields: ['plan'] },
    { id: 'serverNode', label: 'Server Node', fields: ['serverNode'] },
    { id: 'mrr', label: 'Monthly (MRR)', fields: ['mrr'] },
    { id: 'status', label: 'Status', fields: ['status'] },
    { id: 'registered', label: 'Registered', fields: ['registered', 'createdAt'] },
    { id: 'sangam', label: 'Sangam CRM Status', fields: ['sangamCrm'] }
  ],
  contract: [
    { id: 'id', label: 'Contract Code', fields: ['contractCode', 'contractId'] },
    { id: 'name', label: 'Contract Title', fields: ['name'] },
    { id: 'customer', label: 'Client & Representative', fields: ['customer', 'email', 'accountId'] },
    {
      id: 'service',
      label: 'Service Scope & Tier',
      fields: ['service', 'contractType', 'subscriptionPeriod', 'productCategory', 'slaTier', 'description']
    },
    { id: 'value', label: 'Contract Value', fields: ['totalContractValue', 'value'] },
    { id: 'startDate', label: 'Start Date', fields: ['startDate'] },
    { id: 'expiryDate', label: 'Expiry Date', fields: ['expiryDate', 'endDate'] },
    { id: 'status', label: 'Status', fields: ['status'] },
    { id: 'sangam', label: 'Sangam CRM', fields: ['sangamCrm'] }
  ],
  payment: [
    { id: 'name', label: 'Name', fields: ['customer'] },
    { id: 'accountName', label: 'Account Name', fields: ['accountName', 'company'] },
    { id: 'invoiceNumber', label: 'Invoice Number', fields: ['invoiceNumber', 'invoiceRef', 'paymentId'] },
    { id: 'invoiceDate', label: 'Invoice Date', fields: ['invoiceDate', 'date'] },
    { id: 'receivedAmount', label: 'Received Amount', fields: ['receivedAmount'] },
    { id: 'pendingPayment', label: 'Pending Payment', fields: ['pendingPayment'] },
    { id: 'expectedPaymentDate', label: 'Expected Payment Date', fields: ['expectedPaymentDate'] },
    { id: 'paymentReceivedDate', label: 'Payment Received Date', fields: ['paymentReceivedDate'] },
    { id: 'paymentMethod', label: 'Payment Method', fields: ['paymentMethod', 'method'] },
    { id: 'status', label: 'Status', fields: ['status'] }
  ],
  product: [
    { id: 'name', label: 'Product Name & Overview', fields: ['name', 'description'] },
    { id: 'ipAddress', label: 'IP Address', fields: ['ipAddress'] },
    { id: 'category', label: 'Category & Tier', fields: ['category', 'provider', 'tier'] },
    { id: 'price', label: 'Pricing & Billing', fields: ['price', 'monthlyPrice', 'frequency'] },
    { id: 'available', label: 'Live Availability', fields: ['available', 'status'] }
  ],
  receipt: [
    { id: 'id', label: 'Receipt / Invoice No', fields: ['invoiceNumber', 'paymentId', 'id'] },
    { id: 'customer', label: 'Customer & Billing Details', fields: ['customer'] },
    { id: 'product', label: 'Product / Plan', fields: ['productName', 'product'] },
    { id: 'items', label: 'Items Sold', fields: ['items', 'service'] },
    { id: 'term', label: 'Purchased Term', fields: ['term'] },
    { id: 'contract', label: 'Subscription', fields: ['contract', 'contractId', 'contractLink'] },
    { id: 'salesPerson', label: 'Sales Person', fields: ['salesPerson', 'raisedBy'] },
    { id: 'amount', label: 'Amount Paid', fields: ['amount', 'amountLabel', 'receivedAmount'] },
    { id: 'baseAmount', label: 'Taxable Value', fields: ['baseAmount'] },
    { id: 'taxAmount', label: 'GST Split', fields: ['taxAmount', 'cgst', 'sgst', 'gstBasis'] },
    { id: 'pending', label: 'Pending Payment', fields: ['pendingPayment'] },
    { id: 'date', label: 'Dates', fields: ['date', 'invoiceDate', 'paymentReceivedDate', 'dueDate'] },
    {
      id: 'mode',
      label: 'Payment Channel',
      fields: ['paymentMode', 'paymentMethod', 'source', 'razorpayOrderId', 'razorpayPaymentId']
    },
    { id: 'status', label: 'Status', fields: ['status'] }
  ],
  user_access: [
    { id: 'name', label: 'Name', fields: ['name'] },
    { id: 'email', label: 'Email', fields: ['email'] },
    { id: 'role', label: 'Role', fields: ['role', 'designation'] },
    { id: 'status', label: 'Status', fields: ['accountStatus'] },
    { id: 'createdAt', label: 'Created', fields: ['createdAt'] }
  ],
  activity_logs: [
    { id: 'admin', label: 'Admin', fields: ['adminName', 'adminEmail', 'adminRole', 'adminId'] },
    { id: 'action', label: 'Action', fields: ['action'] },
    { id: 'details', label: 'Details & Event', fields: ['details', 'resource', 'resourceId', 'category'] },
    { id: 'ipAddress', label: 'IP Address', fields: ['ipAddress'] },
    { id: 'createdAt', label: 'Timestamp', fields: ['createdAt'] },
    { id: 'changes', label: 'Changes Data', fields: ['changes'] }
  ],
  sangam_sync: [
    { id: 'company', label: 'Organization & Client', fields: ['company'] },
    { id: 'id', label: 'Customer ID', fields: ['customerId'] },
    { id: 'syncStatus', label: 'Sync Status', fields: ['sangamCrm.status', 'syncStatus'] },
    { id: 'recordId', label: 'CRM Record ID', fields: ['sangamCrm.recordId', 'crmRecordId'] },
    { id: 'lastSyncedAt', label: 'Last Synced', fields: ['sangamCrm.lastSyncedAt', 'lastSyncedAt'] }
  ],
  overview: [
    { id: 'id', label: 'Customer ID / Contract No', fields: ['customerId', 'contractCode', 'contractId'] },
    { id: 'company', label: 'Organization & Client', fields: ['company', 'name'] },
    { id: 'email', label: 'Contact Details', fields: ['email', 'loginEmail'] },
    { id: 'plan', label: 'Subscribed Plan', fields: ['plan'] },
    { id: 'serverNode', label: 'Server Node', fields: ['serverNode'] },
    { id: 'mrr', label: 'Monthly MRR', fields: ['mrr'] },
    { id: 'service', label: 'Service SLA', fields: ['service', 'contractType', 'slaTier'] },
    { id: 'value', label: 'Annual Value', fields: ['totalContractValue', 'value'] },
    { id: 'expiryDate', label: 'Expiry Date', fields: ['expiryDate', 'endDate'] },
    { id: 'status', label: 'Status', fields: ['status'] }
  ]
};

export function columnsForModule(module) {
  return MODULE_COLUMNS[module] || [];
}

/** The registry shape the grant UI renders: labels only, never field names. */
export function columnRegistryForClient() {
  return Object.entries(MODULE_COLUMNS).map(([module, columns]) => ({
    module,
    columns: columns.map((column) => ({ id: column.id, label: column.label }))
  }));
}

/**
 * Column ids the caller may see.
 *
 * A module grant with no `module:view:<column>` entries means "every column",
 * which keeps every permission set saved before column grants existed working
 * unchanged. The moment one column entry is stored the list becomes an
 * allowlist, so an admin can withhold a single column without re-granting the
 * rest.
 */
export function visibleColumnIds(user, module) {
  const all = columnsForModule(module).map((column) => column.id);
  if (all.length === 0) return null;
  if (!user) return null;
  if (user.role === 'admin' || user.isPrimaryAdmin) return all;

  const granted = Array.isArray(user.permissions) ? user.permissions : [];
  if (granted.includes('*') || granted.includes(`${module}:*`)) return all;

  const scoped = granted
    .filter((entry) => String(entry || '').startsWith(`${module}:view:`))
    .map((entry) => entry.split(':')[2]);

  if (scoped.length === 0) return all;
  return all.filter((id) => scoped.includes(id));
}

export function isColumnVisible(user, module, columnId) {
  const visible = visibleColumnIds(user, module);
  if (visible === null) return true;
  return visible.includes(columnId);
}

function deletePath(record, path) {
  const parts = path.split('.');
  let node = record;
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (!node || typeof node !== 'object') return;
    node = node[parts[i]];
  }
  if (node && typeof node === 'object') delete node[parts[parts.length - 1]];
}

/**
 * Strips the fields of every withheld column. Expects plain objects — records
 * already passed through lean() or toJSON() in the controller.
 */
export function redactRecord(user, module, record) {
  if (!record || typeof record !== 'object') return record;
  const columns = columnsForModule(module);
  if (columns.length === 0) return record;

  const visible = visibleColumnIds(user, module);
  if (visible === null) return record;
  if (visible.length === columns.length) return record;

  const hidden = columns.filter((column) => !visible.includes(column.id));
  hidden.forEach((column) => column.fields.forEach((field) => deletePath(record, field)));
  return record;
}

export function redactRecords(user, module, records) {
  if (!Array.isArray(records)) return records;
  return records.map((record) => redactRecord(user, module, record));
}
