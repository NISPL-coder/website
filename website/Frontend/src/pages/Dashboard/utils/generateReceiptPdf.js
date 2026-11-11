import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to format numeric values to Indian currency style (e.g. 10,000.00)
function formatMoney(num) {
  const n = Number(num) || 0;
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Helper to convert number to Indian currency words
function numberToWords(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'Zero Rupees Only';

  function convertGroup(val) {
    let str = '';
    if (val >= 100) {
      str += a[Math.floor(val / 100)] + ' Hundred ';
      val %= 100;
    }
    if (val >= 20) {
      str += b[Math.floor(val / 10)] + ' ' + a[val % 10];
    } else if (val > 0) {
      str += a[val];
    }
    return str.trim();
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const hundreds = rem;

  if (crore) words += convertGroup(crore) + ' Crore ';
  if (lakh) words += convertGroup(lakh) + ' Lakh ';
  if (thousand) words += convertGroup(thousand) + ' Thousand ';
  if (hundreds) words += convertGroup(hundreds) + ' ';

  return words.trim() + ' Rupees Only';
}

/**
 * Generate and download professional GST Payment Receipt PDF
 */
export function generateReceiptPdf(rec, customer) {
  if (!rec) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [29, 78, 216];    // #1d4ed8
  const darkTextColor = [15, 23, 42];     // #0f172a
  const bodyTextColor = [51, 65, 85];     // #334155
  const mutedTextColor = [100, 116, 139]; // #64748b
  const borderColor = [226, 232, 240];    // #e2e8f0

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 5, 'F');

  // 2. Company Info (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...darkTextColor);
  doc.text('NET INFOTECH SYSTEM PVT. LTD.', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextColor);
  doc.text('Certified Tally 3-Star Partner & Enterprise Cloud Provider', 14, 21);
  doc.text('Webel Tower 1, IT Park, BN Block, Sector V, Salt Lake City', 14, 25);
  doc.text('Kolkata, West Bengal - 700091 | Support: +91-9330113000', 14, 29);
  doc.text('Email: billing@netinfotechsystem.com | Web: www.nispl.in', 14, 33);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text('GSTIN: 19AAACN8491A1Z8  |  PAN: AAACN8491A', 14, 38);

  // 3. Invoice Header Badge (Right)
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(120, 10, 76, 31, 2, 2, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(120, 10, 76, 31, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('GST TAX INVOICE & RECEIPT', 124, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextColor);
  doc.text('Receipt No:', 124, 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${rec.id || 'INV-2026-0001'}`, 150, 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text('Date of Issue:', 124, 27);
  doc.setTextColor(...darkTextColor);
  doc.text(`${rec.date || '—'}`, 150, 27);

  doc.setTextColor(...mutedTextColor);
  doc.text('Valid Till / Term:', 124, 32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // green
  const expiryBadgeText =
    rec.expiryDate && rec.expiryDate !== 'N/A' && rec.expiryDate !== '-'
      ? rec.expiryDate
      : 'Active Subscription';
  doc.text(expiryBadgeText, 150, 32);

  // Divider Line
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(14, 44, 196, 44);

  // 4. Billed To (Customer Details) Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 48, 182, 32, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(14, 48, 182, 32, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextColor);
  doc.text('BILLED TO (CUSTOMER DETAILS)', 18, 54);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkTextColor);
  doc.text(
    customer?.companyName || customer?.company || customer?.name || 'Customer Account',
    18,
    60,
    { maxWidth: 90 }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...bodyTextColor);
  doc.text(`Contact Person: ${customer?.name || customer?.contactPerson || '—'}`, 18, 65, { maxWidth: 90 });
  doc.text(`Email: ${customer?.email || '—'}`, 18, 70, { maxWidth: 90 });
  doc.text(`Customer ID: ${customer?.customerId || customer?.id || '—'}`, 18, 75);

  // Right column inside Billed To box
  const billedRightLabelX = 114;
  const billedRightValX = 142;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text('GSTIN / UIN:', billedRightLabelX, 60);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${customer?.gstNo || customer?.gstin || 'Not on record'}`, billedRightValX, 60);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text('Payment Mode:', billedRightLabelX, 65);
  doc.setTextColor(...darkTextColor);
  doc.text(
    `${rec.paymentMode || 'Online'}${rec.bankName ? ` (${rec.bankName})` : ''}`,
    billedRightValX,
    65,
    { maxWidth: 52 }
  );

  const ledgerStatus = String(rec.status || '').trim();
  const isSettled = ['received', 'cleared', 'paid'].includes(ledgerStatus.toLowerCase());

  doc.setTextColor(...mutedTextColor);
  doc.text('Payment Status:', billedRightLabelX, 70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(isSettled ? [5, 150, 105] : [217, 119, 6]));
  doc.text(isSettled ? 'PAID & VERIFIED' : (ledgerStatus || 'RECORDED').toUpperCase(), billedRightValX, 70);

  const bankReference = String(rec.referenceNumber || rec.transactionId || '').trim();
  if (bankReference) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedTextColor);
    doc.text('Reference ID:', billedRightLabelX, 75);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkTextColor);
    doc.text(bankReference, billedRightValX, 75, { maxWidth: 52 });
  }

  // 5. Line Items Table (jspdf-autotable)
  const toNumber = (value) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const parsed = parseFloat(String(value ?? '').replace(/[^\d.]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  let totalNum = toNumber(rec.totalAmount);
  let baseNum = toNumber(rec.baseAmount);
  let cgstNum = toNumber(rec.cgst);
  let sgstNum = toNumber(rec.sgst);

  // Auto-calculate base & tax breakdown if gross total was stored
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

  const validPeriodText =
    rec.expiryDate && rec.expiryDate !== 'N/A' && rec.expiryDate !== '-'
      ? `${rec.date} to ${rec.expiryDate}`
      : rec.date
      ? `${rec.date} (Active)`
      : 'Active';

  autoTable(doc, {
    startY: 85,
    margin: { left: 14, right: 14 },
    head: [['#', 'Service Description', 'SAC Code', 'Valid Period', 'Rate (INR)', 'Taxable Amount (INR)']],
    body: [
      [
        '1',
        rec.service || 'Cloud Services Hosting & Infrastructure',
        rec.sacCode || '998313',
        validPeriodText,
        formatMoney(baseNum),
        formatMoney(baseNum)
      ]
    ],
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle'
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: { top: 3.5, bottom: 3.5, left: 2.5, right: 2.5 },
      valign: 'middle',
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 64, halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 36, halign: 'center' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 26, halign: 'right' }
    },
    theme: 'grid',
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.2
  });

  const finalY = doc.lastAutoTable.finalY || 115;
  const boxY = finalY + 6;
  const boxH = 46;

  // 6. Left Note Box (Amount in Words & GST Declarations)
  const noteBoxX = 14;
  const noteBoxW = 94;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(noteBoxX, boxY, noteBoxW, boxH, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(noteBoxX, boxY, noteBoxW, boxH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkTextColor);
  doc.text('AMOUNT IN WORDS:', noteBoxX + 4, boxY + 7);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...bodyTextColor);
  doc.text(numberToWords(totalNum), noteBoxX + 4, boxY + 13, { maxWidth: noteBoxW - 8 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkTextColor);
  doc.text('TAX CREDIT DECLARATION:', noteBoxX + 4, boxY + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...mutedTextColor);
  doc.text(
    'This supply is covered under Forward Charge. Input tax credit is available to recipient as per GST Act rules.',
    noteBoxX + 4,
    boxY + 31,
    { maxWidth: noteBoxW - 8 }
  );

  // 7. Right Calculations Box (Summary & Totals)
  const calcBoxX = 112;
  const calcBoxW = 84;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(calcBoxX, boxY, calcBoxW, boxH, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(calcBoxX, boxY, calcBoxW, boxH, 2, 2, 'S');

  const rightAlignX = calcBoxX + calcBoxW - 5;
  const leftLabelX = calcBoxX + 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextColor);

  // Base
  doc.text('Taxable Base Amount:', leftLabelX, boxY + 7);
  doc.setTextColor(...darkTextColor);
  doc.text(`Rs. ${formatMoney(baseNum)}`, rightAlignX, boxY + 7, { align: 'right' });

  // CGST / SGST / GST Split
  if (cgstNum > 0 || sgstNum > 0) {
    doc.setTextColor(...mutedTextColor);
    doc.text('CGST @ 9%:', leftLabelX, boxY + 14);
    doc.setTextColor(...darkTextColor);
    doc.text(`Rs. ${formatMoney(cgstNum)}`, rightAlignX, boxY + 14, { align: 'right' });

    doc.setTextColor(...mutedTextColor);
    doc.text('SGST @ 9%:', leftLabelX, boxY + 21);
    doc.setTextColor(...darkTextColor);
    doc.text(`Rs. ${formatMoney(sgstNum)}`, rightAlignX, boxY + 21, { align: 'right' });

    doc.setTextColor(...mutedTextColor);
    doc.text('Total GST (18%):', leftLabelX, boxY + 28);
    doc.setTextColor(...darkTextColor);
    doc.text(`Rs. ${formatMoney(cgstNum + sgstNum)}`, rightAlignX, boxY + 28, { align: 'right' });
  } else {
    doc.setTextColor(...mutedTextColor);
    doc.text('GST (18%):', leftLabelX, boxY + 14);
    doc.setTextColor(...darkTextColor);
    doc.text('Included in gross amount', rightAlignX, boxY + 14, { align: 'right' });
  }

  // Grand Total Divider Line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.4);
  doc.line(leftLabelX, boxY + 33, rightAlignX, boxY + 33);

  // Grand Total Paid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL PAID (INR):', leftLabelX, boxY + 40);
  doc.text(`Rs. ${formatMoney(totalNum)}`, rightAlignX, boxY + 40, { align: 'right' });

  // 8. Terms & Signatory Section
  const signY = boxY + boxH + 12;

  // Terms & Conditions (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkTextColor);
  doc.text('Terms & Conditions:', 14, signY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...mutedTextColor);
  doc.text('1. Subscription license is activated upon payment confirmation.', 14, signY + 5);
  doc.text('2. Computer-generated electronic tax invoice per Section 31 of CGST Act.', 14, signY + 9);
  doc.text('3. Input Tax Credit (ITC) subject to applicable return filing rules.', 14, signY + 13);

  // Official Seal & Signatory Box (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkTextColor);
  doc.text('For NET INFOTECH SYSTEM PVT. LTD.', 122, signY);

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(122, signY + 4, 74, 15, 2, 2, 'FD');

  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DIGITALLY SIGNED & VERIFIED', 126, signY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  doc.text('Authorized Finance Controller | Electronic Tax Invoice', 126, signY + 15);

  // 9. Bottom Document Footer Bar
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(0, 287, 210, 287);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...mutedTextColor);
  doc.text(
    'Net Infotech System Pvt. Ltd. | CIN: U72200WB2010PTC148921 | Sector V, Salt Lake, Kolkata Cloud NOC Cluster',
    105,
    293,
    { align: 'center' }
  );

  // Trigger browser download
  doc.save(`Receipt_${rec.id || 'INV'}.pdf`);
}
