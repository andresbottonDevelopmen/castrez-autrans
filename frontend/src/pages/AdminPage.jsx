import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { Package, Calendar, Tag, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductsManager from '@/components/admin/ProductsManager';
import AppointmentsManager from '@/components/admin/AppointmentsManager';
import BannersManager from '@/components/admin/BannersManager';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_1c5df42d-6505-4d6c-97c6-dd11a75d6657/artifacts/f0cxn3lf_logo%20castrez.avif';

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${API}/auth/google`, {
        credential: credentialResponse.credential
      });
      
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      toast.success(`Bienvenido, ${userData.name}`);
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Error al iniciar sesión');
    }
  };

  const handleLogout = () => {
    setUser(null);
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
          className="glass-card p-8 rounded-2xl max-w-md w-full text-center"
        >
          <img src={LOGO_URL} alt="Castrez Autrans" className="h-20 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2 font-['Syne']">Panel de Administración</h1>
          <p className="text-[#A3A3A3] mb-8">Inicia sesión con tu cuenta de Google</p>
          
          <div className="flex justify-center" data-testid="google-login-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Error al iniciar sesión')}
              theme="filled_black"
              size="large"
              text="signin_with"
              shape="pill"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'banners', label: 'Promociones', icon: Tag },
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
            {user.picture && (
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
            )}
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
        </motion.div>
      </main>
    </div>
  );
};

export default AdminPage;

const AnimatePresence = motion.div ? require('framer-motion').AnimatePresence : ({ children }) => children;
