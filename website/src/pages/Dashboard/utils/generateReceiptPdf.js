import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to convert number to Indian currency words
function numberToWords(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'Zero Rupees Only';

  function convertGroup(n) {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
    } else if (n > 0) {
      str += a[n];
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

  // 2. Company Info (Left)
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

  // 3. Invoice Header Badge (Right)
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(125, 12, 71, 30, 2, 2, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(125, 12, 71, 30, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('GST TAX INVOICE & RECEIPT', 129, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  doc.text(`Receipt No:`, 129, 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${rec.id}`, 155, 25);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text(`Date of Issue:`, 129, 30);
  doc.setTextColor(...darkTextColor);
  doc.text(`${rec.date}`, 155, 30);

  doc.setTextColor(...mutedTextColor);
  doc.text(`Expiry Date:`, 129, 35);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // green
  doc.text(`${rec.expiryDate || 'N/A'}`, 155, 35);

  // Divider
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.line(14, 47, 196, 47);

  // 4. Billed To (Customer Details) Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 52, 182, 30, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(14, 52, 182, 30, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...mutedTextColor);
  doc.text('BILLED TO (CUSTOMER DETAILS)', 18, 58);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkTextColor);
  doc.text(customer?.companyName || 'Enterprise Node Client', 18, 64);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  doc.text(`Contact Person: ${customer?.name || 'Authorized Representative'}`, 18, 69);
  doc.text(`Email: ${customer?.email || 'accounts@client.in'}`, 18, 74);
  doc.text(`Customer ID: ${customer?.customerId || 'NIS-CUST-849201'}`, 18, 79);

  // Right column inside Billed To box
  doc.text(`GSTIN / UIN:`, 115, 64);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text(`${customer?.gstNo || '19AAAAA0000A1Z5'}`, 140, 64);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text(`Payment Mode:`, 115, 69);
  doc.setTextColor(...darkTextColor);
  doc.text(`${rec.paymentMode || 'Online Banking'}`, 140, 69);

  doc.setTextColor(...mutedTextColor);
  doc.text(`Payment Status:`, 115, 74);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`PAID & VERIFIED`, 140, 74);

  // 5. Line Items Table (jspdf-autotable)
  const baseNum = parseFloat(rec.baseAmount?.replace(/[^\d.]/g, '') || '4500');
  const cgstNum = parseFloat(rec.cgst?.replace(/[^\d.]/g, '') || '405');
  const sgstNum = parseFloat(rec.sgst?.replace(/[^\d.]/g, '') || '405');
  const totalNum = parseFloat(rec.totalAmount?.replace(/[^\d.]/g, '') || '5310');

  autoTable(doc, {
    startY: 88,
    margin: { left: 14, right: 14 },
    head: [['#', 'Service Description', 'SAC Code', 'Valid Period', 'Rate (₹)', 'Taxable Amount (₹)']],
    body: [
      [
        '1',
        rec.service,
        rec.sacCode || '998313',
        `${rec.date} to ${rec.expiryDate || 'N/A'}`,
        `₹${baseNum.toFixed(2)}`,
        `₹${baseNum.toFixed(2)}`
      ]
    ],
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 4,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 72 },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 36, halign: 'center' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' }
    },
    theme: 'grid',
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.2
  });

  const finalY = doc.lastAutoTable.finalY || 120;

  // 6. Detailed Calculations Part (Box at the Bottom)
  const calcBoxX = 115;
  const calcBoxY = finalY + 6;
  const calcBoxW = 81;
  const calcBoxH = 46;

  // Left Note Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, calcBoxY, 94, calcBoxH, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(14, calcBoxY, 94, calcBoxH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkTextColor);
  doc.text('AMOUNT IN WORDS:', 18, calcBoxY + 8);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextColor);
  doc.text(numberToWords(totalNum), 18, calcBoxY + 14, { maxWidth: 86 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkTextColor);
  doc.text('TAX CREDIT DECLARATION:', 18, calcBoxY + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedTextColor);
  doc.text('This supply is covered under Forward Charge. Input tax credit is available to recipient as per GST Act rules.', 18, calcBoxY + 31, { maxWidth: 86 });

  // Right Calculations Table
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(calcBoxX, calcBoxY, calcBoxW, calcBoxH, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(calcBoxX, calcBoxY, calcBoxW, calcBoxH, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);

  // Base
  doc.text('Taxable Base Amount:', calcBoxX + 4, calcBoxY + 8);
  doc.setTextColor(...darkTextColor);
  doc.text(`₹${baseNum.toFixed(2)}`, calcBoxX + calcBoxW - 4, calcBoxY + 8, { align: 'right' });

  // CGST
  doc.setTextColor(...mutedTextColor);
  doc.text('CGST @ 9%:', calcBoxX + 4, calcBoxY + 15);
  doc.setTextColor(...darkTextColor);
  doc.text(`₹${cgstNum.toFixed(2)}`, calcBoxX + calcBoxW - 4, calcBoxY + 15, { align: 'right' });

  // SGST
  doc.setTextColor(...mutedTextColor);
  doc.text('SGST @ 9%:', calcBoxX + 4, calcBoxY + 22);
  doc.setTextColor(...darkTextColor);
  doc.text(`₹${sgstNum.toFixed(2)}`, calcBoxX + calcBoxW - 4, calcBoxY + 22, { align: 'right' });

  // Total Tax
  doc.setTextColor(...mutedTextColor);
  doc.text('Total GST (18%):', calcBoxX + 4, calcBoxY + 29);
  doc.setTextColor(...darkTextColor);
  doc.text(`₹${(cgstNum + sgstNum).toFixed(2)}`, calcBoxX + calcBoxW - 4, calcBoxY + 29, { align: 'right' });

  // Grand Total Line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(calcBoxX + 2, calcBoxY + 34, calcBoxX + calcBoxW - 2, calcBoxY + 34);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL PAID (INR):', calcBoxX + 4, calcBoxY + 41);
  doc.text(`₹${totalNum.toFixed(2)}`, calcBoxX + calcBoxW - 4, calcBoxY + 41, { align: 'right' });

  // 7. Signatory & Footer
  const signY = calcBoxY + calcBoxH + 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextColor);
  doc.text('Terms & Conditions:', 14, signY);
  doc.text('1. Subscription license is activated instantly upon payment confirmation.', 14, signY + 5);
  doc.text(`2. Service validity remains active up to ${rec.expiryDate || 'expiry date'}.`, 14, signY + 9);
  doc.text('3. This is a computer-verified, digitally authorized tax receipt.', 14, signY + 13);

  // Official Seal & Signatory Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkTextColor);
  doc.text('For NET INFOTECH SYSTEM PVT. LTD.', 135, signY);

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(135, signY + 4, 58, 14, 2, 2, 'FD');
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(8);
  doc.text('DIGITALLY SIGNED & VERIFIED', 138, signY + 10);
  doc.setFontSize(7);
  doc.text('Authorized Finance Controller', 138, signY + 15);

  // Bottom Footer Bar
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedTextColor);
  doc.text('Net Infotech System Pvt. Ltd. | CIN: U72200WB2010PTC148921 | Kolkata Datacenter Cluster', 105, 292, { align: 'center' });

  // Trigger browser download
  doc.save(`Receipt_${rec.id}.pdf`);
}
