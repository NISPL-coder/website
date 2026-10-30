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
}

export const sangamCrmService = new SangamCrmService();

