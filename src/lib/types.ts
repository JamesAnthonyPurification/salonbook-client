export type ServiceStatus = "active" | "inactive";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";

export interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: ServiceStatus;
  createdAt: string;
}

export interface UserLite {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string;
  role?: "admin" | "customer";
  isBlocked?: boolean;
  createdAt?: string;
}

export interface Appointment {
  _id: string;
  serviceId: string;
  customerId: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: PaymentStatus;
  status: AppointmentStatus;
  cancelledBy?: "customer" | "admin";
  createdAt: string;
  paidAt?: string;
  service?: Partial<Service>;
  customer?: UserLite;
}

export interface Transaction {
  _id: string;
  appointmentId: string;
  customerId: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: "paid" | "failed";
  createdAt: string;
  customer?: UserLite;
  appointment?: Partial<Appointment>;
  service?: Partial<Service>;
}

export interface CategoryCount {
  name: string;
  count: number;
}
