import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { Package, Calendar, Tag, LogOut, Menu, X, Users, MapPin, ClipboardList, BarChart3, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductsManager from '@/components/admin/ProductsManager';
import AppointmentsManager from '@/components/admin/AppointmentsManager';
import BannersManager from '@/components/admin/BannersManager';
import EmployeesManager from '@/components/admin/EmployeesManager';
import WorkplacesManager from '@/components/admin/WorkplacesManager';
import AttendanceManager from '@/components/admin/AttendanceManager';
import ReportsManager from '@/components/admin/ReportsManager';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_1c5df42d-6505-4d6c-97c6-dd11a75d6657/artifacts/f0cxn3lf_logo%20castrez.avif';

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    
    if (token && savedUser) {
      // Verify token is still valid
      verifyToken(token, JSON.parse(savedUser));
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token, savedUser) => {
    try {
      await axios.post(`${API}/auth/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(savedUser);
    } catch (error) {
      // Token invalid, clear storage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    } finally {
      setLoading(false);
    }
  };

  const validateLoginForm = () => {
    const errors = {};
    
    if (!loginForm.email) {
      errors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      errors.email = 'Ingresa un correo válido';
    }
    
    if (!loginForm.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (loginForm.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setLoginLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginForm);
      
      const { token, user: userData } = response.data;
      
      // Save to localStorage
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success(`¡Bienvenido, ${userData.name}!`);
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al iniciar sesión';
      toast.error(message);
      setLoginErrors({ form: message });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    toast.success('Sesión cerrada');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse">
          <img src={LOGO_URL} alt="Castrez" className="h-16 opacity-50" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-2xl max-w-md w-full"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={LOGO_URL} alt="Castrez Autrans" className="h-16 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white font-['Syne'] mb-2">Panel de Administración</h1>
            <p className="text-[#A3A3A3]">Ingresa tus credenciales para acceder</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6" data-testid="login-form">
            {/* Email Field */}
            <div>
              <label className="text-sm text-[#A3A3A3] mb-2 block">Correo electrónico</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, email: e.target.value });
                    setLoginErrors({ ...loginErrors, email: null, form: null });
                  }}
                  className={`w-full bg-[#1A1A1A] border rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-[#666] transition-colors ${
                    loginErrors.email ? 'border-red-500' : 'border-[#333] focus:border-[#D4AF37]'
                  }`}
                  placeholder="admin@castrezautrans.com"
                  data-testid="login-email-input"
                />
              </div>
              {loginErrors.email && (
                <p className="text-red-400 text-sm mt-1">{loginErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-sm text-[#A3A3A3] mb-2 block">Contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, password: e.target.value });
                    setLoginErrors({ ...loginErrors, password: null, form: null });
                  }}
                  className={`w-full bg-[#1A1A1A] border rounded-xl pl-12 pr-12 py-3 text-white placeholder:text-[#666] transition-colors ${
                    loginErrors.password ? 'border-red-500' : 'border-[#333] focus:border-[#D4AF37]'
                  }`}
                  placeholder="••••••••"
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
                  data-testid="toggle-password-btn"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {loginErrors.password && (
                <p className="text-red-400 text-sm mt-1">{loginErrors.password}</p>
              )}
            </div>

            {/* Form Error */}
            {loginErrors.form && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{loginErrors.form}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full btn-gold py-4 rounded-xl text-base font-semibold disabled:opacity-50"
              data-testid="login-submit-btn"
            >
              {loginLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5\" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Security Note */}
          <div className="mt-6 pt-6 border-t border-[#262626]">
            <p className="text-[#666] text-xs text-center">
              <Lock size={12} className="inline mr-1" />
              Conexión segura. Solo personal autorizado.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'banners', label: 'Promociones', icon: Tag },
    { id: 'employees', label: 'Empleados', icon: Users },
    { id: 'workplaces', label: 'Lugares', icon: MapPin },
    { id: 'attendance', label: 'Asistencia', icon: ClipboardList },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#0A0A0A] border-b border-[#1A1A1A] z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <img src={LOGO_URL} alt="Castrez" className="h-8" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2"
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="lg:hidden fixed inset-0 bg-[#0A0A0A] z-40 pt-16"
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-[#D4AF37] text-black'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
                  }`}
                  data-testid={`mobile-nav-${item.id}`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-all"
                data-testid="mobile-logout-btn"
              >
                <LogOut size={20} />
                Cerrar sesión
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block admin-sidebar">
        <div className="p-6">
          <img src={LOGO_URL} alt="Castrez Autrans" className="h-12 mb-8" />
          
          <div className="flex items-center gap-3 mb-8 p-3 bg-[#0F0F0F] rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
              <span className="text-black font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-[#666] text-xs truncate">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-[#D4AF37] text-black'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
                }`}
                data-testid={`nav-${item.id}`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#1A1A1A]">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
            data-testid="logout-btn"
          >
            <LogOut size={20} className="mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content pt-20 lg:pt-0">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'appointments' && <AppointmentsManager />}
          {activeTab === 'banners' && <BannersManager />}
          {activeTab === 'employees' && <EmployeesManager />}
          {activeTab === 'workplaces' && <WorkplacesManager />}
          {activeTab === 'attendance' && <AttendanceManager />}
          {activeTab === 'reports' && <ReportsManager />}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminPage;
