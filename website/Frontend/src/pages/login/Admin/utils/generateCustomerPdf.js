import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate and download professional Customer Profile & Cloud Specification PDF
 * @param {Object} customer
 */
export function generateCustomerPdf(customer) {
  if (!customer) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [29, 78, 216]; // #1d4ed8
  const darkTextColor = [15, 23, 42];  // #0f172a
  const mutedTextColor = [100, 116, 139]; // #64748b
  const borderColor = [226, 232, 240]; // #e2e8f0

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 6, 'F');

  // 2. Company Info (Left Header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...darkTextColor);
  doc.text('NET INFOTECH SYSTEM PVT. LTD.', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  doc.text('Certified Tally 3-Star Partner & Enterprise Cloud Provider', 14, 23);
  doc.text('Webel Tower 1, IT Park, BN Block, Sector V, Salt Lake City', 14, 27);
  doc.text('Kolkata, West Bengal - 700091 | Support: +91-9330113000', 14, 31);
  doc.text('Email: info@netinfotechsystem.com | Web: www.nispl.in', 14, 35);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text('GSTIN: 19AAACN8491A1Z8  |  PAN: AAACN8491A', 14, 40);

  // 3. Document Header Badge (Right)
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(122, 12, 74, 30, 2, 2, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(122, 12, 74, 30, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryColor);
  doc.text('CUSTOMER ACCOUNT DOSSIER', 126, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  doc.text('Customer ID:', 126, 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${customer.customerId || customer.id || 'N/A'}`, 154, 25);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text('Registered On:', 126, 30);
  doc.setTextColor(...darkTextColor);
  doc.text(`${customer.registered || new Date().toISOString().split('T')[0]}`, 154, 30);

  doc.setTextColor(...mutedTextColor);
  doc.text('Account Status:', 126, 35);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`${String(customer.status || 'Active').toUpperCase()}`, 154, 35);

  // Divider Line
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.line(14, 46, 196, 46);

  // 4. Primary Account Information Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 50, 182, 34, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(14, 50, 182, 34, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('COMPANY & REPRESENTATIVE DETAILS', 18, 56);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkTextColor);
  doc.text(`${customer.company || customer.name || 'Unnamed Company'}`, 18, 63);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  doc.text(`Primary Contact:`, 18, 69);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${customer.name || 'N/A'}`, 43, 69);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text(`Corporate Email:`, 18, 75);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${customer.email || 'N/A'}`, 43, 75);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text(`Direct Phone:`, 110, 69);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${customer.phone || 'N/A'}`, 133, 69);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text(`Industry / Rel:`, 110, 75);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${customer.industry || 'Technology'} (${customer.accountRelationship || 'Customer'})`, 133, 75);

  // Address String
  const addr = customer.address || {};
  const addrText = typeof addr === 'string'
    ? addr
    : [addr.street, addr.area, addr.city, addr.state, addr.country, addr.postalCode].filter(Boolean).join(', ') || customer.city || 'Kolkata, West Bengal, India';

  // 5. Customer Profile Table Details
  autoTable(doc, {
    startY: 90,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: darkTextColor,
      lineColor: borderColor
    },
    head: [['Attribute', 'Profile Specification & Configuration']],
    body: [
      ['Company / Entity Name', customer.company || customer.name],
      ['Contact Representative', customer.name],
      ['Corporate Email', customer.email],
      ['Phone / Mobile', customer.phone || 'N/A'],
      ['Alternate Contact', customer.alternatePhone || 'N/A'],
      ['Website', customer.website || 'N/A'],
      ['Physical / Billing Address', addrText],
      ['GSTIN / Tax ID', customer.gstNo || 'Unregistered / Not Provided'],
      ['Active Cloud Subscription', customer.plan || 'Tally Prime Cloud + VPS Gold'],
      ['Provisioned Datacenter Node', customer.serverNode || 'CtrlS-KOL-NODE-01'],
      ['Monthly Recurring Revenue (MRR)', customer.mrr || '₹15,000'],
      ['Sangam CRM Sync Status', (customer.sangamCrm?.status || 'pending').toUpperCase()],
      ['Sangam CRM Record ID', customer.sangamCrm?.recordId || 'Pending Synchronization'],
      ['Last Synchronized Date', customer.sangamCrm?.lastSyncedAt ? new Date(customer.sangamCrm.lastSyncedAt).toLocaleString('en-IN') : 'N/A']
    ]
  });

  const finalY = doc.lastAutoTable.finalY + 12;

  // 6. Security & Telemetry Footer Notice
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY, 182, 22, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(14, finalY, 182, 22, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text('SYSTEM AUDIT & CONFIDENTIALITY NOTICE', 18, finalY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedTextColor);
  doc.text(
    'This administrative document is generated automatically from Net Infotech System (NISPL) Central Database.',
    18,
    finalY + 12
  );
  doc.text(
    'All company details, cloud node provisioning and Sangam CRM integration records are protected under Enterprise SLA.',
    18,
    finalY + 16
  );

  // Save the PDF
  const filename = `Customer_${customer.customerId || customer.id || 'profile'}.pdf`;
  doc.save(filename);
}

