import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Calendar, Ruler, Weight, User, MapPin, ListFilter, Save, X, Edit2, Trash2, Users, CheckCircle2, TrendingUp, History, Download, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Child, Measurement } from '../types';

interface KaderDashboardProps {
  children: Child[];
  setChildren: (next: React.SetStateAction<Child[]>) => void;
  posyandus: string[];
  currentUser: any;
  measurements: Measurement[];
  setMeasurements: (next: React.SetStateAction<Measurement[]>) => void;
  onSaveChild?: (child: Child) => Promise<void>;
  onSaveMeasurement?: (m: Measurement) => Promise<void>;
  onDeleteChild?: (id: string) => Promise<void>;
  onDeleteMeasurement?: (id: string) => Promise<void>;
}

export default function KaderDashboard({ 
  children, 
  setChildren, 
  posyandus, 
  currentUser, 
  measurements, 
  setMeasurements,
  onSaveChild,
  onSaveMeasurement,
  onDeleteChild,
  onDeleteMeasurement
}: KaderDashboardProps) {
  const [activeView, setActiveView] = React.useState<'list' | 'add_child' | 'add_measurement' | 'edit_child' | 'details' | 'reports'>('list');
  const [selectedChild, setSelectedChild] = React.useState<Child | null>(null);
  const [deletingChildId, setDeletingChildId] = React.useState<string | null>(null);
  const [reportDates, setReportDates] = React.useState({ start: '', end: '' });

  // Form state for measurements
  const [measurementForm, setMeasurementForm] = React.useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    armCircumference: '', // LILA
    headCircumference: '', // LIKA
    stuntingStatus: 'Normal' as 'Normal' | 'Stunting' | 'Risiko Stunting',
    exclusiveBreastfeeding: false,
    completeImmunization: false,
    caredBy: 'Orang Tua',
    routineToPosyandu: true,
    presentBKB: false,
    stillBreastfeeding: false,
    proteinAnimal3x: false,
    kkaFilled: false,
    kkaGraphAppropriate: false,
    congenitalDisease: '',
    infectiousDiseaseHistory: '',
    exposedToSmoke: false,
    healthyLatrine: true,
    cleanWaterSource: true,
    referredToHospital: false,
    hasBpjs: false,
    notes: ''
  });

  // Form state for editing/adding
  const [childForm, setChildForm] = React.useState({
    name: '',
    nik: '',
    birthDate: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    birthWeight: '',
    birthHeight: '',
    fatherName: '',
    fatherNik: '',
    fatherOccupation: '',
    motherName: '',
    motherNik: '',
    motherBirthDate: '',
    motherOccupation: '',
    kbHistory: '',
    kbReason: '',
    posyanduName: currentUser?.posyanduName || '',
    address: ''
  });

  const resetForm = () => {
    setChildForm({
      name: '',
      nik: '',
      birthDate: '',
      gender: 'Laki-laki',
      birthWeight: '',
      birthHeight: '',
      fatherName: '',
      fatherNik: '',
      fatherOccupation: '',
      motherName: '',
      motherNik: '',
      motherBirthDate: '',
      motherOccupation: '',
      kbHistory: '',
      kbReason: '',
      posyanduName: currentUser?.posyanduName || '',
      address: ''
    });
    setSelectedChild(null);
  };

  const calculateChildAgeMonths = (birthDate: string) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    return (years * 12) + months;
  };

  const calculateMotherAgeYears = (birthDate: string) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleEditClick = (e: React.MouseEvent, child: Child) => {
    e.stopPropagation();
    setSelectedChild(child);
    setChildForm({
      name: child.name,
      nik: child.nik || '',
      birthDate: child.birthDate,
      gender: child.gender,
      birthWeight: child.birthWeight?.toString() || '',
      birthHeight: child.birthHeight?.toString() || '',
      fatherName: child.fatherName || '',
      fatherNik: child.fatherNik || '',
      fatherOccupation: child.fatherOccupation || '',
      motherName: child.motherName || '',
      motherNik: child.motherNik || '',
      motherBirthDate: child.motherBirthDate || '',
      motherOccupation: child.motherOccupation || '',
      kbHistory: child.kbHistory || '',
      kbReason: child.kbReason || '',
      posyanduName: child.posyanduName,
      address: child.address
    });
    setActiveView('edit_child');
  };

  const handleDeleteChild = async (id: string) => {
    if (onDeleteChild) {
      await onDeleteChild(id);
    } else {
      setChildren(prev => prev.filter(c => c.id !== id));
    }
    setDeletingChildId(null);
  };

  const handleSaveChild = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...childForm,
      birthWeight: childForm.birthWeight ? parseFloat(childForm.birthWeight) : undefined,
      birthHeight: childForm.birthHeight ? parseFloat(childForm.birthHeight) : undefined,
      parentsName: `${childForm.motherName}/${childForm.fatherName}`
    };

    if (activeView === 'edit_child' && selectedChild) {
      const updatedChild = { ...selectedChild, ...payload };
      setChildren(prev => prev.map(c => c.id === selectedChild.id ? updatedChild : c));
      if (onSaveChild) await onSaveChild(updatedChild);
    } else {
      const newChild: Child = {
        id: Math.random().toString(36).substr(2, 9),
        ...payload as any,
        createdAt: new Date().toISOString()
      };
      setChildren(prev => [...prev, newChild]);
      if (onSaveChild) await onSaveChild(newChild);
    }
    setActiveView('list');
    resetForm();
  };

  // Calculate stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyMeasurements = measurements.filter(m => {
    const date = new Date(m.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear && 
           children.some(c => c.id === m.childId);
  });

  const stats = [
    { label: 'Balita Terdaftar', value: children.length, color: 'bg-teal-50 text-brand-primary' },
    { label: 'Timbangan Bulan Ini', value: monthlyMeasurements.length, color: 'bg-brand-secondary/50 text-teal-800' },
    { label: 'Status Gizi Baik', value: children.length > 0 ? children.length : 0, color: 'bg-rose-50 text-brand-accent' },
  ];

  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    const newMeasurement: Measurement = {
      id: Math.random().toString(36).substr(2, 9),
      childId: selectedChild.id,
      kaderId: currentUser?.uid || 'anonymous',
      date: measurementForm.date,
      weight: parseFloat(measurementForm.weight),
      height: parseFloat(measurementForm.height),
      armCircumference: measurementForm.armCircumference ? parseFloat(measurementForm.armCircumference) : undefined,
      headCircumference: measurementForm.headCircumference ? parseFloat(measurementForm.headCircumference) : undefined,
      stuntingStatus: measurementForm.stuntingStatus,
      exclusiveBreastfeeding: measurementForm.exclusiveBreastfeeding,
      completeImmunization: measurementForm.completeImmunization,
      caredBy: measurementForm.caredBy,
      routineToPosyandu: measurementForm.routineToPosyandu,
      presentBKB: measurementForm.presentBKB,
      stillBreastfeeding: measurementForm.stillBreastfeeding,
      proteinAnimal3x: measurementForm.proteinAnimal3x,
      kkaFilled: measurementForm.kkaFilled,
      kkaGraphAppropriate: measurementForm.kkaGraphAppropriate,
      congenitalDisease: measurementForm.congenitalDisease,
      infectiousDiseaseHistory: measurementForm.infectiousDiseaseHistory,
      exposedToSmoke: measurementForm.exposedToSmoke,
      healthyLatrine: measurementForm.healthyLatrine,
      cleanWaterSource: measurementForm.cleanWaterSource,
      referredToHospital: measurementForm.referredToHospital,
      hasBpjs: measurementForm.hasBpjs,
      notes: measurementForm.notes
    };

    setMeasurements(prev => [...prev, newMeasurement]);
    if (onSaveMeasurement) await onSaveMeasurement(newMeasurement);
    setActiveView('list');
    setMeasurementForm({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      height: '',
      armCircumference: '',
      headCircumference: '',
      stuntingStatus: 'Normal',
      exclusiveBreastfeeding: false,
      completeImmunization: false,
      caredBy: 'Orang Tua',
      routineToPosyandu: true,
      presentBKB: false,
      stillBreastfeeding: false,
      proteinAnimal3x: false,
      kkaFilled: false,
      kkaGraphAppropriate: false,
      congenitalDisease: '',
      infectiousDiseaseHistory: '',
      exposedToSmoke: false,
      healthyLatrine: true,
      cleanWaterSource: true,
      referredToHospital: false,
      hasBpjs: false,
      notes: ''
    });
    alert(`Data timbangan ${selectedChild.name} berhasil disimpan!`);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-bold text-slate-800 italic leading-tight">
            POS <span className="rainbow-text">Cantik</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-light">Mencatat tumbuh kembang dengan hati & presisi.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveView(activeView === 'reports' ? 'list' : 'reports')}
            className={`flex items-center gap-3 px-6 py-4 font-bold rounded-2xl transition-all ${activeView === 'reports' ? 'bg-slate-100 text-slate-600' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText size={20} />
            Laporan
          </button>
          <button 
             onClick={() => { resetForm(); setActiveView('add_child'); }}
             className="flex items-center gap-3 px-8 py-4 rainbow-bg text-white font-bold rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-pink-200"
          >
            <Plus size={22} />
            Daftar Balita Baru
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 rounded-3xl ${stat.color} border border-white`}>
            <p className="text-sm font-bold uppercase tracking-wider opacity-60">{stat.label}</p>
            <p className="text-3xl font-display font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'reports' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">Ekspor Laporan {currentUser?.posyanduName}</h2>
                  <p className="text-slate-500 mt-2 text-lg">Download data balita dan riwayat penimbangan di wilayah Anda.</p>
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
                    <h3 className="font-bold text-slate-800">Laporan Format Excel</h3>
                    <p className="text-sm text-slate-500">Mencakup data balita dan status gizi.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    let url = '/api/reports/export';
                    const params = new URLSearchParams();
                    if (currentUser?.posyanduName) {
                      params.append('posyandu', currentUser.posyanduName);
                    }
                    if (reportDates.start && reportDates.end) {
                      params.append('startDate', reportDates.start);
                      params.append('endDate', reportDates.end);
                    }
                    const queryString = params.toString();
                    window.location.href = queryString ? `${url}?${queryString}` : url;
                  }}
                  className="w-full md:w-auto px-10 py-5 bg-brand-primary text-white font-bold rounded-2xl hover:brightness-110 shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-3"
                >
                  <Download size={20} />
                  Download Laporan
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-bold text-blue-900 text-sm">Ketentuan Ekspor</p>
                <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                  Laporan ini dikhususkan untuk wilayah **{currentUser?.posyanduName}**. 
                  Jika Anda memerlukan data menyeluruh, silakan hubungi Administrator. 
                  Pastikan rentang waktu yang dipilih sudah benar agar data akurat.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeView === 'list' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Cari nama balita..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-slate-600 font-bold hover:bg-slate-50">
                <ListFilter size={20} />
                Filter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {children.map((child) => (
                <motion.div
                  key={child.id}
                  whileHover={{ y: -8 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100/50 shadow-sm hover:shadow-2xl hover:shadow-brand-primary/10 transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => {
                    setSelectedChild(child);
                    setActiveView('add_measurement');
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-500" />
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-bold ${
                      child.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-500' : 'bg-brand-accent/5 text-brand-accent'
                    }`}>
                      {child.name.charAt(0)}
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={(e) => handleEditClick(e, child)}
                        className="p-2.5 transition-all bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-brand-primary hover:border-brand-primary/30"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeletingChildId(child.id); }}
                        className="p-2.5 transition-all bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-brand-accent hover:border-brand-accent/30"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 line-clamp-1 mb-4 relative z-10">{child.name}</h3>
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-primary bg-brand-primary/10 px-4 py-1.5 rounded-full w-fit">
                      <MapPin size={14} />
                      <span>{child.posyanduName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <Calendar size={16} className="opacity-40" />
                      <span>{new Date(child.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <User size={16} className="opacity-40" />
                      <span>{child.parentsName}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChild(child);
                        setActiveView('details');
                      }}
                      className="text-xs font-bold text-brand-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      <TrendingUp size={14} />
                      Grafik & Riwayat
                    </button>
                    <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                      <Plus size={20} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {(activeView === 'add_child' || activeView === 'edit_child') && (
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="max-w-2xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl border border-emerald-50"
          >
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold text-slate-800">
                 {activeView === 'edit_child' ? 'Edit Data Balita' : 'Daftar Balita Baru'}
               </h2>
               <button onClick={() => { setActiveView('list'); resetForm(); }} className="p-2 hover:bg-slate-50 rounded-full">
                 <X size={24} className="text-slate-400" />
               </button>
            </div>
            
            <form className="space-y-8" onSubmit={handleSaveChild}>
              {/* Section 1: Data Balita */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User className="text-brand-primary" size={20} />
                  <h3 className="font-bold text-slate-800">Data Balita</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 ml-2">Nama Lengkap Balita</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Masukkan nama lengkap" 
                      required 
                      value={childForm.name}
                      onChange={(e) => setChildForm({...childForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 ml-2">NIK Balita</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Masukkan 16 digit NIK" 
                      value={childForm.nik}
                      onChange={(e) => setChildForm({...childForm, nik: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 ml-2">Tanggal Lahir</label>
                    <input 
                      type="date" 
                      className="input-field text-sm" 
                      required 
                      value={childForm.birthDate}
                      onChange={(e) => setChildForm({...childForm, birthDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 ml-2">Jenis Kelamin</label>
                    <select 
                      className="input-field" 
                      required
                      value={childForm.gender}
                      onChange={(e) => setChildForm({...childForm, gender: e.target.value as any})}
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 ml-2">Usia Baduta (Bulan)</label>
                    <div className="input-field bg-slate-50 flex items-center font-bold text-brand-primary">
                      {calculateChildAgeMonths(childForm.birthDate)} Bulan
                      <span className="text-[10px] text-slate-400 font-normal ml-2">(Otomatis)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 ml-2">BB Lahir (Kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="input-field" 
                      placeholder="Berat badan saat lahir" 
                      value={childForm.birthWeight}
                      onChange={(e) => setChildForm({...childForm, birthWeight: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 ml-2">PB Lahir (Cm)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="input-field" 
                      placeholder="Panjang badan saat lahir" 
                      value={childForm.birthHeight}
                      onChange={(e) => setChildForm({...childForm, birthHeight: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Data Orang Tua */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Users className="text-brand-primary" size={20} />
                  <h3 className="font-bold text-slate-800">Data Orang Tua</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Father Data */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Ayah</h4>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 ml-2">Nama Ayah</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Nama Lengkap Ayah" 
                        value={childForm.fatherName}
                        onChange={(e) => setChildForm({...childForm, fatherName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 ml-2">NIK Ayah</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="NIK Ayah" 
                        value={childForm.fatherNik}
                        onChange={(e) => setChildForm({...childForm, fatherNik: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 ml-2">Pekerjaan Ayah</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Contoh: Petani, Buruh, dsb" 
                        value={childForm.fatherOccupation}
                        onChange={(e) => setChildForm({...childForm, fatherOccupation: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Mother Data */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Ibu</h4>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 ml-2">Nama Ibu</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Nama Lengkap Ibu" 
                        value={childForm.motherName}
                        onChange={(e) => setChildForm({...childForm, motherName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 ml-2">NIK Ibu</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="NIK Ibu" 
                        value={childForm.motherNik}
                        onChange={(e) => setChildForm({...childForm, motherNik: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-2">TTL Ibu</label>
                        <input 
                          type="date" 
                          className="input-field text-xs" 
                          value={childForm.motherBirthDate}
                          onChange={(e) => setChildForm({...childForm, motherBirthDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-2">Usia Ibu (Th)</label>
                        <div className="input-field bg-slate-50 flex items-center font-bold text-brand-primary text-sm h-[42px]">
                          {calculateMotherAgeYears(childForm.motherBirthDate)} Th
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 ml-2">Pekerjaan Ibu</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Contoh: IRT, Guru, dsb" 
                        value={childForm.motherOccupation}
                        onChange={(e) => setChildForm({...childForm, motherOccupation: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Riwayat KB & Lokasi */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <CheckCircle2 className="text-brand-primary" size={20} />
                  <h3 className="font-bold text-slate-800">Riwayat KB & Lokasi</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 ml-2">Riwayat Penggunaan KB Ibu/Ayah</label>
                    <select 
                      className="input-field" 
                      value={childForm.kbHistory}
                      onChange={(e) => setChildForm({...childForm, kbHistory: e.target.value})}
                    >
                      <option value="">-- Pilih Status KB --</option>
                      <option value="Suntik">Suntik</option>
                      <option value="Pil">Pil</option>
                      <option value="Implan">Implan</option>
                      <option value="IUD">IUD</option>
                      <option value="MOW/MOP">MOW/MOP</option>
                      <option value="Kondom">Kondom</option>
                      <option value="Tidak KB">Tidak KB</option>
                    </select>
                  </div>
                  {childForm.kbHistory === 'Tidak KB' && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 ml-2">Alasan Tidak KB</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Contoh: Ingin hamil lagi, dsb" 
                        value={childForm.kbReason}
                        onChange={(e) => setChildForm({...childForm, kbReason: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 ml-2">Wilayah Posyandu</label>
                  <select 
                    className="input-field"
                    required
                    value={childForm.posyanduName}
                    onChange={(e) => setChildForm({...childForm, posyanduName: e.target.value})}
                  >
                    <option value="">-- Pilih Posyandu --</option>
                    {posyandus.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {currentUser?.posyanduName && (
                    <p className="text-[10px] text-brand-primary ml-2 font-bold select-none">* Akun Anda terikat pada {currentUser.posyanduName}. Anda dapat mengubahnya jika diperlukan.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 ml-2">Alamat (RT/Dusun)</label>
                  <textarea 
                    className="input-field min-h-[100px]" 
                    placeholder="Alamat lengkap di Desa Ladang Peris" 
                    required
                    value={childForm.address}
                    onChange={(e) => setChildForm({...childForm, address: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                 <button 
                   type="button"
                   onClick={() => { setActiveView('list'); resetForm(); }}
                   className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold hover:bg-slate-100"
                 >
                   Batal
                 </button>
                 <button 
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-primary text-white font-bold hover:bg-emerald-800 shadow-lg shadow-emerald-100"
                 >
                   <Save size={20} />
                   {activeView === 'edit_child' ? 'Simpan Perubahan' : 'Simpan Data'}
                 </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeView === 'details' && selectedChild && (
           <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
           >
             <div className="flex items-center justify-between">
                <button 
                  onClick={() => setActiveView('list')}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-brand-primary transition-all"
                >
                  <X size={20} />
                  Kembali ke Daftar
                </button>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setActiveView('add_measurement')}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 transition-all"
                   >
                     <Plus size={18} />
                     Catat Timbangan
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                      <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center text-3xl font-bold ${
                        selectedChild.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-500' : 'bg-brand-accent/5 text-brand-accent'
                      }`}>
                        {selectedChild.name.charAt(0)}
                      </div>
                      <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedChild.name}</h2>
                      <p className="text-slate-500 font-medium mb-6">NIK: {selectedChild.nik || '-'}</p>
                      
                      <div className="space-y-4">
                         <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                            <span className="text-slate-500 text-sm">Usia</span>
                            <span className="font-bold text-slate-800">{calculateChildAgeMonths(selectedChild.birthDate)} Bulan</span>
                         </div>
                         <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                            <span className="text-slate-500 text-sm">Jenis Kelamin</span>
                            <span className="font-bold text-slate-800">{selectedChild.gender}</span>
                         </div>
                         <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                            <span className="text-slate-500 text-sm">BB Lahir</span>
                            <span className="font-bold text-slate-800">{selectedChild.birthWeight || '-'} Kg</span>
                         </div>
                         <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                            <span className="text-slate-500 text-sm">PB Lahir</span>
                            <span className="font-bold text-slate-800">{selectedChild.birthHeight || '-'} Cm</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-brand-primary/5 p-8 rounded-[2.5rem] border border-brand-primary/10">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <User size={18} className="text-brand-primary" />
                        Info Keluarga
                      </h3>
                      <div className="space-y-3">
                         <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ibu</p>
                            <p className="font-bold text-slate-700">{selectedChild.motherName || '-'}</p>
                         </div>
                         <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ayah</p>
                            <p className="font-bold text-slate-700">{selectedChild.fatherName || '-'}</p>
                         </div>
                         <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Alamat</p>
                            <p className="text-sm text-slate-600 leading-relaxed">{selectedChild.address}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Charts & History */}
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                        <TrendingUp className="text-brand-primary" />
                        Grafik Tumbuh Kembang
                      </h3>
                      
                      <div className="h-[400px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={measurements
                                .filter(m => m.childId === selectedChild.id)
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map(m => ({
                                  date: new Date(m.date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
                                  berat: m.weight,
                                  tinggi: m.height
                                }))
                              }
                              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                              />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                unit="kg"
                              />
                              <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              />
                              <Legend wrapperStyle={{ paddingTop: '20px' }} />
                              <Line 
                                type="monotone" 
                                dataKey="berat" 
                                stroke="#0d9488" 
                                strokeWidth={4} 
                                dot={{ r: 6, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 8 }}
                                name="Berat Badan (Kg)"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="tinggi" 
                                stroke="#f43f5e" 
                                strokeWidth={4} 
                                dot={{ r: 6, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 8 }}
                                name="Tinggi Badan (Cm)"
                              />
                            </LineChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <History className="text-brand-primary" />
                        Riwayat Penimbangan
                      </h3>
                      
                      <div className="overflow-x-auto">
                         <table className="w-full text-left">
                            <thead>
                               <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                  <th className="py-4 px-4">Tanggal</th>
                                  <th className="py-4 px-4 text-center">BB (Kg)</th>
                                  <th className="py-4 px-4 text-center">TB (Cm)</th>
                                  <th className="py-4 px-4 text-center">Status Gizi</th>
                                  <th className="py-4 px-4 text-right">Aksi</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {measurements
                                 .filter(m => m.childId === selectedChild.id)
                                 .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                 .map((m) => (
                                   <tr key={m.id} className="hover:bg-slate-50/50 transition-all group">
                                      <td className="py-4 px-4">
                                         <span className="font-bold text-slate-700">{new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                      </td>
                                      <td className="py-4 px-4 text-center">
                                         <span className="font-mono font-bold text-teal-600">{m.weight}</span>
                                      </td>
                                      <td className="py-4 px-4 text-center">
                                         <span className="font-mono font-bold text-rose-500">{m.height}</span>
                                      </td>
                                      <td className="py-4 px-4 text-center">
                                         <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                                           m.stuntingStatus === 'Normal' ? 'bg-teal-50 text-teal-600' : 'bg-brand-accent/10 text-brand-accent'
                                         }`}>
                                            {m.stuntingStatus}
                                         </span>
                                      </td>
                                      <td className="py-4 px-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button 
                                           onClick={() => {
                                             if (onDeleteMeasurement) {
                                               onDeleteMeasurement(m.id);
                                             } else {
                                               setMeasurements(prev => prev.filter(meas => meas.id !== m.id));
                                             }
                                           }}
                                           className="p-2 text-slate-400 hover:text-red-500"
                                         >
                                            <Trash2 size={16} />
                                         </button>
                                      </td>
                                   </tr>
                                 ))}
                               {measurements.filter(m => m.childId === selectedChild.id).length === 0 && (
                                 <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">Belum ada riwayat penimbangan untuk anak ini.</td>
                                 </tr>
                               )}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>
             </div>
           </motion.div>
        )}
        {activeView === 'add_measurement' && selectedChild && (
           <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
           >
             <div className="bg-brand-primary p-8 rounded-t-[2.5rem] text-white flex items-center justify-between">
                <div>
                   <span className="text-xs font-bold uppercase tracking-widest opacity-80">Pencatatan Baru</span>
                   <h2 className="text-2xl font-bold">{selectedChild.name}</h2>
                </div>
                <button onClick={() => setActiveView('list')} className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                  <X size={24} />
                </button>
             </div>
             
             <div className="bg-white p-10 rounded-b-[2.5rem] shadow-xl border-x border-b border-emerald-50 max-h-[80vh] overflow-y-auto">
                <form className="space-y-10" onSubmit={handleSaveMeasurement}>
                   {/* Tanggal Pengukuran */}
                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={18} className="text-brand-primary" />
                        <label className="font-bold">Tanggal Pengukuran</label>
                      </div>
                      <input 
                        type="date" 
                        className="input-field" 
                        required 
                        value={measurementForm.date}
                        onChange={(e) => setMeasurementForm({...measurementForm, date: e.target.value})}
                      />
                   </div>

                   {/* Section 1: Antropometri */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Ruler className="text-brand-primary" size={20} />
                        <h3 className="font-bold text-slate-800">Data Antropometri</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-sm font-bold text-slate-600 ml-2">Berat Badan (Kg)</label>
                           <div className="relative">
                              <input 
                                type="number" 
                                step="0.1" 
                                className="input-field pr-12 text-2xl font-bold" 
                                placeholder="0.0" 
                                required 
                                value={measurementForm.weight}
                                onChange={(e) => setMeasurementForm({...measurementForm, weight: e.target.value})}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">KG</span>
                           </div>
                        </div>
                        
                        <div className="space-y-3">
                           <label className="text-sm font-bold text-slate-600 ml-2">Tinggi Badan (Cm)</label>
                           <div className="relative">
                              <input 
                                type="number" 
                                step="0.1" 
                                className="input-field pr-12 text-2xl font-bold" 
                                placeholder="0.0" 
                                required 
                                value={measurementForm.height}
                                onChange={(e) => setMeasurementForm({...measurementForm, height: e.target.value})}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">CM</span>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-sm font-bold text-slate-600 ml-2">LILA (Cm)</label>
                           <div className="relative">
                              <input 
                                type="number" 
                                step="0.1" 
                                className="input-field pr-12" 
                                placeholder="Lingkar Lengan Atas" 
                                value={measurementForm.armCircumference}
                                onChange={(e) => setMeasurementForm({...measurementForm, armCircumference: e.target.value})}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">CM</span>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-sm font-bold text-slate-600 ml-2">LIKA (Cm)</label>
                           <div className="relative">
                              <input 
                                type="number" 
                                step="0.1" 
                                className="input-field pr-12" 
                                placeholder="Lingkar Kepala" 
                                value={measurementForm.headCircumference}
                                onChange={(e) => setMeasurementForm({...measurementForm, headCircumference: e.target.value})}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">CM</span>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-600 ml-2">Status Gizi Stunting</label>
                        <select 
                          className="input-field" 
                          value={measurementForm.stuntingStatus}
                          onChange={(e) => setMeasurementForm({...measurementForm, stuntingStatus: e.target.value as any})}
                        >
                          <option value="Normal">Normal</option>
                          <option value="Risiko Stunting">Risiko Stunting</option>
                          <option value="Stunting">Stunting</option>
                        </select>
                      </div>
                   </div>

                   {/* Section 2: Kesehatan & Nutrisi */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <CheckCircle2 className="text-brand-primary" size={20} />
                        <h3 className="font-bold text-slate-800">Kesehatan & Nutrisi</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                          <span className="text-sm font-bold text-slate-700">ASI Eksklusif (0-6 Bln)</span>
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-brand-primary"
                            checked={measurementForm.exclusiveBreastfeeding}
                            onChange={(e) => setMeasurementForm({...measurementForm, exclusiveBreastfeeding: e.target.checked})}
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                          <span className="text-sm font-bold text-slate-700">Imunisasi Dasar Lengkap</span>
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-brand-primary"
                            checked={measurementForm.completeImmunization}
                            onChange={(e) => setMeasurementForm({...measurementForm, completeImmunization: e.target.checked})}
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                           <span className="text-sm font-bold text-slate-700">Masih Minum ASI</span>
                           <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-brand-primary"
                            checked={measurementForm.stillBreastfeeding}
                            onChange={(e) => setMeasurementForm({...measurementForm, stillBreastfeeding: e.target.checked})}
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                           <span className="text-sm font-bold text-slate-700">Protein Hewani 3x/Hari</span>
                           <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-brand-primary"
                            checked={measurementForm.proteinAnimal3x}
                            onChange={(e) => setMeasurementForm({...measurementForm, proteinAnimal3x: e.target.checked})}
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                           <span className="text-sm font-bold text-slate-700">BPJS Aktif / Jaminan Kes</span>
                           <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-brand-primary"
                            checked={measurementForm.hasBpjs}
                            onChange={(e) => setMeasurementForm({...measurementForm, hasBpjs: e.target.checked})}
                          />
                        </label>
                      </div>
                   </div>

                   {/* Section 3: Layanan & Pengasuhan */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Users className="text-brand-primary" size={20} />
                        <h3 className="font-bold text-slate-800">Layanan & Pengasuhan</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600 ml-2">Baduta Diasuh Oleh</label>
                          <select 
                            className="input-field" 
                            value={measurementForm.caredBy}
                            onChange={(e) => setMeasurementForm({...measurementForm, caredBy: e.target.value})}
                          >
                            <option value="Orang Tua">Orang Tua</option>
                            <option value="Nenek/Kakek">Nenek/Kakek</option>
                            <option value="Pengasuh">Pengasuh</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                            <span className="text-sm font-bold text-slate-700">Rutin ke Posyandu</span>
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 accent-brand-primary"
                              checked={measurementForm.routineToPosyandu}
                              onChange={(e) => setMeasurementForm({...measurementForm, routineToPosyandu: e.target.checked})}
                            />
                          </label>
                          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                            <span className="text-sm font-bold text-slate-700">Hadir BKB Bulan Ini</span>
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 accent-brand-primary"
                              checked={measurementForm.presentBKB}
                              onChange={(e) => setMeasurementForm({...measurementForm, presentBKB: e.target.checked})}
                            />
                          </label>
                          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                            <span className="text-sm font-bold text-slate-700">Pengisian KKA</span>
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 accent-brand-primary"
                              checked={measurementForm.kkaFilled}
                              onChange={(e) => setMeasurementForm({...measurementForm, kkaFilled: e.target.checked})}
                            />
                          </label>
                          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                            <span className="text-sm font-bold text-slate-700">Grafik KKA Sesuai</span>
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 accent-brand-primary"
                              checked={measurementForm.kkaGraphAppropriate}
                              onChange={(e) => setMeasurementForm({...measurementForm, kkaGraphAppropriate: e.target.checked})}
                            />
                          </label>
                        </div>
                      </div>
                   </div>

                   {/* Section 4: Riwayat & Lingkungan */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <MapPin className="text-brand-primary" size={20} />
                        <h3 className="font-bold text-slate-800">Riwayat & Lingkungan</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600 ml-2">Penyakit Bawaan Saat Lahir</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Tuliskan jika ada..." 
                            value={measurementForm.congenitalDisease}
                            onChange={(e) => setMeasurementForm({...measurementForm, congenitalDisease: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600 ml-2">Infeksi Menular (6 Bln Terakhir)</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Tuliskan jika ada..." 
                            value={measurementForm.infectiousDiseaseHistory}
                            onChange={(e) => setMeasurementForm({...measurementForm, infectiousDiseaseHistory: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                            <span className="text-sm font-bold text-slate-700">Terpapar Asap Rokok</span>
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 accent-brand-primary"
                              checked={measurementForm.exposedToSmoke}
                              onChange={(e) => setMeasurementForm({...measurementForm, exposedToSmoke: e.target.checked})}
                            />
                          </label>
                          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                            <span className="text-sm font-bold text-slate-700">Jamban Sehat</span>
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 accent-brand-primary"
                              checked={measurementForm.healthyLatrine}
                              onChange={(e) => setMeasurementForm({...measurementForm, healthyLatrine: e.target.checked})}
                            />
                          </label>
                          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                            <span className="text-sm font-bold text-slate-700">Sumber Air Bersih</span>
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 accent-brand-primary"
                              checked={measurementForm.cleanWaterSource}
                              onChange={(e) => setMeasurementForm({...measurementForm, cleanWaterSource: e.target.checked})}
                            />
                          </label>
                          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all">
                            <span className="text-sm font-bold text-slate-700">Dirujuk ke RS/Pusk</span>
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 accent-brand-primary"
                              checked={measurementForm.referredToHospital}
                              onChange={(e) => setMeasurementForm({...measurementForm, referredToHospital: e.target.checked})}
                            />
                          </label>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="font-bold text-slate-600 ml-2">Catatan Tambahan</label>
                      <textarea 
                        className="input-field min-h-[100px]" 
                        placeholder="Tuliskan catatan tambahan..."
                        value={measurementForm.notes}
                        onChange={(e) => setMeasurementForm({...measurementForm, notes: e.target.value})}
                      ></textarea>
                   </div>

                   <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 py-6 rounded-[2rem] bg-brand-primary text-white font-bold text-xl hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-100 sticky bottom-0"
                   >
                     <Save size={24} />
                     Simpan Data Pencatatan
                   </button>
                </form>
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingChildId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setDeletingChildId(null)}
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Hapus Data?</h2>
              <p className="text-slate-500 mb-8">Data balita dan riwayat timbangan akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingChildId(null)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100"
                >
                  Batal
                </button>
                <button 
                  onClick={() => handleDeleteChild(deletingChildId)}
                  className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
