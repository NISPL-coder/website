const fs = require('fs');

// 1. Update CustomerSection.jsx
let custCode = fs.readFileSync('Frontend/src/pages/login/Admin/CustomerSection.jsx', 'utf8');

if (!custCode.includes("import ViewCustomerModal from './ViewCustomerModal';")) {
  custCode = custCode.replace(
    "import EditCustomerModal from './EditCustomerModal';",
    "import ViewCustomerModal from './ViewCustomerModal';\nimport EditCustomerModal from './EditCustomerModal';"
  );
}

const startMarker = '{/* 6. Customer Inspection Modal with Direct Sangam CRM Deep Link */}';
const endMarker = '{/* Edit Customer Modal */}';

const startIndex = custCode.indexOf(startMarker);
const endIndex = custCode.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `{/* View Customer Modal (React Portal) */}
      <ViewCustomerModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onEdit={(cust) => {
          setSelectedCustomer(null);
          setEditingCustomer(cust);
        }}
        onRetrySync={handleRetrySync}
        isSyncing={selectedCustomer ? !!syncingIds[selectedCustomer.id || selectedCustomer.customerId] : false}
      />

      `;
  custCode = custCode.substring(0, startIndex) + replacement + custCode.substring(endIndex);
  fs.writeFileSync('Frontend/src/pages/login/Admin/CustomerSection.jsx', custCode, 'utf8');
  console.log('Successfully updated CustomerSection.jsx');
} else {
  console.log('CustomerSection markers already updated or not found');
}

