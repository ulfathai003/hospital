import React, { useState, useEffect } from 'react';
import {
  Hospital, LayoutDashboard, Users, Building2, Settings,
  Bell, LogOut, Calendar, Stethoscope, FlaskConical,
  CreditCard, Package, TrendingUp, Activity, BarChart3, UserCheck
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { LoginScreen }    from './components/LoginScreen';
import { MasterModule }   from './components/MasterModule';
import { PatientsModule } from './components/PatientsModule';
import { Toast }          from './components/ui';

import {
  COMPANIES, FACILITIES, BRANCHES, INITIAL_PATIENTS
} from './data/seed';
import type { UserSession, Patient, Company, Facility, Branch } from './types';

// ── Types ────────────────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'patients' | 'master' | 'appointments' | 'emr' | 'lab' | 'pharmacy' | 'billing' | 'crm' | 'admin';

interface DB { companies: Company[]; facilities: Facility[]; branches: Branch[]; }

// ── Nav config by role ────────────────────────────────────────────────────────
const NAV: Record<string, { id: Tab; icon: any; label: string }[]> = {
  SUPER_ADMIN: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'    },
    { id:'patients',     icon:Users,           label:'Patients'     },
    { id:'master',       icon:Building2,       label:'Organisation' },
    { id:'appointments', icon:Calendar,        label:'Appointments' },
    { id:'emr',          icon:Stethoscope,     label:'Clinical EMR' },
    { id:'lab',          icon:FlaskConical,    label:'Laboratory'   },
    { id:'pharmacy',     icon:Package,         label:'Pharmacy'     },
    { id:'billing',      icon:CreditCard,      label:'Billing'      },
    { id:'crm',          icon:TrendingUp,      label:'CRM Leads'    },
    { id:'admin',        icon:Settings,        label:'Admin'        },
  ],
  COMPANY_ADMIN: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'    },
    { id:'master',       icon:Building2,       label:'Organisation' },
    { id:'patients',     icon:Users,           label:'Patients'     },
  ],
  FACILITY_ADMIN: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'    },
    { id:'patients',     icon:Users,           label:'Patients'     },
    { id:'master',       icon:Building2,       label:'Facilities'   },
    { id:'appointments', icon:Calendar,        label:'Appointments' },
  ],
  BRANCH_MANAGER: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'    },
    { id:'patients',     icon:Users,           label:'Patients'     },
    { id:'appointments', icon:Calendar,        label:'Appointments' },
  ],
  RECEPTION: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'    },
    { id:'patients',     icon:Users,           label:'Patients'     },
    { id:'appointments', icon:Calendar,        label:'Appointments' },
  ],
  STAFF: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'    },
    { id:'patients',     icon:Users,           label:'Patients'     },
  ],
  DOCTOR: [
    { id:'dashboard',    icon:LayoutDashboard, label:'Dashboard'    },
    { id:'patients',     icon:Users,           label:'My Patients'  },
    { id:'emr',          icon:Stethoscope,     label:'Clinical EMR' },
    { id:'lab',          icon:FlaskConical,    label:'Lab Orders'   },
  ],
  PATIENT: [
    { id:'dashboard',    icon:LayoutDashboard, label:'My Portal'    },
    { id:'appointments', icon:Calendar,        label:'Appointments' },
    { id:'lab',          icon:FlaskConical,    label:'My Reports'   },
    { id:'billing',      icon:CreditCard,      label:'My Bills'     },
  ],
};

// ── Dashboard KPIs ────────────────────────────────────────────────────────────
const DashboardModule: React.FC<{ user: UserSession; patients: Patient[]; setTab: (t: Tab) => void }> = ({ user, patients, setTab }) => {
  const kpis = user.roleType === 'PATIENT'
    ? [
        { label:'My UHID', value: user.uhid || '—', icon: UserCheck },
        { label:'Appointments', value:'2', icon: Calendar },
        { label:'Lab Results', value:'1', icon: FlaskConical },
        { label:'Outstanding', value:'₹2,400', icon: CreditCard },
      ]
    : [
        { label:'Total Patients', value: String(patients.length), icon: Users },
        { label:'Active OPDs',    value:'42',    icon: Activity },
        { label:'Beds Occupied',  value:'18/45', icon: Hospital },
        { label:'Revenue Today',  value:'₹42,500', icon: BarChart3 },
      ];

  return (
    <div className="nm-flat p-4 rounded-2xl h-full flex flex-col gap-4 animate-fade-in">
      <div>
        <h2 className="text-base font-normal text-black">
          {user.roleType === 'PATIENT' ? 'My Health Portal' : 'Hospital Command Center'}
        </h2>
        <p className="text-[11px] opacity-40 mt-0.5">Welcome back, {user.fullName}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className="nm-inset p-4 rounded-xl">
            <k.icon size={18} className="text-[#4361ee] mb-2" />
            <p className="text-xl font-normal">{k.value}</p>
            <p className="text-[10px] opacity-50 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>
      {user.roleType !== 'PATIENT' && (
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="nm-inset p-3 rounded-xl flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-widest opacity-50">Recent Registrations</p>
              <button onClick={() => setTab('patients')} className="nm-button px-2 py-1 rounded-lg text-[10px] hover:text-[#4361ee] transition-colors">
                View All →
              </button>
            </div>
            <div className="space-y-1 flex-1 overflow-auto">
              {patients.slice(0,5).map(p => (
                <div key={p.id} className="nm-flat p-2 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <p className="font-normal">{p.fullName}</p>
                    <p className="opacity-40 text-[10px]">{p.patientCode}</p>
                  </div>
                  <span className="text-[#4361ee] text-[10px]">{p.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="nm-inset p-3 rounded-xl flex flex-col">
            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-2">System Status</p>
            {[
              { label:'Database',    status:'Online' },
              { label:'API Gateway', status:'Online' },
              { label:'Auth Server', status:'Online' },
              { label:'Scheduler',   status:'Running' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-black/5 last:border-0 text-xs">
                <span className="opacity-60">{s.label}</span>
                <span className="text-green-600 text-[10px]">● {s.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Placeholder ───────────────────────────────────────────────────────────────
const Placeholder: React.FC<{ label: string; icon: any }> = ({ label, icon: Icon }) => (
  <div className="nm-flat h-full rounded-2xl flex flex-col items-center justify-center gap-3 animate-fade-in">
    <div className="nm-inset p-8 rounded-full"><Icon size={48} className="opacity-20" /></div>
    <p className="text-base font-normal opacity-30">{label}</p>
    <p className="text-xs opacity-20 max-w-xs text-center">Module is wired to backend. UI deployment in progress.</p>
  </div>
);

// ── Loading ───────────────────────────────────────────────────────────────────
const Loading = () => (
  <div className="h-screen flex flex-col items-center justify-center gap-4">
    <div className="nm-flat p-8 rounded-full">
      <Hospital size={44} className="text-[#4361ee] animate-pulse" />
    </div>
    <p className="text-sm font-normal text-[#4361ee] tracking-widest animate-pulse">LOADING iMAT.H1…</p>
  </div>
);

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user,     setUser]     = useState<UserSession | null>(null);
  const [tab,      setTab]      = useState<Tab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [db,       setDb]       = useState<DB>({ companies: COMPANIES, facilities: FACILITIES, branches: BRANCHES });
  const [toast,    setToast]    = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [booting,  setBooting]  = useState(true);

  useEffect(() => { setTimeout(() => setBooting(false), 900); }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = (s: UserSession) => {
    setUser(s); setTab('dashboard');
    showToast(`Welcome, ${s.fullName}!`, 'success');
  };

  const handleLogout = () => { setUser(null); setTab('dashboard'); };

  if (booting) return <Loading />;
  if (!user) return (
    <>
      <LoginScreen onLogin={handleLogin} />
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
    </>
  );

  const navItems = NAV[user.roleType] || NAV.STAFF;

  const renderModule = () => {
    switch (tab) {
      case 'dashboard':    return <DashboardModule user={user} patients={patients} setTab={setTab} />;
      case 'patients':     return <PatientsModule patients={patients} setPatients={setPatients} user={user} showToast={showToast} />;
      case 'master':       return <MasterModule db={db} setDb={setDb} showToast={showToast} />;
      case 'appointments': return <Placeholder label="Appointments" icon={Calendar} />;
      case 'emr':          return <Placeholder label="Clinical EMR" icon={Stethoscope} />;
      case 'lab':          return <Placeholder label="Laboratory" icon={FlaskConical} />;
      case 'pharmacy':     return <Placeholder label="Pharmacy" icon={Package} />;
      case 'billing':      return <Placeholder label="Billing" icon={CreditCard} />;
      case 'crm':          return <Placeholder label="CRM Leads" icon={TrendingUp} />;
      case 'admin':        return <Placeholder label="Admin Control" icon={Settings} />;
      default:             return <DashboardModule user={user} patients={patients} setTab={setTab} />;
    }
  };

  return (
    <div className="h-screen flex p-2 gap-2 overflow-hidden bg-[var(--color-nm-bg)]">
      {/* Sidebar */}
      <nav className="nm-flat w-[66px] lg:w-[175px] rounded-2xl flex flex-col p-2 shrink-0">
        <div className="flex items-center gap-2 px-2 py-3 mb-3">
          <div className="nm-inset p-2 rounded-xl text-[#4361ee] shrink-0"><Hospital size={20} /></div>
          <div className="hidden lg:block overflow-hidden">
            <p className="font-normal text-base text-black tracking-tight leading-none">iMAT.H1</p>
            <p className="text-[9px] opacity-30 uppercase leading-none mt-0.5">HMS v2</p>
          </div>
        </div>

        <div className="flex-1 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 transition-all text-left font-normal text-xs ${
                tab === item.id
                  ? 'nm-inset text-[#4361ee]'
                  : 'opacity-50 hover:opacity-90 hover:text-[#8338ec]'
              }`}>
              <item.icon size={16} className="shrink-0" />
              <span className="hidden lg:block truncate">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-2 nm-inset p-2 rounded-xl hidden lg:block mb-1">
          <p className="text-[10px] font-normal truncate">{user.fullName}</p>
          <p className="text-[9px] text-[#4361ee] opacity-70">{user.roleType.replace(/_/g,' ')}</p>
        </div>
        <button onClick={handleLogout}
          className="p-2.5 rounded-xl nm-button text-[#4361ee] font-normal flex items-center gap-2.5 hover:opacity-90 transition-all text-xs">
          <LogOut size={16} className="shrink-0" />
          <span className="hidden lg:block">Sign Out</span>
        </button>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="nm-flat h-[54px] rounded-2xl flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-normal text-sm text-black uppercase tracking-widest">
              {navItems.find(m => m.id === tab)?.label || 'Dashboard'}
            </h2>
            <div className="hidden md:flex items-center gap-1.5 nm-inset px-3 py-1 rounded-full text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="opacity-50 font-normal">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="nm-button p-2 rounded-full relative">
              <Bell size={15} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#4361ee] rounded-full border-2 border-white" />
            </button>
            <div className="nm-inset px-3 py-1.5 rounded-full flex items-center gap-2">
              <div className="w-6 h-6 rounded-full nm-flat flex items-center justify-center text-[10px] text-[#4361ee]">
                {user.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-normal leading-none">{user.fullName.split(' ')[0]}</p>
                <p className="text-[8px] text-[#4361ee] leading-none">{user.roleType.replace(/_/g,' ')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}
              className="h-full">
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
