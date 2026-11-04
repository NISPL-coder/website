import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collection = {
  info: {
    _postman_id: "nispl-backend-api-v2-collection",
    name: "NISPL Cloud Tech - Enterprise Backend API Collection",
    description: "Complete Postman API Collection for Net Infotech System (NISPL) Enterprise Backend.\nIncludes all endpoints for Authentication, Customer Management, Contracts, Invoices & Payments, Products Catalog, Staff RBAC, Audit Trails, Notifications, Cart Commerce, and Dashboard Telemetry.",
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
      description: "Base API Server URL (e.g., http://localhost:4000 or production https://website-ebxf.onrender.com)"
    },
    {
      key: "accessToken",
      value: "",
      type: "string",
      description: "JWT Bearer Access Token (automatically populated after executing Login or Register request)"
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
    // -------------------------------------------------------------
    // FOLDER 1: System & Health
    // -------------------------------------------------------------
    {
      name: "1. System & Health",
      description: "Health checks and backend runtime telemetry.",
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
        },
        {
          name: "Base Health Check (/health)",
          request: {
            auth: { type: "noauth" },
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/health",
              host: ["{{baseUrl}}"],
              path: ["health"]
            },
            description: "Root-level health check endpoint."
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 2: Authentication
    // -------------------------------------------------------------
    {
      name: "2. Authentication",
      description: "Admin onboarding, multi-portal authentication (Admin, Customer, Partner), session management, and password reset flows.",
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
            description: "Inspects whether a primary administrator has already been provisioned and returns the configured administrator email address."
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
            body: {
              mode: "raw",
              raw: "{}"
            },
            url: {
              raw: "{{baseUrl}}/api/v1/auth/admin/send-otp",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "auth", "admin", "send-otp"]
            },
            description: "Dispatches a 6-digit one-time verification password to the authorized administrator inbox."
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
                name: "NISPL System Administrator",
                designation: "Head of Infrastructure",
                password: "SecureAdminPassword@2026",
                otp: "123456"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/auth/admin/verify-and-create",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "auth", "admin", "verify-and-create"]
            },
            description: "Verifies the email OTP and creates the primary administrator credentials."
          }
        },
        {
          name: "Login User (Admin / Customer / Partner)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const jsonData = pm.response.json();",
                  "if (jsonData && jsonData.accessToken) {",
                  "    pm.collectionVariables.set('accessToken', jsonData.accessToken);",
                  "    console.log('Access token saved to collection variable: ' + jsonData.accessToken.substring(0, 15) + '...');",
                  "}",
                  "if (jsonData && jsonData.user && jsonData.user.id) {",
                  "    pm.collectionVariables.set('staffId', jsonData.user.id);",
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
                identifier: "admin@netinfotechsystem.in",
                password: "Password@123",
                portal: "admin"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/auth/login",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "auth", "login"]
            },
            description: "Authenticates an account across Admin, Customer, or Partner portals. Sets {{accessToken}} variable on success."
          }
        },
        {
          name: "Customer Self-Registration",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const jsonData = pm.response.json();",
                  "if (jsonData && jsonData.accessToken) {",
                  "    pm.collectionVariables.set('accessToken', jsonData.accessToken);",
                  "}",
                  "if (jsonData && jsonData.user && jsonData.user.customerId) {",
                  "    pm.collectionVariables.set('customerId', jsonData.user.customerId);",
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
                name: "Rajesh Sharma",
                email: "rajesh.sharma@innovativetech.in",
                password: "CustomerSecretPassword@2026",
                company: "Innovative Tech Solutions Pvt Ltd",
                phone: "+91 98301 22334",
                gstNo: "19AAACI1681G1ZM",
                plan: "Tally Prime Gold Cloud Server"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/auth/register",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "auth", "register"]
            },
            description: "Self-service onboarding endpoint for prospective customers."
          }
        },
        {
          name: "Get Current Authenticated Profile (/me)",
          request: {
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/auth/me",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "auth", "me"]
            },
            description: "Returns the authenticated user's profile and active roles using the Bearer token."
          }
        },
        {
          name: "Refresh Access Token",
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
                refreshToken: "{{refreshToken}}"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/auth/refresh",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "auth", "refresh"]
            },
            description: "Exchanges a valid refresh token cookie/payload for a renewed short-lived access token."
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
                email: "user@innovativetech.in"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/auth/forgot-password",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "auth", "forgot-password"]
            },
            description: "Dispatches a secure password recovery link to the user's registered email address."
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
                token: "sample-reset-token-received-in-email",
                password: "BrandNewSecurePassword@2026"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/auth/reset-password",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "auth", "reset-password"]
            },
            description: "Validates the verification token and saves the new account password."
          }
        },
        {
          name: "Logout & Revoke Session",
          request: {
            method: "POST",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/auth/logout",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "auth", "logout"]
            },
            description: "Revokes the active JWT session server-side and clears authentication cookies."
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 3: Users & Profile Management
    // -------------------------------------------------------------
    {
      name: "3. Users & Profile Management",
      description: "User profile queries, password modifications, and administrative user provisioning.",
      item: [
        {
          name: "Get Own User Profile",
          request: {
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/users/me",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "users", "me"]
            },
            description: "Retrieves complete account record of currently signed-in user."
          }
        },
        {
          name: "Change Own Password",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                currentPassword: "OldPassword@123",
                newPassword: "FreshPassword@2026!"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/users/me/password",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "users", "me", "password"]
            },
            description: "Updates password for the currently authenticated account and invalidates existing sessions."
          }
        },
        {
          name: "List System Users (Admin Only)",
          request: {
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/users",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "users"]
            },
            description: "Administrative query returning all registered user identities."
          }
        },
        {
          name: "Create User (Admin Provisioning)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Ananya Sen",
                email: "ananya.sen@netinfotechsystem.in",
                password: "StaffAccountPassword@2026",
                role: "manager",
                tier: "Operations Manager",
                permissions: ["overview:view", "customer:*", "contract:*", "payment:view"],
                securityLevel: "Tier-2 Security",
                location: "Kolkata HQ Node",
                accountStatus: "active"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/users",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "users"]
            },
            description: "Admin endpoint to provision a new staff or user account directly."
          }
        },
        {
          name: "Update User by ID",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Ananya Sen (Updated)",
                role: "manager",
                accountStatus: "active",
                permissions: ["overview:view", "customer:*", "contract:*", "payment:*"]
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/users/{{staffId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "users", "{{staffId}}"]
            },
            description: "Admin endpoint to modify an existing user's attributes."
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 4: Customers Directory
    // -------------------------------------------------------------
    {
      name: "4. Customers Directory",
      description: "Enterprise customer directory, Sangam CRM company synchronizations, and bulk CSV imports.",
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
            description: "Returns all customer accounts with aggregated MRR, active deployment counts, and Sangam CRM sync states."
          }
        },
        {
          name: "Create Customer & Auto-Sync Sangam CRM",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const jsonData = pm.response.json();",
                  "if (jsonData && jsonData.data && jsonData.data.customerId) {",
                  "    pm.collectionVariables.set('customerId', jsonData.data.customerId);",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                customerId: "CUST-9679",
                name: "demo",
                company: "demo",
                email: "demo@gmail.com",
                phone: "9876543210",
                alternatePhone: "+91 33 2289 4400",
                website: "https://nispl.in",
                industry: "IT & Cloud Services",
                accountRelationship: "Customer",
                plan: "Tally Prime Cloud + VPS Gold",
                serverNode: "CtrlS-KOL-NODE-01",
                status: "active",
                mrr: "₹6,500",
                registered: "2026-10-31",
                address: {
                  street: "Sector V, Salt Lake Electronics Complex",
                  area: "Bidhannagar",
                  city: "Kolkata",
                  state: "West Bengal",
                  country: "India",
                  postalCode: "700091",
                  addressType: "Headquarters"
                },
                gstNo: null,
                portalPassword: "SecureClient@12345"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/customers",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "customers"]
            },
            description: "Creates an enterprise customer record locally and automatically triggers bidirectional synchronization to Sangam CRM."
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
                name: "Debashis Banerjee",
                company: "Kolkata FinTech Solutions Pvt Ltd",
                phone: "+91 98310 99887",
                status: "active",
                plan: "Tally Prime Enterprise + Dedicated VPS Node",
                mrr: "₹28,000",
                address: {
                  city: "Kolkata",
                  state: "West Bengal",
                  country: "India",
                  postalCode: "700091"
                }
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/customers/{{customerId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "customers", "{{customerId}}"]
            },
            description: "Updates an existing customer profile and pushes revisions to Sangam CRM."
          }
        },
        {
          name: "Retry / Trigger Sangam CRM Sync",
          request: {
            method: "POST",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/customers/{{customerId}}/sync",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "customers", "{{customerId}}", "sync"]
            },
            description: "Forces an immediate live synchronization retry for this customer against Sangam CRM."
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
                    companyName: "Eastern Steel Manufacturing Co",
                    email: "contact@easternsteel.com",
                    phone: "9830011223",
                    city: "Durgapur",
                    state: "West Bengal",
                    industry: "Manufacturing",
                    plan: "Tally Multi-User Cloud"
                  },
                  {
                    companyName: "Bengal Logistics & Freight Ltd",
                    email: "info@bengallogistics.in",
                    phone: "9830044556",
                    city: "Howrah",
                    state: "West Bengal",
                    industry: "Logistics",
                    plan: "Cloud VPS Gold"
                  }
                ]
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/customers/import-companies",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "customers", "import-companies"]
            },
            description: "Imports a batch of enterprise customer companies parsed from CSV uploads."
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
                    name: "Siddhartha Roy",
                    email: "sroy@easternsteel.com",
                    mobile: "9830011223",
                    companyName: "Eastern Steel Manufacturing Co",
                    designation: "Chief Financial Officer"
                  }
                ]
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/customers/import-contacts",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "customers", "import-contacts"]
            },
            description: "Imports customer contacts and links them to their associated company profiles."
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
            description: "Removes customer record from database and audit log trail."
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 5: Contracts & Agreements
    // -------------------------------------------------------------
    {
      name: "5. Contracts & Agreements",
      description: "Service agreements, Cloud SLA subscriptions, AMC renewals, and Sangam CRM synchronizations.",
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
            description: "Returns all active, pending, and expiring service agreements with Sangam CRM sync indicators."
          }
        },
        {
          name: "Create Contract & Sync to Sangam CRM",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const jsonData = pm.response.json();",
                  "if (jsonData && jsonData.data && jsonData.data.contractId) {",
                  "    pm.collectionVariables.set('contractId', jsonData.data.contractId);",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                contractId: "CTR-2026-8829",
                name: "Tally on Clouds",
                company: "demo",
                customer: "demo",
                email: "demo@gmail.com",
                service: "Tally on Clouds",
                contractType: "AMC",
                subscriptionPeriod: "1 Year",
                productCategory: "Service",
                totalContractValue: "₹6,500",
                value: "₹6,500",
                startDate: "2026-10-31",
                endDate: "2027-10-31",
                expiryDate: "2027-10-31",
                status: "Active",
                slaTier: "Tier-4 CtrlS Kolkata NOC 99.99%",
                description: "Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, Windows Server license & daily backup."
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/contracts",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contracts"]
            },
            description: "Registers a new legal service agreement and schedules automated renewal reminders."
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
                name: "Annual Cloud Infrastructure & Tally Prime SLA (Renewed)",
                totalContractValue: "₹3,20,000",
                status: "Active",
                expiryDate: "2027-12-31"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/contracts/{{contractId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contracts", "{{contractId}}"]
            },
            description: "Modifies contract terms or status and triggers sync to Sangam CRM."
          }
        },
        {
          name: "Retry / Trigger Sangam Contract Sync",
          request: {
            method: "POST",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/contracts/{{contractId}}/sync",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contracts", "{{contractId}}", "sync"]
            },
            description: "Initiates real-time contract synchronization to Sangam CRM."
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
            description: "Removes contract record from system."
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 6: Payments & Invoices
    // -------------------------------------------------------------
    {
      name: "6. Payments & Invoices",
      description: "Billing invoices, payment reconciliations, NEFT/RTGS transaction logging, and receipts.",
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
            description: "Returns all client payment records, collection statuses, and outstanding invoices."
          }
        },
        {
          name: "Record New Payment / Receipt",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const jsonData = pm.response.json();",
                  "if (jsonData && jsonData.data && jsonData.data.paymentId) {",
                  "    pm.collectionVariables.set('paymentId', jsonData.data.paymentId);",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                paymentId: "PAY-2026-8808",
                invoiceNumber: "INV-2026-1051",
                customer: "demo",
                company: "demo",
                accountName: "demo",
                email: "demo@gmail.com",
                customerId: "CUST-9679",
                amount: "₹6,500",
                receivedAmount: "₹6,500",
                pendingPayment: "₹0",
                paymentMethod: "UPI / Scan & Pay",
                method: "UPI / Scan & Pay",
                invoiceDate: "2026-11-04",
                date: "2026-11-04",
                paymentReceivedDate: "2026-11-04",
                expectedPaymentDate: null,
                status: "Received",
                solutionCategory: "Service",
                notes: "Subscription renewal fee received via UPI / Scan & Pay."
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/payments",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "payments"]
            },
            description: "Creates an invoice payment record and generates an administrative audit event."
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
                status: "Cleared",
                receivedAmount: "₹24,500",
                pendingPayment: "₹0",
                paymentReceivedDate: "2026-11-04",
                notes: "Funds settled in primary operating account."
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/payments/{{paymentId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "payments", "{{paymentId}}"]
            },
            description: "Updates clearance state or payment allocations for a billing record."
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
            description: "Removes invoice payment record."
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 7: Products & Solutions Catalog
    // -------------------------------------------------------------
    {
      name: "7. Products & Solutions Catalog",
      description: "Cloud hosting instances, Tally Prime deployments, dedicated VPS packages, and solution tiers.",
      item: [
        {
          name: "List Products Catalog",
          request: {
            auth: { type: "noauth" },
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/products",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "products"]
            },
            description: "Queries the complete product and cloud solution inventory."
          }
        },
        {
          name: "List Products with Filters",
          request: {
            auth: { type: "noauth" },
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/products?category=Cloud%20Hosting&provider=ctrls-cloud&status=active&available=true",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "products"],
              query: [
                { key: "category", value: "Cloud Hosting" },
                { key: "provider", value: "ctrls-cloud" },
                { key: "status", value: "active" },
                { key: "available", value: "true" }
              ]
            },
            description: "Filters product catalog by category, infrastructure provider, and availability."
          }
        },
        {
          name: "Create Catalog Product",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const jsonData = pm.response.json();",
                  "if (jsonData && jsonData.data && jsonData.data.productId) {",
                  "    pm.collectionVariables.set('productId', jsonData.data.productId);",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                productId: "ctrls-1-user",
                name: "CtrlS Cloud Server — 1 User (2 core/3 GB/50 GB)",
                category: "Cloud Hosting",
                provider: "ctrls-cloud",
                ipAddress: "103.115.220.12",
                sku: "SKU-CTRLS-01U",
                price: "₹500",
                monthlyPrice: 500,
                frequency: "/ month",
                description: "Tier-4 CtrlS Kolkata Datacenter hosting with N+N dual power feed, 2 core, 3 GB RAM, 50 GB SSD, Windows Server license & daily backup.",
                userBadge: "1 User",
                serverConfiguration: "2 core/3 GB/50 GB",
                cores: "2 core",
                ram: "3 GB",
                storage: "50 GB",
                users: 1,
                tier: "Tier-4",
                available: true,
                status: "active"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/products",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "products"]
            },
            description: "Adds a new server tier or software package to the catalog."
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
                price: "₹7,199",
                monthlyPrice: 7199,
                available: true,
                status: "active"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/products/{{productId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "products", "{{productId}}"]
            },
            description: "Updates product pricing, availability toggle, or server hardware parameters."
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
            description: "Removes product package from catalog."
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 8: Staff & Access Control (RBAC)
    // -------------------------------------------------------------
    {
      name: "8. Staff & Access Control (RBAC)",
      description: "Staff management, administrative hierarchy (Admin, Manager, Support), and granular module permissions.",
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
            description: "Lists all administrative staff members and their granular RBAC module grants."
          }
        },
        {
          name: "Create Staff Member",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const jsonData = pm.response.json();",
                  "if (jsonData && jsonData.staff && (jsonData.staff.id || jsonData.staff._id)) {",
                  "    pm.collectionVariables.set('staffId', jsonData.staff.id || jsonData.staff._id);",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Subham Dutta",
                email: "subham.dutta@netinfotechsystem.in",
                password: "StaffPassword@2026",
                role: "support",
                designation: "Technical Support Executive",
                status: "active",
                permissions: [
                  "overview:view",
                  "customer:view",
                  "product:view",
                  "receipt:view"
                ]
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/staff",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "staff"]
            },
            description: "Creates a new staff member account."
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
                status: "inactive"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/staff/{{staffId}}/status",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "staff", "{{staffId}}", "status"]
            },
            description: "Activates or deactivates a staff member and revokes active sessions when deactivated."
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
                role: "manager",
                designation: "Support Team Lead",
                permissions: [
                  "overview:*",
                  "customer:*",
                  "contract:view",
                  "payment:view",
                  "product:*",
                  "receipt:*"
                ]
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/staff/{{staffId}}/permissions",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "staff", "{{staffId}}", "permissions"]
            },
            description: "Grants or updates granular permissions for an administrative staff member."
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
            description: "Deletes a staff account from the system."
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 9: Activity Logs & Audit Trail
    // -------------------------------------------------------------
    {
      name: "9. Activity Logs & Audit Trail",
      description: "Immutable administrative audit logs recording actions across customers, contracts, payments, products, and access controls.",
      item: [
        {
          name: "List Activity Logs (Paginated)",
          request: {
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/activity-logs?page=1&limit=25&category=all",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "activity-logs"],
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "25" },
                { key: "category", value: "all" }
              ]
            },
            description: "Returns paginated audit trail of all administrative events."
          }
        },
        {
          name: "Search Activity Logs",
          request: {
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/activity-logs?search=Customer",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "activity-logs"],
              query: [
                { key: "search", value: "Customer" }
              ]
            },
            description: "Searches logs across admin name, email, action code, resource, and IP address."
          }
        },
        {
          name: "Filter Activity Logs by Date Range",
          request: {
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/activity-logs?startDate=2026-11-01&endDate=2026-11-30",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "activity-logs"],
              query: [
                { key: "startDate", value: "2026-11-01" },
                { key: "endDate", value: "2026-11-30" }
              ]
            },
            description: "Filters logs within a date range."
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
            description: "Fetches complete detail payload including before-and-after change diffs."
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 10: Notifications Center
    // -------------------------------------------------------------
    {
      name: "10. Notifications Center",
      description: "Real-time alert dispatch, renewal warnings, overdue payment triggers, and notification acknowledgments.",
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
            description: "Returns the active notification stream and unread counts for the signed-in user."
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
            description: "Returns unread counts grouped by severity (info, success, warning, error)."
          }
        },
        {
          name: "Create / Trigger Alert Notification",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const jsonData = pm.response.json();",
                  "if (jsonData && jsonData.notification && (jsonData.notification._id || jsonData.notification.id)) {",
                  "    pm.collectionVariables.set('notificationId', jsonData.notification._id || jsonData.notification.id);",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                type: "payment_due_soon",
                title: "Upcoming Payment Due Notice",
                message: "Customer payment of ₹24,500 from Kolkata FinTech Solutions Pvt Ltd is due on 2026-11-15.",
                severity: "warning",
                entityType: "payment",
                entityId: "PAY-2026-9051",
                user: {
                  name: "Debashis Banerjee",
                  company: "Kolkata FinTech Solutions Pvt Ltd",
                  email: "debashis@kolkatafintech.in"
                },
                metadata: {
                  amount: "₹24,500",
                  invoiceNumber: "INV-2026-0442",
                  expectedDate: "2026-11-15"
                }
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/notifications",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "notifications"]
            },
            description: "Dispatches a new alert into the enterprise notifications feed."
          }
        },
        {
          name: "Get Single Notification by ID",
          request: {
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/notifications/{{notificationId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "notifications", "{{notificationId}}"]
            },
            description: "Fetches detail of a single notification."
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
            description: "Flags notification item as read."
          }
        },
        {
          name: "Mark Notification as Unread",
          request: {
            method: "PATCH",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/notifications/{{notificationId}}/unread",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "notifications", "{{notificationId}}", "unread"]
            },
            description: "Flags notification item as unread."
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
            description: "Acknowledges all pending alerts for the signed-in user."
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
            description: "Deletes a specific notification record."
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
            description: "Clears entire notifications backlog."
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 11: Cart & Commerce
    // -------------------------------------------------------------
    {
      name: "11. Cart & Commerce",
      description: "Solution shopping cart, line-item quantity adjustments, GST computation, and fulfillment modes.",
      item: [
        {
          name: "Get Session Cart with Tax & Totals",
          request: {
            auth: { type: "noauth" },
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
            description: "Returns the current cart for the session including item breakdown, 18% GST calculation, and grand total."
          }
        },
        {
          name: "Get Available Cart Addons",
          request: {
            auth: { type: "noauth" },
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/cart/addons",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "cart", "addons"]
            },
            description: "Lists optional add-on solutions available for checkout."
          }
        },
        {
          name: "Add Item to Cart",
          request: {
            auth: { type: "noauth" },
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" },
              { key: "X-Session-Id", value: "{{sessionId}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                id: "sub-cloud-service-1793792000",
                name: "Cloud Services - CtrlS 1 User (2 core/3 GB/50 GB) (1 Month)",
                product: "Cloud Services",
                planName: "CtrlS 1 User (2 core/3 GB/50 GB)",
                basePrice: 500,
                price: 500,
                quantity: 1,
                customerEmail: "demo@gmail.com",
                salesPerson: "Nilmoni Ghosal",
                period: "1 Month",
                duration: "1 Month",
                durationMonths: 1,
                startDate: "2026-11-04",
                endDate: "04-12-2026"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/cart/add",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "cart", "add"]
            },
            description: "Adds a solution line item to the cart or increments existing quantity."
          }
        },
        {
          name: "Update Cart Item Quantity",
          request: {
            auth: { type: "noauth" },
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" },
              { key: "X-Session-Id", value: "{{sessionId}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                id: "ctrls-5-user",
                quantity: 3
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/cart/update-qty",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "cart", "update-qty"]
            },
            description: "Adjusts unit quantity for a specific line item in the cart."
          }
        },
        {
          name: "Remove Item from Cart",
          request: {
            auth: { type: "noauth" },
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" },
              { key: "X-Session-Id", value: "{{sessionId}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                id: "ctrls-5-user"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/cart/remove",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "cart", "remove"]
            },
            description: "Deletes a line item from the active cart."
          }
        },
        {
          name: "Update Fulfillment Mode (Digital / Assisted)",
          request: {
            auth: { type: "noauth" },
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" },
              { key: "X-Session-Id", value: "{{sessionId}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                fulfillmentMode: "assisted"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/cart/fulfillment",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "cart", "fulfillment"]
            },
            description: "Sets fulfillment mode between self-service digital deployment and engineer-assisted setup."
          }
        },
        {
          name: "Clear Entire Cart",
          request: {
            auth: { type: "noauth" },
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" },
              { key: "X-Session-Id", value: "{{sessionId}}" }
            ],
            body: {
              mode: "raw",
              raw: "{}"
            },
            url: {
              raw: "{{baseUrl}}/api/v1/cart/clear",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "cart", "clear"]
            },
            description: "Empties all line items from the active cart."
          }
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 12: Dashboard & Portal Analytics
    // -------------------------------------------------------------
    {
      name: "12. Dashboard & Portal Analytics",
      description: "Executive dashboards, financial analytics, customer portal summaries, and unified search.",
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
            description: "Aggregates MRR trends, active contracts, client pipeline metrics, and cloud resource utilization for executive console."
          }
        },
        {
          name: "Customer Portal Personal Overview (/dashboard/me)",
          request: {
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/dashboard/me",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "dashboard", "me"]
            },
            description: "Returns client-specific view of active cloud instances, payment histories, support tickets, and license renewal status."
          },
          response: [
            {
              name: "200 OK - Customer Overview Response",
              originalRequest: {
                method: "GET",
                header: [
                  { key: "Accept", value: "application/json" },
                  { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: {
                  raw: "{{baseUrl}}/api/v1/dashboard/me",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "dashboard", "me"]
                }
              },
              status: "OK",
              code: 200,
              _postman_previewlanguage: "json",
              header: [
                { key: "Content-Type", value: "application/json" }
              ],
              cookie: [],
              body: JSON.stringify({
          "success": true,
          "data": {
                    "account": {
                              "customerId": "CUST-9679",
                              "name": "demo",
                              "company": "demo",
                              "email": "demo@gmail.com",
                              "phone": "9876543210",
                              "plan": "Tally Prime Cloud + VPS Gold",
                              "status": "active",
                              "serverNode": "CtrlS-KOL-NODE-01",
                              "gstNo": null,
                              "registered": "2026-10-31"
                    },
                    "kpi": {
                              "activeProducts": 1,
                              "totalPaid": 6500,
                              "totalPending": 0,
                              "pendingInvoices": 0,
                              "renewalName": "Tally on Clouds",
                              "renewalDate": "2027-10-31",
                              "renewalDaysLeft": 361
                    },
                    "products": [
                              {
                                        "id": "CTR-2026-8829",
                                        "name": "Tally on Clouds",
                                        "category": "Service",
                                        "contractType": "AMC",
                                        "status": "Active",
                                        "startDate": "2026-10-31",
                                        "expiryDate": "2027-10-31",
                                        "daysLeft": 361,
                                        "amount": 6500,
                                        "amountLabel": "₹6500 / 1 year",
                                        "expired": false,
                                        "source": "contract"
                              }
                    ],
                    "payments": [
                              {
                                        "id": "PAY-2026-8808",
                                        "invoiceNumber": "INV-2026-1051",
                                        "service": "Tally on Clouds",
                                        "date": "2026-11-04",
                                        "dueDate": null,
                                        "daysLeft": null,
                                        "amount": 6500,
                                        "received": 6500,
                                        "pending": 0,
                                        "status": "Received",
                                        "paymentMethod": "UPI / Scan & Pay"
                              }
                    ],
                    "entitlements": [
                              {
                                        "name": "Tally on Clouds",
                                        "productId": null,
                                        "source": "subscription",
                                        "contractId": "CTR-2026-8829",
                                        "expiryDate": "2027-10-31"
                              }
                    ],
                    "recentPayments": [
                              {
                                        "id": "PAY-2026-8808",
                                        "invoiceNumber": "INV-2026-1051",
                                        "service": "Tally on Clouds",
                                        "date": "2026-11-04",
                                        "dueDate": null,
                                        "daysLeft": null,
                                        "amount": 6500,
                                        "received": 6500,
                                        "pending": 0,
                                        "status": "Received",
                                        "paymentMethod": "UPI / Scan & Pay"
                              }
                    ],
                    "reminder": null,
                    "identityMatched": true
          }
}, null, 2)
            }
          ]
        },
        {
          name: "Pay Customer Portal Dues (/dashboard/payments)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                method: "UPI / Scan & Pay",
                invoiceNumber: "INV-2026-1051",
                contractId: "CTR-2026-8829",
                settleAll: true
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/v1/dashboard/payments",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "dashboard", "payments"]
            },
            description: "Records and reconciles an online portal dues payment for the authenticated customer."
          },
          response: [
            {
              name: "200 OK - Payment Success",
              originalRequest: {
                method: "POST",
                header: [
                  { key: "Content-Type", value: "application/json" },
                  { key: "Accept", value: "application/json" },
                  { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    method: "UPI / Scan & Pay",
                    invoiceNumber: "INV-2026-1051",
                    contractId: "CTR-2026-8829",
                    settleAll: true
                  }, null, 2)
                },
                url: {
                  raw: "{{baseUrl}}/api/v1/dashboard/payments",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "dashboard", "payments"]
                }
              },
              status: "OK",
              code: 200,
              _postman_previewlanguage: "json",
              header: [{ key: "Content-Type", value: "application/json" }],
              cookie: [],
              body: JSON.stringify({
                success: true,
                data: {
                  settledCount: 1,
                  totalSettled: 6500,
                  status: "Received",
                  receiptId: "PAY-2026-8808"
                }
              }, null, 2)
            }
          ]
        },
        {
          name: "Customer Portal Unified Search",
          request: {
            method: "GET",
            header: [{ key: "Accept", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/dashboard/search?q=tally",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "dashboard", "search"],
              query: [
                { key: "q", value: "tally" }
              ]
            },
            description: "Global cross-resource search across products, subscription plans, and invoices for the logged-in customer."
          },
          response: [
            {
              name: "200 OK - Search Results (Tally)",
              originalRequest: {
                method: "GET",
                header: [
                  { key: "Accept", value: "application/json" },
                  { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: {
                  raw: "{{baseUrl}}/api/v1/dashboard/search?q=tally",
                  host: ["{{baseUrl}}"],
                  path: ["api", "v1", "dashboard", "search"],
                  query: [
                    { key: "q", value: "tally" }
                  ]
                }
              },
              status: "OK",
              code: 200,
              _postman_previewlanguage: "json",
              header: [
                { key: "Content-Type", value: "application/json" }
              ],
              cookie: [],
              body: JSON.stringify({
                success: true,
                data: {
                  query: "tally",
                  groups: [
                    {
                      key: "products",
                      label: "Products & plans",
                      items: [
                        {
                          id: "CTR-2026-8829",
                          title: "Tally on Clouds",
                          subtitle: "AMC · Renews 31 Oct 2027",
                          meta: "Active",
                          amount: 6500,
                          target: "products"
                        }
                      ]
                    },
                    {
                      key: "payments",
                      label: "Payments & receipts",
                      items: [
                        {
                          id: "PAY-2026-8808",
                          title: "INV-2026-1051",
                          subtitle: "Tally on Clouds · 04 Nov 2026",
                          meta: "Received",
                          amount: 6500,
                          target: "receipt"
                        }
                      ]
                    }
                  ]
                }
              }, null, 2)
            }
          ]
        }
      ]
    },

    // -------------------------------------------------------------
    // FOLDER 13: RBAC Field Permissions Registry
    // -------------------------------------------------------------
    {
      name: "13. Permissions Registry",
      description: "Field-level column registry for role-based data redaction and user access control.",
      item: [
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
            description: "Returns data column schema definitions used by the User Access & RBAC management interface."
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
console.log('Total folders: ' + collection.item.length);
let totalReqs = 0;
collection.item.forEach(f => {
  totalReqs += f.item ? f.item.length : 0;
  console.log(`  - [${f.name}]: ${f.item ? f.item.length : 0} requests`);
});
console.log('Total API Requests configured: ' + totalReqs);

