import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NISPL_HEADER_LOGO_BASE64, NISPL_FOOTER_BANNER_BASE64 } from './receiptAssets';

/**
 * Format numeric value in standard Indian currency style (e.g. 10,000.00)
 */
function formatMoney(num) {
  const n = Number(num) || 0;
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format dates into DD/MM/YYYY
 */
function formatDate(val) {
  if (!val || val === 'N/A' || val === '-') return '—';
  const d = new Date(val);
  if (!Number.isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return String(val);
}

/**
 * Parse numeric values safely
 */
function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = parseFloat(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Generate official Net Infotech System Pvt. Ltd. PDF Receipt / Quotation
 * matching the corporate layout exactly, without any watermark.
 */
export function generateReceiptPdf(rec, customer) {
  if (!rec) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const marginX = 10;
  const contentWidth = 190;

  // 1. Resolve Document Type & Title
  const isQuotation = Boolean(rec.isQuotation || rec.documentType === 'quotation');
  const docTitle = rec.documentTitle || (isQuotation ? 'Quotation' : 'Tax Invoice & Receipt');

  // 2. Resolve Customer Details
  const companyName = customer?.companyName || customer?.company || customer?.name || 'Customer Account';
  const contactName = customer?.name || customer?.contactPerson || '—';
  const email = customer?.email || '—';
  const phone = customer?.phone || customer?.mobile || customer?.contact || '—';
  const gstin = customer?.gstNo || customer?.gstin || 'Not Provided';
  
  const addressParts = [];
  if (customer?.address || customer?.street) addressParts.push(customer.address || customer.street);
  if (customer?.city) addressParts.push(customer.city);
  if (customer?.state) addressParts.push(customer.state);
  if (customer?.pincode) addressParts.push(`PIN: ${customer.pincode}`);
  const addressLine = addressParts.length > 0 ? addressParts.join(', ') : 'Kolkata, West Bengal, India';

  // 3. Resolve Receipt / Quotation Metadata
  const docDate = formatDate(rec.date || new Date());
  const expiryDate = formatDate(rec.expiryDate);
  const docNumber = rec.id || rec.invoiceNumber || 'INV-2026-0001';

  const statusStr = String(rec.status || 'paid').trim().toLowerCase();
  const isSettled = ['received', 'cleared', 'paid', 'active'].includes(statusStr);
  const statusLabel = isSettled ? 'PAID & VERIFIED' : (rec.status || 'RECORDED').toUpperCase();

  // 4. Financial Calculations
  let totalNum = toNumber(rec.totalAmount || rec.amount);
  let baseNum = toNumber(rec.baseAmount);
  let cgstNum = toNumber(rec.cgst);
  let sgstNum = toNumber(rec.sgst);

  if (baseNum === 0 && totalNum > 0) {
    baseNum = Math.round((totalNum / 1.18) * 100) / 100;
  }
  if (cgstNum === 0 && sgstNum === 0 && totalNum > baseNum) {
    const totalTax = Math.max(totalNum - baseNum, 0);
    cgstNum = Math.round((totalTax / 2) * 100) / 100;
    sgstNum = Math.round((totalTax - cgstNum) * 100) / 100;
  }
  if (totalNum === 0 && baseNum > 0) {
    totalNum = baseNum + cgstNum + sgstNum;
  }

  // 5. Document Title (Centered & Underlined)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(docTitle, 105, 57, { align: 'center' });
  const titleW = doc.getTextWidth(docTitle);
  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 0, 0);
  doc.line(105 - titleW / 2, 58, 105 + titleW / 2, 58);

  // 6. Left: BILL TO Badge & Details
  doc.setFillColor(204, 204, 204);
  doc.rect(marginX, 62, 70, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('BILL TO:', marginX + 1.5, 65.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(companyName, marginX, 70.5, { maxWidth: 95 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(20, 20, 20);
  doc.text(`Addr: ${addressLine}`, marginX, 74.5, { maxWidth: 95 });
  doc.text(`GSTIN: ${gstin} | Contact: ${contactName}`, marginX, 81.5, { maxWidth: 95 });
  doc.text(`Email: ${email} | Phone: ${phone}`, marginX, 85, { maxWidth: 95 });

  // 7. Right: Metadata Column
  const rightLabelX = 130;
  const rightValueX = 160;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(`${isQuotation ? 'Quotation' : 'Receipt'} Date :`, rightLabelX, 68);
  doc.setFont('helvetica', 'bold');
  doc.text(docDate, rightValueX, 68);

  doc.setFont('helvetica', 'normal');
  doc.text('Valid Until :', rightLabelX, 73);
  doc.setFont('helvetica', 'bold');
  doc.text(expiryDate, rightValueX, 73);

  doc.setFont('helvetica', 'normal');
  doc.text(`${isQuotation ? 'Quotation' : 'Receipt'} No :`, rightLabelX, 78);
  doc.setFont('helvetica', 'bold');
  doc.text(docNumber, rightValueX, 78);

  doc.setFont('helvetica', 'normal');
  doc.text('Payment Status :', rightLabelX, 83);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(isSettled ? [5, 150, 105] : [217, 119, 6]));
  doc.text(statusLabel, rightValueX, 83);

  // 8. Proposal / Subject Line
  const serviceName = rec.service || rec.productName || rec.planName || 'Cloud Services, Hosting & Implementation Services';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`Proposal for ${serviceName}`, marginX, 90.5, { maxWidth: contentWidth });

  // 9. Main Line Items Table
  const defaultBullets = [
    '• Enterprise Cloud Platform & High Availability Hosting',
    '• Automated daily snapshot backup & disaster recovery',
    '• Managed Firewall, DDoS mitigation & IP Access Control',
    '• 24x7 Priority Technical Support & Performance Monitoring'
  ].join('\n');

  const itemDescription = rec.description
    ? `${serviceName}\n${rec.description}`
    : `${serviceName}\n${defaultBullets}`;

  const qty = String(rec.quantity || '1');
  const uom = rec.uom || (rec.planDuration ? 'Term' : 'User');
  const taxDetailStr = `Rs. ${formatMoney(cgstNum + sgstNum)}\nCGST @9%:\n${formatMoney(cgstNum)}\nSGST @9%:\n${formatMoney(sgstNum)}`;

  autoTable(doc, {
    startY: 93,
    margin: { left: marginX, right: marginX, top: 58, bottom: 70 },
    head: [['Sr.\nNo', 'Description', 'Price', 'Qty', 'UOM', 'Sub-Total', 'Tax', 'Total']],
    body: [
      [
        '1',
        itemDescription,
        `Rs. ${formatMoney(baseNum)}`,
        qty,
        uom,
        `Rs. ${formatMoney(baseNum)}`,
        taxDetailStr,
        `Rs. ${formatMoney(totalNum)}`
      ],
      ['', '', '', '', '', '', 'Sub Total', `Rs. ${formatMoney(baseNum)}`],
      ['', '', '', '', '', '', 'Total Tax', `Rs. ${formatMoney(cgstNum + sgstNum)}`],
      ['', '', '', '', '', '', 'Grand Total', `Rs. ${formatMoney(totalNum)}`]
    ],
    headStyles: {
      fillColor: [204, 204, 204],
      textColor: [0, 0, 0],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.15,
      lineColor: [180, 180, 180]
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [0, 0, 0],
      valign: 'top',
      lineWidth: 0.15,
      lineColor: [200, 200, 200]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 64, halign: 'left' },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 24, halign: 'right' },
      6: { cellWidth: 24, halign: 'right' },
      7: { cellWidth: 24, halign: 'right' }
    },
    didParseCell: (data) => {
      // Highlight summary rows at bottom
      if (data.row.index >= 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
        if (data.column.index === 6) {
          data.cell.styles.halign = 'right';
        }
      }
    },
    theme: 'grid'
  });

  let currentY = doc.lastAutoTable.finalY + 4;

  // Check if remaining space is enough for Terms, Bank Details, and Signatory
  // Footer starts at Y = 230, so content must finish before 226
  if (currentY + 68 > 226) {
    doc.addPage();
    currentY = 58;
  }

  // 10. Term and Description Section
  doc.setFillColor(204, 204, 204);
  doc.rect(marginX, currentY, contentWidth, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('Term and Description', 105, currentY + 3.2, { align: 'center' });

  currentY += 6.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const terms = [
    '- Payment terms: 100% advance against order.',
    '- Net Infotech System Pvt Ltd. follows the privacy policy published on their official website (Click here to read the policy).',
    '- As an Enterprise Cloud & IT Infrastructure provider, we will sign up the non-disclosure agreement.',
    '- You always own your data and you are always free to export and download your data.',
    '- Service provisioning and access credentials are delivered within committed SLA upon payment confirmation.',
    '- This supply is covered under Forward Charge. Input Tax Credit (ITC) is available to the recipient as per GST Act rules.',
    '- To accomplish the setup within the decided timeframe, we need your timely input, configuration details, and feedback.'
  ];
  terms.forEach((t) => {
    doc.text(t, marginX + 1, currentY);
    currentY += 3.2;
  });

  currentY += 1.5;

  // 11. Bank Details Section
  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX, top: 58, bottom: 70 },
    head: [
      [
        {
          content: 'BANK DETAILS',
          colSpan: 2,
          styles: { halign: 'center', fillColor: [204, 204, 204], textColor: [0, 0, 0], fontStyle: 'bold' }
        }
      ]
    ],
    body: [
      ['Name - Net Infotech System Pvt Ltd', 'BANK NAME - Kotak Mahindra Bank'],
      ['BRANCH - Salt Lake, Kolkata', 'BRANCH ADDRESS - SALT LAKE CITY'],
      ['A/C NO - 3148101134', 'A/C TYPE - Current Account'],
      ['IFS CODE - KKBK0000326', 'MICR CODE - 700485018']
    ],
    bodyStyles: {
      fontSize: 6.5,
      fontStyle: 'bold',
      textColor: [0, 0, 0],
      cellPadding: 1.2,
      lineWidth: 0.15,
      lineColor: [180, 180, 180]
    },
    theme: 'grid'
  });

  currentY = doc.lastAutoTable.finalY + 4;

  // 12. Signatory Section
  const salesRepName = rec.salesPerson || rec.preparedBy || 'Debasish Chakraborty';
  const salesRepRole = rec.salesPersonRole || 'Senior Enterprise Consultant | Inbound Desk';
  const salesRepEmail = rec.salesPersonEmail || 'debasish@netinfotechsystem.com';
  const salesRepPhone = rec.salesPersonPhone || '+91-9330113000';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text('Prepared By,', marginX + 1, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(salesRepName, marginX + 1, currentY + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.text(salesRepRole, marginX + 1, currentY + 7);
  doc.text(`${salesRepEmail} | ${salesRepPhone}`, marginX + 1, currentY + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.text('NET INFOTECH SYSTEM PVT LTD', marginX + contentWidth, currentY + 3.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Authorized Signatory / Finance Desk', marginX + contentWidth, currentY + 7, { align: 'right' });

  // 13. Stamp Header and Footer Banner on EVERY page (Zero Watermark)
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    // Header Logo (Top)
    doc.addImage(NISPL_HEADER_LOGO_BASE64, 'PNG', marginX, 5, contentWidth, 49.65);
    // Footer Banner (Bottom)
    doc.addImage(NISPL_FOOTER_BANNER_BASE64, 'PNG', marginX, 297 - 66.65, contentWidth, 66.65);
  }

  // 14. Trigger Browser Download
  doc.save(`${isQuotation ? 'Quotation' : 'Receipt'}_${docNumber}.pdf`);
}
