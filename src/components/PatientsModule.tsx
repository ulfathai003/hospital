import React, { useState } from 'react';
import { Plus, Eye, Pencil, Search, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import {
  COUNTRIES, STATES, DISTRICTS, RELIGIONS, NATIONALITIES, ID_TYPES,
  nextPatientCode, genId, now
} from '../data/seed';
import type { Patient, RecordStatus, BloodGroup, Gender, RegistrationType, DobCalendar, UserSession } from '../types';
import { Btn, Modal, Field, Input, Select, SearchableSelect, StatusBadge, PageHeader, Table, TR, TD, Empty } from './ui';

const BLOOD_GROUPS: BloodGroup[] = ['AB Positive','AB Negative','A Positive','A Negative','B Positive','B Negative','O Positive','O Negative'];
const STATUSES: { value: RecordStatus; label: string }[] = [
  { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' },
  { value: 'Draft', label: 'Draft' },   { value: 'Archived', label: 'Archived' },
];

// ── Patient Form ──────────────────────────────────────────────────────────────
const PatientForm: React.FC<{
  item?: Patient; patients: Patient[]; user: UserSession;
  onSave: (p: Patient) => void; onClose: () => void;
}> = ({ item, patients, user, onSave, onClose }) => {
  const blank: Partial<Patient> = {
    facilityId: user.facilityId || '', branchId: user.branchId || '',
    status: 'Active', registrationType: 'Regular', dobCalendar: 'Gregorian', gender: 'Male',
  };
  const [form, setForm] = useState<Partial<Patient>>(item || blank);
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof Patient, v: any) => setForm(f => ({ ...f, [k]: v }));

  const states    = STATES.filter(s => !form.countryId || s.countryId === form.countryId);
  const districts = DISTRICTS.filter(d => !form.stateId || d.stateId === form.stateId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName?.trim())  e.firstName  = 'Required';
    if (!form.lastName?.trim())   e.lastName   = 'Required';
    if (!form.mobile?.trim())     e.mobile     = 'Required';
    if (!form.dob?.trim())        e.dob        = 'Required';
    return e;
  };

  const save = () => {
    const e = validate(); if (Object.keys(e).length) { setErr(e); return; }
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    onSave({
      id: item?.id || genId(),
      patientCode: item?.patientCode || nextPatientCode(patients),
      facilityId: form.facilityId || '', branchId: form.branchId || '',
      firstName: form.firstName!, lastName: form.lastName!, fullName,
      dob: form.dob!, dobCalendar: form.dobCalendar as DobCalendar || 'Gregorian',
      gender: form.gender as Gender || 'Male',
      mobile: form.mobile!, email: form.email,
      countryId: form.countryId || '', stateId: form.stateId || '', districtId: form.districtId || '',
      religionId: form.religionId, nationalityId: form.nationalityId,
      idTypeId: form.idTypeId, idNumber: form.idNumber,
      bloodGroup: form.bloodGroup as BloodGroup | undefined,
      registrationType: form.registrationType as RegistrationType || 'Regular',
      status: form.status as RecordStatus || 'Active',
      address: form.address, notes: form.notes,
      createdAt: item?.createdAt || now(), updatedAt: now(),
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {/* Section: Personal */}
        <div className="col-span-2 nm-inset px-3 py-1.5 rounded-xl">
          <span className="text-[10px] uppercase tracking-widest text-[#4361ee] font-normal">Personal Information</span>
        </div>

        <Field label="Registration Type" half>
          <Select value={form.registrationType || 'Regular'} onChange={e => set('registrationType', e.target.value)}
            options={['Regular','Temporary','Unknown'].map(v => ({ value: v, label: v }))} />
        </Field>
        <Field label="DOB Calendar" half>
          <Select value={form.dobCalendar || 'Gregorian'} onChange={e => set('dobCalendar', e.target.value)}
            options={['Gregorian','Hijri'].map(v => ({ value: v, label: v }))} />
        </Field>
        <Field label="First Name" required error={err.firstName} half>
          <Input value={form.firstName || ''} onChange={e => set('firstName', e.target.value)} error={!!err.firstName} />
        </Field>
        <Field label="Last Name" required error={err.lastName} half>
          <Input value={form.lastName || ''} onChange={e => set('lastName', e.target.value)} error={!!err.lastName} />
        </Field>
        <Field label="Date of Birth" required error={err.dob} half>
          <Input type="date" value={form.dob || ''} onChange={e => set('dob', e.target.value)} error={!!err.dob} />
        </Field>
        <Field label="Gender" half>
          <Select value={form.gender || 'Male'} onChange={e => set('gender', e.target.value)}
            options={['Male','Female','Other'].map(v => ({ value: v, label: v }))} />
        </Field>
        <Field label="Blood Group" half>
          <Select value={form.bloodGroup || ''} onChange={e => set('bloodGroup', e.target.value)}
            options={BLOOD_GROUPS.map(v => ({ value: v, label: v }))} />
        </Field>

        {/* Section: Contact */}
        <div className="col-span-2 nm-inset px-3 py-1.5 rounded-xl mt-1">
          <span className="text-[10px] uppercase tracking-widest text-[#4361ee] font-normal">Contact</span>
        </div>
        <Field label="Mobile" required error={err.mobile} half>
          <Input value={form.mobile || ''} onChange={e => set('mobile', e.target.value)} error={!!err.mobile} />
        </Field>
        <Field label="Email" half>
          <Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} />
        </Field>

        {/* Section: Location */}
        <div className="col-span-2 nm-inset px-3 py-1.5 rounded-xl mt-1">
          <span className="text-[10px] uppercase tracking-widest text-[#4361ee] font-normal">Location</span>
        </div>
        <Field label="Country" half>
          <SearchableSelect value={form.countryId || ''} onChange={v => { set('countryId', v); set('stateId', ''); set('districtId', ''); }}
            options={COUNTRIES.map(c => ({ value: c.id, label: c.name }))} />
        </Field>
        <Field label="State" half>
          <SearchableSelect value={form.stateId || ''} onChange={v => { set('stateId', v); set('districtId', ''); }}
            options={states.map(s => ({ value: s.id, label: s.name }))} />
        </Field>
        <Field label="District" half>
          <SearchableSelect value={form.districtId || ''} onChange={v => set('districtId', v)}
            options={districts.map(d => ({ value: d.id, label: d.name }))} />
        </Field>
        <Field label="Address" half>
          <Input value={form.address || ''} onChange={e => set('address', e.target.value)} />
        </Field>

        {/* Section: Identity */}
        <div className="col-span-2 nm-inset px-3 py-1.5 rounded-xl mt-1">
          <span className="text-[10px] uppercase tracking-widest text-[#4361ee] font-normal">Identity</span>
        </div>
        <Field label="Nationality" half>
          <SearchableSelect value={form.nationalityId || ''} onChange={v => set('nationalityId', v)}
            options={NATIONALITIES.map(n => ({ value: n.id, label: n.name }))} />
        </Field>
        <Field label="Religion" half>
          <SearchableSelect value={form.religionId || ''} onChange={v => set('religionId', v)}
            options={RELIGIONS.map(r => ({ value: r.id, label: r.name }))} />
        </Field>
        <Field label="ID Type" half>
          <SearchableSelect value={form.idTypeId || ''} onChange={v => set('idTypeId', v)}
            options={ID_TYPES.map(t => ({ value: t.id, label: t.name }))} />
        </Field>
        <Field label="ID Number" half>
          <Input value={form.idNumber || ''} onChange={e => set('idNumber', e.target.value)} />
        </Field>

        {/* Status & Notes */}
        <Field label="Status" half>
          <Select value={form.status || 'Active'} onChange={e => set('status', e.target.value)} options={STATUSES} />
        </Field>
        <Field label="Notes">
          <Input value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
        </Field>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <Btn onClick={onClose}>Discard</Btn>
        <Btn accent onClick={save}>{item ? 'Update' : 'Save'} & {item ? 'Update' : 'Generate UHID'}</Btn>
      </div>
    </>
  );
};

// ── Patient Detail ────────────────────────────────────────────────────────────
const PatientDetail: React.FC<{ patient: Patient; onClose: () => void }> = ({ patient, onClose }) => {
  const country    = COUNTRIES.find(c => c.id === patient.countryId);
  const state      = STATES.find(s => s.id === patient.stateId);
  const district   = DISTRICTS.find(d => d.id === patient.districtId);
  const religion   = RELIGIONS.find(r => r.id === patient.religionId);
  const nationality = NATIONALITIES.find(n => n.id === patient.nationalityId);
  const idType     = ID_TYPES.find(t => t.id === patient.idTypeId);

  const rows = [
    ['UHID', patient.patientCode], ['DOB', patient.dob], ['Gender', patient.gender],
    ['Blood Group', patient.bloodGroup || '—'], ['Mobile', patient.mobile], ['Email', patient.email || '—'],
    ['Country', country?.name || '—'], ['State', state?.name || '—'], ['District', district?.name || '—'],
    ['Address', patient.address || '—'], ['Nationality', nationality?.name || '—'],
    ['Religion', religion?.name || '—'], ['ID Type', idType?.name || '—'], ['ID Number', patient.idNumber || '—'],
  ];

  return (
    <Modal title={patient.fullName} onClose={onClose} wide>
      <div className="flex items-center gap-3 mb-4">
        <div className="nm-inset w-12 h-12 rounded-full flex items-center justify-center text-lg text-[#4361ee]">
          {patient.firstName.charAt(0)}
        </div>
        <div>
          <p className="font-normal text-sm">{patient.fullName}</p>
          <p className="text-[11px] text-[#4361ee]">{patient.patientCode}</p>
        </div>
        <div className="ml-auto"><StatusBadge status={patient.status} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {rows.map(([k, v]) => (
          <div key={k} className="nm-inset p-2.5 rounded-xl">
            <p className="text-[9px] uppercase opacity-40 mb-0.5">{k}</p>
            <p className="text-sm font-normal">{v}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// ── Patients Module ───────────────────────────────────────────────────────────
export const PatientsModule: React.FC<{
  patients: Patient[]; setPatients: (p: Patient[]) => void;
  user: UserSession; showToast: (m: string, t: 'success' | 'error') => void;
}> = ({ patients, setPatients, user, showToast }) => {
  const [search, setSearch]     = useState('');
  const [showReg, setShowReg]   = useState(false);
  const [editing, setEditing]   = useState<Patient | null>(null);
  const [detail, setDetail]     = useState<Patient | null>(null);

  const canRegister = ['SUPER_ADMIN','FACILITY_ADMIN','BRANCH_MANAGER','RECEPTION'].includes(user.roleType);

  const filtered = patients.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.patientCode.toLowerCase().includes(search.toLowerCase()) ||
    p.mobile.includes(search)
  );

  const savePatient = (p: Patient) => {
    const exists = patients.find(x => x.id === p.id);
    setPatients(exists ? patients.map(x => x.id === p.id ? p : x) : [...patients, p]);
    showToast(exists ? 'Patient updated successfully' : `Patient registered — ${p.patientCode}`, 'success');
    setShowReg(false); setEditing(null);
  };

  return (
    <div className="nm-flat p-4 rounded-2xl h-full flex flex-col gap-3 animate-fade-in">
      <PageHeader title="Patient Registry" subtitle={`${patients.length} total records`}>
        {canRegister && <Btn accent sm onClick={() => setShowReg(true)}><Plus size={13} /> New Registration</Btn>}
      </PageHeader>

      {/* Search */}
      <div className="nm-inset px-3 py-2 rounded-xl flex items-center gap-2">
        <Search size={14} className="opacity-40 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, UHID or mobile…"
          className="bg-transparent outline-none text-sm w-full font-normal" />
        {search && <button onClick={() => setSearch('')}><X size={13} className="opacity-40" /></button>}
      </div>

      <div className="flex-1 overflow-auto">
        {filtered.length === 0
          ? <Empty message="No patients found" />
          : <Table headers={['UHID','Name','Gender','Mobile','Blood','Status','Action']}>
              {filtered.map(p => (
                <TR key={p.id}>
                  <TD><span className="text-[#4361ee]">{p.patientCode}</span></TD>
                  <TD>{p.fullName}</TD>
                  <TD>{p.gender}</TD>
                  <TD>{p.mobile}</TD>
                  <TD><span className="nm-inset px-2 py-0.5 rounded-full text-[10px]">{p.bloodGroup || '—'}</span></TD>
                  <TD><StatusBadge status={p.status} /></TD>
                  <TD>
                    <div className="flex gap-1">
                      <Btn sm onClick={() => setDetail(p)}><Eye size={11} /> View</Btn>
                      {canRegister && <Btn sm onClick={() => setEditing(p)}><Pencil size={11} /></Btn>}
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
        }
      </div>

      <AnimatePresence>
        {(showReg || editing) && (
          <Modal title={editing ? 'Edit Patient' : 'New Patient Registration'} onClose={() => { setShowReg(false); setEditing(null); }} wide>
            <PatientForm item={editing || undefined} patients={patients} user={user} onSave={savePatient} onClose={() => { setShowReg(false); setEditing(null); }} />
          </Modal>
        )}
        {detail && <PatientDetail patient={detail} onClose={() => setDetail(null)} />}
      </AnimatePresence>
    </div>
  );
};
