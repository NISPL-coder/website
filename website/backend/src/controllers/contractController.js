import { logNotification } from '../services/notificationService.js';
import Contract, { getContractsFromFile, saveContractsToFile } from '../models/Contract.js';
import Customer, { getCustomersFromFile } from '../models/Customer.js';
import { sangamCrmService } from '../services/sangamCrmService.js';
import { logActivity } from '../utils/activityLogger.js';
import { redactRecords } from '../utils/columnPermissions.js';
import mongoose from 'mongoose';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * The next CTR code. Random four-digit codes collide, and a duplicate
 * contractId would make every downstream lookup — payments and receipts
 * included — resolve to the wrong subscription.
 */
const nextContractCode = async () => {
  const prefix = `CTR-${new Date().getFullYear()}-`;
  const pattern = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

  let latest = null;
  if (isMongoConnected()) {
    latest = await Contract.findOne({ contractId: pattern }).sort({ contractId: -1 }).lean();
  } else {
    latest = getContractsFromFile()
      .filter((c) => String(c.contractId || '').startsWith(prefix))
      .sort((a, b) => String(b.contractId).localeCompare(String(a.contractId)))[0] || null;
  }

  const tail = parseInt(String(latest?.contractId || '').split('-').pop(), 10);
  return `${prefix}${Number.isFinite(tail) ? tail + 1 : 1000}`;
};

/**
 * Get all contracts with Sangam CRM sync statuses
 */
export const getContracts = async (req, res) => {
  try {
    let list = [];
    if (isMongoConnected()) {
      list = await Contract.find().sort({ createdAt: -1 }).lean();
    } else {
      list = getContractsFromFile();
    }

    const formatted = redactRecords(req.user, 'contract', list.map((c) => ({
      ...c,
      id: c.contractId || c._id || c.id,
      sangamCrm: c.sangamCrm || { status: 'pending', recordId: null, lastSyncedAt: null }
    })));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      contracts: formatted
    });
  } catch (err) {
    console.error('[ContractController] getContracts error:', err.message);
    const fileList = redactRecords(req.user, 'contract', getContractsFromFile());
    return res.status(200).json({
      success: true,
      count: fileList.length,
      contracts: fileList
    });
  }
};

/**
 * Create a new Contract and sync automatically to Sangam CRM Contract module
 */
export const createContract = async (req, res) => {
  try {
    const {
      name,
      company,
      accountName,
      customer,
      accountId,
      email,
      service,
      contractType,
      subscriptionPeriod,
      productCategory,
      totalContractValue,
      value,
      startDate,
      endDate,
      status,
      slaTier,
      description,
      productId,
      salesPerson
    } = req.body;

    // 1. Mandatory field validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Contract name is required.' });
    }
    if (!startDate) {
      return res.status(400).json({ success: false, error: 'Start date is required.' });
    }
    if (!endDate) {
      return res.status(400).json({ success: false, error: 'End date is required.' });
    }
    if (!totalContractValue && !value) {
      return res.status(400).json({ success: false, error: 'Total contract value is required.' });
    }

    const cleanName = name.trim();
    const effectiveCustomer = (accountName || customer || company || cleanName).trim();
    const effectiveCompany = (company || accountName || effectiveCustomer).trim();
    const effectiveEmail = (email || 'contracts@nispl.in').trim();
    const effectiveContractType = contractType === 'AMC' ? 'AMC' : 'Subscription';
    const effectiveSubPeriod = subscriptionPeriod || '1 Year';
    const effectiveCategory = productCategory || (effectiveContractType === 'AMC' ? 'Service' : 'Software');

    const rawVal = String(totalContractValue || value).trim();
    const formattedVal = rawVal.startsWith('₹') ? rawVal : `₹${rawVal}`;

    const raisedBy = req.user
      ? {
          name: req.user.name || '',
          email: req.user.email || '',
          role: req.user.role || ''
        }
      : { name: '', email: '', role: '' };
    const effectiveSalesPerson = String(salesPerson || '').trim() || raisedBy.name || raisedBy.email || '';

    const contractCode = await nextContractCode();

    // 2. Resolve Account ID in Sangam CRM if linked customer is selected
    let resolvedAccountId = accountId || null;
    let targetCustomer = null;

    try {
      if (isMongoConnected()) {
        targetCustomer = await Customer.findOne({
          $or: [
            { name: new RegExp(`^${effectiveCustomer}$`, 'i') },
            { company: new RegExp(`^${effectiveCompany}$`, 'i') },
            { name: new RegExp(`^${effectiveCompany}$`, 'i') },
            { company: new RegExp(`^${effectiveCustomer}$`, 'i') }
          ]
        });
      } else {
        const fileList = getCustomersFromFile();
        targetCustomer = fileList.find(
          (c) =>
            c.name?.toLowerCase() === effectiveCustomer.toLowerCase() ||
            c.company?.toLowerCase() === effectiveCompany.toLowerCase() ||
            c.company?.toLowerCase() === effectiveCustomer.toLowerCase()
        );
      }

      if (targetCustomer) {
        if (targetCustomer.sangamCrm?.recordId && !targetCustomer.sangamCrm.recordId.startsWith('SGM-ACC-')) {
          resolvedAccountId = targetCustomer.sangamCrm.recordId;
        } else {
          // Sync customer to Sangam CRM first so they have a real Account ID
          const syncRes = await sangamCrmService.createOrUpdateCompany(targetCustomer);
          if (syncRes.success && syncRes.recordId) {
            resolvedAccountId = syncRes.recordId;
            if (isMongoConnected()) {
              await Customer.findByIdAndUpdate(targetCustomer._id, {
                $set: {
                  'sangamCrm.status': 'synced',
                  'sangamCrm.recordId': syncRes.recordId,
                  'sangamCrm.lastSyncedAt': new Date().toISOString()
                }
              });
            }
          }
        }
      }
    } catch (findCustErr) {
      console.warn('[ContractController] Error resolving customer link for contract:', findCustErr.message);
    }

    // 3. Save Contract locally first
    let savedContract = null;
    if (isMongoConnected()) {
      const doc = new Contract({
        contractId: contractCode,
        name: cleanName,
        company: effectiveCompany,
        customer: effectiveCustomer,
        accountId: resolvedAccountId,
        email: effectiveEmail,
        service: service || `${effectiveContractType} (${effectiveSubPeriod})`,
        contractType: effectiveContractType,
        subscriptionPeriod: effectiveSubPeriod,
        productCategory: effectiveCategory,
        totalContractValue: formattedVal,
        value: `${formattedVal} / ${effectiveSubPeriod.toLowerCase()}`,
        startDate,
        endDate,
        expiryDate: endDate,
        status: status || 'Active',
        slaTier: slaTier || 'Tier-1 Priority NOC 99.99%',
        description: description || '',
        productId: String(productId || '').trim(),
        salesPerson: effectiveSalesPerson,
        createdBy: raisedBy,
        sangamCrm: {
          status: 'pending',
          recordId: null,
          lastSyncedAt: null,
          syncError: null
        }
      });
      await doc.save();
      savedContract = doc.toObject();
    } else {
      const fileList = getContractsFromFile();
      const newRec = {
        contractId: contractCode,
        id: contractCode,
        name: cleanName,
        company: effectiveCompany,
        customer: effectiveCustomer,
        accountId: resolvedAccountId,
        email: effectiveEmail,
        service: service || `${effectiveContractType} (${effectiveSubPeriod})`,
        contractType: effectiveContractType,
        subscriptionPeriod: effectiveSubPeriod,
        productCategory: effectiveCategory,
        totalContractValue: formattedVal,
        value: `${formattedVal} / ${effectiveSubPeriod.toLowerCase()}`,
        startDate,
        endDate,
        expiryDate: endDate,
        status: status || 'Active',
        slaTier: slaTier || 'Tier-1 Priority NOC 99.99%',
        description: description || '',
        productId: String(productId || '').trim(),
        salesPerson: effectiveSalesPerson,
        createdBy: raisedBy,
        sangamCrm: {
          status: 'pending',
          recordId: null,
          lastSyncedAt: null,
          syncError: null
        },
        createdAt: new Date().toISOString()
      };
      fileList.unshift(newRec);
      saveContractsToFile(fileList);
      savedContract = newRec;
    }

    console.log(`[ContractController] Contract saved locally: ${contractCode} - "${cleanName}"`);

    // 4. Automatically sync to Sangam CRM Contracts API
    let sangamResult = { success: false, recordId: null, message: 'Sync not attempted' };
    try {
      sangamResult = await sangamCrmService.createOrUpdateContract(savedContract);

      const syncStatus = sangamResult.success ? 'synced' : 'failed';
      const crmRecordId = sangamResult.recordId;
      const syncErr = sangamResult.success ? null : sangamResult.message;

      if (isMongoConnected()) {
        savedContract = await Contract.findByIdAndUpdate(
          savedContract._id,
          {
            $set: {
              'sangamCrm.status': syncStatus,
              'sangamCrm.recordId': crmRecordId,
              'sangamCrm.lastSyncedAt': new Date(),
              'sangamCrm.syncError': syncErr
            }
          },
          { new: true }
        ).lean();
      } else {
        const fileList = getContractsFromFile();
        const idx = fileList.findIndex((c) => c.contractId === contractCode || c._id === savedContract._id);
        if (idx !== -1) {
          fileList[idx].sangamCrm = {
            status: syncStatus,
            recordId: crmRecordId,
            lastSyncedAt: new Date().toISOString(),
            syncError: syncErr
          };
          saveContractsToFile(fileList);
          savedContract = fileList[idx];
        }
      }
    } catch (syncErr) {
      console.error('[ContractController] Sangam CRM sync exception:', syncErr.message);
      sangamResult = { success: false, recordId: null, message: syncErr.message };
    }

    await logNotification({
      type: 'contract_created',
      title: 'Contract Created',
      message: `Contract "${savedContract.name || savedContract.service || contractCode}" (${savedContract.company || 'Enterprise'}) was created.`,
      severity: 'info',
      entityType: 'contract',
      entityId: contractCode,
      user: {
        name: savedContract.customer || savedContract.name || '',
        email: savedContract.email || '',
        company: savedContract.company || ''
      },
      metadata: {
        contractId: contractCode,
        service: savedContract.service,
        value: savedContract.totalContractValue || savedContract.value,
        expiryDate: savedContract.expiryDate || savedContract.endDate
      }
    });

    return res.status(201).json({
      success: true,
      contract: {
        ...savedContract,
        id: savedContract.contractId || savedContract._id
      },
      sangamCrm: savedContract.sangamCrm,
      message: sangamResult.success
        ? `Contract saved locally and synchronized to Sangam CRM Contracts (Record ID: ${sangamResult.recordId})`
        : `Contract saved locally. Sangam CRM synchronization pending: ${sangamResult.message}`
    });
  } catch (err) {
    console.error('[ContractController] createContract error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to create contract.'
    });
  }
};

/**
 * Trigger manual or retry sync to Sangam CRM for an existing Contract
 */
export const syncContractToSangam = async (req, res) => {
  try {
    const { id } = req.params;
    let contract = null;

    if (isMongoConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      contract = await Contract.findOne(
        isObjectId ? { $or: [{ contractId: id }, { _id: id }] } : { contractId: id }
      ).lean();
    } else {
      const fileList = getContractsFromFile();
      contract = fileList.find((c) => c.contractId === id || c._id === id || c.id === id);
    }

    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract record not found.' });
    }

    const sangamResult = await sangamCrmService.createOrUpdateContract(contract);
    const syncStatus = sangamResult.success ? 'synced' : 'failed';
    const crmRecordId = sangamResult.recordId;
    const syncErr = sangamResult.success ? null : sangamResult.message;

    let updatedContract = null;
    if (isMongoConnected()) {
      updatedContract = await Contract.findByIdAndUpdate(
        contract._id,
        {
          $set: {
            'sangamCrm.status': syncStatus,
            'sangamCrm.recordId': crmRecordId,
            'sangamCrm.lastSyncedAt': new Date(),
            'sangamCrm.syncError': syncErr
          }
        },
        { new: true }
      ).lean();
    } else {
      const fileList = getContractsFromFile();
      const idx = fileList.findIndex((c) => c.contractId === id || c._id === id || c.id === id);
      if (idx !== -1) {
        fileList[idx].sangamCrm = {
          status: syncStatus,
          recordId: crmRecordId,
          lastSyncedAt: new Date().toISOString(),
          syncError: syncErr
        };
        saveContractsToFile(fileList);
        updatedContract = fileList[idx];
      }
    }

    return res.status(200).json({
      success: sangamResult.success,
      sangamCrm: updatedContract?.sangamCrm || { status: syncStatus, recordId: crmRecordId },
      message: sangamResult.success
        ? `Contract successfully synchronized to Sangam CRM Contracts (Record ID: ${crmRecordId})`
        : `Synchronization failed: ${sangamResult.message}`
    });
  } catch (err) {
    console.error('[ContractController] syncContractToSangam error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to sync contract to Sangam CRM.'
    });
  }
};

/**
 * Update an existing contract record and re-sync to Sangam CRM
 */
export const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ contractId: id }, { _id: id }] }
      : { contractId: id };

    let contract = null;
    if (isMongoConnected()) {
      contract = await Contract.findOne(query);
    }
    if (!contract) {
      const fileList = getContractsFromFile();
      contract = fileList.find((c) => c.contractId === id || c._id === id || c.id === id);
    }

    if (!contract) {
      return res.status(404).json({ success: false, error: `Contract "${id}" not found.` });
    }

    const {
      name,
      company,
      customer,
      accountName,
      accountId,
      email,
      service,
      contractType,
      subscriptionPeriod,
      productCategory,
      totalContractValue,
      value,
      startDate,
      endDate,
      status,
      slaTier,
      description,
      productId,
      salesPerson
    } = req.body;

    const formattedVal = totalContractValue
      ? String(totalContractValue).startsWith('₹') ? totalContractValue : `₹${totalContractValue}`
      : value;

    const updatedData = {
      ...(name && { name: name.trim() }),
      ...(company && { company: company.trim() }),
      ...(customer && { customer: customer.trim() }),
      ...(accountId !== undefined && { accountId }),
      ...(email && { email: email.trim() }),
      ...(service && { service: service.trim() }),
      ...(contractType && { contractType }),
      ...(subscriptionPeriod && { subscriptionPeriod }),
      ...(productCategory && { productCategory }),
      ...(formattedVal && {
        totalContractValue: formattedVal,
        value: `${formattedVal} / ${(subscriptionPeriod || contract.subscriptionPeriod || '1 year').toLowerCase()}`
      }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate, expiryDate: endDate }),
      ...(status && { status }),
      ...(slaTier && { slaTier }),
      ...(description !== undefined && { description }),
      ...(productId !== undefined && { productId: String(productId).trim() }),
      ...(salesPerson !== undefined && { salesPerson: String(salesPerson).trim() })
    };

    let savedContract = null;
    if (isMongoConnected()) {
      savedContract = await Contract.findOneAndUpdate(query, { $set: updatedData }, { new: true }).lean();
    } else {
      const fileList = getContractsFromFile();
      const idx = fileList.findIndex((c) => c.contractId === id || c._id === id || c.id === id);
      if (idx !== -1) {
        fileList[idx] = { ...fileList[idx], ...updatedData };
        saveContractsToFile(fileList);
        savedContract = fileList[idx];
      }
    }

    if (!savedContract) {
      savedContract = { ...contract.toObject?.() || contract, ...updatedData };
    }

    // Synchronize updates to Sangam CRM Contracts API
    try {
      const syncResult = await sangamCrmService.createOrUpdateContract(savedContract);
      if (syncResult.success) {
        savedContract.sangamCrm = {
          status: 'synced',
          recordId: syncResult.recordId || savedContract.sangamCrm?.recordId,
          lastSyncedAt: new Date().toISOString(),
          syncError: null
        };
        if (isMongoConnected()) {
          await Contract.findOneAndUpdate(query, { sangamCrm: savedContract.sangamCrm });
        }
      }
    } catch (crmErr) {
      console.warn('[ContractController] Sangam CRM re-sync warning on update:', crmErr.message);
    }

    await logNotification({
      type: 'contract_updated',
      title: 'Contract Updated',
      message: `Contract "${savedContract.name || savedContract.contractCode}" for ${savedContract.company} was updated.`,
      severity: 'info',
      entityType: 'contract',
      entityId: savedContract.contractCode || savedContract._id,
      user: {
        company: savedContract.company
      }
    });

    return res.status(200).json({
      success: true,
      contract: {
        ...savedContract,
        id: savedContract.contractId || savedContract._id
      },
      message: 'Contract updated successfully and synced to Sangam CRM.'
    });
  } catch (err) {
    console.error('[ContractController] updateContract error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update contract.' });
  }
};

/**
 * Delete a contract record
 */
export const deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ contractId: id }, { _id: id }] }
      : { contractId: id };

    if (isMongoConnected()) {
      await Contract.findOneAndDelete(query);
    }

    const fileList = getContractsFromFile().filter(
      (c) => c.contractId !== id && c.id !== id && c._id !== id
    );
    saveContractsToFile(fileList);

    await logNotification({
      type: 'contract_deleted',
      title: 'Contract Deleted',
      message: `Contract (${id}) was deleted.`,
      severity: 'warning',
      entityType: 'contract',
      entityId: id
    });

    return res.status(200).json({
      success: true,
      message: `Contract ${id} deleted successfully.`
    });
  } catch (err) {
    console.error('[ContractController] deleteContract error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete contract.' });
  }
};

/**
 * Sheets are written day-first while the register stores ISO days, so every
 * uploaded date is converted before it is compared with an existing record.
 */
const toImportDate = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const dmy = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (dmy) {
    const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    const iso = `${year}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    return Number.isNaN(Date.parse(iso)) ? '' : iso;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';

  // A day written in words is read in the server's own calendar; toISOString
  // would slide it back a day for any zone east of UTC.
  const pad = (n) => String(n).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
};

/**
 * Sheets write the amount as "₹1,85,000", "Rs. 60,000/-" or "185000.00", so the
 * grouping separators are noise and the first run of digits is the value. Stripping
 * every non-digit instead would read "Rs. 60,000" as paise.
 */
const toImportValue = (value) => {
  const amount = String(value ?? '')
    .replace(/,/g, '')
    .match(/\d+(?:\.\d+)?/);
  // A trial row can legitimately carry ₹0; only a blank or unreadable cell is
  // treated as missing, otherwise the sheet would be rejected for no reason.
  return amount ? `₹${Number(amount[0]).toLocaleString('en-IN')}` : '';
};

const PERIOD_WORDS = {
  monthly: '1 Month',
  quarterly: '3 Months',
  halfyearly: '6 Months',
  semiyearly: '6 Months',
  yearly: '1 Year',
  annual: '1 Year',
  annually: '1 Year'
};

/**
 * Sangam counts the term in months while the register keeps the words the sheet
 * used, so a bare number is read as months and every period is labelled.
 */
const toImportPeriod = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const count = parseInt(raw, 10);
  if (!Number.isFinite(count) || count <= 0) {
    return PERIOD_WORDS[raw.toLowerCase().replace(/[^a-z]/g, '')] || raw;
  }

  const lower = raw.toLowerCase();
  const unit = lower.includes('year') ? 'year' : lower.includes('day') ? 'day' : 'month';
  const label = count === 1 ? unit : `${unit}s`;
  return `${count} ${label.charAt(0).toUpperCase()}${label.slice(1)}`;
};

const toImportType = (value) => {
  const raw = String(value ?? '').toLowerCase();
  if (raw.includes('amc') || raw.includes('maintenance')) return 'AMC';
  if (raw.includes('trial') || raw.includes('demo')) return 'Trial';
  return 'Subscription';
};

const toImportStatus = (value) => {
  const raw = String(value ?? '').toLowerCase();
  if (raw.includes('inactiv') || raw.includes('closed') || raw.includes('expired') || raw.includes('completed')) {
    return 'Inactive';
  }
  if (raw.includes('draft')) return 'draft';
  if (raw.includes('notstarted') || raw.includes('not started') || raw.includes('pending') || raw.includes('progress')) {
    return 'NotStarted';
  }
  return 'Active';
};

const toImportCategory = (contractType, value) => {
  const raw = String(value ?? '').toLowerCase();
  if (raw.includes('hardware') || raw.includes('device')) return 'Hardware';
  if (raw.includes('service') || raw.includes('support')) return 'Service';
  if (raw.includes('software') || raw.includes('license')) return 'Software';
  if (contractType === 'Trial') return 'Trial';
  return contractType === 'AMC' ? 'Service' : 'Software';
};

const escapeRegex = (value) => new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

/**
 * A contract is only useful in the CRM once it hangs off an Account, so the
 * firm named on the row is matched — or pushed to Sangam first — before the
 * contract itself is dispatched.
 */
const linkImportedAccount = async ({ email, company, customer }) => {
  try {
    if (isMongoConnected()) {
      const or = [];
      if (email) or.push({ email });
      if (company) or.push({ company: escapeRegex(company) });
      if (customer) or.push({ name: escapeRegex(customer) });
      if (!or.length) return null;

      const found = await Customer.findOne({ $or: or });
      if (!found) return null;

      const stored = found.sangamCrm?.recordId;
      if (stored && !String(stored).startsWith('SGM-ACC-')) return stored;

      const synced = await sangamCrmService.createOrUpdateCompany(found);
      if (synced.success && synced.recordId) {
        await Customer.findByIdAndUpdate(found._id, {
          $set: {
            'sangamCrm.status': 'synced',
            'sangamCrm.recordId': synced.recordId,
            'sangamCrm.lastSyncedAt': new Date()
          }
        });
        return synced.recordId;
      }
      return null;
    }

    const hit = getCustomersFromFile().find(
      (c) =>
        (email && String(c.email || '').toLowerCase() === email) ||
        (company && String(c.company || '').toLowerCase() === company.toLowerCase()) ||
        (customer && String(c.name || '').toLowerCase() === customer.toLowerCase())
    );
    const stored = hit?.sangamCrm?.recordId;
    return stored && !String(stored).startsWith('SGM-ACC-') ? stored : null;
  } catch (linkErr) {
    console.warn('[ContractController] Could not link imported contract to an account:', linkErr.message);
    return null;
  }
};

/**
 * Bulk import contracts from CSV. Each row is mapped, upserted against the
 * contract register and dispatched to the Sangam CRM Contract module, so a
 * signed sheet can be loaded once and both systems agree afterwards.
 */
export const importContracts = async (req, res) => {
  try {
    const rows = Array.isArray(req.body.contracts) ? req.body.contracts : [];
    if (!rows.length) {
      return res.status(400).json({ success: false, error: 'No contract records provided for import.' });
    }

    const raisedBy = req.user
      ? { name: req.user.name || '', email: req.user.email || '', role: req.user.role || '' }
      : { name: '', email: '', role: '' };

    const results = [];
    let succeededCount = 0;
    let failedCount = 0;
    let syncedCount = 0;

    for (let i = 0; i < rows.length; i += 1) {
      const item = rows[i] || {};
      const cleanName = String(item.name || item.contractName || '').trim();
      const company = String(item.company || item.accountName || '').trim();
      const customer = String(item.customer || item.accountName || item.company || cleanName).trim();
      const startDate = toImportDate(item.startDate);
      const endDate = toImportDate(item.endDate || item.expiryDate);
      const totalContractValue = toImportValue(item.totalContractValue ?? item.value);

      const missing = [];
      if (!cleanName) missing.push('Contract Name');
      if (!startDate) missing.push('Start Date');
      if (!endDate) missing.push('End Date');
      if (!totalContractValue) missing.push('Total Contract Value');

      if (missing.length) {
        results.push({
          row: i + 1,
          name: cleanName || 'Unknown',
          ok: false,
          error: `Missing ${missing.join(', ')}.`
        });
        failedCount += 1;
        continue;
      }

      try {
        const contractType = toImportType(item.contractType);
        const subscriptionPeriod = toImportPeriod(item.subscriptionPeriod || item.period || item.duration) || '1 Year';
        const email = String(item.email || '').trim().toLowerCase() || 'contracts@nispl.in';
        const effectiveCompany = company || customer;

        const payload = {
          name: cleanName,
          company: effectiveCompany,
          customer,
          accountId: await linkImportedAccount({ email, company: effectiveCompany, customer }),
          email,
          service: String(item.service || '').trim() || `${contractType} (${subscriptionPeriod})`,
          contractType,
          subscriptionPeriod,
          productCategory: toImportCategory(contractType, item.productCategory || item.service),
          totalContractValue,
          value: `${totalContractValue} / ${subscriptionPeriod.toLowerCase()}`,
          startDate,
          endDate,
          expiryDate: endDate,
          status: toImportStatus(item.status),
          slaTier: String(item.slaTier || '').trim() || 'Tier-1 Priority NOC 99.99%',
          description: String(item.description || '').trim(),
          productId: String(item.productId || '').trim(),
          salesPerson: String(item.salesPerson || '').trim() || raisedBy.name || raisedBy.email || ''
        };

        // Re-uploading the same sheet updates the deal it already described
        // instead of raising a second contract and a second CRM record.
        const suppliedCode = String(item.contractId || '').trim();
        let existing = null;

        if (isMongoConnected()) {
          existing =
            (suppliedCode && (await Contract.findOne({ contractId: suppliedCode }))) ||
            (await Contract.findOne({
              name: escapeRegex(cleanName),
              ...(effectiveCompany ? { company: escapeRegex(effectiveCompany) } : {})
            }));
        } else {
          existing =
            getContractsFromFile().find(
              (c) =>
                (suppliedCode && c.contractId === suppliedCode) ||
                (String(c.name || '').toLowerCase() === cleanName.toLowerCase() &&
                  String(c.company || '').toLowerCase() === effectiveCompany.toLowerCase())
            ) || null;
        }

        const contractCode = existing?.contractId || (await nextContractCode());
        const previousCrm = existing?.sangamCrm || null;
        let saved = null;

        if (isMongoConnected()) {
          const doc = existing
            ? await Contract.findByIdAndUpdate(existing._id, { $set: payload }, { new: true })
            : await Contract.create({
                contractId: contractCode,
                ...payload,
                createdBy: raisedBy,
                sangamCrm: { status: 'pending', recordId: null, lastSyncedAt: null, syncError: null }
              });
          saved = doc.toObject();
        } else {
          const fileList = getContractsFromFile();
          const index = existing ? fileList.findIndex((c) => c.contractId === existing.contractId) : -1;
          const record = {
            ...(index !== -1 ? fileList[index] : {}),
            contractId: contractCode,
            id: contractCode,
            ...payload,
            createdBy: raisedBy,
            sangamCrm: index !== -1 ? fileList[index].sangamCrm || {} : { status: 'pending', recordId: null },
            createdAt: index !== -1 ? fileList[index].createdAt : new Date().toISOString()
          };
          if (index !== -1) fileList[index] = record;
          else fileList.unshift(record);
          saveContractsToFile(fileList);
          saved = record;
        }

        const sangamResult = await sangamCrmService.createOrUpdateContract(saved);
        const sangamCrm = {
          status: sangamResult.success ? 'synced' : 'failed',
          recordId: sangamResult.recordId || previousCrm?.recordId || null,
          lastSyncedAt: new Date(),
          syncError: sangamResult.success ? null : sangamResult.message
        };
        if (sangamResult.success) syncedCount += 1;

        if (isMongoConnected()) {
          await Contract.findOneAndUpdate({ contractId: contractCode }, { $set: { sangamCrm } });
        } else {
          const fileList = getContractsFromFile();
          const index = fileList.findIndex((c) => c.contractId === contractCode);
          if (index !== -1) {
            fileList[index].sangamCrm = sangamCrm;
            saveContractsToFile(fileList);
          }
        }

        results.push({
          row: i + 1,
          contractId: contractCode,
          name: cleanName,
          company: effectiveCompany,
          created: !existing,
          sangamStatus: sangamCrm.status,
          sangamRecordId: sangamCrm.recordId,
          sangamError: sangamCrm.syncError,
          ok: true
        });
        succeededCount += 1;
      } catch (rowErr) {
        results.push({ row: i + 1, name: cleanName || 'Unknown', ok: false, error: rowErr.message });
        failedCount += 1;
      }
    }

    await logNotification({
      type: 'contract_created',
      title: 'Bulk Contracts Import',
      message: `Imported ${succeededCount} contract record(s), ${syncedCount} synchronized with Sangam CRM.`,
      severity: 'success',
      entityType: 'contract',
      metadata: { total: rows.length, succeeded: succeededCount, failed: failedCount, synced: syncedCount }
    });

    await logActivity(req, {
      action: 'IMPORT_CONTRACTS',
      category: 'contract',
      resource: 'Contract',
      details: `Bulk imported ${succeededCount} contracts from CSV with Sangam CRM sync. (${failedCount} failed, ${syncedCount} synced)`,
      changes: { total: rows.length, succeeded: succeededCount, failed: failedCount, synced: syncedCount }
    });

    return res.status(200).json({
      success: true,
      total: rows.length,
      succeeded: succeededCount,
      failed: failedCount,
      synced: syncedCount,
      results
    });
  } catch (err) {
    console.error('[ContractController] importContracts error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to import contracts.' });
  }
};

