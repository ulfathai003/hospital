
import { User, Patient, Appointment, ClinicalRecord, CrmLead, AuditLog, Invoice, MedicineInventory } from '../types';

export const SEED_USERS: User[] = [
  { id: 'usr-1', email: 'admin@hospital.com', fullName: 'Dr. Amitabh Verma', role: 'SUPER_ADMIN' },
  { id: 'usr-2', email: 'doctor@hospital.com', fullName: 'Dr. Sarah Wilson', role: 'DOCTOR', specialization: 'Cardiology' },
  { id: 'usr-3', email: 'reception@hospital.com', fullName: 'John Doe', role: 'RECEPTIONIST' },
  { id: 'usr-4', email: 'nurse@hospital.com', fullName: 'Jane Smith', role: 'NURSE' },
  { id: 'usr-5', email: 'lab@hospital.com', fullName: 'Anil Kapur', role: 'LAB_TECHNICIAN' },
  { id: 'usr-6', email: 'pharmacy@hospital.com', fullName: 'Raj Kumar', role: 'PHARMACIST' },
  { id: 'usr-7', email: 'crm@hospital.com', fullName: 'Vikram Bose', role: 'CRM_EXECUTIVE' },
  { id: 'usr-8', email: 'billing@hospital.com', fullName: 'Meera Iyer', role: 'BILLING_EXECUTIVE' }
];

export const SEED_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    uhid: 'UHID-20260520-0012',
    status: 'ACTIVE',
    registrationType: 'WALK_IN',
    fullName: 'Rahul Sen',
    gender: 'Male',
    dob: '1990-05-15',
    nationality: 'Indian',
    mobile: '9876543210',
    email: 'rahul.sen@example.com',
    state: 'Maharashtra',
    country: 'India',
    address: '123 Park Street, Mumbai',
    createdAt: '2026-05-20T10:00:00Z',
    updatedAt: '2026-05-20T10:00:00Z'
  }
];

export const SEED_WARDS = [
  { id: 'ward-1', name: 'General Ward A', totalBeds: 20, availableBedsCount: 15 },
  { id: 'ward-2', name: 'ICU', totalBeds: 5, availableBedsCount: 2 },
  { id: 'ward-3', name: 'Maternity Ward', totalBeds: 10, availableBedsCount: 8 }
];

export const SEED_BEDS = [
  { id: 'bed-1', wardId: 'ward-1', bedNumber: 'A-101', status: 'AVAILABLE' },
  { id: 'bed-2', wardId: 'ward-1', bedNumber: 'A-102', status: 'OCCUPIED' },
  { id: 'bed-3', wardId: 'ward-2', bedNumber: 'ICU-01', status: 'AVAILABLE' }
];

export const SEED_APPOINTMENTS: Appointment[] = [];
export const SEED_LAB_TESTS = [
  { id: 'test-1', testCode: 'CBC', testName: 'Complete Blood Count', standardCost: 500 },
  { id: 'test-2', testCode: 'LFT', testName: 'Liver Function Test', standardCost: 800 },
  { id: 'test-3', testCode: 'KFT', testName: 'Kidney Function Test', standardCost: 750 }
];
export const SEED_LAB_ORDERS = [];
export const SEED_CLINICAL_RECORDS: ClinicalRecord[] = [];
export const SEED_LEADS: CrmLead[] = [
  {
    id: 'ld-1',
    source: 'Website',
    fullName: 'Harpreet Singh',
    email: 'harpreet@example.com',
    mobile: '9988776655',
    stage: 'NEW',
    createdAt: '2026-05-31T09:00:00Z',
    updatedAt: '2026-05-31T09:00:00Z'
  }
];
export const SEED_INVOICES: Invoice[] = [];
export const SEED_AUDIT_LOGS: AuditLog[] = [];
export const SEED_VENDORS = [
  { id: 'v-1', name: 'Alkem Laboratories', contact: 'Sales Div' },
  { id: 'v-2', name: 'Sun Pharma', contact: 'Medical Supplies' }
];
export const SEED_MEDICINES = [
  { id: 'm-1', name: 'Paracetamol 500mg', type: 'Tablet' },
  { id: 'm-2', name: 'Amoxicillin 250mg', type: 'Capsule' }
];
export const SEED_INVENTORY: MedicineInventory[] = [
  {
    id: 'inv-1',
    medicineName: 'Paracetamol 500mg',
    batchNumber: 'PM-109',
    expiryDate: '2027-12-31',
    quantityInStock: 8,
    reorderLevel: 20,
    unitPrice: 18.50
  }
];
