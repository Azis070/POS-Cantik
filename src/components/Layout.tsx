import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, Baby, ClipboardList, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { UserRole, UserProfile } from '../types';

interface SidebarItemProps {
  key?: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

const SidebarItem = ({ icon, label, active, onClick, collapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${
      active 
        ? 'rainbow-bg text-white shadow-xl shadow-pink-200' 
        : 'text-slate-500 hover:bg-brand-primary/5 hover:text-brand-primary'
    }`}
  >
    <div className="flex-shrink-0">{icon}</div>
    {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
    {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Layout({ children, user, activeTab, setActiveTab, onLogout }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuItems = user?.role === UserRole.ADMIN 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'verification', label: 'Verifikasi Kader', icon: <Users size={20} /> },
        { id: 'reports', label: 'Laporan Keseluruhan', icon: <ClipboardList size={20} /> },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'children', label: 'Daftar Balita', icon: <Baby size={20} /> },
        { id: 'measurements', label: 'Input Timbangan', icon: <ClipboardList size={20} /> },
      ];

  return (
    <div className="min-h-screen bg-brand-secondary flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? '80px' : '260px' }}
        className="hidden md:flex flex-col border-r border-slate-200 bg-white sticky top-0 h-screen z-20"
      >
        <div className="p-6 flex items-center justify-between overflow-hidden">
          {!sidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rainbow-bg rounded-xl flex items-center justify-center text-white font-bold italic shadow-lg shadow-brand-primary/20 animate-pulse">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold rainbow-text leading-tight">POS Cantik</span>
                <span className="font-display text-[8px] font-bold text-brand-primary uppercase tracking-[0.2em] -mt-1 opacity-80">Ladang Peris</span>
              </div>
            </motion.div>
          )}
          {sidebarCollapsed && (
             <div className="w-8 h-8 rainbow-bg rounded-lg flex items-center justify-center text-white font-bold italic mx-auto">
               P
             </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 p-3 mb-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
             {!sidebarCollapsed && (
               <div className="flex flex-col">
                 <span className="text-sm font-bold truncate max-w-[140px] text-slate-800">{user?.name}</span>
                 <span className="text-[10px] items-center gap-1 font-bold text-brand-primary">@{user?.username}</span>
               </div>
             )}
          </div>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-white border-bottom border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rainbow-bg rounded-lg flex items-center justify-center text-white font-bold italic">P</div>
            <span className="font-display text-lg font-bold rainbow-text">Sipos Peris</span>
          </div>
          <button onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} className="text-slate-600" />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-display text-xl font-bold text-brand-primary">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <nav className="space-y-4">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-brand-primary text-white shadow-lg' 
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    {item.icon}
                    <span className="font-bold">{item.label}</span>
                    <ChevronRight size={16} className="ml-auto opacity-50" />
                  </button>
                ))}
              </nav>

              <div className="absolute bottom-8 left-6 right-6">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-50 text-red-500 font-bold"
                >
                  <LogOut size={20} />
                  Keluar Aplikasi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
