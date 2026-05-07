import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import KaderDashboard from './components/KaderDashboard';
import { UserRole, UserProfile, UserStatus, Child, Measurement } from './types';
import { api } from './services/apiService';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Global States
  const [children, setChildren] = useState<Child[]>([]);
  const [kaders, setKaders] = useState<UserProfile[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [posyandus, setPosyandus] = useState<string[]>([]);

  // Function to fetch all data from backend
  const refreshData = async () => {
    try {
      const data = await api.getData();
      setChildren(data.children || []);
      setKaders(data.users || []);
      setMeasurements(data.measurements || []);
      setPosyandus(data.posyandus || []);
      setFetchError(null);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setFetchError("Gagal mengambil data dari server. Pastikan koneksi stabil.");
    }
  };

  useEffect(() => {
    // Initial load check
    const storedUser = localStorage.getItem('posyandu_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    refreshData().then(() => setLoading(false));

    // Poll for changes every 5 seconds to simulate real-time sync
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync current user if their profile in kaders list changes (e.g. posyandu name edit)
  useEffect(() => {
    if (user && user.role === UserRole.KADER) {
      const updatedProfile = kaders.find(k => k.uid === user.uid || k.email === user.email);
      if (updatedProfile && (
        updatedProfile.posyanduName !== user.posyanduName || 
        updatedProfile.status !== user.status ||
        updatedProfile.name !== user.name
      )) {
        setUser(updatedProfile);
        localStorage.setItem('posyandu_user', JSON.stringify(updatedProfile));
      }
    }
  }, [kaders, user]);

  const handleLogin = async (role: UserRole, posyanduName?: string, username?: string, password?: string) => {
    // Check if user exists in kaders list
    let existingUser = kaders.find(k => k.username === username && k.role === role);
    
    // In a real app we'd verify password on backend, but for this demo:
    if (existingUser && existingUser.password && existingUser.password !== password) {
      alert("Kata sandi salah.");
      return;
    }

    if (!existingUser && role === UserRole.ADMIN && username === 'admin' && password === 'password123') {
      // Default admin
      existingUser = {
        uid: 'admin-1',
        name: 'Administrator',
        username: 'admin',
        password: 'password123',
        email: 'admin@posyandu.id',
        idNumber: '1234567890',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        createdAt: new Date().toISOString()
      };
    }

    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('posyandu_user', JSON.stringify(existingUser));
    } else if (role === UserRole.KADER) {
      alert("Username belum terdaftar atau anda belum memilih peran yang tepat.");
    } else {
      alert("Kredensial salah.");
    }
  };

  const handleRegister = async (data: any) => {
    const newUser: UserProfile = {
      uid: Math.random().toString(36).substr(2, 9),
      name: data.name,
      username: data.username,
      password: data.password,
      email: data.email,
      idNumber: data.idNumber,
      role: data.role || UserRole.KADER,
      status: UserStatus.PENDING,
      posyanduName: data.role === UserRole.ADMIN ? undefined : data.posyanduName,
      createdAt: new Date().toISOString()
    };
    await api.saveUser(newUser);
    await refreshData();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('posyandu_user');
  };

  if (loading) return (
    <div className="min-h-screen bg-brand-secondary flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      <p className="font-display text-xl font-bold text-slate-800 animate-pulse">Ladang Peris</p>
    </div>
  );

  if (!user) {
    return (
      <div className="relative">
        <Auth 
          onLogin={handleLogin} 
          onRegister={handleRegister} 
          posyandus={posyandus}
        />
      </div>
    );
  }

  const filteredChildren = user.role === UserRole.ADMIN 
    ? children 
    : children.filter(c => c.posyanduName === user.posyanduName);

  return (
    <Layout 
      user={user} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout}
    >
      {fetchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-between shadow-sm animate-bounce">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
             <span className="text-sm font-bold">{fetchError}</span>
          </div>
          <button 
            onClick={() => refreshData()}
            className="text-xs bg-white px-4 py-1.5 rounded-lg shadow-sm font-bold hover:bg-red-50 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}
      {user.role === UserRole.ADMIN ? (
        <div className="max-w-6xl mx-auto">
          {(activeTab === 'dashboard' || activeTab === 'verification' || activeTab === 'manage_posyandu') && (
            <AdminDashboard 
              children={children} 
              setChildren={async (next) => {
                // If it's a function, we need the prev state. 
                // But for simplicity in this full-stack migration, we'll handle single item saves in components 
                // and use setChildren for UI updates.
                if (typeof next === 'function') {
                  const updated = (next as any)(children);
                  setChildren(updated);
                } else {
                  setChildren(next);
                }
              }}
              posyandus={posyandus}
              setPosyandus={async (next) => {
                const nextPosyandus = typeof next === 'function' ? (next as any)(posyandus) : next;
                setPosyandus(nextPosyandus);
                await api.savePosyandus(nextPosyandus);
              }}
              kaders={kaders}
              setKaders={async (next) => {
                const nextKaders = typeof next === 'function' ? (next as any)(kaders) : next;
                setKaders(nextKaders);
              }}
              measurements={measurements}
              onUpdateUser={async (uid, updates) => {
                await api.updateUser(uid, updates);
                await refreshData();
              }}
              onDeleteUser={async (uid) => {
                await api.deleteUser(uid);
                await refreshData();
              }}
              onUpdateChild={async (child) => {
                await api.saveChild(child);
                await refreshData();
              }}
              onDeleteChild={async (id) => {
                await api.deleteChild(id);
                await refreshData();
              }}
              onDeleteMeasurement={async (id) => {
                await api.deleteMeasurement(id);
                await refreshData();
              }}
            />
          )}
          {activeTab === 'reports' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Laporan Keseluruhan Desa</h2>
              <p className="text-slate-500">Fitur laporan mendalam sedang disiapkan oleh sistem.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {['dashboard', 'children', 'measurements'].includes(activeTab) && (
            <KaderDashboard 
              children={filteredChildren} 
              setChildren={async (next) => {
                // Handle saves to API
                const nextChildren = typeof next === 'function' ? (next as any)(children) : next;
                // This is a bit complex due to local vs global. 
                // components should ideally call api.saveChild directly.
                setChildren(nextChildren);
              }}
              posyandus={posyandus}
              currentUser={user}
              measurements={measurements}
              setMeasurements={async (next) => {
                setMeasurements(typeof next === 'function' ? (next as any)(measurements) : next);
              }}
              onSaveChild={async (child) => {
                await api.saveChild(child);
                await refreshData();
              }}
              onSaveMeasurement={async (m) => {
                await api.saveMeasurement(m);
                await refreshData();
              }}
              onDeleteChild={async (id) => {
                await api.deleteChild(id);
                await refreshData();
              }}
              onDeleteMeasurement={async (id) => {
                await api.deleteMeasurement(id);
                await refreshData();
              }}
            />
          )}
        </div>
      )}
    </Layout>
  );
}
