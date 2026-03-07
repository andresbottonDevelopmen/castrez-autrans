import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, LogIn, LogOut, CheckCircle, AlertCircle, User, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_1c5df42d-6505-4d6c-97c6-dd11a75d6657/artifacts/f0cxn3lf_logo%20castrez.avif';

const AttendancePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [workplaces, setWorkplaces] = useState([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Login form
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem('employee_token');
    const savedUser = localStorage.getItem('employee_user');
    
    if (token && savedUser) {
      verifyToken(token, JSON.parse(savedUser));
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token, savedUser) => {
    try {
      const response = await axios.post(`${API}/auth/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.user.role === 'employee') {
        setUser(response.data.user);
        fetchWorkplaces();
        fetchTodayAttendance(response.data.user.id);
      }
    } catch (error) {
      localStorage.removeItem('employee_token');
      localStorage.removeItem('employee_user');
    } finally {
      setLoading(false);
    }
  };

  // Fetch workplaces
  const fetchWorkplaces = async () => {
    try {
      const response = await axios.get(`${API}/workplaces/active`);
      setWorkplaces(response.data);
      if (response.data.length > 0) {
        setSelectedWorkplace(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching workplaces:', error);
    }
  };

  // Fetch today's attendance
  const fetchTodayAttendance = async (employeeId) => {
    try {
      const response = await axios.get(`${API}/attendance/today/${employeeId}`);
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  // Get geolocation
  useEffect(() => {
    if (user && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError('No se pudo obtener la ubicación');
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginForm.username || !loginForm.password) {
      toast.error('Ingresa usuario y contraseña');
      return;
    }

    setLoginLoading(true);
    try {
      const response = await axios.post(`${API}/auth/employee/login`, loginForm);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('employee_token', token);
      localStorage.setItem('employee_user', JSON.stringify(userData));
      
      setUser(userData);
      fetchWorkplaces();
      fetchTodayAttendance(userData.id);
      toast.success(`¡Bienvenido, ${userData.name}!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Usuario o contraseña incorrectos');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTodayAttendance(null);
    localStorage.removeItem('employee_token');
    localStorage.removeItem('employee_user');
    setLoginForm({ username: '', password: '' });
    toast.success('Sesión cerrada');
  };

  const handleCheckIn = async () => {
    if (!selectedWorkplace) {
      toast.error('Selecciona un lugar de trabajo');
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.post(`${API}/attendance/check-in`, {
        employee_id: user.id,
        workplace_id: selectedWorkplace,
        latitude: location.lat,
        longitude: location.lng
      });
      
      setTodayAttendance(response.data.attendance);
      toast.success('¡Entrada registrada correctamente!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrar entrada');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    setActionLoading(true);
    try {
      const response = await axios.post(`${API}/attendance/check-out`, {
        attendance_id: todayAttendance.id,
        latitude: location.lat,
        longitude: location.lng
      });
      
      setTodayAttendance(prev => ({
        ...prev,
        check_out: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        hours_worked: response.data.hours_worked
      }));
      toast.success(`¡Salida registrada! Horas trabajadas: ${response.data.hours_worked}h`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrar salida');
    } finally {
      setActionLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col" data-testid="attendance-page">
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-[#1A1A1A] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img src={LOGO_URL} alt="Castrez Autrans" className="h-10" />
          <div className="text-right">
            <p className="text-[#D4AF37] text-3xl font-mono font-bold">
              {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-[#666] text-sm">
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {!user ? (
            /* Login Form */
            <div className="glass-card rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
                  <User size={40} className="text-[#D4AF37]" />
                </div>
                <h1 className="text-2xl font-bold text-white font-['Syne'] mb-2">Control de Asistencia</h1>
                <p className="text-[#A3A3A3]">Ingresa con tu usuario y contraseña</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6" data-testid="employee-login-form">
                <div>
                  <label className="text-sm text-[#A3A3A3] mb-2 block">Usuario</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-[#666] focus:border-[#D4AF37] transition-colors"
                      placeholder="Tu usuario"
                      data-testid="employee-username-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-[#A3A3A3] mb-2 block">Contraseña</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl pl-12 pr-12 py-3 text-white placeholder:text-[#666] focus:border-[#D4AF37] transition-colors"
                      placeholder="••••••••"
                      data-testid="employee-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full btn-gold py-4 rounded-xl text-base font-semibold"
                  data-testid="employee-login-btn"
                >
                  {loginLoading ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </form>
            </div>
          ) : (
            /* Attendance Panel */
            <div className="glass-card rounded-2xl p-8">
              {/* Employee Info */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-[#D4AF37] flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-black">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white font-['Syne']">{user.name}</h2>
                <p className="text-[#A3A3A3]">{user.workplace_name || 'Sin lugar asignado'}</p>
              </div>

              {/* Today's Status */}
              {todayAttendance ? (
                <div className="bg-[#0F0F0F] rounded-xl p-6 mb-6">
                  <h3 className="text-[#A3A3A3] text-sm mb-4 uppercase tracking-wide">Registro de Hoy</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
                        <LogIn size={18} />
                        <span className="text-sm">Entrada</span>
                      </div>
                      <p className="text-2xl font-mono text-white">{todayAttendance.check_in}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
                        <LogOut size={18} />
                        <span className="text-sm">Salida</span>
                      </div>
                      <p className="text-2xl font-mono text-white">
                        {todayAttendance.check_out || '--:--'}
                      </p>
                    </div>
                  </div>

                  {todayAttendance.hours_worked && (
                    <div className="mt-4 pt-4 border-t border-[#262626] text-center">
                      <p className="text-[#666] text-sm">Horas trabajadas</p>
                      <p className="text-xl font-mono text-[#D4AF37]">{todayAttendance.hours_worked}h</p>
                    </div>
                  )}

                  {todayAttendance.status === 'late' && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-yellow-500">
                      <AlertCircle size={16} />
                      <span className="text-sm">Llegada tardía registrada</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Workplace Selection */
                <div className="mb-6">
                  <label className="text-[#A3A3A3] text-sm mb-2 block">Lugar de trabajo</label>
                  <Select value={selectedWorkplace} onValueChange={setSelectedWorkplace}>
                    <SelectTrigger className="w-full bg-[#1A1A1A] border-[#333] text-white" data-testid="workplace-select">
                      <SelectValue placeholder="Selecciona lugar" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#333]">
                      {workplaces.map((wp) => (
                        <SelectItem key={wp.id} value={wp.id} className="text-white">
                          {wp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!todayAttendance ? (
                  <Button
                    onClick={handleCheckIn}
                    disabled={actionLoading || !selectedWorkplace}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-6 rounded-xl text-lg font-semibold"
                    data-testid="check-in-btn"
                  >
                    <LogIn size={24} className="mr-3" />
                    {actionLoading ? 'Registrando...' : 'Registrar Entrada'}
                  </Button>
                ) : !todayAttendance.check_out ? (
                  <Button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-6 rounded-xl text-lg font-semibold"
                    data-testid="check-out-btn"
                  >
                    <LogOut size={24} className="mr-3" />
                    {actionLoading ? 'Registrando...' : 'Registrar Salida'}
                  </Button>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle size={48} className="mx-auto text-green-400 mb-2" />
                    <p className="text-green-400 font-medium">Jornada completada</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full border-[#333] text-[#A3A3A3] hover:text-white py-4 rounded-xl"
                  data-testid="logout-btn"
                >
                  Cerrar sesión
                </Button>
              </div>

              {/* Location */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm">
                <MapPin size={14} className={location.lat ? 'text-green-400' : 'text-red-400'} />
                {location.lat ? (
                  <span className="text-[#666]">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </span>
                ) : (
                  <span className="text-red-400">{locationError || 'Obteniendo ubicación...'}</span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[#1A1A1A] px-6 py-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#666] text-sm">Castrez Autrans • Control de Asistencia</p>
        </div>
      </footer>
    </div>
  );
};

export default AttendancePage;
