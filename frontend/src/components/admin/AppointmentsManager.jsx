import { useState, useEffect } from 'react';
import { Calendar, Clock, Car, User, Phone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusConfig = {
  pending: { label: 'Pendiente', class: 'status-pending' },
  confirmed: { label: 'Confirmada', class: 'status-confirmed' },
  completed: { label: 'Completada', class: 'status-completed' },
  cancelled: { label: 'Cancelada', class: 'status-cancelled' },
};

const AppointmentsManager = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchAppointments = async () => {
    try {
      let url = `${API}/admin/appointments`;
      if (filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }
      const response = await axios.get(url);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(`${API}/admin/appointments/${appointmentId}`, { status: newStatus });
      toast.success('Estado actualizado');
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error al actualizar');
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cita?')) return;
    
    try {
      await axios.delete(`${API}/admin/appointments/${appointmentId}`);
      toast.success('Cita eliminada');
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Error al eliminar');
    }
  };

  const getServiceLabel = (service) => {
    const labels = {
      essential: 'Pack Essential',
      advance: 'Pack Advance',
      premium: 'Pack Premium',
      diagnosis: 'Diagnosis',
      brakes: 'Revisión Frenos',
      other: 'Otro',
    };
    return labels[service] || service;
  };

  return (
    <div data-testid="appointments-manager">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Syne']">Citas</h1>
          <p className="text-[#A3A3A3]">Gestiona las solicitudes de cita</p>
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] bg-[#0F0F0F] border-[#262626] text-white" data-testid="filter-status-select">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#333]">
            <SelectItem value="all" className="text-white">Todas</SelectItem>
            <SelectItem value="pending" className="text-white">Pendientes</SelectItem>
            <SelectItem value="confirmed" className="text-white">Confirmadas</SelectItem>
            <SelectItem value="completed" className="text-white">Completadas</SelectItem>
            <SelectItem value="cancelled" className="text-white">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#D4AF37]" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-[#333] mb-4" />
          <p className="text-[#A3A3A3]">No hay citas {filterStatus !== 'all' ? `${statusConfig[filterStatus]?.label.toLowerCase()}s` : ''}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-6 hover:border-[#333] transition-colors"
              data-testid={`appointment-${appointment.id}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Client Info */}
                  <div>
                    <div className="flex items-center gap-2 text-[#666] text-sm mb-1">
                      <User size={14} />
                      <span>Cliente</span>
                    </div>
                    <p className="text-white font-medium">{appointment.name}</p>
                    <div className="flex items-center gap-2 text-[#A3A3A3] text-sm mt-1">
                      <Phone size={12} />
                      <a href={`tel:${appointment.phone}`} className="hover:text-[#D4AF37]">
                        {appointment.phone}
                      </a>
                    </div>
                  </div>

                  {/* Vehicle */}
                  <div>
                    <div className="flex items-center gap-2 text-[#666] text-sm mb-1">
                      <Car size={14} />
                      <span>Vehículo</span>
                    </div>
                    <p className="text-white font-mono text-lg">{appointment.license_plate}</p>
                  </div>

                  {/* Service */}
                  <div>
                    <div className="flex items-center gap-2 text-[#666] text-sm mb-1">
                      <Clock size={14} />
                      <span>Servicio</span>
                    </div>
                    <p className="text-white">{getServiceLabel(appointment.service_type)}</p>
                    <p className="text-[#D4AF37] text-sm">{appointment.preferred_date}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <div className="text-[#666] text-sm mb-2">Estado</div>
                    <span className={`status-badge ${statusConfig[appointment.status]?.class}`}>
                      {statusConfig[appointment.status]?.label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(appointment.id, 'confirmed')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                      data-testid={`confirm-${appointment.id}`}
                    >
                      <CheckCircle size={16} />
                      Confirmar
                    </button>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(appointment.id, 'completed')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      data-testid={`complete-${appointment.id}`}
                    >
                      <CheckCircle size={16} />
                      Completar
                    </button>
                  )}
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <button
                      onClick={() => updateStatus(appointment.id, 'cancelled')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      data-testid={`cancel-${appointment.id}`}
                    >
                      <XCircle size={16} />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              {appointment.notes && (
                <div className="mt-4 pt-4 border-t border-[#262626]">
                  <p className="text-[#666] text-sm">Notas:</p>
                  <p className="text-[#A3A3A3]">{appointment.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsManager;
