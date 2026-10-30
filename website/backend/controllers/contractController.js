import Contract, { getContractsFromFile, saveContractsToFile } from '../models/Contract.js';
import Customer from '../models/Customer.js';
import { sangamCrmService } from '../services/sangamCrmService.js';
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
      if (!list || list.length === 0) {
        const fileList = getContractsFromFile();
        try {
          await Contract.insertMany(fileList, { ordered: false });
        } catch (e) {
          // ignore duplicate keys during initial seed
        }
        list = fileList;
      }
    } else {
      list = getContractsFromFile();
    }

    const formatted = list.map((c) => ({
      ...c,
      id: c.contractId || c._id || c.id,
      sangamCrm: c.sangamCrm || { status: 'pending', recordId: null, lastSyncedAt: null }
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      contracts: formatted
    });
  } catch (err) {
    console.error('[ContractController] getContracts error:', err.message);
    const fileList = getContractsFromFile();
    return res.status(200).json({
      success: true,
      count: fileList.length,
      contracts: fileList
    });
  }
};

/**
 * Create a new Contract and sync automatically to Sangam CRM -> Contracts
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
      description
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
    // In Sangam CRM, the Account Name maps directly to the Customer Name
    const effectiveCustomer = (accountName || customer || company || cleanName).trim();
    const effectiveCompany = (company || accountName || effectiveCustomer).trim();
    const effectiveEmail = (email || 'contracts@nispl.in').trim();
    const effectiveContractType = contractType === 'AMC' ? 'AMC' : 'Subscription';
    const effectiveSubPeriod = subscriptionPeriod || '1 Year';
    const effectiveCategory = productCategory || (effectiveContractType === 'AMC' ? 'Service' : 'Software');
    
    const rawVal = String(totalContractValue || value).trim();
    const formattedVal = rawVal.startsWith('₹') ? rawVal : `₹${rawVal}`;

    const contractCode = `CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Resolve or automatically create & sync Account Name (Customer) in Sangam CRM
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
          // Sync customer to Sangam CRM first so they have a real Account ID in Sangam CRM
          const syncRes = await sangamCrmService.createOrUpdateCompany(targetCustomer);
          if (syncRes.success && syncRes.recordId) {
            resolvedAccountId = syncRes.recordId;
            if (isMongoConnected()) {
              await Customer.findByIdAndUpdate(targetCustomer._id, {
                $set: {
                  'sangamCrm.status': 'synced',
                  'sangamCrm.recordId': resolvedAccountId,
                  'sangamCrm.lastSyncedAt': new Date()
                }
              });
            }
          }
        }
      } else {
        // If customer does not exist in local DB yet, create & sync to Sangam CRM Companies
        const newCustomerData = {
          name: effectiveCustomer,
          company: effectiveCompany,
          email: effectiveEmail,
          phone: '+91 98301 00000',
          accountRelationship: 'Customer'
        };
        const crmRes = await sangamCrmService.createOrUpdateCompany(newCustomerData);
        if (crmRes.success && crmRes.recordId) {
          resolvedAccountId = crmRes.recordId;
        }
      }
    } catch (findErr) {
      console.warn('[ContractController] Customer account resolution notice:', findErr.message);
    }

    const contractData = {
      contractId: contractCode,
      name: cleanName,
      company: effectiveCompany,
      customer: effectiveCustomer,
      accountName: effectiveCustomer,
      accountId: resolvedAccountId,
      email: effectiveEmail,
      phone: (req.body.phone || targetCustomer?.phone || '').trim(),
      service: service || `${effectiveContractType} (${effectiveSubPeriod})`,
      contractType: effectiveContractType,
      subscriptionPeriod: effectiveSubPeriod,
      productCategory: effectiveCategory,
      totalContractValue: formattedVal,
      value: formattedVal,
      startDate: startDate,
      endDate: endDate,
      expiryDate: endDate,
      status: status || 'active',
      slaTier: slaTier || 'Tier-1 Priority NOC 99.99%',
      description: description || `Created via NISPL Custom Login Dashboard for ${effectiveCompany}`,
      sangamCrm: {
        status: 'pending',
        recordId: null,
        lastSyncedAt: null,
        syncError: null
      }
    };

    // 3. Save locally first
    let savedContract = null;
    if (isMongoConnected()) {
      savedContract = await Contract.create(contractData);
    } else {
      const fileList = getContractsFromFile();
      const newRec = {
        ...contractData,
        _id: new mongoose.Types.ObjectId().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
    console.error('[ContractController] syncContractToSangam error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to sync contract to Sangam CRM.'
    });
  }
};

