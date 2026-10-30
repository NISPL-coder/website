import { config } from '../config/index.js';

/**
 * Sangam CRM API Integration Service
 * Official REST API connector for syncing Customers to Sangam CRM -> Companies (Account module).
 * 
 * Target Endpoint: POST /api/v1/save-data
 * Module: Account (mapped to user-facing Companies List in Sangam CRM)
 */
class SangamCrmService {
  constructor() {
    this.crmUrl = config.sangamCrm?.url || 'https://nistally.sangamcrm.com/';
    this.apiBase = config.sangamCrm?.apiBase || 'https://nistally.sangamcrm.com/api/v1/';
    this.token = config.sangamCrm?.token || 'A8GquckzjoSIUfwGAtXcjxOBlWo2i0t6';
    this.timeoutMs = 12000;
  }

  /**
   * Format customer data into exact supported Sangam CRM Account fields
   */
  mapCustomerToCompanyData(customer) {
    const companyName = customer.company || customer.name || 'Unnamed Company';
    const contactPerson = customer.name || customer.contactPerson || companyName;
    const email = customer.email || '';
    const phone = customer.phone || customer.mobile || '';
    const altPhone = customer.alternatePhone || '';
    const addressObj = customer.address && typeof customer.address === 'object' ? customer.address : {};

    // Address parts
    const street = addressObj.street || customer.street || '';
    const area = addressObj.area || customer.area || '';
    const fullStreet = [street, area].filter(Boolean).join(', ') || street;
    const city = addressObj.city || customer.city || 'Kolkata';
    const state = addressObj.state || customer.state || 'West Bengal';
    const country = addressObj.country || customer.country || 'India';
    const postalCode = addressObj.postalCode || customer.postalCode || '';
    const gstNo = customer.gstNo || customer.gstNumber || customer.gstin || '';
    const website = customer.website || '';

    // Normalize industry to Sangam CRM supported enum
    const rawIndustry = (customer.industry || '').toLowerCase();
    let industry = 'Technology';
    if (rawIndustry.includes('tech') || rawIndustry.includes('cloud') || rawIndustry.includes('software') || rawIndustry.includes('it')) {
      industry = 'Technology';
    } else if (rawIndustry.includes('finan') || rawIndustry.includes('bank')) {
      industry = 'Finance';
    } else if (rawIndustry.includes('health') || rawIndustry.includes('med') || rawIndustry.includes('pharma')) {
      industry = 'Healthcare';
    } else if (rawIndustry.includes('edu')) {
      industry = 'Education';
    } else if (rawIndustry.includes('retail') || rawIndustry.includes('commerce')) {
      industry = 'Retail';
    } else if (rawIndustry.includes('manuf') || rawIndustry.includes('supply')) {
      industry = 'Manufacturing';
    } else if (rawIndustry.includes('consult')) {
      industry = 'Consulting';
    } else if (rawIndustry.includes('gov')) {
      industry = 'Government';
    } else if (rawIndustry.includes('energy')) {
      industry = 'Energy';
    } else if (rawIndustry.includes('comm')) {
      industry = 'Communications';
    } else if (rawIndustry.includes('trans')) {
      industry = 'Transportation';
    } else {
      industry = 'Other';
    }

    // Normalize customer_type (Account Relationship)
    const validRelationships = [
      'Customer', 'Competitor', 'Integrator', 'Investor',
      'Partner', 'Press', 'Prospect', 'Reseller', 'Analyst', 'Other'
    ];
    let relationship = customer.accountRelationship || 'Customer';
    const matchedRel = validRelationships.find(r => r.toLowerCase() === relationship.toLowerCase());
    if (matchedRel) relationship = matchedRel;
    else relationship = 'Customer';

    const description = [
      `Contact Representative: ${contactPerson}`,
      email ? `Email: ${email}` : '',
      phone ? `Phone: ${phone}` : '',
      altPhone ? `Alt Phone: ${altPhone}` : '',
      gstNo ? `GST: ${gstNo}` : '',
      customer.customerId ? `NISPL Customer ID: ${customer.customerId}` : '',
      customer.plan ? `Plan: ${customer.plan}` : '',
      'Created via NISPL Custom Login Dashboard API'
    ].filter(Boolean).join(' | ');

    const fields = {
      name: companyName,
      customer_type: relationship,
      industry: industry,
      phone: phone,
      email: email,
      website: website,
      address: fullStreet,
      street: street,
      city: city,
      state: state,
      country: country,
      postal_code: postalCode,
      description: description,
      assigned_user_id: '2'
    };

    if (gstNo) {
      fields.gstin = gstNo;
    }

    return fields;
  }

  /**
   * Create or Update a Company in Sangam CRM
   * @param {Object} customer - Customer object from local database/form
   * @returns {Promise<{success: boolean, recordId: string, message: string, rawResponse: any}>}
   */
  async createOrUpdateCompany(customer) {
    const endpoint = `${this.apiBase.replace(/\/+$/, '')}/save-data`;
    const fieldList = this.mapCustomerToCompanyData(customer);

    // If an existing Sangam CRM Record ID is stored, pass attach.id to support updating
    const existingId = customer.sangamCrm?.recordId;
    if (existingId && !existingId.startsWith('SGM-ACC-') && existingId.length > 10) {
      fieldList.attach = { id: existingId };
    }

    const payload = {
      module_name: 'Account',
      field_name_list: fieldList
    };

    console.log(`[SangamCRM] Dispatching Account save for: "${fieldList.name}" (${fieldList.email}) [customer_type: ${fieldList.customer_type}]`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const responseText = await response.text();
      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(`Sangam CRM returned non-JSON response (HTTP ${response.status}): ${responseText.substring(0, 180)}`);
      }

      if (!response.ok || (responseJson.status && responseJson.status !== 200)) {
        const errorMsg = responseJson.message || responseJson.error_message || `HTTP ${response.status} Error`;
        console.error(`[SangamCRM] API Failure (${response.status}):`, errorMsg);
        return {
          success: false,
          recordId: null,
          message: errorMsg,
          rawResponse: responseJson
        };
      }

      // Extract official CRM Record ID returned by Sangam CRM
      const returnedId =
        responseJson.response_data?.id ||
        responseJson.id ||
        responseJson.data?.id ||
        `SGM-ACC-${Date.now()}`;

      console.log(`[SangamCRM] Successfully synced company "${fieldList.name}". Record ID: ${returnedId}`);

      return {
        success: true,
        recordId: String(returnedId),
        message: responseJson.message || 'Data Inserted Successfully',
        rawResponse: responseJson
      };
    } catch (err) {
      clearTimeout(timeout);
      const isTimeout = err.name === 'AbortError';
      const errorMessage = isTimeout
        ? 'Sangam CRM API connection timed out after 12 seconds.'
        : `Network error connecting to Sangam CRM: ${err.message}`;

      console.error('[SangamCRM] Exception occurred during sync:', errorMessage);

      return {
        success: false,
        recordId: null,
        message: errorMessage,
        rawResponse: null
      };
    }
  }

  /**
   * Helper to build direct URL to the company in Sangam CRM web interface
   */
  getCompanyWebUrl(recordId) {
    if (!recordId) return `${this.crmUrl.replace(/\/+$/, '')}/accounts`;
    return `${this.crmUrl.replace(/\/+$/, '')}/accounts/${encodeURIComponent(recordId)}`;
  }

  /**
   * Format contract data into exact supported Sangam CRM Contract fields
   */
  mapContractData(contract) {
    const contractName = contract.name || contract.contractName || 'NISPL Cloud Services Agreement';
    
    // Status normalization: 'Active', 'InActive', 'NotStarted'
    let status = 'Active';
    const rawStatus = (contract.status || '').toLowerCase();
    if (rawStatus === 'active') {
      status = 'Active';
    } else if (rawStatus === 'inactive' || rawStatus === 'closed' || rawStatus === 'expired') {
      status = 'InActive';
    } else if (rawStatus === 'draft' || rawStatus === 'in_progress' || rawStatus === 'pending') {
      status = 'NotStarted';
    }

    // Subscription Period mapping: '1', '2', '3', '6', '12', '24', '36'
    let subPeriod = '12';
    const rawPeriod = String(contract.subscriptionPeriod || contract.period || '').toLowerCase();
    if (rawPeriod.includes('1 month') || rawPeriod === '1') subPeriod = '1';
    else if (rawPeriod.includes('2 month') || rawPeriod === '2') subPeriod = '2';
    else if (rawPeriod.includes('3 month') || rawPeriod === '3') subPeriod = '3';
    else if (rawPeriod.includes('6 month') || rawPeriod === '6') subPeriod = '6';
    else if (rawPeriod.includes('1 year') || rawPeriod.includes('12 month') || rawPeriod === '12') subPeriod = '12';
    else if (rawPeriod.includes('2 year') || rawPeriod.includes('24 month') || rawPeriod === '24') subPeriod = '24';
    else if (rawPeriod.includes('3 year') || rawPeriod.includes('36 month') || rawPeriod === '36') subPeriod = '36';

    // Contract Type: 'Subscription' or 'AMC'
    let contractType = 'Subscription';
    if (String(contract.contractType || '').toUpperCase() === 'AMC') {
      contractType = 'AMC';
    }

    // Product Category / Sub-category: 'Software', 'Service', 'Hardware'
    let productSubCategory = 'Software';
    const rawCat = (contract.productCategory || contract.product_sub_category || contract.service || '').toLowerCase();
    if (rawCat.includes('service') || rawCat.includes('support')) productSubCategory = 'Service';
    else if (rawCat.includes('hardware') || rawCat.includes('device')) productSubCategory = 'Hardware';
    else productSubCategory = 'Software';

    // Value cleaning
    let numVal = 0;
    if (contract.totalContractValue !== undefined && contract.totalContractValue !== null) {
      const clean = String(contract.totalContractValue).replace(/[^0-9.]/g, '');
      numVal = parseFloat(clean) || 0;
    } else if (contract.value !== undefined && contract.value !== null) {
      const clean = String(contract.value).replace(/[^0-9.]/g, '');
      numVal = parseFloat(clean) || 0;
    }

    // Date formatting (YYYY-MM-DD)
    const formatDate = (d) => {
      if (!d) return null;
      try {
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return null;
        return dt.toISOString().split('T')[0];
      } catch (e) {
        return null;
      }
    };

    const startDate = formatDate(contract.startDate) || new Date().toISOString().split('T')[0];
    let endDate = formatDate(contract.endDate || contract.expiryDate);
    if (!endDate) {
      const endDt = new Date(startDate);
      const months = parseInt(subPeriod, 10) || 12;
      endDt.setMonth(endDt.getMonth() + months);
      endDate = endDt.toISOString().split('T')[0];
    }

    const fields = {
      name: contractName,
      status: status,
      contract_type: contractType,
      subscription_period: subPeriod,
      product_sub_category: productSubCategory,
      total_contract_value: numVal,
      start_date: startDate,
      end_date: endDate,
      assigned_user_id: '2'
    };

    if (contract.description || contract.detailedSummary) {
      fields.description = contract.description || contract.detailedSummary;
    }

    // If an account_id (Sangam CRM Account UUID) is provided or found
    if (contract.accountId || contract.account_id) {
      const accId = contract.accountId || contract.account_id;
      fields.account_id = accId;
      fields.parent_id = accId;
      fields.parent_type = 'Accounts';
      fields.accounts = [accId];
    }

    if (contract.opportunityId || contract.opportunity_id) {
      fields.opportunity_id = contract.opportunityId || contract.opportunity_id;
    }

    return fields;
  }

  /**
   * Create or Update a Contract in Sangam CRM
   * @param {Object} contract - Contract object from local database/form
   * @returns {Promise<{success: boolean, recordId: string, message: string, rawResponse: any}>}
   */
  async createOrUpdateContract(contract) {
    const endpoint = `${this.apiBase.replace(/\/+$/, '')}/save-data`;
    const fieldList = this.mapContractData(contract);

    // If an Account ID exists and no Opportunity ID was supplied, create an Opportunity
    // so Sangam CRM links and displays Account Name across all views
    if (fieldList.account_id && !fieldList.opportunity_id) {
      try {
        const oppPayload = {
          module_name: 'Opportunity',
          field_name_list: {
            name: `${fieldList.name}`,
            account_id: fieldList.account_id,
            amount: fieldList.total_contract_value || 0,
            sales_stage: 'Closed Won',
            assigned_user_id: '2'
          }
        };
        const oppRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify(oppPayload)
        });
        const oppJson = await oppRes.json();
        if (oppJson?.response_data?.id) {
          fieldList.opportunity_id = oppJson.response_data.id;
          console.log(`[SangamCRM] Successfully linked Opportunity (${oppJson.response_data.id}) to Account (${fieldList.account_id})`);
        }
      } catch (oppErr) {
        console.warn('[SangamCRM] Could not pre-create Opportunity for contract:', oppErr.message);
      }
    }

    // If existing Sangam CRM Record ID is stored, pass attach.id to update
    const existingId = contract.sangamCrm?.recordId;
    if (existingId && !existingId.startsWith('SGM-CTR-') && existingId.length > 10) {
      fieldList.attach = { id: existingId };
    }

    const payload = {
      module_name: 'Contract',
      field_name_list: fieldList
    };

    // Official Sangam CRM relationship attachment via related_models (account_contract & opportunity_contract)
    const targetAccountId = contract.accountId || contract.account_id || fieldList.account_id;
    if (targetAccountId) {
      const attachItem = { id: targetAccountId };
      if (contract.email) attachItem.email = contract.email;
      if (contract.phone) attachItem.phone = contract.phone;

      const relGroup = {
        account_contract: [
          {
            attach: [attachItem],
            data: []
          }
        ]
      };

      if (fieldList.opportunity_id) {
        relGroup.opportunity_contract = [
          {
            attach: [{ id: fieldList.opportunity_id }],
            data: []
          }
        ];
      }

      payload.related_models = [relGroup];
      console.log(`[SangamCRM] Attaching related_models account_contract with Account ID: ${targetAccountId}`);
    }

    console.log(`[SangamCRM] Dispatching Contract save for: "${fieldList.name}" [Type: ${fieldList.contract_type}, Status: ${fieldList.status}]`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const responseText = await response.text();
      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(`Sangam CRM returned non-JSON response (HTTP ${response.status}): ${responseText.substring(0, 180)}`);
      }

      if (!response.ok || (responseJson.status && responseJson.status !== 200)) {
        const errorMsg = responseJson.message || responseJson.error_message || `HTTP ${response.status} Error`;
        console.error(`[SangamCRM] Contract API Failure (${response.status}):`, errorMsg);
        return {
          success: false,
          recordId: null,
          message: errorMsg,
          rawResponse: responseJson
        };
      }

      // Extract official CRM Record ID returned by Sangam CRM
      const returnedId =
        responseJson.response_data?.id ||
        responseJson.id ||
        responseJson.data?.id ||
        `SGM-CTR-${Date.now()}`;

      console.log(`[SangamCRM] Successfully synced Contract "${fieldList.name}". Record ID: ${returnedId}`);

      // Post-attach Contract to Account & Opportunity to ensure two-way relationship in Sangam CRM database
      if (returnedId && targetAccountId && !returnedId.startsWith('SGM-CTR-')) {
        try {
          await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              module_name: 'Account',
              field_name_list: { attach: { id: targetAccountId } },
              related_models: [
                {
                  account_contract: [{ attach: [{ id: returnedId }], data: [] }]
                }
              ]
            })
          });
          console.log(`[SangamCRM] Successfully attached Contract (${returnedId}) to Account (${targetAccountId})`);
        } catch (accAttachErr) {
          console.warn('[SangamCRM] Post-attach to Account warning:', accAttachErr.message);
        }

        if (fieldList.opportunity_id) {
          try {
            await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.token}`
              },
              body: JSON.stringify({
                module_name: 'Opportunity',
                field_name_list: { attach: { id: fieldList.opportunity_id } },
                related_models: [
                  {
                    opportunity_contract: [{ attach: [{ id: returnedId }], data: [] }]
                  }
                ]
              })
            });
            console.log(`[SangamCRM] Successfully attached Contract (${returnedId}) to Opportunity (${fieldList.opportunity_id})`);
          } catch (oppAttachErr) {
            console.warn('[SangamCRM] Post-attach to Opportunity warning:', oppAttachErr.message);
          }
        }
      }

      return {
        success: true,
        recordId: String(returnedId),
        message: responseJson.message || 'Contract Data Inserted Successfully',
        rawResponse: responseJson
      };
    } catch (err) {
      clearTimeout(timeout);
      const isTimeout = err.name === 'AbortError';
      const errorMessage = isTimeout
        ? 'Sangam CRM API connection timed out after 12 seconds.'
        : `Network error connecting to Sangam CRM: ${err.message}`;

      console.error('[SangamCRM] Exception occurred during Contract sync:', errorMessage);

      return {
        success: false,
        recordId: null,
        message: errorMessage,
        rawResponse: null
      };
    }
  }

  /**
   * Helper to build direct URL to the contract in Sangam CRM web interface
   */
  getContractWebUrl(recordId) {
    if (!recordId) return `${this.crmUrl.replace(/\/+$/, '')}/contracts`;
    return `${this.crmUrl.replace(/\/+$/, '')}/contracts/${encodeURIComponent(recordId)}`;
  }
}

export const sangamCrmService = new SangamCrmService();

