import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MapPin, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WorkplacesManager = () => {
  const [workplaces, setWorkplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkplace, setEditingWorkplace] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    is_active: true,
  });

  const fetchWorkplaces = async () => {
    try {
      const response = await axios.get(`${API}/admin/workplaces`);
      setWorkplaces(response.data);
    } catch (error) {
      console.error('Error fetching workplaces:', error);
      toast.error('Error al cargar lugares');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkplaces();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };

    try {
      if (editingWorkplace) {
        await axios.put(`${API}/admin/workplaces/${editingWorkplace.id}`, data);
        toast.success('Lugar actualizado');
      } else {
        await axios.post(`${API}/admin/workplaces`, data);
        toast.success('Lugar creado');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchWorkplaces();
    } catch (error) {
      console.error('Error saving workplace:', error);
      toast.error('Error al guardar lugar');
    }
  };

  const handleDelete = async (workplaceId) => {
    if (!window.confirm('¿Estás seguro de eliminar este lugar?')) return;
    
    try {
      await axios.delete(`${API}/admin/workplaces/${workplaceId}`);
      toast.success('Lugar eliminado');
      fetchWorkplaces();
    } catch (error) {
      console.error('Error deleting workplace:', error);
      toast.error('Error al eliminar lugar');
    }
  };

  const handleEdit = (workplace) => {
    setEditingWorkplace(workplace);
    setFormData({
      name: workplace.name,
      address: workplace.address,
      latitude: workplace.latitude?.toString() || '',
      longitude: workplace.longitude?.toString() || '',
      is_active: workplace.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingWorkplace(null);
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      is_active: true,
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
          toast.success('Ubicación capturada');
        },
        () => {
          toast.error('No se pudo obtener la ubicación');
        }
      );
    }
  };

  return (
    <div data-testid="workplaces-manager">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Syne']">Lugares de Trabajo</h1>
          <p className="text-[#A3A3A3]">Gestiona las ubicaciones del taller</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="btn-gold rounded-full" data-testid="add-workplace-btn">
              <Plus size={18} className="mr-2" />
              Añadir Lugar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0F0F0F] border-[#262626] max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white font-['Syne']">
                {editingWorkplace ? 'Editar Lugar' : 'Nuevo Lugar'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
                  placeholder="Ej: Taller Principal"
                  required
                  data-testid="workplace-name-input"
                />
              </div>
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Dirección *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
                  placeholder="Carrer Masnou 25, Terrassa"
                  required
                  data-testid="workplace-address-input"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-[#A3A3A3]">Coordenadas GPS</label>
                  <Button type="button" variant="ghost" size="sm" onClick={getCurrentLocation} className="text-[#D4AF37]">
                    <MapPin size={14} className="mr-1" />
                    Usar mi ubicación
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
                    placeholder="Latitud"
                    data-testid="workplace-lat-input"
                  />
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-white"
                    placeholder="Longitud"
                    data-testid="workplace-lng-input"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white">Lugar activo</label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  data-testid="workplace-active-switch"
                />
              </div>
              <Button type="submit" className="w-full btn-gold rounded-lg" data-testid="save-workplace-btn">
                {editingWorkplace ? 'Actualizar' : 'Crear'} Lugar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workplaces Grid */}
      {loading ? (
        <div className="text-center py-12 text-[#A3A3A3]">Cargando...</div>
      ) : workplaces.length === 0 ? (
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto text-[#333] mb-4" />
          <p className="text-[#A3A3A3]">No hay lugares de trabajo</p>
          <p className="text-[#666] text-sm">Añade un lugar para gestionar asistencias</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workplaces.map((workplace) => (
            <div
              key={workplace.id}
              className={`bg-[#0F0F0F] border rounded-xl p-6 ${
                workplace.is_active ? 'border-[#262626]' : 'border-red-500/20'
              }`}
              data-testid={`workplace-${workplace.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                  <Building2 size={24} className="text-[#D4AF37]" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(workplace)}
                    className="p-2 text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(workplace.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-white font-semibold mb-1">{workplace.name}</h3>
              <p className="text-[#A3A3A3] text-sm mb-3">{workplace.address}</p>

              {workplace.latitude && workplace.longitude && (
                <div className="flex items-center gap-2 text-[#666] text-xs mb-3">
                  <MapPin size={12} />
                  <span>{workplace.latitude.toFixed(4)}, {workplace.longitude.toFixed(4)}</span>
                </div>
              )}

              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                workplace.is_active
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {workplace.is_active ? 'Activo' : 'Inactivo'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkplacesManager;
