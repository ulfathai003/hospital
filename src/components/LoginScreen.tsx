import React, { useState } from 'react';
import { Hospital, Eye, EyeOff, AlertCircle, ChevronDown, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { USERS, COMPANIES, FACILITIES, BRANCHES } from '../data/seed';
import type { UserSession } from '../types';
import { Btn, SearchableSelect } from './ui';

interface Props { onLogin: (s: UserSession) => void; }

const ROLE_TABS = [
  { type: 'PATIENT', label: 'Patient' },
  { type: 'STAFF',   label: 'Staff'   },
] as const;

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [userType, setUserType] = useState<'PATIENT' | 'STAFF'>('PATIENT');
  const [companyId,  setCompanyId]  = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [branchId,   setBranchId]   = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const companyOpts  = COMPANIES.map(c => ({ value: c.id, label: `${c.companyCode} — ${c.companyName}` }));
  const facilityOpts = FACILITIES.filter(f => !companyId || f.companyId === companyId).map(f => ({ value: f.id, label: `${f.facilityCode} — ${f.facilityName}` }));
  const branchOpts   = BRANCHES.filter(b => !facilityId || b.facilityId === facilityId).map(b => ({ value: b.id, label: `${b.branchCode} — ${b.branchName}` }));

  const handleLogin = () => {
    setError('');
    if (userType === 'STAFF' && (!companyId || !facilityId || !branchId)) {
      setError('Please select Company, Facility, and Branch.'); return;
    }
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.password === password);
      if (!user) { setError('Invalid credentials. Please try again.'); setLoading(false); return; }
      if (userType === 'PATIENT' && user.roleType !== 'PATIENT') {
        setError('This account is not a patient account.'); setLoading(false); return;
      }
      if (userType === 'STAFF' && user.roleType === 'PATIENT') {
        setError('Please use Patient login for patient accounts.'); setLoading(false); return;
      }
      onLogin({ id: user.id, email: user.email, fullName: user.fullName, roleType: user.roleType,
        companyId: companyId || user.companyId, facilityId: facilityId || user.facilityId,
        branchId: branchId || user.branchId, uhid: user.uhid });
      setLoading(false);
    }, 600);
  };

  const demoStaff   = USERS.filter(u => u.roleType !== 'PATIENT');
  const demoPatient = USERS.filter(u => u.roleType === 'PATIENT');

  const loginAsSuperAdmin = () => {
    const admin = USERS.find(u => u.roleType === 'SUPER_ADMIN');
    if (admin) {
      setEmail(admin.email);
      setPassword(admin.password);
      setUserType('STAFF');
      setCompanyId(''); // Super admin doesn't need these filtered
      setFacilityId('');
      setBranchId('');
      // We trigger the actual login from here
      onLogin({ id: admin.id, email: admin.email, fullName: admin.fullName, roleType: admin.roleType });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-nm-bg) p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="nm-card w-full max-w-sm rounded-3xl p-7">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex nm-inset p-4 rounded-full mb-3">
            <Hospital size={40} className="text-[#4361ee]" />
          </div>
          <h1 className="text-2xl font-normal text-black tracking-tight">iMAT.H1</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-40 mt-0.5">Enterprise Clinical Gateway</p>
        </div>

        {/* Super Admin Shortcut */}
        <button onClick={loginAsSuperAdmin}
          className="w-full mb-4 nm-flat py-3 rounded-xl border border-[#4361ee]/20 text-[#4361ee] text-xs font-normal flex items-center justify-center gap-2 hover:-translate-y-px transition-all active:nm-inset">
          <UserCheck size={14} />
          Sign Internally as Super Admin
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="absolute w-full h-px bg-black/5"></div>
          <span className="relative px-3 bg-(--color-nm-bg) text-[9px] uppercase tracking-widest opacity-30">or choose category</span>
        </div>

        {/* User Type Tabs */}
        <div className="grid grid-cols-2 nm-inset p-1 rounded-xl mb-5 gap-1">
          {ROLE_TABS.map(t => (
            <button key={t.type} onClick={() => { setUserType(t.type); setError(''); }}
              className={`py-2 rounded-lg text-xs font-normal transition-all ${userType === t.type ? 'nm-flat text-[#4361ee]' : 'opacity-50 hover:opacity-80'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {/* Staff-only: Company → Facility → Branch */}
          {userType === 'STAFF' && (
            <>
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-50 ml-1 block mb-1">Company</label>
                <SearchableSelect options={companyOpts} value={companyId} onChange={v => { setCompanyId(v); setFacilityId(''); setBranchId(''); }} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-50 ml-1 block mb-1">Facility</label>
                <SearchableSelect options={facilityOpts} value={facilityId} onChange={v => { setFacilityId(v); setBranchId(''); }} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-50 ml-1 block mb-1">Branch</label>
                <SearchableSelect options={branchOpts} value={branchId} onChange={setBranchId} />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-50 ml-1 block mb-1">Email</label>
            <div className="nm-inset px-4 py-3 rounded-xl">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="your@email.com"
                className="bg-transparent w-full outline-none text-sm font-normal" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-50 ml-1 block mb-1">Password</label>
            <div className="nm-inset px-4 py-3 rounded-xl flex items-center gap-2">
              <input type={showPwd ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="bg-transparent flex-1 outline-none text-sm font-normal" />
              <button onClick={() => setShowPwd(!showPwd)} className="opacity-40 hover:opacity-80">
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="nm-inset px-3 py-2.5 rounded-xl border-l-4 border-black/30 flex items-center gap-2 text-xs text-black">
              <AlertCircle size={14} className="shrink-0 opacity-60" /> {error}
            </div>
          )}

          <Btn accent onClick={handleLogin} disabled={loading} className="w-full justify-center py-4 text-sm rounded-2xl">
            {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : `Sign In as ${userType === 'STAFF' ? 'Staff' : 'Patient'}`}
          </Btn>
        </div>

        {/* Demo hints */}
        <div className="mt-5 nm-inset p-3 rounded-xl">
          <p className="text-[9px] uppercase opacity-40 mb-2">{userType === 'STAFF' ? 'Staff' : 'Patient'} Demo Accounts</p>
          <div className="grid grid-cols-2 gap-1">
            {(userType === 'STAFF' ? demoStaff : demoPatient).map(u => (
              <button key={u.id} onClick={() => { setEmail(u.email); setPassword(u.password); }}
                className="nm-flat p-1.5 rounded-lg text-left hover:border hover:border-[#4361ee]/20 transition-all">
                <p className="text-[10px] font-normal truncate">{u.fullName}</p>
                <p className="text-[9px] opacity-40">{u.roleType.replace(/_/g,' ')}</p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
