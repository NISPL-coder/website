import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collection = {
  info: {
    _postman_id: "nispl-backend-api-v3-collection",
    name: "NISPL Cloud Tech - Structured API Collection",
    description: "Structured Postman API Collection for Net Infotech System (NISPL) Enterprise Platform.\nOrganized into dedicated personas: Admin Portal, Customer Portal, and System & Health services.\nAll endpoints are verified against active frontend services and backend routes.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  auth: {
    type: "bearer",
    bearer: [
      {
        key: "token",
        value: "{{accessToken}}",
        type: "string"
      }
    ]
  },
  variable: [
    {
      key: "baseUrl",
      value: "http://localhost:4000",
      type: "string",
      description: "Base API Server URL (http://localhost:4000 or production https://website-ebxf.onrender.com)"
    },
    {
      key: "accessToken",
      value: "",
      type: "string",
      description: "JWT Bearer Access Token (automatically populated after Admin or Customer login)"
    },
    {
      key: "adminToken",
      value: "",
      type: "string",
      description: "Admin JWT Bearer Access Token"
    },
    {
      key: "customerToken",
      value: "",
      type: "string",
      description: "Customer JWT Bearer Access Token"
    },
    {
      key: "customerEmail",
      value: "demo@gmail.com",
      type: "string",
      description: "Authenticated customer email used for scoping customer queries"
    },
    {
      key: "sessionId",
      value: "cart_session_nispl_demo_01",
      type: "string",
      description: "Client session identifier for Cart operations"
    },
    {
      key: "customerId",
      value: "CUST-9679",
      type: "string",
      description: "Active customer record identifier or Mongo ID"
    },
    {
      key: "contractId",
      value: "CTR-2026-8829",
      type: "string",
      description: "Active contract agreement identifier or Mongo ID"
    },
    {
      key: "paymentId",
      value: "PAY-2026-8808",
      type: "string",
      description: "Payment / invoice identifier or Mongo ID"
    },
    {
      key: "productId",
      value: "ctrls-1-user",
      type: "string",
      description: "Product catalog SKU or ID"
    },
    {
      key: "staffId",
      value: "",
      type: "string",
      description: "Staff account MongoDB ObjectId"
    },
    {
      key: "notificationId",
      value: "",
      type: "string",
      description: "Notification MongoDB ObjectId"
    },
    {
      key: "activityLogId",
      value: "",
      type: "string",
      description: "Activity log entry identifier"
    }
  ],
  item: [
    // =========================================================================
    // TOP-LEVEL FOLDER: ADMIN
    // =========================================================================
    {
      name: "Admin",
      description: "All backend APIs supporting the NISPL Admin Portal, Staff Backoffice, and Operations Management.",
      item: [
        // -------------------------------------------------------------
        // ADMIN SUBFOLDER 1: Authentication & Onboarding
        // -------------------------------------------------------------
        {
          name: "1. Authentication & Onboarding",
          description: "Admin initial onboarding, OTP verification, login, profile inspection, and session management.",
          item: [
            {
              name: "Get Admin Config & Existence Check",
              request: {
                auth: { type: "noauth" },
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/admin-config",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "admin-config"]
                },
                description: "Checks whether a primary administrator has already been provisioned and returns the configured admin email."
              }
            },
            {
              name: "Send Admin Onboarding OTP",
              request: {
                auth: { type: "noauth" },
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: { mode: "raw", raw: "{}" },
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/admin/send-otp",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "admin", "send-otp"]
                },
                description: "Dispatches a 6-digit one-time verification password to the configured administrator inbox."
              }
            },
            {
              name: "Verify OTP & Provision Admin",
              request: {
                auth: { type: "noauth" },
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    name: "Debasish Chakraborty",
                    designation: "Primary Admin",
                    password: "AdminSecurePassword123!",
                    otp: "123456"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/admin/verify-and-create",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "admin", "verify-and-create"]
                },
                description: "Verifies admin OTP and registers the primary administrator."
              }
            },
            {
              name: "Admin Login",
              event: [
                {
                  listen: "test",
                  script: {
                    type: "text/javascript",
                    exec: [
                      "const response = pm.response.json();",
                      "if (response.accessToken) {",
                      "    pm.collectionVariables.set(\"accessToken\", response.accessToken);",
                      "    pm.collectionVariables.set(\"adminToken\", response.accessToken);",
                      "    console.log(\"[Auth] Admin accessToken saved successfully.\");",
                      "}"
                    ]
                  }
                }
              ],
              request: {
                auth: { type: "noauth" },
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    email: "nispldeveloper@gmail.com",
                    password: "AdminSecurePassword123!",
                    portal: "admin"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/login",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "login"]
                },
                description: "Authenticates an administrator with portal claim verification and returns a signed JWT."
              }
            },
            {
              name: "Get Current Admin Profile (/me)",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/me",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "me"]
                },
                description: "Returns the authenticated administrator's role, permissions, and session profile."
              }
            },
            {
              name: "Change Admin Password",
              request: {
                method: "PATCH",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    currentPassword: "AdminSecurePassword123!",
                    newPassword: "NewAdminSecurePassword456!"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/users/me/password",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "users", "me", "password"]
                },
                description: "Changes the authenticated user password and invalidates active session tokens."
              }
            },
            {
              name: "Refresh Admin Token",
              event: [
                {
                  listen: "test",
                  script: {
                    type: "text/javascript",
                    exec: [
                      "const response = pm.response.json();",
                      "if (response.accessToken) {",
                      "    pm.collectionVariables.set(\"accessToken\", response.accessToken);",
                      "    pm.collectionVariables.set(\"adminToken\", response.accessToken);",
                      "}"
                    ]
                  }
                }
              ],
              request: {
                method: "POST",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/refresh",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "refresh"]
                },
                description: "Refreshes the current access token."
              }
            },
            {
              name: "Admin Logout",
              request: {
                method: "POST",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/logout",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "logout"]
                },
                description: "Clears session cookies and revokes refresh tokens."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // ADMIN SUBFOLDER 2: Customer Management
        // -------------------------------------------------------------
        {
          name: "2. Customer Management",
          description: "Customer directories, Sangam CRM synchronization, demo trial extensions, and bulk CSV ingestion.",
          item: [
            {
              name: "List Customers & Summary Stats",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/customers",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "customers"]
                },
                description: "Retrieves complete customers roster with active contracts count, pending payments, and Sangam sync states."
              }
            },
            {
              name: "Create Customer & Auto-Sync Sangam CRM",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    name: "Apex Global Infotech",
                    email: "ops@apexinfotech.in",
                    phone: "+91 98302 44556",
                    company: "Apex Global Infotech Pvt Ltd",
                    address: "Block EP & GP, Sector V, Salt Lake",
                    city: "Kolkata",
                    state: "West Bengal",
                    pincode: "700091",
                    gstNo: "19AAACT5566K1Z9",
                    status: "Active"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/customers",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "customers"]
                },
                description: "Creates a customer in MongoDB and triggers background synchronization with Sangam CRM."
              }
            },
            {
              name: "Update Customer Record",
              request: {
                method: "PUT",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    phone: "+91 98302 99887",
                    city: "Kolkata",
                    state: "West Bengal",
                    status: "Active"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/customers/{{customerId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "customers", "{{customerId}}"]
                },
                description: "Updates customer profile details and contact information."
              }
            },
            {
              name: "Authorize Customer Demo Trial Extension",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    additionalDays: 7
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/customers/{{customerId}}/allow-demo-extension",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "customers", "{{customerId}}", "allow-demo-extension"]
                },
                description: "Admin action to permit an additional trial extension for a customer who has already used their one-time demo plan."
              }
            },
            {
              name: "Retry / Trigger Sangam CRM Sync",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: { mode: "raw", raw: "{}" },
                url: {
                  raw: "{{baseUrl}}/api/v1/customers/{{customerId}}/sync",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "customers", "{{customerId}}", "sync"]
                },
                description: "Re-triggers CRM Account and Contact push to Sangam CRM API."
              }
            },
            {
              name: "Bulk Import Companies from CSV",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    companies: [
                      {
                        companyName: "Eastern Alloys Corp",
                        email: "accounts@easternalloys.in",
                        phone: "+91 98310 99881",
                        city: "Durgapur",
                        state: "West Bengal"
                      }
                    ]
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/customers/import-companies",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "customers", "import-companies"]
                },
                description: "CSV import endpoint consumed by Admin Import CSV Data Tool."
              }
            },
            {
              name: "Bulk Import Contacts from CSV",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    contacts: [
                      {
                        contactName: "Sourav Ganguly",
                        email: "sourav@easternalloys.in",
                        phone: "+91 98310 99882",
                        companyName: "Eastern Alloys Corp"
                      }
                    ]
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/customers/import-contacts",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "customers", "import-contacts"]
                },
                description: "CSV contact importer consumed by Admin Data Tools."
              }
            },
            {
              name: "Delete Customer Record",
              request: {
                method: "DELETE",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/customers/{{customerId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "customers", "{{customerId}}"]
                },
                description: "Deletes a customer account from the MongoDB database."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // ADMIN SUBFOLDER 3: Contract Management
        // -------------------------------------------------------------
        {
          name: "3. Contract Management",
          description: "Service agreements, subscription terms, duration tracking, and Sangam contract synchronization.",
          item: [
            {
              name: "List Contracts with Sangam Status",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/contracts",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "contracts"]
                },
                description: "Fetches contracts across customers with real-time Sangam contract sync indicators."
              }
            },
            {
              name: "Create Contract & Sync to Sangam CRM",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    customer: "Apex Global Infotech",
                    customerEmail: "ops@apexinfotech.in",
                    productCategory: "Cloud",
                    planName: "CtrlS 1 User (2 Core / 3 GB / 50 GB)",
                    contractType: "Standard",
                    duration: "1 Year",
                    startDate: "2026-11-05",
                    endDate: "2027-11-04",
                    amount: 6000,
                    billingFrequency: "Annually",
                    status: "Active",
                    salesPerson: "Debasish Chakraborty"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/contracts",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "contracts"]
                },
                description: "Provisions a contract and initiates asynchronous synchronization to Sangam CRM Contracts module."
              }
            },
            {
              name: "Update Contract Agreement",
              request: {
                method: "PUT",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    status: "Active",
                    amount: 6000,
                    notes: "Annual renewal contract"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/contracts/{{contractId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "contracts", "{{contractId}}"]
                },
                description: "Updates existing contract pricing, duration, or lifecycle state."
              }
            },
            {
              name: "Retry / Trigger Sangam Contract Sync",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: { mode: "raw", raw: "{}" },
                url: {
                  raw: "{{baseUrl}}/api/v1/contracts/{{contractId}}/sync",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "contracts", "{{contractId}}", "sync"]
                },
                description: "Retries pushing contract payload into Sangam CRM."
              }
            },
            {
              name: "Delete Contract",
              request: {
                method: "DELETE",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/contracts/{{contractId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "contracts", "{{contractId}}"]
                },
                description: "Deletes a contract record from MongoDB."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // ADMIN SUBFOLDER 4: Payment Management
        // -------------------------------------------------------------
        {
          name: "4. Payment Management",
          description: "Invoicing, receipt tracking, clearance confirmations, and accounts reconciliation.",
          item: [
            {
              name: "List All Payments & Invoices",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/payments",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "payments"]
                },
                description: "Returns receipts and clearance ledgers."
              }
            },
            {
              name: "Record New Payment / Receipt",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    customerId: "{{customerId}}",
                    customerName: "Apex Global Infotech",
                    customerEmail: "ops@apexinfotech.in",
                    contractId: "{{contractId}}",
                    amount: 6000,
                    paymentMode: "NEFT / RTGS",
                    referenceNo: "NEFT-HDFC-991823",
                    status: "Completed",
                    notes: "Annual cloud server hosting advance payment"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/payments",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "payments"]
                },
                description: "Creates an accounts ledger payment entry and dispatches audit notification."
              }
            },
            {
              name: "Update Payment / Clearance Status",
              request: {
                method: "PUT",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    status: "Completed",
                    clearanceDate: "2026-11-05",
                    notes: "Cheque cleared via ICICI Bank"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/payments/{{paymentId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "payments", "{{paymentId}}"]
                },
                description: "Updates reconciliation status on an invoice payment."
              }
            },
            {
              name: "Delete Payment Record",
              request: {
                method: "DELETE",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/payments/{{paymentId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "payments", "{{paymentId}}"]
                },
                description: "Deletes a payment record from the database."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // ADMIN SUBFOLDER 5: Product Management
        // -------------------------------------------------------------
        {
          name: "5. Product Management",
          description: "CtrlS Kolkata Tier-4 cloud nodes, dynamic pricing tiers, demo plans, and catalog availability.",
          item: [
            {
              name: "List Products Catalog",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/products?category=Cloud%20Hosting&provider=ctrls-cloud",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "products"],
                  query: [
                    { key: "category", value: "Cloud Hosting" },
                    { key: "provider", value: "ctrls-cloud" }
                  ]
                },
                description: "Direct dynamic database query returning active cloud nodes and demo tiers."
              }
            },
            {
              name: "Create Product / Custom Plan / Demo Plan",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    name: "CtrlS 1 User Demo (2 Core / 3 GB / 50 GB)",
                    sku: "ctrls-demo-1u",
                    category: "Trial",
                    provider: "ctrls-cloud",
                    description: "7-day complimentary trial node with 2 vCPU, 3 GB RAM, 50 GB SSD storage.",
                    price: 0,
                    currency: "INR",
                    billingCycle: "trial",
                    trialDuration: "7 Days",
                    isDemoPlan: true,
                    available: true,
                    specs: {
                      cores: "2 core",
                      ram: "3 GB",
                      storage: "50 GB SSD",
                      ip: "103.115.220.41",
                      users: "1 User"
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/products",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "products"]
                },
                description: "Creates and saves a standard, custom, or demo plan dynamically into MongoDB."
              }
            },
            {
              name: "Update Catalog Product",
              request: {
                method: "PUT",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    name: "CtrlS 1 User Enterprise Node",
                    price: 500,
                    available: true
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/products/{{productId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "products", "{{productId}}"]
                },
                description: "Updates an existing product's specs, pricing, or name."
              }
            },
            {
              name: "Toggle Product Live Availability",
              request: {
                method: "PATCH",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    available: true
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/products/{{productId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "products", "{{productId}}"]
                },
                description: "Switches live customer portal availability for the specified product node."
              }
            },
            {
              name: "Delete Catalog Product",
              request: {
                method: "DELETE",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/products/{{productId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "products", "{{productId}}"]
                },
                description: "Removes a product or custom pricing plan from the catalog."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // ADMIN SUBFOLDER 6: Staff & Access Control (RBAC)
        // -------------------------------------------------------------
        {
          name: "6. Staff & Access Control (RBAC)",
          description: "Internal staff directory, granular permissions matrix, and role assignment.",
          item: [
            {
              name: "List Staff & Access Permissions",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/staff",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "staff"]
                },
                description: "Lists staff members, operational roles, and column view/edit privileges."
              }
            },
            {
              name: "Create Staff Member",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    name: "Ananya Sharma",
                    email: "ananya@nispl.co.in",
                    phone: "+91 98305 67890",
                    role: "Sales",
                    password: "StaffSecurePassword123!",
                    permissions: {
                      customer: { view: true, create: true, edit: true, delete: false },
                      contract: { view: true, create: true, edit: false, delete: false },
                      payment: { view: true, create: false, edit: false, delete: false },
                      product: { view: true, create: false, edit: false, delete: false },
                      activityLog: { view: false, create: false, edit: false, delete: false }
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/staff",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "staff"]
                },
                description: "Provisions a new staff user with granular module permissions."
              }
            },
            {
              name: "Toggle Staff Account Status",
              request: {
                method: "PATCH",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    status: "Active"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/staff/{{staffId}}/status",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "staff", "{{staffId}}", "status"]
                },
                description: "Activates or deactivates a staff member's login access."
              }
            },
            {
              name: "Update Staff Permissions & Role",
              request: {
                method: "PATCH",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    role: "Manager",
                    permissions: {
                      customer: { view: true, create: true, edit: true, delete: true },
                      contract: { view: true, create: true, edit: true, delete: false }
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/staff/{{staffId}}/permissions",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "staff", "{{staffId}}", "permissions"]
                },
                description: "Updates RBAC permissions for a staff member."
              }
            },
            {
              name: "Delete Staff Member",
              request: {
                method: "DELETE",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/staff/{{staffId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "staff", "{{staffId}}"]
                },
                description: "Removes a staff member account."
              }
            },
            {
              name: "Get RBAC Column Registry",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/permissions/columns",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "permissions", "columns"]
                },
                description: "Returns schema field registry for granular role-based UI access control."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // ADMIN SUBFOLDER 7: Activity Logs & Audit Trail
        // -------------------------------------------------------------
        {
          name: "7. Activity Logs & Audit Trail",
          description: "Administrative audit trail, forensic mutation logs, and search filters.",
          item: [
            {
              name: "List Activity Logs (Paginated & Filterable)",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/activity-logs?page=1&limit=25&category=all&search=",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "activity-logs"],
                  query: [
                    { key: "page", value: "1" },
                    { key: "limit", value: "25" },
                    { key: "category", value: "all" },
                    { key: "search", value: "" }
                  ]
                },
                description: "Queries administrative activity audit trail with optional category, actor, and date filters."
              }
            },
            {
              name: "Get Single Activity Log by ID",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/activity-logs/{{activityLogId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "activity-logs", "{{activityLogId}}"]
                },
                description: "Fetches full metadata and payload snapshot for a specific audit log entry."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // ADMIN SUBFOLDER 8: Notifications Center
        // -------------------------------------------------------------
        {
          name: "8. Notifications Center",
          description: "Admin alert broadcasts, operational notifications, and bulk clearance.",
          item: [
            {
              name: "List Notifications Stream",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/notifications",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "notifications"]
                },
                description: "Fetches operational alerts and system notifications."
              }
            },
            {
              name: "Get Notification Statistics",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/notifications/stats",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "notifications", "stats"]
                },
                description: "Returns unread counts and severity breakdown."
              }
            },
            {
              name: "Mark Notification as Read",
              request: {
                method: "PATCH",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/notifications/{{notificationId}}/read",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "notifications", "{{notificationId}}", "read"]
                },
                description: "Marks a specific notification alert as read."
              }
            },
            {
              name: "Mark All Notifications as Read",
              request: {
                method: "PATCH",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/notifications/read-all",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "notifications", "read-all"]
                },
                description: "Batch updates all unread alerts to read."
              }
            },
            {
              name: "Delete Notification",
              request: {
                method: "DELETE",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/notifications/{{notificationId}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "notifications", "{{notificationId}}"]
                },
                description: "Deletes a single notification alert."
              }
            },
            {
              name: "Clear All Notifications",
              request: {
                method: "DELETE",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/notifications",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "notifications"]
                },
                description: "Purges notification inbox."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // ADMIN SUBFOLDER 9: Dashboard Analytics
        // -------------------------------------------------------------
        {
          name: "9. Dashboard Analytics",
          description: "Executive KPIs, revenue telemetry, contract breakdown, and customer health metrics.",
          item: [
            {
              name: "Admin Dashboard Executive Overview",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/dashboard/overview?period=monthly&fy=2026-2027",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "dashboard", "overview"],
                  query: [
                    { key: "period", value: "monthly" },
                    { key: "fy", value: "2026-2027" }
                  ]
                },
                description: "Powers the primary Admin Dashboard cards, graphs, and contract status summaries."
              }
            }
          ]
        }
      ]
    },

    // =========================================================================
    // TOP-LEVEL FOLDER: CUSTOMER
    // =========================================================================
    {
      name: "Customer",
      description: "All endpoints consumed by the Customer Portal, Cloud Server Dashboard, Cart Checkout, and Client Self-Service.",
      item: [
        // -------------------------------------------------------------
        // CUSTOMER SUBFOLDER 1: Authentication & Account
        // -------------------------------------------------------------
        {
          name: "1. Authentication & Account",
          description: "Customer onboarding, self-registration, client login, password recovery, and session profile.",
          item: [
            {
              name: "Customer Self-Registration",
              event: [
                {
                  listen: "test",
                  script: {
                    type: "text/javascript",
                    exec: [
                      "const response = pm.response.json();",
                      "if (response.accessToken) {",
                      "    pm.collectionVariables.set(\"accessToken\", response.accessToken);",
                      "    pm.collectionVariables.set(\"customerToken\", response.accessToken);",
                      "    if (response.user && response.user.email) {",
                      "        pm.collectionVariables.set(\"customerEmail\", response.user.email);",
                      "    }",
                      "    console.log(\"[Auth] Customer accessToken saved successfully.\");",
                      "}"
                    ]
                  }
                }
              ],
              request: {
                auth: { type: "noauth" },
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    name: "Demo Customer",
                    email: "demo@gmail.com",
                    mobile: "+91 98311 22334",
                    companyName: "Demo Enterprise Solutions",
                    companyLogo: "",
                    gstNo: "19AAACT1234A1Z5",
                    password: "CustomerSecurePass123!"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/register",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "register"]
                },
                description: "Registers a customer account and establishes their customer portal profile."
              }
            },
            {
              name: "Customer Login",
              event: [
                {
                  listen: "test",
                  script: {
                    type: "text/javascript",
                    exec: [
                      "const response = pm.response.json();",
                      "if (response.accessToken) {",
                      "    pm.collectionVariables.set(\"accessToken\", response.accessToken);",
                      "    pm.collectionVariables.set(\"customerToken\", response.accessToken);",
                      "    if (response.user && response.user.email) {",
                      "        pm.collectionVariables.set(\"customerEmail\", response.user.email);",
                      "    }",
                      "    console.log(\"[Auth] Customer login token saved successfully.\");",
                      "}"
                    ]
                  }
                }
              ],
              request: {
                auth: { type: "noauth" },
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    email: "demo@gmail.com",
                    password: "CustomerSecurePass123!",
                    portal: "customer"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/login",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "login"]
                },
                description: "Customer portal authentication returning JWT token with Customer role privileges."
              }
            },
            {
              name: "Get Current Customer Profile (/me)",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/me",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "me"]
                },
                description: "Fetches current authenticated customer's profile, company details, and subscription state."
              }
            },
            {
              name: "Forgot Password Instructions",
              request: {
                auth: { type: "noauth" },
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    email: "demo@gmail.com"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/forgot-password",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "forgot-password"]
                },
                description: "Sends password reset instructions and security token to the customer inbox."
              }
            },
            {
              name: "Reset Password with Token",
              request: {
                auth: { type: "noauth" },
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    token: "sample_password_reset_token_here",
                    password: "NewCustomerSecurePass456!"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/reset-password",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "reset-password"]
                },
                description: "Validates verification token and updates customer account password."
              }
            },
            {
              name: "Refresh Customer Token",
              event: [
                {
                  listen: "test",
                  script: {
                    type: "text/javascript",
                    exec: [
                      "const response = pm.response.json();",
                      "if (response.accessToken) {",
                      "    pm.collectionVariables.set(\"accessToken\", response.accessToken);",
                      "    pm.collectionVariables.set(\"customerToken\", response.accessToken);",
                      "}"
                    ]
                  }
                }
              ],
              request: {
                method: "POST",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/refresh",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "refresh"]
                },
                description: "Refreshes customer portal session access token."
              }
            },
            {
              name: "Customer Logout",
              request: {
                method: "POST",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/auth/logout",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "auth", "logout"]
                },
                description: "Signs out the customer and clears session credentials."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // CUSTOMER SUBFOLDER 2: Portal & Dashboard
        // -------------------------------------------------------------
        {
          name: "2. Portal & Dashboard",
          description: "Customer portal summary telemetry, remote desktop connectivity credentials, search, demo activation, and direct payment.",
          item: [
            {
              name: "Customer Portal Overview Telemetry",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/dashboard/overview",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "dashboard", "overview"]
                },
                description: "Returns client overview telemetry: active cloud nodes, demo trial usage flags (demoTrialUsed, demoExtensionAllowed), and billing status."
              }
            },
            {
              name: "Customer Cloud Details & Credentials (/me)",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/dashboard/me",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "dashboard", "me"]
                },
                description: "Retrieves customer's cloud server connection specs, static IP address, RDP port, and license details."
              }
            },
            {
              name: "Activate Demo Trial (Single-Use Validation)",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    planId: "ctrls-demo-1u",
                    planName: "CtrlS 1 User Demo (2 Core / 3 GB / 50 GB)",
                    trialDays: 7
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/dashboard/activate-demo",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "dashboard", "activate-demo"]
                },
                description: "Activates a complimentary demo plan. Enforces single-use trial policy unless explicitly authorized for extension by an admin."
              }
            },
            {
              name: "Customer Portal Global Search",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/dashboard/search?q=ctrls",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "dashboard", "search"],
                  query: [{ key: "q", value: "ctrls" }]
                },
                description: "Provides unified instant search across customer products, subscriptions, and receipts."
              }
            },
            {
              name: "Pay Customer Portal Dues",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    contractId: "{{contractId}}",
                    amount: 500,
                    paymentMode: "Online / UPI",
                    referenceNo: "UPI-PAY-2026-9901"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/dashboard/payments",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "dashboard", "payments"]
                },
                description: "Allows customer to submit payment against outstanding dues directly from the customer portal."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // CUSTOMER SUBFOLDER 3: Cart & Commerce
        // -------------------------------------------------------------
        {
          name: "3. Cart & Commerce",
          description: "Customer session cart, item configuration, add-ons, quantity modifications, and checkout fulfillment.",
          item: [
            {
              name: "Get Session Cart with Tax & Totals",
              request: {
                method: "GET",
                header: [
                  { key: "Accept", value: "application/json" },
                  { key: "X-Session-Id", value: "{{sessionId}}" }
                ],
                url: {
                  raw: "{{baseUrl}}/api/v1/cart",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "cart"]
                },
                description: "Retrieves the active customer cart including subtotal, GST calculation, discounts, and line items."
              }
            },
            {
              name: "Get Available Cart Addons",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/cart/addons",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "cart", "addons"]
                },
                description: "Lists recommended add-ons (extra RAM, dedicated IP, automated backup storage)."
              }
            },
            {
              name: "Add Item to Cart",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" },
                  { key: "X-Session-Id", value: "{{sessionId}}" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    productId: "ctrls-1-user",
                    name: "CtrlS 1 User (2 Core / 3 GB / 50 GB)",
                    price: 500,
                    quantity: 1,
                    billingCycle: "monthly",
                    specs: {
                      cores: "2 core",
                      ram: "3 GB",
                      storage: "50 GB"
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/cart/add",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "cart", "add"]
                },
                description: "Adds a selected CtrlS Cloud tier or product to the session cart."
              }
            },
            {
              name: "Update Cart Item Quantity",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" },
                  { key: "X-Session-Id", value: "{{sessionId}}" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    itemId: "item_cart_node_01",
                    quantity: 2
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/cart/update-qty",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "cart", "update-qty"]
                },
                description: "Modifies item quantity in the cart with dynamic subtotal recalculation."
              }
            },
            {
              name: "Remove Item from Cart",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" },
                  { key: "X-Session-Id", value: "{{sessionId}}" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    itemId: "item_cart_node_01"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/cart/remove",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "cart", "remove"]
                },
                description: "Removes a specific line item from the active cart."
              }
            },
            {
              name: "Update Fulfillment Mode (Digital / Assisted)",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" },
                  { key: "X-Session-Id", value: "{{sessionId}}" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    fulfillmentMode: "Digital"
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/cart/fulfillment",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "cart", "fulfillment"]
                },
                description: "Toggles provisioning fulfillment preference."
              }
            },
            {
              name: "Clear Entire Cart",
              request: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" },
                  { key: "X-Session-Id", value: "{{sessionId}}" }
                ],
                body: { mode: "raw", raw: "{}" },
                url: {
                  raw: "{{baseUrl}}/api/v1/cart/clear",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "cart", "clear"]
                },
                description: "Clears all line items from the active session cart."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // CUSTOMER SUBFOLDER 4: Subscriptions & Contracts
        // -------------------------------------------------------------
        {
          name: "4. Subscriptions & Contracts",
          description: "Customer view of active subscriptions, plan specifications, and contract terms.",
          item: [
            {
              name: "Customer Active Subscriptions",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/contracts?customer={{customerEmail}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "contracts"],
                  query: [
                    { key: "customer", value: "{{customerEmail}}" }
                  ]
                },
                description: "Returns all active and historical contracts for the authenticated customer."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // CUSTOMER SUBFOLDER 5: Invoices & Receipts
        // -------------------------------------------------------------
        {
          name: "5. Invoices & Receipts",
          description: "Customer view of billing invoices, receipts, and payment transactions.",
          item: [
            {
              name: "Customer Invoices & Receipts List",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/payments?customer={{customerEmail}}",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "payments"],
                  query: [
                    { key: "customer", value: "{{customerEmail}}" }
                  ]
                },
                description: "Returns invoices and payment receipts associated with the customer account."
              }
            }
          ]
        },

        // -------------------------------------------------------------
        // CUSTOMER SUBFOLDER 6: Notifications
        // -------------------------------------------------------------
        {
          name: "6. Notifications",
          description: "Customer portal alerts, renewal notifications, and provisioning updates.",
          item: [
            {
              name: "Customer Notifications Stream",
              request: {
                method: "GET",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/notifications",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "notifications"]
                },
                description: "Streams customer-scoped alerts, payment reminders, and trial expiration notices."
              }
            },
            {
              name: "Mark Customer Notification as Read",
              request: {
                method: "PATCH",
                header: [{ key: "Accept", value: "application/json" }],
                url: {
                  raw: "{{baseUrl}}/api/v1/notifications/{{notificationId}}/read",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "notifications", "{{notificationId}}", "read"]
                },
                description: "Marks a customer notification as read."
              }
            }
          ]
        }
      ]
    },

    // =========================================================================
    // TOP-LEVEL FOLDER: SYSTEM & HEALTH
    // =========================================================================
    {
      name: "System & Health",
      description: "Health checks, root service manifest, and runtime environment inspection.",
      item: [
        {
          name: "API Root & Service Manifest",
          request: {
            auth: { type: "noauth" },
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/",
              host: ["{{baseUrl}}"],
              path: [""]
            },
            description: "Returns backend runtime status, environment info, and top-level endpoints summary."
          }
        },
        {
          name: "API Health Status (/api/health)",
          request: {
            auth: { type: "noauth" },
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/health",
              host: ["{{baseUrl}}"],
              path: ["api", "health"]
            },
            description: "Standard liveness check used by cloud orchestrators and monitoring probes."
          }
        }
      ]
    }
  ]
};

// Write collection to both project root and Backend folder
const rootPath = path.resolve(__dirname, '../NISPL_API_Postman_Collection.json');
const backendPath = path.resolve(__dirname, './NISPL_API_Postman_Collection.json');

fs.writeFileSync(rootPath, JSON.stringify(collection, null, 2), 'utf-8');
fs.writeFileSync(backendPath, JSON.stringify(collection, null, 2), 'utf-8');

console.log('Successfully generated Postman Collection v2.1.0 JSON:');
console.log('  1. ' + rootPath);
console.log('  2. ' + backendPath);

let totalReqs = 0;
function printTree(items, indent = '  ') {
  items.forEach(folder => {
    if (folder.item && folder.item.some(it => it.item)) {
      console.log(`${indent}📁 [${folder.name}] (Persona Group)`);
      printTree(folder.item, indent + '  ');
    } else {
      const count = folder.item ? folder.item.length : 0;
      totalReqs += count;
      console.log(`${indent}📂 [${folder.name}]: ${count} requests`);
    }
  });
}
printTree(collection.item);
console.log('\nTotal Production API Requests configured: ' + totalReqs);
