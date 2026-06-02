/**
 * Enterprise Hospital Management System (HMS) & CRM Server
 * Custom Express TypeScript implementation on Port 3000
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Types and Initial Baseline Seeds
import {
  SEED_USERS,
  SEED_PATIENTS,
  SEED_WARDS,
  SEED_BEDS,
  SEED_APPOINTMENTS,
  SEED_LAB_TESTS,
  SEED_LAB_ORDERS,
  SEED_CLINICAL_RECORDS,
  SEED_LEADS,
  SEED_INVOICES,
  SEED_AUDIT_LOGS,
  SEED_VENDORS,
  SEED_MEDICINES,
  SEED_INVENTORY
} from './src/data/seedData';
import { User, Patient, Appointment, ClinicalRecord, Admission, Invoice, Payment, MedicineInventory, LabTestOrder, CrmLead, AuditLog, QueueStatus, AppointmentStatus, LeadStage, PatientStatus, AppNotification, NotificationType, UserRole } from './src/types';

// State File Location
const DB_FILE = path.join(process.cwd(), 'database', 'db.json');

// Memory Data State Wrapper
interface DatabaseState {
  users: User[];
  patients: Patient[];
  wards: any[];
  beds: any[];
  appointments: Appointment[];
  clinicalRecords: ClinicalRecord[];
  admissions: Admission[];
  invoices: Invoice[];
  payments: Payment[];
  medicines: any[];
  inventory: MedicineInventory[];
  vendors: any[];
  labTests: any[];
  labOrders: LabTestOrder[];
  crmLeads: CrmLead[];
  crmActivities: any[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
}


let state: DatabaseState = {
  users: SEED_USERS,
  patients: SEED_PATIENTS,
  wards: SEED_WARDS,
  beds: SEED_BEDS,
  appointments: SEED_APPOINTMENTS,
  clinicalRecords: SEED_CLINICAL_RECORDS,
  admissions: [], // starts empty or filled on load
  invoices: SEED_INVOICES,
  payments: [],
  medicines: SEED_MEDICINES,
  inventory: SEED_INVENTORY,
  vendors: SEED_VENDORS,
  labTests: SEED_LAB_TESTS,
  labOrders: SEED_LAB_ORDERS,
  crmLeads: SEED_LEADS,
  crmActivities: [
    {
      id: 'act-1',
      leadId: 'ld-4',
      activityType: 'CALL',
      summary: 'Follow-up on Maternity tour',
      notes: 'Harpreet confirmed appointment scheduled.',
      followupNeeded: false,
      loggedBy: 'usr-9',
      loggedByName: 'Vikram Bose',
      createdAt: '2026-05-31T11:00:00Z'
    }
  ],
  auditLogs: SEED_AUDIT_LOGS,
  notifications: [
    {
      id: "notif-1",
      type: "LOW_PHARMACY_STOCK",
      title: "Critical Low Stock Alert",
      message: "Paracetamol 500mg (Batch PM-109) has fallen below minimum reorder levels (8 units remaining).",
      roleRecipient: "PHARMACIST",
      isRead: false,
      smsSent: true,
      emailSent: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "notif-2",
      type: "APPOINTMENT_BOOKED",
      title: "New OPD Booking",
      message: "Patient Rahul Sen has booked an appointment with Dr. Amitabh Verma for today at 10:00 AM.",
      roleRecipient: "RECEPTIONIST",
      isRead: false,
      smsSent: false,
      emailSent: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "notif-3",
      type: "CRITICAL_LAB_RESULT",
      title: "Critical Lab Value Reported",
      message: "Patient Hemoglobin count is extremely low (5.2 g/dL) for UHID-2026-05-20-0012.",
      roleRecipient: "DOCTOR",
      isRead: false,
      smsSent: true,
      emailSent: true,
      createdAt: new Date().toISOString()
    }
  ]
};

import Redis from 'ioredis';

// Active Server-Sent Events (SSE) Client Connections
interface SseClient {
  res: any;
  role: string;
}
const activeClients: SseClient[] = [];

// Redis Optional/Lazy initialization to avoid crashing on startup if Redis is offline
let redisPub: any = null;
let redisSub: any = null;

try {
  const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  console.log(`[Redis] Attending connection on ${REDIS_URL}`);
  
  redisPub = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    enableOfflineQueue: false
  });
  redisSub = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    enableOfflineQueue: false
  });

  redisPub.on('error', (err: any) => {
    console.warn('[Redis pub] offline or connection issue:', err.message);
  });
  redisSub.on('error', (err: any) => {
    console.warn('[Redis sub] offline or connection issue:', err.message);
  });

  redisSub.subscribe('hms-notifications', (err: any) => {
    if (!err) {
      console.log('[Redis] Subscribed to channel hms-notifications');
    }
  });

  redisSub.on('message', (channel: string, message: string) => {
    if (channel === 'hms-notifications') {
      try {
        const notif = JSON.parse(message);
        localBroadcast(notif, false);
      } catch (err) {
        // ignore
      }
    }
  });
} catch (e: any) {
  console.warn('[Redis] Not connected:', e.message);
}

// Local SSE and Log broadcast helper
function localBroadcast(notif: any, publishToRedis: boolean = true) {
  activeClients.forEach(client => {
    const roleMatch = !notif.roleRecipient || 
                      notif.roleRecipient === 'ALL' || 
                      client.role === notif.roleRecipient || 
                      client.role === 'SUPER_ADMIN' || 
                      client.role === 'ADMIN';
    if (roleMatch) {
      try {
        client.res.write(`data: ${JSON.stringify(notif)}\n\n`);
      } catch (e) {
        // clean up closed socket connections
      }
    }
  });

  if (publishToRedis && redisPub) {
    redisPub.publish('hms-notifications', JSON.stringify(notif)).catch((err: any) => {
      console.warn('[Redis pub publish failed]', err.message);
    });
  }
}

// Function to generate new system/operational notification
function createNotification(
  type: 'APPOINTMENT_BOOKED' | 'ADMISSION_APPROVED' | 'CRITICAL_LAB_RESULT' | 'LOW_PHARMACY_STOCK' | 'PENDING_TASK' | 'SYSTEM',
  title: string,
  message: string,
  roleRecipient?: string
) {
  const smsSent = true; 
  const emailSent = true;

  const newNotif: any = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    message,
    roleRecipient: roleRecipient || 'ALL',
    isRead: false,
    smsSent,
    emailSent,
    createdAt: new Date().toISOString()
  };

  if (!state.notifications) {
    state.notifications = [];
  }
  state.notifications.unshift(newNotif);
  
  if (state.notifications.length > 100) {
    state.notifications = state.notifications.slice(0, 100);
  }

  saveDatabase();
  localBroadcast(newNotif, true);

  console.log(`[Notification System] Created: ${title} (${type})`);
  return newNotif;
}


// Utility: Load database from JSON
function loadDatabase() {
  try {
    const parentDir = path.dirname(DB_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed };
      console.log('Database loaded successfully with', state.patients.length, 'patients.');
    } else {
      saveDatabase();
      console.log('Database file created from baseline seed data.');
    }
  } catch (err) {
    console.error('Failed to load database. Defaulting to in-memory.', err);
  }
}

// Utility: Save database to JSON
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist database to file:', err);
  }
}

// Helper: Push Audit Log
function logAudit(email: string, role: any, module: string, action: string, itemId: string, details: string, req: Request) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userEmail: email || 'system@hospital.com',
    userRole: role || 'SUPER_ADMIN',
    ipAddress: req.ip || '127.0.0.1',
    module: module as any,
    action: action as any,
    itemId,
    details,
    createdAt: new Date().toISOString()
  };
  state.auditLogs.unshift(newLog);
  saveDatabase();
}

async function run() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Load baseline persistence
  loadDatabase();

  // 1. HEALTHCHECK
  app.get('/api/healthxx', (req: Request, res: Response) => {
    res.json({ live: true, timestamp: new Date().toISOString() });
  });

  // 2. RETRIEVE GLOBAL DATA STATE
  app.get('/api/state', (req: Request, res: Response) => {
    res.json(state);
  });

  // 3. AUTH LOGINS
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email } = req.body;
    const foundUser = state.users.find(u => u.email.toLowerCase() === email?.toLowerCase());
    
    if (foundUser) {
      logAudit(foundUser.email, foundUser.role, 'AUTH', 'LOGIN', foundUser.id, `Successfully verified user credentials for ${foundUser.fullName}.`, req);
      res.json({
        success: true,
        user: foundUser,
        token: `simulated-jwt-token-for-${foundUser.role.toLowerCase()}`
      });
    } else {
      res.status(401).json({ success: false, error: 'User account not found with this email configuration.' });
    }
  });

  // 4. PATIENT REGISTRATION & MODIFICATIONS
  app.post('/api/patients', (req: Request, res: Response) => {
    const {
      registrationType,
      fullName,
      gender,
      dob,
      nationality,
      mobile,
      email,
      religion,
      idType,
      idNumber,
      bloodGroup,
      district,
      state: patientState,
      country,
      address,
      allergySummary,
      chronicIllness,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactMobile,
      actorEmail,
      actorRole
    } = req.body;

    // Mobile uniqueness check (Duplicate Detection requirement)
    const existingPatient = state.patients.find(
      p => p.mobile === mobile && p.status === 'ACTIVE'
    );
    if (existingPatient) {
       res.status(409).json({
        success: false,
        error: `Duplicate detection! A patient named '${existingPatient.fullName}' with mobile ${mobile} is already registered under UHID ${existingPatient.uhid}.`
      });
       return;
    }

    // Birthdate Validation: No Future DOB
    if (new Date(dob) > new Date()) {
       res.status(400).json({ success: false, error: 'Age validation failure! Date of birth cannot be in the future.' });
       return;
    }

    // Auto-generate UHID: UHID-YYYYMMDD-XXXX (4-digit random or sequence)
    const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(state.patients.length + 1).padStart(4, '0');
    const uhid = `UHID-${ymd}-${seq}`;

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      uhid,
      status: 'ACTIVE',
      registrationType: registrationType || 'WALK_IN',
      fullName,
      gender,
      dob,
      nationality: nationality || 'Indian',
      mobile,
      email,
      religion,
      idType,
      idNumber,
      bloodGroup,
      district,
      state: patientState || 'Maharashtra',
      country: country || 'India',
      address,
      allergySummary,
      chronicIllness,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactMobile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.patients.push(newPatient);
    saveDatabase();

    logAudit(actorEmail, actorRole, 'PATIENT', 'CREATE', newPatient.id, `Created new patient account '${fullName}' under generated UHID '${uhid}'.`, req);
    res.status(201).json({ success: true, patient: newPatient });
  });

  // Edit Patient
  app.put('/api/patients/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { actorEmail, actorRole, ...updates } = req.body;

    const patientIndex = state.patients.findIndex(p => p.id === id);
    if (patientIndex === -1) {
       res.status(404).json({ success: false, error: 'Patient records not found.' });
       return;
    }

    const updatedPatient = {
      ...state.patients[patientIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    state.patients[patientIndex] = updatedPatient;
    saveDatabase();

    logAudit(actorEmail, actorRole, 'PATIENT', 'UPDATE', id, `Updated demographic profiles of patient '${updatedPatient.fullName}'.`, req);
    res.json({ success: true, patient: updatedPatient });
  });

  // Soft Delete Patient
  app.delete('/api/patients/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { actorEmail, actorRole } = req.body;

    const patientIndex = state.patients.findIndex(p => p.id === id);
    if (patientIndex === -1) {
       res.status(404).json({ success: false, error: 'Patient not found' });
       return;
    }

    state.patients[patientIndex].status = 'INACTIVE' as PatientStatus;
    saveDatabase();

    logAudit(actorEmail, actorRole, 'PATIENT', 'DELETE', id, `Soft deleted patient '${state.patients[patientIndex].fullName}' (Status flagged INACTIVE).`, req);
    res.json({ success: true, message: 'Patient soft-deleted successfully.' });
  });

  // 5. APPOINTMENTS SCHEDULING & WALK-INS
  app.post('/api/appointments', (req: Request, res: Response) => {
    const { patientId, doctorId, appointmentDate, timeSlot, consultationFee, actorEmail, actorRole } = req.body;

    const patient = state.patients.find(p => p.id === patientId);
    if (!patient) {
       res.status(404).json({ success: false, error: 'Patient record not found.' });
       return;
    }

    const doctor = state.users.find(u => u.id === doctorId);
    const doctorName = doctor ? doctor.fullName : 'Dr. General Duty';

    // Queue token generation for the doctor on that day
    const doctorDailyAppts = state.appointments.filter(
      a => a.doctorId === doctorId && a.appointmentDate === appointmentDate
    );
    const tokenNumber = doctorDailyAppts.length + 1;

    const newAppt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId,
      patientName: patient.fullName,
      patientUhid: patient.uhid,
      doctorId,
      doctorName,
      appointmentDate,
      timeSlot,
      status: 'SCHEDULED',
      tokenNumber,
      queueStatus: 'PENDING',
      consultationFee: consultationFee || 500,
      createdAt: new Date().toISOString()
    };

    state.appointments.push(newAppt);
    saveDatabase();

    // Fire real-time notification
    createNotification(
      'APPOINTMENT_BOOKED',
      'New Appointment Scheduled',
      `Patient ${patient.fullName} has scheduled an appointment with ${doctorName} for ${appointmentDate} at ${timeSlot}. (Token Priority: #${tokenNumber})`,
      'RECEPTIONIST'
    );

    logAudit(actorEmail, actorRole, 'APPOINTMENT', 'CREATE', newAppt.id, `Booked appointment for ${patient.fullName} with ${doctorName} (Token #${tokenNumber}).`, req);

    res.status(201).json({ success: true, appointment: newAppt });
  });

  // Appointment Queue Check-In Flow
  app.post('/api/appointments/:id/checkin', (req: Request, res: Response) => {
    const { id } = req.params;
    const { actorEmail, actorRole } = req.body;

    const appt = state.appointments.find(a => a.id === id);
    if (!appt) {
       res.status(404).json({ success: false, error: 'Appointment not found' });
       return;
    }

    appt.status = 'CHECKED_IN';
    appt.queueStatus = 'ACTIVE';
    saveDatabase();

    logAudit(actorEmail, actorRole, 'APPOINTMENT', 'UPDATE', id, `Checked-in patient ${appt.patientName} for consultation. Queue status updated to ACTIVE.`, req);
    res.json({ success: true, appointment: appt });
  });

  // Update Queue status directly
  app.post('/api/appointments/:id/queue', (req: Request, res: Response) => {
    const { id } = req.params;
    const { queueStatus, status, actorEmail, actorRole } = req.body;

    const appt = state.appointments.find(a => a.id === id);
    if (!appt) {
       res.status(404).json({ success: false, error: 'Appointment not found' });
       return;
    }

    if (queueStatus) appt.queueStatus = queueStatus as QueueStatus;
    if (status) appt.status = status as AppointmentStatus;
    saveDatabase();

    logAudit(actorEmail, actorRole, 'APPOINTMENT', 'UPDATE', id, `Updated queue status to ${appt.queueStatus} and appointment status to ${appt.status}.`, req);
    res.json({ success: true, appointment: appt });
  });

  // 6. EMR - WRITE CLINICAL NOTE & AUTO PRESCRIPTION / LAB ORDER
  app.post('/api/emr', (req: Request, res: Response) => {
    const {
      patientId,
      doctorId,
      appointmentId,
      symptoms,
      vitalsBp,
      vitalsPulse,
      vitalsTempF,
      vitalsSpo2,
      vitalsWeightKg,
      examinationFindings,
      diagnoses,
      treatmentPlan,
      followupRecommendation,
      followupDate,
      prescriptions,
      labTestsOrdered, // Array of test IDs ordered during consultation
      actorEmail,
      actorRole
    } = req.body;

    const recordId = `rec-${Date.now()}`;
    const doctor = state.users.find(u => u.id === doctorId);
    const doctorName = doctor ? doctor.fullName : 'Dr. General Duty';

    // 1. Create clinical note
    const newRecord: ClinicalRecord = {
      id: recordId,
      patientId,
      doctorId,
      doctorName,
      appointmentId,
      recordDate: new Date().toISOString(),
      symptoms,
      vitalsBp,
      vitalsPulse: Number(vitalsPulse) || 72,
      vitalsTempF: Number(vitalsTempF) || 98.6,
      vitalsSpo2: Number(vitalsSpo2) || 99,
      vitalsWeightKg: Number(vitalsWeightKg) || 70,
      examinationFindings,
      diagnoses: diagnoses || [],
      treatmentPlan,
      followupRecommendation,
      followupDate,
      prescriptions: prescriptions || [],
      createdAt: new Date().toISOString()
    };

    state.clinicalRecords.push(newRecord);

    const patient = state.patients.find(p => p.id === patientId);

    // 2. If appointment exists, mark as COMPLETED and queueStatus DONE
    if (appointmentId) {
      const appt = state.appointments.find(a => a.id === appointmentId);
      if (appt) {
        appt.status = 'COMPLETED';
        appt.queueStatus = 'DONE';
      }
    }

    // 3. Create Lab test orders if doctors scheduled any
    let generatedLabOrderId = '';
    if (labTestsOrdered && labTestsOrdered.length > 0) {
      const labOrderId = `lbo-${Date.now()}`;
      generatedLabOrderId = labOrderId;
      
      const orderItems = labTestsOrdered.map((tid: string) => {
        const testTemplate = state.labTests.find(t => t.id === tid);
        return {
          id: `lbo-i-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          labTestId: tid,
          testCode: testTemplate ? testTemplate.testCode : 'LAB',
          testName: testTemplate ? testTemplate.testName : 'Custom Diagnostic',
          sampleType: 'BLOOD',
          isAbnormal: false
        };
      });

      const newLabOrder: LabTestOrder = {
        id: labOrderId,
        patientId,
        patientName: patient ? patient.fullName : 'Walk-In Patient',
        patientUhid: patient ? patient.uhid : 'N/A',
        doctorId,
        doctorName,
        orderDate: new Date().toISOString(),
        status: 'ORDERED',
        billingStatus: 'PENDING',
        items: orderItems
      };
      state.labOrders.push(newLabOrder);
    }

    // 4. Register a walk-in invoice for Consultation and Pharmacy if required
    const invId = `inv-${Date.now()}`;
    const seq = String(state.invoices.length + 1).padStart(4, '0');
    const invoiceNumber = `INV-2026-${seq}`;

    // Compute Consultation billing item
    const invoiceItems = [];
    let subtotal = 0;

    // Add Consultation Cost
    const finalFee = appointmentId ? (state.appointments.find(a => a.id === appointmentId)?.consultationFee || 500) : 500;
    invoiceItems.push({
      id: `inv-i-${Date.now()}-1`,
      itemType: 'CONSULTATION' as any,
      itemName: `Specialist Consultation - ${doctorName}`,
      unitPrice: finalFee,
      quantity: 1,
      totalPrice: finalFee
    });
    subtotal += finalFee;

    // If pharmacy prescriptions are allocated, calculate simulated invoice pricing
    if (prescriptions && prescriptions.length > 0) {
      prescriptions.forEach((item: any, idx: number) => {
        // Guess a standard medicine retail price or simulated 15rs per pill
        const medicinePrice = 18.50;
        const totalMedCost = medicinePrice * Number(item.quantity || 10);
        invoiceItems.push({
          id: `inv-i-${Date.now()}-med-${idx}`,
          itemType: 'PHARMACY' as any,
          itemName: `Rx: ${item.medicineName} (${item.dosage})`,
          unitPrice: medicinePrice,
          quantity: Number(item.quantity) || 10,
          totalPrice: totalMedCost
        });
        subtotal += totalMedCost;
      });
    }

    // If lab tests were ordered, compile standard cost entries
    if (labTestsOrdered && labTestsOrdered.length > 0) {
      labTestsOrdered.forEach((tid: string, idx: number) => {
        const testTemplate = state.labTests.find(t => t.id === tid);
        const cost = testTemplate ? Number(testTemplate.standardCost) : 300;
        invoiceItems.push({
          id: `inv-i-${Date.now()}-lab-${idx}`,
          itemType: 'LABORATORY' as any,
          itemName: `Lab Order: ${testTemplate ? testTemplate.testName : 'Custom Diagnostic'}`,
          unitPrice: cost,
          quantity: 1,
          totalPrice: cost
        });
        subtotal += cost;
      });
    }

    const tax = Math.round(subtotal * 0.06); // 6% Central/State health cess simulated
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: invId,
      invoiceNumber,
      patientId,
      patientName: patient ? patient.fullName : 'Walk-In',
      patientUhid: patient ? patient.uhid : 'N/A',
      subtotal,
      tax,
      discount: 0,
      total,
      paidAmount: 0,
      outstandingBalance: total,
      status: 'UNPAID',
      billingDate: new Date().toISOString().slice(0, 10),
      items: invoiceItems,
      createdAt: new Date().toISOString()
    };

    state.invoices.push(newInvoice);

    saveDatabase();

    logAudit(actorEmail, actorRole, 'EMR', 'CREATE', recordId, `Successfully written pediatric/clinical EMR note for ${patient?.fullName}. Invoiced under ${invoiceNumber}.`, req);
    res.status(201).json({ success: true, record: newRecord, invoice: newInvoice, labOrderId: generatedLabOrderId });
  });

  // 7. ADMISSIONS & BED MANAGEMENT
  app.post('/api/admissions', (req: Request, res: Response) => {
    const { patientId, bedId, referringDoctorId, reasonForAdmission, provisionalDiagnosis, actorEmail, actorRole } = req.body;

    const patient = state.patients.find(p => p.id === patientId);
    if (!patient) {
       res.status(404).json({ success: false, error: 'Patient not registered.' });
       return;
    }

    const bed = state.beds.find(b => b.id === bedId);
    if (!bed || bed.status !== 'AVAILABLE') {
       res.status(400).json({ success: false, error: 'Requested ward bed is unavailable or occupied.' });
       return;
    }

    const doctor = state.users.find(u => u.id === referringDoctorId);
    const doctorName = doctor ? doctor.fullName : 'Duty Doctor';

    const ward = state.wards.find(w => w.id === bed.wardId);
    const wardName = ward ? ward.name : 'Emergency Unit';

    const newAdmission: Admission = {
      id: `adm-${Date.now()}`,
      patientId,
      patientName: patient.fullName,
      patientUhid: patient.uhid,
      bedId,
      bedNumber: bed.bedNumber,
      wardName,
      referringDoctorId,
      referringDoctorName: doctorName,
      admissionDate: new Date().toISOString(),
      status: 'ADMITTED',
      reasonForAdmission,
      provisionalDiagnosis,
      createdAt: new Date().toISOString()
    };

    // Lock Bed Status
    bed.status = 'OCCUPIED';
    if (ward) ward.availableBedsCount = Math.max(0, ward.availableBedsCount - 1);

    state.admissions.push(newAdmission);
    saveDatabase();

    // Trigger ADMISSION_APPROVED real-time notification
    createNotification(
      'ADMISSION_APPROVED',
      'Inpatient Bed Admission Approved',
      `Patient ${patient.fullName} has been successfully admitted to Bed ${bed.bedNumber} inside Ward '${wardName}'.`,
      'NURSE'
    );

    logAudit(actorEmail, actorRole, 'ADMISSION', 'CREATE', newAdmission.id, `Admitted patient ${patient.fullName} to Bed ${bed.bedNumber} (${wardName}).`, req);
    res.status(201).json({ success: true, admission: newAdmission });
  });

  // Discharge Patient & Unlock Bed
  app.post('/api/admissions/:id/discharge', (req: Request, res: Response) => {
    const { id } = req.params;
    const { dischargeSummary, actorEmail, actorRole } = req.body;

    const admission = state.admissions.find(a => a.id === id);
    if (!admission || admission.status !== 'ADMITTED') {
       res.status(404).json({ success: false, error: 'Active admission not found' });
       return;
    }

    // Release Bed
    const bed = state.beds.find(b => b.id === admission.bedId);
    if (bed) {
      bed.status = 'AVAILABLE';
      const ward = state.wards.find(w => w.id === bed.wardId);
      if (ward) ward.availableBedsCount = Math.min(ward.totalBeds, ward.availableBedsCount + 1);
    }

    admission.status = 'DISCHARGED';
    admission.dischargeDate = new Date().toISOString();
    admission.dischargeSummary = dischargeSummary;

    // Compile Admission Bed Charges Invoice
    const patientIndex = state.patients.findIndex(p => p.id === admission.patientId);
    const patient = state.patients[patientIndex];

    const wardChargeRate = 2200; // General default ward rate
    const totalDays = Math.max(1, Math.ceil((Date.now() - new Date(admission.admissionDate).getTime()) / (1000 * 60 * 60 * 24)));
    const wardTotal = wardChargeRate * totalDays;

    const invId = `inv-${Date.now()}`;
    const seq = String(state.invoices.length + 1).padStart(4, '0');
    const invoiceNumber = `INV-2026-${seq}`;

    const invoiceItems = [
      {
        id: `inv-i-${Date.now()}-adm`,
        itemType: 'WARD_CHARGE' as any,
        itemName: `Inpatient Ward Room Charges (${totalDays} Days) - Bed: ${admission.bedNumber}`,
        unitPrice: wardChargeRate,
        quantity: totalDays,
        totalPrice: wardTotal
      },
      {
        id: `inv-i-${Date.now()}-proc`,
        itemType: 'PROCEDURAL' as any,
        itemName: 'Operational / Nursing Supervision charges',
        unitPrice: 1500,
        quantity: 1,
        totalPrice: 1500
      }
    ];

    const subtotal = wardTotal + 1500;
    const tax = Math.round(subtotal * 0.08); // 8% Service VAT/Tax
    const total = subtotal + tax;

    const admissionInvoice: Invoice = {
      id: invId,
      invoiceNumber,
      patientId: admission.patientId,
      patientName: admission.patientName,
      patientUhid: admission.patientUhid,
      admissionId: admission.id,
      subtotal,
      tax,
      discount: 0,
      total,
      paidAmount: 0,
      outstandingBalance: total,
      status: 'UNPAID',
      billingDate: new Date().toISOString().slice(0, 10),
      items: invoiceItems,
      createdAt: new Date().toISOString()
    };

    state.invoices.push(admissionInvoice);
    saveDatabase();

    // Trigger notification
    createNotification(
      'SYSTEM',
      'Patient Inpatient Discharged',
      `Patient ${admission.patientName} has been discharged. Invoice ${invoiceNumber} totaling ${total} INR has been registered under outstanding balances.`,
      'BILLING_EXECUTIVE'
    );

    logAudit(actorEmail, actorRole, 'ADMISSION', 'APPROVE', id, `Logged patient ${admission.patientName} discharge. Triggered invoice ${invoiceNumber} for ${total} INR.`, req);
    res.json({ success: true, admission, invoice: admissionInvoice });
  });

  // 8. BILLING INVOICES & PAYMENTS PROCESSING
  app.post('/api/billing/payments', (req: Request, res: Response) => {
    const { invoiceId, amount, paymentMethod, transactionReference, insuranceProvider, insuranceClaimNumber, actorEmail, actorRole } = req.body;

    const invoice = state.invoices.find(i => i.id === invoiceId);
    if (!invoice) {
       res.status(404).json({ success: false, error: 'Invoice not found.' });
       return;
    }

    const paymentAmount = Number(amount);
    const newPaidAmount = Number(invoice.paidAmount) + paymentAmount;
    const newBalance = Math.max(0, Number(invoice.total) - newPaidAmount);

    invoice.paidAmount = newPaidAmount;
    invoice.outstandingBalance = newBalance;
    invoice.status = newBalance <= 1 ? 'PAID' : 'PARTIALLY_PAID';

    const paymentId = `pay-${Date.now()}`;
    const newPayment: Payment = {
      id: paymentId,
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      amount: paymentAmount,
      paymentMethod,
      paymentStatus: 'SUCCESS',
      transactionReference,
      insuranceProvider,
      insuranceClaimNumber,
      paymentDate: new Date().toISOString(),
      receivedBy: 'usr-8' // Default Billing Exec
    };

    state.payments.unshift(newPayment);
    saveDatabase();

    logAudit(actorEmail, actorRole, 'BILLING', 'CREATE', paymentId, `Processed payment of ${paymentAmount} INR on ${invoice.invoiceNumber}. Bal: ${newBalance} (Method: ${paymentMethod}).`, req);
    res.status(201).json({ success: true, invoice, payment: newPayment });
  });

  // 9. PHARMACY STOCK TRACKER & DISPENSING
  app.post('/api/pharmacy/dispense', (req: Request, res: Response) => {
    const { batchId, quantityDispensed, actorEmail, actorRole } = req.body;

    const inventoryItem = state.inventory.find(inv => inv.id === batchId);
    if (!inventoryItem) {
       res.status(404).json({ success: false, error: 'Batch inventory not found.' });
       return;
    }

    const qty = Number(quantityDispensed);
    if (inventoryItem.quantityInStock < qty) {
       res.status(400).json({ success: false, error: `Insufficient pharmacy inventory! Only ${inventoryItem.quantityInStock} units remaining.` });
       return;
    }

    inventoryItem.quantityInStock -= qty;
    saveDatabase();

    // Check if stock is low & dispatch notification
    if (inventoryItem.quantityInStock <= inventoryItem.reorderLevel) {
      createNotification(
        'LOW_PHARMACY_STOCK',
        'Critical Low Pharmacy Stock Alert',
        `Drug stock warning: '${inventoryItem.medicineName}' (Batch ${inventoryItem.batchNumber}) has run down to ${inventoryItem.quantityInStock} units left (reorder trigger level: ${inventoryItem.reorderLevel}).`,
        'PHARMACIST'
      );
    }

    logAudit(actorEmail, actorRole, 'PHARMACY', 'UPDATE', batchId, `Dispensed ${qty} units of batch ${inventoryItem.batchNumber}. Stock balance: ${inventoryItem.quantityInStock}.`, req);
    res.json({ success: true, item: inventoryItem });
  });

  // 10. LAB DIAGNOSTIC ENTRIES & APPROVALS
  // Collect Lab Sample Checkpoint
  app.post('/api/lab/collect/:orderId', (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { actorEmail, actorRole } = req.body;

    const order = state.labOrders.find(o => o.id === orderId);
    if (!order) {
      res.status(404).json({ success: false, error: 'Lab order not found' });
      return;
    }

    order.status = 'SAMPLE_COLLECTED';
    saveDatabase();

    logAudit(actorEmail || 'lab_tech@hospital.com', actorRole || 'LAB_TECHNICIAN', 'LAB', 'UPDATE', orderId, `Collected bio-samples for Lab Order #${orderId}.`, req);
    res.json({ success: true, order });
  });

  // Order-Level Result Entry
  app.put('/api/lab/results/order/:orderId', (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { resultValues, notes, actorEmail, actorRole } = req.body;

    const order = state.labOrders.find(o => o.id === orderId);
    if (!order) {
      res.status(404).json({ success: false, error: 'Lab order not found' });
      return;
    }

    order.resultValues = resultValues;
    order.notes = notes;
    order.status = 'COMPLETED';
    saveDatabase();

    logAudit(actorEmail || 'lab_tech@hospital.com', actorRole || 'LAB_TECHNICIAN', 'LAB', 'UPDATE', orderId, `Saved clinical parameters for Lab Order #${orderId}.`, req);
    res.json({ success: true, order });
  });

  app.put('/api/lab/results/:orderItemId', (req: Request, res: Response) => {
    const { orderItemId } = req.params;
    const { resultValue, unit, isAbnormal, technicianNotes, actorEmail, actorRole } = req.body;

    let targetOrder: LabTestOrder | null = null;
    let targetItem: any = null;

    for (const order of state.labOrders) {
      const foundItem = order.items.find(it => it.id === orderItemId);
      if (foundItem) {
        targetOrder = order;
        targetItem = foundItem;
        break;
      }
    }

    if (!targetOrder || !targetItem) {
       res.status(404).json({ success: false, error: 'Diagnostic test order item not found.' });
       return;
    }

    targetItem.resultValue = resultValue;
    targetItem.unit = unit;
    targetItem.isAbnormal = !!isAbnormal;
    targetItem.technicianNotes = technicianNotes;
    targetItem.resultEnteredAt = new Date().toISOString();
    targetItem.resultEnteredBy = 'usr-6';
    targetItem.resultEnteredByName = 'Anil Kapur';

    // Verify if all order items have entries, update global order status to "PROCESSING"
    const missingResults = targetOrder.items.some(i => !i.resultValue);
    targetOrder.status = missingResults ? 'PROCESSING' : 'COMPLETED';

    saveDatabase();

    // Dispatch abnormal diagnostic alert to doctor base
    if (!!isAbnormal) {
      createNotification(
        'CRITICAL_LAB_RESULT',
        'Abnormal Lab Value Reported',
        `Critical value detected for ${targetOrder.patientName || 'Patient'}: ${targetItem.testCode || 'Test'} result value is '${resultValue} ${unit || ''}' (Abnormal level flagged).`,
        'DOCTOR'
      );
    }

    logAudit(actorEmail, actorRole, 'LAB', 'UPDATE', orderItemId, `Logged test results for Order #${targetOrder.id} - ${targetItem.testCode}.`, req);
    res.json({ success: true, order: targetOrder });
  });

  // Approve Lab Report
  app.post('/api/lab/approve/:orderId', (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { actorEmail, actorRole } = req.body;

    const order = state.labOrders.find(o => o.id === orderId);
    if (!order) {
       res.status(404).json({ success: false, error: 'Lab order not found' });
       return;
    }

    order.status = 'REPORT_APPROVED';
    order.items.forEach(it => {
      it.approvedAt = new Date().toISOString();
      it.approvedBy = 'usr-1';
      it.approvedByName = 'Dr. Amitabh Verma';
    });

    saveDatabase();

    logAudit(actorEmail, actorRole, 'LAB', 'APPROVE', orderId, `Clinical Director approved diagnostics report package for Order #${orderId}.`, req);
    res.json({ success: true, order });
  });

  // 11. CRM LEADS LEAD CAPTURE & PIPELINES
  app.post('/api/crm/lead', (req: Request, res: Response) => {
    const { fullName, email, mobile, source, campaignName, preferredDepartment, notes, actorEmail, actorRole } = req.body;

    const newLead: CrmLead = {
      id: `ld-${Date.now()}`,
      source: source || 'Website',
      fullName,
      email,
      mobile,
      stage: 'NEW',
      campaignName,
      preferredDepartment,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.crmLeads.push(newLead);
    saveDatabase();

    logAudit(actorEmail, actorRole, 'CRM', 'CREATE', newLead.id, `Captured new strategic CRM lead '${fullName}' via ${source}.`, req);
    res.status(201).json({ success: true, lead: newLead });
  });

  // Update Lead Status Stage / Conversion
  app.put('/api/crm/lead/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { stage, assignedTo, notes, actorEmail, actorRole } = req.body;

    const lead = state.crmLeads.find(l => l.id === id);
    if (!lead) {
       res.status(404).json({ success: false, error: 'Lead not found.' });
       return;
    }

    if (stage) {
      lead.stage = stage as LeadStage;
      if (stage === 'ADMITTED') {
        lead.conversionDate = new Date().toISOString().slice(0, 10);
      }
    }
    if (assignedTo) {
      lead.assignedTo = assignedTo;
      const user = state.users.find(u => u.id === assignedTo);
      lead.assignedToName = user ? user.fullName : '';
    }
    if (notes) {
      lead.notes = notes;
    }

    lead.updatedAt = new Date().toISOString();
    saveDatabase();

    logAudit(actorEmail, actorRole, 'CRM', 'UPDATE', id, `Updated CRM lead stage status to ${lead.stage}.`, req);
    res.json({ success: true, lead });
  });

  // Log CRM counselling activity
  app.post('/api/crm/activity', (req: Request, res: Response) => {
    const { leadId, activityType, summary, notes, followupNeeded, followupDate, actorEmail, actorRole } = req.body;

    const user = state.users.find(u => u.email === actorEmail);
    const loggedByName = user ? user.fullName : 'CRM Executive';

    const newActivity = {
      id: `act-${Date.now()}`,
      leadId,
      activityType,
      summary,
      notes,
      followupNeeded: !!followupNeeded,
      followupDate,
      loggedBy: user ? user.id : 'usr-9',
      loggedByName,
      createdAt: new Date().toISOString()
    };

    state.crmActivities.unshift(newActivity);
    saveDatabase();

    // Trigger PENDING_TASK notification if followup is requested
    if (!!followupNeeded) {
      const lead = state.crmLeads.find(l => l.id === leadId);
      createNotification(
        'PENDING_TASK',
        'CRM Followup Assignment',
        `Action Required: Lead '${lead ? lead.fullName : leadId}' requires followup activity: '${summary}'. Schedule: ${followupDate || 'As soon as possible'}.`,
        'CRM_EXECUTIVE'
      );
    }

    logAudit(actorEmail, actorRole, 'CRM', 'CREATE', leadId, `Logged counselling activity (${activityType}) on lead: ${summary}.`, req);
    res.status(201).json({ success: true, activity: newActivity });
  });

  // 12. IMMUTABLE CUSTOM AUDIT LOGGER
  app.post('/api/audit-logs', (req: Request, res: Response) => {
    const { email, role, module, action, itemId, details } = req.body;
    logAudit(email, role, module, action, itemId, details, req);
    res.json({ success: true });
  });

  // 13. NOTIFICATIONS ENDPOINTS (REST + SSE STREAM)
  // Retrieve user-centric notifications
  app.get('/api/notifications', (req: Request, res: Response) => {
    const role = req.query.role as string;
    if (!state.notifications) {
      state.notifications = [];
    }
    
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || !role) {
      res.json(state.notifications);
    } else {
      const filtered = state.notifications.filter(
        n => !n.roleRecipient || n.roleRecipient === 'ALL' || n.roleRecipient === role
      );
      res.json(filtered);
    }
  });

  // Mark interactive notification as read
  app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    if (state.notifications) {
      const idx = state.notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        state.notifications[idx].isRead = true;
        saveDatabase();
        res.json({ success: true, notification: state.notifications[idx] });
        return;
      }
    }
    res.status(404).json({ success: false, error: 'Notification not found' });
  });

  // Mark all notifications matching role boundaries read
  app.post('/api/notifications/read-all', (req: Request, res: Response) => {
    const role = req.body.role as string;
    if (state.notifications) {
      state.notifications.forEach(n => {
        if (!role || n.roleRecipient === role || role === 'SUPER_ADMIN' || role === 'ADMIN') {
          n.isRead = true;
        }
      });
      saveDatabase();
    }
    res.json({ success: true });
  });

  // Purge notification logs queue
  app.post('/api/notifications/clear', (req: Request, res: Response) => {
    state.notifications = [];
    saveDatabase();
    res.json({ success: true });
  });

  // Server-Sent Events subscription pool for live push updates
  app.get('/api/notifications/stream', (req: Request, res: Response) => {
    const role = (req.query.role as string) || 'ALL';

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const client = { res, role };
    activeClients.push(client);

    console.log(`[SSE] New connected subscriber. Role requested: ${role}. Connection pool count: ${activeClients.length}`);

    // Periodically pulse heartbeats to preserve Cloud Run / reverse proxy conduits
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      const index = activeClients.indexOf(client);
      if (index !== -1) {
        activeClients.splice(index, 1);
        console.log(`[SSE] Subscriber disconnected. Connection pool count: ${activeClients.length}`);
      }
    });
  });


  // Serve static assets via Vite middleware or fallback directories
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA Wildcard fallback
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Fallback dev error handling
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Server internal error, check operation pipelines' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HMS Fullstack Engine running on http://0.0.0.0:${PORT}`);
  });
}

run().catch(err => {
  console.error('Fatal bootstrapping crash:', err);
});
