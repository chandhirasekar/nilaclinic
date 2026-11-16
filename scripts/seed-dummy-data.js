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

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to:', mongoose.connection.name);

  const db = mongoose.connection.db;

  // 1. STORES (5 Stores)
  const stores = [
    {
      name: 'Nila Clinic - Theni Main Branch',
      code: 'NILA-TH',
      address: '42, Theni Main Road, Theni, Tamil Nadu - 625531',
      phone: '+91 98450 11223',
      email: 'theni@nilaclinic.com',
      gstin: '33ABCDE1234F1Z5',
      workingHours: { open: '09:00 AM', close: '08:00 PM', weeklyOff: 'Sunday' },
      invoicePrefix: 'NILA-TH-',
      nextInvoiceNumber: 1004,
      isActive: true,
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 30),
    },
    {
      name: 'Nila Clinic - Madurai City Outlet',
      code: 'NILA-MD',
      address: '18, West Veli Street, Madurai, Tamil Nadu - 625001',
      phone: '+91 98450 44556',
      email: 'madurai@nilaclinic.com',
      gstin: '33ABCDE1234F1Z5',
      workingHours: { open: '09:00 AM', close: '08:00 PM', weeklyOff: 'None' },
      invoicePrefix: 'NILA-MD-',
      nextInvoiceNumber: 1002,
      isActive: true,
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 25),
    },
    {
      name: 'Nila Clinic - Chennai Laser Hub',
      code: 'NILA-CH',
      address: '7, Anna Salai, Thousand Lights, Chennai, Tamil Nadu - 600002',
      phone: '+91 98450 77889',
      email: 'chennai@nilaclinic.com',
      gstin: '33ABCDE1234F1Z5',
      workingHours: { open: '10:00 AM', close: '08:30 PM', weeklyOff: 'Tuesday' },
      invoicePrefix: 'NILA-CH-',
      nextInvoiceNumber: 1002,
      isActive: true,
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 20),
    },
    {
      name: 'Nila Clinic - Coimbatore Aesthetic Center',
      code: 'NILA-CB',
      address: '104, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu - 641004',
      phone: '+91 98450 88991',
      email: 'coimbatore@nilaclinic.com',
      gstin: '33ABCDE1234F1Z5',
      workingHours: { open: '09:30 AM', close: '08:00 PM', weeklyOff: 'Sunday' },
      invoicePrefix: 'NILA-CB-',
      nextInvoiceNumber: 1001,
      isActive: true,
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 15),
    },
    {
      name: 'Nila Clinic - Tiruchirappalli Branch',
      code: 'NILA-TR',
      address: '25, Thillai Nagar Main Road, Trichy, Tamil Nadu - 620018',
      phone: '+91 98450 99002',
      email: 'trichy@nilaclinic.com',
      gstin: '33ABCDE1234F1Z5',
      workingHours: { open: '09:00 AM', close: '07:30 PM', weeklyOff: 'Wednesday' },
      invoicePrefix: 'NILA-TR-',
      nextInvoiceNumber: 1001,
      isActive: true,
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 10),
    },
  ];

  // 2. USERS (6 Users covering Admin, Doctors, Staff)
  const users = [
    {
      username: 'admin@nilaclinic.com',
      email: 'admin@nilaclinic.com',
      password: 'admin',
      name: 'Mohan Raj (Director)',
      role: 'admin',
      phone: '+91 98450 11223',
      primaryStoreId: 'NILA-TH',
      assignedStoreIds: ['NILA-TH', 'NILA-MD', 'NILA-CH', 'NILA-CB', 'NILA-TR'],
      isActive: true,
      salonName: 'Nila Clinic - Skin & Hair Care',
      branch: 'Theni Main Branch',
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      username: 'doctor.theni@nilaclinic.com',
      email: 'doctor.theni@nilaclinic.com',
      password: 'doctor',
      name: 'Dr. Anitha Ramachandran',
      role: 'doctor',
      phone: '+91 98450 22334',
      primaryStoreId: 'NILA-TH',
      assignedStoreIds: ['NILA-TH'],
      isActive: true,
      specialization: 'Senior Dermatologist & Aesthetician',
      salonName: 'Nila Clinic - Skin & Hair Care',
      branch: 'Theni Main Branch',
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      username: 'doctor.madurai@nilaclinic.com',
      email: 'doctor.madurai@nilaclinic.com',
      password: 'doctor',
      name: 'Dr. Rajesh Varma',
      role: 'doctor',
      phone: '+91 98450 33445',
      primaryStoreId: 'NILA-MD',
      assignedStoreIds: ['NILA-MD'],
      isActive: true,
      specialization: 'Trichologist & Hair Transplant Surgeon',
      salonName: 'Nila Clinic - Skin & Hair Care',
      branch: 'Madurai City Outlet',
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      username: 'doctor.chennai@nilaclinic.com',
      email: 'doctor.chennai@nilaclinic.com',
      password: 'doctor',
      name: 'Dr. Priya Dharshini',
      role: 'doctor',
      phone: '+91 98450 44556',
      primaryStoreId: 'NILA-CH',
      assignedStoreIds: ['NILA-CH'],
      isActive: true,
      specialization: 'Cosmetologist & Laser Specialist',
      salonName: 'Nila Clinic - Skin & Hair Care',
      branch: 'Chennai Laser Hub',
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      username: 'staff.theni@nilaclinic.com',
      email: 'staff.theni@nilaclinic.com',
      password: 'staff',
      name: 'Pooja Sharma',
      role: 'staff',
      phone: '+91 98450 55667',
      primaryStoreId: 'NILA-TH',
      assignedStoreIds: ['NILA-TH'],
      isActive: true,
      salonName: 'Nila Clinic - Skin & Hair Care',
      branch: 'Theni Main Branch',
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      username: 'staff.madurai@nilaclinic.com',
      email: 'staff.madurai@nilaclinic.com',
      password: 'staff',
      name: 'Kavitha Sundar',
      role: 'staff',
      phone: '+91 98450 66778',
      primaryStoreId: 'NILA-MD',
      assignedStoreIds: ['NILA-MD'],
      isActive: true,
      salonName: 'Nila Clinic - Skin & Hair Care',
      branch: 'Madurai City Outlet',
      isDummyData: true,
      createdAt: new Date(),
    },
  ];

  // 3. STAFF DIRECTORY (6 Staff Members)
  const staffs = [
    {
      name: 'Dr. Anitha Ramachandran',
      mobile: '+91 98450 22334',
      email: 'doctor.theni@nilaclinic.com',
      designation: 'Doctor',
      stores: ['NILA-TH'],
      workingHours: { start: '09:00 AM', end: '05:00 PM' },
      calendarColour: '#0ea5e9',
      showInAppointmentCalendar: true,
      hasLogin: true,
      loginRole: 'Doctor',
      commissionRate: 15,
      status: 'Available',
      revenueGenerated: 15500,
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Dr. Rajesh Varma',
      mobile: '+91 98450 33445',
      email: 'doctor.madurai@nilaclinic.com',
      designation: 'Doctor',
      stores: ['NILA-MD'],
      workingHours: { start: '10:00 AM', end: '06:00 PM' },
      calendarColour: '#8b5cf6',
      showInAppointmentCalendar: true,
      hasLogin: true,
      loginRole: 'Doctor',
      commissionRate: 15,
      status: 'Available',
      revenueGenerated: 12499,
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Dr. Priya Dharshini',
      mobile: '+91 98450 44556',
      email: 'doctor.chennai@nilaclinic.com',
      designation: 'Doctor',
      stores: ['NILA-CH'],
      workingHours: { start: '11:00 AM', end: '07:00 PM' },
      calendarColour: '#ec4899',
      showInAppointmentCalendar: true,
      hasLogin: true,
      loginRole: 'Doctor',
      commissionRate: 12,
      status: 'Available',
      revenueGenerated: 18000,
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Pooja Sharma',
      mobile: '+91 98450 55667',
      email: 'staff.theni@nilaclinic.com',
      designation: 'Front desk',
      stores: ['NILA-TH'],
      workingHours: { start: '09:00 AM', end: '08:00 PM' },
      calendarColour: '#10b981',
      showInAppointmentCalendar: false,
      hasLogin: true,
      loginRole: 'Staff',
      commissionRate: 2,
      status: 'Available',
      revenueGenerated: 21540,
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Kavitha Sundar',
      mobile: '+91 98450 66778',
      email: 'staff.madurai@nilaclinic.com',
      designation: 'Front desk',
      stores: ['NILA-MD'],
      workingHours: { start: '09:00 AM', end: '08:00 PM' },
      calendarColour: '#f59e0b',
      showInAppointmentCalendar: false,
      hasLogin: true,
      loginRole: 'Staff',
      commissionRate: 2,
      status: 'Available',
      revenueGenerated: 8500,
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Sujatha (Therapist)',
      mobile: '+91 98450 77889',
      email: 'sujatha@nilaclinic.com',
      designation: 'Therapist',
      stores: ['NILA-TH', 'NILA-MD'],
      workingHours: { start: '09:30 AM', end: '06:30 PM' },
      calendarColour: '#06b6d4',
      showInAppointmentCalendar: true,
      hasLogin: false,
      commissionRate: 5,
      status: 'Available',
      revenueGenerated: 14200,
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
  ];

  // 4. SERVICES (6 Clinical & Aesthetic Services)
  const services = [
    {
      name: 'Hydra Facial & Glowing Treatment',
      category: 'Skin Care',
      duration: 45,
      price: 2499,
      gstPercent: 18,
      availableStores: ['ALL'],
      description: 'Deep pore cleansing, vacuum exfoliation, and antioxidant hydration',
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Q-Switch Nd:YAG Laser',
      category: 'Laser Treatments',
      duration: 30,
      price: 3500,
      gstPercent: 18,
      availableStores: ['ALL'],
      description: 'Pigmentation removal, skin brightening, and carbon peel treatment',
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Laser Hair Reduction (Full Face)',
      category: 'Laser Treatments',
      duration: 30,
      price: 2999,
      gstPercent: 18,
      availableStores: ['ALL'],
      description: 'Triple wavelength diode laser for painless facial hair reduction',
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Keratin Scalp Therapy',
      category: 'Hair & Scalp',
      duration: 60,
      price: 3200,
      gstPercent: 18,
      availableStores: ['ALL'],
      description: 'Micro-needling follicle nourishment with peptide ampoules',
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Doctor Consultation Fee',
      category: 'Consultation',
      duration: 15,
      price: 500,
      gstPercent: 0,
      availableStores: ['ALL'],
      description: 'Clinical evaluation with dermoscopy and digital case notes',
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Glycolic Acid Glow Peel (35%)',
      category: 'Chemical Peels',
      duration: 30,
      price: 1800,
      gstPercent: 18,
      availableStores: ['ALL'],
      description: 'Exfoliating glow peel for post-acne blemishes and tone evening',
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
  ];

  // 5. PRODUCTS (5 Dermatological Products)
  const products = [
    {
      name: 'Nila Sunscreen Broad Spectrum SPF 50+',
      category: 'Sun Protection',
      sku: 'NILA-SPF50',
      price: 650,
      gstPercent: 18,
      availableStores: ['ALL'],
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Niacinamide 10% Clarifying Serum (30ml)',
      category: 'Serums',
      sku: 'NILA-NIA10',
      price: 890,
      gstPercent: 18,
      availableStores: ['ALL'],
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Redensyl Pro Hair Growth Spray (60ml)',
      category: 'Hair Care',
      sku: 'NILA-RDN60',
      price: 1250,
      gstPercent: 18,
      availableStores: ['ALL'],
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Salicylic Acid 2% Anti-Acne Cleanser (100ml)',
      category: 'Cleansers',
      sku: 'NILA-SAL02',
      price: 499,
      gstPercent: 18,
      availableStores: ['ALL'],
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Advanced Vitamin C 15% Glow Drops (20ml)',
      category: 'Serums',
      sku: 'NILA-VITC15',
      price: 1150,
      gstPercent: 18,
      availableStores: ['ALL'],
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
  ];

  // 6. PAYMENT MODES (5 Payment Modes)
  const paymentModes = [
    { name: 'Cash', type: 'cash', displayOrder: 1, isActive: true, isDummyData: true },
    { name: 'Card', type: 'non-cash', displayOrder: 2, isActive: true, isDummyData: true },
    { name: 'UPI', type: 'non-cash', displayOrder: 3, isActive: true, isDummyData: true },
    { name: 'NEFT', type: 'non-cash', displayOrder: 4, isActive: true, isDummyData: true },
    { name: 'Bajaj Health EMI', type: 'non-cash', displayOrder: 5, isActive: true, isDummyData: true },
  ];

  // 7. PACKAGE MASTERS (5 Fixed & On-demand Packages)
  const packages = [
    {
      name: 'Skin Brightening Laser Pack (6 Sittings)',
      type: 'Fixed',
      services: [
        { serviceId: 'svc-2', serviceName: 'Q-Switch Nd:YAG Laser', count: 6, valuePerSitting: 2500 }
      ],
      products: [],
      totalSittings: 6,
      price: 15000,
      valuePerSitting: 2500,
      validityDays: 180,
      availableStores: ['ALL'],
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Hydra Glow & Hair Revive Combo (4 Sittings)',
      type: 'Fixed',
      services: [
        { serviceId: 'svc-1', serviceName: 'Hydra Facial & Glowing Treatment', count: 2, valuePerSitting: 2250 },
        { serviceId: 'svc-4', serviceName: 'Keratin Scalp Therapy', count: 2, valuePerSitting: 2250 }
      ],
      products: [],
      totalSittings: 4,
      price: 9000,
      valuePerSitting: 2250,
      validityDays: 120,
      availableStores: ['ALL'],
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Full Face Painless Laser Hair Reduction (8 Sittings)',
      type: 'Fixed',
      services: [
        { serviceId: 'svc-3', serviceName: 'Laser Hair Reduction (Full Face)', count: 8, valuePerSitting: 2250 }
      ],
      products: [],
      totalSittings: 8,
      price: 18000,
      valuePerSitting: 2250,
      validityDays: 365,
      availableStores: ['ALL'],
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Hair Regrowth Peptide Protocol (6 Sittings)',
      type: 'Fixed',
      services: [
        { serviceId: 'svc-4', serviceName: 'Keratin Scalp Therapy', count: 6, valuePerSitting: 2417 }
      ],
      products: [],
      totalSittings: 6,
      price: 14500,
      valuePerSitting: 2417,
      validityDays: 180,
      availableStores: ['ALL'],
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      name: 'Custom Aesthetic Protocol (On-demand - 6 Sittings)',
      type: 'On-demand',
      services: [
        { serviceId: 'svc-1', serviceName: 'Hydra Facial & Glowing Treatment', count: 3, valuePerSitting: 2250 },
        { serviceId: 'svc-6', serviceName: 'Glycolic Acid Glow Peel (35%)', count: 3, valuePerSitting: 2250 }
      ],
      products: [],
      totalSittings: 6,
      price: 13500,
      valuePerSitting: 2250,
      validityDays: 180,
      availableStores: ['ALL'],
      isActive: true,
      isDummyData: true,
      createdAt: new Date(),
    },
  ];

  // 8. CLINIC SETTINGS
  const clinicSettings = {
    clinicName: 'Nila Clinic - Skin & Hair Care',
    logoUrl: '/logo.png',
    address: '42, Theni Main Road, Theni, Tamil Nadu - 625531',
    phone: '+91 98450 11223',
    email: 'info@nilaclinic.com',
    gstin: '33ABCDE1234F1Z5',
    billFooter: 'Thank you for choosing Nila Clinic! We care for your skin and hair.',
    printSize: '80mm',
    gstOnBills: false,
    maxStaffDiscountPercent: 10,
    staffCanEditPrice: false,
    backDatedBillingRoles: ['admin'],
    slotInterval: 15,
    packageUseInOtherStores: true,
    sharingOfCaseNotes: true,
    staffCanExport: false,
    endOfDayEmail: {
      enabled: false,
      recipients: ['admin@nilaclinic.com'],
      sendTime: '21:30',
      format: 'combined',
      attachExcel: true,
    },
    isDummyData: true,
    updatedAt: new Date(),
  };

  // 9. CUSTOMERS / PATIENTS (5 Patients)
  const customers = [
    {
      customerId: 'CID-1001',
      name: 'Priya Sharma',
      mobile: '+91 98450 11223',
      phone: '+91 98450 11223',
      gender: 'Female',
      dob: '1994-06-12',
      email: 'priya.sharma@example.com',
      area: 'Theni North',
      allergyNotes: 'Allergic to sulfa drugs and topical benzoyl peroxide above 5%',
      skinHairNotes: 'Oily T-zone, prone to hormonal acne, Grade II open comedones',
      firstStoreId: 'NILA-TH',
      visits: 4,
      totalSpent: 19500,
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 20),
    },
    {
      customerId: 'CID-1002',
      name: 'Deepa Lakshmi',
      mobile: '+91 98765 88990',
      phone: '+91 98765 88990',
      gender: 'Female',
      dob: '1988-11-24',
      email: 'deepa.lakshmi@example.com',
      area: 'Bodinayakanur, Theni',
      allergyNotes: 'None reported',
      skinHairNotes: 'Dry scalp, mild thinning at hairline, sensitive cheek skin',
      firstStoreId: 'NILA-TH',
      visits: 2,
      totalSpent: 4400,
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 15),
    },
    {
      customerId: 'CID-1003',
      name: 'Sangeetha Mohan',
      mobile: '+91 94431 55667',
      phone: '+91 94431 55667',
      gender: 'Female',
      dob: '1991-03-18',
      email: 'sangeetha.m@example.com',
      area: 'KK Nagar, Madurai',
      allergyNotes: 'Sensitive to fragrance in skincare creams',
      skinHairNotes: 'Hyperpigmentation on cheeks (melasma patch), dull texture',
      firstStoreId: 'NILA-MD',
      visits: 3,
      totalSpent: 11499,
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 12),
    },
    {
      customerId: 'CID-1004',
      name: 'Karthik Subramanian',
      mobile: '+91 98401 22334',
      phone: '+91 98401 22334',
      gender: 'Male',
      dob: '1990-09-05',
      email: 'karthik.sub@example.com',
      area: 'Anna Nagar, Chennai',
      allergyNotes: 'No allergies known',
      skinHairNotes: 'Coarse beard hair, seeking laser shaping; prone to ingrown hairs',
      firstStoreId: 'NILA-CH',
      visits: 2,
      totalSpent: 5998,
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 8),
    },
    {
      customerId: 'CID-1005',
      name: 'Meena Kumari',
      mobile: '+91 97890 44556',
      phone: '+91 97890 44556',
      gender: 'Female',
      dob: '1985-01-30',
      email: 'meenakumari@example.com',
      area: 'RS Puram, Coimbatore',
      allergyNotes: 'Asthma history; mild dust allergy',
      skinHairNotes: 'Fine lines around eyes, uneven texture, seeking anti-aging assessment',
      firstStoreId: 'NILA-CB',
      visits: 1,
      totalSpent: 500,
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 3),
    },
  ];

  // 10. CUSTOMER PACKAGES (5 Customer Packages)
  const customerPackages = [
    {
      customerId: 'CID-1001',
      packageId: 'pkg-1',
      packageName: 'Skin Brightening Laser Pack (6 Sittings)',
      storeSold: 'NILA-TH',
      purchaseInvoiceNo: 'NILA-TH-1002',
      servicesRemaining: [
        { serviceName: 'Q-Switch Nd:YAG Laser', totalCount: 6, usedCount: 2, remainingCount: 4 }
      ],
      totalSittings: 6,
      usedSittings: 2,
      remainingSittings: 4,
      validityExpiryDate: new Date(Date.now() + 86400000 * 150).toISOString().split('T')[0],
      status: 'Active',
      adjustmentHistory: [],
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 10),
    },
    {
      customerId: 'CID-1002',
      packageId: 'pkg-2',
      packageName: 'Hydra Glow & Hair Revive Combo (4 Sittings)',
      storeSold: 'NILA-TH',
      purchaseInvoiceNo: 'NILA-TH-1003',
      servicesRemaining: [
        { serviceName: 'Hydra Facial & Glowing Treatment', totalCount: 2, usedCount: 1, remainingCount: 1 },
        { serviceName: 'Keratin Scalp Therapy', totalCount: 2, usedCount: 0, remainingCount: 2 }
      ],
      totalSittings: 4,
      usedSittings: 1,
      remainingSittings: 3,
      validityExpiryDate: new Date(Date.now() + 86400000 * 100).toISOString().split('T')[0],
      status: 'Active',
      adjustmentHistory: [],
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 5),
    },
    {
      customerId: 'CID-1003',
      packageId: 'pkg-5',
      packageName: 'Custom Aesthetic Protocol (On-demand - 6 Sittings)',
      storeSold: 'NILA-MD',
      purchaseInvoiceNo: 'NILA-MD-1001',
      servicesRemaining: [
        { serviceName: 'Hydra Facial & Glowing Treatment', totalCount: 3, usedCount: 1, remainingCount: 2 },
        { serviceName: 'Glycolic Acid Glow Peel (35%)', totalCount: 3, usedCount: 0, remainingCount: 3 }
      ],
      totalSittings: 6,
      usedSittings: 1,
      remainingSittings: 5,
      validityExpiryDate: new Date(Date.now() + 86400000 * 160).toISOString().split('T')[0],
      status: 'Active',
      adjustmentHistory: [],
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 7),
    },
    {
      customerId: 'CID-1004',
      packageId: 'pkg-3',
      packageName: 'Full Face Painless Laser Hair Reduction (8 Sittings)',
      storeSold: 'NILA-CH',
      purchaseInvoiceNo: 'NILA-CH-1001',
      servicesRemaining: [
        { serviceName: 'Laser Hair Reduction (Full Face)', totalCount: 8, usedCount: 2, remainingCount: 6 }
      ],
      totalSittings: 8,
      usedSittings: 2,
      remainingSittings: 6,
      validityExpiryDate: new Date(Date.now() + 86400000 * 300).toISOString().split('T')[0],
      status: 'Active',
      adjustmentHistory: [],
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 8),
    },
    {
      customerId: 'CID-1005',
      packageId: 'pkg-1',
      packageName: 'Skin Brightening Laser Pack (6 Sittings)',
      storeSold: 'NILA-CB',
      purchaseInvoiceNo: 'NILA-CB-1001',
      servicesRemaining: [
        { serviceName: 'Q-Switch Nd:YAG Laser', totalCount: 6, usedCount: 0, remainingCount: 6 }
      ],
      totalSittings: 6,
      usedSittings: 0,
      remainingSittings: 6,
      validityExpiryDate: new Date(Date.now() + 86400000 * 180).toISOString().split('T')[0],
      status: 'Active',
      adjustmentHistory: [],
      isDummyData: true,
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
  ];

  // 11. APPOINTMENTS (5 Appointments)
  const todayStr = new Date().toISOString().split('T')[0];
  const appointments = [
    {
      appointmentId: 'APP-1001',
      customerId: 'CID-1001',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98450 11223',
      serviceName: 'Q-Switch Nd:YAG Laser',
      serviceId: 'svc-2',
      doctorId: 'user-doc-1',
      doctorName: 'Dr. Anitha Ramachandran',
      staffName: 'Dr. Anitha Ramachandran',
      staffId: 'staff-1',
      storeId: 'NILA-TH',
      date: todayStr,
      startTime: '10:00 AM',
      durationMins: 30,
      status: 'Arrived',
      notes: 'Third sitting of laser pigmentation toning',
      amount: 3500,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      appointmentId: 'APP-1002',
      customerId: 'CID-1002',
      customerName: 'Deepa Lakshmi',
      customerPhone: '+91 98765 88990',
      serviceName: 'Keratin Scalp Therapy',
      serviceId: 'svc-4',
      staffName: 'Sujatha (Therapist)',
      staffId: 'staff-6',
      storeId: 'NILA-TH',
      date: todayStr,
      startTime: '11:30 AM',
      durationMins: 60,
      status: 'Booked',
      notes: 'Initial scalp detox & micro-needling',
      amount: 3200,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      appointmentId: 'APP-1003',
      customerId: 'CID-1003',
      customerName: 'Sangeetha Mohan',
      customerPhone: '+91 94431 55667',
      serviceName: 'Hydra Facial & Glowing Treatment',
      serviceId: 'svc-1',
      doctorId: 'user-doc-2',
      doctorName: 'Dr. Rajesh Varma',
      staffName: 'Dr. Rajesh Varma',
      staffId: 'staff-2',
      storeId: 'NILA-MD',
      date: todayStr,
      startTime: '02:00 PM',
      durationMins: 45,
      status: 'In consultation',
      notes: 'Monthly skin rejuvenation session',
      amount: 2499,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      appointmentId: 'APP-1004',
      customerId: 'CID-1004',
      customerName: 'Karthik Subramanian',
      customerPhone: '+91 98401 22334',
      serviceName: 'Laser Hair Reduction (Full Face)',
      serviceId: 'svc-3',
      doctorId: 'user-doc-3',
      doctorName: 'Dr. Priya Dharshini',
      staffName: 'Dr. Priya Dharshini',
      staffId: 'staff-3',
      storeId: 'NILA-CH',
      date: todayStr,
      startTime: '04:15 PM',
      durationMins: 30,
      status: 'Booked',
      notes: 'Second sitting of beard line diode laser',
      amount: 2999,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      appointmentId: 'APP-1005',
      customerId: 'CID-1005',
      customerName: 'Meena Kumari',
      customerPhone: '+91 97890 44556',
      serviceName: 'Doctor Consultation Fee',
      serviceId: 'svc-5',
      doctorId: 'user-doc-1',
      doctorName: 'Dr. Anitha Ramachandran',
      staffName: 'Dr. Anitha Ramachandran',
      staffId: 'staff-1',
      storeId: 'NILA-TH',
      date: todayStr,
      startTime: '09:30 AM',
      durationMins: 15,
      status: 'Completed',
      notes: 'Anti-aging skin assessment',
      amount: 500,
      isDummyData: true,
      createdAt: new Date(),
    },
  ];

  // 12. VISITS / DOCTOR QUEUE (5 Patient Visits)
  const visits = [
    {
      visitId: 'VIS-1001',
      patientId: 'CID-1001',
      patientName: 'Priya Sharma',
      patientPhone: '+91 98450 11223',
      storeId: 'NILA-TH',
      doctorId: 'user-doc-1',
      doctorName: 'Dr. Anitha Ramachandran',
      status: 'Waiting',
      caseNotes: 'Chief complaints: Persistent acne eruption on chin and forehead. Grade II comedones.',
      isReadByDoctor: false,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      visitId: 'VIS-1002',
      patientId: 'CID-1002',
      patientName: 'Deepa Lakshmi',
      patientPhone: '+91 98765 88990',
      storeId: 'NILA-TH',
      doctorId: 'user-doc-1',
      doctorName: 'Dr. Anitha Ramachandran',
      status: 'Waiting',
      caseNotes: 'Chief complaints: Scalp itching with dry flakes and hair shedding around temples.',
      isReadByDoctor: false,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      visitId: 'VIS-1003',
      patientId: 'CID-1003',
      patientName: 'Sangeetha Mohan',
      patientPhone: '+91 94431 55667',
      storeId: 'NILA-MD',
      doctorId: 'user-doc-2',
      doctorName: 'Dr. Rajesh Varma',
      status: 'In consultation',
      caseNotes: 'Chief complaints: Severe post-inflammatory hyperpigmentation on cheeks after sunburn.',
      isReadByDoctor: true,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      visitId: 'VIS-1004',
      patientId: 'CID-1004',
      patientName: 'Karthik Subramanian',
      patientPhone: '+91 98401 22334',
      storeId: 'NILA-CH',
      doctorId: 'user-doc-3',
      doctorName: 'Dr. Priya Dharshini',
      status: 'Waiting',
      caseNotes: 'Chief complaints: Excess facial hair growth extending to neck; razor bump folliculitis.',
      isReadByDoctor: false,
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      visitId: 'VIS-1005',
      patientId: 'CID-1005',
      patientName: 'Meena Kumari',
      patientPhone: '+91 97890 44556',
      storeId: 'NILA-TH',
      doctorId: 'user-doc-1',
      doctorName: 'Dr. Anitha Ramachandran',
      status: 'Done',
      caseNotes: 'Chief complaints: Fine lines around eyes, loss of skin elasticity. Diagnosis: Photoaging Grade I.',
      prescriptionText: '1. Tab Vitamin C 500mg 1-0-0 x 30 days\n2. Nila Sunscreen SPF 50+ generously every 4 hours\n3. Tretinoin cream 0.025% nightly',
      billId: 'NILA-TH-1001',
      isReadByDoctor: true,
      isDummyData: true,
      createdAt: new Date(Date.now() - 3600000),
      consultedAt: new Date(Date.now() - 3500000),
    },
  ];

  // 13. INVOICES / BILLS (5 Invoices)
  const invoices = [
    {
      invoiceNo: 'NILA-TH-1001',
      storeId: 'NILA-TH',
      customerId: 'CID-1005',
      customerName: 'Meena Kumari',
      customerMobile: '+91 97890 44556',
      customerPhone: '+91 97890 44556',
      date: todayStr,
      items: [
        {
          type: 'service',
          itemId: 'svc-5',
          name: 'Doctor Consultation (Dr. Anitha Ramachandran)',
          staffName: 'Dr. Anitha Ramachandran',
          quantity: 1,
          price: 500,
          discountPercent: 0,
          total: 500,
        },
      ],
      subtotal: 500,
      rowDiscountTotal: 0,
      discount: 0,
      tax: 0,
      grandTotal: 500,
      payableAmount: 500,
      payments: [{ mode: 'UPI', amount: 500, type: 'non-cash' }],
      paidAmount: 500,
      changeAmount: 0,
      paymentMethod: 'UPI',
      remarks: 'Consultation fee paid via UPI',
      status: 'Paid',
      staffName: 'Dr. Anitha Ramachandran',
      visitId: 'VIS-1005',
      isDummyData: true,
      createdAt: new Date(Date.now() - 3600000),
      paidAt: new Date(Date.now() - 3500000),
    },
    {
      invoiceNo: 'NILA-TH-1002',
      storeId: 'NILA-TH',
      customerId: 'CID-1001',
      customerName: 'Priya Sharma',
      customerMobile: '+91 98450 11223',
      customerPhone: '+91 98450 11223',
      date: todayStr,
      items: [
        {
          type: 'package',
          itemId: 'pkg-1',
          name: 'Skin Brightening Laser Pack (6 Sittings)',
          staffName: 'Pooja Sharma',
          quantity: 1,
          price: 15000,
          discountPercent: 0,
          total: 15000,
        },
      ],
      subtotal: 15000,
      rowDiscountTotal: 0,
      billDiscountType: 'value',
      billDiscountValue: 0,
      discount: 0,
      tax: 0,
      grandTotal: 15000,
      payableAmount: 15000,
      payments: [
        { mode: 'Cash', amount: 5000, type: 'cash' },
        { mode: 'Card', amount: 10000, type: 'non-cash' },
      ],
      paidAmount: 15000,
      changeAmount: 0,
      paymentMethod: 'Split (Cash+Card)',
      remarks: 'Package sale with split payment: ₹5000 Cash + ₹10000 Card',
      status: 'Paid',
      staffName: 'Pooja Sharma',
      isDummyData: true,
      createdAt: new Date(Date.now() - 7200000),
      paidAt: new Date(Date.now() - 7100000),
    },
    {
      invoiceNo: 'NILA-TH-1003',
      storeId: 'NILA-TH',
      customerId: 'CID-1002',
      customerName: 'Deepa Lakshmi',
      customerMobile: '+91 98765 88990',
      customerPhone: '+91 98765 88990',
      date: todayStr,
      items: [
        {
          type: 'product',
          itemId: 'prod-1',
          name: 'Nila Sunscreen Broad Spectrum SPF 50+',
          staffName: 'Pooja Sharma',
          quantity: 1,
          price: 650,
          discountPercent: 0,
          total: 650,
        },
        {
          type: 'product',
          itemId: 'prod-2',
          name: 'Niacinamide 10% Clarifying Serum (30ml)',
          staffName: 'Pooja Sharma',
          quantity: 1,
          price: 890,
          discountPercent: 0,
          total: 890,
        },
      ],
      subtotal: 1540,
      rowDiscountTotal: 0,
      billDiscountType: 'value',
      billDiscountValue: 0,
      discount: 0,
      tax: 0,
      grandTotal: 1540,
      payableAmount: 1540,
      payments: [{ mode: 'Cash', amount: 1540, type: 'cash' }],
      paidAmount: 1540,
      changeAmount: 460,
      paymentMethod: 'Cash',
      remarks: 'Cash tendered ₹2000, change returned ₹460',
      status: 'Paid',
      staffName: 'Pooja Sharma',
      isDummyData: true,
      createdAt: new Date(Date.now() - 10800000),
      paidAt: new Date(Date.now() - 10700000),
    },
    {
      invoiceNo: 'NILA-MD-1001',
      storeId: 'NILA-MD',
      customerId: 'CID-1003',
      customerName: 'Sangeetha Mohan',
      customerMobile: '+91 94431 55667',
      customerPhone: '+91 94431 55667',
      date: todayStr,
      items: [
        {
          type: 'service',
          itemId: 'svc-1',
          name: 'Hydra Facial & Glowing Treatment',
          staffName: 'Dr. Rajesh Varma',
          quantity: 1,
          price: 2499,
          discountPercent: 0,
          total: 2499,
        },
      ],
      subtotal: 2499,
      rowDiscountTotal: 0,
      discount: 0,
      tax: 0,
      grandTotal: 2499,
      payableAmount: 2499,
      payments: [],
      paidAmount: 0,
      changeAmount: 0,
      paymentMethod: 'Unpaid',
      remarks: 'Generated upon doctor consultation, awaiting cashier collection',
      status: 'Unpaid',
      staffName: 'Kavitha Sundar',
      visitId: 'VIS-1003',
      isDummyData: true,
      createdAt: new Date(),
    },
    {
      invoiceNo: 'NILA-CH-1001',
      storeId: 'NILA-CH',
      customerId: 'CID-1004',
      customerName: 'Karthik Subramanian',
      customerMobile: '+91 98401 22334',
      customerPhone: '+91 98401 22334',
      date: todayStr,
      items: [
        {
          type: 'service',
          itemId: 'svc-3',
          name: 'Laser Hair Reduction (Full Face)',
          staffName: 'Dr. Priya Dharshini',
          quantity: 1,
          price: 2999,
          discountPercent: 0,
          total: 2999,
        },
      ],
      subtotal: 2999,
      rowDiscountTotal: 0,
      discount: 0,
      tax: 0,
      grandTotal: 2999,
      payableAmount: 2999,
      payments: [{ mode: 'UPI', amount: 2999, type: 'non-cash' }],
      paidAmount: 2999,
      changeAmount: 0,
      paymentMethod: 'UPI',
      remarks: 'Direct UPI payment QR code scan',
      status: 'Paid',
      staffName: 'Dr. Priya Dharshini',
      isDummyData: true,
      createdAt: new Date(Date.now() - 14400000),
      paidAt: new Date(Date.now() - 14300000),
    },
  ];

  // SEED OPERATIONS: upsert or clean insert dummy data tagged with isDummyData: true
  console.log('\n--- Seeding MongoDB Collections ---');

  // 1. Stores
  await db.collection('stores').deleteMany({ isDummyData: true });
  for (const s of stores) {
    await db.collection('stores').updateOne({ code: s.code }, { $set: s }, { upsert: true });
  }
  console.log(`✓ Stores seeded: ${stores.length}`);

  // 2. Users
  await db.collection('users').deleteMany({ isDummyData: true });
  for (const u of users) {
    await db.collection('users').updateOne({ email: u.email }, { $set: u }, { upsert: true });
  }
  console.log(`✓ Users seeded: ${users.length}`);

  // 3. Staffs
  await db.collection('staffs').deleteMany({ isDummyData: true });
  for (const st of staffs) {
    await db.collection('staffs').updateOne({ mobile: st.mobile }, { $set: st }, { upsert: true });
  }
  console.log(`✓ Staff directory seeded: ${staffs.length}`);

  // 4. Services
  await db.collection('services').deleteMany({ isDummyData: true });
  for (const sv of services) {
    await db.collection('services').updateOne({ name: sv.name }, { $set: sv }, { upsert: true });
  }
  console.log(`✓ Services seeded: ${services.length}`);

  // 5. Products
  await db.collection('products').deleteMany({ isDummyData: true });
  for (const p of products) {
    await db.collection('products').updateOne({ name: p.name }, { $set: p }, { upsert: true });
  }
  console.log(`✓ Products seeded: ${products.length}`);

  // 6. Payment Modes
  await db.collection('paymentmodes').deleteMany({ isDummyData: true });
  for (const pm of paymentModes) {
    await db.collection('paymentmodes').updateOne({ name: pm.name }, { $set: pm }, { upsert: true });
  }
  console.log(`✓ Payment modes seeded: ${paymentModes.length}`);

  // 7. Packages Master
  await db.collection('packagemasters').deleteMany({ isDummyData: true });
  for (const pkg of packages) {
    await db.collection('packagemasters').updateOne({ name: pkg.name }, { $set: pkg }, { upsert: true });
  }
  console.log(`✓ Package masters seeded: ${packages.length}`);

  // 8. Clinic Settings
  await db.collection('clinicsettings').deleteMany({ isDummyData: true });
  await db.collection('clinicsettings').insertOne(clinicSettings);
  console.log(`✓ Clinic settings seeded: 1`);

  // 9. Customers & Patients
  await db.collection('customers').deleteMany({ isDummyData: true });
  for (const c of customers) {
    await db.collection('customers').updateOne({ customerId: c.customerId }, { $set: c }, { upsert: true });
  }
  console.log(`✓ Customers seeded: ${customers.length}`);

  // Also seed patients collection for legacy route backwards compatibility
  await db.collection('patients').deleteMany({ isDummyData: true });
  for (const c of customers) {
    const patientObj = {
      patientId: c.customerId,
      name: c.name,
      phone: c.mobile,
      email: c.email,
      gender: c.gender,
      age: 28,
      address: c.area,
      storeId: c.firstStoreId,
      visits: c.visits,
      totalSpent: c.totalSpent,
      notes: c.skinHairNotes,
      isDummyData: true,
      createdAt: c.createdAt,
    };
    await db.collection('patients').updateOne({ patientId: patientObj.patientId }, { $set: patientObj }, { upsert: true });
  }
  console.log(`✓ Patients seeded: ${customers.length}`);

  // 10. Customer Packages
  await db.collection('customerpackages').deleteMany({ isDummyData: true });
  for (const cp of customerPackages) {
    await db.collection('customerpackages').updateOne(
      { customerId: cp.customerId, packageName: cp.packageName },
      { $set: cp },
      { upsert: true }
    );
  }
  console.log(`✓ Customer packages seeded: ${customerPackages.length}`);

  // 11. Appointments
  await db.collection('appointments').deleteMany({ isDummyData: true });
  for (const ap of appointments) {
    await db.collection('appointments').updateOne(
      { appointmentId: ap.appointmentId },
      { $set: ap },
      { upsert: true }
    );
  }
  console.log(`✓ Appointments seeded: ${appointments.length}`);

  // 12. Visits (Doctor Consultation Queue)
  await db.collection('visits').deleteMany({ isDummyData: true });
  for (const v of visits) {
    await db.collection('visits').updateOne(
      { visitId: v.visitId },
      { $set: v },
      { upsert: true }
    );
  }
  console.log(`✓ Visits / Doctor Queue seeded: ${visits.length}`);

  // 13. Invoices / Bills
  await db.collection('invoices').deleteMany({ isDummyData: true });
  for (const inv of invoices) {
    await db.collection('invoices').updateOne(
      { invoiceNo: inv.invoiceNo },
      { $set: inv },
      { upsert: true }
    );
  }
  console.log(`✓ Invoices seeded: ${invoices.length}`);

  console.log('\n--- Seeding Completed Successfully! All collections now have dummy data in MongoDB Atlas. ---');
  process.exit(0);
}

seed().catch(err => {
  console.error('SEEDING FAILED:', err);
  process.exit(1);
});
