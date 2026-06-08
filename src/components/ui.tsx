import React, { useState, useRef, useEffect } from 'react';
import { X, Search, CheckCircle, AlertCircle, ChevronDown, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { RecordStatus } from '../types';

// ── Btn ──────────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  accent?: boolean; danger?: boolean; sm?: boolean;
}
export const Btn: React.FC<BtnProps> = ({ children, accent, danger, sm, className = '', ...rest }) => {
  const base = sm ? 'px-3 py-1.5 text-[12px]' : 'px-4 py-2.5 text-sm';
  const variant = accent
    ? 'nm-button-accent'
    : danger
    ? 'bg-red-500 text-white border border-red-400 hover:bg-red-600'
    : 'nm-button';
  return (
    <button className={`${variant} ${base} rounded-xl font-normal transition-all disabled:opacity-40 flex items-center gap-1.5 ${className}`} {...rest}>
      {children}
    </button>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      className={`nm-card w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[92vh] flex flex-col rounded-2xl overflow-hidden`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 shrink-0">
        <h3 className="font-normal text-base text-black">{title}</h3>
        <button onClick={onClose} className="nm-button p-1.5 rounded-lg"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </motion.div>
  </div>
);

// ── FormField ─────────────────────────────────────────────────────────────────
export const Field: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode; half?: boolean }> = ({ label, required, error, children, half }) => (
  <div className={half ? 'col-span-1' : 'col-span-2'}>
    <label className="text-[10px] font-normal uppercase tracking-widest opacity-60 ml-1 block mb-1">
      {label}{required && <span className="text-[#4361ee] ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-[10px] mt-0.5 ml-1">{error}</p>}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }> = ({ error, className = '', ...rest }) => (
  <div className={`nm-inset px-3 py-2 rounded-xl ${error ? 'ring-2 ring-red-400' : ''}`}>
    <input className={`bg-transparent w-full outline-none text-sm font-normal ${className}`} {...rest} />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean; options: { value: string; label: string }[] }> = ({ error, options, className = '', ...rest }) => (
  <div className={`nm-inset px-3 py-2 rounded-xl relative ${error ? 'ring-2 ring-red-400' : ''}`}>
    <select className={`bg-transparent w-full outline-none text-sm font-normal appearance-none cursor-pointer pr-6 ${className}`} {...rest}>
      <option value="">Select…</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
  </div>
);

// ── SearchableSelect ──────────────────────────────────────────────────────────
export const SearchableSelect: React.FC<{
  options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
  placeholder?: string;
}> = ({ options, value, onChange, placeholder = 'Search…' }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
  const selected = options.find(o => o.value === value);
  return (
    <div ref={ref} className="relative">
      <div className="nm-inset px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <span className="text-sm font-normal flex-1 truncate opacity-80">{selected?.label || <span className="opacity-40">Select…</span>}</span>
        <ChevronDown size={12} className="opacity-40 shrink-0" />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute z-30 w-full mt-1 nm-card rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 p-2 border-b border-black/10">
              <Search size={12} className="opacity-40 shrink-0" />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder}
                className="bg-transparent outline-none text-xs w-full font-normal" />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0
                ? <p className="text-xs p-3 opacity-40 text-center">No results</p>
                : filtered.map(o => (
                  <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); setQ(''); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#4361ee]/5 hover:text-[#4361ee] transition-colors ${o.value === value ? 'text-[#4361ee] font-normal' : 'font-normal'}`}>
                    {o.label}
                  </button>
                ))
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Active:   'bg-green-50  text-green-700  border border-green-200',
  Inactive: 'bg-red-50    text-red-700    border border-red-200',
  Draft:    'bg-orange-50 text-orange-700 border border-orange-200',
  Archived: 'bg-gray-100  text-gray-500   border border-gray-200',
};
export const StatusBadge: React.FC<{ status: RecordStatus | string }> = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-normal ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
export const Toast: React.FC<{ msg: string; type: 'success' | 'error'; onClose: () => void }> = ({ msg, type, onClose }) => (
  <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
    className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl nm-card text-sm font-normal shadow-xl border ${type === 'success' ? 'border-green-200 text-green-800' : 'border-red-200 text-red-800'}`}>
    {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    <span>{msg}</span>
    <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X size={14} /></button>
  </motion.div>
);

// ── Page Header ───────────────────────────────────────────────────────────────
export const PageHeader: React.FC<{ title: string; subtitle?: string; children?: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="flex items-center justify-between mb-4 shrink-0">
    <div>
      <h2 className="text-base font-normal text-black">{title}</h2>
      {subtitle && <p className="text-[11px] opacity-50 mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const Empty: React.FC<{ message?: string }> = ({ message = 'No records found' }) => (
  <div className="py-12 text-center">
    <p className="text-sm opacity-30 font-normal">{message}</p>
  </div>
);

// ── Table ─────────────────────────────────────────────────────────────────────
export const Table: React.FC<{ headers: string[]; children: React.ReactNode }> = ({ headers, children }) => (
  <div className="overflow-auto rounded-xl nm-inset">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-black/10 text-left uppercase tracking-widest text-[9px] opacity-50">
          {headers.map(h => <th key={h} className="py-2 px-3 font-normal">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-black/5">{children}</tbody>
    </table>
  </div>
);

export const TR: React.FC<{ onClick?: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <tr onClick={onClick} className={`${onClick ? 'cursor-pointer hover:bg-[#8338ec]/5' : ''} transition-colors`}>{children}</tr>
);

export const TD: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td className={`py-2.5 px-3 font-normal ${className}`}>{children}</td>
);
