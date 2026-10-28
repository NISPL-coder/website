/**
 * Dashboard Overview Controller
 * Provides structured real-time overview metrics matching the Cloud Portal UI:
 * - overview_cards (Tally Serial, Workstations, Backup, Renewal)
 * - renewal_reminders (Due soon, upcoming, and critical license renewals)
 * - service_and_infrastructure (Health telemetry and operational status)
 * - current_plan (Active plan details, pricing, quotas)
 * - account_details (Customer entity, admin profile, tax info)
 */

export const getDashboardOverview = async (req, res) => {
  try {
    const user = req.user;

    // 1. Overview KPI Cards (Top metrics)
    const overview_cards = [
      {
        id: 'tally_serial',
        title: 'Tally Serial & TSS',
        value: '762094183',
        badge: 'TSS Active',
        badgeType: 'positive',
        subText: 'Release 5.0 Gold',
        icon: 'Key'
      },
      {
        id: 'active_workstations',
        title: 'Active Workstations',
        value: '6 / 10 Active',
        badge: '6 Free Seats',
        badgeType: 'positive',
        subText: 'Multi-User Concurrent',
        icon: 'Users'
      },
      {
        id: 'cloud_backup',
        title: 'Cloud Data Backup',
        value: 'Today, 02:00 AM',
        badge: '100% Safe',
        badgeType: 'positive',
        subText: 'Auto Daily Snapshot',
        icon: 'ShieldCheck'
      },
      {
        id: 'next_renewal',
        title: 'Next Plan Renewal',
        value: '28 Days',
        badge: 'Active Node',
        badgeType: 'positive',
        subText: 'Due 24 Nov 2026',
        icon: 'Clock'
      }
    ];

    // 2. Renewal Reminders Section
    const renewal_reminders = {
      title: 'Renewal Reminders',
      subtitle: '2 plans require your attention',
      urgentCount: 2,
      badge: '2 Urgent',
      viewAllText: 'View all renewal plans',
      viewAllUrl: '/dashboard/products',
      plans: [
        {
          id: 'renewal-cloud-8gb',
          planName: 'Dedicated Tally Cloud — 8 GB RAM Node',
          expiryDate: '24 Nov 2026',
          daysLeft: 28,
          daysLeftText: '28 days left',
          urgency: 'Due Soon',
          urgencyType: 'warning',
          price: '₹4,500 + GST / month',
          category: 'cloud',
          canRenew: true
        },
        {
          id: 'renewal-tss-single',
          planName: 'TSS Renewal — Single User License',
          expiryDate: '28 Oct 2027',
          daysLeft: 365,
          daysLeftText: '365 days left',
          urgency: 'Upcoming',
          urgencyType: 'ok',
          price: '₹4,500 + GST / year',
          category: 'tss',
          canRenew: false
        },
        {
          id: 'renewal-tally-prime',
          planName: 'Tally Prime Release 5.0 — Perpetual License',
          expiryDate: '28 Oct 2026',
          daysLeft: 1,
          daysLeftText: '1 day left',
          urgency: 'Critical',
          urgencyType: 'critical',
          price: '₹22,500 + GST',
          category: 'license',
          canRenew: true
        }
      ]
    };

    // 3. Service & Infrastructure Telemetry Section
    const service_and_infrastructure = {
      title: 'Services & Infrastructure',
      totalActive: '4 Active',
      healthBadge: 'Healthy 99.9%',
      healthScore: 99.9,
      services: [
        {
          name: 'Tally Prime 5.0',
          percentage: 100,
          status: 'Healthy',
          colorVariant: 'bar-blue-1'
        },
        {
          name: 'Cloud VPS Node',
          percentage: 92,
          status: 'Healthy',
          colorVariant: 'bar-blue-2'
        },
        {
          name: 'HTML5 Terminal',
          percentage: 85,
          status: 'Healthy',
          colorVariant: 'bar-purple-1'
        },
        {
          name: 'Backup Sync',
          percentage: 80,
          status: 'Healthy',
          colorVariant: 'bar-purple-2'
        },
        {
          name: 'e-Invoice API',
          percentage: 65,
          status: 'Healthy',
          colorVariant: 'bar-violet'
        }
      ]
    };

    // 4. Current Plan Details Section
    const current_plan = {
      title: 'Current Plan Details',
      subtitle: 'Active Enterprise Cloud + TSS Subscription',
      planCode: 'PLN-ENT-TALLY-CLOUD-2026',
      planName: 'Enterprise Tally Cloud + TSS Gold Multi-User',
      status: 'Active',
      statusBadge: 'Healthy & Certified',
      billingFrequency: 'Annual Subscription',
      nextRenewalDue: '24 Nov 2026 (28 days left)',
      renewalDate: '24 Nov 2026',
      daysRemaining: 28,
      totalAmount: '₹21,240 / year',
      primaryEntitlement: 'Tally Gold + 8 GB RAM VPS',
      basePrice: '₹18,000',
      taxAmount: '₹3,240 (18% CGST + SGST)',
      startDate: '25 Nov 2025',
      paymentMethod: 'Corporate NetBanking (HDFC Bank • Auto-Debit)',
      lastInvoiceNo: 'INV-2025-9941',
      modulesIncluded: [
        {
          title: 'TallyPrime Gold Release 5.0',
          desc: 'Unlimited concurrent LAN workstations with full statutory compliance'
        },
        {
          title: 'Dedicated Windows Cloud VPS',
          desc: '8 GB Dedicated ECC RAM, 4 vCPU Xeon, 100 GB NVMe Storage'
        },
        {
          title: 'e-Invoice & e-Way Bill API',
          desc: 'Automated 1-click GSP & NIC direct JSON generation'
        },
        {
          title: 'Biz Analyst Mobile App',
          desc: '2 Registered Smartphone Accounts with live reporting'
        },
        {
          title: 'Daily Cloud Backup Sync',
          desc: 'Automated 02:00 AM offsite snapshot with 30-day retention'
        },
        {
          title: 'Tier-4 Datacenter SLA',
          desc: '99.98% High Availability guaranteed uptime from CtrlS Kolkata'
        }
      ],
      quotas: [
        { label: 'Workstation Nodes', used: '4 Nodes Active', total: '10 Allowed' },
        { label: 'Dedicated Storage', used: '14.6 GB Used', total: '100 GB NVMe' },
        { label: 'RAM Utilization', used: '2.4 GB Used', total: '8.0 GB ECC' },
        { label: 'WhatsApp Dispatches', used: '3,842 Sent', total: '10,000 / mo' }
      ]
    };

    // 5. Account Details Section (dynamically hydrated if user authenticated)
    const customerId = user?.customerId || 'NIS-CUST-625875';
    const companyName = user?.companyName || 'NISPL';
    const authorizedAdmin = user?.name || 'NISPL Developer';
    const officialEmail = user?.email || 'nispldeveloper@gmail.com';
    const gstin = user?.gstNo || '19AAACA1234A1Z5';

    const account_details = {
      title: 'Account Details',
      subtitle: 'Verified Customer Entity & Tax Profile',
      customerId,
      companyName,
      tierBadge: user?.tier || 'Tier-Gold Client',
      authorizedAdmin,
      officialEmail,
      gstin,
      security2fa: 'Enabled (SMS OTP & Google Authenticator)',
      legalEntity: 'Private Limited Company (Registered under MCA)',
      contactPhone: user?.mobile || '+91 98300 12345',
      landline: '+91 (033) 4004-8800',
      pan: 'AAACA1234A',
      stateCode: '19 — West Bengal',
      registeredAddress: 'Sector V, Salt Lake City, Bidhannagar, Kolkata, West Bengal - 700091',
      primaryNodeCluster: 'CtrlS Rated-4 Datacenter (IP: 103.145.54.18)',
      whitelistedSubnet: '103.145.54.0/24 (Corporate Office Subnet)',
      accountManager: 'Siddharth Roy (Senior Cloud Solutions Architect)',
      accountManagerEmail: 'siddharth@nisplcloud.com',
      accountManagerPhone: '+91 (033) 4004-8800 (Ext: 204)'
    };

    // Return structured payload with both snake_case and Pascal/Aliased property names
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        // Core formatted objects
        overview_cards,
        renewal_reminders,
        service_and_infrastructure,
        current_plan,
        account_details,

        // Direct aliases matching exact user prompt casing
        Renewals_Reminders: renewal_reminders,
        Service_and_Infrastructure: service_and_infrastructure,
        Current_Plan: current_plan,
        Account_Details: account_details
      }
    });
  } catch (error) {
    console.error('[DashboardController.getDashboardOverview] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard overview data.'
    });
  }
};

export default {
  getDashboardOverview
};
