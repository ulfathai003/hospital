
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'NURSE' | 'PHARMACIST' | 'LAB_TECHNICIAN' | 'CRM_EXECUTIVE' | 'BILLING_EXECUTIVE';

export type PatientStatus = 'Active' | 'InActive' | 'Hold';
export type AppointmentStatus = 'SCHEDULED' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
export type QueueStatus = 'PENDING' | 'ACTIVE' | 'DONE';
export type LeadStage = 'NEW' | 'CONTACTED' | 'COUNSELLING' | 'QUALIFIED' | 'CONVERTED' | 'LOST' | 'ADMITTED';
export type NotificationType = 'APPOINTMENT_BOOKED' | 'ADMISSION_APPROVED' | 'CRITICAL_LAB_RESULT' | 'LOW_PHARMACY_STOCK' | 'PENDING_TASK' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  specialization?: string;
}

export interface Patient {
  id: string;
  uhid: string; // YYYY-NNNNNN
  status: PatientStatus;
  registrationType: 'Regular' | 'Temporary' | 'Unknown';
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dobCalendar: 'Gregorian' | 'Hijri';
  dob: string; // DD-MMM-YYYY
  nationality: string;
  mobileNo: string;
  emailId?: string;
  religion?: string;
  idType?: 'Aadhar' | 'Passport' | 'PAN Card' | 'Driving License';
  idNo?: string;
  bloodGroup?: 'AB Positive' | 'AB Negative' | 'A Positive' | 'A Negative' | 'B Positive' | 'B Negative' | 'O Positive' | 'O Negative';
  district: string;
  state: string;
  country: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  timeSlot: string;
  status: AppointmentStatus;
  tokenNumber: number;
  queueStatus: QueueStatus;
  consultationFee: number;
  createdAt: string;
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  recordDate: string;
  symptoms: string;
  vitalsBp?: string;
  vitalsPulse?: number;
  vitalsTempF?: number;
  vitalsSpo2?: number;
  vitalsWeightKg?: number;
  examinationFindings?: string;
  diagnoses: string[];
  treatmentPlan?: string;
  followupRecommendation?: string;
  followupDate?: string;
  prescriptions: PrescriptionItem[];
  createdAt: string;
}

export interface PrescriptionItem {
  medicineId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity?: number;
  instructions?: string;
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  bedId: string;
  bedNumber: string;
  wardName: string;
  referringDoctorId: string;
  referringDoctorName: string;
  admissionDate: string;
  dischargeDate?: string;
  status: 'ADMITTED' | 'DISCHARGED';
  reasonForAdmission: string;
  provisionalDiagnosis: string;
  dischargeSummary?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  itemType: 'CONSULTATION' | 'PHARMACY' | 'LABORATORY' | 'WARD_CHARGE' | 'PROCEDURAL' | 'OTHER';
  itemName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  admissionId?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  outstandingBalance: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  billingDate: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionReference?: string;
  insuranceProvider?: string;
  insuranceClaimNumber?: string;
  paymentDate: string;
  receivedBy: string;
}

export interface MedicineInventory {
  id: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  quantityInStock: number;
  reorderLevel: number;
  unitPrice: number;
}

export interface LabTestOrder {
  id: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  doctorId: string;
  doctorName: string;
  orderDate: string;
  status: 'ORDERED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'REPORT_APPROVED';
  billingStatus: 'PENDING' | 'PAID';
  items: LabTestItem[];
  resultValues?: any;
  notes?: string;
}

export interface LabTestItem {
  id: string;
  labTestId: string;
  testCode: string;
  testName: string;
  sampleType: string;
  resultValue?: string;
  unit?: string;
  isAbnormal: boolean;
  technicianNotes?: string;
  resultEnteredAt?: string;
  resultEnteredBy?: string;
  resultEnteredByName?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
}

export interface CrmLead {
  id: string;
  source: string;
  fullName: string;
  email: string;
  mobile: string;
  stage: LeadStage;
  campaignName?: string;
  preferredDepartment?: string;
  notes?: string;
  assignedTo?: string;
  assignedToName?: string;
  conversionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  userRole: UserRole;
  ipAddress: string;
  module: string;
  action: string;
  itemId: string;
  details: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  roleRecipient?: string;
  isRead: boolean;
  smsSent: boolean;
  emailSent: boolean;
  createdAt: string;
}
