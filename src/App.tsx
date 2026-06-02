
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  LayoutDashboard, 
  CreditCard, 
  Package, 
  Microscope,
  TrendingUp,
  Settings,
  Bell,
  Search,
  Plus,
  LogIn,
  LogOut,
  Hospital
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Mock Components for Modules ---
const Dashboard = () => (
  <div className="nm-flat p-4 rounded-xl animate-fade-in h-full">
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <LayoutDashboard size={20} className="text-blue-500" />
      Hospital Command Center
    </h2>
    <div className="grid grid-cols-4 gap-2 mb-4">
      {[
        { label: 'Total Patients', value: '1,284', icon: Users, color: 'text-blue-500' },
        { label: 'Active OPDs', value: '42', icon: Calendar, color: 'text-green-500' },
        { label: 'Beds Occupied', value: '18/45', icon: Hospital, color: 'text-purple-500' },
        { label: 'Revenue (Today)', value: '₹42,500', icon: TrendingUp, color: 'text-amber-500' },
      ].map((kpi, idx) => (
        <div key={idx} className="nm-inset p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <kpi.icon size={16} className={kpi.color} />
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Live</span>
          </div>
          <div className="text-lg font-black">{kpi.value}</div>
          <div className="text-[11px] font-medium opacity-70">{kpi.label}</div>
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="nm-inset p-3 rounded-lg">
        <h3 className="text-xs font-bold uppercase mb-2">Recent Appointments</h3>
        <div className="space-y-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="nm-flat p-2 rounded-md text-xs flex justify-between items-center transition-transform hover:scale-[1.01]">
              <span className="font-bold">Rahul Sen (Token #0{i})</span>
              <span className="bg-green-100 text-green-700 px-1.5 rounded font-bold">Confirmed</span>
            </div>
          ))}
        </div>
      </div>
      <div className="nm-inset p-3 rounded-lg">
        <h3 className="text-xs font-bold uppercase mb-2">Pharmacy Alerts</h3>
        <div className="nm-flat p-2 rounded-md border-l-4 border-red-500 animate-pulse">
          <p className="text-[11px] font-bold">Critical Low Stock: Paracetamol 500mg</p>
          <p className="text-[10px] opacity-70">Batch PM-109 • Only 8 units left</p>
        </div>
      </div>
    </div>
  </div>
);

const Patients = () => (
  <div className="nm-flat p-4 rounded-xl animate-fade-in h-full">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold flex items-center gap-2"><Users size={20} className="text-blue-500" /> Patient Registry</h2>
      <button className="nm-button px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-bold text-blue-600">
        <Plus size={16} /> New Registration
      </button>
    </div>
    <div className="nm-inset p-2 rounded-lg mb-4 flex items-center gap-2">
      <Search size={16} className="opacity-50" />
      <input type="text" placeholder="Search by UHID, Name or Mobile..." className="bg-transparent outline-none text-sm w-full" />
    </div>
    <table className="w-full text-xs">
      <thead className="opacity-60 uppercase font-black tracking-widest text-[9px]">
        <tr className="text-left border-b border-gray-200">
          <th className="pb-2">UHID</th>
          <th className="pb-2">FullName</th>
          <th className="pb-2">Gender / Age</th>
          <th className="pb-2">Status</th>
          <th className="pb-2">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        <tr className="hover:bg-gray-50/50 transition-colors">
          <td className="py-2 font-bold text-blue-600">UHID-2026-05-12</td>
          <td className="py-2 font-black">Rahul Sen</td>
          <td className="py-2 font-medium">Male / 34Y</td>
          <td className="py-2"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Active</span></td>
          <td className="py-2"><button className="nm-button px-2 py-1 rounded text-[10px] font-bold">View File</button></td>
        </tr>
      </tbody>
    </table>
  </div>
);

// --- Main App Implementation ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#e0e5ec]">
        <div className="nm-flat p-8 rounded-full animate-bounce">
          <Hospital size={48} className="text-blue-600" />
        </div>
        <p className="font-bold text-lg text-blue-800 tracking-widest animate-pulse">BOOTSTRAPPING MEDICORE HMS...</p>
      </div>
    );
  }

  if (!isLogged) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="nm-card w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="inline-flex nm-inset p-4 rounded-full mb-4">
              <Hospital size={40} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-800">MediCore</h1>
            <p className="text-xs font-medium uppercase tracking-tighter opacity-70">Enterprise Clinical Gateway</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase opacity-60 ml-2">Email Address</label>
              <div className="nm-inset p-3 rounded-xl mt-1">
                <input type="text" placeholder="admin@hospital.com" className="bg-transparent w-full outline-none text-sm" defaultValue="admin@hospital.com" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase opacity-60 ml-2">Password</label>
              <div className="nm-inset p-3 rounded-xl mt-1">
                <input type="password" placeholder="••••••••" className="bg-transparent w-full outline-none text-sm" defaultValue="password123" />
              </div>
            </div>
            <button 
              onClick={() => setIsLogged(true)}
              className="nm-button w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-blue-700 font-black cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn size={20} /> AUTHORIZE ACCESS
            </button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'patients', icon: Users, label: 'Patients' },
    { id: 'appointments', icon: Calendar, label: 'Queue' },
    { id: 'emr', icon: Stethoscope, label: 'Clinical' },
    { id: 'lab', icon: Microscope, label: 'Laboratory' },
    { id: 'pharmacy', icon: Package, label: 'Pharmacy' },
    { id: 'billing', icon: CreditCard, label: 'Billing' },
    { id: 'crm', icon: TrendingUp, label: 'CRM' },
    { id: 'admin', icon: Settings, label: 'Control' },
  ];

  return (
    <div className="h-screen flex p-2 gap-2 overflow-hidden bg-[#e0e5ec]">
      {/* Sidebar - DENSE */}
      <nav className="nm-flat w-[70px] lg:w-[180px] rounded-2xl flex flex-col p-2 transition-all shrink-0">
        <div className="flex items-center gap-2 px-2 py-4 mb-4">
          <div className="nm-inset p-2 rounded-xl text-blue-600">
            <Hospital size={24} />
          </div>
          <span className="font-black text-xl hidden lg:block text-gray-800 tracking-tighter">MEDICORE</span>
        </div>
        
        <div className="flex-1 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === item.id 
                  ? 'nm-inset text-blue-600 font-black' 
                  : 'hover:nm-button opacity-70 hover:opacity-100 font-bold'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs hidden lg:block">{item.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsLogged(false)}
          className="p-3 rounded-xl nm-button text-red-500 font-bold flex items-center gap-3 transition-all"
        >
          <LogOut size={20} />
          <span className="text-xs hidden lg:block text-red-600">Sign Out</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Header - DENSE */}
        <header className="nm-flat h-[60px] rounded-2xl flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-black text-lg text-gray-800 uppercase tracking-widest truncate">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-2 nm-inset px-3 py-1.5 rounded-full text-xs font-bold text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Server: MediCore-South-Internal
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="nm-button p-2 rounded-full relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#e0e5ec]"></span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-300">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black leading-tight">Dr. Amitabh Verma</p>
                <p className="text-[9px] font-bold opacity-60 leading-tight">SUPER ADMIN</p>
              </div>
              <div className="nm-flat p-1 rounded-full">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amitabh" 
                  className="w-8 h-8 rounded-full nm-inset" 
                  alt="Avatar" 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Section - DENSE */}
        <section className="flex-1 overflow-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.1 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'patients' && <Patients />}
              {activeTab !== 'dashboard' && activeTab !== 'patients' && (
                <div className="nm-flat h-full rounded-2xl flex flex-col items-center justify-center p-8 text-center text-gray-400">
                   <div className="nm-inset p-8 rounded-full mb-4">
                      {React.createElement(menuItems.find(m => m.id === activeTab)?.icon || Stethoscope, { size: 64, className: 'opacity-20' })}
                   </div>
                   <h3 className="text-xl font-bold text-gray-700">Module Under Synthesis</h3>
                   <p className="text-sm max-w-xs mx-auto">This neural component is being hot-swapped for the MediCore v2 upgrade. Estimated completion: T-minus 4 minutes.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
