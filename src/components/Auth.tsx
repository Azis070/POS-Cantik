import React from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, ShieldCheck, Heart, Info, Users } from 'lucide-react';
import { UserRole } from '../types';

interface AuthProps {
  onLogin: (role: UserRole, posyanduName?: string) => void;
  onRegister: (data: any) => void;
  posyandus: string[];
}

export default function Auth({ onLogin, onRegister, posyandus }: AuthProps) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);

  const [formData, setFormData] = React.useState({
    username: '',
    password: '',
    name: '',
    idNumber: '',
    email: '',
    posyanduName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      alert('Silakan pilih peran (Kader/Admin) terlebih dahulu.');
      return;
    }

    if (isLogin) {
      // For demo, we'll use the selected posyandu from the form if the role is Kader
      const posyandu = selectedRole === UserRole.KADER ? formData.posyanduName : undefined;
      // In this version, onLogin now accepts username and password
      (onLogin as any)(selectedRole, posyandu, formData.username, formData.password);
    } else {
      // Registration flow
      onRegister({ ...formData, role: selectedRole });
      alert(`Pendaftaran berhasil untuk ${formData.name}! Silakan menunggu verifikasi dari Admin.`);
      setIsLogin(true);
      // Reset form but keep posyandu
      setFormData(prev => ({...prev, name: '', username: '', email: '', idNumber: '', password: ''}));
    }
  };

  return (
    <div className="min-h-screen bg-brand-secondary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-primary/5 border border-brand-primary/5"
      >
        {/* Brand Side */}
        <div className="hidden md:flex flex-col justify-between rainbow-bg p-16 text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/20 rounded-full -ml-32 -mb-32 blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-12">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-white/30 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 flex-shrink-0"
              >
                <Heart className="text-white animate-pulse" fill="white" size={32} />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="font-display text-4xl font-bold leading-tight text-white tracking-tight uppercase">
                  POS Cantik
                </h1>
                <p className="text-[10px] font-bold text-pink-100/90 uppercase tracking-[0.1em] leading-tight">
                  Pelayanan Optimal Sistem <br />
                  Catatan Anak, Nutrisi, Timbangan <br />
                  & Informasi Kader
                </p>
              </div>
            </div>
            
            <div className="h-1 w-20 bg-white/30 rounded-full mb-8" />
            <p className="text-pink-50 text-xl leading-relaxed max-w-sm font-light">
              Mewujudkan generasi sehat Desa Ladang Peris melalui pendataan yang akurat dan pelayanan yang tulus.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-[2rem] border border-white/10">
               <div className="p-3 bg-white/20 rounded-xl">
                 <ShieldCheck size={24} className="text-white" />
               </div>
               <div>
                 <p className="text-sm font-bold text-white uppercase tracking-wider">Sistem Terverifikasi</p>
                 <p className="text-xs text-pink-100/80">Keamanan Data Terjamin</p>
               </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center md:text-left">
            <motion.h2 
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold text-slate-800 mb-3"
            >
              {isLogin ? 'Selamat Datang' : 'Pendaftaran Kader'}
            </motion.h2>
            <p className="text-slate-500 text-lg">
              {isLogin 
                ? 'Masuk untuk mengelola data Posyandu' 
                : 'Lengkapi identitas untuk verifikasi Admin'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setSelectedRole(UserRole.KADER)}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 ${
                  selectedRole === UserRole.KADER 
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary ring-4 ring-brand-primary/5' 
                    : 'border-slate-100 hover:border-brand-primary/30 text-slate-400 bg-slate-50/50'
                }`}
              >
                <div className={`p-3 rounded-2xl ${selectedRole === UserRole.KADER ? 'rainbow-bg text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                  <Users size={24} />
                </div>
                <span className="font-bold text-sm">Kader Posyandu</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole(UserRole.ADMIN)}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 ${
                  selectedRole === UserRole.ADMIN 
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary ring-4 ring-brand-primary/5' 
                    : 'border-slate-100 hover:border-brand-primary/30 text-slate-400 bg-slate-50/50'
                }`}
              >
                <div className={`p-3 rounded-2xl ${selectedRole === UserRole.ADMIN ? 'rainbow-bg text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                  <ShieldCheck size={24} />
                </div>
                <span className="font-bold text-sm">Administrator</span>
              </button>
            </div>

            {!isLogin && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  className="input-field"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Nama ID / Username"
                  className="input-field"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="Alamat Email (Opsional)"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="NIK / No. ID"
                  className="input-field"
                  required
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                />
                {selectedRole === UserRole.KADER && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <select
                      className="input-field"
                      required
                      value={formData.posyanduName}
                      onChange={(e) => setFormData({...formData, posyanduName: e.target.value})}
                    >
                      <option value="">-- Pilih Wilayah Posyandu --</option>
                      {posyandus.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {isLogin && (
                <input
                  type="text"
                  placeholder="Nama ID / Username"
                  className="input-field"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              )}
              <input
                type="password"
                placeholder="Kata Sandi"
                className="input-field"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={isLogin && !selectedRole}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
                isLogin && !selectedRole 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'rainbow-bg hover:brightness-110 shadow-pink-200'
              }`}
            >
              {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
              {isLogin ? 'Masuk Sekarang' : 'Daftar Akun'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500">
              {isLogin ? 'Belum punya akun kader?' : 'Sudah terdaftar?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-brand-primary font-bold hover:underline"
              >
                {isLogin ? 'Daftar Disini' : 'Masuk Disini'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
