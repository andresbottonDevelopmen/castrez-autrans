import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Users, MapPin, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const positions = [
  'Mecánico',
  'Electricista',
  'Recepcionista',
  'Jefe de Taller',
  'Chapista',
  'Pintor',
  'Auxiliar',
  'Administración'
];

const EmployeesManager = () => {
  const [employees, setEmployees] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    internal_id: '',
    full_name: '',
    position: '',
    workplace_id: '',
    username: '',
    password: '',
    is_active: true,
  });

  const fetchData = async () => {
    try {
      const [empRes, wpRes] = await Promise.all([
        axios.get(`${API}/admin/employees`),
        axios.get(`${API}/admin/workplaces`)
      ]);
      setEmployees(empRes.data);
      setWorkplaces(wpRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.internal_id || !formData.full_name || !formData.position || !formData.workplace_id) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      if (editingEmployee) {
        // Only send password if it was changed
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await axios.put(`${API}/admin/employees/${editingEmployee.id}`, updateData);
        toast.success('Empleado actualizado');
      } else {
        // Require username and password for new employees
        if (!formData.username || !formData.password) {
          toast.error('El usuario y contraseña son obligatorios para nuevos empleados');
          return;
        }
        await axios.post(`${API}/admin/employees`, formData);
        toast.success('Empleado creado');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Error al guardar empleado');
    }
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('¿Estás seguro de eliminar este empleado?')) return;
    
    try {
      await axios.delete(`${API}/admin/employees/${employeeId}`);
      toast.success('Empleado eliminado');
      fetchData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Error al eliminar empleado');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      internal_id: employee.internal_id,
      full_name: employee.full_name,
      position: employee.position,
      workplace_id: employee.workplace_id,
      username: employee.username || '',
      password: '', // Don't show existing password
      is_active: employee.is_active,
    });
    setDialogOpen(true);
  };

  const toggleActive = async (employee) => {
    try {
      await axios.put(`${API}/admin/employees/${employee.id}`, {
        is_active: !employee.is_active
      });
      toast.success(employee.is_active ? 'Empleado desactivado' : 'Empleado activado');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setShowPassword(false);
    setFormData({
      internal_id: '',
      full_name: '',
      position: '',
      workplace_id: '',
      username: '',
      password: '',
      is_active: true,
    });
  };

  const generateInternalId = () => {
    const id = `EMP-${Date.now().toString(36).toUpperCase()}`;
    setFormData({ ...formData, internal_id: id });
  };

  const generateUsername = () => {
    if (formData.full_name) {
      const username = formData.full_name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '.')
        .replace(/[^a-z.]/g, '');
      setFormData({ ...formData, username });
    }
  };

  const filteredEmployees = employees.filter((e) =>
    e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.internal_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.username && e.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div data-testid="employees-manager">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Syne']">Empleados</h1>
          <p className="text-[#A3A3A3]">Gestiona el equipo del taller</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="btn-gold rounded-full" data-testid="add-employee-btn">
              <Plus size={18} className="mr-2" />
              Añadir Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0F0F0F] border-[#262626] max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white font-['Syne']">
                {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Internal ID */}
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">ID Interno *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.internal_id}
                    onChange={(e) => setFormData({ ...formData, internal_id: e.target.value })}
                    className="flex-1 bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
                    placeholder="EMP-001"
                    required
                    data-testid="employee-id-input"
                  />
                  <Button type="button" variant="outline" onClick={generateInternalId} className="border-[#333]">
                    Generar
                  </Button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
                  placeholder="Juan García López"
                  required
                  data-testid="employee-name-input"
                />
              </div>

              {/* Position */}
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Cargo *</label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-[#333] text-white" data-testid="employee-position-select">
                    <SelectValue placeholder="Seleccionar cargo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#333]">
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos} className="text-white">
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Workplace */}
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Lugar de Trabajo *</label>
                <Select
                  value={formData.workplace_id}
                  onValueChange={(value) => setFormData({ ...formData, workplace_id: value })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-[#333] text-white" data-testid="employee-workplace-select">
                    <SelectValue placeholder="Seleccionar lugar" />
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

              {/* Credentials Section */}
              <div className="pt-4 border-t border-[#262626]">
                <div className="flex items-center gap-2 mb-4">
                  <Key size={18} className="text-[#D4AF37]" />
                  <span className="text-white font-medium">Credenciales de Acceso</span>
                </div>

                {/* Username */}
                <div className="mb-4">
                  <label className="text-sm text-[#A3A3A3] mb-1 block">
                    Usuario {!editingEmployee && '*'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="flex-1 bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
                      placeholder="juan.garcia"
                      data-testid="employee-username-input"
                    />
                    <Button type="button" variant="outline" onClick={generateUsername} className="border-[#333]">
                      Auto
                    </Button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm text-[#A3A3A3] mb-1 block">
                    Contraseña {!editingEmployee && '*'}
                    {editingEmployee && <span className="text-[#666]"> (dejar vacío para no cambiar)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 pr-12 py-2 text-white"
                      placeholder="••••••••"
                      data-testid="employee-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between pt-4">
                <label className="text-white">Estado activo</label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  data-testid="employee-active-switch"
                />
              </div>

              <Button type="submit" className="w-full btn-gold rounded-lg" data-testid="save-employee-btn">
                {editingEmployee ? 'Actualizar' : 'Crear'} Empleado
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
        <input
          type="text"
          placeholder="Buscar por nombre, ID, cargo o usuario..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0F0F0F] border border-[#262626] rounded-lg pl-12 pr-4 py-3 text-white"
          data-testid="search-employees-input"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-4">
          <p className="text-[#666] text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{employees.length}</p>
        </div>
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-4">
          <p className="text-[#666] text-sm">Activos</p>
          <p className="text-2xl font-bold text-green-400">{employees.filter(e => e.is_active).length}</p>
        </div>
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-4">
          <p className="text-[#666] text-sm">Inactivos</p>
          <p className="text-2xl font-bold text-red-400">{employees.filter(e => !e.is_active).length}</p>
        </div>
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-4">
          <p className="text-[#666] text-sm">Con acceso</p>
          <p className="text-2xl font-bold text-[#D4AF37]">{employees.filter(e => e.username).length}</p>
        </div>
      </div>

      {/* Employees Table */}
      {loading ? (
        <div className="text-center py-12 text-[#A3A3A3]">Cargando...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-[#333] mb-4" />
          <p className="text-[#A3A3A3]">No hay empleados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table" data-testid="employees-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Lugar</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="font-mono text-[#A3A3A3]">{employee.internal_id}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                        <span className="text-[#D4AF37] font-bold">
                          {employee.full_name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-white font-medium">{employee.full_name}</span>
                    </div>
                  </td>
                  <td className="text-[#A3A3A3]">{employee.position}</td>
                  <td>
                    <div className="flex items-center gap-2 text-[#A3A3A3]">
                      <MapPin size={14} />
                      {employee.workplace_name || 'Sin asignar'}
                    </div>
                  </td>
                  <td>
                    {employee.username ? (
                      <span className="text-[#D4AF37] font-mono text-sm">{employee.username}</span>
                    ) : (
                      <span className="text-[#666] text-sm">Sin usuario</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleActive(employee)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        employee.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {employee.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-colors"
                        data-testid={`edit-employee-${employee.id}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        data-testid={`delete-employee-${employee.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeesManager;
