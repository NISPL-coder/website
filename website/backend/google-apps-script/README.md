# Google Apps Script Deployment Guide (Alternative Serverless Setup)

If you prefer to run the backend entirely serverless using Google Apps Script without hosting a Node.js server, follow these instructions:

### 1. Create Google Apps Script Project
1. Open [Google Drive](https://drive.google.com).
2. Click **New** -> **More** -> **Google Apps Script**.
3. Name the project `NISPL Career Portal Webhook`.

### 2. Add the Code
1. Replace all code in `Code.gs` with the contents of [`Code.gs`](file:///c:/DEBASISH/website/backend/google-apps-script/Code.gs).
2. Review the top constants:
   - `SPREADSHEET_NAME`: `NISPL Career Applications`
   - `SHEET_NAME`: `Applications`
   - `FOLDER_NAME`: `NISPL Resumes(Website)`
   - `HR_EMAIL`: `netinfotechsystem@gmail.com`
   - `TIMEZONE`: `Asia/Kolkata`

### 3. Deploy as a Web App
1. In the upper-right corner of the Apps Script editor, click **Deploy** -> **New deployment**.
2. Select type: **Web app** (gear icon).
3. Set the following fields:
   - **Description**: `NISPL Career Applications Webhook`
   - **Execute as**: `Me (your Google email)`
   - **Who has access**: `Anyone` (Required so candidates on the website can submit without logging in).
4. Click **Deploy**.
5. When prompted, click **Authorize access** and approve the permissions for Drive, Sheets, and Mail.
6. Copy the **Web App URL** (e.g., `https://script.google.com/macros/s/AKfycb.../exec`).

### 4. Connect to Frontend
Set the URL in `.env`:
```env
VITE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### Notes & Limitations of Google Apps Script:
- Google imposes daily quotas (e.g., 100 emails/day for standard Gmail accounts, 1,500/day for Google Workspace).
- Execution time is capped at 6 minutes per invocation.
- The Node.js Express backend in `backend/` is the recommended production architecture because it includes cryptographic file magic-byte validation, rate-limiting, and robust failure rollbacks.
