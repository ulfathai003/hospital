import React, { useState } from 'react';
import { Building2, Plus, Pencil, ChevronRight, ChevronDown, List, Globe, Hash } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { COMPANIES, FACILITIES, BRANCHES, nextCompanyCode, nextFacilityCode, genId, now } from '../data/seed';
import type { Company, Facility, Branch, RecordStatus, DatabaseState, UserSession, MasterRecord } from '../types';
import { Btn, Modal, Field, Input, Select, SearchableSelect, StatusBadge, PageHeader, Table, TR, TD, Empty } from './ui';

interface Props { db: DatabaseState; setDb: (d: DatabaseState) => void; user: UserSession; showToast: (m: string, t: 'success' | 'error') => void; }

const STATUSES: { value: RecordStatus; label: string }[] = [
  { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' },
  { value: 'Draft', label: 'Draft' },   { value: 'Archived', label: 'Archived' },
];

// ── MASTER RECORD FORM (Generic for Religion, Nationality, ID Types) ─────────────
const MasterRecordForm: React.FC<{ item?: MasterRecord; onSave: (r: MasterRecord) => void; onClose: () => void; label: string }> = ({ item, onSave, onClose, label }) => {
  const [form, setForm] = useState<Partial<MasterRecord>>(item || { status: 'Active' });
  const [err, setErr] = useState<Record<string, string>>({});
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = 'Name is required';
    return e;
  };
  const save = () => {
    const e = validate(); if (Object.keys(e).length) { setErr(e); return; }
    onSave({
      id: item?.id || genId(),
      name: form.name!,
      status: form.status as RecordStatus || 'Active',
      createdAt: item?.createdAt || now(),
      updatedAt: now(),
    });
  };
  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        <Field label={`${label} Name`} required error={err.name}>
          <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} error={!!err.name} placeholder={`e.g. ${label}...`} />
        </Field>
        <Field label="Status">
          <Select value={form.status || 'Active'} onChange={e => setForm({ ...form, status: e.target.value as RecordStatus })} options={STATUSES} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn accent onClick={save}>{item ? 'Update' : 'Create'} {label}</Btn>
      </div>
    </>
  );
};

// ── COMPANY MASTER ────────────────────────────────────────────────────────────
const CompanyForm: React.FC<{ item?: Company; db: DatabaseState; onSave: (c: Company) => void; onClose: () => void }> = ({ item, db, onSave, onClose }) => {
  const [form, setForm] = useState<Partial<Company>>(item || { status: 'Active' });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof Company, v: any) => setForm(f => ({ ...f, [k]: v }));
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.companyName?.trim()) e.companyName = 'Company name is required';
    return e;
  };
  const save = () => {
    const e = validate(); if (Object.keys(e).length) { setErr(e); return; }
    const obj: Company = {
      id: item?.id || genId(),
      companyCode: item?.companyCode || nextCompanyCode(db.companies),
      companyName: form.companyName!,
      status: form.status as RecordStatus || 'Active',
      createdAt: item?.createdAt || now(),
      updatedAt: now(),
    };
    onSave(obj);
  };
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company Code" half><Input value={form.companyCode || nextCompanyCode(db.companies)} disabled /></Field>
        <Field label="Company Name" required error={err.companyName} half>
          <Input value={form.companyName || ''} onChange={e => set('companyName', e.target.value)} error={!!err.companyName} placeholder="e.g. HealthCare Group" />
        </Field>
        <Field label="Status" half>
          <Select value={form.status || 'Active'} onChange={e => set('status', e.target.value)} options={STATUSES} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn accent onClick={save}>{item ? 'Update' : 'Create'} Company</Btn>
      </div>
    </>
  );
};

// ── FACILITY FORM ─────────────────────────────────────────────────────────────
import { COUNTRIES, STATES, DISTRICTS } from '../data/seed';
const BRANCH_TYPES = ['Hospital','Clinic','Diagnostic Center','Pharmacy','Laboratory'].map(v => ({ value: v, label: v }));

const FacilityForm: React.FC<{ item?: Facility; db: DatabaseState; onSave: (f: Facility) => void; onClose: () => void }> = ({ item, db, onSave, onClose }) => {
  const [form, setForm] = useState<Partial<Facility>>(item || { status: 'Active' });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof Facility, v: any) => setForm(f => ({ ...f, [k]: v }));
  const states    = STATES.filter(s => !form.countryId || s.countryId === form.countryId);
  const districts = DISTRICTS.filter(d => !form.stateId || d.stateId === form.stateId);
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.facilityName?.trim())  e.facilityName = 'Required';
    if (!form.companyId)              e.companyId    = 'Required';
    return e;
  };
  const save = () => {
    const e = validate(); if (Object.keys(e).length) { setErr(e); return; }
    onSave({
      id: item?.id || genId(), facilityCode: item?.facilityCode || nextFacilityCode(db.facilities),
      companyId: form.companyId!, facilityName: form.facilityName!,
      countryId: form.countryId || '', stateId: form.stateId || '', districtId: form.districtId || '',
      city: form.city || '', address: form.address || '', email: form.email || '',
      phone: form.phone || '', gstNo: form.gstNo || '', branchType: form.branchType || '',
      status: form.status as RecordStatus || 'Active',
      startDate: form.startDate || '', endDate: form.endDate,
      createdAt: item?.createdAt || now(), updatedAt: now(),
    });
  };
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Facility Code" half><Input value={form.facilityCode || nextFacilityCode(db.facilities)} disabled /></Field>
        <Field label="Facility Name" required error={err.facilityName} half>
          <Input value={form.facilityName || ''} onChange={e => set('facilityName', e.target.value)} error={!!err.facilityName} />
        </Field>
        <Field label="Company" required error={err.companyId} half>
          <SearchableSelect value={form.companyId || ''} onChange={v => set('companyId', v)}
            options={db.companies.map(c => ({ value: c.id, label: c.companyName }))} />
        </Field>
        <Field label="Branch Type" half>
          <Select value={form.branchType || ''} onChange={e => set('branchType', e.target.value)} options={BRANCH_TYPES} />
        </Field>
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
        <Field label="City" half><Input value={form.city || ''} onChange={e => set('city', e.target.value)} /></Field>
        <Field label="Address"><Input value={form.address || ''} onChange={e => set('address', e.target.value)} /></Field>
        <Field label="Email" half><Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} /></Field>
        <Field label="Phone" half><Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></Field>
        <Field label="GST No" half><Input value={form.gstNo || ''} onChange={e => set('gstNo', e.target.value)} /></Field>
        <Field label="Status" half>
          <Select value={form.status || 'Active'} onChange={e => set('status', e.target.value)} options={STATUSES} />
        </Field>
        <Field label="Start Date" half><Input type="date" value={form.startDate || ''} onChange={e => set('startDate', e.target.value)} /></Field>
        <Field label="End Date" half><Input type="date" value={form.endDate || ''} onChange={e => set('endDate', e.target.value)} /></Field>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn accent onClick={save}>{item ? 'Update' : 'Create'} Facility</Btn>
      </div>
    </>
  );
};

// ── TREE VIEW ─────────────────────────────────────────────────────────────────
const TreeNode: React.FC<{ company: Company; db: DatabaseState; onEditFacility: (f: Facility) => void }> = ({ company, db, onEditFacility }) => {
  const [open, setOpen] = useState(true);
  const facilities = db.facilities.filter(f => f.companyId === company.id);
  return (
    <div className="mb-2">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 w-full p-2.5 rounded-xl hover:bg-[#4361ee]/5 transition-colors text-left font-normal">
        {open ? <ChevronDown size={14} className="text-[#4361ee] shrink-0" /> : <ChevronRight size={14} className="opacity-40 shrink-0" />}
        <Building2 size={14} className="text-[#4361ee] shrink-0" />
        <span className="text-xs">{company.companyCode} — {company.companyName}</span>
        <StatusBadge status={company.status} />
        <span className="ml-auto text-[10px] opacity-40">{facilities.length} facilities</span>
      </button>
      {open && facilities.length > 0 && (
        <div className="ml-6 border-l border-black/10 pl-3 mt-0.5 space-y-0.5">
          {facilities.map(f => {
            const branches = db.branches.filter(b => b.facilityId === f.id);
            return (
              <div key={f.id}>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#8338ec]/5 transition-colors">
                  <span className="text-xs font-normal flex-1">{f.facilityCode} — {f.facilityName}</span>
                  <StatusBadge status={f.status} />
                  <span className="text-[10px] opacity-40">{branches.length} branches</span>
                  <button onClick={() => onEditFacility(f)} className="nm-button p-1 rounded-lg opacity-60 hover:opacity-100 hover:text-[#4361ee]"><Pencil size={11} /></button>
                </div>
                {branches.map(b => (
                  <div key={b.id} className="ml-5 flex items-center gap-2 p-1.5 rounded-lg">
                    <span className="text-[11px] opacity-60">↳ {b.branchCode} — {b.branchName}</span>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── MASTER MODULE ─────────────────────────────────────────────────────────────
type Tab = 'company' | 'facility' | 'branch' | 'religions' | 'nationalities' | 'idTypes';

export const MasterModule: React.FC<Props> = ({ db, setDb, user, showToast }) => {
  const [tab, setTab] = useState<Tab>('company');
  const [companyModal, setCompanyModal] = useState<Company | null | true>(null);
  const [facilityModal, setFacilityModal] = useState<Facility | null | true>(null);
  const [masterModal, setMasterModal] = useState<{ item?: MasterRecord; label: string; key: 'religions' | 'nationalities' | 'idTypes' } | null>(null);

  const isSuperAdmin = user.roleType === 'SUPER_ADMIN';

  const saveCompany = (c: Company) => {
    const exists = db.companies.find(x => x.id === c.id);
    const companies = exists ? db.companies.map(x => x.id === c.id ? c : x) : [...db.companies, c];
    setDb({ ...db, companies });
    showToast(exists ? 'Company updated' : 'Company created', 'success');
    setCompanyModal(null);
  };

  const saveFacility = (f: Facility) => {
    const exists = db.facilities.find(x => x.id === f.id);
    const facilities = exists ? db.facilities.map(x => x.id === f.id ? f : x) : [...db.facilities, f];
    setDb({ ...db, facilities });
    showToast(exists ? 'Facility updated' : 'Facility created', 'success');
    setFacilityModal(null);
  };

  const saveMaster = (r: MasterRecord, key: 'religions' | 'nationalities' | 'idTypes') => {
    const list = db[key] || [];
    const exists = list.find(x => x.id === r.id);
    const updated = exists ? list.map(x => x.id === r.id ? r : x) : [...list, r];
    setDb({ ...db, [key]: updated });
    showToast(`${masterModal?.label} saved`, 'success');
    setMasterModal(null);
  };

  const TABS = [
    { id: 'company', label: 'Companies', icon: Building2 },
    { id: 'facility', label: 'Facilities', icon: ChevronRight },
    { id: 'branch', label: 'Branches', icon: List },
    ...(isSuperAdmin ? [
      { id: 'religions', label: 'Religions', icon: Globe },
      { id: 'nationalities', label: 'Nationalities', icon: Globe },
      { id: 'idTypes', label: 'ID Types', icon: Hash },
    ] as const : []),
  ];

  const renderMasterTable = (key: 'religions' | 'nationalities' | 'idTypes', label: string) => {
    const list = db[key] || [];
    return list.length === 0 ? <Empty /> : (
      <Table headers={['Name', 'Status', 'Created', 'Actions']}>
        {list.map(r => (
          <TR key={r.id}>
            <TD>{r.name}</TD>
            <TD><StatusBadge status={r.status} /></TD>
            <TD>{r.createdAt.slice(0, 10)}</TD>
            <TD><Btn sm onClick={() => setMasterModal({ item: r, label, key })}><Pencil size={11} /> Edit</Btn></TD>
          </TR>
        ))}
      </Table>
    );
  };

  return (
    <div className="nm-flat p-4 rounded-2xl h-full flex flex-col gap-3 animate-fade-in">
      <PageHeader title="Organisation Master" subtitle="Manage hierarchy and system metadata">
        {tab === 'company'  && <Btn accent sm onClick={() => setCompanyModal(true)}><Plus size={13} /> Add Company</Btn>}
        {tab === 'facility' && <Btn accent sm onClick={() => setFacilityModal(true)}><Plus size={13} /> Add Facility</Btn>}
        {tab === 'religions' && <Btn accent sm onClick={() => setMasterModal({ label: 'Religion', key: 'religions' })}><Plus size={13} /> Add Religion</Btn>}
        {tab === 'nationalities' && <Btn accent sm onClick={() => setMasterModal({ label: 'Nationality', key: 'nationalities' })}><Plus size={13} /> Add Nationality</Btn>}
        {tab === 'idTypes' && <Btn accent sm onClick={() => setMasterModal({ label: 'ID Type', key: 'idTypes' })}><Plus size={13} /> Add ID Type</Btn>}
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 nm-inset p-1 rounded-xl w-fit overflow-x-auto max-w-full">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-normal transition-all whitespace-nowrap ${tab === t.id ? 'nm-flat text-[#4361ee]' : 'opacity-50 hover:opacity-80'}`}>
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'company' && (
          db.companies.length === 0 ? <Empty /> :
          <Table headers={['Code', 'Name', 'Status', 'Created', 'Actions']}>
            {db.companies.map(c => (
              <TR key={c.id}>
                <TD><span className="text-[#4361ee]">{c.companyCode}</span></TD>
                <TD>{c.companyName}</TD>
                <TD><StatusBadge status={c.status} /></TD>
                <TD>{c.createdAt.slice(0,10)}</TD>
                <TD><Btn sm onClick={() => setCompanyModal(c)}><Pencil size={11} /> Edit</Btn></TD>
              </TR>
            ))}
          </Table>
        )}

        {tab === 'facility' && (
          <div className="nm-inset p-3 rounded-xl">
            {db.companies.length === 0
              ? <Empty message="No companies yet. Create a company first." />
              : db.companies.map(c => (
                <TreeNode key={c.id} company={c} db={db} onEditFacility={f => setFacilityModal(f)} />
              ))
            }
          </div>
        )}

        {tab === 'branch' && (
          db.branches.length === 0 ? <Empty /> :
          <Table headers={['Code', 'Facility', 'Branch Name', 'Status', 'Created']}>
            {db.branches.map(b => {
              const fac = db.facilities.find(f => f.id === b.facilityId);
              return (
                <TR key={b.id}>
                  <TD><span className="text-[#4361ee]">{b.branchCode}</span></TD>
                  <TD>{fac?.facilityName || '—'}</TD>
                  <TD>{b.branchName}</TD>
                  <TD><StatusBadge status={b.status} /></TD>
                  <TD>{b.createdAt.slice(0,10)}</TD>
                </TR>
              );
            })}
          </Table>
        )}

        {tab === 'religions' && renderMasterTable('religions', 'Religion')}
        {tab === 'nationalities' && renderMasterTable('nationalities', 'Nationality')}
        {tab === 'idTypes' && renderMasterTable('idTypes', 'ID Type')}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {companyModal && (
          <Modal title={companyModal === true ? 'Add Company' : 'Edit Company'} onClose={() => setCompanyModal(null)}>
            <CompanyForm item={companyModal === true ? undefined : companyModal as Company} db={db} onSave={saveCompany} onClose={() => setCompanyModal(null)} />
          </Modal>
        )}
        {facilityModal && (
          <Modal title={facilityModal === true ? 'Add Facility' : 'Edit Facility'} onClose={() => setFacilityModal(null)} wide>
            <FacilityForm item={facilityModal === true ? undefined : facilityModal as Facility} db={db} onSave={saveFacility} onClose={() => setFacilityModal(null)} />
          </Modal>
        )}
        {masterModal && (
          <Modal title={`${masterModal.item ? 'Edit' : 'Add'} ${masterModal.label}`} onClose={() => setMasterModal(null)}>
            <MasterRecordForm item={masterModal.item} label={masterModal.label} onSave={(r) => saveMaster(r, masterModal.key)} onClose={() => setMasterModal(null)} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};
