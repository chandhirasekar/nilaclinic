const mongoose = require('mongoose');

const uri = "mongodb://chandhirasekar76_db_user:chandhirasekar%407620@ac-oewk9ja-shard-00-00.uwhh84c.mongodb.net:27017,ac-oewk9ja-shard-00-01.uwhh84c.mongodb.net:27017,ac-oewk9ja-shard-00-02.uwhh84c.mongodb.net:27017/Neelaclinic?ssl=true&replicaSet=atlas-sfvqm2-shard-0&authSource=admin";

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('--- CUSTOMER PACKAGES FOR chandhirasekar ---');
  const custPackages = await db.collection('customerpackages').find({}).toArray();
  console.log(`Total customer packages in DB: ${custPackages.length}`);
  custPackages.forEach(cp => {
    console.log(cp._id, cp.customerName, cp.customerMobile, cp.packageName, 'used:', cp.usedSittings, 'remaining:', cp.remainingSittings, 'servicesRemaining:', JSON.stringify(cp.servicesRemaining));
  });

  console.log('\n--- INVOICES FOR chandhirasekar ---');
  const invs = await db.collection('invoices').find({
    $or: [{ customerName: /chand/i }, { customerMobile: /6381915110/ }]
  }).toArray();
  invs.forEach(i => {
    console.log(i.invoiceNo, 'date:', i.date, 'createdAt:', i.createdAt, 'status:', i.status, 'grandTotal:', i.grandTotal, 'paidAmount:', i.paidAmount, 'items:', JSON.stringify(i.items));
  });

  console.log('\n--- ALL INVOICE DATES & CREATEDAT SAMPLES ---');
  const sampleInvs = await db.collection('invoices').find({}).sort({ createdAt: -1 }).limit(10).toArray();
  sampleInvs.forEach(i => {
    console.log(i.invoiceNo, 'date:', i.date, 'createdAt:', i.createdAt, 'type:', typeof i.createdAt, 'grandTotal:', i.grandTotal, 'status:', i.status);
  });

  const now = new Date();
  console.log('\n--- DATE LOGIC CHECK ---');
  console.log('now ISO:', now.toISOString());
  console.log('now local:', now.toString());
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  console.log('startOfToday ISO:', startOfToday.toISOString());

  const countToday = await db.collection('invoices').countDocuments({
    $or: [
      { createdAt: { $gte: startOfToday } },
      { date: { $gte: startOfToday.toISOString().split('T')[0] } }
    ]
  });
  console.log('countToday (current filter):', countToday);

  const customDate = '2026-11-23';
  const selectedDayStart = new Date(customDate);
  selectedDayStart.setHours(0, 0, 0, 0);
  const selectedDayEnd = new Date(customDate);
  selectedDayEnd.setHours(23, 59, 59, 999);
  console.log('selectedDayStart:', selectedDayStart.toISOString(), 'selectedDayEnd:', selectedDayEnd.toISOString());

  const countCustom = await db.collection('invoices').countDocuments({
    $or: [
      { date: customDate },
      { createdAt: { $gte: selectedDayStart, $lte: selectedDayEnd } }
    ]
  });
  console.log('countCustom 2026-11-23:', countCustom);

  // Check 2026-11-22
  const customDate22 = '2026-11-22';
  const countCustom22 = await db.collection('invoices').countDocuments({
    $or: [
      { date: customDate22 },
      { createdAt: { $gte: new Date('2026-11-22T00:00:00.000Z'), $lte: new Date('2026-11-22T23:59:59.999Z') } }
    ]
  });
  console.log('countCustom 2026-11-22:', countCustom22);

  await mongoose.disconnect();
}

main().catch(console.error);

