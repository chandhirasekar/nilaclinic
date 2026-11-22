async function test() {
  const payload = {
    invoiceNo: 'NILA-TH-1023',
    storeId: 'NILA-TH',
    customerId: 'CID-1029',
    customerName: 'test000',
    customerMobile: '9000000000',
    date: '2026-11-22',
    items: [
      {
        type: 'service',
        itemId: 'svc-5',
        name: 'Doctor Consultation (Dr. Anitha Ramachandran)',
        staffName: 'Dr. Anitha Ramachandran',
        quantity: 1,
        price: 500,
        total: 500,
      },
      {
        type: 'service',
        itemId: 'svc-1',
        name: 'Hydra Facial & Glowing Treatment',
        staffName: 'Dr. Anitha Ramachandran',
        quantity: 1,
        price: 2499,
        total: 2499,
      }
    ],
    subtotal: 2999,
    discount: 0,
    tax: 0,
    grandTotal: 2999,
    payableAmount: 2999,
    payments: [{ mode: 'Cash', amount: 2999, type: 'cash' }],
    paidAmount: 2999,
    changeAmount: 0,
    paymentMethod: 'Cash',
    staffName: 'Pooja Sharma',
    staffRole: 'staff',
    status: 'Paid'
  };

  const res = await fetch('http://localhost:3000/api/pos/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Status code:', res.status);
  console.log('Response data:', JSON.stringify(data, null, 2));
}

test().catch(console.error);

