import type {
  Company, Facility, Branch, AppUser, Patient,
  Country, State, District, Religion, Nationality, IdType, FiscalYear
} from '../types';

// ── Fiscal Year ──────────────────────────────────────────────────────────────
export const FISCAL_YEARS: FiscalYear[] = [
  { id: 'fy-1', yearLabel: '2026-2027', startDate: '2026-01-01', endDate: '2026-12-31', isCurrent: true },
];
export const CURRENT_YEAR = 2026;

// ── Countries ────────────────────────────────────────────────────────────────
export const COUNTRIES: Country[] = [
  { id: 'cn-1', name: 'India',          code: 'IN' },
  { id: 'cn-2', name: 'United Arab Emirates', code: 'AE' },
  { id: 'cn-3', name: 'United Kingdom', code: 'GB' },
  { id: 'cn-4', name: 'United States',  code: 'US' },
  { id: 'cn-5', name: 'Saudi Arabia',   code: 'SA' },
  { id: 'cn-6', name: 'Qatar',          code: 'QA' },
];

// ── States ───────────────────────────────────────────────────────────────────
export const STATES: State[] = [
  { id: 'st-1',  countryId: 'cn-1', name: 'Maharashtra' },
  { id: 'st-2',  countryId: 'cn-1', name: 'Karnataka' },
  { id: 'st-3',  countryId: 'cn-1', name: 'Tamil Nadu' },
  { id: 'st-4',  countryId: 'cn-1', name: 'Delhi' },
  { id: 'st-5',  countryId: 'cn-1', name: 'Gujarat' },
  { id: 'st-6',  countryId: 'cn-1', name: 'Telangana' },
  { id: 'st-7',  countryId: 'cn-1', name: 'Kerala' },
  { id: 'st-8',  countryId: 'cn-1', name: 'Rajasthan' },
  { id: 'st-9',  countryId: 'cn-2', name: 'Dubai' },
  { id: 'st-10', countryId: 'cn-2', name: 'Abu Dhabi' },
  { id: 'st-11', countryId: 'cn-2', name: 'Sharjah' },
];

// ── Districts ────────────────────────────────────────────────────────────────
export const DISTRICTS: District[] = [
  { id: 'dt-1',  stateId: 'st-1', name: 'Mumbai' },
  { id: 'dt-2',  stateId: 'st-1', name: 'Pune' },
  { id: 'dt-3',  stateId: 'st-1', name: 'Nagpur' },
  { id: 'dt-4',  stateId: 'st-2', name: 'Bengaluru Urban' },
  { id: 'dt-5',  stateId: 'st-2', name: 'Mysuru' },
  { id: 'dt-6',  stateId: 'st-3', name: 'Chennai' },
  { id: 'dt-7',  stateId: 'st-3', name: 'Coimbatore' },
  { id: 'dt-8',  stateId: 'st-4', name: 'New Delhi' },
  { id: 'dt-9',  stateId: 'st-5', name: 'Ahmedabad' },
  { id: 'dt-10', stateId: 'st-6', name: 'Hyderabad' },
  { id: 'dt-11', stateId: 'st-7', name: 'Thiruvananthapuram' },
  { id: 'dt-12', stateId: 'st-8', name: 'Jaipur' },
];

// ── Religions ────────────────────────────────────────────────────────────────
export const RELIGIONS: Religion[] = [
  { id: 'rl-1', name: 'Islam',        status: 'Active' },
  { id: 'rl-2', name: 'Hinduism',     status: 'Active' },
  { id: 'rl-3', name: 'Christianity', status: 'Active' },
  { id: 'rl-4', name: 'Sikhism',      status: 'Active' },
  { id: 'rl-5', name: 'Buddhism',     status: 'Active' },
  { id: 'rl-6', name: 'Jainism',      status: 'Active' },
  { id: 'rl-7', name: 'Judaism',      status: 'Active' },
  { id: 'rl-8', name: 'Other',        status: 'Active' },
];

// ── Nationalities ────────────────────────────────────────────────────────────
export const NATIONALITIES: Nationality[] = [
  { id: 'nt-1', name: 'Indian',     status: 'Active' },
  { id: 'nt-2', name: 'Emirati',    status: 'Active' },
  { id: 'nt-3', name: 'British',    status: 'Active' },
  { id: 'nt-4', name: 'American',   status: 'Active' },
  { id: 'nt-5', name: 'Saudi',      status: 'Active' },
  { id: 'nt-6', name: 'Qatari',     status: 'Active' },
  { id: 'nt-7', name: 'Pakistani',  status: 'Active' },
  { id: 'nt-8', name: 'Bangladeshi',status: 'Active' },
  { id: 'nt-9', name: 'Other',      status: 'Active' },
];

// ── ID Types ─────────────────────────────────────────────────────────────────
export const ID_TYPES: IdType[] = [
  { id: 'it-1', name: 'Aadhar Card',       status: 'Active' },
  { id: 'it-2', name: 'Passport',          status: 'Active' },
  { id: 'it-3', name: 'PAN Card',          status: 'Active' },
  { id: 'it-4', name: 'Driving License',   status: 'Active' },
  { id: 'it-5', name: 'Voter ID',          status: 'Active' },
  { id: 'it-6', name: 'National ID',       status: 'Active' },
  { id: 'it-7', name: 'Residence Permit',  status: 'Active' },
];

// ── Companies ─────────────────────────────────────────────────────────────────
export const COMPANIES: Company[] = [
  { id: 'co-1', companyCode: 'C0001', companyName: 'HealthCare Group', status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'co-2', companyCode: 'C0002', companyName: 'MediTrust Corp',   status: 'Active', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
];

// ── Facilities ────────────────────────────────────────────────────────────────
export const FACILITIES: Facility[] = [
  {
    id: 'fc-1', companyId: 'co-1', facilityCode: 'F0001', facilityName: 'City General Hospital',
    countryId: 'cn-1', stateId: 'st-1', districtId: 'dt-1', city: 'Mumbai',
    address: '1 Hospital Road, Bandra', email: 'city@hcg.com', phone: '+91-22-0001',
    gstNo: 'GST001', branchType: 'Hospital', status: 'Active',
    startDate: '2026-01-01', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'fc-2', companyId: 'co-1', facilityCode: 'F0002', facilityName: 'Westside Clinic',
    countryId: 'cn-1', stateId: 'st-2', districtId: 'dt-4', city: 'Bengaluru',
    address: '22 MG Road', email: 'westside@hcg.com', phone: '+91-80-0002',
    gstNo: 'GST002', branchType: 'Clinic', status: 'Active',
    startDate: '2026-02-01', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'fc-3', companyId: 'co-2', facilityCode: 'F0003', facilityName: 'MediTrust Delhi',
    countryId: 'cn-1', stateId: 'st-4', districtId: 'dt-8', city: 'New Delhi',
    address: '5 Connaught Place', email: 'delhi@meditrust.com', phone: '+91-11-0003',
    gstNo: 'GST003', branchType: 'Hospital', status: 'Active',
    startDate: '2026-01-10', createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-01-10T00:00:00Z'
  },
];

// ── Branches ──────────────────────────────────────────────────────────────────
export const BRANCHES: Branch[] = [
  { id: 'br-1', facilityId: 'fc-1', branchCode: 'B0001', branchName: 'OPD Wing',      status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'br-2', facilityId: 'fc-1', branchCode: 'B0002', branchName: 'IPD Wing',      status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'br-3', facilityId: 'fc-1', branchCode: 'B0003', branchName: 'Emergency',     status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'br-4', facilityId: 'fc-2', branchCode: 'B0004', branchName: 'Main Branch',   status: 'Active', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'br-5', facilityId: 'fc-3', branchCode: 'B0005', branchName: 'North Wing',    status: 'Active', createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-01-10T00:00:00Z' },
  { id: 'br-6', facilityId: 'fc-3', branchCode: 'B0006', branchName: 'South Wing',    status: 'Draft',  createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-01-10T00:00:00Z' },
];

// ── Users (Staff + Patients) ───────────────────────────────────────────────────
export const USERS: AppUser[] = [
  { id: 'usr-1', roleType: 'SUPER_ADMIN',    fullName: 'Dr. Amitabh Verma',  email: 'admin@imath1.com',               password: 'admin123',   status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'usr-2', roleType: 'COMPANY_ADMIN',  fullName: 'Priya Sharma',       email: 'ca@hcg.com',      companyId: 'co-1', password: 'ca123',  status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'usr-3', roleType: 'FACILITY_ADMIN', fullName: 'Rajan Mehta',        email: 'fa@city.com',     companyId: 'co-1', facilityId: 'fc-1', password: 'fa123',  status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'usr-4', roleType: 'BRANCH_MANAGER', fullName: 'Sunita Rao',         email: 'bm@city.com',     companyId: 'co-1', facilityId: 'fc-1', branchId: 'br-1', password: 'bm123',  status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'usr-5', roleType: 'RECEPTION',      fullName: 'John Doe',           email: 'recep@city.com',  companyId: 'co-1', facilityId: 'fc-1', branchId: 'br-1', password: 'recep123', status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'usr-6', roleType: 'DOCTOR',         fullName: 'Dr. Sarah Wilson',   email: 'doctor@city.com', companyId: 'co-1', facilityId: 'fc-1', branchId: 'br-1', password: 'doc123',  status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'usr-7', roleType: 'STAFF',          fullName: 'Anil Kapur',         email: 'staff@city.com',  companyId: 'co-1', facilityId: 'fc-1', branchId: 'br-2', password: 'staff123', status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'usr-8', roleType: 'PATIENT',        fullName: 'Rahul Sen',          email: 'patient@imath1.com', uhid: 'UHID-2026-0001', password: 'patient123', status: 'Active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
];

// ── Patients ──────────────────────────────────────────────────────────────────
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1', facilityId: 'fc-1', branchId: 'br-1',
    patientCode: 'UHID-2026-0001', firstName: 'Rahul', lastName: 'Sen', fullName: 'Rahul Sen',
    dob: '15-May-1990', dobCalendar: 'Gregorian', gender: 'Male',
    mobile: '9876543210', email: 'rahul@example.com',
    countryId: 'cn-1', stateId: 'st-1', districtId: 'dt-1',
    religionId: 'rl-2', nationalityId: 'nt-1', idTypeId: 'it-1', idNumber: '1234-5678-9012',
    bloodGroup: 'O Positive', registrationType: 'Regular', status: 'Active',
    address: '123 Park Street, Bandra', notes: '',
    createdAt: '2026-05-20T10:00:00Z', updatedAt: '2026-05-20T10:00:00Z'
  },
  {
    id: 'pat-2', facilityId: 'fc-1', branchId: 'br-1',
    patientCode: 'UHID-2026-0002', firstName: 'Harpreet', lastName: 'Kaur', fullName: 'Harpreet Kaur',
    dob: '03-Aug-1995', dobCalendar: 'Gregorian', gender: 'Female',
    mobile: '9123456780', email: 'harpreet@example.com',
    countryId: 'cn-1', stateId: 'st-2', districtId: 'dt-4',
    religionId: 'rl-4', nationalityId: 'nt-1', idTypeId: 'it-2', idNumber: 'P1234567',
    bloodGroup: 'B Positive', registrationType: 'Regular', status: 'Active',
    address: '45 MG Road', notes: '',
    createdAt: '2026-05-21T11:00:00Z', updatedAt: '2026-05-21T11:00:00Z'
  },
];

// ── Auto-Code Helpers ─────────────────────────────────────────────────────────
export function nextCompanyCode(companies: Company[]): string {
  const n = companies.length + 1;
  return 'C' + String(n).padStart(4, '0');
}
export function nextFacilityCode(facilities: Facility[]): string {
  const n = facilities.length + 1;
  return 'F' + String(n).padStart(4, '0');
}
export function nextBranchCode(branches: Branch[]): string {
  const n = branches.length + 1;
  return 'B' + String(n).padStart(4, '0');
}
export function nextPatientCode(patients: Patient[], year = CURRENT_YEAR): string {
  const yearPatients = patients.filter(p => p.patientCode.includes(String(year)));
  const n = yearPatients.length + 1;
  return `UHID-${year}-${String(n).padStart(4, '0')}`;
}
export function genId(): string {
  return Math.random().toString(36).slice(2, 11);
}
export function now(): string {
  return new Date().toISOString();
}
