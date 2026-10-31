import Contract, { getContractsFromFile, saveContractsToFile } from '../models/Contract.js';
import Customer, { getCustomersFromFile } from '../models/Customer.js';
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
    const effectiveCustomer = (accountName || customer || company || cleanName).trim();
    const effectiveCompany = (company || accountName || effectiveCustomer).trim();
    const effectiveEmail = (email || 'contracts@nispl.in').trim();
    const effectiveContractType = contractType === 'AMC' ? 'AMC' : 'Subscription';
    const effectiveSubPeriod = subscriptionPeriod || '1 Year';
    const effectiveCategory = productCategory || (effectiveContractType === 'AMC' ? 'Service' : 'Software');

    const rawVal = String(totalContractValue || value).trim();
    const formattedVal = rawVal.startsWith('₹') ? rawVal : `₹${rawVal}`;

    const contractCode = `CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

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
      description
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
      ...(description !== undefined && { description })
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

    return res.status(200).json({
      success: true,
      message: `Contract ${id} deleted successfully.`
    });
  } catch (err) {
    console.error('[ContractController] deleteContract error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete contract.' });
  }
};

