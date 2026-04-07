import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { 
  Users, Upload, Monitor, Settings, LogOut, ChevronRight, ChevronLeft, 
  Printer, QrCode, GraduationCap, MapPin,
  Maximize2, Minimize2, Trash2, Edit2, CheckCircle, UserPlus, Search,
  Grid, List as ListIcon, Camera, PieChart as PieChartIcon, BarChart as BarChartIcon, TrendingUp,
  FileSpreadsheet, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Student {
  id: string;
  name: string;
  nisn?: string;
  class?: string;
  major: string;
  gender?: 'L' | 'P';
  grade?: number;
  predicate?: string;
  achievement?: string;
  parentName?: string;
  address?: string;
  photoUrl?: string;
  seatNumber?: number;
  isCalled?: boolean;
  order?: number;
}

interface AppUser {
  email: string;
  role: 'admin' | 'staff';
  displayName?: string;
  password?: string;
}

// --- Components ---

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<any>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      try {
        const parsed = JSON.parse(event.error.message);
        setErrorInfo(parsed);
        setHasError(true);
      } catch {
        // Not a firestore error
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Waduh, Ada Masalah!</h2>
          <p className="text-gray-600 mb-6">Terjadi kesalahan saat mengakses data. Silakan hubungi admin atau coba lagi nanti.</p>
          {errorInfo && (
            <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono overflow-auto max-h-40 mb-6">
              <pre>{JSON.stringify(errorInfo, null, 2)}</pre>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Muat Ulang Aplikasi
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Cek email Anda untuk konfirmasi pendaftaran!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan autentikasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[32px] shadow-2xl max-w-md w-full text-center border border-gray-100"
      >
        <div className="w-20 h-20 bg-[#2e7d32] rounded-full flex items-center justify-center mx-auto mb-8">
          <Users className="text-white w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-4">Wisuda SMK</h1>
        <p className="text-gray-500 mb-8">
          {isSignUp ? 'Buat akun baru untuk mengelola data.' : 'Masuk untuk mengelola data wisuda.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none"
              placeholder="admin@sekolah.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full gradient-btn text-white py-4 rounded-full font-medium transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : (isSignUp ? 'Daftar Sekarang' : 'Masuk Sekarang')}
          </motion.button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-6 text-sm text-gray-500 hover:text-[#2e7d32] transition-colors"
        >
          {isSignUp ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar di sini'}
        </button>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'staff' | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [view, setView] = useState<'admin' | 'projector'>('admin');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'upload' | 'seating' | 'invitation' | 'registration' | 'users' | 'settings'>('dashboard');
  const [schoolName, setSchoolName] = useState('SMK NEGERI 1 KOTA');
  const [schoolLogo, setSchoolLogo] = useState('');
  const [eventDay, setEventDay] = useState('Senin');
  const [eventDate, setEventDate] = useState('15 Juni 2026');
  const [invitationMessage, setInvitationMessage] = useState('Mengharap Kehadiran Anda Pada Acara Wisuda & Pelepasan Siswa-Siswi Kami.');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [registrationFilter, setRegistrationFilter] = useState<'all' | 'registered' | 'unregistered'>('all');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<number | null>(null);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingData, setIsUploadingData] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<AppUser>>({ email: '', role: 'staff', password: '' });
  const [isSavingUser, setIsSavingUser] = useState(false);

  const fetchUserRole = async (email: string) => {
    // Hardcoded super admin
    if (email === 'ipg.gm2025@gmail.com') {
      setUserRole('admin');
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .single();
    
    if (data) {
      setUserRole(data.role);
    } else {
      // If user is not in the table, they are just a regular user (staff)
      // but we can also set to null if we want to block access
      setUserRole('staff'); 
    }
  };

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u?.email) fetchUserRole(u.email);
      setIsAuthReady(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u?.email) fetchUserRole(u.email);
      setIsAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('schoolName', schoolName);
  }, [schoolName]);

  useEffect(() => {
    localStorage.setItem('schoolLogo', schoolLogo);
  }, [schoolLogo]);

  const stats = useMemo(() => {
    const total = students.length;
    const registered = students.filter(s => s.isCalled).length;
    const unregistered = total - registered;
    
    const majorMap: Record<string, number> = {};
    students.forEach(s => {
      if (s.major) majorMap[s.major] = (majorMap[s.major] || 0) + 1;
    });
    const majorData = Object.entries(majorMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const genderMap: Record<string, number> = { 'L': 0, 'P': 0 };
    students.forEach(s => {
      if (s.gender === 'L' || s.gender === 'P') genderMap[s.gender]++;
    });
    const genderData = [
      { name: 'Laki-laki', value: genderMap['L'] },
      { name: 'Perempuan', value: genderMap['P'] }
    ].filter(d => d.value > 0);

    return { total, registered, unregistered, majorData, genderData };
  }, [students]);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) {
      console.error("Error fetching students:", error);
    } else {
      setStudents(data || []);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStudent) return;

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar! Maksimal 2MB.');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, dll).');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `student-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase Storage Error:', uploadError);
        if (uploadError.message.includes('bucket not found')) {
          throw new Error('Bucket "photos" tidak ditemukan di Supabase. Silakan buat bucket bernama "photos" di dashboard Supabase Anda.');
        }
        if (uploadError.message.includes('violates row-level security policy')) {
          throw new Error('Izin unggah ditolak (RLS Policy). Anda perlu menambahkan kebijakan "INSERT" untuk bucket "photos" di dashboard Supabase agar bisa mengunggah foto.');
        }
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      if (!data || !data.publicUrl) {
        throw new Error('Gagal mendapatkan URL publik untuk foto.');
      }

      setEditingStudent({ ...editingStudent, photoUrl: data.publicUrl });
      toast.success('Foto berhasil diunggah!');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error('Gagal mengunggah foto: ' + (error.message || 'Terjadi kesalahan teknis.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran logo sekolah terlalu besar! Maksimal 2MB.');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, dll).');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `school-logo-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `school-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase Storage Error:', uploadError);
        if (uploadError.message.includes('bucket not found')) {
          throw new Error('Bucket "photos" tidak ditemukan di Supabase. Silakan buat bucket bernama "photos" di dashboard Supabase Anda.');
        }
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      if (!data || !data.publicUrl) {
        throw new Error('Gagal mendapatkan URL publik untuk logo.');
      }

      setSchoolLogo(data.publicUrl);
      toast.success('Logo sekolah berhasil diunggah!');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error('Gagal mengunggah logo: ' + (error.message || 'Terjadi kesalahan teknis.'));
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.warn("User fetch failed - likely not an admin", error);
    } else {
      setAppUsers(data || []);
    }
  };

  const saveUserToDb = async () => {
    if (!editingUser?.email || !editingUser?.role) {
      toast.error('Email dan Role harus diisi');
      return;
    }
    
    setIsSavingUser(true);
    try {
      // Use backend API to handle user creation and role assignment
      const response = await fetch('/api/users/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingUser.email,
          role: editingUser.role,
          password: editingUser.password
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan user');
      }

      toast.success('User berhasil disimpan');
      setIsUserModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error("Save user error:", err);
      toast.error('Gagal menyimpan user: ' + err.message);
    } finally {
      setIsSavingUser(false);
    }
  };

  const deleteUserFromDb = async (email: string) => {
    if (email === 'ipg.gm2025@gmail.com') {
      toast.error('Admin utama tidak dapat dihapus');
      return;
    }
    if (!confirm(`Hapus akses untuk ${email}?`)) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('email', email);
      if (error) throw error;
      toast.success('User berhasil dihapus');
      fetchUsers();
    } catch (err: any) {
      console.error("Delete user error:", err);
      toast.error('Gagal menghapus user: ' + err.message);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .single();
      
      if (data) {
        setSchoolName(data.name || 'SMK NEGERI 1 KOTA');
        setSchoolLogo(data.logo_url || '');
        setEventDay(data.event_day || 'Senin');
        setEventDate(data.event_date || '15 Juni 2026');
        setInvitationMessage(data.invitation_message || 'Mengharap Kehadiran Anda Pada Acara Wisuda & Pelepasan Siswa-Siswi Kami.');
      } else if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.warn("Settings fetch error:", error);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  const saveSettingsToDb = async () => {
    setIsSavingSettings(true);
    try {
      // We assume there's only one row with id 1 for school settings
      const { error } = await supabase
        .from('school_settings')
        .upsert({ 
          id: 1, 
          name: schoolName, 
          logo_url: schoolLogo,
          event_day: eventDay,
          event_date: eventDate,
          invitation_message: invitationMessage,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Pengaturan sekolah berhasil disimpan ke database!');
    } catch (err: any) {
      console.error("Save settings error:", err);
      toast.error('Gagal menyimpan ke database: ' + (err.message || 'Pastikan tabel "school_settings" sudah dibuat di Supabase.'));
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    if (!user || !isAuthReady) return;

    fetchStudents();
    fetchUsers();
    fetchSettings();

    // Real-time subscription for students
    const studentChannel = supabase
      .channel('students_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        fetchStudents();
      })
      .subscribe();

    // Real-time subscription for users
    const userChannel = supabase
      .channel('users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    // Real-time subscription for settings
    const settingsChannel = supabase
      .channel('settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'school_settings' }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(studentChannel);
      supabase.removeChannel(userChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [user, isAuthReady]);

  const statsByMajor = useMemo(() => {
    const majors: Record<string, number> = {};
    students.forEach(s => {
      majors[s.major] = (majors[s.major] || 0) + 1;
    });
    return Object.entries(majors)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [students]);

  const statsByGender = useMemo(() => {
    const genders = { L: 0, P: 0, Unknown: 0 };
    students.forEach(s => {
      if (s.gender === 'L') genders.L++;
      else if (s.gender === 'P') genders.P++;
      else genders.Unknown++;
    });
    return [
      { name: 'Laki-laki', value: genders.L, color: '#2563eb' },
      { name: 'Perempuan', value: genders.P, color: '#db2777' }
    ].filter(g => g.value > 0);
  }, [students]);

  const registrationStats = useMemo(() => {
    const registered = students.filter(s => s.isCalled).length;
    const unregistered = students.length - registered;
    return [
      { name: 'Sudah Hadir', value: registered, color: '#16a34a' },
      { name: 'Belum Hadir', value: unregistered, color: '#ea580c' }
    ];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = s.name.toLowerCase().includes(query) ||
                          s.major.toLowerCase().includes(query) ||
                          (s.class && s.class.toLowerCase().includes(query)) ||
                          (s.parentName && s.parentName.toLowerCase().includes(query)) ||
                          (s.address && s.address.toLowerCase().includes(query)) ||
                          (s.nisn && s.nisn.includes(searchQuery));
      
      if (activeTab === 'registration') {
        if (registrationFilter === 'registered') return matchesSearch && s.isCalled;
        if (registrationFilter === 'unregistered') return matchesSearch && !s.isCalled;
      }
      
      return matchesSearch;
    });
  }, [students, searchQuery, registrationFilter, activeTab]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingData(true);

    const processData = async (results: any[]) => {
      let nextOrder = Math.max(0, ...students.map(s => s.order || 0), ...students.map(s => s.seatNumber || 0)) + 1;
      
      for (const row of results) {
        if (!row.name) continue;
        
        let major = row.major || '';
        const cls = row.class || '';
        
        // Auto-determine major from class if major is missing
        if (!major && cls) {
          if (cls.includes('MM')) major = 'Multimedia';
          else if (cls.includes('TKR')) major = 'Teknik Kendaraan Ringan';
          else if (cls.includes('DKV')) major = 'Desain Komunikasi Visual';
        }

        if (!major) continue; // Still need a major at the end

        const id = row.id || Math.random().toString(36).substring(7);
        const gradeVal = Number(row.grade) || 0;
        let autoPredicate = row.predicate || 'Kurang';
        if (!row.predicate) {
          if (gradeVal >= 92) autoPredicate = 'Dengan Pujian';
          else if (gradeVal >= 83) autoPredicate = 'Sangat Memuaskan';
          else if (gradeVal >= 75) autoPredicate = 'Memuaskan';
        }

        const seatNum = Number(row.seatNumber) || nextOrder;
        if (!row.seatNumber) nextOrder++;

        const gender = row.gender === 'L' || row.gender === 'P' ? row.gender : undefined;

        try {
          const { error } = await supabase
            .from('students')
            .upsert({
              id: id,
              name: (row.name || '').toUpperCase(),
              nisn: row.nisn ? String(row.nisn).padStart(10, '0') : '',
              class: cls,
              major: major,
              gender: gender,
              grade: gradeVal,
              predicate: autoPredicate,
              achievement: (row.achievement || '').toUpperCase(),
              parentName: (row.parentName || '').toUpperCase(),
              address: (row.address || '').toUpperCase(),
              photoUrl: row.photoUrl || '',
              seatNumber: seatNum,
              isCalled: false,
              order: seatNum
            });
          if (error) throw error;
        } catch (error) {
          console.error("Upload error:", error);
        }
      }
      setIsUploadingData(false);
      setSelectedFile(null);
      alert('Data berhasil diunggah!');
    };

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        complete: (results) => processData(results.data),
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processData(data);
      };
      reader.readAsBinaryString(file);
    }
  };

  const toggleCalled = async (student: Student) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ isCalled: !student.isCalled })
        .eq('id', student.id);
      if (error) throw error;
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchStudents();
      setDeletingStudentId(null);
      alert('Data siswa berhasil dihapus.');
    } catch (error: any) {
      console.error("Delete error:", error);
      alert('Gagal menghapus data: ' + (error.message || 'Terjadi kesalahan teknis.'));
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const downloadTemplate = () => {
    const headers = [
      {
        name: 'Budi Santoso',
        nisn: '1234567890',
        gender: 'L',
        class: '12 MM 1',
        major: 'Multimedia',
        grade: 85.5,
        predicate: 'Sangat Memuaskan',
        achievement: 'Juara 1 LKS Tingkat Provinsi',
        parentName: 'Slamet',
        address: 'Jl. Merdeka No. 123, Jakarta',
        photoUrl: 'https://picsum.photos/seed/student1/400/500',
        seatNumber: 1,
        order: 1
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Wisuda");
    XLSX.writeFile(wb, "Template_Data_Wisuda_SMK.xlsx");
  };

  if (!isAuthReady) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  if (!user) return <Login />;

  if (view === 'projector') {
    const currentStudent = students[currentStudentIndex];
    
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a2e0a] via-[#1b5e20] to-[#0a2e0a] text-white z-50 flex flex-col overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
              x: [0, 50, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-green-500/20 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.1, 0.05],
              x: [0, -30, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-yellow-500/10 rounded-full blur-[120px]"
          />
          
          {/* Floating Particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                opacity: 0 
              }}
              animate={{ 
                y: [null, "-100%"],
                opacity: [0, 0.4, 0],
                scale: [0, 1, 0]
              }}
              transition={{ 
                duration: Math.random() * 10 + 10, 
                repeat: Infinity, 
                delay: Math.random() * 10,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
            />
          ))}
        </div>

        {/* School Identity Section (Header) */}
        <div className="relative z-10 pt-8 sm:pt-12 pb-4 flex flex-col items-center gap-2 sm:gap-4 text-center px-6 shrink-0">
          <motion.div 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center overflow-hidden drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] bg-white/5 p-1.5 rounded-xl backdrop-blur-sm border border-white/10"
          >
            {schoolLogo ? (
              <img src={schoolLogo} className="w-full h-full object-contain" alt="Logo" />
            ) : (
              <Users className="w-10 h-10 text-white/30" />
            )}
          </motion.div>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-serif font-bold tracking-[0.05em] leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] max-w-4xl">{schoolName}</h3>
            <div className="flex items-center justify-center gap-3 mt-1 sm:mt-2">
              <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent to-white/40"></div>
              <p className="text-[10px] sm:text-xs lg:text-sm font-mono text-[#A5D6A7] uppercase tracking-[0.3em] font-bold">Acara Wisuda & Pelepasan</p>
              <div className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent to-white/40"></div>
            </div>
          </motion.div>
        </div>

        <div className="absolute top-4 right-4 flex gap-4 no-print z-30">
          <button onClick={() => setView('admin')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={toggleFullscreen} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {currentStudent ? (
              <motion.div 
                key={currentStudent.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 p-6 lg:p-12 overflow-y-auto lg:overflow-hidden"
              >
                {/* Photo Section */}
                <div className="w-full lg:w-[40%] flex justify-center lg:justify-end shrink-0">
                  <motion.div 
                    initial={{ opacity: 0, x: -100, rotateY: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                    transition={{ 
                      duration: 1, 
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative group w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[450px]"
                  >
                    {/* Animated glow effect */}
                    <div className="absolute -inset-6 bg-gradient-to-tr from-green-500/30 via-yellow-400/10 to-green-500/30 rounded-[32px] blur-3xl opacity-50 animate-pulse"></div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02, rotateY: 5 }}
                      className="relative w-full aspect-[3/4] bg-gray-800 rounded-[24px] overflow-hidden border-4 sm:border-8 border-white shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                    >
                      {currentStudent.photoUrl ? (
                        <motion.img 
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 1.2 }}
                          src={currentStudent.photoUrl} 
                          className="w-full h-full object-cover" 
                          alt={currentStudent.name} 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <Users className="w-24 sm:w-32 h-24 sm:h-32 text-gray-700" />
                        </div>
                      )}
                      
                      {/* Overlay gradient for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Info Section */}
                <div className="w-full lg:w-[60%] text-center lg:text-left overflow-visible">
                  <div className="max-w-3xl space-y-6 lg:space-y-10">
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      <h2 className="text-xs sm:text-lg font-mono text-[#A5D6A7] uppercase tracking-[0.2em] mb-1 font-bold drop-shadow-md">Wisudawan</h2>
                      <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold leading-tight mb-3 bg-gradient-to-r from-white via-green-50 to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer drop-shadow-2xl tracking-tight">
                        {currentStudent.name}
                      </h1>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: 120 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="h-1 bg-gradient-to-r from-[#81C784] to-yellow-400 mx-auto lg:mx-0 rounded-full shadow-[0_0_15px_rgba(129,199,132,0.5)]"
                      />
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="space-y-4 sm:space-y-5"
                    >
                      {[
                        { label: 'Kelas', value: currentStudent.class || '-', icon: GraduationCap, color: 'text-blue-400' },
                        { label: 'Orang Tua / Wali', value: currentStudent.parentName || '-', icon: Users, color: 'text-green-400' },
                        { label: 'Alamat', value: currentStudent.address || '-', icon: MapPin, color: 'text-yellow-400', isSmall: true }
                      ].map((item, index) => (
                        <motion.div 
                          key={item.label}
                          initial={{ x: 30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.5 + (index * 0.1) }}
                          className="flex items-start gap-4 sm:gap-5 bg-white/5 p-4 sm:p-5 rounded-[24px] border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group"
                        >
                          <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 flex items-center justify-center shadow-inner border border-white/5 group-hover:scale-110 transition-transform shrink-0", item.color)}>
                            <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] sm:text-[10px] font-mono text-white/40 uppercase tracking-widest mb-0.5 font-bold">{item.label}</p>
                            <p className={cn(
                              "font-medium text-white leading-tight truncate",
                              item.isSmall ? "text-sm sm:text-lg italic font-serif opacity-90" : "text-lg sm:text-2xl"
                            )}>
                              {item.value}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div>
                  <h1 className="text-3xl font-serif">Belum Ada Siswa Dipilih</h1>
                  <p className="text-gray-500 mt-2">Silakan pilih siswa dari panel admin.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls (Footer) */}
        <div className="relative z-30 py-6 flex justify-center shrink-0">
          <div className="flex items-center gap-4 sm:gap-8 no-print bg-black/40 backdrop-blur-xl px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/10 shadow-2xl shadow-black/50">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentStudentIndex(prev => Math.max(0, prev - 1))}
              className="p-2 sm:p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all border border-white/10"
            >
              <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </motion.button>
            
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-2 font-mono text-xs sm:text-base">
                <span className="text-white font-bold">{currentStudentIndex + 1}</span>
                <span className="text-white/30">/</span>
                <span className="text-white/50">{students.length}</span>
              </div>
              <div className="w-16 sm:w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStudentIndex + 1) / students.length) * 100}%` }}
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentStudentIndex(prev => Math.min(students.length - 1, prev + 1))}
              className="p-2 sm:p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all border border-white/10"
            >
              <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F5F5F0] flex relative">
        <Toaster position="top-center" richColors />
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1a1a1a] text-white flex items-center justify-between px-6 z-30 border-b border-white/5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
              {schoolLogo ? (
                <img src={schoolLogo} className="w-full h-full object-contain" alt="Logo" />
              ) : (
                <Users className="w-5 h-5 text-white/50" />
              )}
            </div>
            <h1 className="text-sm font-serif font-bold truncate max-w-[200px]">{schoolName}</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <Minimize2 className="w-6 h-6" /> : <ListIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          "w-80 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] text-white flex flex-col p-8 fixed h-full z-50 border-r border-white/5 shadow-2xl transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mb-12 px-2 text-center"
          >
            <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
              {schoolLogo ? (
                <img src={schoolLogo} className="w-full h-full object-contain" alt="Logo" />
              ) : (
                <Users className="w-10 h-10 text-white/50" />
              )}
            </div>
            <h1 className="text-xl font-serif font-bold leading-tight">{schoolName}</h1>
          </motion.div>

          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
            {[
              { id: 'dashboard', icon: BarChartIcon, label: 'Dashboard' },
              { id: 'list', icon: ListIcon, label: 'Data Siswa' },
              { id: 'upload', icon: Upload, label: 'Unggah Data' },
              { id: 'seating', icon: Grid, label: 'Tempat Duduk' },
              { id: 'invitation', icon: Printer, label: 'Cetak Undangan' },
              { id: 'registration', icon: QrCode, label: 'Registrasi Ulang' },
              { id: 'users', icon: UserPlus, label: 'Manajemen User', adminOnly: true },
              { id: 'settings', icon: Settings, label: 'Pengaturan Sekolah', adminOnly: true },
            ].map((tab) => {
              if (tab.adminOnly && userRole !== 'admin') return null;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-[#2e7d32] to-[#43a047] text-white shadow-lg shadow-[#2e7d32]/20" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <tab.icon className={cn(
                    "w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110",
                    activeTab === tab.id ? "text-white" : "text-gray-500 group-hover:text-white"
                  )} />
                  <span className="font-bold relative z-10 text-base">{tab.label}</span>
                </button>
              );
            })}
            <div className="pt-8 border-t border-white/10 mt-8">
              <button 
                onClick={() => {
                  setView('projector');
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all border border-white/5"
              >
                <Monitor className="w-5 h-5" />
                <span>Tampilan Layar</span>
              </button>
            </div>
          </nav>

            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 mb-6 px-2">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} className="w-10 h-10 rounded-full border border-white/20" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white/40" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-80 min-h-screen bg-[#F8F9FA] relative overflow-y-auto custom-scrollbar pt-16 lg:pt-0">
          {/* Decorative Background Gradients */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/20 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/10 rounded-full blur-[120px] -z-10" />

          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight"
                >
                  {activeTab === 'dashboard' && "Dashboard Ringkasan"}
                  {activeTab === 'list' && "Manajemen Siswa"}
                  {activeTab === 'upload' && "Unggah Data Siswa"}
                  {activeTab === 'seating' && "Pengaturan Tempat Duduk"}
                  {activeTab === 'invitation' && "Cetak Kartu Undangan"}
                  {activeTab === 'registration' && "Registrasi Ulang"}
                  {activeTab === 'users' && "Manajemen User"}
                  {activeTab === 'settings' && "Pengaturan Sekolah"}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-500 mt-2 font-medium"
                >
                  {activeTab === 'dashboard' ? "Ringkasan statistik data wisudawan." :
                   activeTab === 'settings' ? "Sesuaikan identitas sekolah Anda." : 
                   activeTab === 'invitation' ? "Cetak kartu undangan untuk wisudawan." :
                   activeTab === 'registration' ? "Kelola kehadiran wisudawan di lokasi." :
                   "Kelola informasi wisudawan SMK Anda di sini."}
                </motion.p>
              </div>
              
              {activeTab === 'list' && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                  <div className="relative group flex-1 sm:flex-none">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#2e7d32] transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Cari nama atau jurusan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e7d32] w-full sm:w-64 lg:w-80 shadow-sm transition-all"
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setEditingStudent({
                        name: '',
                        major: '',
                        grade: 0,
                        predicate: '',
                        achievement: '',
                        parentName: '',
                        address: '',
                        photoUrl: '',
                        seatNumber: students.length + 1,
                        order: students.length + 1,
                        isCalled: false
                      });
                      setDuplicateWarning(null);
                      setIsStudentModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-[#2e7d32] to-[#43a047] text-white px-6 md:px-8 py-3 rounded-2xl font-bold shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span className="whitespace-nowrap">Tambah Siswa</span>
                  </motion.button>
                </div>
              )}
            </header>

            <div className="transition-all duration-500">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Siswa', value: stats.total, icon: Users, color: 'bg-blue-500' },
                    { label: 'Sudah Hadir', value: stats.registered, icon: CheckCircle, color: 'bg-green-500' },
                    { label: 'Belum Hadir', value: stats.unregistered, icon: Monitor, color: 'bg-orange-500' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-6 group hover:shadow-2xl transition-all duration-500"
                    >
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                        <stat.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-mono text-gray-400 uppercase tracking-widest font-bold">{stat.label}</p>
                        <p className="text-4xl font-serif font-bold text-gray-900 mt-1">{stat.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Major Distribution */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-xl border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-3">
                        <BarChartIcon className="w-6 h-6 text-[#2e7d32]" />
                        Distribusi Jurusan
                      </h3>
                    </div>
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.majorData} layout="vertical" margin={{ left: 40, right: 40 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100} 
                            tick={{ fontSize: 12, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="#2e7d32" 
                            radius={[0, 10, 10, 0]} 
                            barSize={30}
                            label={{ position: 'right', fontSize: 12, fontWeight: 700, fill: '#666' }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Top Students */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100"
                  >
                    <h3 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-3 mb-8">
                      <TrendingUp className="w-6 h-6 text-yellow-500" />
                      Wisudawan Terbaik
                    </h3>
                    <div className="space-y-6">
                      {students
                        .filter(s => s.grade)
                        .sort((a, b) => (b.grade || 0) - (a.grade || 0))
                        .slice(0, 5)
                        .map((student, idx) => (
                          <div key={student.id} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{student.name}</p>
                              <p className="text-xs text-gray-500 truncate">{student.major}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold text-[#2e7d32]">{student.grade}</p>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">{student.predicate}</p>
                            </div>
                          </div>
                        ))}
                      {students.filter(s => s.grade).length === 0 && (
                        <div className="text-center py-12 text-gray-400 italic">Belum ada data nilai</div>
                      )}
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Gender Distribution */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-3">
                        <PieChartIcon className="w-6 h-6 text-[#2e7d32]" />
                        Distribusi Gender
                      </h3>
                    </div>
                    <div className="h-[350px] w-full flex items-center justify-center">
                      {stats.genderData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.genderData}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={8}
                              dataKey="value"
                            >
                              <Cell fill="#3b82f6" />
                              <Cell fill="#ec4899" />
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-gray-400 font-medium">Belum ada data gender</div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Recent Activity / Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                      <h3 className="text-3xl font-serif font-bold">Siap untuk Wisuda?</h3>
                      <p className="text-gray-400 max-w-md">Kelola data wisudawan dengan mudah. Mulai dari unggah data hingga pengaturan tempat duduk dan registrasi ulang.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                      <button 
                        onClick={() => setActiveTab('list')}
                        className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95"
                      >
                        Lihat Data Siswa
                      </button>
                      <button 
                        onClick={() => setActiveTab('registration')}
                        className="px-8 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all active:scale-95 border border-green-500/30"
                      >
                        Mulai Registrasi
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'list' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-3 md:px-6 py-5 text-xs md:text-sm font-black text-gray-400 uppercase tracking-[0.2em] w-16">No</th>
                        <th className="px-3 md:px-6 py-5 text-xs md:text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Nama</th>
                        <th className="px-3 md:px-6 py-5 text-xs md:text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Kelas</th>
                        <th className="px-3 md:px-6 py-5 text-xs md:text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Orang Tua</th>
                        <th className="px-3 md:px-6 py-5 text-xs md:text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Alamat</th>
                        <th className="px-3 md:px-6 py-5 text-xs md:text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-3 md:px-6 py-5 text-xs md:text-sm font-black text-gray-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <AnimatePresence>
                        {filteredStudents.map((student, index) => (
                          <motion.tr 
                            key={student.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="hover:bg-green-50/30 transition-colors group"
                          >
                            <td className="px-3 md:px-6 py-5 text-sm font-bold text-gray-400">
                              {index + 1}
                            </td>
                            <td className="px-2 md:px-6 py-5">
                              <div className="flex items-center gap-2 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 group-hover:border-green-200 transition-colors flex-shrink-0">
                                  {student.photoUrl ? (
                                    <img src={student.photoUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Users className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm md:text-lg leading-tight">{student.name}</p>
                                  <p className="text-[10px] md:text-sm text-gray-400 font-bold uppercase tracking-wider">{student.major}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 md:px-6 py-5">
                              <span className="text-sm font-bold text-gray-700">{student.class || '-'}</span>
                            </td>
                            <td className="px-2 md:px-6 py-5">
                              <span className="text-sm text-gray-600 font-medium">{student.parentName || '-'}</span>
                            </td>
                            <td className="px-2 md:px-6 py-5 max-w-xs">
                              <p className="text-xs text-gray-500 line-clamp-2">{student.address || '-'}</p>
                            </td>
                            <td className="px-2 md:px-6 py-5">
                              <button 
                                onClick={() => toggleCalled(student)}
                                className={cn(
                                  "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black uppercase transition-all",
                                  student.isCalled ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                )}
                              >
                                {student.isCalled ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> : <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-current" />}
                                <span className="hidden sm:inline">{student.isCalled ? "Hadir" : "Belum"}</span>
                                <span className="sm:hidden">{student.isCalled ? "H" : "B"}</span>
                              </button>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end gap-1 md:gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingStudent(student);
                                    setDuplicateWarning(null);
                                    setIsStudentModalOpen(true);
                                  }}
                                  className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Ubah"
                                >
                                  <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setCurrentStudentIndex(students.findIndex(s => s.id === student.id));
                                    setView('projector');
                                  }}
                                  className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Tampilkan di Layar"
                                >
                                  <Monitor className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                {userRole === 'admin' && (
                                  <button 
                                    onClick={() => setDeletingStudentId(student.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-sm font-medium">Tidak ada data siswa ditemukan.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'upload' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-4 space-y-6"
                >
                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 shadow-inner">
                        <FileSpreadsheet className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Petunjuk Unggah</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-6">
                        Gunakan file Excel (.xlsx) atau CSV untuk mengunggah data wisudawan secara massal.
                      </p>
                      <ul className="space-y-3 mb-8">
                        {[
                          'Kolom wajib: Nama, NISN, Kelas, Gender (L/P)',
                          'Opsional: Nilai, Prestasi, Alamat, Orang Tua',
                          'Sistem akan otomatis menentukan Jurusan',
                          'Predikat dihitung otomatis dari Nilai'
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs text-gray-600 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <button 
                        onClick={downloadTemplate}
                        className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-gray-100"
                      >
                        <Download className="w-4 h-4" />
                        Unduh Template
                      </button>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-8"
                >
                  <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-gray-200 hover:border-green-400 transition-all bg-gradient-to-br from-white to-gray-50/50 flex flex-col items-center justify-center text-center group relative overflow-hidden min-h-[400px]">
                    <div className="absolute inset-0 bg-green-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      {!selectedFile ? (
                        <>
                          <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center text-green-600 mb-8 mx-auto group-hover:scale-110 transition-transform duration-500">
                            <Upload className="w-10 h-10" />
                          </div>
                          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">Tarik & Lepas File</h3>
                          <p className="text-gray-500 font-medium mb-10 max-w-xs mx-auto">
                            Seret file Excel atau CSV Anda ke sini, atau klik untuk memilih file dari komputer.
                          </p>
                          
                          <label className="relative inline-block">
                            <input 
                              type="file" 
                              accept=".csv,.xlsx"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                            <span className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-green-900/20 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all inline-block">
                              Pilih File Sekarang
                            </span>
                          </label>
                        </>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-6"
                        >
                          <div className="w-20 h-20 bg-green-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl">
                            <FileSpreadsheet className="w-10 h-10" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{selectedFile.name}</h4>
                            <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                          <div className="flex gap-4 justify-center">
                            <button 
                              onClick={() => setSelectedFile(null)}
                              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                              Batal
                            </button>
                            <button 
                              onClick={() => handleFileUpload(selectedFile)}
                              disabled={isUploadingData}
                              className="px-10 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center gap-2 disabled:opacity-50"
                            >
                              {isUploadingData ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Memproses...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  Mulai Unggah
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                      
                      <p className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Maksimal ukuran file: 10MB
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'seating' && (
              <div className="p-8 space-y-8">
                <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-[32px] p-8 shadow-xl">
                  {/* Stage Indicator */}
                  <div className="w-full h-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl mb-12 flex items-center justify-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent)]" />
                    <span className="text-white font-black uppercase tracking-[0.5em] text-xs relative z-10">Panggung Utama</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {students.sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0)).map((student) => (
                      <motion.div 
                        key={student.id}
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        className={cn(
                          "rounded-2xl border flex flex-col items-center justify-center p-4 text-center transition-all cursor-help group relative min-h-[120px]",
                          student.isCalled 
                            ? "bg-[#2e7d32] border-[#2e7d32] text-white shadow-lg shadow-green-900/20" 
                            : "bg-white border-gray-100 shadow-sm hover:border-[#2e7d32]/30 hover:shadow-md"
                        )}
                      >
                        <div className={cn(
                          "text-[10px] font-mono font-bold mb-2 px-2 py-0.5 rounded-full",
                          student.isCalled ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                        )}>
                          No. {student.seatNumber || '-'}
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-1">
                          <p className={cn(
                            "text-xs font-bold leading-tight line-clamp-2",
                            student.isCalled ? "text-white" : "text-gray-900"
                          )}>
                            {student.name.split(' ').slice(0, 2).join(' ')}
                          </p>
                          <p className={cn(
                            "text-[10px] font-medium leading-tight truncate w-full",
                            student.isCalled ? "text-white/70" : "text-gray-500"
                          )}>
                            {(() => {
                              const m = student.major.toLowerCase();
                              if (m.includes('multimedia')) return 'MM';
                              if (m.includes('kendaraan ringan')) return 'TKR';
                              if (m.includes('komputer dan jaringan')) return 'TKJ';
                              if (m.includes('bisnis sepeda motor')) return 'TBSM';
                              if (m.includes('akuntansi')) return 'AKL';
                              if (m.includes('perkantoran')) return 'OTKP';
                              if (m.includes('tata boga')) return 'TB';
                              if (m.includes('tata busana')) return 'TBS';
                              return student.major;
                            })()}
                          </p>
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-4 bg-gray-900 text-white rounded-xl text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                          <p className="font-bold">{student.name}</p>
                          <p className="text-gray-400 text-xs">{student.major}</p>
                          <p className="text-gray-400 text-[10px] mt-1">{student.class}</p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {students.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                      <Grid className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="font-medium">Belum ada data tempat duduk.</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-md" />
                    <span className="text-xs font-bold text-gray-600">Sudah Dipanggil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-200 rounded-md" />
                    <span className="text-xs font-bold text-gray-600">Belum Dipanggil</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'invitation' && (
              <div className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900">Cetak Kartu Undangan</h3>
                    <p className="text-gray-500 font-medium">Pratinjau dan cetak kartu undangan wisudawan.</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        const studentsHtml = filteredStudents.map(student => `
                          <div class="w-full h-[148mm] bg-white border-b-4 border-double border-gray-200 overflow-hidden flex flex-col page-break relative">
                            <!-- Decorative Background Elements -->
                            <div class="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-yellow-600/20 rounded-tl-3xl m-4"></div>
                            <div class="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-yellow-600/20 rounded-tr-3xl m-4"></div>
                            <div class="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-yellow-600/20 rounded-bl-3xl m-4"></div>
                            <div class="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-yellow-600/20 rounded-br-3xl m-4"></div>
                            
                            <!-- School Header (Kop) -->
                            <div class="pt-10 px-12 flex flex-col items-center text-center relative z-10">
                              ${schoolLogo ? `<img src="${schoolLogo}" class="w-16 h-16 object-contain mb-2" />` : ''}
                              <h3 class="text-xl font-serif font-bold text-gray-900 uppercase tracking-wider">${schoolName}</h3>
                              <div class="h-0.5 w-32 bg-yellow-600/30 mt-1"></div>
                            </div>

                            <div class="p-12 pt-6 flex flex-row gap-10 items-center relative z-10">
                              <div class="w-40 h-52 bg-white rounded-xl overflow-hidden border-[6px] border-white shadow-2xl flex-shrink-0 rotate-[-2deg]">
                                ${student.photoUrl ? `<img src="${student.photoUrl}" class="w-full h-full object-cover" />` : `<div class="w-full h-full flex items-center justify-center bg-gray-50"><svg class="w-16 h-16 text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`}
                              </div>
                              
                              <div class="flex-1 space-y-6">
                                <div class="text-center sm:text-left">
                                  <div class="inline-block px-4 py-1 bg-yellow-600/10 rounded-full mb-2">
                                    <h4 class="text-[10px] font-mono text-yellow-800 uppercase tracking-[0.3em] font-bold">Undangan Resmi</h4>
                                  </div>
                                  <h2 class="text-sm font-serif italic text-gray-500 mb-1">${invitationMessage}</h2>
                                  <h1 class="text-4xl font-serif font-bold text-gray-900 leading-tight mb-2">${student.name}</h1>
                                  <div class="flex items-center gap-3 justify-center sm:justify-start">
                                    <span class="h-px w-8 bg-yellow-600/30"></span>
                                    <p class="text-sm text-yellow-700 font-mono font-bold tracking-widest">NISN: ${student.nisn || '-'}</p>
                                    <span class="h-px w-8 bg-yellow-600/30"></span>
                                  </div>
                                </div>

                                <div class="grid grid-cols-2 gap-8 py-4 border-y border-yellow-600/10">
                                  <div class="text-center">
                                    <p class="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">Kelas & Jurusan</p>
                                    <p class="text-lg font-bold text-gray-800">${student.class || '-'}</p>
                                  </div>
                                  <div class="text-center">
                                    <p class="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">Nomor Kursi</p>
                                    <p class="text-lg font-bold text-gray-800">KURSI ${student.seatNumber || '-'}</p>
                                  </div>
                                </div>

                                <div class="space-y-1 text-center sm:text-left">
                                  <p class="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">Waktu & Tempat</p>
                                  <p class="text-sm text-gray-800 font-bold">Gedung Serbaguna ${schoolName}</p>
                                  <p class="text-xs text-gray-600 font-medium italic">${eventDay}, ${eventDate} | Pukul 08:00 WIB s/d Selesai</p>
                                </div>
                              </div>
                            </div>

                            <!-- Voucher Section -->
                            <div class="mt-auto bg-gray-50/50 border-t-4 border-double border-gray-200">
                              <div class="flex items-center justify-center -mt-3 mb-2">
                                <span class="bg-white px-4 py-1 text-[10px] font-mono text-gray-400 uppercase tracking-[0.4em] border border-gray-200 rounded-full">Voucher Konsumsi</span>
                              </div>
                              <div class="grid grid-cols-2 divide-x-2 divide-dashed divide-gray-200">
                                <div class="p-8 relative overflow-hidden">
                                  <div class="absolute top-0 right-0 w-12 h-12 bg-yellow-600/5 rounded-bl-full"></div>
                                  <div class="flex justify-between items-start mb-4">
                                    <div>
                                      <h5 class="text-[8px] font-mono text-yellow-700 uppercase tracking-widest font-bold mb-1">Voucher A</h5>
                                      <h4 class="text-lg font-serif font-bold text-gray-900">WISUDAWAN</h4>
                                    </div>
                                    <div class="w-10 h-10 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
                                      <span class="text-[10px] font-bold text-gray-300">QR</span>
                                    </div>
                                  </div>
                                  <div class="space-y-1">
                                    <p class="text-sm font-bold text-gray-800 truncate">${student.name}</p>
                                    <p class="text-[9px] font-mono text-gray-500 uppercase tracking-wider">${student.class} | KURSI ${student.seatNumber}</p>
                                  </div>
                                  <div class="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span class="text-[8px] font-mono text-gray-400">KODE: ${student.id.slice(0, 8).toUpperCase()}</span>
                                    <span class="text-[9px] font-bold text-white px-3 py-1 bg-gray-900 rounded-lg tracking-widest">SAH</span>
                                  </div>
                                </div>
                                <div class="p-8 relative overflow-hidden">
                                  <div class="absolute top-0 right-0 w-12 h-12 bg-yellow-600/5 rounded-bl-full"></div>
                                  <div class="flex justify-between items-start mb-4">
                                    <div>
                                      <h5 class="text-[8px] font-mono text-yellow-700 uppercase tracking-widest font-bold mb-1">Voucher B</h5>
                                      <h4 class="text-lg font-serif font-bold text-gray-900">ORANG TUA</h4>
                                    </div>
                                    <div class="w-10 h-10 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
                                      <span class="text-[10px] font-bold text-gray-300">QR</span>
                                    </div>
                                  </div>
                                  <div class="space-y-1">
                                    <p class="text-sm font-bold text-gray-800 truncate">Pendamping Wisudawan</p>
                                    <p class="text-[9px] font-mono text-gray-500 uppercase tracking-wider">${student.class} | KURSI ${student.seatNumber}</p>
                                  </div>
                                  <div class="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span class="text-[8px] font-mono text-gray-400">KODE: ${student.id.slice(0, 8).toUpperCase()}</span>
                                    <span class="text-[9px] font-bold text-white px-3 py-1 bg-gray-900 rounded-lg tracking-widest">SAH</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        `).join('');

                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Cetak Semua Undangan</title>
                              <script src="https://cdn.tailwindcss.com"></script>
                              <style>
                                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@700&display=swap');
                                @page { size: A4; margin: 0; }
                                body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
                                .font-serif { font-family: 'Playfair Display', serif; }
                                .page-break { page-break-inside: avoid; }
                                @media print {
                                  body { background: white; }
                                }
                              </style>
                            </head>
                            <body class="bg-white">
                              ${studentsHtml}
                              <script>window.onload = () => { window.print(); window.close(); }</script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }}
                    className="gradient-btn text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/20 active:scale-95 transition-all"
                  >
                    <Printer className="w-5 h-5" />
                    Cetak Semua
                  </motion.button>
                </div>

                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2e7d32] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Cari nama atau NISN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none shadow-sm transition-all bg-white/80 backdrop-blur-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredStudents.map((student) => (
                    <motion.div 
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card rounded-[32px] border border-white/20 shadow-xl overflow-hidden flex flex-col group"
                    >
                      {/* Preview Card */}
                      <div className="p-8 flex flex-col relative overflow-hidden bg-white">
                        <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-yellow-600/10 rounded-tl-2xl m-2" />
                        <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-yellow-600/10 rounded-tr-2xl m-2" />
                        
                        {/* School Header Preview */}
                        <div className="flex flex-col items-center text-center mb-6 relative z-10">
                          {schoolLogo ? (
                            <img src={schoolLogo} className="w-12 h-12 object-contain mb-2" alt="Logo" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
                              <Users className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                          <h4 className="text-sm font-serif font-bold text-gray-900 uppercase tracking-wider">{schoolName}</h4>
                          <div className="h-0.5 w-20 bg-yellow-600/20 mt-1"></div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start relative z-10">
                          <div className="w-32 h-44 bg-white rounded-xl overflow-hidden border-[6px] border-white shadow-xl flex-shrink-0 relative group-hover:rotate-[-2deg] transition-transform duration-500">
                          {student.photoUrl ? (
                            <img src={student.photoUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <Users className="w-12 h-12 text-gray-200" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-4 relative z-10 w-full text-center sm:text-left">
                          <div>
                            <span className="inline-block px-3 py-0.5 bg-yellow-600/10 text-yellow-800 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full mb-2">
                              Undangan Resmi
                            </span>
                            <h4 className="text-sm font-serif italic text-gray-400 mb-1">Undangan Wisuda</h4>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight group-hover:text-yellow-700 transition-colors truncate">
                              {student.name}
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-1 italic max-w-[200px] line-clamp-2">{invitationMessage}</p>
                            <p className="text-xs text-yellow-700 font-mono font-bold mt-2 tracking-widest">NISN: {student.nisn || '-'}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 py-3 border-y border-yellow-600/10">
                            <div>
                              <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Kelas</p>
                              <p className="text-sm font-bold text-gray-800">{student.class || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Kursi</p>
                              <p className="text-sm font-bold text-gray-800">KURSI {student.seatNumber || '-'}</p>
                            </div>
                          </div>

                          <div className="pt-1">
                            <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">Lokasi & Waktu</p>
                            <p className="text-xs text-gray-700 font-bold">Gedung Serbaguna {schoolName}</p>
                            <p className="text-[10px] text-gray-500 font-medium italic">{eventDay}, {eventDate} | 08:00 WIB</p>
                          </div>
                        </div>
                        </div>
                      </div>

                      {/* Voucher Section Preview */}
                      <div className="mt-auto bg-gray-50/80 border-t-2 border-dashed border-gray-200">
                        <div className="grid grid-cols-2 divide-x divide-dashed divide-gray-200">
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="text-[8px] font-mono text-yellow-700 uppercase tracking-widest font-bold">Voucher A</h5>
                                <h4 className="text-xs font-serif font-bold text-gray-900">WISUDAWAN</h4>
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-gray-800 truncate">{student.name}</p>
                              <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">KURSI {student.seatNumber}</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
                              <span className="text-[8px] font-mono text-gray-400">KODE: {student.id.slice(0, 8).toUpperCase()}</span>
                              <span className="text-[8px] font-bold text-white px-2 py-0.5 bg-gray-900 rounded-md">SAH</span>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="text-[8px] font-mono text-yellow-700 uppercase tracking-widest font-bold">Voucher B</h5>
                                <h4 className="text-xs font-serif font-bold text-gray-900">ORANG TUA</h4>
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-gray-800 truncate">Pendamping</p>
                              <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">KURSI {student.seatNumber}</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
                              <span className="text-[8px] font-mono text-gray-400">KODE: {student.id.slice(0, 8).toUpperCase()}</span>
                              <span className="text-[8px] font-bold text-white px-2 py-0.5 bg-gray-900 rounded-md">SAH</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-8 py-4 bg-white/30 border-t border-white/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Siap Cetak</span>
                        </div>
                        <button 
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Cetak Undangan - ${student.name}</title>
                                    <script src="https://cdn.tailwindcss.com"></script>
                                    <style>
                                      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@700&display=swap');
                                      @page { size: A4; margin: 0; }
                                      body { font-family: 'Inter', sans-serif; }
                                      .font-serif { font-family: 'Playfair Display', serif; }
                                    </style>
                                  </head>
                                  <body class="p-0 bg-white">
                                    <div class="w-full h-[148mm] bg-white border-b-4 border-double border-gray-200 overflow-hidden flex flex-col relative">
                                      <!-- Decorative Background Elements -->
                                      <div class="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-yellow-600/20 rounded-tl-3xl m-4"></div>
                                      <div class="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-yellow-600/20 rounded-tr-3xl m-4"></div>
                                      <div class="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-yellow-600/20 rounded-bl-3xl m-4"></div>
                                      <div class="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-yellow-600/20 rounded-br-3xl m-4"></div>
                                      
                                      <!-- School Header (Kop) -->
                                      <div class="pt-10 px-12 flex flex-col items-center text-center relative z-10">
                                        ${schoolLogo ? `<img src="${schoolLogo}" class="w-16 h-16 object-contain mb-2" />` : ''}
                                        <h3 class="text-xl font-serif font-bold text-gray-900 uppercase tracking-wider">${schoolName}</h3>
                                        <div class="h-0.5 w-32 bg-yellow-600/30 mt-1"></div>
                                      </div>

                                      <div class="p-12 pt-6 flex flex-row gap-10 items-center relative z-10">
                                        <div class="w-40 h-52 bg-white rounded-xl overflow-hidden border-[6px] border-white shadow-2xl flex-shrink-0 rotate-[-2deg]">
                                          ${student.photoUrl ? `<img src="${student.photoUrl}" class="w-full h-full object-cover" />` : `<div class="w-full h-full flex items-center justify-center bg-gray-50"><svg class="w-16 h-16 text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`}
                                        </div>
                                        
                                        <div class="flex-1 space-y-6">
                                          <div class="text-center sm:text-left">
                                            <div class="inline-block px-4 py-1 bg-yellow-600/10 rounded-full mb-2">
                                              <h4 class="text-[10px] font-mono text-yellow-800 uppercase tracking-[0.3em] font-bold">Undangan Resmi</h4>
                                            </div>
                                            <h2 class="text-sm font-serif italic text-gray-500 mb-1">${invitationMessage}</h2>
                                            <h1 class="text-4xl font-serif font-bold text-gray-900 leading-tight mb-2">${student.name}</h1>
                                            <div class="flex items-center gap-3 justify-center sm:justify-start">
                                              <span class="h-px w-8 bg-yellow-600/30"></span>
                                              <p class="text-sm text-yellow-700 font-mono font-bold tracking-widest">NISN: ${student.nisn || '-'}</p>
                                              <span class="h-px w-8 bg-yellow-600/30"></span>
                                            </div>
                                          </div>

                                          <div class="grid grid-cols-2 gap-8 py-4 border-y border-yellow-600/10">
                                            <div class="text-center">
                                              <p class="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">Kelas & Jurusan</p>
                                              <p class="text-lg font-bold text-gray-800">${student.class || '-'}</p>
                                            </div>
                                            <div class="text-center">
                                              <p class="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">Nomor Kursi</p>
                                              <p class="text-lg font-bold text-gray-800">KURSI ${student.seatNumber || '-'}</p>
                                            </div>
                                          </div>

                                          <div class="space-y-1 text-center sm:text-left">
                                            <p class="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">Waktu & Tempat</p>
                                            <p class="text-sm text-gray-800 font-bold">Gedung Serbaguna ${schoolName}</p>
                                            <p class="text-xs text-gray-600 font-medium italic">${eventDay}, ${eventDate} | Pukul 08:00 WIB s/d Selesai</p>
                                          </div>
                                        </div>
                                      </div>

                                      <!-- Voucher Section -->
                                      <div class="mt-auto bg-gray-50/50 border-t-4 border-double border-gray-200">
                                        <div class="flex items-center justify-center -mt-3 mb-2">
                                          <span class="bg-white px-4 py-1 text-[10px] font-mono text-gray-400 uppercase tracking-[0.4em] border border-gray-200 rounded-full">Voucher Konsumsi</span>
                                        </div>
                                        <div class="grid grid-cols-2 divide-x-2 divide-dashed divide-gray-200">
                                          <div class="p-8 relative overflow-hidden">
                                            <div class="absolute top-0 right-0 w-12 h-12 bg-yellow-600/5 rounded-bl-full"></div>
                                            <div class="flex justify-between items-start mb-4">
                                              <div>
                                                <h5 class="text-[8px] font-mono text-yellow-700 uppercase tracking-widest font-bold mb-1">Voucher A</h5>
                                                <h4 class="text-lg font-serif font-bold text-gray-900">WISUDAWAN</h4>
                                              </div>
                                              <div class="w-10 h-10 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
                                                <span class="text-[10px] font-bold text-gray-300">QR</span>
                                              </div>
                                            </div>
                                            <div class="space-y-1">
                                              <p class="text-sm font-bold text-gray-800 truncate">${student.name}</p>
                                              <p class="text-[9px] font-mono text-gray-500 uppercase tracking-wider">${student.class} | KURSI ${student.seatNumber}</p>
                                            </div>
                                            <div class="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                                              <span class="text-[8px] font-mono text-gray-400">KODE: ${student.id.slice(0, 8).toUpperCase()}</span>
                                              <span class="text-[9px] font-bold text-white px-3 py-1 bg-gray-900 rounded-lg tracking-widest">SAH</span>
                                            </div>
                                          </div>
                                          <div class="p-8 relative overflow-hidden">
                                            <div class="absolute top-0 right-0 w-12 h-12 bg-yellow-600/5 rounded-bl-full"></div>
                                            <div class="flex justify-between items-start mb-4">
                                              <div>
                                                <h5 class="text-[8px] font-mono text-yellow-700 uppercase tracking-widest font-bold mb-1">Voucher B</h5>
                                                <h4 class="text-lg font-serif font-bold text-gray-900">ORANG TUA</h4>
                                              </div>
                                              <div class="w-10 h-10 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
                                                <span class="text-[10px] font-bold text-gray-300">QR</span>
                                              </div>
                                            </div>
                                            <div class="space-y-1">
                                              <p class="text-sm font-bold text-gray-800 truncate">Pendamping Wisudawan</p>
                                              <p class="text-[9px] font-mono text-gray-500 uppercase tracking-wider">${student.class} | KURSI ${student.seatNumber}</p>
                                            </div>
                                            <div class="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                                              <span class="text-[8px] font-mono text-gray-400">KODE: ${student.id.slice(0, 8).toUpperCase()}</span>
                                              <span class="text-[9px] font-bold text-white px-3 py-1 bg-gray-900 rounded-lg tracking-widest">SAH</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <script>window.onload = () => { window.print(); window.close(); }</script>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                            }
                          }}
                          className="px-6 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors shadow-lg active:scale-95"
                        >
                          Cetak Undangan
                        </button>
                      </div>
                    </motion.div>
                  ))}

                </div>
              </div>
            )}

            {activeTab === 'registration' && (
              <div className="space-y-6">
                {/* Compact Bento Stats & Charts Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6">
                  {/* Stats Column */}
                  <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                    {[
                      { label: 'Total Wisudawan', value: students.length, icon: Users, gradient: 'from-blue-600 to-blue-400', shadow: 'shadow-blue-200' },
                      { label: 'Sudah Registrasi', value: students.filter(s => s.isCalled).length, icon: CheckCircle, gradient: 'from-green-600 to-emerald-400', shadow: 'shadow-green-200' },
                      { label: 'Belum Registrasi', value: students.filter(s => !s.isCalled).length, icon: QrCode, gradient: 'from-orange-600 to-amber-400', shadow: 'shadow-orange-200' }
                    ].map((stat, i) => (
                      <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(
                          "relative overflow-hidden p-4 rounded-3xl bg-white border border-gray-100 shadow-lg group transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                          stat.shadow
                        )}
                      >
                        <div className={cn("absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150", stat.gradient)} />
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", "bg-gradient-to-br " + stat.gradient)}>
                            <stat.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <p className="text-xl md:text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress Chart - Compact */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-4 bg-white p-5 rounded-[32px] border border-gray-100 shadow-xl flex flex-col relative overflow-hidden group min-h-[280px]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                    <div className="flex items-center justify-between mb-2 relative z-10">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        Kehadiran
                      </h4>
                      <span className="bg-green-50 text-green-700 text-[8px] font-black px-2 py-0.5 rounded-lg uppercase">Waktu Nyata</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                      <div className="w-full h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={registrationStats}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={55}
                              paddingAngle={6}
                              dataKey="value"
                              stroke="none"
                              animationBegin={0}
                              animationDuration={1500}
                            >
                              {registrationStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-2xl font-black text-gray-900">
                          {students.length > 0 ? Math.round((students.filter(s => s.isCalled).length / students.length) * 100) : 0}%
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase">Hadir</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 relative z-10">
                      {registrationStats.map((s) => (
                        <div key={s.name} className="bg-gray-50/80 backdrop-blur-sm p-2 rounded-xl text-center border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{s.name}</p>
                          <p className="text-base font-black text-gray-800 leading-none">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Major Bar Chart - Compact */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-5 bg-white p-5 rounded-[32px] border border-gray-100 shadow-xl relative overflow-hidden group min-h-[280px]"
                  >
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full -ml-16 -mb-16 opacity-50 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <BarChartIcon className="w-3 h-3 text-blue-600" />
                        Distribusi Jurusan
                      </h4>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Total Siswa</span>
                      </div>
                    </div>
                    <div className="w-full h-48 relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statsByMajor} layout="vertical" margin={{ left: -20, right: 20 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100} 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }}
                          />
                          <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                          <Bar 
                            dataKey="value" 
                            fill="url(#colorMajor)" 
                            radius={[0, 6, 6, 0]} 
                            barSize={16}
                            animationBegin={200}
                            animationDuration={1500}
                          >
                            <defs>
                              <linearGradient id="colorMajor" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#60a5fa" />
                              </linearGradient>
                            </defs>
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                {/* Gender & Major Quick List - Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                  {/* Gender Stats - Very Compact */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-4 bg-white p-4 rounded-[28px] border border-gray-100 shadow-lg flex items-center gap-6"
                  >
                    <div className="w-20 h-20 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsByGender}
                            cx="50%"
                            cy="50%"
                            outerRadius={35}
                            dataKey="value"
                            stroke="none"
                            animationBegin={400}
                            animationDuration={1500}
                          >
                            {statsByGender.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h5 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Gender</h5>
                      <div className="grid grid-cols-1 gap-1">
                        {statsByGender.map(g => (
                          <div key={g.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                              <span className="text-[10px] font-bold text-gray-600">{g.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-gray-900">{g.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Major Quick List - Horizontal Scroll */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-8 bg-white p-4 rounded-[28px] border border-gray-100 shadow-lg overflow-hidden"
                  >
                    <h5 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Rincian Jurusan</h5>
                    <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                      {statsByMajor.map(({ name, value }) => (
                        <div key={name} className="flex-shrink-0 bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-100 flex flex-col items-center min-w-[100px] transition-all hover:bg-white hover:shadow-md">
                          <span className="text-[8px] font-bold text-gray-400 uppercase text-center mb-0.5 truncate w-full">{name}</span>
                          <span className="text-lg font-black text-blue-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Table Section - More Compact */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden"
                >
                  <div className="p-5 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-white to-gray-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-gray-900">Registrasi Kehadiran</h3>
                        <p className="text-xs text-gray-500 font-medium">Konfirmasi kehadiran wisudawan di lokasi.</p>
                      </div>
                      
                      <div className="flex bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl w-fit border border-gray-200">
                        {[
                          { id: 'all', label: 'Semua', color: 'gray' },
                          { id: 'registered', label: 'Hadir', color: 'green' },
                          { id: 'unregistered', label: 'Belum', color: 'orange' }
                        ].map(f => (
                          <button 
                            key={f.id}
                            onClick={() => setRegistrationFilter(f.id as any)}
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                              registrationFilter === f.id 
                                ? f.color === 'green' ? "bg-green-600 text-white shadow-lg shadow-green-600/20" :
                                  f.color === 'orange' ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" :
                                  "bg-white text-gray-900 shadow-md"
                                : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative w-full lg:w-72 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Cari nama atau NISN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all text-xs bg-white/50"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Wisudawan</th>
                          <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-center hidden sm:table-cell">Gender</th>
                          <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">Kelas</th>
                          <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                          <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-green-50/30 transition-colors group">
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 group-hover:border-green-200 transition-colors">
                                  {student.photoUrl ? (
                                    <img src={student.photoUrl} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Users className="w-4 h-4 text-gray-300" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm leading-tight">{student.name}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{student.major}</p>
                                  <div className="sm:hidden mt-0.5 flex gap-1">
                                    <span className="text-[8px] font-bold text-gray-500 uppercase bg-gray-100 px-1 rounded">{student.gender || '-'}</span>
                                    <span className="text-[8px] font-bold text-gray-500 uppercase bg-gray-100 px-1 rounded">{student.class || '-'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-center hidden sm:table-cell">
                              <span className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-black uppercase",
                                student.gender === 'L' ? "bg-blue-50 text-blue-600" : 
                                student.gender === 'P' ? "bg-pink-50 text-pink-600" : 
                                "bg-gray-50 text-gray-400"
                              )}>
                                {student.gender || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-3 hidden md:table-cell">
                              <p className="text-xs font-bold text-gray-700">{student.class || '-'}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{student.nisn || '-'}</p>
                            </td>
                            <td className="px-6 py-3">
                              <span className={cn(
                                "px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase flex items-center gap-1 md:gap-1.5 w-fit",
                                student.isCalled 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-orange-100 text-orange-700"
                              )}>
                                <div className={cn("w-1 md:w-1.5 h-1 md:h-1.5 rounded-full", student.isCalled ? "bg-green-600" : "bg-orange-600")} />
                                {student.isCalled ? 'Hadir' : 'Belum'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <button 
                                onClick={async () => {
                                  try {
                                    const { error } = await supabase
                                      .from('students')
                                      .update({ isCalled: !student.isCalled })
                                      .eq('id', student.id);
                                    if (error) throw error;
                                    fetchStudents();
                                  } catch (error) {
                                    console.error('Update registration error:', error);
                                  }
                                }}
                                className={cn(
                                  "px-3 md:px-4 py-1.5 rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-wider transition-all active:scale-95",
                                  student.isCalled 
                                    ? "bg-gray-100 text-gray-500 hover:bg-gray-200" 
                                    : "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20"
                                )}
                              >
                                {student.isCalled ? 'Batal' : 'Hadir'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="p-6 md:p-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900">Manajemen User</h3>
                    <p className="text-sm text-gray-500 mt-1">Kelola akses admin dan staff untuk aplikasi ini.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingUser({ email: '', role: 'staff', password: '' });
                      setIsUserModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-[#2e7d32] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#1b5e20] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/10 active:scale-95"
                  >
                    <UserPlus className="w-5 h-5" />
                    Tambah User
                  </button>
                </div>

                <div className="glass-card rounded-[32px] border border-white/20 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-8 py-5 text-xs font-mono text-gray-400 uppercase tracking-wider">Email User</th>
                          <th className="px-8 py-5 text-xs font-mono text-gray-400 uppercase tracking-wider">Hak Akses</th>
                          <th className="px-8 py-5 text-xs font-mono text-gray-400 uppercase tracking-wider text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {/* Super Admin Row */}
                        <tr className="bg-green-50/30">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#2e7d32] flex items-center justify-center text-white font-bold text-xs">A</div>
                              <div>
                                <p className="font-bold text-gray-900">ipg.gm2025@gmail.com</p>
                                <p className="text-[10px] text-[#2e7d32] font-mono uppercase tracking-tighter">Super Admin</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wider">
                              ADMIN
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="text-[10px] font-mono text-gray-400 uppercase italic">Sistem</span>
                          </td>
                        </tr>

                        {appUsers.filter(u => u.email !== 'ipg.gm2025@gmail.com').map((u) => (
                          <tr key={u.email} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-8 py-5">
                              <p className="font-medium text-gray-900">{u.email}</p>
                            </td>
                            <td className="px-8 py-5">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                u.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                              )}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingUser({ ...u, password: '' });
                                    setIsUserModalOpen(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                  title="Edit Role"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteUserFromDb(u.email)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                  title="Hapus Akses"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {appUsers.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-8 py-12 text-center text-gray-400 italic">
                              Belum ada user tambahan yang terdaftar.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-6 md:p-10 max-w-2xl mx-auto lg:mx-0">
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-gray-100">
                    <h3 className="text-xl font-serif font-bold">Identitas Sekolah</h3>
                    <p className="text-sm text-gray-500 mt-1">Informasi ini akan muncul di sidebar dan layar proyektor.</p>
                  </div>
                  <div className="p-6 md:p-8 space-y-8">
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Nama Sekolah</label>
                      <input 
                        type="text" 
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none text-sm md:text-base"
                        placeholder="Contoh: SMK NEGERI 1 KOTA"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Hari Pelaksanaan</label>
                        <input 
                          type="text" 
                          value={eventDay}
                          onChange={(e) => setEventDay(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none text-sm md:text-base"
                          placeholder="Contoh: Senin"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Tanggal Pelaksanaan</label>
                        <input 
                          type="text" 
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none text-sm md:text-base"
                          placeholder="Contoh: 15 Juni 2026"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Ucapan Undangan</label>
                      <textarea 
                        value={invitationMessage}
                        onChange={(e) => setInvitationMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none text-sm md:text-base h-24 resize-none"
                        placeholder="Masukkan pesan undangan di sini..."
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider block">Logo Sekolah</label>
                      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                        <div className="w-32 h-32 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                          {schoolLogo ? (
                            <img src={schoolLogo} className="w-full h-full object-contain p-2" alt="Preview" />
                          ) : (
                            <Camera className="w-10 h-10 text-gray-300" />
                          )}
                          {isUploadingLogo && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                          <div className="flex flex-col gap-3">
                            <input 
                              type="file" 
                              id="logo-upload"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <label 
                              htmlFor="logo-upload"
                              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:border-[#2e7d32] hover:text-[#2e7d32] text-gray-700 rounded-xl cursor-pointer transition-all text-sm font-medium shadow-sm"
                            >
                              <Upload className="w-4 h-4" />
                              {schoolLogo ? 'Ganti Logo Sekolah' : 'Unggah Logo Sekolah'}
                            </label>
                            
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-xs">URL:</span>
                              </div>
                              <input 
                                type="text" 
                                value={schoolLogo}
                                onChange={(e) => setSchoolLogo(e.target.value)}
                                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-[10px] text-gray-400 focus:ring-1 focus:ring-[#2e7d32] outline-none"
                                placeholder="Atau masukkan URL logo di sini..."
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">Format: JPG, PNG, SVG. Maksimal 2MB. Logo akan muncul di sidebar dan layar proyektor.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                    <div className="p-6 md:p-8 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-xs md:text-sm text-[#2e7d32]">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Pengaturan akan disimpan secara permanen di database.</span>
                      </div>
                      <button
                        onClick={saveSettingsToDb}
                        disabled={isSavingSettings}
                        className="w-full sm:w-auto px-6 py-3 bg-[#2e7d32] text-white rounded-xl font-medium hover:bg-[#1b5e20] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-green-900/10"
                      >
                        {isSavingSettings ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Simpan ke Database
                          </>
                        )}
                      </button>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

        {/* Student Form Modal */}
        <AnimatePresence>
          {isStudentModalOpen && editingStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-2xl font-serif font-bold text-[#1a1a1a]">
                    {editingStudent.id ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                  </h3>
                  <button onClick={() => {
                    setIsStudentModalOpen(false);
                    setDuplicateWarning(null);
                  }} className="text-gray-400 hover:text-gray-600">
                    <Minimize2 className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                  {duplicateWarning && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-orange-800 text-sm flex items-start gap-3"
                    >
                      <div className="mt-0.5">⚠️</div>
                      <div>
                        <p className="font-bold">Nomor Urut Ganda Terdeteksi</p>
                        <p>Nomor urut {duplicateWarning} sudah digunakan oleh siswa lain. Klik "Konfirmasi & Simpan" jika Anda tetap ingin menggunakan nomor ini.</p>
                      </div>
                    </motion.div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                      <input 
                        type="text" 
                        value={editingStudent.name || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">NISN (10 Digit)</label>
                      <input 
                        type="text" 
                        maxLength={10}
                        value={editingStudent.nisn || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setEditingStudent({...editingStudent, nisn: val});
                        }}
                        placeholder="Contoh: 0012345678"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Jenis Kelamin</label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setEditingStudent({...editingStudent, gender: 'L'})}
                          className={cn(
                            "flex-1 py-3 rounded-xl border font-bold transition-all",
                            editingStudent.gender === 'L' 
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                              : "border-gray-200 text-gray-500 hover:border-blue-200"
                          )}
                        >
                          Laki-laki (L)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStudent({...editingStudent, gender: 'P'})}
                          className={cn(
                            "flex-1 py-3 rounded-xl border font-bold transition-all",
                            editingStudent.gender === 'P' 
                              ? "bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-600/20" 
                              : "border-gray-200 text-gray-500 hover:border-pink-200"
                          )}
                        >
                          Perempuan (P)
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Kelas</label>
                      <select 
                        value={editingStudent.class || ''}
                        onChange={(e) => {
                          const cls = e.target.value;
                          let major = '';
                          if (cls.includes('MM')) major = 'Multimedia';
                          else if (cls.includes('TKR')) major = 'Teknik Kendaraan Ringan';
                          else if (cls.includes('DKV')) major = 'Desain Komunikasi Visual';
                          
                          setEditingStudent({
                            ...editingStudent, 
                            class: cls,
                            major: major
                          });
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none bg-white"
                      >
                        <option value="">Pilih Kelas</option>
                        <option value="12 MM 1">12 MM 1</option>
                        <option value="12 MM 2">12 MM 2</option>
                        <option value="12 TKR 1">12 TKR 1</option>
                        <option value="12 TKR 2">12 TKR 2</option>
                        <option value="12 DKV 1">12 DKV 1</option>
                        <option value="12 DKV 2">12 DKV 2</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Jurusan</label>
                      <input 
                        type="text" 
                        readOnly
                        placeholder="Otomatis terisi..."
                        value={editingStudent.major || ''}
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Rata-rata Nilai</label>
                      <input 
                        type="number" 
                        value={editingStudent.grade || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          let pred = 'Kurang';
                          if (val >= 92) pred = 'Dengan Pujian';
                          else if (val >= 83) pred = 'Sangat Memuaskan';
                          else if (val >= 75) pred = 'Memuaskan';
                          
                          setEditingStudent({
                            ...editingStudent, 
                            grade: val,
                            predicate: pred
                          });
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Predikat</label>
                      <input 
                        type="text" 
                        readOnly
                        placeholder="Otomatis terisi..."
                        value={editingStudent.predicate || ''}
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Prestasi</label>
                      <textarea 
                        value={editingStudent.achievement || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, achievement: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none h-24 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Nama Orang Tua</label>
                      <input 
                        type="text" 
                        value={editingStudent.parentName || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, parentName: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Nomor Urutan / Kursi</label>
                      <input 
                        type="number" 
                        value={editingStudent.seatNumber || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, seatNumber: Number(e.target.value), order: Number(e.target.value)})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Foto Siswa</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                          {editingStudent.photoUrl ? (
                            <img src={editingStudent.photoUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Camera className="w-8 h-8 text-gray-300" />
                          )}
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input 
                            type="file" 
                            id="photo-upload"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <label 
                            htmlFor="photo-upload"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer transition-all text-sm font-medium"
                          >
                            <Upload className="w-4 h-4" />
                            {editingStudent.photoUrl ? 'Ganti Foto' : 'Unggah Foto'}
                          </label>
                          <p className="text-xs text-gray-400">Format: JPG, PNG. Maks 2MB.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Alamat</label>
                      <input 
                        type="text" 
                        value={editingStudent.address || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, address: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-gray-100 flex gap-4">
                  <button 
                    onClick={() => {
                      setIsStudentModalOpen(false);
                      setDuplicateWarning(null);
                    }}
                    className="flex-1 px-6 py-4 rounded-full font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    disabled={isSaving}
                    onClick={async () => {
                      if (!editingStudent) {
                        console.log("No editing student");
                        return;
                      }
                      
                      console.log("Save button clicked", editingStudent);
                      
                      if (!editingStudent.name || !editingStudent.major) {
                        console.log("Validation failed: name or major missing");
                        alert('Nama dan Jurusan wajib diisi!');
                        return;
                      }
                      
                      if (editingStudent.nisn && editingStudent.nisn.length !== 10) {
                        console.log("Validation failed: NISN length", editingStudent.nisn.length);
                        alert('NISN harus tepat 10 digit!');
                        return;
                      }

                      // Check NISN uniqueness if provided
                      if (editingStudent.nisn) {
                        const currentNisn = editingStudent.nisn.trim();
                        const duplicateNisnStudent = students.find(s => 
                          String(s.id) !== String(editingStudent.id || '') && 
                          s.nisn?.trim() === currentNisn
                        );
                        
                        if (duplicateNisnStudent) {
                          console.log("NISN Duplicate found:", duplicateNisnStudent);
                          alert(`NISN ${currentNisn} sudah digunakan oleh siswa lain: ${duplicateNisnStudent.name}!`);
                          return;
                        }
                      }

                      setIsSaving(true);
                      
                      let finalOrder = Number(editingStudent.seatNumber || editingStudent.order);
                      if (!finalOrder) {
                        finalOrder = Math.max(0, ...students.map(s => s.order || 0), ...students.map(s => s.seatNumber || 0)) + 1;
                      }

                      // Check uniqueness
                      const isDuplicate = students.some(s => s.id !== editingStudent.id && (Number(s.seatNumber) === finalOrder || Number(s.order) === finalOrder));
                      console.log("Duplicate check:", { isDuplicate, finalOrder, duplicateWarning });
                      
                      if (isDuplicate && duplicateWarning !== finalOrder) {
                        console.log("Duplicate detected, showing warning");
                        setDuplicateWarning(finalOrder);
                        setIsSaving(false);
                        return;
                      }

                      const id = editingStudent.id || Math.random().toString(36).substring(7);
                      
                      try {
                        console.log("Preparing payload for upsert...");
                        
                        // Create a clean payload with only the fields we want to save
                        const payload = {
                          id: id,
                          name: editingStudent.name,
                          nisn: editingStudent.nisn || null,
                          class: editingStudent.class || null,
                          major: editingStudent.major,
                          gender: editingStudent.gender || null,
                          grade: editingStudent.grade || 0,
                          predicate: editingStudent.predicate || null,
                          achievement: editingStudent.achievement || null,
                          parentName: editingStudent.parentName || null,
                          address: editingStudent.address || null,
                          photoUrl: editingStudent.photoUrl || null,
                          isCalled: editingStudent.isCalled || false,
                          order: finalOrder,
                          seatNumber: finalOrder
                        };
                        
                        console.log("Upserting student payload:", payload);
                        
                        const { data, error } = await supabase
                          .from('students')
                          .upsert(payload)
                          .select();
                          
                        if (error) {
                          console.error("Supabase upsert error:", error);
                          throw error;
                        }
                        
                        console.log("Upsert success, returned data:", data);
                        await fetchStudents();
                        setDuplicateWarning(null);
                        setIsStudentModalOpen(false);
                        alert('Data berhasil disimpan!');
                      } catch (error: any) {
                        console.error("Save error caught:", error);
                        // Provide a more detailed error message if possible
                        const detail = error.details || error.message || 'Terjadi kesalahan teknis.';
                        alert('Gagal menyimpan data: ' + detail);
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className={cn(
                      "flex-1 px-6 py-4 rounded-full font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95",
                      duplicateWarning ? "bg-orange-600 hover:bg-orange-700 text-white" : "gradient-btn text-white"
                    )}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : duplicateWarning ? (
                      'Konfirmasi & Simpan'
                    ) : (
                      'Simpan Data'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* User Management Modal */}
          {isUserModalOpen && editingUser && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-2xl font-serif font-bold text-[#1a1a1a]">
                    {appUsers.some(u => u.email === editingUser.email) ? 'Edit Hak Akses' : 'Tambah User Baru'}
                  </h3>
                  <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <Minimize2 className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Email User</label>
                    <input 
                      type="email" 
                      disabled={appUsers.some(u => u.email === editingUser.email)}
                      value={editingUser.email || ''}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value.toLowerCase()})}
                      placeholder="contoh@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Password (Opsional)</label>
                    <input 
                      type="password" 
                      value={editingUser.password || ''}
                      onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                      placeholder={appUsers.some(u => u.email === editingUser.email) ? "Kosongkan jika tidak ingin ganti" : "Minimal 6 karakter"}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2e7d32] outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Role / Hak Akses</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setEditingUser({...editingUser, role: 'admin'})}
                        className={cn(
                          "py-3 rounded-xl border font-bold transition-all flex flex-col items-center gap-1",
                          editingUser.role === 'admin' 
                            ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20" 
                            : "border-gray-200 text-gray-500 hover:border-purple-200"
                        )}
                      >
                        <span>ADMIN</span>
                        <span className="text-[8px] font-normal opacity-80">Akses Penuh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUser({...editingUser, role: 'staff'})}
                        className={cn(
                          "py-3 rounded-xl border font-bold transition-all flex flex-col items-center gap-1",
                          editingUser.role === 'staff' 
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                            : "border-gray-200 text-gray-500 hover:border-blue-200"
                        )}
                      >
                        <span>STAFF</span>
                        <span className="text-[8px] font-normal opacity-80">Akses Terbatas</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] text-blue-700 leading-relaxed">
                      <strong>Info:</strong> User dengan role <strong>Admin</strong> dapat mengelola data siswa, pengaturan sekolah, dan manajemen user. Role <strong>Staff</strong> hanya dapat mengelola data siswa dan pendaftaran.
                    </p>
                  </div>
                </div>

                <div className="p-8 bg-gray-50 flex gap-4">
                  <button 
                    onClick={() => setIsUserModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-full font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    disabled={isSavingUser}
                    onClick={saveUserToDb}
                    className="flex-1 px-6 py-4 rounded-full font-medium bg-[#2e7d32] text-white hover:bg-[#1b5e20] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSavingUser ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan User'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deletingStudentId && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-2">Hapus Data?</h3>
                  <p className="text-gray-500">Apakah Anda yakin ingin menghapus data siswa ini? Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="p-8 bg-gray-50 flex gap-4">
                  <button 
                    onClick={() => setDeletingStudentId(null)}
                    className="flex-1 px-6 py-4 rounded-full font-medium text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => deleteStudent(deletingStudentId)}
                    className="flex-1 px-6 py-4 rounded-full font-medium bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
