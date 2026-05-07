import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, UserCheck, TrendingUp, Users, MapPin, Plus, Edit2, Trash2, Save, X, History, Download, FileText, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { UserProfile, UserStatus, UserRole, Child, Measurement } from '../types';

interface AdminDashboardProps {
  children: Child[];
  setChildren: (next: React.SetStateAction<Child[]>) => void;
  posyandus: string[];
  setPosyandus: (next: React.SetStateAction<string[]>) => void;
  kaders: UserProfile[];
  setKaders: (next: React.SetStateAction<UserProfile[]>) => void;
  measurements: Measurement[];
  onUpdateUser?: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
  onDeleteUser?: (uid: string) => Promise<void>;
  onUpdateChild?: (child: Child) => Promise<void>;
  onDeleteChild?: (id: string) => Promise<void>;
  onDeleteMeasurement?: (id: string) => Promise<void>;
}

export default function AdminDashboard({ 
  children, 
  setChildren, 
  posyandus, 
  setPosyandus, 
  kaders, 
  setKaders, 
  measurements,
  onUpdateUser,
  onDeleteUser,
  onUpdateChild,
  onDeleteChild,
  onDeleteMeasurement
}: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<'verification' | 'all_data' | 'manage_posyandu' | 'manage_kaders' | 'reports'>('verification');
  const [deletingChildId, setDeletingChildId] = React.useState<string | null>(null);
  const [deletingPosyandu, setDeletingPosyandu] = React.useState<{ index: number, name: string } | null>(null);
  const [deletingKaderId, setDeletingKaderId] = React.useState<string | null>(null);
  const [editingKader, setEditingKader] = React.useState<UserProfile | null>(null);
  
  const [editingChild, setEditingChild] = React.useState<Child | null>(null);
  
  const [isAddingPosyandu, setIsAddingPosyandu] = React.useState(false);
  const [editingPosyandu, setEditingPosyandu] = React.useState<{ index: number, value: string } | null>(null);
  const [newPosyanduName, setNewPosyanduName] = React.useState('');
  const [selectedChildForDetails, setSelectedChildForDetails] = React.useState<Child | null>(null);
  const [reportDates, setReportDates] = React.useState({ start: '', end: '' });

  const pendingKaders = kaders.filter(k => k.status === UserStatus.PENDING);
  const activeKaders = kaders.filter(k => k.status === UserStatus.ACTIVE);
  const activeKadersCount = activeKaders.length;

  const stats = [
    { label: 'Total Kader', value: kaders.length.toString(), icon: <Users className="text-brand-primary" />, trend: 'Seluruh Desa' },
    { label: 'Balita Terdata', value: children.length.toString(), icon: <TrendingUp className="text-brand-primary" />, trend: 'Update' },
    { label: 'Kader Aktif', value: activeKadersCount.toString(), icon: <UserCheck className="text-brand-primary" />, trend: 'Optimal' },
  ];

  const handleVerify = (uid: string) => {
    setKaders(prev => prev.map(k => k.uid === uid ? { ...k, status: UserStatus.ACTIVE } : k));
    if (onUpdateUser) onUpdateUser(uid, { status: UserStatus.ACTIVE });
  };

  const handleReject = async (uid: string) => {
    setKaders(prev => prev.filter(k => k.uid !== uid));
    if (onDeleteUser) await onDeleteUser(uid);
  };

  const getLatestMeasurement = (childId: string) => {
    const childMeasurements = measurements.filter(m => m.childId === childId);
    if (childMeasurements.length === 0) return '-';
    // Sort by date desc
    const latest = [...childMeasurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return `${latest.weight} kg`;
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-slate-800">Panel Admin</h1>
          <p className="text-slate-500 mt-1 text-lg">Akses penuh data Posyandu Desa Ladang Peris.</p>
        </div>
        <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setActiveSubTab('verification')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeSubTab === 'verification' ? 'rainbow-bg text-white shadow-lg shadow-pink-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Verifikasi
          </button>
          <button 
            onClick={() => setActiveSubTab('all_data')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeSubTab === 'all_data' ? 'rainbow-bg text-white shadow-lg shadow-pink-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Database Balita
          </button>
          <button 
            onClick={() => setActiveSubTab('manage_kaders')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeSubTab === 'manage_kaders' ? 'rainbow-bg text-white shadow-lg shadow-pink-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Data Kader
          </button>
          <button 
            onClick={() => setActiveSubTab('manage_posyandu')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeSubTab === 'manage_posyandu' ? 'rainbow-bg text-white shadow-lg shadow-pink-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Kelola Posyandu
          </button>
          <button 
            onClick={() => setActiveSubTab('reports')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeSubTab === 'reports' ? 'rainbow-bg text-white shadow-lg shadow-pink-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Laporan
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 rounded-[2rem]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-4 bg-brand-primary/10 rounded-2xl">
                {stat.icon}
              </div>
              <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-lg">
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 font-medium">{stat.label}</p>
            <p className="text-4xl font-display font-bold text-slate-800 mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {activeSubTab === 'verification' ? (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Verifikasi Kader Baru</h2>
            <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {pendingKaders.length} Menunggu
            </span>
          </div>
          
          <div className="space-y-4">
            {pendingKaders.length > 0 ? (
              pendingKaders.map((kader) => (
                <motion.div
                  key={kader.uid}
                  layout
                  className="bg-white p-6 rounded-[1.5rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-500">
                      {kader.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{kader.name}</h3>
                      <p className="text-sm text-slate-500">ID: {kader.idNumber} • Nama ID: <span className="font-bold text-slate-800">{kader.username}</span></p>
                      <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px] font-bold text-brand-primary">{kader.posyanduName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleReject(kader.uid)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-all border border-red-100"
                    >
                      <XCircle size={18} />
                      Tolak
                    </button>
                    <button
                      onClick={() => handleVerify(kader.uid)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-emerald-800 transition-all shadow-md shadow-emerald-200"
                    >
                      <CheckCircle2 size={18} />
                      Verifikasi
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Tidak ada pendaftaran kader baru.</p>
              </div>
            )}
          </div>
        </section>
      ) : activeSubTab === 'manage_kaders' ? (
        <section className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-100 bg-slate-50/30">
            <h2 className="text-3xl font-bold text-slate-800">Database Kader</h2>
            <p className="text-slate-500 mt-2 text-lg">Kelola akun kader yang sudah terverifikasi di setiap wilayah.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-10 py-5">Nama Kader</th>
                  <th className="px-10 py-5">ID / NIK</th>
                  <th className="px-10 py-5">Nama ID</th>
                  <th className="px-10 py-5">Wilayah Posyandu</th>
                  <th className="px-10 py-5">Status</th>
                  <th className="px-10 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeKaders.map((kader) => (
                  <tr key={kader.uid} className="hover:bg-brand-primary/[0.02] transition-all">
                    <td className="px-10 py-6 font-bold text-slate-800">{kader.name}</td>
                    <td className="px-10 py-6 text-sm font-mono text-slate-500">{kader.idNumber}</td>
                    <td className="px-10 py-6 text-slate-800 text-sm font-bold">@{kader.username}</td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-4 py-1.5 rounded-full uppercase tracking-wider">
                        {kader.posyanduName || 'Belum Ditentukan'}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-600">Aktif</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingKader(kader)}
                          className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-brand-primary rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeletingKaderId(kader.uid)}
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeKaders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                      Belum ada kader yang diverifikasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : activeSubTab === 'all_data' ? (
        <section className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-100 bg-slate-50/30">
            <h2 className="text-3xl font-bold text-slate-800">Database Balita & Kader</h2>
            <p className="text-slate-500 mt-2 text-lg">Pantau sinkronisasi data dari seluruh HP Kader Desa Ladang Peris.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-10 py-5">Nama Balita</th>
                  <th className="px-10 py-5">Posyandu</th>
                  <th className="px-10 py-5">Orang Tua</th>
                  <th className="px-10 py-5">Kader Penginput</th>
                  <th className="px-10 py-5">Timbangan</th>
                  <th className="px-10 py-5">Status</th>
                  <th className="px-10 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {children.map((child) => (
                  <tr key={child.id} className="hover:bg-brand-primary/[0.02] transition-all">
                    <td className="px-10 py-6 font-bold text-slate-800">{child.name}</td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">{child.posyanduName}</span>
                    </td>
                    <td className="px-10 py-6 text-slate-500 text-sm">{child.parentsName}</td>
                    <td className="px-10 py-6">
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary px-3 py-1 rounded-full border border-brand-primary/10">
                        {kaders.find(k => k.posyanduName === child.posyanduName)?.name || 'Sistem'}
                      </span>
                    </td>
                    <td className="px-10 py-6 font-mono text-brand-primary font-bold">{getLatestMeasurement(child.id)}</td>
                    <td className="px-10 py-6">
                      <span className="w-2 h-2 rounded-full bg-brand-primary inline-block mr-2"></span>
                      <span className="text-xs font-bold text-slate-600">Terdata</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                         <button 
                          onClick={() => setSelectedChildForDetails(child)}
                          className="p-2 hover:bg-brand-primary/10 text-slate-400 hover:text-brand-primary rounded-lg transition-all"
                          title="Lihat Grafik & Riwayat"
                         >
                            <TrendingUp size={16} />
                         </button>
                         <button 
                          onClick={() => setEditingChild(child)}
                          className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-brand-primary rounded-lg transition-all"
                          title="Edit Data Balita"
                         >
                            <Edit2 size={16} />
                         </button>
                         <button 
                          onClick={() => setDeletingChildId(child.id)}
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {children.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center text-slate-400">
                      Belum ada data balita terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50 text-center">
             <button 
              onClick={() => setActiveSubTab('reports')}
              className="text-brand-primary font-bold text-sm hover:underline"
             >
               Lihat Seluruh Laporan & Download (Excel/PDF)
            </button>
          </div>
        </section>
      ) : activeSubTab === 'manage_posyandu' ? (
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Daftar Wilayah Posyandu</h2>
              <p className="text-slate-500 mt-1 text-lg font-light">Kelola pembagian wilayah tugas untuk para Kader Desa.</p>
            </div>
            <button 
              onClick={() => setIsAddingPosyandu(true)}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:brightness-110 shadow-xl shadow-brand-primary/20 transition-all"
            >
              <Plus size={22} />
              Tambah Wilayah Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isAddingPosyandu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-primary/5 p-8 rounded-[2.5rem] border-2 border-dashed border-brand-primary/30 flex flex-col justify-center"
              >
                <div className="mb-4">
                  <h3 className="font-bold text-slate-800 mb-1">Posyandu Baru</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Input Nama Lokasi</p>
                </div>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Contoh: Posyandu Melati..." 
                  className="input-field mb-6 shadow-sm"
                  value={newPosyanduName}
                  onChange={(e) => setNewPosyanduName(e.target.value)}
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setIsAddingPosyandu(false); setNewPosyanduName(''); }}
                    className="flex-1 py-3 text-slate-500 font-bold text-sm bg-white rounded-xl shadow-sm border border-slate-100"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => {
                      if(newPosyanduName.trim()) {
                        setPosyandus([...posyandus, newPosyanduName.trim()]);
                        setNewPosyanduName('');
                        setIsAddingPosyandu(false);
                      }
                    }}
                    className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20"
                  >
                    Simpan
                  </button>
                </div>
              </motion.div>
            )}

            {posyandus.map((posyandu, index) => (
              <motion.div
                key={index}
                layout
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12" />
                
                {editingPosyandu?.index === index ? (
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="mb-6">
                      <h3 className="font-bold text-slate-800 mb-4 text-xl">Ubah Nama Wilayah</h3>
                      <input 
                        autoFocus
                        type="text" 
                        className="input-field shadow-sm"
                        value={editingPosyandu.value}
                        onChange={(e) => setEditingPosyandu({ ...editingPosyandu, value: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => setEditingPosyandu(null)}
                        className="flex-1 py-3 text-slate-500 font-bold text-sm bg-slate-50 rounded-xl"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={() => {
                          const oldName = posyandus[index];
                          const newName = editingPosyandu.value;
                          
                          // Update the posyandu list
                          const next = [...posyandus];
                          next[index] = newName;
                          setPosyandus(next);
                          
                          // Cascade changes to children
                          setChildren(prev => prev.map(c => c.posyanduName === oldName ? { ...c, posyanduName: newName } : c));
                          
                          // Cascade changes to kaders
                          setKaders(prev => prev.map(k => k.posyanduName === oldName ? { ...k, posyanduName: newName } : k));
                          
                          setEditingPosyandu(null);
                        }}
                        className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-md"
                      >
                        Perbarui
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6">
                        <MapPin size={28} />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-slate-800 break-words mb-2">{posyandu}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Wilayah Kerja</p>
                    </div>
                    
                    <div className="relative z-10 mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingPosyandu({ index, value: posyandu })}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                          title="Ubah Nama"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeletingPosyandu({ index, name: posyandu })}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all"
                          title="Hapus Wilayah"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400">Total Kader</p>
                        <p className="text-lg font-bold text-slate-700">{kaders.filter(k => k.posyanduName === posyandu).length}</p>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      ) : activeSubTab === 'reports' ? (
        <section className="space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Ekspor Laporan Penimbangan</h2>
                <p className="text-slate-500 mt-2 text-lg">Download seluruh data balita dan riwayat penimbangan dalam format Excel (CSV).</p>
              </div>
              <FileText size={60} className="text-brand-primary opacity-20 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600 block flex items-center gap-2">
                  <Calendar size={16} className="text-brand-primary" />
                  Tanggal Mulai
                </label>
                <input 
                  type="date" 
                  className="input-field"
                  value={reportDates.start}
                  onChange={(e) => setReportDates({...reportDates, start: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600 block flex items-center gap-2">
                  <Calendar size={16} className="text-brand-primary" />
                  Tanggal Akhir
                </label>
                <input 
                  type="date" 
                  className="input-field"
                  value={reportDates.end}
                  onChange={(e) => setReportDates({...reportDates, end: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-12 p-8 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center">
                  <Download size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Siap untuk diunduh</h3>
                  <p className="text-sm text-slate-500">Laporan akan mencakup semua balita yang terdaftar.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  let url = '/api/reports/export';
                  if (reportDates.start && reportDates.end) {
                    url += `?startDate=${reportDates.start}&endDate=${reportDates.end}`;
                  }
                  window.location.href = url;
                }}
                className="w-full md:w-auto px-10 py-5 bg-brand-primary text-white font-bold rounded-2xl hover:brightness-110 shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-3"
              >
                <Download size={20} />
                Download Laporan (Excel)
              </button>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex gap-4">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">Informasi</p>
              <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                Data yang diunduh adalah data real-time yang tersimpan di server. 
                Gunakan filter rentang waktu jika Anda ingin mengambil data dari bulan tertentu saja. 
                File CSV dapat dibuka langsung menggunakan Microsoft Excel atau Google Sheets.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-100 bg-slate-50/30 text-center py-20">
             <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                <MapPin size={40} />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Pilih Tab Menu</h2>
             <p className="text-slate-500">Silakan pilih menu di bagian atas untuk mengelola data.</p>
          </div>
        </section>
      )}

      {/* Delete Confirmation Modal for Admin (Children) */}
      {deletingChildId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setDeletingChildId(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center"
          >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Hapus Data Balita?</h2>
            <p className="text-slate-500 mb-8">Admin memiliki wewenang untuk menghapus data secara permanen.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingChildId(null)}
                className="flex-1 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100"
              >
                Batal
              </button>
              <button 
                onClick={async () => {
                  if (onDeleteChild) {
                    await onDeleteChild(deletingChildId);
                  } else {
                    setChildren(prev => prev.filter(c => c.id !== deletingChildId));
                  }
                  setDeletingChildId(null);
                }}
                className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100"
              >
                Ya, Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal for Posyandu */}
      {deletingPosyandu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setDeletingPosyandu(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center"
          >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Hapus {deletingPosyandu.name}?</h2>
            
            {children.some(c => c.posyanduName === deletingPosyandu.name) ? (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-8 text-left">
                <p className="text-amber-800 text-sm font-bold flex items-center gap-2">
                  Peringatan:
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  Masih ada balita yang terdaftar di posyandu ini. Menghapus posyandu akan menyebabkan data wilayah pada balita tersebut menjadi kosong.
                </p>
              </div>
            ) : (
              <p className="text-slate-500 mb-8">Apakah Anda yakin ingin menghapus posyandu ini dari daftar?</p>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingPosyandu(null)}
                className="flex-1 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  setPosyandus(prev => prev.filter((_, i) => i !== deletingPosyandu.index));
                  setDeletingPosyandu(null);
                }}
                className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100"
              >
                Ya, Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Child Modal for Admin */}
      {editingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setEditingChild(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="bg-brand-primary p-8 text-white">
              <h2 className="text-2xl font-bold font-display">Edit Data Balita</h2>
              <p className="text-emerald-50 text-sm mt-1">Perbarui informasi dasar balita.</p>
            </div>
            
            <form 
              className="p-8 space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setChildren(prev => prev.map(c => c.id === editingChild.id ? editingChild : c));
                if (onUpdateChild) await onUpdateChild(editingChild);
                setEditingChild(null);
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block ml-2">Nama Balita</label>
                <input 
                  type="text"
                  className="input-field"
                  required
                  value={editingChild.name}
                  onChange={(e) => setEditingChild({...editingChild, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block ml-2">Wilayah Posyandu</label>
                <select 
                  className="input-field"
                  required
                  value={editingChild.posyanduName}
                  onChange={(e) => setEditingChild({...editingChild, posyanduName: e.target.value})}
                >
                  <option value="">-- Pilih Posyandu --</option>
                  {posyandus.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block ml-2">Nama Orang Tua</label>
                <input 
                  type="text"
                  className="input-field"
                  required
                  value={editingChild.parentsName}
                  onChange={(e) => setEditingChild({...editingChild, parentsName: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingChild(null)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-emerald-800 shadow-lg shadow-emerald-100"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Kader Modal */}
      {editingKader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setEditingKader(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="bg-brand-primary p-8 text-white">
              <h2 className="text-2xl font-bold font-display">Edit Profil Kader</h2>
              <p className="text-emerald-50 text-sm mt-1">Perbarui informasi tugas kader.</p>
            </div>
            
            <form 
              className="p-8 space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setKaders(prev => prev.map(k => k.uid === editingKader.uid ? editingKader : k));
                if (onUpdateUser) await onUpdateUser(editingKader.uid, editingKader);
                setEditingKader(null);
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block ml-2">Nama Lengkap</label>
                <input 
                  type="text"
                  className="input-field"
                  required
                  value={editingKader.name}
                  onChange={(e) => setEditingKader({...editingKader, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block ml-2">Username / Nama ID</label>
                <input 
                  type="text"
                  className="input-field"
                  required
                  value={editingKader.username}
                  onChange={(e) => setEditingKader({...editingKader, username: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block ml-2">NIK / No. ID</label>
                <input 
                  type="text"
                  className="input-field"
                  required
                  value={editingKader.idNumber}
                  onChange={(e) => setEditingKader({...editingKader, idNumber: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block ml-2">Ubah Kata Sandi (Opsional)</label>
                <input 
                  type="text"
                  className="input-field"
                  placeholder="Isi hanya jika ingin mengubah sandi..."
                  value={editingKader.password || ''}
                  onChange={(e) => setEditingKader({...editingKader, password: e.target.value})}
                />
                <p className="text-[10px] text-slate-400 ml-2">Kosongkan jika tidak ingin mengubah kata sandi.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 block ml-2">Posyandu Tugas</label>
                <select 
                  className="input-field"
                  required
                  value={editingKader.posyanduName || ''}
                  onChange={(e) => setEditingKader({...editingKader, posyanduName: e.target.value})}
                >
                  <option value="">-- Pilih Posyandu --</option>
                  {posyandus.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingKader(null)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-emerald-800 shadow-lg shadow-emerald-100"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal for Kader */}
      {deletingKaderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setDeletingKaderId(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center"
          >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Hapus Akun Kader?</h2>
            <p className="text-slate-500 mb-8">Kader tidak akan bisa lagi mengakses data posyandu ini.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingKaderId(null)}
                className="flex-1 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100"
              >
                Batal
              </button>
              <button 
                onClick={async () => {
                  setKaders(prev => prev.filter(k => k.uid !== deletingKaderId));
                  if (onDeleteUser) await onDeleteUser(deletingKaderId);
                  setDeletingKaderId(null);
                }}
                className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100"
              >
                Ya, Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Child Details & Graph Modal for Admin */}
      {selectedChildForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setSelectedChildForDetails(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-brand-secondary p-8 rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                    selectedChildForDetails.gender === 'Laki-laki' ? 'bg-blue-100 text-blue-600' : 'bg-brand-accent/10 text-brand-accent'
                  }`}>
                    {selectedChildForDetails.name.charAt(0)}
                  </div>
                  <div>
                     <h2 className="text-3xl font-bold text-slate-800">{selectedChildForDetails.name}</h2>
                     <p className="text-slate-500 font-medium">Rekapan Tumbuh Kembang Individual</p>
                  </div>
               </div>
               <button 
                 onClick={() => setSelectedChildForDetails(null)}
                 className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100"
               >
                 <X size={24} />
               </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                     <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                       <TrendingUp className="text-brand-primary" />
                       Grafik Pertumbuhan
                     </h3>
                     
                     <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <LineChart
                             data={measurements
                               .filter(m => m.childId === selectedChildForDetails.id)
                               .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                               .map(m => ({
                                 date: new Date(m.date).toLocaleDateString('id-ID', { month: 'short' }),
                                 berat: m.weight,
                                 tinggi: m.height
                               }))
                             }
                           >
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="date" axisLine={false} tickLine={false} />
                             <YAxis axisLine={false} tickLine={false} />
                             <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                             <Legend />
                             <Line type="monotone" dataKey="berat" stroke="#0d9488" strokeWidth={3} name="BB (Kg)" />
                             <Line type="monotone" dataKey="tinggi" stroke="#f43f5e" strokeWidth={3} name="TB (Cm)" />
                           </LineChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                     <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                       <MapPin className="text-brand-primary" />
                       Informasi Dasar
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Posyandu</p>
                           <p className="font-bold text-slate-700">{selectedChildForDetails.posyanduName}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TTL</p>
                           <p className="font-bold text-slate-700">{new Date(selectedChildForDetails.birthDate).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Orang Tua</p>
                           <p className="font-bold text-slate-700">{selectedChildForDetails.parentsName}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                           <p className="font-bold text-emerald-600">Terverifikasi</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <History className="text-brand-primary" />
                    Riwayat Timbangan
                  </h3>
                  <div className="space-y-4">
                     {measurements
                       .filter(m => m.childId === selectedChildForDetails.id)
                       .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                       .map((m, idx) => (
                            <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all group">
                               <div>
                                  <p className="font-bold text-slate-700">{new Date(m.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                                  <div className="flex gap-4 mt-1">
                                     <span className="text-xs text-slate-500">BB: <span className="font-bold text-brand-primary">{m.weight}kg</span></span>
                                     <span className="text-xs text-slate-500">TB: <span className="font-bold text-brand-accent">{m.height}cm</span></span>
                                  </div>
                               </div>
                               <div className="flex items-center gap-4">
                                 <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${m.stuntingStatus === 'Normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {m.stuntingStatus}
                                 </span>
                                 <button 
                                   onClick={() => {
                                     if (onDeleteMeasurement) {
                                       onDeleteMeasurement(m.id);
                                     }
                                   }}
                                   className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                               </div>
                            </div>
                       ))}
                     {measurements.filter(m => m.childId === selectedChildForDetails.id).length === 0 && (
                       <div className="py-12 text-center text-slate-400">Belum ada riwayat timbangan.</div>
                     )}
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
