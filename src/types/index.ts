// ================= BRD v3.0 DATA TYPES =================

export interface IStore {
  _id?: any;
  name: string; // e.g. 'Nila Clinic - Theni Main Branch'
  code: string; // e.g. 'NILA-TH', used as invoice prefix
  address: string;
  phone: string;
  email?: string;
  gstin?: string;
  workingHours?: {
    open: string;
    close: string;
    weeklyOff: string;
  };
  invoicePrefix?: string;
  nextInvoiceNumber?: number;
  isActive: boolean;
  createdAt?: string;
}

export type StaffDesignation = 'Doctor' | 'Therapist' | 'Front desk' | 'Customer care' | 'Manager';

export interface IStaff {
  _id?: any;
  name: string;
  mobile: string;
  email?: string;
  phone?: string; // alias
  designation: StaffDesignation;
  role?: string; // compatibility
  image?: string;
  stores: string[]; // Store codes e.g. ['NILA-TH', 'NILA-MD']
  workingHours?: {
    start: string;
    end: string;
  };
  calendarColour?: string; // hex colour code
  showInAppointmentCalendar: boolean;
  hasLogin: boolean;
  loginRole?: 'Admin' | 'Staff' | 'Doctor';
  commissionRate?: number;
  status?: 'Available' | 'On Break' | 'Busy' | 'Off Duty';
  revenueGenerated?: number;
  isActive: boolean;
}

export interface IServiceCategory {
  _id?: any;
  name: string;
  isActive: boolean;
}

export interface IService {
  _id?: any;
  name: string;
  category: string;
  duration: number; // in minutes
  price: number;
  gstPercent?: number;
  availableStores: string[]; // ['ALL'] or specific store codes
  storeWisePrices?: Record<string, number>;
  description?: string;
  image?: string;
  isFavorite?: boolean;
  active?: boolean;
  isActive?: boolean;
}

export interface IProductCategory {
  _id?: any;
  name: string;
  isActive: boolean;
}

export interface IProduct {
  _id?: any;
  name: string;
  category: string;
  sku?: string;
  price: number;
  gstPercent?: number;
  availableStores: string[];
  isActive: boolean;
}

export interface IPaymentMode {
  _id?: any;
  name: string; // 'Cash', 'Card', 'UPI', 'NEFT'
  type: 'cash' | 'non-cash'; // Only cash gives change
  displayOrder: number;
  isActive: boolean;
}

export interface IClinicSettings {
  _id?: any;
  clinicName: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  billFooter: string;
  printSize: '80mm' | 'A4';
  gstOnBills: boolean; // default false
  maxStaffDiscountPercent: number; // default 10%
  staffCanEditPrice: boolean; // default false
  backDatedBillingRoles: string[]; // ['Admin']
  slotInterval: number; // default 15
  packageUseInOtherStores: boolean; // default true
  sharingOfCaseNotes: boolean; // default true
  staffCanExport: boolean; // default false
  endOfDayEmail: {
    enabled: boolean;
    recipients: string[];
    sendTime: string; // e.g. '21:30'
    format: 'combined' | 'per-store';
    attachExcel: boolean;
  };
}

export interface ICustomer {
  _id?: any;
  customerId: string; // e.g. 'CID-1001'
  patientId?: string; // alias
  name: string;
  mobile: string; // e.g. '+91 98450 11223'
  phone?: string; // alias
  gender: 'Female' | 'Male' | 'Other';
  dob?: string;
  age?: number; // compatibility alias
  email?: string;
  area?: string;
  address?: string; // alias
  allergyNotes?: string;
  skinHairNotes?: string;
  notes?: string;
  firstStoreId: string; // Store where registered
  storeId?: string; // compatibility alias
  visits?: number;
  totalSpent?: number;
  createdAt?: string;
}

// Backward-compatibility alias
export type IPatient = ICustomer;

export interface IQuickSaleItem {
  type: 'service' | 'product' | 'package' | 'package_use';
  itemId?: string;
  name: string;
  staffId?: string;
  staffName?: string;
  quantity: number;
  price: number;
  discountPercent?: number;
  total: number;
  packageId?: string;
  packageServiceName?: string;
  isFromPackage?: boolean;
}

export interface IPaymentSplit {
  mode: string;
  amount: number;
  type?: 'cash' | 'non-cash';
}

export interface IInvoice {
  _id?: any;
  invoiceNo: string;
  storeId: string;
  customerId?: string;
  customerName: string;
  customerMobile?: string;
  customerPhone?: string; // alias
  date: string;
  items: IQuickSaleItem[];
  subtotal: number;
  rowDiscountTotal?: number;
  billDiscountType?: 'value' | 'percent';
  billDiscountValue?: number;
  discount: number;
  tax: number;
  grandTotal: number;
  tipAmount?: number;
  tipStaffName?: string;
  payableAmount?: number;
  payments?: IPaymentSplit[];
  paidAmount?: number;
  changeAmount?: number;
  paymentMethod?: string;
  remarks?: string;
  status: 'Paid' | 'Unpaid' | 'Cancelled';
  cancellationReason?: string;
  staffId?: string;
  staffName?: string;
  visitId?: string;
  createdAt: string;
  paidAt?: string;
}

// Packages (for Phase 2)
export interface IPackageServiceItem {
  serviceId: string;
  serviceName: string;
  count: number;
  valuePerSitting?: number;
}

export interface IPackageProductItem {
  productId: string;
  productName: string;
  quantityPerSitting: number;
}

export interface IPackageMaster {
  _id?: any;
  name: string;
  type: 'Fixed' | 'On-demand';
  services: IPackageServiceItem[];
  products?: IPackageProductItem[];
  totalSittings: number;
  price: number;
  valuePerSitting: number;
  validityDays: number;
  availableStores: string[];
  isActive: boolean;
}

export interface ICustomerPackage {
  _id?: any;
  customerId: string;
  packageId: string;
  packageName: string;
  storeSold: string;
  purchaseInvoiceNo: string;
  servicesRemaining: {
    serviceName: string;
    totalCount: number;
    usedCount: number;
    remainingCount: number;
  }[];
  totalSittings: number;
  usedSittings: number;
  remainingSittings: number;
  validityExpiryDate: string;
  status: 'Active' | 'Completed' | 'Expired';
  adjustmentHistory?: {
    action: string;
    reason: string;
    date: string;
    byUser: string;
  }[];
}

export interface IUser {
  _id?: any;
  email: string;
  password?: string;
  name: string;
  role: 'admin' | 'staff' | 'doctor';
  phone?: string;
  image?: string;
  qualification?: string;
  experience?: string;
  regNo?: string;
  focus?: string;
  assignedStoreIds: string[];
  primaryStoreId?: string;
  isActive: boolean;
  specialization?: string;
  branch?: string; // compatibility alias
  salonName?: string; // compatibility alias
}

export interface IInventory {
  _id?: any;
  name: string;
  category: string;
  sku?: string;
  stock?: number;
  stockQty?: number;
  minStock?: number;
  minThreshold?: number;
  price?: number;
  unitPrice?: number;
  supplier?: string;
  storeId?: string;
  status?: 'In Stock' | 'Low Stock' | 'Out of Stock' | string;
}

export interface IVisit {
  _id?: any;
  visitId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  storeId: string;
  doctorId: string;
  doctorName: string;
  status: 'Waiting' | 'In consultation' | 'Done';
  caseNotes?: string;
  prescriptionText?: string;
  prescriptionImage?: string;
  isReadByDoctor?: boolean;
  billId?: string;
  createdAt: string;
  consultedAt?: string;
}

export interface IAppointment {
  _id?: any;
  appointmentId?: string;
  customerId?: string;
  patientId?: string; // compatibility alias
  customerName: string;
  customerPhone: string;
  serviceName: string;
  serviceId?: string;
  staffName?: string;
  staffId?: string;
  stylistName?: string;
  doctorId?: string;
  doctorName?: string;
  storeId: string;
  date: string;
  startTime: string;
  time?: string; // compatibility alias
  durationMins?: number;
  status: 'Booked' | 'Arrived' | 'In consultation' | 'Completed' | 'Cancelled' | 'No-show';
  cancelReason?: string;
  notes?: string;
  amount?: number;
  createdAt?: string;
}
