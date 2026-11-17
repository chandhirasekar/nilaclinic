const fs = require('fs');
const mongoose = require('mongoose');

// Read URI from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const uriLine = envFile.split('\n').find(l => l.startsWith('MONGODB_URI='));
if (!uriLine) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}
const MONGODB_URI = uriLine.replace('MONGODB_URI=', '').trim();

async function removeDummyData() {
  console.log('Connecting to MongoDB Atlas to remove dummy data...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to:', mongoose.connection.name);

  const db = mongoose.connection.db;
  const collections = [
    'stores',
    'users',
    'staffs',
    'services',
    'products',
    'paymentmodes',
    'packagemasters',
    'clinicsettings',
    'customers',
    'patients',
    'customerpackages',
    'appointments',
    'visits',
    'invoices',
  ];

  console.log('\n--- Removing Dummy Data (isDummyData: true) ---');
  for (const colName of collections) {
    try {
      const res = await db.collection(colName).deleteMany({ isDummyData: true });
      console.log(`✓ Cleaned ${colName}: removed ${res.deletedCount} dummy documents`);
    } catch (e) {
      console.error(`Error cleaning ${colName}:`, e.message);
    }
  }

  console.log('\n--- Removal Complete! All dummy testing data removed from MongoDB Atlas. ---');
  process.exit(0);
}

removeDummyData().catch(err => {
  console.error('REMOVAL FAILED:', err);
  process.exit(1);
});

