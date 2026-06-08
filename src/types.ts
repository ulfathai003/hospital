// ─── iMAT.H1 — Master Type Definitions ─────────────────────────────────────
// Source of truth: iMAT_H1_System_Architecture.md

// ── Enums & Unions ──────────────────────────────────────────────────────────
export type RecordStatus = 'Active' | 'Inactive' | 'Draft' | 'Archived';
export type RoleType =
  | 'SUPER_ADMIN'
  | 'COMPANY_ADMIN'
  | 'FACILITY_ADMIN'
  | 'BRANCH_MANAGER'
  | 'STAFF'
  | 'RECEPTION'
  | 'DOCTOR'
  | 'PATIENT';

export type Gender = 'Male' | 'Female' | 'Other';
export type DobCalendar = 'Gregorian' | 'Hijri';
export type BloodGroup =
  | 'AB Positive' | 'AB Negative'
  | 'A Positive'  | 'A Negative'
  | 'B Positive'  | 'B Negative'
  | 'O Positive'  | 'O Negative';
export type RegistrationType = 'Regular' | 'Temporary' | 'Unknown';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';

// ── Hierarchy Master ─────────────────────────────────────────────────────────
export interface Company {
  id: string;
  companyCode: string;   // Auto: C0001
  companyName: string;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  companyId: string;
  facilityCode: string;  // Auto: F0001
  facilityName: string;
  countryId: string;
  stateId: string;
  districtId: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  gstNo: string;
  branchType: string;
  status: RecordStatus;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  facilityId: string;
  branchCode: string;    // Auto: B0001
  branchName: string;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Master Data ──────────────────────────────────────────────────────────────
export interface Country    { id: string; name: string; code: string; }
export interface State      { id: string; countryId: string; name: string; }
export interface District   { id: string; stateId: string; name: string; }
export interface Religion   { id: string; name: string; status: RecordStatus; }
export interface Nationality { id: string; name: string; status: RecordStatus; }
export interface IdType     { id: string; name: string; status: RecordStatus; }

// ── User / Staff ─────────────────────────────────────────────────────────────
export interface AppUser {
  id: string;
  companyId?: string;
  facilityId?: string;
  branchId?: string;
  roleType: RoleType;
  fullName: string;
  email: string;
  password: string;
  uhid?: string;          // Only for PATIENT
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  roleType: RoleType;
  companyId?: string;
  facilityId?: string;
  branchId?: string;
  uhid?: string;
}

// ── Patient ──────────────────────────────────────────────────────────────────
export interface Patient {
  id: string;
  facilityId: string;
  branchId: string;
  patientCode: string;   // Auto: UHID-YYYY-0001
  firstName: string;
  lastName: string;
  fullName: string;      // Computed: firstName + lastName
  dob: string;
  dobCalendar: DobCalendar;
  gender: Gender;
  mobile: string;
  email?: string;
  countryId: string;
  stateId: string;
  districtId: string;
  religionId?: string;
  nationalityId?: string;
  idTypeId?: string;
  idNumber?: string;
  bloodGroup?: BloodGroup;
  registrationType: RegistrationType;
  status: RecordStatus;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Fiscal Year ──────────────────────────────────────────────────────────────
export interface FiscalYear {
  id: string;
  yearLabel: string;   // e.g. "2026-2027"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

// ── Audit Log ────────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  tableName: string;
  recordId: string;
  action: AuditAction;
  oldValue?: any;
  newValue?: any;
  createdAt: string;
}

// ── UI Helpers ────────────────────────────────────────────────────────────────
export interface SelectOption { value: string; label: string; }
export interface TreeNode<T> { data: T; children?: TreeNode<any>[]; }
