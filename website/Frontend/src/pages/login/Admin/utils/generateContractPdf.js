import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate and download professional Contract Agreement & SLA PDF
 * @param {Object} contract
 */
export function generateContractPdf(contract) {
  if (!contract) return;

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
  doc.text('Email: contracts@nispl.in | Web: www.nispl.in', 14, 35);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text('GSTIN: 19AAACN8491A1Z8  |  PAN: AAACN8491A', 14, 40);

  // 3. Document Header Badge (Right)
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(118, 12, 78, 30, 2, 2, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(118, 12, 78, 30, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryColor);
  doc.text('SERVICE LEVEL AGREEMENT (SLA)', 122, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  doc.text('Contract Ref:', 122, 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${contract.contractId || contract.id || 'N/A'}`, 150, 25);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text('Start Date:', 122, 30);
  doc.setTextColor(...darkTextColor);
  doc.text(`${contract.startDate || 'N/A'}`, 150, 30);

  doc.setTextColor(...mutedTextColor);
  doc.text('Term Status:', 122, 35);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`${String(contract.status || 'Active').toUpperCase()}`, 150, 35);

  // Divider Line
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.line(14, 46, 196, 46);

  // 4. Contract Primary Subject Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 50, 182, 34, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(14, 50, 182, 34, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('CONTRACT COMMITMENT & ACCOUNT HOLDER', 18, 56);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkTextColor);
  doc.text(`${contract.name || 'Cloud Services Agreement'}`, 18, 63);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  doc.text(`Account Entity:`, 18, 69);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${contract.company || contract.customer || 'N/A'}`, 43, 69);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text(`Contact Email:`, 18, 75);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${contract.email || 'contracts@nispl.in'}`, 43, 75);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text(`Contract Value:`, 110, 69);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216);
  doc.text(`${contract.totalContractValue || contract.value || 'N/A'}`, 135, 69);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text(`Duration:`, 110, 75);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${contract.subscriptionPeriod || '1 Year'} (${contract.contractType || 'Subscription'})`, 135, 75);

  // 5. Contract Specification Table
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
    head: [['Agreement Term', 'SLA Specification & Provisioning']],
    body: [
      ['Contract Name / Title', contract.name || 'NISPL Cloud Services Agreement'],
      ['Client Account / Company', contract.company || contract.customer || 'N/A'],
      ['Contract Type', contract.contractType || 'Subscription'],
      ['Subscription Period', contract.subscriptionPeriod || '1 Year'],
      ['Product / Service Category', contract.productCategory || 'Software'],
      ['Service Scope & SLA Tier', contract.service || `${contract.contractType} (${contract.subscriptionPeriod})`],
      ['SLA Performance Tier', contract.slaTier || 'Tier-1 Priority NOC 99.99%'],
      ['Total Contract Value', contract.totalContractValue || contract.value || 'N/A'],
      ['Billing Term Rate', contract.value || `${contract.totalContractValue} / ${contract.subscriptionPeriod}`],
      ['Effective Start Date', contract.startDate || 'N/A'],
      ['Contract Expiry Date', contract.endDate || contract.expiryDate || 'N/A'],
      ['Sangam CRM Sync Status', (contract.sangamCrm?.status || 'pending').toUpperCase()],
      ['Sangam CRM Record ID', contract.sangamCrm?.recordId || 'Pending Synchronization'],
      ['Last Synchronized Date', contract.sangamCrm?.lastSyncedAt ? new Date(contract.sangamCrm.lastSyncedAt).toLocaleString('en-IN') : 'N/A']
    ]
  });

  const finalY = doc.lastAutoTable.finalY + 14;

  // 6. Signatures & Terms Block
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY, 182, 32, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(14, finalY, 182, 32, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkTextColor);
  doc.text('For Net Infotech System Pvt. Ltd.', 20, finalY + 8);
  doc.text('For Customer / Authorized Signatory', 110, finalY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedTextColor);
  doc.text('Authorized Cloud Services Signatory', 20, finalY + 26);
  doc.text('Client Representative Signature & Seal', 110, finalY + 26);

  // Save the PDF
  const filename = `Contract_${contract.contractId || contract.id || 'agreement'}.pdf`;
  doc.save(filename);
}

