export interface IUser {
  _id?: any;
  email: string;
  password?: string;
  name: string;
  role: string;
  salonName: string;
  branch: string;
  phone?: string;
}

export interface IAppointment {
  _id?: any;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  stylistName: string;
  date: string;
  time: string;
  amount: number;
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt?: string;
}

export interface ICustomer {
  _id?: any;
  name: string;
  phone: string;
  email?: string;
  gender?: 'Female' | 'Male' | 'Other';
  visits: number;
  totalSpent: number;
  loyaltyPoints: number;
  notes?: string;
  createdAt?: string;
}

export interface IService {
  _id?: any;
  name: string;
  category: string;
  duration: number;
  price: number;
  description?: string;
  active?: boolean;
}

export interface IStaff {
  _id?: any;
  name: string;
  role: string;
  phone: string;
  commissionRate: number;
  status: 'Available' | 'On Break' | 'Busy' | 'Off Duty';
  revenueGenerated?: number;
}

export interface IInvoiceItem {
  name: string;
  price: number;
  quantity: number;
}

export interface IInvoice {
  _id?: any;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card';
  createdAt: string;
}

export interface IInventory {
  _id?: any;
  name: string;
  category: string;
  stockQty: number;
  minThreshold: number;
  unitPrice: number;
  supplier: string;
}
