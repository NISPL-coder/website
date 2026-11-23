import { logNotification } from '../services/notificationService.js';
import Contract, { getContractsFromFile, saveContractsToFile } from '../models/Contract.js';
import Customer, { getCustomersFromFile, saveCustomersToFile } from '../models/Customer.js';
import Notification from '../models/Notification.js';
import { sangamCrmService } from '../services/sangamCrmService.js';
import { nextContractCode, getFinancialYear, isContractIdExists, activateAccountAfterPayment, generateDedicatedIp } from '../services/contractProvisioning.js';
import { refreshCustomerLifecycle, matchesCustomer } from '../services/customerLifecycle.js';
import {
  checkAdditionalProductEligibility,
  findPrimaryContract,
  getKolkataDateString,
  RESTRICTION_MESSAGE,
  subtractCalendarDays
} from '../services/contractEligibilityService.js';
import { logActivity } from '../utils/activityLogger.js';
import { redactRecords } from '../utils/columnPermissions.js';
import {
  CONTRACT_STATUSES,
  normalizeContractStatus,
  normalizeContractType,
  contractTypeCategory,
  periodFromDates
} from '../utils/contractVocabulary.js';
import mongoose from 'mongoose';

const isMongoConnected = () => mongoose.connection.readyState === 1;

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

    const withContacts = await attachCustomerContacts(list);

    const now = Date.now();
    const formatted = redactRecords(req.user, 'contract', withContacts.map((c) => {
      const isDemo = Boolean(
        c.isDemoTrial ||
        c.contractType === 'Trial' ||
        c.productCategory === 'Trial' ||
        String(c.status).toUpperCase() === 'DEMO' ||
        String(c.status).toUpperCase() === 'DEMO-INACTIVE'
      );
      const isExpired = c.endDate || c.expiryDate
        ? new Date(c.endDate || c.expiryDate).getTime() < now
        : false;
      const isConverted = Boolean(c.convertedToPaid) ||
        ['converted', 'demoinactive', 'demo-inactive'].includes(String(c.status || '').toLowerCase().replace(/[\s_-]/g, ''));

      let effectiveStatus = c.status;
      if (isDemo && (isExpired || isConverted)) {
        effectiveStatus = 'Inactive';
      } else if (c.confirmationStatus === 'Pending' || c.adminConfirmed === false) {
        effectiveStatus = 'Inactive';
      } else if (!isDemo && ['inprogress', 'in progress', 'converted', 'signed', 'live', 'expiring'].includes(String(c.status || '').toLowerCase().trim())) {
        effectiveStatus = 'Active';
      }

      return {
        ...c,
        id: c.contractId || c._id || c.id,
        customerId: c.customerId || '',
        customer: c.customer || '',
        ipAddress: c.ipAddress || generateDedicatedIp(c.contractId || c.id),
        status: effectiveStatus,
        confirmationStatus: c.confirmationStatus || (c.adminConfirmed === false ? 'Pending' : 'None'),
        adminConfirmed: c.adminConfirmed !== false,
        sangamCrm: c.sangamCrm || { status: 'pending', recordId: null, lastSyncedAt: null }
      };
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      contracts: formatted
    });
  } catch (err) {
    console.error('[ContractController] getContracts error:', err.message);
    const fileList = redactRecords(req.user, 'contract', getContractsFromFile().map(c => ({
      ...c,
      ipAddress: c.ipAddress || generateDedicatedIp(c.contractId || c.id)
    })));
    return res.status(200).json({
      success: true,
      count: fileList.length,
      contracts: fileList
    });
  }
};

/**
 * GET /api/contracts/additional-product-eligibility
 * Retrieve the customer's Primary Contract and check 15-day restriction cut-off eligibility
 */
export const getAdditionalProductEligibility = async (req, res) => {
  try {
    const user = req.user;
    const queryEmail = String(req.query.email || user?.email || '').trim().toLowerCase();
    const queryCustomerId = String(req.query.customerId || user?.customerId || '').trim();

    let contracts = [];
    if (isMongoConnected()) {
      const matchCriteria = [];
      if (queryEmail) matchCriteria.push({ email: new RegExp(`^${queryEmail}$`, 'i') });
      if (queryCustomerId) matchCriteria.push({ customerId: queryCustomerId });
      if (matchCriteria.length > 0) {
        contracts = await Contract.find({ $or: matchCriteria }).lean();
      }
    } else {
      const all = getContractsFromFile();
      contracts = all.filter((c) => {
        const cEmail = String(c.email || '').trim().toLowerCase();
        const cCustId = String(c.customerId || '').trim();
        return (queryEmail && cEmail === queryEmail) || (queryCustomerId && cCustId === queryCustomerId);
      });
    }

    const primaryContract = findPrimaryContract(contracts);
    const eligibility = checkAdditionalProductEligibility({ primaryContract, contracts });

    return res.status(200).json({
      success: true,
      ...eligibility
    });
  } catch (err) {
    console.error('[ContractController] getAdditionalProductEligibility error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify additional product eligibility.'
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
      customerId,
      accountId,
      email,
      service,
      contractType,
      subscriptionPeriod,
      productCategory,
      totalContractValue,
      value,
      orderDate,
      startDate,
      endDate,
      status,
      slaTier,
      description,
      productId,
      salesPerson,
      phone,
      mobile,
      renewalDate,
      ipAddress
    } = req.body;

    // 1. Mandatory field validation
    const rawContractId = String(req.body.contractId || '').trim();
    const cleanName = String(name || '').trim();

    if (!cleanName && !rawContractId) {
      return res.status(400).json({ success: false, error: 'Contract ID or Name is required.' });
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

    // Determine target contract code:
    // If explicitly provided or if name starts with NISPL/, use that.
    // Otherwise, generate the next auto-increment sequence based on financial year.
    let contractCode = rawContractId || (/^NISPL\//i.test(cleanName) ? cleanName : '');
    if (!contractCode) {
      contractCode = await nextContractCode(startDate ? new Date(startDate) : new Date());
    }

    // Strict duplicate check: prevent any duplicate contract ID
    const duplicate = await isContractIdExists(contractCode);
    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: `Contract ID "${contractCode}" already exists. Duplicate contract entries are not allowed.`
      });
    }

    const effectiveCustomer = (accountName || customer || company || cleanName || contractCode).trim();
    const effectiveCompany = (company || accountName || effectiveCustomer).trim();
    const requestedEmail = String(email || '').trim();
    // Anything the console no longer recognises keeps the historical meaning it
    // had before this vocabulary existed, so sheets and the trial flow still land
    // on a readable row.
    const effectiveContractType = normalizeContractType(contractType) || 'Subscription';
    const effectiveStatus = normalizeContractStatus(status) || 'Active';
    // The term is read off the validity dates rather than typed beside them.
    const effectiveSubPeriod =
      String(subscriptionPeriod || '').trim() || periodFromDates(startDate, endDate) || '1 Year';
    const effectiveCategory =
      productCategory || contractTypeCategory(effectiveContractType);

    const rawVal = String(totalContractValue || value).trim();
    const formattedVal = rawVal.startsWith('₹') ? rawVal : `₹${rawVal}`;

    const isAdditional = Boolean(
      req.body.isAdditionalContract ||
      req.body.parentContractId ||
      req.body.isAdditionalProduct ||
      /additional/i.test(cleanName || '') ||
      /additional/i.test(service || '')
    );

    let effectiveEndDate = endDate;
    let primaryContract = null;

    if (isAdditional) {
      let customerContracts = [];
      const custEmail = String(email || requestedEmail || '').trim().toLowerCase();
      const custId = String(customerId || '').trim();

      if (isMongoConnected()) {
        const queryList = [];
        if (custEmail) queryList.push({ email: new RegExp(`^${custEmail}$`, 'i') });
        if (custId) queryList.push({ customerId: custId });
        if (queryList.length > 0) {
          customerContracts = await Contract.find({ $or: queryList }).lean();
        }
      } else {
        const fileList = getContractsFromFile();
        customerContracts = fileList.filter((c) => {
          const cEmail = String(c.email || '').trim().toLowerCase();
          const cCustId = String(c.customerId || '').trim();
          return (custEmail && cEmail === custEmail) || (custId && cCustId === custId);
        });
      }

      primaryContract = req.body.parentContractId
        ? customerContracts.find((c) => c.contractId === req.body.parentContractId || c.id === req.body.parentContractId)
        : findPrimaryContract(customerContracts);

      const eligibility = checkAdditionalProductEligibility({
        primaryContract,
        contracts: customerContracts
      });

      if (!eligibility.eligible) {
        return res.status(403).json({
          success: false,
          error: eligibility.message || RESTRICTION_MESSAGE,
          code: 'ADDITIONAL_PRODUCT_RESTRICTED',
          details: eligibility
        });
      }

      // If eligible: assign the existing Expiry Date to newly added product
      if (eligibility.masterExpiryDate) {
        effectiveEndDate = eligibility.masterExpiryDate;
      }
    }

    const raisedBy = req.user
      ? {
          name: req.user.name || '',
          email: req.user.email || '',
          role: req.user.role || ''
        }
      : { name: '', email: '', role: '' };
    const effectiveSalesPerson = String(salesPerson || '').trim() || raisedBy.name || raisedBy.email || '';

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

    // The mailbox on the row belongs to the person named on it: either the one
    // typed at creation or the one on the linked customer record. Nothing is
    // invented when neither exists, because the Person Email column would then
    // print the contract desk as if it were the client.
    const effectiveEmail = (requestedEmail || targetCustomer?.email || '').trim();

    const rawPaymentStatus = String(req.body.paymentStatus || '').trim();
    const isPaid = ['yes', 'true', '1', 'paid', 'y', 'active'].includes(rawPaymentStatus.toLowerCase());
    const paymentStatus = rawPaymentStatus ? (isPaid ? 'Yes' : 'No') : (effectiveStatus === 'DEMO' ? 'No' : 'Yes');

    // 3. Save Contract locally first
    let savedContract = null;
    if (isMongoConnected()) {
      const doc = new Contract({
        contractId: contractCode,
        name: cleanName,
        company: effectiveCompany,
        customer: effectiveCustomer,
        customerId: String(customerId || targetCustomer?.customerId || '').trim(),
        accountId: resolvedAccountId,
        email: effectiveEmail,
        service: service || `${effectiveContractType} (${effectiveSubPeriod})`,
        contractType: effectiveContractType,
        subscriptionPeriod: effectiveSubPeriod,
        productCategory: effectiveCategory,
        totalContractValue: formattedVal,
        value: `${formattedVal} / ${effectiveSubPeriod.toLowerCase()}`,
        ipAddress: req.body.ipAddress || generateDedicatedIp(contractCode),
        orderDate: String(orderDate || '').trim(),
        startDate,
        endDate: effectiveEndDate,
        expiryDate: effectiveEndDate,
        status: effectiveStatus,
        paymentStatus,
        parentContractId: primaryContract?.contractId || req.body.parentContractId || null,
        primaryContractId: primaryContract?.contractId || req.body.parentContractId || null,
        isAdditionalContract: isAdditional,
        slaTier: slaTier || 'Tier-1 Priority NOC 99.99%',
        description: isAdditional && primaryContract?.contractId
          ? `${description || ''} (Synchronized with Primary Contract ${primaryContract.contractId}, Master Expiry: ${effectiveEndDate})`.trim()
          : (description || ''),
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
        customerId: String(customerId || targetCustomer?.customerId || '').trim(),
        accountId: resolvedAccountId,
        email: effectiveEmail,
        service: service || `${effectiveContractType} (${effectiveSubPeriod})`,
        contractType: effectiveContractType,
        subscriptionPeriod: effectiveSubPeriod,
        productCategory: effectiveCategory,
        totalContractValue: formattedVal,
        value: `${formattedVal} / ${effectiveSubPeriod.toLowerCase()}`,
        ipAddress: req.body.ipAddress || generateDedicatedIp(contractCode),
        orderDate: String(orderDate || '').trim(),
        startDate,
        endDate: effectiveEndDate,
        expiryDate: effectiveEndDate,
        status: effectiveStatus,
        paymentStatus,
        parentContractId: primaryContract?.contractId || req.body.parentContractId || null,
        primaryContractId: primaryContract?.contractId || req.body.parentContractId || null,
        isAdditionalContract: isAdditional,
        slaTier: slaTier || 'Tier-1 Priority NOC 99.99%',
        description: isAdditional && primaryContract?.contractId
          ? `${description || ''} (Synchronized with Primary Contract ${primaryContract.contractId}, Master Expiry: ${effectiveEndDate})`.trim()
          : (description || ''),
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

      const syncStatus = sangamResult.success ? 'synced' : 'pending';
      const crmRecordId = sangamResult.recordId;
      const syncErr = sangamResult.success
        ? null
        : sangamResult.disabled
        ? 'Sangam CRM synchronization disabled in configuration.'
        : sangamResult.message;

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

    const [withContacts] = await attachCustomerContacts([savedContract]);
    const finalContract = withContacts || savedContract;

    // Raising or starting a paid contract is provisioning: the account behind
    // it moves out of InProgress once the service is live.
    await refreshCustomerLifecycle({
      customerId: finalContract.customerId || targetCustomer?.customerId,
      email: finalContract.email,
      company: finalContract.company
    }).catch((err) => console.warn('[ContractController] Lifecycle note:', err.message));

    return res.status(201).json({
      success: true,
      contract: {
        ...finalContract,
        id: finalContract.contractId || finalContract._id
      },
      sangamCrm: finalContract.sangamCrm,
      message: sangamResult.success
        ? `Contract saved locally and synchronized to Sangam CRM Contracts (Record ID: ${sangamResult.recordId})`
        : sangamResult.disabled
        ? 'Contract created and saved in database successfully. (Sangam CRM sync is disabled)'
        : `Contract saved locally. Sangam CRM synchronization pending: ${sangamResult.message}`
    });
  } catch (err) {
    console.error('[ContractController] createContract error:', err);
    if (err.code === 11000 || (err.name === 'MongoServerError' && err.message?.includes('duplicate key'))) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate contract ID detected. Contract IDs must be unique.'
      });
    }
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to create contract.'
    });
  }
};

/**
 * GET /api/contracts/next-id
 * Dynamically generate and return the next auto-increment contract ID
 * Format: NISPL/{financial_year}/00001
 */
export const getNextContractId = async (req, res) => {
  try {
    const fy = getFinancialYear();
    const contractId = await nextContractCode();
    const parts = contractId.split('/');
    const seq = parseInt(parts[parts.length - 1], 10) || 1;

    return res.status(200).json({
      success: true,
      contractId,
      financialYear: fy,
      sequence: seq,
      format: `NISPL/${fy}/00001`
    });
  } catch (err) {
    console.error('[ContractController] getNextContractId error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate next contract ID.'
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

    if (!sangamCrmService.isSyncEnabled()) {
      return res.status(200).json({
        success: false,
        disabled: true,
        sangamCrm: contract.sangamCrm || { status: 'pending', recordId: null },
        message: 'Sangam CRM synchronization is currently disabled in .env (SANGAM_CRM_SYNC_ENABLED=false).'
      });
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
 * Confirm customer payment and activate services (Admin sets confirmation to Yes)
 */
export const confirmContractPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ contractId: id }, { _id: id }] }
      : { contractId: id };

    let contract = null;
    if (isMongoConnected()) {
      contract = await Contract.findOne(query);
    } else {
      const fileList = getContractsFromFile();
      contract = fileList.find((c) => c.contractId === id || c._id === id || c.id === id);
    }

    if (!contract) {
      return res.status(404).json({ success: false, error: `Contract "${id}" not found.` });
    }

    const adminName = req.user?.name || 'Admin';
    const adminEmail = req.user?.email || '';

    // 1. Update contract to Active and paymentStatus to Yes
    if (isMongoConnected()) {
      contract.paymentStatus = 'Yes';
      contract.status = 'Active';
      contract.confirmationStatus = 'Confirmed';
      contract.adminConfirmed = true;
      contract.confirmedAt = new Date();
      contract.confirmedBy = { name: adminName, email: adminEmail };
      await contract.save();
    } else {
      const list = getContractsFromFile();
      const idx = list.findIndex((c) => c.contractId === id || c._id === id || c.id === id);
      if (idx !== -1) {
        list[idx].paymentStatus = 'Yes';
        list[idx].status = 'Active';
        list[idx].confirmationStatus = 'Confirmed';
        list[idx].adminConfirmed = true;
        list[idx].confirmedAt = new Date().toISOString();
        list[idx].confirmedBy = { name: adminName, email: adminEmail };
        saveContractsToFile(list);
      }
    }

    // 2. Activate customer and convert any demo trials
    try {
      await activateAccountAfterPayment({
        email: contract.email,
        company: contract.company,
        person: contract.customer,
        accountId: contract.accountId,
        customerId: contract.customerId,
        planName: contract.name || 'Active Cloud Subscription',
        contractId: contract.contractId || id
      });
    } catch (actErr) {
      console.warn('[confirmContractPayment] activateAccountAfterPayment note:', actErr.message);
    }

    // Clear pendingPaymentConfirmation on customer
    try {
      if (isMongoConnected()) {
        await Customer.updateMany(
          { $or: [{ customerId: contract.customerId }, { email: contract.email }] },
          { $set: { status: 'Active', pendingPaymentConfirmation: false } }
        );
      } else {
        const custs = getCustomersFromFile().map((c) =>
          (c.customerId === contract.customerId || c.email === contract.email)
            ? { ...c, status: 'Active', pendingPaymentConfirmation: false }
            : c
        );
        saveCustomersToFile(custs);
      }
    } catch (custUpdateErr) {
      console.warn('[confirmContractPayment] Customer update note:', custUpdateErr.message);
    }

    // 3. Mark related notifications as read/resolved
    try {
      if (isMongoConnected()) {
        await Notification.updateMany(
          {
            $or: [
              { entityId: contract.contractId || id },
              { 'metadata.contractId': contract.contractId || id }
            ],
            type: { $in: ['payment_confirmation_required', 'payment_confirmation'] }
          },
          { $set: { read: true, 'metadata.confirmationStatus': 'Confirmed' } }
        );
      }
    } catch (notifErr) {
      console.warn('[confirmContractPayment] Notification update note:', notifErr.message);
    }

    // 4. Log confirmation activity & notification
    await logActivity({
      type: 'contract_payment_confirmed',
      user: req.user,
      description: `Confirmed payment for contract ${contract.contractId || id} (${contract.company || contract.customer}). Services set to Active.`,
      entityType: 'contract',
      entityId: contract.contractId || id
    });

    await logNotification({
      type: 'payment_confirmed',
      title: 'Payment Confirmed & Services Resumed',
      message: `Admin ${adminName} confirmed payment for ${contract.company || contract.customer} (${contract.contractId || id}). Services are now Active.`,
      severity: 'success',
      entityType: 'contract',
      entityId: contract.contractId || id,
      user: { name: contract.customer, email: contract.email, role: 'customer', company: contract.company },
      metadata: { contractId: contract.contractId || id, customerId: contract.customerId, confirmedBy: adminName }
    });

    return res.status(200).json({
      success: true,
      message: `Payment confirmed for contract ${contract.contractId || id}. Customer and services are now Active.`,
      contract
    });
  } catch (err) {
    console.error('[ContractController] confirmContractPayment error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Could not confirm payment.' });
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
      orderDate,
      startDate,
      endDate,
      status,
      slaTier,
      description,
      productId,
      salesPerson,
      phone,
      mobile,
      renewalDate,
      ipAddress
    } = req.body;

    const formattedVal = totalContractValue
      ? String(totalContractValue).startsWith('₹') ? totalContractValue : `₹${totalContractValue}`
      : value;

    // Moving the validity dates moves the term, otherwise the receipt would keep
    // printing the length of the old agreement.
    const datesMoved = Boolean(startDate || endDate);
    const effectivePeriod =
      String(subscriptionPeriod || '').trim() ||
      (datesMoved
        ? periodFromDates(startDate || contract.startDate, endDate || contract.endDate)
        : '') ||
      contract.subscriptionPeriod ||
      '1 Year';

    if (req.body.contractId && req.body.contractId.trim() && req.body.contractId.trim() !== contract.contractId) {
      const newContractId = req.body.contractId.trim();
      const duplicate = isMongoConnected()
        ? await Contract.exists({ contractId: newContractId, _id: { $ne: contract._id } })
        : getContractsFromFile().some((c) => (c.contractId === newContractId || c.id === newContractId) && c.contractId !== contract.contractId);
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: `Contract ID "${newContractId}" is already taken by another contract. Duplicate contract IDs are not allowed.`
        });
      }
    }

    const updatedData = {
      ...(req.body.contractId && req.body.contractId.trim() && { contractId: req.body.contractId.trim(), id: req.body.contractId.trim() }),
      ...(name && { name: name.trim() }),
      ...(company && { company: company.trim() }),
      ...(customer && { customer: customer.trim() }),
      ...(accountId !== undefined && { accountId }),
      ...(email && { email: email.trim() }),
      ...(service && { service: service.trim() }),
      ...(contractType && { contractType: normalizeContractType(contractType) || contractType }),
      ...(effectivePeriod && { subscriptionPeriod: effectivePeriod }),
      ...(productCategory && { productCategory }),
      ...(formattedVal && {
        totalContractValue: formattedVal,
        value: `${formattedVal} / ${effectivePeriod.toLowerCase()}`
      }),
      ...(orderDate !== undefined && { orderDate: String(orderDate).trim() }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate, expiryDate: endDate }),
      ...(status && { status: normalizeContractStatus(status) }),
      ...(req.body.paymentStatus !== undefined && {
        paymentStatus: ['yes', 'true', '1', 'paid', 'y', 'active'].includes(String(req.body.paymentStatus || '').trim().toLowerCase()) ? 'Yes' : 'No'
      }),
      ...(slaTier && { slaTier }),
      ...(description !== undefined && { description }),
      ...(productId !== undefined && { productId: String(productId).trim() }),
      ...(salesPerson !== undefined && { salesPerson: String(salesPerson).trim() }),
      ...(phone !== undefined && { phone: String(phone).trim() }),
      ...(mobile !== undefined && { mobile: String(mobile).trim() }),
      ...(renewalDate !== undefined && { renewalDate: String(renewalDate).trim() }),
      ...(ipAddress !== undefined && { ipAddress: String(ipAddress).trim() }),
      updatedBy: req.user
        ? {
            name: req.user.name || '',
            email: req.user.email || '',
            role: req.user.role || ''
          }
        : { name: '', email: '', role: '' }
    };

    let savedContract = null;
    if (isMongoConnected()) {
      savedContract = await Contract.findOneAndUpdate(query, { $set: updatedData }, { new: true }).lean();
    } else {
      const fileList = getContractsFromFile();
      const idx = fileList.findIndex((c) => c.contractId === id || c._id === id || c.id === id);
      if (idx !== -1) {
        // Mongo stamps updatedAt for us; the register has to stamp it itself.
        fileList[idx] = { ...fileList[idx], ...updatedData, updatedAt: new Date().toISOString() };
        saveContractsToFile(fileList);
        savedContract = fileList[idx];
      }
    }

    if (!savedContract) {
      savedContract = { ...contract.toObject?.() || contract, ...updatedData };
    }

    // Unified Contract Synchronization: When Primary Contract renewal date changes,
    // synchronize all associated child additional products with the new common Expiry Date.
    const newMasterExpiry = updatedData.expiryDate || updatedData.endDate;
    if (newMasterExpiry) {
      try {
        const cId = savedContract.contractId || id;
        if (isMongoConnected()) {
          await Contract.updateMany(
            { $or: [{ parentContractId: cId }, { primaryContractId: cId }] },
            {
              $set: {
                endDate: newMasterExpiry,
                expiryDate: newMasterExpiry,
                ...(status && { status: normalizeContractStatus(status) })
              }
            }
          );
        } else {
          const fileList = getContractsFromFile();
          let childSynced = false;
          fileList.forEach((c) => {
            if (c.parentContractId === cId || c.primaryContractId === cId) {
              c.endDate = newMasterExpiry;
              c.expiryDate = newMasterExpiry;
              if (status) c.status = normalizeContractStatus(status);
              childSynced = true;
            }
          });
          if (childSynced) saveContractsToFile(fileList);
        }
      } catch (syncErr) {
        console.warn('[ContractController] Error syncing child contracts on renewal:', syncErr.message);
      }
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

    const [withContacts] = await attachCustomerContacts([savedContract]);
    const finalContract = withContacts || savedContract;

    await refreshCustomerLifecycle({
      customerId: finalContract.customerId,
      email: finalContract.email,
      company: finalContract.company
    }).catch((err) => console.warn('[ContractController] Lifecycle note:', err.message));

    return res.status(200).json({
      success: true,
      contract: {
        ...finalContract,
        id: finalContract.contractId || finalContract._id
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

    const removed = isMongoConnected() ? await Contract.findOne(query).lean() : getContractsFromFile().find((c) => c.contractId === id || c.id === id);
    if (isMongoConnected()) {
      await Contract.findOneAndDelete(query);
    }

    const fileList = getContractsFromFile().filter(
      (c) => c.contractId !== id && c.id !== id && c._id !== id
    );
    saveContractsToFile(fileList);

    if (removed) {
      await refreshCustomerLifecycle({
        customerId: removed.customerId,
        email: removed.email,
        company: removed.company
      }).catch((err) => console.warn('[ContractController] Lifecycle note:', err.message));
    }

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
  const recognised = normalizeContractType(value);
  if (recognised) return recognised;

  const raw = String(value ?? '').toLowerCase();
  if (raw.includes('amc') || raw.includes('maintenance')) return 'AMC';
  if (raw.includes('trial') || raw.includes('demo')) return 'Trial';
  return 'Subscription';
};

const toImportStatus = (value) => {
  const raw = String(value ?? '').toLowerCase();
  if (raw.includes('demo') || raw.includes('trial')) return 'DEMO';
  if (raw.includes('inactiv') || raw.includes('closed') || raw.includes('expired') || raw.includes('completed')) {
    return raw.includes('closed') ? 'Closed' : 'Inactive';
  }
  if (raw.includes('draft') || raw.includes('notstarted') || raw.includes('not started') || raw.includes('pending')) {
    return 'Not Started';
  }
  if (raw.includes('progress') || raw.includes('active')) {
    return 'Active';
  }
  const recognised = normalizeContractStatus(value);
  if (recognised === 'In Progress') return 'Active';
  if (CONTRACT_STATUSES.includes(recognised)) return recognised;
  return 'Active';
};

const toImportCategory = (contractType, value) => {
  const raw = String(value ?? '').toLowerCase();
  if (raw.includes('hardware') || raw.includes('device')) return 'Hardware';
  if (raw.includes('service') || raw.includes('support')) return 'Service';
  if (raw.includes('software') || raw.includes('license')) return 'Software';
  if (contractType === 'Trial') return 'Trial';
  return contractTypeCategory(contractType);
};

const escapeRegex = (value) => new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

/**
 * The register stores the person's name, not their mailbox, so the contact
 * columns are read from the customer master every time the list is asked for.
 * That keeps the table honest when a client's number changes, and a contract
 * whose firm has no customer record simply prints its own email and no mobile.
 */
const attachCustomerContacts = async (list) => {
  if (!Array.isArray(list) || list.length === 0) return list;

  const names = list.flatMap((c) => [c.company, c.customer, c.email]).map((v) => String(v || '').trim()).filter(Boolean);
  const distinct = [...new Set(names)];
  if (distinct.length === 0) return list;

  let customers = [];
  try {
    if (isMongoConnected()) {
      const projection = 'name company email phone alternatePhone mobile contacts customerId';
      // The indexed exact match covers almost every row; only the names that
      // miss it are retried case-insensitively, so a large register does not
      // turn into a collection scan on every page load.
      customers = await Customer.find({
        $or: [{ company: { $in: distinct } }, { name: { $in: distinct } }, { email: { $in: distinct } }]
      })
        .select(projection)
        .lean();

      const matched = new Set(
        customers.flatMap((cust) => [
          String(cust.company || '').trim(),
          String(cust.name || '').trim(),
          String(cust.email || '').trim()
        ].filter(Boolean))
      );
      const missed = distinct.filter((value) => !matched.has(value));

      if (missed.length > 0) {
        const fuzzy = await Customer.find({
          $or: missed.flatMap((value) => [
            { company: escapeRegex(value) },
            { name: escapeRegex(value) },
            { email: escapeRegex(value) }
          ])
        })
          .select(projection)
          .lean();
        customers = customers.concat(fuzzy);
      }
    } else {
      const lookup = new Set(distinct.map((v) => v.toLowerCase()));
      customers = getCustomersFromFile().filter(
        (c) =>
          lookup.has(String(c.company || '').toLowerCase()) ||
          lookup.has(String(c.name || '').toLowerCase()) ||
          lookup.has(String(c.email || '').toLowerCase())
      );
    }
  } catch (err) {
    console.warn('[ContractController] Customer contact lookup failed:', err.message);
    return list;
  }

  const byCompany = new Map();
  const byName = new Map();
  const byEmail = new Map();
  customers.forEach((cust) => {
    if (cust.company) byCompany.set(String(cust.company).trim().toLowerCase(), cust);
    if (cust.name) byName.set(String(cust.name).trim().toLowerCase(), cust);
    if (cust.email) byEmail.set(String(cust.email).trim().toLowerCase(), cust);
  });

  return list.map((c) => {
    const company = String(c.company || '').trim().toLowerCase();
    const person = String(c.customer || '').trim().toLowerCase();
    const email = String(c.email || '').trim().toLowerCase();
    const linked = byCompany.get(company) || byName.get(person) || byEmail.get(email) || byName.get(company) || null;
    // The signer may be one of several contacts on the account.
    const contact =
      linked?.contacts?.find((entry) => String(entry.name || '').trim().toLowerCase() === person) || null;

    const resolvedCustomerId =
      c.customerId ||
      linked?.customerId ||
      (linked?.id && String(linked.id).startsWith('CUST-') ? linked.id : '') ||
      '';

    return {
      ...c,
      customerId: resolvedCustomerId,
      personEmail: contact?.email || linked?.email || c.email || '',
      personMobile:
        contact?.phone ||
        linked?.phone ||
        linked?.alternatePhone ||
        linked?.mobile ||
        c.phone ||
        c.mobile ||
        ''
    };
  });
};

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
    const touchedAccounts = new Map();
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
      if (!cleanName) missing.push('Contract ID');
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
        const subscriptionPeriod =
          toImportPeriod(item.subscriptionPeriod || item.period || item.duration) ||
          periodFromDates(startDate, endDate) ||
          '1 Year';
        const email = String(item.email || '').trim().toLowerCase() || 'contracts@nispl.in';
        const effectiveCompany = company || customer;

        const rawPaymentStatus = String(item.paymentStatus || item.payment || item.isPaid || '').trim();
        const importStatus = toImportStatus(item.status);
        const isPaid = ['yes', 'true', '1', 'paid', 'y', 'active'].includes(rawPaymentStatus.toLowerCase()) ||
          importStatus === 'Active' ||
          String(item.status || '').toLowerCase().includes('progress');
        const paymentStatus = rawPaymentStatus ? (isPaid ? 'Yes' : 'No') : (importStatus === 'DEMO' ? 'No' : 'Yes');

        // Check if matching customer exists or auto-link/provision
        let targetCustomer = null;
        try {
          if (isMongoConnected()) {
            targetCustomer = await Customer.findOne({
              $or: [
                ...(email && email !== 'contracts@nispl.in' ? [{ email: escapeRegex(email) }] : []),
                ...(effectiveCompany ? [{ company: escapeRegex(effectiveCompany) }] : []),
                ...(customer ? [{ name: escapeRegex(customer) }] : [])
              ]
            });
          } else {
            const fileList = getCustomersFromFile();
            targetCustomer = fileList.find(
              (c) =>
                (email && email !== 'contracts@nispl.in' && c.email?.toLowerCase() === email.toLowerCase()) ||
                (effectiveCompany && c.company?.toLowerCase() === effectiveCompany.toLowerCase()) ||
                (customer && c.name?.toLowerCase() === customer.toLowerCase())
            );
          }
        } catch (findErr) {
          console.warn('[ContractController] Customer find note:', findErr.message);
        }

        let customerId = targetCustomer?.customerId || targetCustomer?.id || '';
        const initialStatus = isPaid ? 'Active' : (importStatus === 'DEMO' ? 'Demo' : 'Inactive');

        if (!targetCustomer && (effectiveCompany || customer)) {
          // Provision customer record so they appear in Active or Demo section immediately
          customerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
          const newCust = {
            customerId,
            id: customerId,
            name: customer || effectiveCompany,
            company: effectiveCompany,
            email: email,
            phone: '0000000000',
            status: initialStatus,
            plan: String(item.service || '').trim(),
            sangamCrm: { status: 'pending', recordId: null }
          };
          if (isMongoConnected()) {
            try {
              await Customer.create(newCust);
            } catch (createCustErr) {
              console.warn('[ContractController] Auto customer creation note:', createCustErr.message);
            }
          }
          const fList = getCustomersFromFile();
          fList.unshift(newCust);
          saveCustomersToFile(fList);
        } else if (targetCustomer) {
          if (isMongoConnected()) {
            await Customer.findByIdAndUpdate(targetCustomer._id, { $set: { status: initialStatus } });
          }
          const fList = getCustomersFromFile();
          const fIdx = fList.findIndex((c) => c.customerId === targetCustomer.customerId || c.id === targetCustomer.id);
          if (fIdx !== -1) {
            fList[fIdx].status = initialStatus;
            saveCustomersToFile(fList);
          }
        }

        const payload = {
          name: cleanName,
          company: effectiveCompany,
          customer,
          customerId,
          accountId: await linkImportedAccount({ email, company: effectiveCompany, customer }),
          email,
          service: String(item.service || '').trim() || `${contractType} (${subscriptionPeriod})`,
          contractType,
          subscriptionPeriod,
          productCategory: toImportCategory(contractType, item.productCategory || item.service),
          totalContractValue,
          value: `${totalContractValue} / ${subscriptionPeriod.toLowerCase()}`,
          orderDate: String(item.orderDate || '').trim(),
          startDate,
          endDate,
          expiryDate: endDate,
          status: toImportStatus(item.status),
          paymentStatus,
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
            ? await Contract.findByIdAndUpdate(existing._id, { $set: { ...payload, updatedBy: raisedBy } }, { new: true })
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
            ...(index !== -1 && { updatedBy: raisedBy }),
            sangamCrm: index !== -1 ? fileList[index].sangamCrm || {} : { status: 'pending', recordId: null },
            createdAt: index !== -1 ? fileList[index].createdAt : new Date().toISOString(),
            updatedAt: index !== -1 ? new Date().toISOString() : undefined
          };
          if (index !== -1) fileList[index] = record;
          else fileList.unshift(record);
          saveContractsToFile(fileList);
          saved = record;
        }

        const sangamResult = await sangamCrmService.createOrUpdateContract(saved);
        const sangamCrm = {
          status: sangamResult.success ? 'synced' : sangamResult.disabled ? 'pending' : 'failed',
          recordId: sangamResult.recordId || previousCrm?.recordId || null,
          lastSyncedAt: sangamResult.success ? new Date() : null,
          syncError: sangamResult.success
            ? null
            : sangamResult.disabled
            ? 'Sangam CRM synchronization disabled in configuration.'
            : sangamResult.message
        };
        if (sangamResult.success) syncedCount += 1;

        touchedAccounts.set(`${saved.email}|${saved.company}|${saved.customer}`, {
          customerId: saved.customerId,
          email: saved.email,
          company: saved.company,
          customer: saved.customer
        });

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

    for (const identity of touchedAccounts.values()) {
      await refreshCustomerLifecycle(identity).catch((err) =>
        console.warn('[ContractController] Import lifecycle note:', err.message)
      );
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

