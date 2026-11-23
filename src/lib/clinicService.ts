import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Store from '@/lib/models/Store';
import User from '@/lib/models/User';
import Staff from '@/lib/models/Staff';
import Service from '@/lib/models/Service';
import Product from '@/lib/models/Product';
import PaymentMode from '@/lib/models/PaymentMode';
import ClinicSetting from '@/lib/models/ClinicSetting';
import Customer from '@/lib/models/Customer';
import Invoice from '@/lib/models/Invoice';
import Visit from '@/lib/models/Visit';
import Appointment from '@/lib/models/Appointment';
import PackageMaster from '@/lib/models/PackageMaster';
import CustomerPackage from '@/lib/models/CustomerPackage';
import {
  IStore,
  IStaff,
  IService,
  IProduct,
  IPaymentMode,
  IClinicSettings,
  ICustomer,
  IInvoice,
  IUser,
  IVisit,
  IAppointment,
  IPackageMaster,
  ICustomerPackage,
} from '@/types';

import { getStoreAliases, canonicalStoreCode } from '@/lib/storeHelpers';
export { getStoreAliases, canonicalStoreCode };

// Helper for consistent local calendar dates (YYYY-MM-DD) avoiding UTC offset skew
export function getLocalDateString(d: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

class ClinicService {
  // In-memory initial seed state with 5 rich dummy data records for all entities
  private stores: IStore[] = [
    {
      _id: 'store-thn',
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
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      _id: 'store-mdu',
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
      createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    },
    {
      _id: 'store-chn',
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
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
    {
      _id: 'store-cbe',
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
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      _id: 'store-trc',
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
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ];

  private users: IUser[] = [
    {
      _id: 'user-admin-1',
      email: 'admin@nilaclinic.com',
      password: 'admin',
      name: 'Mohan Raj (Administrator)',
      role: 'admin',
      phone: '+91 98450 00001',
      assignedStoreIds: ['NILA-TH', 'NILA-MD', 'NILA-CH', 'NILA-CB', 'NILA-TR', 'THN', 'MDU', 'CHN'],
      primaryStoreId: 'NILA-TH',
      isActive: true,
    },
    {
      _id: 'user-doc-1',
      email: 'doctor.theni@nilaclinic.com',
      password: 'doctor',
      name: 'Dr. Anitha Ramachandran',
      role: 'doctor',
      phone: '+91 98450 22334',
      assignedStoreIds: ['NILA-TH', 'THN'],
      primaryStoreId: 'NILA-TH',
      specialization: 'Senior Dermatologist & Aesthetician',
      isActive: true,
    },
    {
      _id: 'user-doc-2',
      email: 'doctor.madurai@nilaclinic.com',
      password: 'doctor',
      name: 'Dr. Rajesh Varma',
      role: 'doctor',
      phone: '+91 98450 33445',
      assignedStoreIds: ['NILA-MD', 'MDU'],
      primaryStoreId: 'NILA-MD',
      specialization: 'Consultant Trichologist & Hair Transplant',
      isActive: true,
    },
    {
      _id: 'user-doc-3',
      email: 'doctor.chennai@nilaclinic.com',
      password: 'doctor',
      name: 'Dr. Priya Dharshini',
      role: 'doctor',
      phone: '+91 98450 44556',
      assignedStoreIds: ['NILA-CH', 'NILA-CB', 'CHN'],
      primaryStoreId: 'NILA-CH',
      specialization: 'Laser Specialist & Facial Aesthetics',
      isActive: true,
    },
    {
      _id: 'user-staff-1',
      email: 'staff.theni@nilaclinic.com',
      password: 'staff',
      name: 'Pooja Sharma',
      role: 'staff',
      phone: '+91 98450 55667',
      assignedStoreIds: ['NILA-TH', 'THN'],
      primaryStoreId: 'NILA-TH',
      isActive: true,
    },
    {
      _id: 'user-staff-2',
      email: 'staff.madurai@nilaclinic.com',
      password: 'staff',
      name: 'Kavitha Sundar',
      role: 'staff',
      phone: '+91 98450 66778',
      assignedStoreIds: ['NILA-MD', 'MDU'],
      primaryStoreId: 'NILA-MD',
      isActive: true,
    },
  ];

  private staff: IStaff[] = [
    {
      _id: 'staff-1',
      name: 'Dr. Anitha Ramachandran',
      mobile: '+91 98450 22334',
      email: 'doctor.theni@nilaclinic.com',
      designation: 'Doctor',
      stores: ['NILA-TH'],
      calendarColour: '#0284c7',
      showInAppointmentCalendar: true,
      hasLogin: true,
      loginRole: 'Doctor',
      isActive: true,
    },
    {
      _id: 'staff-2',
      name: 'Dr. Rajesh Varma',
      mobile: '+91 98450 33445',
      email: 'doctor.madurai@nilaclinic.com',
      designation: 'Doctor',
      stores: ['NILA-MD'],
      calendarColour: '#0d9488',
      showInAppointmentCalendar: true,
      hasLogin: true,
      loginRole: 'Doctor',
      isActive: true,
    },
    {
      _id: 'staff-3',
      name: 'Dr. Priya Dharshini',
      mobile: '+91 98450 44556',
      email: 'doctor.chennai@nilaclinic.com',
      designation: 'Doctor',
      stores: ['NILA-CH', 'NILA-CB'],
      calendarColour: '#7c3aed',
      showInAppointmentCalendar: true,
      hasLogin: true,
      loginRole: 'Doctor',
      isActive: true,
    },
    {
      _id: 'staff-4',
      name: 'Pooja Sharma',
      mobile: '+91 98450 55667',
      email: 'staff.theni@nilaclinic.com',
      designation: 'Front desk',
      stores: ['NILA-TH'],
      calendarColour: '#6366f1',
      showInAppointmentCalendar: false,
      hasLogin: true,
      loginRole: 'Staff',
      isActive: true,
    },
    {
      _id: 'staff-5',
      name: 'Kavitha Sundar',
      mobile: '+91 98450 66778',
      email: 'staff.madurai@nilaclinic.com',
      designation: 'Front desk',
      stores: ['NILA-MD'],
      calendarColour: '#ec4899',
      showInAppointmentCalendar: false,
      hasLogin: true,
      loginRole: 'Staff',
      isActive: true,
    },
    {
      _id: 'staff-6',
      name: 'Sujatha P.',
      mobile: '+91 98450 88990',
      designation: 'Therapist',
      stores: ['NILA-TH', 'NILA-MD', 'NILA-CB'],
      calendarColour: '#f59e0b',
      showInAppointmentCalendar: true,
      hasLogin: false,
      isActive: true,
    },
  ];

  private services: IService[] = [
    {
      _id: 'svc-1',
      name: 'Hydra Facial & Glowing Treatment',
      category: 'Skin Care',
      duration: 45,
      price: 2499,
      gstPercent: 18,
      availableStores: ['ALL'],
      description: 'Deep pore vacuum cleansing, exfoliation, and hydration infusion.',
      isActive: true,
    },
    {
      _id: 'svc-2',
      name: 'Q-Switch Laser Carbon Peel',
      category: 'Skin Care',
      duration: 30,
      price: 3500,
      gstPercent: 18,
      availableStores: ['ALL'],
      description: 'Instant porcelain skin glow and pore tightening with medical Q-Switch laser.',
      isActive: true,
    },
    {
      _id: 'svc-3',
      name: 'Laser Hair Reduction (Full Face)',
      category: 'Laser & Hair',
      duration: 30,
      price: 2999,
      gstPercent: 18,
      availableStores: ['ALL'],
      description: 'US-FDA approved painless triple-wavelength diode laser.',
      isActive: true,
    },
    {
      _id: 'svc-4',
      name: 'Advanced Keratin Scalp Therapy',
      category: 'Hair Care',
      duration: 60,
      price: 3200,
      gstPercent: 18,
      availableStores: ['ALL'],
      description: 'Intense peptide nourishment to eliminate hair thinning and scalp dryness.',
      isActive: true,
    },
    {
      _id: 'svc-5',
      name: 'Doctor Consultation Fee',
      category: 'Consultation',
      duration: 15,
      price: 500,
      gstPercent: 0,
      availableStores: ['ALL'],
      description: 'Direct consultation and skin/hair analysis with consulting dermatologist.',
      isActive: true,
    },
    {
      _id: 'svc-6',
      name: 'Anti-Pigmentation Glycolic Peel',
      category: 'Skin Care',
      duration: 30,
      price: 1800,
      gstPercent: 18,
      availableStores: ['ALL'],
      description: 'Medical chemical peel treatment targeting melasma, tan, and dark spots.',
      isActive: true,
    },
  ];

  private products: IProduct[] = [
    {
      _id: 'prod-1',
      name: 'Nila Sunscreen Broad Spectrum SPF 50+',
      category: 'Sun Protection',
      sku: 'SKU-SUN-50',
      price: 650,
      gstPercent: 18,
      availableStores: ['ALL'],
      isActive: true,
    },
    {
      _id: 'prod-2',
      name: 'Niacinamide 10% Clarifying Serum (30ml)',
      category: 'Serums',
      sku: 'SKU-SRM-NIA',
      price: 890,
      gstPercent: 18,
      availableStores: ['ALL'],
      isActive: true,
    },
    {
      _id: 'prod-3',
      name: 'Hair Growth Peptide Follicle Spray',
      category: 'Hair Care',
      sku: 'SKU-HAIR-PEP',
      price: 1250,
      gstPercent: 18,
      availableStores: ['ALL'],
      isActive: true,
    },
    {
      _id: 'prod-4',
      name: 'Salicylic 2% Exfoliating Cleanser',
      category: 'Cleansers',
      sku: 'SKU-CLN-SAL',
      price: 499,
      gstPercent: 18,
      availableStores: ['ALL'],
      isActive: true,
    },
    {
      _id: 'prod-5',
      name: 'Vitamin C 20% Collagen Booster Drops',
      category: 'Serums',
      sku: 'SKU-DRP-VITC',
      price: 1150,
      gstPercent: 18,
      availableStores: ['ALL'],
      isActive: true,
    },
  ];

  private packages: IPackageMaster[] = [
    {
      _id: 'pkg-1',
      name: 'Skin Brightening Laser Pack (6 Sittings)',
      type: 'Fixed',
      services: [
        {
          serviceId: 'svc-2',
          serviceName: 'Q-Switch Laser Carbon Peel',
          count: 6,
          valuePerSitting: 2500,
        },
      ],
      totalSittings: 6,
      price: 15000,
      valuePerSitting: 2500,
      validityDays: 180,
      availableStores: ['ALL'],
      isActive: true,
    },
    {
      _id: 'pkg-2',
      name: 'Hydra Glow & Hair Revive Combo (4 Sittings)',
      type: 'Fixed',
      services: [
        {
          serviceId: 'svc-1',
          serviceName: 'Hydra Facial & Glowing Treatment',
          count: 2,
          valuePerSitting: 2000,
        },
        {
          serviceId: 'svc-4',
          serviceName: 'Advanced Keratin Scalp Therapy',
          count: 2,
          valuePerSitting: 2500,
        },
      ],
      totalSittings: 4,
      price: 9000,
      valuePerSitting: 2250,
      validityDays: 120,
      availableStores: ['ALL'],
      isActive: true,
    },
    {
      _id: 'pkg-3',
      name: 'Full Face Painless Laser Hair Reduction (8 Sittings)',
      type: 'Fixed',
      services: [
        {
          serviceId: 'svc-3',
          serviceName: 'Laser Hair Reduction (Full Face)',
          count: 8,
          valuePerSitting: 2250,
        },
      ],
      totalSittings: 8,
      price: 18000,
      valuePerSitting: 2250,
      validityDays: 365,
      availableStores: ['ALL'],
      isActive: true,
    },
    {
      _id: 'pkg-4',
      name: 'Hair Regrowth Peptide Protocol (6 Sittings)',
      type: 'Fixed',
      services: [
        {
          serviceId: 'svc-4',
          serviceName: 'Advanced Keratin Scalp Therapy',
          count: 6,
          valuePerSitting: 2416,
        },
      ],
      totalSittings: 6,
      price: 14500,
      valuePerSitting: 2416,
      validityDays: 180,
      availableStores: ['ALL'],
      isActive: true,
    },
    {
      _id: 'pkg-5',
      name: 'Custom Aesthetic Protocol (On-demand)',
      type: 'On-demand',
      services: [
        {
          serviceId: 'svc-1',
          serviceName: 'Hydra Facial & Glowing Treatment',
          count: 3,
          valuePerSitting: 2000,
        },
        {
          serviceId: 'svc-3',
          serviceName: 'Laser Hair Reduction (Full Face)',
          count: 3,
          valuePerSitting: 2500,
        },
      ],
      totalSittings: 6,
      price: 13500,
      valuePerSitting: 2250,
      validityDays: 365,
      availableStores: ['ALL'],
      isActive: true,
    },
  ];

  private customerPackages: ICustomerPackage[] = [
    {
      _id: 'cpkg-1',
      customerId: 'CID-1001',
      packageId: 'pkg-1',
      packageName: 'Skin Brightening Laser Pack (6 Sittings)',
      storeSold: 'NILA-TH',
      purchaseInvoiceNo: 'NILA-TH-1000',
      servicesRemaining: [
        {
          serviceName: 'Q-Switch Laser Carbon Peel',
          totalCount: 6,
          usedCount: 2,
          remainingCount: 4,
        },
      ],
      totalSittings: 6,
      usedSittings: 2,
      remainingSittings: 4,
      validityExpiryDate: new Date(Date.now() + 86400000 * 120).toISOString().split('T')[0],
      status: 'Active',
      adjustmentHistory: [],
    },
    {
      _id: 'cpkg-2',
      customerId: 'CID-1002',
      packageId: 'pkg-2',
      packageName: 'Hydra Glow & Hair Revive Combo (4 Sittings)',
      storeSold: 'NILA-TH',
      purchaseInvoiceNo: 'NILA-TH-0998',
      servicesRemaining: [
        {
          serviceName: 'Hydra Facial & Glowing Treatment',
          totalCount: 2,
          usedCount: 1,
          remainingCount: 1,
        },
        {
          serviceName: 'Advanced Keratin Scalp Therapy',
          totalCount: 2,
          usedCount: 0,
          remainingCount: 2,
        },
      ],
      totalSittings: 4,
      usedSittings: 1,
      remainingSittings: 3,
      validityExpiryDate: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0],
      status: 'Active',
      adjustmentHistory: [],
    },
    {
      _id: 'cpkg-3',
      customerId: 'CID-1003',
      packageId: 'pkg-3',
      packageName: 'Full Face Painless Laser Hair Reduction (8 Sittings)',
      storeSold: 'NILA-MD',
      purchaseInvoiceNo: 'NILA-MD-0995',
      servicesRemaining: [
        {
          serviceName: 'Laser Hair Reduction (Full Face)',
          totalCount: 8,
          usedCount: 2,
          remainingCount: 6,
        },
      ],
      totalSittings: 8,
      usedSittings: 2,
      remainingSittings: 6,
      validityExpiryDate: new Date(Date.now() + 86400000 * 280).toISOString().split('T')[0],
      status: 'Active',
      adjustmentHistory: [],
    },
    {
      _id: 'cpkg-4',
      customerId: 'CID-1004',
      packageId: 'pkg-4',
      packageName: 'Hair Regrowth Peptide Protocol (6 Sittings)',
      storeSold: 'NILA-CH',
      purchaseInvoiceNo: 'NILA-CH-0990',
      servicesRemaining: [
        {
          serviceName: 'Advanced Keratin Scalp Therapy',
          totalCount: 6,
          usedCount: 1,
          remainingCount: 5,
        },
      ],
      totalSittings: 6,
      usedSittings: 1,
      remainingSittings: 5,
      validityExpiryDate: new Date(Date.now() + 86400000 * 150).toISOString().split('T')[0],
      status: 'Active',
      adjustmentHistory: [],
    },
    {
      _id: 'cpkg-5',
      customerId: 'CID-1005',
      packageId: 'pkg-5',
      packageName: 'Custom Aesthetic Protocol (On-demand)',
      storeSold: 'NILA-CB',
      purchaseInvoiceNo: 'NILA-CB-0985',
      servicesRemaining: [
        {
          serviceName: 'Hydra Facial & Glowing Treatment',
          totalCount: 3,
          usedCount: 1,
          remainingCount: 2,
        },
        {
          serviceName: 'Laser Hair Reduction (Full Face)',
          totalCount: 3,
          usedCount: 1,
          remainingCount: 2,
        },
      ],
      totalSittings: 6,
      usedSittings: 2,
      remainingSittings: 4,
      validityExpiryDate: new Date(Date.now() + 86400000 * 200).toISOString().split('T')[0],
      status: 'Active',
      adjustmentHistory: [],
    },
  ];

  private paymentModes: IPaymentMode[] = [
    { _id: 'pm-1', name: 'Cash', type: 'cash', displayOrder: 1, isActive: true },
    { _id: 'pm-2', name: 'Card', type: 'non-cash', displayOrder: 2, isActive: true },
    { _id: 'pm-3', name: 'UPI', type: 'non-cash', displayOrder: 3, isActive: true },
    { _id: 'pm-4', name: 'NEFT', type: 'non-cash', displayOrder: 4, isActive: true },
    { _id: 'pm-5', name: 'Bajaj Health EMI', type: 'non-cash', displayOrder: 5, isActive: true },
  ];

  private clinicSettings: IClinicSettings = {
    clinicName: 'Nila Clinic - Skin & Hair Care',
    logoUrl: '/logo.png',
    address: '42, Theni Main Road, Theni, Tamil Nadu - 625531',
    phone: '+91 98450 11223',
    email: 'contact@nilaclinic.com',
    gstin: '33ABCDE1234F1Z5',
    billFooter: 'Thank you for choosing Nila Clinic! We care for your skin and hair health.',
    printSize: '80mm',
    gstOnBills: false, // Default off in BRD v3.0
    maxStaffDiscountPercent: 10,
    staffCanEditPrice: false,
    backDatedBillingRoles: ['admin'],
    slotInterval: 15,
    packageUseInOtherStores: true,
    sharingOfCaseNotes: true,
    staffCanExport: true,
    endOfDayEmail: {
      enabled: true,
      recipients: ['admin@nilaclinic.com', 'accounts@nilaclinic.com'],
      sendTime: '21:30',
      format: 'combined',
      attachExcel: true,
    },
  };

  private customers: ICustomer[] = [
    {
      _id: 'cust-1001',
      customerId: 'CID-1001',
      name: 'Priya Sharma',
      mobile: '+91 98450 11223',
      gender: 'Female',
      dob: '1996-05-14',
      email: 'priya.s@gmail.com',
      area: 'Bazaar Street, Theni',
      allergyNotes: 'None',
      skinHairNotes: 'Grade 2 comedonal acne, oily T-zone',
      firstStoreId: 'NILA-TH',
      visits: 4,
      totalSpent: 19500,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    // {
    //   _id: 'cust-1002',
    //   customerId: 'CID-1002',
    //   name: 'Deepa Lakshmi',
    //   mobile: '+91 98765 88990',
    //   gender: 'Female',
    //   dob: '1990-11-22',
    //   email: 'deepa.l@gmail.com',
    //   area: 'Annanagar, Theni',
    //   allergyNotes: 'Sensitive to fragrance and paraben',
    //   skinHairNotes: 'Scalp dryness, diffuse hair thinning',
    //   firstStoreId: 'NILA-TH',
    //   visits: 2,
    //   totalSpent: 4400,
    //   createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    // },
    {
      _id: 'cust-1003',
      customerId: 'CID-1003',
      name: 'Sangeetha Mohan',
      mobile: '+91 94431 55667',
      gender: 'Female',
      dob: '1993-02-18',
      email: 'sangeetha.m@yahoo.com',
      area: 'West Veli St, Madurai',
      allergyNotes: 'Penicillin allergy noted',
      skinHairNotes: 'Cheek hyperpigmentation, epidermal melasma',
      firstStoreId: 'NILA-MD',
      visits: 3,
      totalSpent: 11499,
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      _id: 'cust-1004',
      customerId: 'CID-1004',
      name: 'Karthik Subramanian',
      mobile: '+91 98401 22334',
      gender: 'Male',
      dob: '1988-08-09',
      email: 'karthik.sub@outlook.com',
      area: 'Nungambakkam, Chennai',
      allergyNotes: 'None',
      skinHairNotes: 'Folliculitis barbae, beard line shaping',
      firstStoreId: 'NILA-CH',
      visits: 2,
      totalSpent: 5998,
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      _id: 'cust-1005',
      customerId: 'CID-1005',
      name: 'Meena Kumari',
      mobile: '+91 97890 44556',
      gender: 'Female',
      dob: '1985-03-27',
      email: 'meena.k@gmail.com',
      area: 'RS Puram, Coimbatore',
      allergyNotes: 'Sulfa drugs allergy',
      skinHairNotes: 'Premature fine lines and skin dehydration',
      firstStoreId: 'NILA-CB',
      visits: 1,
      totalSpent: 500,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  private appointments: IAppointment[] = [
    {
      _id: 'appt-1',
      appointmentId: 'APP-1001',
      customerId: 'CID-1001',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98450 11223',
      serviceName: 'Q-Switch Laser Carbon Peel',
      serviceId: 'svc-2',
      doctorId: 'user-doc-1',
      doctorName: 'Dr. Anitha Ramachandran',
      staffName: 'Dr. Anitha Ramachandran',
      staffId: 'staff-1',
      storeId: 'NILA-TH',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      durationMins: 30,
      status: 'Arrived',
      notes: 'Third session of Q-Switch Laser package',
      amount: 2500,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'appt-2',
      appointmentId: 'APP-1002',
      customerId: 'CID-1002',
      customerName: 'Deepa Lakshmi',
      customerPhone: '+91 98765 88990',
      serviceName: 'Advanced Keratin Scalp Therapy',
      serviceId: 'svc-4',
      staffName: 'Sujatha P.',
      staffId: 'staff-6',
      storeId: 'NILA-TH',
      date: new Date().toISOString().split('T')[0],
      startTime: '11:30 AM',
      durationMins: 45,
      status: 'Booked',
      notes: 'Scalp deep nourishment and follicle activation',
      amount: 3200,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'appt-3',
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
      date: new Date().toISOString().split('T')[0],
      startTime: '02:00 PM',
      durationMins: 45,
      status: 'In consultation',
      notes: 'Monthly facial routine & consultation',
      amount: 2499,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'appt-4',
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
      date: new Date().toISOString().split('T')[0],
      startTime: '04:15 PM',
      durationMins: 30,
      status: 'Booked',
      notes: 'Second sitting of beard line diode laser',
      amount: 2999,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'appt-5',
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
      date: new Date().toISOString().split('T')[0],
      startTime: '09:30 AM',
      durationMins: 15,
      status: 'Completed',
      notes: 'Anti-aging skin assessment',
      amount: 500,
      createdAt: new Date().toISOString(),
    },
  ];

  private visits: IVisit[] = [
    {
      _id: 'vis-1',
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
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'vis-2',
      visitId: 'VIS-1002',
      patientId: 'CID-1002',
      patientName: 'Deepa Lakshmi',
      patientPhone: '+91 98765 88990',
      storeId: 'NILA-TH',
      doctorId: 'user-doc-1',
      doctorName: 'Dr. Anitha Ramachandran',
      status: 'Waiting',
      caseNotes: 'Chief complaints: Excessive hair fall during shampooing. Scalp flaking.',
      isReadByDoctor: false,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'vis-3',
      visitId: 'VIS-1003',
      patientId: 'CID-1003',
      patientName: 'Sangeetha Mohan',
      patientPhone: '+91 94431 55667',
      storeId: 'NILA-MD',
      doctorId: 'user-doc-2',
      doctorName: 'Dr. Rajesh Varma',
      status: 'In consultation',
      caseNotes: 'Bilateral cheek hyperpigmentation. Sun exposure history.',
      isReadByDoctor: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'vis-4',
      visitId: 'VIS-1004',
      patientId: 'CID-1004',
      patientName: 'Karthik Subramanian',
      patientPhone: '+91 98401 22334',
      storeId: 'NILA-CH',
      doctorId: 'user-doc-3',
      doctorName: 'Dr. Priya Dharshini',
      status: 'Waiting',
      caseNotes: 'Beard neckline diode laser session #2 evaluation.',
      isReadByDoctor: false,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'vis-5',
      visitId: 'VIS-1005',
      patientId: 'CID-1005',
      patientName: 'Meena Kumari',
      patientPhone: '+91 97890 44556',
      storeId: 'NILA-TH',
      doctorId: 'user-doc-1',
      doctorName: 'Dr. Anitha Ramachandran',
      status: 'Done',
      caseNotes: 'DIAGNOSIS: Mild Photodamage & Epidermal Dehydration.\nAdvised daily broad-spectrum SPF 50 and Hyaluronic acid infusion.',
      prescriptionText: '1. Nila Sunscreen SPF 50+ - Apply generously 20 mins before sun exposure.\n2. Niacinamide 10% Serum - 3 drops at night.',
      billId: 'NILA-TH-1001',
      isReadByDoctor: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      consultedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  private invoices: IInvoice[] = [
    {
      _id: 'inv-1',
      invoiceNo: 'NILA-TH-1001',
      storeId: 'NILA-TH',
      customerId: 'CID-1005',
      customerName: 'Meena Kumari',
      customerMobile: '+91 97890 44556',
      customerPhone: '+91 97890 44556',
      date: new Date().toISOString().split('T')[0],
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
      billDiscountType: 'value',
      billDiscountValue: 0,
      discount: 0,
      tax: 0,
      grandTotal: 500,
      payableAmount: 500,
      payments: [{ mode: 'UPI', amount: 500, type: 'non-cash' }],
      paidAmount: 500,
      changeAmount: 0,
      paymentMethod: 'UPI',
      remarks: 'First skin consultation with senior dermatologist',
      status: 'Paid',
      staffName: 'Pooja Sharma',
      visitId: 'VIS-1005',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      paidAt: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      _id: 'inv-2',
      invoiceNo: 'NILA-TH-1002',
      storeId: 'NILA-TH',
      customerId: 'CID-1001',
      customerName: 'Priya Sharma',
      customerMobile: '+91 98450 11223',
      customerPhone: '+91 98450 11223',
      date: new Date().toISOString().split('T')[0],
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
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      paidAt: new Date(Date.now() - 7100000).toISOString(),
    },
    {
      _id: 'inv-3',
      invoiceNo: 'NILA-TH-1003',
      storeId: 'NILA-TH',
      customerId: 'CID-1002',
      customerName: 'Deepa Lakshmi',
      customerMobile: '+91 98765 88990',
      customerPhone: '+91 98765 88990',
      date: new Date().toISOString().split('T')[0],
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
      changeAmount: 460, // Tendered 2000, returned 460
      paymentMethod: 'Cash',
      remarks: 'Cash tendered ₹2000, change returned ₹460',
      status: 'Paid',
      staffName: 'Pooja Sharma',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      paidAt: new Date(Date.now() - 10700000).toISOString(),
    },
    {
      _id: 'inv-4',
      invoiceNo: 'NILA-MD-1001',
      storeId: 'NILA-MD',
      customerId: 'CID-1003',
      customerName: 'Sangeetha Mohan',
      customerMobile: '+91 94431 55667',
      customerPhone: '+91 94431 55667',
      date: new Date().toISOString().split('T')[0],
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
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'inv-5',
      invoiceNo: 'NILA-CH-1001',
      storeId: 'NILA-CH',
      customerId: 'CID-1004',
      customerName: 'Karthik Subramanian',
      customerMobile: '+91 98401 22334',
      customerPhone: '+91 98401 22334',
      date: new Date().toISOString().split('T')[0],
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
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      paidAt: new Date(Date.now() - 14300000).toISOString(),
    },
  ];

  // ================= STORES (M1) =================
  async getStores(): Promise<IStore[]> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const docs = await (Store as any)
          .find({ isActive: { $ne: false } })
          .select('name code address phone email gstin workingHours invoicePrefix nextInvoiceNumber isActive')
          .sort({ createdAt: 1 })
          .lean();
        if (docs) {
          return docs.map((d: any) => ({ ...d, _id: d._id?.toString() }));
        }
        return [];
      }
    } catch (e) { }
    return this.stores;
  }

  async getStoreByCode(code: string): Promise<IStore | null> {
    const stores = await this.getStores();
    return stores.find(s => s.code.toUpperCase() === code.toUpperCase()) || null;
  }

  async createStore(data: Partial<IStore>): Promise<IStore> {
    const code = (data.code || 'NILA-NEW').toUpperCase().trim();
    const invoicePrefix = data.invoicePrefix || `${code}-`;
    const newStore: IStore = {
      _id: `store-${code.toLowerCase()}-${Date.now()}`,
      name: data.name || `Nila Clinic - ${code}`,
      code,
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
      gstin: data.gstin || '33ABCDE1234F1Z5',
      workingHours: data.workingHours || { open: '09:00 AM', close: '08:00 PM', weeklyOff: 'Sunday' },
      invoicePrefix,
      nextInvoiceNumber: 1001,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const { _id, ...storeData } = newStore;
        const doc = await (Store as any).create(storeData);
        const saved = doc.toObject();
        saved._id = saved._id.toString();
        this.stores.push(saved);
        return saved;
      }
    } catch (e) {
      console.error('Error creating store in MongoDB:', e);
    }

    this.stores.push(newStore);
    return newStore;
  }

  async updateStore(code: string, updates: Partial<IStore>): Promise<IStore | null> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const doc = await (Store as any).findOneAndUpdate({ code: code.toUpperCase() }, updates, { new: true }).lean();
        if (doc) {
          const idx = this.stores.findIndex(s => s.code.toUpperCase() === code.toUpperCase());
          if (idx !== -1) this.stores[idx] = { ...this.stores[idx], ...updates };
          return doc as any;
        }
      }
    } catch (e) { }

    const idx = this.stores.findIndex(s => s.code.toUpperCase() === code.toUpperCase());
    if (idx !== -1) {
      this.stores[idx] = { ...this.stores[idx], ...updates };
      return this.stores[idx];
    }
    return null;
  }

  async getNextInvoiceNumber(storeCode: string): Promise<string> {
    const targetCode = storeCode.toUpperCase();
    let store = await this.getStoreByCode(targetCode);
    if (!store) {
      store = this.stores[0];
    }

    const prefix = store.invoicePrefix || `${store.code}-`;
    let seq = store.nextInvoiceNumber || 1001;

    // Check MongoDB for the true highest invoice sequence number for this store prefix
    try {
      const db = await connectToDatabase();
      if (db) {
        const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const docs = await (Invoice as any).find(
          { invoiceNo: new RegExp(`^${escapedPrefix}\\d+`) },
          { invoiceNo: 1 }
        ).lean();

        let maxDbSeq = 0;
        for (const doc of docs) {
          const numPart = parseInt((doc.invoiceNo || '').replace(prefix, ''), 10);
          if (!isNaN(numPart) && numPart > maxDbSeq) {
            maxDbSeq = numPart;
          }
        }

        if (maxDbSeq >= seq) {
          seq = maxDbSeq + 1;
        }
      }
    } catch (e) {
      console.error('Error finding max invoice sequence from DB:', e);
    }

    const invoiceNo = `${prefix}${seq}`;
    await this.updateStore(store.code, { nextInvoiceNumber: seq + 1 });
    return invoiceNo;
  }

  // ================= USERS & ROLES (M1 & M2) =================
  async getUsers(storeCode?: string): Promise<IUser[]> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const query: any = {};
        if (storeCode && storeCode !== 'ALL') {
          const aliases = getStoreAliases(storeCode);
          query.$or = [
            { assignedStoreIds: { $in: aliases } },
            { primaryStoreId: { $in: aliases } },
            { assignedStoreIds: 'ALL' },
            { assignedStoreIds: { $size: 0 } },
            { assignedStoreIds: { $exists: false } }
          ];
        }
        const docs = await (User as any).find(query).sort({ name: 1 }).lean();
        if (docs) {
          return docs.map((d: any) => ({ ...d, _id: d._id?.toString() }));
        }
        return [];
      }
    } catch (e) { }

    if (!storeCode || storeCode === 'ALL') return this.users;
    const aliases = getStoreAliases(storeCode).map(a => a.toUpperCase());
    return this.users.filter(u =>
      !u.assignedStoreIds ||
      u.assignedStoreIds.length === 0 ||
      u.assignedStoreIds.includes('ALL') ||
      u.assignedStoreIds.some(s => aliases.includes(s.toUpperCase()))
    );
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const doc = await (User as any).findOne({ email: email.toLowerCase().trim() }).lean();
        if (doc) return { ...doc, _id: doc._id?.toString() } as any;
      }
    } catch (e) { }

    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  async createUser(data: Partial<IUser>): Promise<IUser> {
    const newUser: IUser = {
      _id: `user-${Date.now()}`,
      email: (data.email || '').toLowerCase().trim(),
      password: data.password || 'Clinic@123',
      name: data.name || 'User',
      role: data.role || 'staff',
      phone: data.phone || '',
      assignedStoreIds: data.assignedStoreIds || ['NILA-TH'],
      primaryStoreId: data.primaryStoreId || data.assignedStoreIds?.[0] || 'NILA-TH',
      specialization: data.specialization,
      isActive: data.isActive !== false,
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const { _id, ...userData } = newUser;
        const doc = await (User as any).create({ ...userData, username: userData.email });
        const saved = doc.toObject();
        saved._id = saved._id.toString();

        // If the user is a doctor or staff, automatically sync/ensure corresponding Staff record exists
        if (saved.role === 'doctor' || saved.role === 'staff') {
          try {
            const existingStaff = await (Staff as any).findOne({
              $or: [
                { email: saved.email.toLowerCase() },
                { name: saved.name }
              ]
            });
            if (!existingStaff) {
              await (Staff as any).create({
                name: saved.name,
                mobile: saved.phone || '+91 98450 00000',
                email: saved.email,
                designation: saved.role === 'doctor' ? 'Doctor' : 'Front desk',
                stores: saved.assignedStoreIds || ['NILA-TH'],
                workingHours: { start: '09:00 AM', end: '08:00 PM' },
                calendarColour: saved.role === 'doctor' ? '#0284c7' : '#059669',
                showInAppointmentCalendar: true,
                hasLogin: true,
                loginRole: saved.role === 'doctor' ? 'Doctor' : 'Staff',
                isActive: saved.isActive !== false,
              });
            }
          } catch (stErr) {
            console.error('Error auto-syncing staff record:', stErr);
          }
        }

        this.users.push(saved);
        return saved;
      }
    } catch (e) {
      console.error('Error creating user in MongoDB:', e);
      throw e;
    }

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const doc = await (User as any).findByIdAndUpdate(id, updates, { new: true }).lean();
        if (doc) {
          const idx = this.users.findIndex(u => u._id === id);
          if (idx !== -1) this.users[idx] = { ...this.users[idx], ...updates };
          return doc as any;
        }
      }
    } catch (e) { }

    const idx = this.users.findIndex(u => u._id === id || u.email === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      return this.users[idx];
    }
    return null;
  }

  // ================= STAFF MASTER (M2) =================
  async getStaff(storeCode?: string): Promise<IStaff[]> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const query: any = {};
        if (storeCode && storeCode !== 'ALL') {
          const aliases = getStoreAliases(storeCode);
          query.$or = [
            { stores: { $in: aliases } },
            { stores: 'ALL' },
            { stores: { $size: 0 } },
            { stores: { $exists: false } }
          ];
        }
        const docs = await (Staff as any).find(query).sort({ name: 1 }).lean();
        const staffList: IStaff[] = docs ? docs.map((d: any) => ({ ...d, _id: d._id?.toString() })) : [];

        // Also ensure Doctors from User collection are included in staff if not already present
        const docQuery: any = { role: 'doctor' };
        if (storeCode && storeCode !== 'ALL') {
          const aliases = getStoreAliases(storeCode);
          docQuery.$or = [
            { assignedStoreIds: { $in: aliases } },
            { primaryStoreId: { $in: aliases } },
            { assignedStoreIds: 'ALL' },
            { assignedStoreIds: { $size: 0 } },
            { assignedStoreIds: { $exists: false } }
          ];
        }
        const docUsers = await (User as any).find(docQuery).lean();
        if (docUsers && docUsers.length > 0) {
          for (const du of docUsers) {
            const duName = (du.name || '').trim().toLowerCase();
            const duEmail = (du.email || '').trim().toLowerCase();
            const exists = staffList.some(s =>
              (s.email && s.email.trim().toLowerCase() === duEmail) ||
              (s.name && s.name.trim().toLowerCase() === duName)
            );
            if (!exists) {
              staffList.push({
                _id: String(du._id),
                name: du.name || 'Doctor',
                mobile: du.phone || '+91 98450 00000',
                email: du.email,
                designation: 'Doctor',
                stores: du.assignedStoreIds?.length ? du.assignedStoreIds : (storeCode && storeCode !== 'ALL' ? [storeCode] : ['NILA-TH']),
                workingHours: { start: '09:00 AM', end: '08:00 PM' },
                calendarColour: '#0284c7',
                showInAppointmentCalendar: true,
                hasLogin: true,
                loginRole: 'Doctor',
                isActive: du.isActive !== false,
              } as any);
            }
          }
        }

        if (staffList.length > 0) return staffList;
      }
    } catch (e) { }

    if (!storeCode || storeCode === 'ALL') return this.staff;
    const aliases = getStoreAliases(storeCode).map(s => s.toUpperCase());
    return this.staff.filter(st =>
      !st.stores ||
      st.stores.length === 0 ||
      st.stores.includes('ALL') ||
      st.stores.some(s => aliases.includes(s.toUpperCase()))
    );
  }

  async createStaff(data: Partial<IStaff>): Promise<IStaff> {
    const newStaff: IStaff = {
      _id: `staff-${Date.now()}`,
      name: data.name || 'Staff Member',
      mobile: data.mobile || '',
      email: data.email || '',
      designation: data.designation || 'Therapist',
      stores: data.stores || ['NILA-TH'],
      workingHours: data.workingHours || { start: '09:00 AM', end: '08:00 PM' },
      calendarColour: data.calendarColour || '#0284c7',
      showInAppointmentCalendar: data.showInAppointmentCalendar !== false,
      hasLogin: data.hasLogin || false,
      loginRole: data.loginRole || 'Staff',
      isActive: data.isActive !== false,
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const { _id, ...staffData } = newStaff;
        const doc = await (Staff as any).create(staffData);
        const saved = doc.toObject();
        saved._id = saved._id.toString();

        // If staff has login enabled or is a doctor, ensure a corresponding User account exists
        if (saved.hasLogin || saved.designation === 'Doctor') {
          try {
            const role = saved.designation === 'Doctor' ? 'doctor' : (saved.loginRole?.toLowerCase() === 'admin' ? 'admin' : 'staff');
            const email = (saved.email || `staff.${saved.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@nilaclinic.com`).toLowerCase();
            const existingUser = await (User as any).findOne({ email });
            if (!existingUser) {
              await (User as any).create({
                name: saved.name,
                email,
                username: email,
                password: (data as any).password || (role === 'doctor' ? 'doctor' : 'staff'),
                role,
                phone: saved.mobile,
                assignedStoreIds: saved.stores,
                primaryStoreId: saved.stores?.[0] || 'NILA-TH',
                specialization: saved.designation === 'Doctor' ? 'Consultant Doctor' : undefined,
                isActive: saved.isActive !== false,
              });
            }
          } catch (uErr) {
            console.error('Error auto-syncing User for staff:', uErr);
          }
        }

        this.staff.push(saved);
        return saved;
      }
    } catch (e) {
      console.error('Error creating staff in MongoDB:', e);
      throw e;
    }

    this.staff.push(newStaff);
    return newStaff;
  }

  async updateStaff(id: string, updates: Partial<IStaff>): Promise<IStaff | null> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const doc = await (Staff as any).findByIdAndUpdate(id, updates, { new: true }).lean();
        if (doc) {
          const idx = this.staff.findIndex(s => s._id === id);
          if (idx !== -1) this.staff[idx] = { ...this.staff[idx], ...updates };
          return doc as any;
        }
      }
    } catch (e) { }

    const idx = this.staff.findIndex(s => s._id === id);
    if (idx !== -1) {
      this.staff[idx] = { ...this.staff[idx], ...updates };
      return this.staff[idx];
    }
    return null;
  }

  // ================= SERVICES & PRODUCTS MASTERS (M2) =================
  async getServices(storeCode?: string): Promise<IService[]> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const docs = await (Service as any)
          .find({ isActive: true })
          .select('name category duration price gstPercent availableStores description isActive')
          .sort({ category: 1, name: 1 })
          .lean();
        if (docs && docs.length > 0) {
          const mapped = docs.map((d: any) => ({ ...d, _id: d._id?.toString() }));
          if (!storeCode || storeCode === 'ALL') return mapped;
          return mapped.filter((s: any) =>
            s.availableStores?.includes('ALL') || s.availableStores?.includes(storeCode.toUpperCase())
          );
        }
      }
    } catch (e) { }

    if (!storeCode || storeCode === 'ALL') return this.services;
    return this.services.filter(s =>
      s.availableStores.includes('ALL') || s.availableStores.includes(storeCode.toUpperCase())
    );
  }

  async createService(data: Partial<IService>): Promise<IService> {
    const newService: IService = {
      _id: `svc-${Date.now()}`,
      name: data.name || 'Treatment',
      category: data.category || 'Skin Care',
      duration: data.duration || 30,
      price: data.price || 1000,
      gstPercent: data.gstPercent || 18,
      availableStores: data.availableStores || ['ALL'],
      description: data.description || '',
      isActive: true,
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const { _id, ...svcData } = newService;
        const doc = await (Service as any).create(svcData);
        const saved = doc.toObject();
        saved._id = saved._id.toString();
        this.services.push(saved);
        return saved;
      }
    } catch (e) {
      console.error('Error creating service in MongoDB:', e);
    }

    this.services.push(newService);
    return newService;
  }

  async getProducts(storeCode?: string): Promise<IProduct[]> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const docs = await (Product as any)
          .find({ isActive: true })
          .select('name category sku price costPrice stockQuantity barcode availableStores isActive')
          .sort({ category: 1, name: 1 })
          .lean();
        if (docs && docs.length > 0) {
          const mapped = docs.map((d: any) => ({ ...d, _id: d._id?.toString() }));
          if (!storeCode || storeCode === 'ALL') return mapped;
          return mapped.filter((p: any) =>
            p.availableStores?.includes('ALL') || p.availableStores?.includes(storeCode.toUpperCase())
          );
        }
      }
    } catch (e) { }

    if (!storeCode || storeCode === 'ALL') return this.products;
    return this.products.filter(p =>
      p.availableStores.includes('ALL') || p.availableStores.includes(storeCode.toUpperCase())
    );
  }

  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const newProd: IProduct = {
      _id: `prod-${Date.now()}`,
      name: data.name || 'Product',
      category: data.category || 'Skincare',
      sku: data.sku || '',
      price: data.price || 500,
      gstPercent: data.gstPercent || 18,
      availableStores: data.availableStores || ['ALL'],
      isActive: true,
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const { _id, ...prodData } = newProd;
        const doc = await (Product as any).create(prodData);
        const saved = doc.toObject();
        saved._id = saved._id.toString();
        this.products.push(saved);
        return saved;
      }
    } catch (e) {
      console.error('Error creating product in MongoDB:', e);
    }

    this.products.push(newProd);
    return newProd;
  }

  // ================= PAYMENT MODES MASTER (M2) =================
  async getPaymentModes(): Promise<IPaymentMode[]> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const docs = await (PaymentMode as any).find({ isActive: true }).sort({ displayOrder: 1 }).lean();
        if (docs && docs.length > 0) return docs as any;
      }
    } catch (e) { }
    return this.paymentModes;
  }

  async createPaymentMode(data: Partial<IPaymentMode>): Promise<IPaymentMode> {
    const newMode: IPaymentMode = {
      _id: `pm-${Date.now()}`,
      name: data.name || 'Custom Mode',
      type: data.type || 'non-cash',
      displayOrder: data.displayOrder || this.paymentModes.length + 1,
      isActive: true,
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const { _id, ...pmData } = newMode;
        const doc = await (PaymentMode as any).create(pmData);
        const saved = doc.toObject();
        saved._id = saved._id.toString();
        this.paymentModes.push(saved);
        return saved;
      }
    } catch (e) {
      console.error('Error creating payment mode in MongoDB:', e);
    }

    this.paymentModes.push(newMode);
    return newMode;
  }

  // ================= CLINIC SETTINGS MASTER (M2) =================
  async getSettings(): Promise<IClinicSettings> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const doc = await (ClinicSetting as any).findOne().lean();
        if (doc) return doc as any;
      }
    } catch (e) { }
    return this.clinicSettings;
  }

  async updateSettings(updates: Partial<IClinicSettings>): Promise<IClinicSettings> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const doc = await (ClinicSetting as any).findOneAndUpdate({}, updates, { new: true, upsert: true }).lean();
        if (doc) {
          this.clinicSettings = { ...this.clinicSettings, ...updates };
          return doc as any;
        }
      }
    } catch (e) { }

    this.clinicSettings = { ...this.clinicSettings, ...updates };
    return this.clinicSettings;
  }

  // ================= CUSTOMERS MASTER (M3 - Shared across stores) =================
  async getCustomers(
    storeCode?: string,
    search?: string,
    options?: { limit?: number; page?: number; skip?: number }
  ): Promise<ICustomer[]> {
    const limit = options?.limit ?? 25;
    const page = options?.page ?? 1;
    const skip = options?.skip ?? (page - 1) * limit;

    try {
      const db = await connectToDatabase();
      if (db) {
        const query: any = {};
        if (storeCode && storeCode !== 'ALL' && !search) {
          const aliases = getStoreAliases(storeCode);
          query.$or = [
            { firstStoreId: { $in: aliases } },
            { storeId: { $in: aliases } },
          ];
        }
        if (search) {
          const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          query.$or = [
            { name: { $regex: escaped, $options: 'i' } },
            { mobile: { $regex: escaped, $options: 'i' } },
            { phone: { $regex: escaped, $options: 'i' } },
            { customerId: { $regex: escaped, $options: 'i' } },
            { patientId: { $regex: escaped, $options: 'i' } },
          ];
        }
        const docs = await (Customer as any)
          .find(query)
          .select('customerId patientId name mobile phone gender age dob email area address allergyNotes skinHairNotes notes firstStoreId storeId visits totalSpent createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        if (docs && docs.length > 0) {
          // Live aggregate visits and spending from Invoice and Visit collections (BUG-10)
          const customerIds = docs.map((d: any) => d.customerId || d.patientId || d._id?.toString()).filter(Boolean);
          const customerPhones = docs.map((d: any) => d.mobile || d.phone).filter(Boolean);

          const [invoiceStats, visitStats] = await Promise.all([
            (Invoice as any).aggregate([
              {
                $match: {
                  status: 'Paid',
                  $or: [
                    { customerId: { $in: customerIds } },
                    { customerMobile: { $in: customerPhones } },
                    { customerPhone: { $in: customerPhones } },
                  ],
                },
              },
              {
                $group: {
                  _id: { $ifNull: ['$customerId', '$customerMobile'] },
                  spent: { $sum: '$grandTotal' },
                  paidBills: { $sum: 1 },
                },
              },
            ]).catch(() => []),
            (Visit as any).aggregate([
              {
                $match: {
                  $or: [
                    { patientId: { $in: customerIds } },
                    { patientPhone: { $in: customerPhones } },
                  ],
                },
              },
              {
                $group: {
                  _id: { $ifNull: ['$patientId', '$patientPhone'] },
                  visitCount: { $sum: 1 },
                },
              },
            ]).catch(() => []),
          ]);

          const statsMap: Record<string, { spent: number; bills: number; visits: number }> = {};
          for (const s of (invoiceStats || [])) {
            if (s && s._id) {
              statsMap[s._id] = { spent: s.spent || 0, bills: s.paidBills || 0, visits: s.paidBills || 0 };
            }
          }
          for (const v of (visitStats || [])) {
            if (v && v._id) {
              if (!statsMap[v._id]) {
                statsMap[v._id] = { spent: 0, bills: 0, visits: v.visitCount || 0 };
              } else {
                statsMap[v._id].visits = Math.max(statsMap[v._id].visits, v.visitCount || 0);
              }
            }
          }

          return docs.map((d: any) => {
            const cid = d.customerId || d.patientId || d._id?.toString();
            const phone = d.mobile || d.phone || '';
            const stat = statsMap[cid] || statsMap[phone] || { spent: 0, visits: 0 };
            const computedVisits = Math.max(d.visits || 0, stat.visits || 0);
            const computedSpent = Math.max(d.totalSpent || 0, stat.spent || 0);

            return {
              ...d,
              _id: d._id?.toString(),
              customerId: cid,
              patientId: cid,
              phone,
              mobile: phone,
              storeId: d.storeId || d.firstStoreId || 'NILA-TH',
              firstStoreId: d.firstStoreId || d.storeId || 'NILA-TH',
              visits: computedVisits,
              totalSpent: computedSpent,
            };
          });
        }

        // If docs is empty and DB has records, return empty array (do not leak in-memory fallback)
        const total = await (Customer as any).countDocuments().catch(() => 0);
        if (total > 0) {
          return [];
        }
      }
    } catch (e) {
      console.error('Error in getCustomers:', e);
    }

    let res = this.customers;
    if (storeCode && storeCode !== 'ALL' && !search) {
      const aliases = getStoreAliases(storeCode).map(a => a.toUpperCase());
      res = res.filter(c =>
        aliases.includes((c.firstStoreId || '').toUpperCase()) ||
        aliases.includes(((c as any).storeId || '').toUpperCase())
      );
    }
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.mobile || '').includes(q) ||
        ((c as any).phone || '').includes(q) ||
        (c.customerId || '').toLowerCase().includes(q) ||
        ((c as any).patientId || '').toLowerCase().includes(q)
      );
    }
    return res.slice(skip, skip + limit).map(c => ({
      ...c,
      patientId: c.customerId || (c as any).patientId || c._id,
      phone: c.mobile || (c as any).phone || '',
      storeId: c.firstStoreId || (c as any).storeId || 'NILA-TH',
    }));
  }

  async searchCustomerByMobile(mobileNumber: string): Promise<ICustomer[]> {
    const cleanNumber = mobileNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber) return [];

    const last10 = cleanNumber.length >= 10 ? cleanNumber.slice(-10) : cleanNumber;

    try {
      const db = await connectToDatabase();
      if (db) {
        const docs = await (Customer as any)
          .find({
            $or: [
              { mobile: { $regex: last10 } },
              { phone: { $regex: last10 } },
            ],
          })
          .select('customerId patientId name mobile phone gender area address firstStoreId storeId totalSpent visits createdAt')
          .limit(10)
          .lean();

        if (docs && docs.length > 0) {
          return docs.map((d: any) => ({
            ...d,
            _id: d._id?.toString(),
            customerId: d.customerId || d.patientId || d._id?.toString(),
            patientId: d.customerId || d.patientId || d._id?.toString(),
            phone: d.mobile || d.phone || '',
          }));
        }
      }
    } catch (e) {
      console.error('Error in searchCustomerByMobile:', e);
    }

    return this.customers
      .filter(c => (c.mobile || '').replace(/[^0-9]/g, '').includes(last10))
      .slice(0, 10);
  }

  async checkDuplicateCustomer(name: string, mobile: string): Promise<boolean> {
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    const cleanName = name.trim().toLowerCase();
    const last10 = cleanMobile.slice(-10);

    try {
      const db = await connectToDatabase();
      if (db) {
        const found = await (Customer as any)
          .findOne({
            $and: [
              { $or: [{ mobile: { $regex: last10 } }, { phone: { $regex: last10 } }] },
              { name: { $regex: `^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
            ],
          })
          .select('_id')
          .lean();

        return !!found;
      }
    } catch (e) {
      console.error('Error in checkDuplicateCustomer:', e);
    }

    return this.customers.some(
      m =>
        m.name.trim().toLowerCase() === cleanName &&
        (m.mobile || '').replace(/[^0-9]/g, '').slice(-10) === last10
    );
  }

  async generateNextCustomerId(): Promise<string> {
    let maxNum = 1000;

    // Check in-memory customers
    for (const c of this.customers) {
      const id = c.customerId || (c as any).patientId || '';
      const match = id.match(/^CID-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    // Query MongoDB for the highest existing customerId / patientId
    try {
      const db = await connectToDatabase();
      if (db) {
        const docs = await (Customer as any)
          .find({
            $or: [
              { customerId: { $regex: '^CID-\\d+', $options: 'i' } },
              { patientId: { $regex: '^CID-\\d+', $options: 'i' } },
            ],
          })
          .select('customerId patientId')
          .lean();

        if (docs && docs.length > 0) {
          for (const d of docs) {
            const id = d.customerId || d.patientId || '';
            const match = id.match(/^CID-(\d+)$/i);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) maxNum = num;
            }
          }
        }
      }
    } catch (e) {
      console.error('Error querying max customerId in MongoDB:', e);
    }

    return `CID-${maxNum + 1}`;
  }

  async createCustomer(data: Partial<ICustomer>): Promise<ICustomer> {
    const cid = data.customerId || (await this.generateNextCustomerId());
    const mob = (data.mobile || (data as any).phone || '').trim();
    const rawStore = data.firstStoreId || (data as any).storeId || 'NILA-TH';
    const cleanStore = canonicalStoreCode(rawStore);

    const newCust: any = {
      customerId: cid,
      patientId: cid,
      name: (data.name || 'New Customer').trim(),
      mobile: mob,
      phone: mob,
      gender: data.gender || 'Female',
      age: data.age !== undefined && data.age !== null && !isNaN(Number(data.age)) ? Number(data.age) : undefined,
      dob: data.dob || '',
      email: (data.email || '').trim().toLowerCase(),
      area: (data.area || (data as any).address || '').trim(),
      address: (data.area || (data as any).address || '').trim(),
      allergyNotes: (data.allergyNotes || '').trim(),
      skinHairNotes: (data.skinHairNotes || '').trim(),
      notes: (data.notes || data.skinHairNotes || '').trim(),
      firstStoreId: cleanStore,
      storeId: cleanStore,
      visits: data.visits || 0,
      totalSpent: data.totalSpent || 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        let doc: any = null;
        let currentCid = cid;

        // Try up to 5 times to avoid duplicate CID key collisions
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            const { _id, ...custData } = {
              ...newCust,
              customerId: currentCid,
              patientId: currentCid,
            };
            doc = await (Customer as any).create(custData);
            break;
          } catch (createErr: any) {
            if (createErr.code === 11000 && (createErr.keyPattern?.customerId || createErr.message?.includes('customerId'))) {
              const currentNum = parseInt(currentCid.replace(/^CID-/i, ''), 10) || 1000;
              currentCid = `CID-${currentNum + 1}`;
              continue;
            }
            throw createErr;
          }
        }

        if (doc) {
          const saved = doc.toObject();
          saved._id = saved._id.toString();
          saved.patientId = saved.customerId;
          saved.phone = saved.mobile;
          saved.storeId = saved.firstStoreId;
          this.customers.unshift(saved);
          return saved;
        }
      }
    } catch (e) {
      console.error('Error creating customer in MongoDB:', e);
    }

    const fallback: ICustomer = {
      _id: `cust-${Date.now()}`,
      ...newCust,
    };
    this.customers.unshift(fallback);
    return fallback;
  }

  // Compatibility aliases for legacy patient endpoints
  async getPatients(storeCode?: string, search?: string) {
    const customers = await this.getCustomers(storeCode, search);
    return customers.map(c => ({
      ...c,
      patientId: c.customerId || (c as any).patientId || c._id,
      phone: c.mobile || (c as any).phone || '',
      storeId: c.firstStoreId || (c as any).storeId || 'NILA-TH',
    }));
  }

  async checkDuplicatePatientPhone(phone: string, storeCode?: string) {
    const res = await this.searchCustomerByMobile(phone);
    return res.length > 0 ? res[0] : null;
  }

  async createPatient(data: any) {
    return this.createCustomer({
      ...data,
      mobile: data.mobile || data.phone,
      phone: data.phone || data.mobile,
      firstStoreId: data.firstStoreId || data.storeId || 'NILA-TH',
      storeId: data.firstStoreId || data.storeId || 'NILA-TH',
    });
  }

  // ================= PACKAGES MASTER & SITTINGS (M4 - Phase 2) =================
  async getPackages(storeCode?: string): Promise<IPackageMaster[]> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const query: any = { isActive: true };
        if (storeCode && storeCode !== 'ALL') {
          query.$or = [{ availableStores: 'ALL' }, { availableStores: storeCode.toUpperCase() }];
        }
        const docs = await (PackageMaster as any).find(query).sort({ price: 1 }).lean();
        if (docs && docs.length > 0) return docs as any;
      }
    } catch (e) { }

    if (!storeCode || storeCode === 'ALL') return this.packages.filter(p => p.isActive);
    return this.packages.filter(
      p => p.isActive && (p.availableStores.includes('ALL') || p.availableStores.includes(storeCode.toUpperCase()))
    );
  }

  async getPackageById(id: string): Promise<IPackageMaster | null> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const doc = await (PackageMaster as any).findById(id).lean();
        if (doc) return doc as any;
      }
    } catch (e) { }
    return this.packages.find(p => p._id === id) || null;
  }

  async createPackage(data: Partial<IPackageMaster>): Promise<IPackageMaster> {
    const totalSittings = data.totalSittings || (data.services || []).reduce((acc, s) => acc + (s.count || 0), 0) || 1;
    const price = data.price || 0;
    const valuePerSitting = data.valuePerSitting || Math.round(price / totalSittings);

    const newPkg: IPackageMaster = {
      _id: `pkg-${Date.now()}`,
      name: data.name || 'Treatment Package',
      type: data.type || 'Fixed',
      services: data.services || [],
      products: data.products || [],
      totalSittings,
      price,
      valuePerSitting,
      validityDays: data.validityDays || 180,
      availableStores: data.availableStores || ['ALL'],
      isActive: true,
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const { _id, ...pkgData } = newPkg;
        const doc = await (PackageMaster as any).create(pkgData);
        const saved = doc.toObject();
        saved._id = saved._id.toString();
        this.packages.push(saved);
        return saved;
      }
    } catch (e) {
      console.error('Failed to persist package in MongoDB:', e);
    }

    this.packages.push(newPkg);
    return newPkg;
  }

  async updatePackage(id: string, updates: Partial<IPackageMaster>): Promise<IPackageMaster | null> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const doc = await (PackageMaster as any).findByIdAndUpdate(id, updates, { new: true }).lean();
        if (doc) {
          const idx = this.packages.findIndex(p => p._id === id);
          if (idx !== -1) this.packages[idx] = { ...this.packages[idx], ...updates };
          return doc as any;
        }
      }
    } catch (e) { }

    const idx = this.packages.findIndex(p => p._id === id);
    if (idx !== -1) {
      this.packages[idx] = { ...this.packages[idx], ...updates };
      return this.packages[idx];
    }
    return null;
  }

  // ================= CUSTOMER PACKAGES & REDEMPTIONS (M4 - Phase 2) =================
  async getCustomerPackages(customerId: string): Promise<ICustomerPackage[]> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const docs = await (CustomerPackage as any).find({ customerId }).sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs as any;
      }
    } catch (e) { }

    return this.customerPackages.filter(cp => cp.customerId === customerId);
  }

  async sellCustomerPackage(data: {
    customerId: string;
    packageId: string;
    storeSold: string;
    invoiceNo: string;
  }): Promise<ICustomerPackage | null> {
    const pkg = await this.getPackageById(data.packageId);
    if (!pkg) return null;

    const expiryDate = new Date(Date.now() + (pkg.validityDays || 180) * 86400000).toISOString().split('T')[0];
    const servicesRemaining = (pkg.services || []).map(s => ({
      serviceName: s.serviceName,
      totalCount: s.count,
      usedCount: 0,
      remainingCount: s.count,
    }));

    const newCustPkg: ICustomerPackage = {
      _id: `cpkg-${Date.now()}`,
      customerId: data.customerId,
      packageId: data.packageId,
      packageName: pkg.name,
      storeSold: data.storeSold.toUpperCase(),
      purchaseInvoiceNo: data.invoiceNo,
      servicesRemaining,
      totalSittings: pkg.totalSittings,
      usedSittings: 0,
      remainingSittings: pkg.totalSittings,
      validityExpiryDate: expiryDate,
      status: 'Active',
      adjustmentHistory: [],
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const { _id, ...custPkgData } = newCustPkg;
        const doc = await (CustomerPackage as any).create(custPkgData);
        const saved = doc.toObject();
        saved._id = saved._id.toString();
        this.customerPackages.unshift(saved);
        return saved;
      }
    } catch (e) {
      console.error('Failed to persist customer package in MongoDB:', e);
    }

    this.customerPackages.unshift(newCustPkg);
    return newCustPkg;
  }

  async redeemPackageSitting(
    customerPackageId: string,
    serviceName: string,
    redeemStore: string
  ): Promise<{ success: boolean; message: string; package?: ICustomerPackage }> {
    const settings = await this.getSettings();
    let pkg: ICustomerPackage | undefined;

    try {
      const db = await connectToDatabase();
      if (db) {
        const doc = await (CustomerPackage as any).findById(customerPackageId);
        if (doc) pkg = doc.toObject();
      }
    } catch (e) { }

    if (!pkg) {
      pkg = this.customerPackages.find(cp => cp._id === customerPackageId);
    }

    if (!pkg) {
      return { success: false, message: 'Customer package not found' };
    }

    if (pkg.status !== 'Active') {
      return { success: false, message: `Package is currently ${pkg.status}` };
    }

    if (pkg.remainingSittings <= 0) {
      return { success: false, message: 'No remaining sittings available in this package' };
    }

    // Cross-store check (BRD rule: packageUseInOtherStores)
    if (!settings.packageUseInOtherStores && pkg.storeSold.toUpperCase() !== redeemStore.toUpperCase()) {
      return {
        success: false,
        message: `Package was purchased at ${pkg.storeSold} and cannot be redeemed at ${redeemStore} per clinic policy.`,
      };
    }

    // Deduct sitting
    pkg.usedSittings = (pkg.usedSittings || 0) + 1;
    pkg.remainingSittings = pkg.totalSittings - pkg.usedSittings;
    if (pkg.remainingSittings <= 0) {
      pkg.status = 'Completed';
    }

    // Deduct specific service if found
    if (pkg.servicesRemaining && pkg.servicesRemaining.length > 0) {
      const cleanTarget = (serviceName || '')
        .replace(/\s*\(From Package:.*$/i, '')
        .replace(/\)$/, '')
        .trim()
        .toLowerCase();

      // 1. Exact match (trimmed, case-insensitive)
      let sItem = pkg.servicesRemaining.find(
        s => s.serviceName.trim().toLowerCase() === cleanTarget && s.remainingCount > 0
      );

      // 2. Substring match
      if (!sItem && cleanTarget) {
        sItem = pkg.servicesRemaining.find(
          s => (cleanTarget.includes(s.serviceName.toLowerCase()) || s.serviceName.toLowerCase().includes(cleanTarget)) && s.remainingCount > 0
        );
      }

      // 3. Fallback: if only 1 service in package has remaining balance, use it
      if (!sItem) {
        const remainingList = pkg.servicesRemaining.filter(s => s.remainingCount > 0);
        if (remainingList.length === 1) {
          sItem = remainingList[0];
        }
      }

      if (sItem) {
        sItem.usedCount = (sItem.usedCount || 0) + 1;
        sItem.remainingCount = Math.max(0, sItem.remainingCount - 1);
      }
    }

    try {
      const db = await connectToDatabase();
      if (db) {
        await (CustomerPackage as any).findByIdAndUpdate(
          customerPackageId,
          {
            $set: {
              usedSittings: pkg.usedSittings,
              remainingSittings: pkg.remainingSittings,
              status: pkg.status,
              servicesRemaining: pkg.servicesRemaining,
            }
          },
          { new: true }
        );
      }
    } catch (e) {
      console.error('Error updating CustomerPackage in DB:', e);
    }

    const idx = this.customerPackages.findIndex(cp => cp._id === customerPackageId);
    if (idx !== -1) {
      this.customerPackages[idx] = pkg;
    }

    return {
      success: true,
      message: `Sitting deducted. ${pkg.remainingSittings} sittings remaining.`,
      package: pkg,
    };
  }

  async adjustCustomerPackage(
    customerPackageId: string,
    deltaSittings: number,
    newExpiryDate?: string,
    reason: string = 'Admin Manual Adjustment',
    byUser: string = 'Admin'
  ): Promise<ICustomerPackage | null> {
    let pkg = this.customerPackages.find(cp => cp._id === customerPackageId);
    if (!pkg) return null;

    pkg.totalSittings += deltaSittings;
    pkg.remainingSittings = pkg.totalSittings - pkg.usedSittings;
    if (pkg.remainingSittings > 0 && pkg.status === 'Completed') {
      pkg.status = 'Active';
    }
    if (newExpiryDate) {
      pkg.validityExpiryDate = newExpiryDate;
    }
    pkg.adjustmentHistory = pkg.adjustmentHistory || [];
    pkg.adjustmentHistory.push({
      action: deltaSittings >= 0 ? `Added ${deltaSittings} sittings` : `Deducted ${Math.abs(deltaSittings)} sittings`,
      reason,
      date: new Date().toISOString(),
      byUser,
    });

    try {
      const db = await connectToDatabase();
      if (db) {
        await (CustomerPackage as any).findByIdAndUpdate(customerPackageId, pkg);
      }
    } catch (e) { }

    return pkg;
  }

  // ================= APPOINTMENTS & CALENDAR (M6 - Phase 2) =================
  async getAppointments(storeCode?: string, date?: string, staffId?: string): Promise<IAppointment[]> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const query: any = {};
        if (storeCode && storeCode !== 'ALL') {
          query.storeId = { $in: [storeCode.toUpperCase(), storeCode.replace('NILA-', '')] };
        }
        if (date) query.date = date;
        if (staffId && staffId !== 'ALL') {
          query.$or = [{ staffId }, { doctorId: staffId }, { staffName: staffId }, { stylistName: staffId }];
        }
        const docs = await (Appointment as any).find(query).sort({ startTime: 1, createdAt: -1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => ({ ...d, _id: d._id?.toString() }));
        }
        const totalApptCount = await (Appointment as any).countDocuments();
        if (totalApptCount > 0) {
          return [];
        }
      }
    } catch (e) { }

    let res = this.appointments;
    if (storeCode && storeCode !== 'ALL') {
      res = res.filter(
        a =>
          a.storeId.toUpperCase() === storeCode.toUpperCase() ||
          a.storeId.toUpperCase() === storeCode.replace('NILA-', '')
      );
    }
    if (date) {
      res = res.filter(a => a.date === date);
    }
    if (staffId && staffId !== 'ALL') {
      res = res.filter(
        a =>
          a.staffId === staffId ||
          a.doctorId === staffId ||
          a.staffName === staffId ||
          a.stylistName === staffId
      );
    }
    return res;
  }

  async checkDoubleBooking(
    date: string,
    startTime: string,
    durationMins: number,
    staffNameOrId: string,
    excludeId?: string
  ): Promise<{ hasConflict: boolean; conflictingAppt?: IAppointment }> {
    const appts = await this.getAppointments('ALL', date);
    const parseTime = (t: string) => {
      const parts = t.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!parts) return 0;
      let h = parseInt(parts[1], 10);
      const m = parseInt(parts[2], 10);
      const ampm = (parts[3] || '').toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const targetStart = parseTime(startTime);
    const targetEnd = targetStart + durationMins;

    for (const a of appts) {
      if (excludeId && (a._id === excludeId || a.appointmentId === excludeId)) continue;
      if (a.status === 'Cancelled' || a.status === 'Completed' || a.status === 'No-show') continue;

      const matchesStaff =
        a.staffId === staffNameOrId ||
        a.doctorId === staffNameOrId ||
        a.staffName?.toLowerCase() === staffNameOrId.toLowerCase() ||
        a.stylistName?.toLowerCase() === staffNameOrId.toLowerCase();

      if (matchesStaff) {
        const apptStart = parseTime(a.startTime || a.time || '10:00 AM');
        const apptEnd = apptStart + (a.durationMins || 30);
        // Overlap condition
        if (Math.max(targetStart, apptStart) < Math.min(targetEnd, apptEnd)) {
          return { hasConflict: true, conflictingAppt: a };
        }
      }
    }
    return { hasConflict: false };
  }

  async createAppointment(data: Partial<IAppointment>): Promise<IAppointment> {
    const apptUnique = data.appointmentId || `APP-${Date.now().toString().slice(-6)}`;
    const newAppt: IAppointment = {
      _id: `appt-${Date.now()}`,
      appointmentId: apptUnique,
      customerId: data.customerId,
      customerName: data.customerName || 'Client',
      customerPhone: data.customerPhone || '',
      serviceName: data.serviceName || 'Consultation',
      serviceId: data.serviceId,
      staffName: data.staffName || data.doctorName || data.stylistName || 'Specialist',
      staffId: data.staffId,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      stylistName: data.staffName || data.doctorName || data.stylistName,
      storeId: (data.storeId || 'NILA-TH').toUpperCase(),
      date: data.date || new Date().toISOString().split('T')[0],
      startTime: data.startTime || data.time || '10:00 AM',
      durationMins: data.durationMins || 15,
      status: data.status || 'Booked',
      cancelReason: data.cancelReason,
      notes: data.notes || '',
      amount: data.amount || 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const { _id, ...apptData } = newAppt;
        const doc = await (Appointment as any).create(apptData);
        const saved = doc.toObject();
        saved._id = saved._id.toString();
        this.appointments.unshift(saved);
        return saved;
      }
    } catch (e) {
      console.error('Failed to persist appointment in MongoDB:', e);
    }

    this.appointments.unshift(newAppt);
    return newAppt;
  }

  async updateAppointment(id: string, updates: Partial<IAppointment>): Promise<IAppointment | null> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const doc = await (Appointment as any).findByIdAndUpdate(id, updates, { new: true }).lean();
        if (doc) {
          const idx = this.appointments.findIndex(a => a._id === id || a.appointmentId === id);
          if (idx !== -1) this.appointments[idx] = { ...this.appointments[idx], ...updates };
          return doc as any;
        }
      }
    } catch (e) { }

    const idx = this.appointments.findIndex(a => a._id === id || a.appointmentId === id);
    if (idx !== -1) {
      this.appointments[idx] = { ...this.appointments[idx], ...updates };
      return this.appointments[idx];
    }
    return null;
  }

  // Appointment Check-in (Pushes patient to Doctor's Consultation Queue)
  async checkInAppointment(appointmentId: string): Promise<{ appointment: IAppointment; visit?: IVisit }> {
    const appt = await this.updateAppointment(appointmentId, { status: 'Arrived' });
    if (!appt) throw new Error('Appointment not found');

    let visit: IVisit | undefined;
    // If the appointment is with a doctor or consultation service, push to Visit queue
    const isDoctor = appt.doctorId || (appt.serviceName && appt.serviceName.toLowerCase().includes('consultation'));
    if (isDoctor) {
      visit = await this.createVisit({
        patientId: appt.customerId || `cust-${Date.now()}`,
        patientName: appt.customerName,
        patientPhone: appt.customerPhone,
        storeId: appt.storeId,
        doctorId: appt.doctorId || 'user-doc-1',
        doctorName: appt.doctorName || appt.staffName || 'Dr. Anitha Ramachandran',
        status: 'Waiting',
      });
    }

    return { appointment: appt, visit };
  }

  // ================= DOCTOR CLINICAL PANEL & VISITS (M7 - Phase 2) =================
  async getVisits(storeCode?: string, doctorId?: string, status?: string): Promise<IVisit[]> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const query: any = {};
        if (storeCode && storeCode !== 'ALL') {
          query.storeId = { $in: [storeCode.toUpperCase(), storeCode.replace('NILA-', '')] };
        }
        if (doctorId) {
          const docIdTrim = String(doctorId).trim();
          const docIds = [docIdTrim];
          const docNames: string[] = [];

          // Fast-path known doctor aliases without extra DB roundtrip
          if (docIdTrim === 'user-doc-1' || docIdTrim.toLowerCase().includes('anitha')) {
            docIds.push('user-doc-1', '6afaf14cb00b4600f4042892', '6afaf14db00b4600f4042897', '6b0296ec8be796595c91e0b2');
            docNames.push('Dr. Anitha Ramachandran', 'Anitha R.');
          } else if (docIdTrim === 'user-doc-2' || docIdTrim.toLowerCase().includes('rajesh')) {
            docIds.push('user-doc-2');
            docNames.push('Dr. Rajesh Varma', 'Rajesh Varma');
          } else if (docIdTrim === 'user-doc-3' || docIdTrim.toLowerCase().includes('priya')) {
            docIds.push('user-doc-3');
            docNames.push('Dr. Priya Dharshini', 'Priya Dharshini');
          } else {
            try {
              const isValidOid = mongoose.isValidObjectId ? mongoose.isValidObjectId(docIdTrim) : false;
              const docUser = await (User as any).findOne({
                $or: [
                  ...(isValidOid ? [{ _id: docIdTrim }] : []),
                  { email: docIdTrim },
                  { name: docIdTrim },
                ],
              }).lean();

              if (docUser) {
                if (docUser._id) docIds.push(docUser._id.toString());
                if (docUser.email) docIds.push(docUser.email);
                if (docUser.name) docNames.push(docUser.name);
              }
            } catch (_) {}
          }

          query.$or = [
            { doctorId: { $in: docIds } },
            ...(docNames.length > 0 ? [{ doctorName: { $in: docNames } }] : []),
          ];
        }
        if (status) query.status = status;
        const docs = await (Visit as any).find(query).sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => ({ ...d, _id: d._id?.toString() }));
        }
        return [];
      }
    } catch (e) {
      console.error('getVisits error:', e);
    }

    let res = this.visits;
    if (storeCode && storeCode !== 'ALL') {
      res = res.filter(
        v =>
          v.storeId.toUpperCase() === storeCode.toUpperCase() ||
          v.storeId.toUpperCase() === storeCode.replace('NILA-', '')
      );
    }
    if (doctorId) {
      const docIdTrim = String(doctorId).toLowerCase();
      res = res.filter(v =>
        v.doctorId === doctorId ||
        (v.doctorName && v.doctorName.toLowerCase().includes('anitha') && (docIdTrim.includes('anitha') || docIdTrim === 'user-doc-1')) ||
        (v.doctorName && v.doctorName.toLowerCase().includes('rajesh') && (docIdTrim.includes('rajesh') || docIdTrim === 'user-doc-2')) ||
        (v.doctorName && v.doctorName.toLowerCase().includes('priya') && (docIdTrim.includes('priya') || docIdTrim === 'user-doc-3'))
      );
    }
    if (status) {
      res = res.filter(v => v.status === status);
    }
    return res;
  }

  async createVisit(data: Partial<IVisit>): Promise<IVisit> {
    const visitUnique = data.visitId || `VIS-${Date.now().toString().slice(-6)}`;
    const newVisit: IVisit = {
      _id: `vis-${Date.now()}`,
      visitId: visitUnique,
      patientId: data.patientId || `CID-${Date.now()}`,
      patientName: data.patientName || 'Patient',
      patientPhone: data.patientPhone || '',
      storeId: (data.storeId || 'NILA-TH').toUpperCase(),
      doctorId: data.doctorId || 'user-doc-1',
      doctorName: data.doctorName || 'Dr. Anitha Ramachandran',
      status: data.status || 'Waiting',
      caseNotes: data.caseNotes || '',
      prescriptionText: data.prescriptionText || '',
      prescriptionImage: data.prescriptionImage || '',
      isReadByDoctor: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const { _id, ...visitData } = newVisit;
        const doc = await (Visit as any).create(visitData);
        const saved = doc.toObject();
        saved._id = saved._id.toString();
        this.visits.unshift(saved);
        return saved;
      }
    } catch (e) {
      console.error('Failed to persist visit in MongoDB:', e);
    }

    this.visits.unshift(newVisit);
    return newVisit;
  }

  async updateVisit(id: string, updates: Partial<IVisit>): Promise<IVisit | null> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const doc = await (Visit as any).findOneAndUpdate(
          { $or: [{ _id: id }, { visitId: id }] },
          updates,
          { new: true }
        ).lean();
        if (doc) {
          const idx = this.visits.findIndex(v => v._id === id || v.visitId === id);
          if (idx !== -1) this.visits[idx] = { ...this.visits[idx], ...updates };
          return doc as any;
        }
      }
    } catch (e) { }

    const idx = this.visits.findIndex(v => v._id === id || v.visitId === id);
    if (idx !== -1) {
      this.visits[idx] = { ...this.visits[idx], ...updates };
      return this.visits[idx];
    }
    return null;
  }

  // Consultation completion workflow:
  // Auto-creates an UNPAID bill in Quick Sale POS with Doctor Consultation Fee (FR-18, BR-02, NFR-06)
  async autoCreateBillForVisit(visitId: string, consultationFee: number = 500): Promise<IInvoice | null> {
    const visits = await this.getVisits();
    const visit = visits.find(v => v._id === visitId || v.visitId === visitId);
    if (!visit) return null;

    if (visit.billId) {
      // Never Twice Rule (NFR-06): Consultation bills are created only once per visit
      const existing = await this.getInvoiceById(visit.billId);
      if (existing) return existing;
    }

    const targetStore = visit.storeId.toUpperCase();
    const invoiceNo = await this.getNextInvoiceNumber(targetStore);

    const items = [
      {
        type: 'service' as const,
        itemId: 'svc-5',
        name: `Doctor Consultation (${visit.doctorName})`,
        staffName: visit.doctorName,
        quantity: 1,
        price: consultationFee,
        discountPercent: 0,
        total: consultationFee,
      },
    ];

    const newBill = await this.createQuickSaleInvoice({
      invoiceNo,
      storeId: targetStore,
      customerId: visit.patientId,
      customerName: visit.patientName,
      customerMobile: visit.patientPhone,
      customerPhone: visit.patientPhone,
      date: new Date().toISOString().split('T')[0],
      items,
      subtotal: consultationFee,
      discount: 0,
      tax: 0,
      grandTotal: consultationFee,
      payableAmount: consultationFee,
      payments: [],
      paidAmount: 0,
      changeAmount: 0,
      paymentMethod: 'Unpaid',
      status: 'Unpaid',
      staffName: visit.doctorName,
      visitId: visit.visitId,
      remarks: `Consultation with ${visit.doctorName}. Case notes recorded.`,
    });

    await this.updateVisit(visit.visitId, { billId: newBill.invoiceNo, status: 'Done' });

    // Also update any matching appointment for this patient/date to Completed
    const today = new Date().toISOString().split('T')[0];
    const appts = await this.getAppointments(targetStore, today);
    const matchingAppt = appts.find(
      a => a.customerPhone === visit.patientPhone || a.customerName === visit.patientName
    );
    if (matchingAppt) {
      await this.updateAppointment(matchingAppt._id || matchingAppt.appointmentId!, { status: 'Completed' });
    }

    return newBill;
  }

  // ================= QUICK SALE & INVOICING (M5) =================
  async getInvoices(
    storeCode?: string,
    status?: string,
    options?: { limit?: number; page?: number; skip?: number; selectFields?: string }
  ): Promise<IInvoice[]> {
    const limit = options?.limit ?? 50;
    const page = options?.page ?? 1;
    const skip = options?.skip ?? (page - 1) * limit;

    try {
      const db = await connectToDatabase();
      if (db) {
        const query: any = {};
        if (storeCode && storeCode !== 'ALL') {
          query.storeId = { $in: [storeCode.toUpperCase(), storeCode.replace('NILA-', '')] };
        }
        if (status) query.status = status;

        const projection = options?.selectFields || 'invoiceNo storeId customerId customerName customerMobile customerPhone date items subtotal discount tax grandTotal payableAmount paidAmount payments changeAmount tipAmount tipStaffName rowDiscountTotal billDiscountType billDiscountValue paymentMethod status staffName visitId remarks createdAt paidAt';

        const docs = await (Invoice as any)
          .find(query)
          .select(projection)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        if (docs) {
          return docs.map((d: any) => ({ ...d, _id: d._id?.toString() }));
        }
        return [];
      }
    } catch (e) { }

    let res = this.invoices;
    if (storeCode && storeCode !== 'ALL') {
      res = res.filter(
        inv =>
          inv.storeId.toUpperCase() === storeCode.toUpperCase() ||
          inv.storeId.toUpperCase() === storeCode.replace('NILA-', '')
      );
    }
    if (status) {
      res = res.filter(inv => inv.status === status);
    }
    return res.slice(skip, skip + limit);
  }

  // High-performance MongoDB Aggregation Pipeline for Dashboard Analytics
  async getReportAggregates(storeCode?: string, dateRange: string = 'today', customDate?: string) {
    const now = new Date();
    const todayStr = getLocalDateString(now);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    try {
      const db = await connectToDatabase();
      if (db) {
        let invoiceMatch: any;
        let visitMatch: any;

        if (customDate) {
          const [y, m, d] = customDate.split('-').map(Number);
          const selectedDayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
          const selectedDayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
          invoiceMatch = {
            $or: [
              { date: customDate },
              { createdAt: { $gte: selectedDayStart, $lte: selectedDayEnd } },
            ],
          };
          visitMatch = {
            $or: [
              { date: customDate },
              { createdAt: { $gte: selectedDayStart, $lte: selectedDayEnd } },
            ],
          };
        } else if (dateRange === 'today') {
          invoiceMatch = {
            $or: [
              { date: todayStr },
              { createdAt: { $gte: startOfToday, $lte: endOfToday } },
            ],
          };
          visitMatch = {
            $or: [
              { date: todayStr },
              { createdAt: { $gte: startOfToday, $lte: endOfToday } },
            ],
          };
        } else if (dateRange === 'week') {
          const weekStartStr = getLocalDateString(startOfWeek);
          invoiceMatch = {
            $or: [
              { date: { $gte: weekStartStr } },
              { createdAt: { $gte: startOfWeek } },
            ],
          };
          visitMatch = {
            $or: [
              { date: { $gte: weekStartStr } },
              { createdAt: { $gte: startOfWeek } },
            ],
          };
        } else if (dateRange === 'month') {
          const monthStartStr = getLocalDateString(startOfMonth);
          invoiceMatch = {
            $or: [
              { date: { $gte: monthStartStr } },
              { createdAt: { $gte: startOfMonth } },
            ],
          };
          visitMatch = {
            $or: [
              { date: { $gte: monthStartStr } },
              { createdAt: { $gte: startOfMonth } },
            ],
          };
        } else {
          invoiceMatch = {};
          visitMatch = {};
        }

        if (storeCode && storeCode !== 'ALL') {
          invoiceMatch.storeId = { $in: [storeCode.toUpperCase(), storeCode.replace('NILA-', '')] };
          visitMatch.storeId = { $in: [storeCode.toUpperCase(), storeCode.replace('NILA-', '')] };
        }

        const [invoiceAgg, visitAgg, allStores, allUsers] = await Promise.all([
          (Invoice as any).aggregate([
            { $match: invoiceMatch },
            {
              $facet: {
                totals: [
                  {
                    $group: {
                      _id: null,
                      totalBills: { $sum: 1 },
                      paidRevenue: {
                        $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$grandTotal', 0] },
                      },
                      pendingPayments: {
                        $sum: { $cond: [{ $eq: ['$status', 'Unpaid'] }, '$grandTotal', 0] },
                      },
                      paidCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] },
                      },
                      unpaidCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'Unpaid'] }, 1, 0] },
                      },
                    },
                  },
                ],
                byPaymentMode: [
                  { $match: { status: 'Paid' } },
                  {
                    $group: {
                      _id: '$paymentMethod',
                      amount: { $sum: '$grandTotal' },
                      count: { $sum: 1 },
                    },
                  },
                ],
                byStaff: [
                  { $match: { status: 'Paid' } },
                  {
                    $group: {
                      _id: '$staffName',
                      revenueCollected: { $sum: '$grandTotal' },
                      billsProcessed: { $sum: 1 },
                    },
                  },
                ],
                byStore: [
                  { $match: { status: 'Paid' } },
                  {
                    $group: {
                      _id: '$storeId',
                      revenue: { $sum: '$grandTotal' },
                      invoices: { $sum: 1 },
                    },
                  },
                ],
              },
            },
          ]),
          (Visit as any).aggregate([
            { $match: visitMatch },
            {
              $facet: {
                totalVisits: [{ $count: 'count' }],
                byDoctor: [
                  {
                    $group: {
                      _id: '$doctorName',
                      visits: { $sum: 1 },
                      completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] },
                      },
                    },
                  },
                ],
                byStore: [
                  {
                    $group: {
                      _id: '$storeId',
                      patients: { $sum: 1 },
                    },
                  },
                ],
              },
            },
          ]),
          this.getStores(),
          this.getUsers(),
        ]);

        const invFacets = invoiceAgg?.[0] || {};
        const visFacets = visitAgg?.[0] || {};
        const totals = invFacets.totals?.[0] || {
          totalBills: 0,
          paidRevenue: 0,
          pendingPayments: 0,
          paidCount: 0,
          unpaidCount: 0,
        };

        const paymentModeTotals: Record<string, { amount: number; count: number }> = {
          Cash: { amount: 0, count: 0 },
          Card: { amount: 0, count: 0 },
          UPI: { amount: 0, count: 0 },
        };
        (invFacets.byPaymentMode || []).forEach((pm: any) => {
          const mode = pm._id || 'Cash';
          if (paymentModeTotals[mode]) {
            paymentModeTotals[mode] = { amount: pm.amount || 0, count: pm.count || 0 };
          }
        });

        const staffCounts: Record<string, { name: string; billsProcessed: number; revenueCollected: number }> = {};
        (invFacets.byStaff || []).forEach((st: any) => {
          const name = st._id || 'Staff';
          staffCounts[name] = {
            name,
            billsProcessed: st.billsProcessed || 0,
            revenueCollected: st.revenueCollected || 0,
          };
        });

        const doctorCounts: Record<string, { name: string; visits: number; completed: number }> = {};
        const doctors = allUsers.filter(u => u.role === 'doctor');
        doctors.forEach(doc => {
          doctorCounts[doc.name] = { name: doc.name, visits: 0, completed: 0 };
        });
        (visFacets.byDoctor || []).forEach((doc: any) => {
          const name = doc._id || 'Doctor';
          doctorCounts[name] = {
            name,
            visits: doc.visits || 0,
            completed: doc.completed || 0,
          };
        });

        const storeBreakdown: Record<string, { storeId: string; name: string; revenue: number; invoices: number; patients: number }> = {};
        allStores.forEach(st => {
          const code = st.code.toUpperCase();
          storeBreakdown[code] = {
            storeId: code,
            name: st.name.replace('Nila Clinic - ', ''),
            revenue: 0,
            invoices: 0,
            patients: 0,
          };
        });
        (invFacets.byStore || []).forEach((s: any) => {
          const code = String(s._id || '').toUpperCase();
          if (storeBreakdown[code]) {
            storeBreakdown[code].revenue = s.revenue || 0;
            storeBreakdown[code].invoices = s.invoices || 0;
          }
        });
        (visFacets.byStore || []).forEach((s: any) => {
          const code = String(s._id || '').toUpperCase();
          if (storeBreakdown[code]) {
            storeBreakdown[code].patients = s.patients || 0;
          }
        });

        return {
          totalRevenue: totals.paidRevenue || 0,
          pendingPayments: totals.pendingPayments || 0,
          totalBillsCount: totals.totalBills || 0,
          totalPatientsCount: visFacets.totalVisits?.[0]?.count || 0,
          paidBillsCount: totals.paidCount || 0,
          unpaidBillsCount: totals.unpaidCount || 0,
          paymentModeTotals,
          doctorCounts,
          staffCounts,
          storeBreakdown,
        };
      }
    } catch (e) {
      console.error('Error in getReportAggregates, falling back to memory compute:', e);
    }

    return null;
  }

  async getInvoiceById(invoiceNoOrId: string): Promise<IInvoice | null> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const isValidOid = mongoose.isValidObjectId(invoiceNoOrId);
        const query = isValidOid
          ? { $or: [{ invoiceNo: invoiceNoOrId }, { _id: invoiceNoOrId }] }
          : { invoiceNo: invoiceNoOrId };
        const doc = await (Invoice as any).findOne(query).lean();
        if (doc) return { ...doc, _id: doc._id?.toString() } as any;
      }
    } catch (e) {
      console.error('getInvoiceById error:', e);
    }

    return this.invoices.find(i => i.invoiceNo === invoiceNoOrId || i._id === invoiceNoOrId) || null;
  }

  async updateInvoice(invoiceId: string, updates: Partial<IInvoice>): Promise<IInvoice | null> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const isValidOid = mongoose.isValidObjectId(invoiceId);
        const query = isValidOid
          ? { $or: [{ invoiceNo: invoiceId }, { _id: invoiceId }] }
          : { invoiceNo: invoiceId };

        // If marking as Paid, ensure payments breakdown and paidAt are properly set
        if (updates.status === 'Paid') {
          if (!updates.paidAt) updates.paidAt = new Date().toISOString();
          if (updates.paidAmount === undefined) {
            const existing = await (Invoice as any).findOne(query).lean();
            if (existing) {
              updates.paidAmount = existing.payableAmount || existing.grandTotal || 0;
            }
          }
          if (!updates.payments || updates.payments.length === 0) {
            updates.payments = [
              {
                mode: updates.paymentMethod || 'Cash',
                amount: updates.paidAmount || 0,
                type: (updates.paymentMethod || 'Cash') === 'Cash' ? 'cash' : 'non-cash',
              }
            ];
          }
        }

        const doc = await (Invoice as any).findOneAndUpdate(
          query,
          { $set: updates },
          { new: true }
        ).lean();

        if (doc) {
          const saved = { ...doc, _id: doc._id?.toString() };
          const idx = this.invoices.findIndex(i => i._id === invoiceId || i.invoiceNo === invoiceId);
          if (idx !== -1) this.invoices[idx] = { ...this.invoices[idx], ...updates };

          // Complete linked visit
          if (doc.status === 'Paid' && doc.visitId) {
            try {
              await (Visit as any).findOneAndUpdate(
                { visitId: doc.visitId },
                { $set: { status: 'Done', billId: doc.invoiceNo } }
              );
            } catch (_) {}
          }

          // Update customer visit stats
          if (doc.status === 'Paid' && doc.customerId && updates.status === 'Paid') {
            try {
              await (Customer as any).findOneAndUpdate(
                { $or: [{ customerId: doc.customerId }, { _id: doc.customerId }] },
                { $inc: { visits: 1, totalSpent: doc.grandTotal || 0 } }
              );
            } catch (_) {}
          }

          return saved as any;
        }
      }
    } catch (e) {
      console.error('updateInvoice error:', e);
    }

    const idx = this.invoices.findIndex(i => i._id === invoiceId || i.invoiceNo === invoiceId);
    if (idx !== -1) {
      this.invoices[idx] = { ...this.invoices[idx], ...updates };
      return this.invoices[idx];
    }
    return null;
  }

  async createQuickSaleInvoice(data: Partial<IInvoice>): Promise<IInvoice> {
    const targetStore = (data.storeId || 'NILA-TH').toUpperCase();
    const invoiceNo = data.invoiceNo || (await this.getNextInvoiceNumber(targetStore));

    const newInv: IInvoice = {
      _id: `inv-${Date.now()}`,
      invoiceNo,
      storeId: targetStore,
      customerId: data.customerId,
      customerName: data.customerName || 'Walk-in Client',
      customerMobile: data.customerMobile || data.customerPhone || '',
      customerPhone: data.customerMobile || data.customerPhone || '',
      date: data.date || new Date().toISOString().split('T')[0],
      items: data.items || [],
      subtotal: data.subtotal || 0,
      rowDiscountTotal: data.rowDiscountTotal || 0,
      billDiscountType: data.billDiscountType,
      billDiscountValue: data.billDiscountValue || 0,
      discount: data.discount || 0,
      tax: data.tax || 0,
      grandTotal: data.grandTotal || 0,
      tipAmount: data.tipAmount || 0,
      tipStaffName: data.tipStaffName || '',
      payableAmount: data.payableAmount || data.grandTotal || 0,
      payments: data.payments || [],
      paidAmount: data.status === 'Paid' ? (data.paidAmount ?? data.payableAmount ?? data.grandTotal ?? 0) : (data.paidAmount ?? 0),
      changeAmount: data.changeAmount || 0,
      paymentMethod: data.paymentMethod || 'Cash',
      remarks: data.remarks || '',
      status: data.status || 'Paid',
      staffName: data.staffName || 'Staff',
      staffId: data.staffId,
      visitId: data.visitId,
      createdAt: new Date().toISOString(),
      paidAt: data.status === 'Paid' ? new Date().toISOString() : undefined,
    };

    // Update customer stats if customer exists
    if (data.customerId) {
      const custIdx = this.customers.findIndex(
        c => c.customerId === data.customerId || c._id === data.customerId
      );
      if (custIdx !== -1) {
        this.customers[custIdx].visits = (this.customers[custIdx].visits || 0) + 1;
        this.customers[custIdx].totalSpent = (this.customers[custIdx].totalSpent || 0) + (newInv.grandTotal || 0);
      }
    }

    // Process any package sales inside items
    if (newInv.status === 'Paid' && data.customerId) {
      for (const item of newInv.items) {
        if (item.type === 'package' && item.itemId) {
          await this.sellCustomerPackage({
            customerId: data.customerId,
            packageId: item.itemId,
            storeSold: targetStore,
            invoiceNo: newInv.invoiceNo,
          });
        }
      }
    }

    // Process package sitting redemptions inside items (FR-36)
    if (newInv.status === 'Paid') {
      for (const item of newInv.items) {
        if (item.isFromPackage && item.packageId) {
          const rawServiceName = item.packageServiceName || item.name.replace(/\s*\(From Package:.*$/i, '').trim();
          await this.redeemPackageSitting(item.packageId, rawServiceName, targetStore);
        }
      }
    }

    try {
      const db = await connectToDatabase();
      if (db) {
        const { _id, ...invData } = newInv;
        let doc: any;
        try {
          doc = await (Invoice as any).create(invData);
        } catch (createErr: any) {
          // If invoice sequence collision occurs (E11000 duplicate key), auto-heal sequence and retry
          if (createErr?.code === 11000 || createErr?.message?.includes('duplicate key error')) {
            console.warn(`Duplicate invoice ${newInv.invoiceNo} encountered. Regenerating next sequence...`);
            const freshInvoiceNo = await this.getNextInvoiceNumber(targetStore);
            newInv.invoiceNo = freshInvoiceNo;
            invData.invoiceNo = freshInvoiceNo;
            doc = await (Invoice as any).create(invData);
          } else {
            throw createErr;
          }
        }

        const saved = doc.toObject();
        saved._id = saved._id.toString();
        this.invoices.unshift(saved);

        // Update customer totalSpent and visits in MongoDB
        if (data.customerId) {
          try {
            await (Customer as any).findOneAndUpdate(
              { $or: [{ customerId: data.customerId }, { _id: data.customerId }] },
              { $inc: { visits: 1, totalSpent: newInv.grandTotal || 0 } }
            );
          } catch (custErr) {
            console.error('Error updating customer visits in DB:', custErr);
          }
        }

        return saved;
      }
    } catch (e) {
      console.error('Failed to persist invoice in MongoDB:', e);
    }

    this.invoices.unshift(newInv);
    return newInv;
  }

  async cancelInvoice(id: string, reason: string): Promise<IInvoice | null> {
    try {
      const db = await connectToDatabase();
      if (db) {
        const isValidOid = mongoose.isValidObjectId(id);
        const query = isValidOid
          ? { $or: [{ _id: id }, { invoiceNo: id }] }
          : { invoiceNo: id };
        const doc = await (Invoice as any).findOneAndUpdate(
          query,
          { $set: { status: 'Cancelled', cancellationReason: reason } },
          { new: true }
        ).lean();
        if (doc) return { ...doc, _id: doc._id?.toString() } as any;
      }
    } catch (e) {
      console.error('cancelInvoice error:', e);
    }

    const idx = this.invoices.findIndex(i => i._id === id || i.invoiceNo === id);
    if (idx !== -1) {
      this.invoices[idx].status = 'Cancelled';
      this.invoices[idx].cancellationReason = reason;
      return this.invoices[idx];
    }
    return null;
  }
}

// Global Singleton Instance
declare global {
  var globalClinicService: ClinicService | undefined;
}

const clinicService = global.globalClinicService || new ClinicService();
if (process.env.NODE_ENV !== 'production') global.globalClinicService = clinicService;

export default clinicService;
