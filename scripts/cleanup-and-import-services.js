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

const treatmentsFromSheet = [
  {
    name: 'PRP Skin Treatment',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Wrinkles & Acne scar.',
    refCode: 'DERMA-1',
    badge: '',
    concerns: 'Wrinkles; Acne scar; Dull skin',
  },
  {
    name: 'Glutathione IV',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Hyper pigmentation & Boosting skin radiance.',
    refCode: 'DERMA-3',
    badge: '',
    concerns: 'Hyper pigmentation; Boosting skin radiance; Enhance immunity and detoxification',
  },
  {
    name: 'Oxygeno Facial',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Nourishes the complexion giving a balanced healthy glow.',
    refCode: 'DERMA-6',
    badge: '',
    concerns: 'Skin tone; Evens texture; Nourishes the complexion giving a balanced healthy glow',
  },
  {
    name: 'Botox and Fillers',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Non-surgical treatments.',
    refCode: 'DERMA-8',
    badge: '',
    concerns: 'Non-surgical treatments; Long-lasting results for fine lines and wrinkles; Boosts collagen production',
  },
  {
    name: 'Microdermabrasion',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Epidermal resurfacing procedure & Skin exfoliation.',
    refCode: 'DERMA-9',
    badge: '',
    concerns: 'Epidermal resurfacing procedure; Skin exfoliation; Reduces acne scars',
  },
  {
    name: 'Anti Acne Treatments',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Reduces the acne scar & Open pores.',
    refCode: 'DERMA-12',
    badge: 'Popular',
    concerns: 'Reduces the acne scar; Open pores',
  },
  {
    name: 'MNRF & Meso Glow',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Reduces fine lines and wrinkles & Improves skin texture.',
    refCode: 'DERMA-14',
    badge: '',
    concerns: 'Reduces fine lines and wrinkles; Improves skin texture; Youthful-looking skin',
  },
  {
    name: 'Melasma Treatment',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Dull skin & Dark patches.',
    refCode: 'DERMA-15',
    badge: '',
    concerns: 'Dull skin; Dark patches; Anti-ageing',
  },
  {
    name: 'MNRF',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Reduces fine lines and wrinkles & Improves skin texture.',
    refCode: 'DERMA-16',
    badge: '',
    concerns: 'Reduces fine lines and wrinkles; Improves skin texture; Youthful-looking skin',
  },
  {
    name: 'Mesoglow',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Rejuvenation & Hydration.',
    refCode: 'DERMA-17',
    badge: '',
    concerns: 'Rejuvenation; Hydration; Skin brightening',
  },
  {
    name: 'Q Switch Laser',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Hyper pigmentation & Skin rejuvenation.',
    refCode: 'DERMA-18',
    badge: 'Clinical Laser',
    concerns: 'Hyper pigmentation; Skin rejuvenation; Freckles',
  },
  {
    name: 'Unwanted Hair Reduction (LHR Therapy)',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Laser Hair Reduction procedure.',
    refCode: 'DERMA-19',
    badge: '',
    concerns: 'Unwanted hair growth',
  },
  {
    name: 'PRF – Plasma Rich Fibrin',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Biofillers for anti-ageing & Gel-form filler.',
    refCode: 'DERMA-20',
    badge: '',
    concerns: 'Biofillers for anti-ageing; Gel-form filler; Extensive scars',
  },
  {
    name: 'Exo-Skin PRP',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Exosome combined growth-factor concentrate.',
    refCode: 'DERMA-21',
    badge: '',
    concerns: 'Medium to severe scars; Persistent acne; Collagen loss',
  },
  {
    name: 'Acne and Scar Guide',
    category: 'Skin Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Doctor recommended treatment pathways for specialized acne & scar conditions.',
    refCode: 'DERMA-22',
    badge: 'Doctor Guide',
    concerns: 'Scar; Acne mark; Active acne',
  },
  {
    name: 'PRP Hair Treatment',
    category: 'Hair Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Hair loss & Thinning hair.',
    refCode: 'TRICH-2',
    badge: '',
    concerns: 'Hair loss; Thinning hair; Dull hair appearance',
  },
  {
    name: 'Scalp Rejuvenation',
    category: 'Hair Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Dry scalp & Hair loss.',
    refCode: 'TRICH-4',
    badge: '',
    concerns: 'Dry scalp; Hair loss; Low blood flow',
  },
  {
    name: 'Hairfall Control & Regrowth',
    category: 'Hair Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Hair fall & Dull hair.',
    refCode: 'TRICH-5',
    badge: '',
    concerns: 'Hair fall; Dull hair; Rough hair appearance',
  },
  {
    name: 'GFC',
    category: 'Hair Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Reduces hair fall, increases hair thickness. Non-surgical and safe.',
    refCode: 'TRICH-7',
    badge: 'Popular',
    concerns: 'Reduces hair fall; Increases hair thickness; Non-surgical & safe',
  },
  {
    name: 'Oxygen Laser Therapy (OLT)',
    category: 'Hair Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Lesser hair & Breakage of hair follicles.',
    refCode: 'TRICH-10',
    badge: '',
    concerns: 'Lesser hair; Breakage of hair follicles; Dull hair appearance',
  },
  {
    name: 'Dandruff Treatment',
    category: 'Hair Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Clinical treatment protocol for Protein damage & Harmless white flakes.',
    refCode: 'TRICH-11',
    badge: '',
    concerns: 'Protein damage; Harmless white flakes; Weak hair',
  },
  {
    name: 'Hair Transplantation',
    category: 'Hair Care',
    duration: 30,
    price: 0,
    gstPercent: 18,
    description: 'Methods: Simultaneous Hair Transplant, Sapphire Hair Transplant and BIOFUE Hair Transplant.',
    refCode: 'TRICH-13',
    badge: '',
    concerns: 'Hair loss; Thinning hair; Dull hair appearance',
  },
  {
    name: 'Doctor Consultation Fee',
    category: 'Consultation',
    duration: 15,
    price: 0,
    gstPercent: 0,
    description: 'Clinical evaluation with dermoscopy and digital case notes.',
    refCode: 'CONSULT-1',
    badge: '',
    concerns: 'Consultation and clinical assessment',
  },
];

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  console.log('Connected to:', mongoose.connection.name);

  // 1. CLEAR TRANSACTIONAL & TEST DATA
  const collectionsToClear = [
    'appointments',
    'invoices',
    'visits',
    'customers',
    'patients',
    'customerpackages',
    'packagemasters',
    'consultations',
    'inventory',
    'products', // No products in xlsx sheet
  ];

  console.log('\n--- Clearing Transactional & Test Data ---');
  for (const col of collectionsToClear) {
    try {
      const res = await db.collection(col).deleteMany({});
      console.log(`✓ Cleared collection '${col}': deleted ${res.deletedCount} documents`);
    } catch (err) {
      console.log(`- Note for '${col}': ${err.message}`);
    }
  }

  // Drop temporary test collections if any
  try { await db.collection('teststore2').drop(); } catch (e) {}
  try { await db.collection('teststores').drop(); } catch (e) {}

  // 2. CLEAN USERS: KEEP EXACTLY 3 USERS (ADMIN, DOCTOR, STAFF)
  console.log('\n--- Resetting Users (Keep Only 3: Admin, Doctor, Staff) ---');
  await db.collection('users').deleteMany({});

  const standardStoreIds = ['NILA-TH', 'NILA-MD', 'NILA-CH', 'NILA-CB', 'NILA-TR', 'NILA-PORUR'];

  const threeUsers = [
    {
      username: 'admin',
      email: 'admin@nilaclinic.com',
      password: 'admin',
      name: 'Mohan Raj (Director)',
      role: 'admin',
      phone: '+91 98450 11223',
      primaryStoreId: 'NILA-TH',
      assignedStoreIds: standardStoreIds,
      isActive: true,
      salonName: 'Nila Clinic - Skin & Hair Care',
      branch: 'Theni Main Branch',
      createdAt: new Date(),
    },
    {
      username: 'doctor',
      email: 'doctor.theni@nilaclinic.com',
      password: 'doctor',
      name: 'Dr. Anitha Ramachandran',
      role: 'doctor',
      phone: '+91 98450 22334',
      primaryStoreId: 'NILA-TH',
      assignedStoreIds: standardStoreIds,
      isActive: true,
      specialization: 'Senior Dermatologist & Aesthetician',
      salonName: 'Nila Clinic - Skin & Hair Care',
      branch: 'Theni Main Branch',
      createdAt: new Date(),
    },
    {
      username: 'staff',
      email: 'staff.theni@nilaclinic.com',
      password: 'staff',
      name: 'Pooja Sharma',
      role: 'staff',
      phone: '+91 98450 55667',
      primaryStoreId: 'NILA-TH',
      assignedStoreIds: standardStoreIds,
      isActive: true,
      salonName: 'Nila Clinic - Skin & Hair Care',
      branch: 'Theni Main Branch',
      createdAt: new Date(),
    },
  ];

  const insertUsersRes = await db.collection('users').insertMany(threeUsers);
  console.log(`✓ Inserted 3 core users: Admin (admin@nilaclinic.com), Doctor (doctor.theni@nilaclinic.com), Staff (staff.theni@nilaclinic.com)`);

  // 3. CLEAN STAFFS: KEEP EXACTLY 3 CORRESPONDING STAFF MEMBERS
  console.log('\n--- Resetting Staff Master (Keep Exactly 3) ---');
  await db.collection('staffs').deleteMany({});

  const threeStaff = [
    {
      name: 'Mohan Raj (Director)',
      designation: 'Doctor',
      role: 'admin',
      mobile: '+91 98450 11223',
      email: 'admin@nilaclinic.com',
      stores: standardStoreIds,
      isActive: true,
      calendarColour: '#059669',
      createdAt: new Date(),
    },
    {
      name: 'Dr. Anitha Ramachandran',
      designation: 'Doctor',
      role: 'doctor',
      mobile: '+91 98450 22334',
      email: 'doctor.theni@nilaclinic.com',
      stores: standardStoreIds,
      isActive: true,
      calendarColour: '#0d9488',
      createdAt: new Date(),
    },
    {
      name: 'Pooja Sharma',
      designation: 'Front desk',
      role: 'staff',
      mobile: '+91 98450 55667',
      email: 'staff.theni@nilaclinic.com',
      stores: standardStoreIds,
      isActive: true,
      calendarColour: '#0284c7',
      createdAt: new Date(),
    },
  ];

  await db.collection('staffs').insertMany(threeStaff);
  console.log(`✓ Inserted 3 core staff members in Staff Master`);

  // 4. UPDATE SERVICES COLLECTION WITH 22 TREATMENTS FROM XLSX SHEET (+ CONSULTATION)
  console.log('\n--- Updating Services Master from Attached Sheet ---');
  await db.collection('services').deleteMany({});

  const servicesToInsert = treatmentsFromSheet.map((t, idx) => ({
    name: t.name,
    category: t.category,
    duration: t.duration,
    price: t.price,
    gstPercent: t.gstPercent,
    availableStores: ['ALL'],
    description: t.description,
    isActive: true,
    active: true,
    order: idx + 1,
    createdAt: new Date(),
  }));

  const servicesRes = await db.collection('services').insertMany(servicesToInsert);
  console.log(`✓ Successfully inserted ${servicesRes.insertedCount} services/treatments from sheet into MongoDB services collection`);

  // 5. UPDATE/SYNC TREATMENTS COLLECTION
  console.log('\n--- Syncing Treatments Collection with Sheet Data ---');
  for (const t of treatmentsFromSheet) {
    if (t.name === 'Doctor Consultation Fee') continue;
    const cat = t.category.toLowerCase().includes('skin') ? 'skin' : 'hair';
    await db.collection('treatments').updateOne(
      { name: t.name },
      {
        $set: {
          name: t.name,
          category: cat,
          doctorNote: t.description,
          badge: t.badge || '',
          updatedAt: new Date(),
        },
      },
      { upsert: false }
    );
  }
  console.log(`✓ Verified and synced treatments collection`);

  // Summary check
  console.log('\n=== FINAL DATABASE STATE SUMMARY ===');
  const cols = ['users', 'staffs', 'services', 'products', 'appointments', 'invoices', 'visits', 'customers', 'patients'];
  for (const c of cols) {
    const count = await db.collection(c).countDocuments();
    console.log(`- ${c}: ${count} documents`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

