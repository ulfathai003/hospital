import React, { useState } from 'react';
import { Stethoscope, Plus, Pencil, Bed, Home, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Btn, Modal, Field, Input, Select, StatusBadge, PageHeader, Table, TR, TD, Empty } from './ui';
import { genId, now } from '../data/seed';
import type { RecordStatus } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────
export interface Specialization { id: string; name: string; status: RecordStatus; }
export interface Department { id: string; name: string; status: RecordStatus; }
export interface Ward { id: string; facilityId: string; name: string; type: string; capacity: number; status: RecordStatus; }

// ── CLINICAL MASTERS ──────────────────────────────────────────────────────────
export const ClinicalModule: React.FC<{
  user: any;
  showToast: (m: string, t: 'success' | 'error') => void;
}> = ({ user, showToast }) => {
  const [tab, setTab] = useState<'depts' | 'wards' | 'specs'>('depts');
  const [modal, setModal] = useState<any>(null);

  // Mock states for Phase 2 start
  const [depts, setDepts] = useState<Department[]>([
    { id: 'dp-1', name: 'Cardiology',    status: 'Active' },
    { id: 'dp-2', name: 'Neurology',     status: 'Active' },
    { id: 'dp-3', name: 'Pediatrics',    status: 'Active' },
    { id: 'dp-4', name: 'Orthopedics',   status: 'Active' },
    { id: 'dp-5', name: 'General Medicine', status: 'Active' },
  ]);

  const [wards, setWards] = useState<Ward[]>([
    { id: 'wd-1', facilityId: 'fc-1', name: 'General Ward A', type: 'General', capacity: 20, status: 'Active' },
    { id: 'wd-2', facilityId: 'fc-1', name: 'ICU 1',         type: 'Critical', capacity: 8,  status: 'Active' },
    { id: 'wd-3', facilityId: 'fc-1', name: 'Maternity Wing', type: 'Specialty', capacity: 12, status: 'Active' },
  ]);

  const TABS = [
    { id: 'depts', label: 'Departments', icon: Home },
    { id: 'wards', label: 'Wards & Beds', icon: Bed },
    { id: 'specs', label: 'Specializations', icon: Stethoscope },
  ] as const;

  return (
    <div className="nm-flat p-4 rounded-2xl h-full flex flex-col gap-3 animate-fade-in">
      <PageHeader title="Clinical Masters" subtitle="Setup departments, wards and medical specializations">
        <Btn accent sm onClick={() => setModal({ type: tab })}><Plus size={13} /> Add {tab.slice(0,-1)}</Btn>
      </PageHeader>

      <div className="flex gap-1 nm-inset p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-normal transition-all flex items-center gap-2 ${tab === t.id ? 'nm-flat text-[#4361ee]' : 'opacity-50 hover:opacity-80'}`}>
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'depts' && (
          <Table headers={['Department Name', 'Status', 'Actions']}>
            {depts.map(d => (
              <TR key={d.id}>
                <TD className="font-normal">{d.name}</TD>
                <TD><StatusBadge status={d.status} /></TD>
                <TD><Btn sm onClick={() => setModal(d)}><Pencil size={11} /></Btn></TD>
              </TR>
            ))}
          </Table>
        )}

        {tab === 'wards' && (
          <Table headers={['Ward Name', 'Type', 'Capacity', 'Status', 'Actions']}>
            {wards.map(w => (
              <TR key={w.id}>
                <TD className="font-normal">{w.name}</TD>
                <TD>{w.type}</TD>
                <TD>{w.capacity} Beds</TD>
                <TD><StatusBadge status={w.status} /></TD>
                <TD><Btn sm onClick={() => setModal(w)}><Pencil size={11} /></Btn></TD>
              </TR>
            ))}
          </Table>
        )}

        {tab === 'specs' && <Empty message="No specializations configured yet." />}
      </div>

      <AnimatePresence>
        {modal && (
          <Modal title={`${modal.id ? 'Edit' : 'Add'} ${tab.slice(0,-1)}`} onClose={() => setModal(null)}>
             <div className="space-y-4">
                <Field label="Name" required>
                   <Input defaultValue={modal.name || ''} placeholder={`e.g. ${tab === 'depts' ? 'Cardiology' : 'Floor 1'}`} />
                </Field>
                {tab === 'wards' && (
                   <>
                    <Field label="Type" half>
                       <Select options={[{value:'General',label:'General'},{value:'ICU',label:'ICU'},{value:'Emergency',label:'Emergency'}]} />
                    </Field>
                    <Field label="Capacity" half>
                       <Input type="number" defaultValue={modal.capacity || 0} />
                    </Field>
                   </>
                )}
                <Field label="Status">
                   <Select defaultValue={modal.status || 'Active'} options={[{value:'Active',label:'Active'},{value:'Inactive',label:'Inactive'}]} />
                </Field>
                <div className="flex justify-end gap-2 pt-4">
                   <Btn onClick={() => setModal(null)}>Cancel</Btn>
                   <Btn accent onClick={() => { showToast('Saved successfully', 'success'); setModal(null); }}>Save Changes</Btn>
                </div>
             </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};
