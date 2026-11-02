const fs = require('fs');
const p = 'D:/website/website_homepage/website/Frontend/src/pages/login/Admin/overviewFilterData.js';
let src = fs.readFileSync(p, 'utf8');

const oldBlock = `  // Filter contracts matching the Financial Year
  let filteredContracts = contracts.filter((c) => {
    if (!c.startDate) return true;
    const year = parseInt(c.startDate.split('-')[0], 10);
    return year === startYear || year === endYear;
  });

  if (filteredContracts.length === 0) {
    filteredContracts = contracts.slice(0, metrics.kpi.enterpriseSLACount);
  }

  // Filter customer accounts matching target count
  let targetCustomers = [...customers];
  if (fy === '2025-2026') {
    targetCustomers = customers.slice(0, metrics.kpi.totalPipelineCount);
  } else if (fy === '2024-2025') {
    targetCustomers = customers.slice(0, metrics.kpi.totalPipelineCount);
  } else {
    targetCustomers = customers;
  }`;

const newBlock = `  // Filter contracts matching the Financial Year (proper FY date range: Apr startYear - Mar endYear)
  let filteredContracts = contracts.filter((c) => {
    const d = c.startDate || c.createdAt || c.expiryDate;
    if (!d) return true;
    const date = new Date(d);
    if (isNaN(date.getTime())) return true;
    const fyStart = new Date(startYear, 3, 1); // April 1 of startYear
    const fyEnd = new Date(endYear, 2, 31, 23, 59, 59); // March 31 of endYear
    return date >= fyStart && date <= fyEnd;
  });

  // Filter customer accounts matching the Financial Year
  let targetCustomers = customers.filter((c) => {
    const reg = c.registered || c.createdAt || '';
    if (!reg) return true;
    const date = new Date(reg);
    if (isNaN(date.getTime())) return true;
    const fyStart = new Date(startYear, 3, 1);
    const fyEnd = new Date(endYear, 2, 31, 23, 59, 59);
    return date >= fyStart && date <= fyEnd;
  });`;

if (!src.includes(oldBlock)) {
  // try CRLF
  const oldCRLF = oldBlock.replace(/\n/g, '\r\n');
  if (src.includes(oldCRLF)) {
    src = src.replace(oldCRLF, newBlock.replace(/\n/g, '\r\n'));
    fs.writeFileSync(p, src, 'utf8');
    console.log('done (CRLF)');
  } else {
    console.error('old block not found');
    process.exit(1);
  }
} else {
  src = src.replace(oldBlock, newBlock);
  fs.writeFileSync(p, src, 'utf8');
  console.log('done (LF)');
}
EOF