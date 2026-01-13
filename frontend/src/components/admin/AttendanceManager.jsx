import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Clock, Download, Pencil, Trash2, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusLabels = {
  present: { label: 'Puntual', class: 'bg-green-500/20 text-green-400' },
  late: { label: 'Tardío', class: 'bg-yellow-500/20 text-yellow-400' },
  absent: { label: 'Ausente', class: 'bg-red-500/20 text-red-400' },
};

const AttendanceManager = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee_id: '',
    workplace_id: '',
    date_from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ check_in: '', check_out: '', status: '', notes: '' });

  const fetchData = async () => {
    try {
      const [attRes, empRes, wpRes] = await Promise.all([
        axios.get(`${API}/admin/attendance`, { params: filters }),
        axios.get(`${API}/admin/employees`),
        axios.get(`${API}/admin/workplaces`)
      ]);
      setAttendance(attRes.data);
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

  const applyFilters = () => {
    setLoading(true);
    fetchData();
  };

  const handleDelete = async (attendanceId) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;
    
    try {
      await axios.delete(`${API}/admin/attendance/${attendanceId}`);
      toast.success('Registro eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleEdit = (att) => {
    setSelectedAttendance(att);
    setEditData({
      check_in: att.check_in || '',
      check_out: att.check_out || '',
      status: att.status || 'present',
      notes: att.notes || '',
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API}/admin/attendance/${selectedAttendance.id}`, editData);
      toast.success('Registro actualizado');
      setEditOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await axios.get(`${API}/admin/reports/attendance/excel`, {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `asistencia_${filters.date_from}_a_${filters.date_to}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Reporte descargado');
    } catch (error) {
      toast.error('Error al exportar');
    }
  };

  const viewDetails = (att) => {
    setSelectedAttendance(att);
    setDetailsOpen(true);
  };

  return (
    <div data-testid="attendance-manager">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Syne']">Asistencia</h1>
          <p className="text-[#A3A3A3]">Control de asistencia del equipo</p>
        </div>
        
        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-500 rounded-full" data-testid="export-excel-btn">
          <Download size={18} className="mr-2" />
          Exportar Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-[#A3A3A3] mb-4">
          <Filter size={18} />
          <span className="font-medium">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select
            value={filters.employee_id || "all"}
            onValueChange={(value) => setFilters({ ...filters, employee_id: value === "all" ? "" : value })}
          >
            <SelectTrigger className="bg-[#1A1A1A] border-[#333] text-white">
              <SelectValue placeholder="Todos los empleados" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#333]">
              <SelectItem value="all" className="text-white">Todos los empleados</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id} className="text-white">
                  {emp.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.workplace_id || "all"}
            onValueChange={(value) => setFilters({ ...filters, workplace_id: value === "all" ? "" : value })}
          >
            <SelectTrigger className="bg-[#1A1A1A] border-[#333] text-white">
              <SelectValue placeholder="Todos los lugares" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#333]">
              <SelectItem value="all" className="text-white">Todos los lugares</SelectItem>
              {workplaces.map((wp) => (
                <SelectItem key={wp.id} value={wp.id} className="text-white">
                  {wp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
            />
          </div>

          <Button onClick={applyFilters} className="btn-gold rounded-lg" data-testid="apply-filters-btn">
            Aplicar
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      {loading ? (
        <div className="text-center py-12 text-[#A3A3A3]">Cargando...</div>
      ) : attendance.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-[#333] mb-4" />
          <p className="text-[#A3A3A3]">No hay registros de asistencia</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table" data-testid="attendance-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Horas</th>
                <th>Estado</th>
                <th>Lugar</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((att) => (
                <tr key={att.id}>
                  <td className="font-mono text-white">{att.date}</td>
                  <td className="text-white">{att.employee_name}</td>
                  <td className="font-mono text-green-400">{att.check_in || '-'}</td>
                  <td className="font-mono text-red-400">{att.check_out || '-'}</td>
                  <td className="font-mono text-[#D4AF37]">
                    {att.hours_worked ? `${att.hours_worked}h` : '-'}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusLabels[att.status]?.class}`}>
                      {statusLabels[att.status]?.label || att.status}
                    </span>
                  </td>
                  <td className="text-[#A3A3A3]">{att.workplace_name}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => viewDetails(att)}
                        className="p-2 text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] rounded-lg"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(att)}
                        className="p-2 text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] rounded-lg"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(att.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg"
                        title="Eliminar"
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

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-[#0F0F0F] border-[#262626] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-['Syne']">Detalles de Asistencia</DialogTitle>
          </DialogHeader>
          {selectedAttendance && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#666] text-sm">Empleado</p>
                  <p className="text-white">{selectedAttendance.employee_name}</p>
                </div>
                <div>
                  <p className="text-[#666] text-sm">Fecha</p>
                  <p className="text-white font-mono">{selectedAttendance.date}</p>
                </div>
                <div>
                  <p className="text-[#666] text-sm">Entrada</p>
                  <p className="text-green-400 font-mono">{selectedAttendance.check_in || '-'}</p>
                </div>
                <div>
                  <p className="text-[#666] text-sm">Salida</p>
                  <p className="text-red-400 font-mono">{selectedAttendance.check_out || '-'}</p>
                </div>
              </div>

              {(selectedAttendance.check_in_lat || selectedAttendance.check_out_lat) && (
                <div className="pt-4 border-t border-[#262626]">
                  <p className="text-[#666] text-sm mb-2 flex items-center gap-2">
                    <MapPin size={14} />
                    Ubicación GPS
                  </p>
                  {selectedAttendance.check_in_lat && (
                    <div className="mb-2">
                      <p className="text-[#A3A3A3] text-xs">Entrada:</p>
                      <p className="text-white text-sm font-mono">
                        {selectedAttendance.check_in_lat.toFixed(6)}, {selectedAttendance.check_in_lng.toFixed(6)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${selectedAttendance.check_in_lat},${selectedAttendance.check_in_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#D4AF37] text-xs hover:underline"
                      >
                        Ver en Google Maps
                      </a>
                    </div>
                  )}
                  {selectedAttendance.check_out_lat && (
                    <div>
                      <p className="text-[#A3A3A3] text-xs">Salida:</p>
                      <p className="text-white text-sm font-mono">
                        {selectedAttendance.check_out_lat.toFixed(6)}, {selectedAttendance.check_out_lng.toFixed(6)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${selectedAttendance.check_out_lat},${selectedAttendance.check_out_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#D4AF37] text-xs hover:underline"
                      >
                        Ver en Google Maps
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#0F0F0F] border-[#262626] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-['Syne']">Editar Asistencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Entrada</label>
                <input
                  type="time"
                  value={editData.check_in}
                  onChange={(e) => setEditData({ ...editData, check_in: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Salida</label>
                <input
                  type="time"
                  value={editData.check_out}
                  onChange={(e) => setEditData({ ...editData, check_out: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-[#A3A3A3] mb-1 block">Estado</label>
              <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  <SelectItem value="present" className="text-white">Puntual</SelectItem>
                  <SelectItem value="late" className="text-white">Tardío</SelectItem>
                  <SelectItem value="absent" className="text-white">Ausente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-[#A3A3A3] mb-1 block">Notas</label>
              <textarea
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
                rows={2}
              />
            </div>
            <Button onClick={saveEdit} className="w-full btn-gold rounded-lg">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceManager;
