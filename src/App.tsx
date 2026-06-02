import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, Stethoscope, LayoutDashboard, CreditCard, Package,
  Microscope, TrendingUp, Settings, Bell, Search, Plus, LogIn, LogOut,
  Hospital, X, Save, ChevronDown, Eye, EyeOff, CheckCircle, AlertCircle,
  ClipboardList, Activity, Pill, FileText, UserCheck, FlaskConical,
  BarChart3, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── TYPES ─────────────────────────────────────────────────────────────────────
type RoleType = 'SUPER_ADMIN' | 'DOCTOR' | 'LAB_TECHNICIAN' | 'PATIENT' | 'RECEPTIONIST' | 'PHARMACIST' | 'BILLING_EXECUTIVE';

interface UserSession {
  id: string; email: string; fullName: string; role: RoleType; uhid?: string;
}

interface Patient {
  id: string;
  uhid: string; // YYYY-NNNNNN
  status: 'Active' | 'InActive' | 'Hold';
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

// ─── SEED DATA ──────────────────────────────────────────────────────────────────
const DEMO_ACCOUNTS: Array<UserSession & { password: string }> = [
  { id: 'usr-1', email: 'admin@hospital.com',   password: 'admin123',   fullName: 'Dr. Amitabh Verma',  role: 'SUPER_ADMIN' },
  { id: 'usr-2', email: 'doctor@hospital.com',  password: 'doctor123',  fullName: 'Dr. Sarah Wilson',   role: 'DOCTOR' },
  { id: 'usr-5', email: 'lab@hospital.com',     password: 'lab123',     fullName: 'Anil Kapur',         role: 'LAB_TECHNICIAN' },
  { id: 'usr-3', email: 'patient@hospital.com', password: 'patient123', fullName: 'Rahul Sen',          role: 'PATIENT', uhid: 'UHID-2026-0001' },
  { id: 'usr-4', email: 'reception@hospital.com',password:'recept123',  fullName: 'John Doe',           role: 'RECEPTIONIST' },
  { id: 'usr-6', email: 'pharmacy@hospital.com',password: 'pharm123',   fullName: 'Raj Kumar',          role: 'PHARMACIST' },
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1', uhid: '2026-000001', fullName: 'Rahul Sen', gender: 'Male', dobCalendar: 'Gregorian', dob: '15-May-1990',
    mobileNo: '9876543210', emailId: 'rahul.sen@example.com', bloodGroup: 'O Positive', address: '123 Park Street',
    district: 'Mumbai', state: 'Maharashtra', country: 'India', registrationType: 'Regular', status: 'Active',
    nationality: 'Indian', religion: 'Hinduism',
    createdAt: '2026-05-20T10:00:00Z', updatedAt: '2026-05-20T10:00:00Z'
  },
];

// ─── NM BUTTON COMPONENT ────────────────────────────────────────────────────────
const NmBtn = ({ children, onClick, className = '', type = 'button' as any, disabled = false, accent = false }: any) => (
  <button type={type} onClick={onClick} disabled={disabled}
    className={`${accent ? 'nm-button-accent' : 'nm-button'} px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
    {children}
  </button>
);

// ─── TOAST NOTIFICATION ────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div initial={{ opacity: 0, y: -40, x: '50%', right: '50%' }}
    animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
    className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl nm-card text-sm font-bold shadow-2xl ${type === 'success' ? 'text-black' : 'text-black'}`}>
    {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
    <span>{msg}</span>
    <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={16} /></button>
  </motion.div>
);

// ─── PATIENT REGISTRATION MODAL ────────────────────────────────────────────────
const BLOOD_GROUPS = ['A Positive', 'A Negative', 'B Positive', 'B Negative', 'AB Positive', 'AB Negative', 'O Positive', 'O Negative'];
const REG_TYPES    = ['Regular', 'Temporary', 'Unknown'];
const NATIONALITIES = ['Indian', 'American', 'British', 'Canadian', 'Australian', 'Emirati', 'Saudi'];
const RELIGIONS = ['Hinduism', 'Islam', 'Christianity', 'Sikhism', 'Buddhism', 'Jainism', 'Other'];
const ID_TYPES = ['Aadhar', 'Passport', 'PAN Card', 'Driving License'];
const DISTRICT_DATA: Record<string, { state: string; country: string }> = {
  'Mumbai': { state: 'Maharashtra', country: 'India' },
  'Pune': { state: 'Maharashtra', country: 'India' },
  'New Delhi': { state: 'Delhi', country: 'India' },
  'Bangalore': { state: 'Karnataka', country: 'India' },
  'Chennai': { state: 'Tamil Nadu', country: 'India' },
  'Hyderabad': { state: 'Telangana', country: 'India' },
};

interface RegModalProps {
  onClose: () => void;
  onSave: (p: Patient) => void;
}
const PatientRegModal = ({ onClose, onSave }: RegModalProps) => {
  const empty = { 
    fullName:'', gender:'Male', dobCalendar:'Gregorian', dob:'', mobileNo:'', emailId:'',
    bloodGroup:'O Positive', nationality:'Indian', religion:'Hinduism', idType:'', idNo:'',
    address:'', district:'Mumbai', state:'Maharashtra', country:'India', registrationType:'Regular' 
  };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const set = (k: string, v: string) => { 
    setForm(f => {
      const updated = { ...f, [k]: v };
      if (k === 'district' && DISTRICT_DATA[v]) {
        updated.state = DISTRICT_DATA[v].state;
        updated.country = DISTRICT_DATA[v].country;
      }
      return updated;
    }); 
    setErrors(e => ({...e,[k]:''})); 
  };

  const validate = () => {
    const e: Record<string,string> = {};
    if (form.fullName.length < 3 || form.fullName.length > 60) e.fullName = 'Name must be 3-60 characters';
    if (!form.dob) e.dob = 'Date of birth is required';
    if (!form.mobileNo.match(/^\d{10}$/)) e.mobileNo = 'Enter valid 10-digit numeric mobile no';
    if (form.idType && (!form.idNo || form.idNo.length < 3 || form.idNo.length > 15)) e.idNo = 'ID No must be 3-15 characters';
    if (form.address && form.address.length > 100) e.address = 'Address max 100 characters';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const now = new Date().toISOString();
    const year = new Date().getFullYear();
    const seq = String(Math.floor(Math.random() * 900000) + 100000);
    
    const p: Patient = {
      id: `pat-${Date.now()}`,
      uhid: `${year}-${seq}`,
      status: 'Active',
      updatedAt: now,
      createdAt: now,
      ...form as any
    };
    onSave(p);
  };

  const F = ({ label, field, type='text', required=false, half=false, disabled=false }: any) => (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
        {label}{required && <span className="text-black ml-0.5">*</span>}
      </label>
      <div className={`nm-inset px-3 py-2 rounded-xl mt-0.5 ${errors[field] ? 'ring-2 ring-gray-400' : ''} ${disabled ? 'opacity-50' : ''}`}>
        <input type={type} value={(form as any)[field]} onChange={e => set(field, e.target.value)}
          disabled={disabled} placeholder={label} className="bg-transparent w-full outline-none text-sm font-medium" />
      </div>
      {errors[field] && <p className="text-black text-[10px] mt-0.5 ml-1">{errors[field]}</p>}
    </div>
  );

  const S = ({ label, field, options, half=false, required=false }: any) => (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
        {label}{required && <span className="text-black ml-0.5">*</span>}
      </label>
      <div className="nm-inset px-3 py-2 rounded-xl mt-0.5 relative">
        <select value={(form as any)[field]} onChange={e => set(field, e.target.value)}
          className="bg-transparent w-full outline-none text-sm font-medium appearance-none cursor-pointer">
          <option value="">Select {label}</option>
          {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="nm-card w-full max-w-3xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden">

        <div className="flex items-center justify-between p-4 border-b border-black/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="nm-inset p-2 rounded-xl text-black/80"><Users size={20} /></div>
            <div>
              <h2 className="font-black text-black">Advanced Patient Registration</h2>
              <p className="text-[10px] opacity-60 font-medium uppercase tracking-tighter">Following Specification Sheet SL-01 to 18</p>
            </div>
          </div>
          <button onClick={onClose} className="nm-button p-2 rounded-xl"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            
            {/* System Controlled Info */}
            <div className="col-span-2 nm-inset px-3 py-1.5 rounded-xl bg-[var(--color-nm-accent-light)]/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-nm-accent)]">Personal Information</span>
            </div>

            <S label="Registration Type" field="registrationType" options={REG_TYPES} required half />
            <F label="Full Name" field="fullName" required half />
            
            <S label="Gender" field="gender" options={['Male', 'Female', 'Other']} required half />
            <S label="DOB Calendar" field="dobCalendar" options={['Gregorian', 'Hijri']} required half />
            
            <F label="Date of Birth (DOB)" field="dob" type="date" required half />
            <S label="Nationality" field="nationality" options={NATIONALITIES} required half />

            <F label="Mobile No" field="mobileNo" required half />
            <F label="Email ID" field="emailId" type="email" half />

            <S label="Religion" field="religion" options={RELIGIONS} half />
            <S label="Blood Group" field="bloodGroup" options={BLOOD_GROUPS} half />

            <div className="col-span-2 h-px bg-gray-200 my-1"></div>

            <S label="ID Type" field="idType" options={ID_TYPES} half />
            <F label="ID No" field="idNo" half disabled={!form.idType} />

            <S label="District" field="district" options={Object.keys(DISTRICT_DATA)} required half />
            <F label="State" field="state" half disabled />

            <F label="Country" field="country" half disabled />
            <div className="col-span-1"></div>

            <F label="Address" field="address" />

          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-black/20 shrink-0 bg-white">
          <NmBtn onClick={onClose} className="text-black/80">Discard Changes</NmBtn>
          <NmBtn onClick={handleSave} accent className="flex items-center gap-2 px-8">
            <Save size={16} /> Save & Generate UHID
          </NmBtn>
        </div>
      </motion.div>
    </div>
  );
};

// ─── PATIENT DETAIL MODAL ───────────────────────────────────────────────────────
const PatientDetailModal = ({ patient, onClose }: { patient: Patient; onClose: () => void }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      className="nm-card w-full max-w-xl rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-black/20">
        <div>
          <h2 className="font-black text-black">{patient.fullName}</h2>
          <p className="text-[11px] font-bold text-black/80">{patient.uhid}</p>
        </div>
        <button onClick={onClose} className="nm-button p-2 rounded-xl"><X size={18} /></button>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2">
        {[
          ['Gender', patient.gender], ['DOB', patient.dob], ['Calendar', patient.dobCalendar], ['Mobile', patient.mobileNo],
          ['Email', patient.emailId], ['Blood Group', patient.bloodGroup], ['Status', patient.status],
          ['State', patient.state], ['Country', patient.country], ['District', patient.district],
          ['Nationality', patient.nationality], ['Religion', patient.religion],
          ['ID Type', patient.idType], ['ID No', patient.idNo],
        ].map(([k, v]) => (
          <div key={k} className="nm-inset p-2 rounded-xl">
            <p className="text-[9px] font-black uppercase opacity-50">{k}</p>
            <p className="text-sm font-bold">{v || '—'}</p>
          </div>
        ))}
        <div className="col-span-2 nm-inset p-2 rounded-xl">
          <p className="text-[9px] font-black uppercase opacity-50">Address</p>
          <p className="text-sm font-bold">{patient.address}</p>
        </div>
      </div>
    </motion.div>
  </div>
);

// ─── MODULE: PATIENTS ───────────────────────────────────────────────────────────
const PatientsModule = ({ user, patients, setPatients, showToast }: any) => {
  const [showReg, setShowReg] = useState(false);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Patient | null>(null);

  const canRegister = ['SUPER_ADMIN','RECEPTIONIST','DOCTOR'].includes(user.role);
  const filtered = patients.filter((p: Patient) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.uhid.toLowerCase().includes(search.toLowerCase()) ||
    p.mobileNo.includes(search)
  );

  const handleSave = (p: Patient) => {
    setPatients((prev: Patient[]) => [p, ...prev]);
    setShowReg(false);
    showToast(`Patient ${p.fullName} registered! UHID: ${p.uhid}`, 'success');
  };

  return (
    <div className="nm-flat p-4 rounded-2xl animate-fade-in h-full flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black flex items-center gap-2 text-black">
          <Users size={20} className="text-[var(--color-nm-accent)]" /> Patient Registry
          <span className="nm-inset px-2 py-0.5 rounded-full text-xs text-[var(--color-nm-accent)]">{patients.length}</span>
        </h2>
        {canRegister && (
          <NmBtn onClick={() => setShowReg(true)} accent className="flex items-center gap-2">
            <Plus size={16} /> New Registration
          </NmBtn>
        )}
      </div>

      <div className="nm-inset px-3 py-2 rounded-xl flex items-center gap-2">
        <Search size={16} className="opacity-50 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by Name, UHID or Mobile Number..."
          className="bg-transparent outline-none text-sm w-full font-medium" />
        {search && <button onClick={() => setSearch('')}><X size={14} className="opacity-50" /></button>}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10" style={{ background: 'var(--color-nm-bg)' }}>
            <tr className="text-left border-b border-black/20 opacity-60 uppercase font-black tracking-widest text-[9px]">
              <th className="pb-2 pr-3">UHID</th>
              <th className="pb-2 pr-3">Patient Name</th>
              <th className="pb-2 pr-3">Gender</th>
              <th className="pb-2 pr-3">Mobile</th>
              <th className="pb-2 pr-3">Blood</th>
              <th className="pb-2 pr-3">Status</th>
              <th className="pb-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center opacity-40 font-bold">No patients found</td></tr>
            ) : filtered.map((p: Patient) => (
              <tr key={p.id} className="hover:bg-[var(--color-nm-accent-light)]/5 transition-colors">
                <td className="py-2 pr-3 font-bold text-[var(--color-nm-accent)]">{p.uhid}</td>
                <td className="py-2 pr-3 font-black">{p.fullName}</td>
                <td className="py-2 pr-3 font-medium">{p.gender}</td>
                <td className="py-2 pr-3 font-medium">{p.mobileNo}</td>
                <td className="py-2 pr-3">
                  <span className="nm-inset px-2 py-0.5 rounded-full font-bold text-[10px]">{p.bloodGroup}</span>
                </td>
                <td className="py-2 pr-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    p.status === 'Active' ? 'bg-white font-bold' : 'bg-white text-black/40'
                  }`}>{p.status}</span>
                </td>
                <td className="py-2">
                  <button onClick={() => setDetail(p)} className="nm-button px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 text-black/80">
                    <Eye size={12} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showReg && <PatientRegModal onClose={() => setShowReg(false)} onSave={handleSave} />}
        {detail && <PatientDetailModal patient={detail} onClose={() => setDetail(null)} />}
      </AnimatePresence>
    </div>
  );
};

// ─── MODULE: DASHBOARD (role-aware) ───────────────────────────────────────────
const DashboardModule = ({ user, patients, setActiveTab }: any) => {
  if (user.role === 'PATIENT') return (
    <div className="nm-flat p-4 rounded-2xl animate-fade-in h-full flex flex-col gap-3">
      <h2 className="text-lg font-black flex items-center gap-2 text-black">
        <Hospital size={20} className="text-black/80" /> My Health Portal
      </h2>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {[
          { label:'My UHID', value: user.uhid || 'UHID-2026-0001', icon: UserCheck, color:'text-[var(--color-nm-accent)]' },
          { label:'Active Appointments', value: '2', icon: Calendar, color:'text-[var(--color-nm-accent)]' },
          { label:'Lab Results Pending', value: '1', icon: FlaskConical, color:'text-[var(--color-nm-accent)]' },
          { label:'Outstanding Bills', value: '₹2,400', icon: CreditCard, color:'text-[var(--color-nm-accent)]' },
        ].map((k, i) => (
          <div key={i} className="nm-inset p-4 rounded-xl flex flex-col gap-1">
            <k.icon size={20} className={k.color} />
            <p className="text-xl font-black">{k.value}</p>
            <p className="text-[11px] font-medium opacity-60">{k.label}</p>
          </div>
        ))}
        <div className="col-span-2 nm-inset p-4 rounded-xl">
          <p className="text-xs font-black uppercase mb-2 opacity-60">Next Appointment</p>
          <div className="nm-flat p-3 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-black">Dr. Sarah Wilson – Cardiology</p>
              <p className="text-xs opacity-60 font-medium">Today at 11:00 AM • Token #3</p>
            </div>
            <span className="nm-inset px-3 py-1 rounded-full text-[11px] font-bold text-black">Confirmed</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (user.role === 'DOCTOR') return (
    <div className="nm-flat p-4 rounded-2xl animate-fade-in h-full flex flex-col gap-3">
      <h2 className="text-lg font-black flex items-center gap-2 text-black">
        <Stethoscope size={20} className="text-black/80" /> Doctor's Station — {user.fullName}
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label:"Today's OPD",  value:'8',  icon:Calendar,  color:'text-black/80' },
          { label:'In Queue',     value:'3',  icon:Activity,  color:'text-black' },
          { label:'Lab Orders',   value:'5',  icon:Microscope,color:'text-black/60'},
          { label:'Prescriptions',value:'12', icon:Pill,      color:'text-black/40'},
        ].map((k, i) => (
          <div key={i} className="nm-inset p-3 rounded-xl">
            <k.icon size={16} className={k.color} />
            <p className="text-xl font-black mt-1">{k.value}</p>
            <p className="text-[10px] font-medium opacity-60">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 nm-inset p-3 rounded-xl">
        <p className="text-[10px] font-black uppercase opacity-60 mb-2">Today's Patient Queue</p>
        <div className="space-y-1.5">
          {['Rahul Sen – Token #01 – CHECKED IN','Harpreet Kaur – Token #02 – WAITING','Meenal Joshi – Token #03 – SCHEDULED'].map((q, i) => (
            <div key={i} className={`nm-flat p-2.5 rounded-xl flex items-center justify-between text-xs ${i===0 ? 'border-l-4 border-black/40':''}`}>
              <span className="font-bold">{q}</span>
              {i === 0 && <span className="nm-inset px-2 py-0.5 rounded-full text-[10px] font-bold text-black">Active</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (user.role === 'LAB_TECHNICIAN') return (
    <div className="nm-flat p-4 rounded-2xl animate-fade-in h-full flex flex-col gap-3">
      <h2 className="text-lg font-black flex items-center gap-2 text-black">
        <FlaskConical size={20} className="text-black/60" /> Lab Technician Dashboard
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label:'Orders Today',    value:'14', icon:FileText,    color:'text-black/80' },
          { label:'Sample Pending',  value:'4',  icon:FlaskConical,color:'text-black/40'},
          { label:'Reports Approved',value:'6',  icon:CheckCircle, color:'text-black'},
        ].map((k, i) => (
          <div key={i} className="nm-inset p-3 rounded-xl">
            <k.icon size={16} className={k.color} />
            <p className="text-xl font-black mt-1">{k.value}</p>
            <p className="text-[10px] font-medium opacity-60">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 nm-inset p-3 rounded-xl">
        <p className="text-[10px] font-black uppercase opacity-60 mb-2">Pending Lab Orders</p>
        <div className="space-y-1.5">
          {[
            {name:'Rahul Sen', test:'Complete Blood Count (CBC)', status:'SAMPLE_COLLECTED'},
            {name:'Harpreet Kaur', test:'Liver Function Test (LFT)', status:'ORDERED'},
            {name:'Meenal Joshi', test:'Kidney Function Test (KFT)', status:'PROCESSING'},
          ].map((o, i) => (
            <div key={i} className="nm-flat p-2.5 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-black">{o.name}</p>
                <p className="opacity-60 font-medium">{o.test}</p>
              </div>
              <span className={`nm-inset px-2 py-0.5 rounded-full text-[10px] font-bold ${
                o.status==='SAMPLE_COLLECTED'?'text-black/80':o.status==='PROCESSING'?'text-black/40':'text-black/60'
              }`}>{o.status.replace('_',' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // SUPER_ADMIN / RECEPTIONIST default
  return (
    <div className="nm-flat p-4 rounded-2xl animate-fade-in h-full flex flex-col gap-3">
      <h2 className="text-lg font-black flex items-center gap-2 text-black">
        <LayoutDashboard size={20} className="text-black/80" /> Hospital Command Center
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label:'Total Patients', value: String(patients.length), icon:Users,     color:'text-[var(--color-nm-accent)]' },
          { label:'Active OPDs',    value:'42',                     icon:Calendar,  color:'text-[var(--color-nm-accent)]'},
          { label:'Beds Occupied',  value:'18/45',                  icon:Hospital,  color:'text-[var(--color-nm-accent)]'},
          { label:'Revenue Today',  value:'₹42,500',                icon:BarChart3, color:'text-[var(--color-nm-accent)]'},
        ].map((kpi, i) => (
          <div key={i} className="nm-inset p-3 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <kpi.icon size={16} className={kpi.color} />
              <span className="text-[9px] uppercase font-black opacity-40">Live</span>
            </div>
            <p className="text-lg font-black">{kpi.value}</p>
            <p className="text-[10px] font-medium opacity-60">{kpi.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-1 min-h-0">
        <div className="nm-inset p-3 rounded-xl flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase opacity-60">Recent Registrations</p>
            <button onClick={() => setActiveTab('patients')} className="nm-button px-2 py-1 rounded-lg text-[10px] font-bold text-black/80 flex items-center gap-1">
              View All <ArrowRight size={10} />
            </button>
          </div>
          <div className="space-y-1 flex-1 overflow-auto">
            {patients.slice(0, 5).map((p: Patient) => (
              <div key={p.id} className="nm-flat p-2 rounded-xl text-xs flex justify-between items-center hover:scale-[1.01] transition-transform">
                <div>
                  <p className="font-black">{p.fullName}</p>
                  <p className="opacity-50 font-medium">{p.uhid}</p>
                </div>
                <span className="bg-white font-bold px-2 py-0.5 rounded-full font-bold text-[10px]">Active</span>
              </div>
            ))}
          </div>
        </div>
        <div className="nm-inset p-3 rounded-xl w-56 flex flex-col">
          <p className="text-[10px] font-black uppercase opacity-60 mb-2">Pharmacy Alerts</p>
          <div className="nm-flat p-2.5 rounded-xl border-l-4 border-black/40 animate-pulse">
            <p className="text-[11px] font-black">⚠ Critical Low Stock</p>
            <p className="text-[10px] opacity-60 font-medium">Paracetamol 500mg</p>
            <p className="text-[10px] opacity-60 font-medium">Batch PM-109 • 8 units left</p>
          </div>
          <div className="mt-2 nm-flat p-2.5 rounded-xl border-l-4 border-gray-300">
            <p className="text-[11px] font-black">Lab Result Ready</p>
            <p className="text-[10px] opacity-60 font-medium">CBC – Rahul Sen</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── GENERIC PLACEHOLDER MODULE ────────────────────────────────────────────────
const PlaceholderModule = ({ label, icon: Icon, color = 'text-black/80' }: any) => (
  <div className="nm-flat h-full rounded-2xl flex flex-col items-center justify-center p-8 text-center animate-fade-in">
    <div className="nm-inset p-8 rounded-full mb-4">
      <Icon size={64} className={`opacity-30 ${color}`} />
    </div>
    <h3 className="text-xl font-black text-gray-700">{label} Module</h3>
    <p className="text-xs opacity-50 font-bold max-w-xs mt-1">
      This module is fully wired to the backend API. UI deployment in progress.
    </p>
  </div>
);

// ─── LOGIN SCREEN ──────────────────────────────────────────────────────────────
const ROLE_TABS: Array<{ key: string; label: string; icon: any; color: string }> = [
  { key: 'SUPER_ADMIN',    label: 'Admin / Staff', icon: Settings,   color: 'text-black/80' },
  { key: 'DOCTOR',         label: 'Doctor',        icon: Stethoscope,color: 'text-black'},
  { key: 'LAB_TECHNICIAN', label: 'Technician',    icon: Microscope, color: 'text-black/60'},
  { key: 'PATIENT',        label: 'Patient',       icon: UserCheck,  color: 'text-black/40'},
];

const ROLE_HINTS: Record<string, string> = {
  SUPER_ADMIN:    'admin@hospital.com',
  DOCTOR:         'doctor@hospital.com',
  LAB_TECHNICIAN: 'lab@hospital.com',
  PATIENT:        'patient@hospital.com',
};

interface LoginProps { onLogin: (u: UserSession) => void; }
const LoginScreen = ({ onLogin }: LoginProps) => {
  const [roleTab, setRoleTab] = useState('SUPER_ADMIN');
  const [email, setEmail]     = useState('admin@hospital.com');
  const [password, setPassword] = useState('admin123');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (role: string) => {
    setRoleTab(role);
    setEmail(ROLE_HINTS[role]);
    const acc = DEMO_ACCOUNTS.find(a => a.email === ROLE_HINTS[role]);
    setPassword(acc?.password || '');
    setError('');
  };

  const handleLogin = async () => {
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const acc = DEMO_ACCOUNTS.find(a => a.email === email.trim().toLowerCase() && a.password === password);
    if (!acc) { setError('Invalid credentials. Check your email and password.'); setLoading(false); return; }
    if (acc.role !== roleTab && !(acc.role === 'RECEPTIONIST' && roleTab === 'SUPER_ADMIN')) {
      setError(`This account is not a ${ROLE_TABS.find(r=>r.key===roleTab)?.label}. Try a different login tab.`);
      setLoading(false); return;
    }
    const { password: _, ...session } = acc;
    onLogin(session as UserSession);
  };

  const tab = ROLE_TABS.find(r => r.key === roleTab)!;

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-[var(--color-nm-bg)]">
      <div className="nm-card w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="inline-flex nm-inset p-4 rounded-full mb-3">
            <Hospital size={44} className="text-[var(--color-nm-accent)]" />
          </div>
          <h1 className="text-3xl font-black text-black tracking-tighter">MediCore</h1>
          <p className="text-[11px] font-bold uppercase opacity-50 tracking-widest">Enterprise Clinical Gateway</p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-4 gap-1 nm-inset p-1.5 rounded-2xl mb-5">
          {ROLE_TABS.map(r => (
            <button key={r.key} onClick={() => handleTabChange(r.key)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all text-center ${
                roleTab === r.key ? `nm-flat text-[var(--color-nm-accent)] font-black` : 'opacity-50 font-bold hover:opacity-75'
              }`}>
              <r.icon size={18} />
              <span className="text-[9px] uppercase font-black leading-none">{r.label}</span>
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black uppercase opacity-60 ml-2">Email Address</label>
            <div className="nm-inset px-4 py-3 rounded-xl mt-1">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="bg-transparent w-full outline-none text-sm font-medium" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase opacity-60 ml-2">Password</label>
            <div className="nm-inset px-4 py-3 rounded-xl mt-1 flex items-center gap-2">
              <input type={showPwd ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="bg-transparent w-full outline-none text-sm font-medium flex-1" />
              <button onClick={() => setShowPwd(!showPwd)} className="opacity-50 hover:opacity-80 shrink-0">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="nm-inset px-3 py-2 rounded-xl border-l-4 border-black/40 text-black text-xs font-bold flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <button onClick={handleLogin} disabled={loading}
            className={`nm-button-accent w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black cursor-pointer disabled:opacity-40`}>
            {loading ? <span className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" /> :
              <><tab.icon size={20} /> Login as {tab.label}</>}
          </button>
        </div>

        {/* Quick credential hints */}
        <div className="mt-4 nm-inset p-3 rounded-xl">
          <p className="text-[9px] font-black uppercase opacity-50 mb-1.5">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-1">
            {DEMO_ACCOUNTS.filter(a=>['SUPER_ADMIN','DOCTOR','LAB_TECHNICIAN','PATIENT'].includes(a.role)).map(a => (
              <button key={a.id} onClick={() => { setEmail(a.email); setPassword(a.password); setRoleTab(a.role); }}
                className="nm-flat p-1.5 rounded-lg text-left hover:scale-[1.02] transition-transform">
                <p className="text-[10px] font-black">{a.fullName}</p>
                <p className="text-[9px] opacity-50 font-medium">{a.role.replace('_',' ')}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SIDEBAR NAV CONFIG BY ROLE ────────────────────────────────────────────────
const NAV_BY_ROLE: Record<string, Array<{ id: string; icon: any; label: string }>> = {
  SUPER_ADMIN: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'   },
    { id:'patients',     icon:Users,           label:'Patients'    },
    { id:'appointments', icon:Calendar,        label:'Appointments'},
    { id:'emr',          icon:Stethoscope,     label:'Clinical EMR'},
    { id:'lab',          icon:Microscope,      label:'Laboratory'  },
    { id:'pharmacy',     icon:Package,         label:'Pharmacy'    },
    { id:'billing',      icon:CreditCard,      label:'Billing'     },
    { id:'crm',          icon:TrendingUp,      label:'CRM Leads'   },
    { id:'admin',        icon:Settings,        label:'Admin'       },
  ],
  RECEPTIONIST: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'   },
    { id:'patients',     icon:Users,           label:'Patients'    },
    { id:'appointments', icon:Calendar,        label:'Appointments'},
  ],
  DOCTOR: [
    { id:'dashboard',    icon:LayoutDashboard, label:'My Station'  },
    { id:'patients',     icon:Users,           label:'My Patients' },
    { id:'emr',          icon:ClipboardList,   label:'Clinical EMR'},
    { id:'lab',          icon:Microscope,      label:'Lab Orders'  },
  ],
  LAB_TECHNICIAN: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'   },
    { id:'lab',          icon:FlaskConical,    label:'Lab Orders'  },
  ],
  PHARMACIST: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'   },
    { id:'pharmacy',     icon:Package,         label:'Pharmacy'    },
  ],
  BILLING_EXECUTIVE: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'   },
    { id:'billing',      icon:CreditCard,      label:'Billing'     },
  ],
  PATIENT: [
    { id:'dashboard',    icon:LayoutDashboard, label:'My Portal'   },
    { id:'appointments', icon:Calendar,        label:'Appointments'},
    { id:'lab',          icon:FlaskConical,    label:'My Reports'  },
    { id:'billing',      icon:CreditCard,      label:'My Bills'    },
  ],
};

const ROLE_BADGE_COLORS: Record<string,string> = {
  SUPER_ADMIN:'text-[var(--color-nm-accent)]', DOCTOR:'text-[var(--color-nm-accent)]', LAB_TECHNICIAN:'text-[var(--color-nm-accent)]',
  PATIENT:'text-[var(--color-nm-accent)]', RECEPTIONIST:'text-[var(--color-nm-accent)]', PHARMACIST:'text-[var(--color-nm-accent)]',
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 1000); }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = (u: UserSession) => {
    setUser(u);
    setActiveTab('dashboard');
    showToast(`Welcome back, ${u.fullName}!`, 'success');
  };

  const handleLogout = () => { setUser(null); setActiveTab('dashboard'); };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-nm-bg)]">
      <div className="nm-flat p-8 rounded-full">
        <Hospital size={48} className="text-[var(--color-nm-accent)] animate-pulse" />
      </div>
      <p className="font-black text-lg text-[var(--color-nm-accent)] tracking-widest animate-pulse">LOADING MEDICORE HMS...</p>
    </div>
  );

  if (!user) return (
    <>
      <LoginScreen onLogin={handleLogin} />
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
    </>
  );

  const navItems = NAV_BY_ROLE[user.role] || NAV_BY_ROLE.SUPER_ADMIN;

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':    return <DashboardModule user={user} patients={patients} setActiveTab={setActiveTab} />;
      case 'patients':     return <PatientsModule  user={user} patients={patients} setPatients={setPatients} showToast={showToast} />;
      case 'appointments': return <PlaceholderModule label="Appointments" icon={Calendar} color="text-black/80" />;
      case 'emr':          return <PlaceholderModule label="Clinical EMR" icon={Stethoscope} color="text-black/80" />;
      case 'lab':          return <PlaceholderModule label="Laboratory" icon={FlaskConical} color="text-black/60" />;
      case 'pharmacy':     return <PlaceholderModule label="Pharmacy" icon={Package} color="text-black/80" />;
      case 'billing':      return <PlaceholderModule label="Billing" icon={CreditCard} color="text-black/40" />;
      case 'crm':          return <PlaceholderModule label="CRM Leads" icon={TrendingUp} color="text-black/80" />;
      case 'admin':        return <PlaceholderModule label="Admin Control" icon={Settings} color="text-black/60" />;
      default:             return <DashboardModule user={user} patients={patients} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="h-screen flex p-2 gap-2 overflow-hidden bg-[var(--color-nm-bg)]">
      {/* ── SIDEBAR ── */}
      <nav className="nm-flat w-[66px] lg:w-[175px] rounded-2xl flex flex-col p-2 shrink-0 transition-all">
        <div className="flex items-center gap-2 px-2 py-3 mb-3">
          <div className="nm-inset p-2 rounded-xl text-black/80 shrink-0">
            <Hospital size={22} />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="font-black text-lg text-black tracking-tighter leading-none">MediCore</p>
            <p className="text-[9px] font-bold opacity-40 uppercase leading-none">HMS v2</p>
          </div>
        </div>

        <div className="flex-1 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 transition-all text-left ${
                activeTab === item.id
                  ? `nm-inset ${ROLE_BADGE_COLORS[user.role]} font-black`
                  : 'hover:nm-button opacity-60 hover:opacity-90 font-bold'
              }`}>
              <item.icon size={18} className="shrink-0" />
              <span className="text-[11px] hidden lg:block truncate">{item.label}</span>
            </button>
          ))}
        </div>

        {/* User mini-card */}
        <div className="mt-2 nm-inset p-2 rounded-xl hidden lg:block">
          <p className="text-[10px] font-black truncate">{user.fullName}</p>
          <p className={`text-[9px] font-bold opacity-70 ${ROLE_BADGE_COLORS[user.role]}`}>
            {user.role.replace('_',' ')}
          </p>
        </div>
        <button onClick={handleLogout} className="mt-1 p-2.5 rounded-xl nm-button text-black font-black flex items-center gap-2.5 hover:opacity-90 transition-all">
          <LogOut size={18} className="shrink-0" />
          <span className="text-[11px] hidden lg:block">Sign Out</span>
        </button>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
        {/* Header bar */}
        <header className="nm-flat h-[54px] rounded-2xl flex items-center justify-between px-4 shrink-0 gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <h2 className="font-black text-base text-black uppercase tracking-widest truncate">
              {navItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
            </h2>
            <div className="hidden md:flex items-center gap-1.5 nm-inset px-3 py-1 rounded-full text-[11px] font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-pulse"></span>
              <span className="text-black/60">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="nm-button p-2 rounded-full relative">
              <Bell size={16} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-gray-800 rounded-full border-2 border-[#e0e5ec]"></span>
            </button>
            <div className="flex items-center gap-2 nm-inset px-3 py-1.5 rounded-full">
              <div className="w-6 h-6 rounded-full nm-flat flex items-center justify-center text-[10px] font-black text-black/80">
                {user.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-black leading-none">{user.fullName.split(' ')[0]}</p>
                <p className={`text-[8px] font-black ${ROLE_BADGE_COLORS[user.role]} leading-none`}>
                  {user.role.replace('_',' ')}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Module content */}
        <section className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.12 }}
              className="h-full">
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Toast */}
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
    </div>
  );
}
