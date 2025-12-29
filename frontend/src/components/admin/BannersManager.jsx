import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BannersManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_text: '',
    is_active: true,
    expires_at: '',
  });

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API}/admin/banners`);
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Error al cargar promociones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBanner) {
        await axios.put(`${API}/admin/banners/${editingBanner.id}`, formData);
        toast.success('Promoción actualizada');
      } else {
        await axios.post(`${API}/admin/banners`, formData);
        toast.success('Promoción creada');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Error al guardar promoción');
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta promoción?')) return;
    
    try {
      await axios.delete(`${API}/admin/banners/${bannerId}`);
      toast.success('Promoción eliminada');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Error al eliminar promoción');
    }
  };

  const toggleActive = async (banner) => {
    try {
      await axios.put(`${API}/admin/banners/${banner.id}`, {
        ...banner,
        is_active: !banner.is_active,
      });
      toast.success(banner.is_active ? 'Promoción desactivada' : 'Promoción activada');
      fetchBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      discount_text: banner.discount_text,
      is_active: banner.is_active,
      expires_at: banner.expires_at || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      discount_text: '',
      is_active: true,
      expires_at: '',
    });
  };

  return (
    <div data-testid="banners-manager">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Syne']">Promociones</h1>
          <p className="text-[#A3A3A3]">Gestiona los banners promocionales</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="btn-gold rounded-full" data-testid="add-banner-btn">
              <Plus size={18} className="mr-2" />
              Nueva Promoción
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0F0F0F] border-[#262626] max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white font-['Syne']">
                {editingBanner ? 'Editar Promoción' : 'Nueva Promoción'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 w-full text-white"
                  placeholder="Ej: Oferta de Invierno"
                  required
                  data-testid="banner-title-input"
                />
              </div>
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Descripción *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 w-full text-white"
                  placeholder="Ej: Cambio de pastillas de freno"
                  rows={2}
                  required
                  data-testid="banner-description-input"
                />
              </div>
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Texto de Descuento *</label>
                <input
                  type="text"
                  value={formData.discount_text}
                  onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 w-full text-white"
                  placeholder="Ej: 15% de descuento"
                  required
                  data-testid="banner-discount-input"
                />
              </div>
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Fecha de expiración (opcional)</label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 w-full text-white"
                  data-testid="banner-expires-input"
                />
              </div>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="accent-[#D4AF37]"
                  data-testid="banner-active-checkbox"
                />
                Activo inmediatamente
              </label>
              <Button type="submit" className="w-full btn-gold rounded-lg" data-testid="save-banner-btn">
                {editingBanner ? 'Actualizar' : 'Crear'} Promoción
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#A3A3A3]">Cargando...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12">
          <Tag size={48} className="mx-auto text-[#333] mb-4" />
          <p className="text-[#A3A3A3]">No hay promociones</p>
          <p className="text-[#666] text-sm">Crea una promoción para mostrar en la web</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-[#0F0F0F] border rounded-xl p-6 transition-colors ${
                banner.is_active ? 'border-[#D4AF37]/30' : 'border-[#262626]'
              }`}
              data-testid={`banner-${banner.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold">{banner.title}</h3>
                    {banner.is_active && (
                      <span className="px-2 py-1 text-xs bg-[#D4AF37]/20 text-[#D4AF37] rounded-full">Activo</span>
                    )}
                  </div>
                  <p className="text-[#A3A3A3]">{banner.description}</p>
                  <p className="text-[#D4AF37] font-bold mt-2">{banner.discount_text}</p>
                  {banner.expires_at && (
                    <p className="text-[#666] text-sm mt-1">Expira: {banner.expires_at}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`p-2 rounded-lg transition-colors ${
                      banner.is_active
                        ? 'text-[#D4AF37] hover:bg-[#D4AF37]/10'
                        : 'text-[#666] hover:bg-[#1A1A1A]'
                    }`}
                    title={banner.is_active ? 'Desactivar' : 'Activar'}
                    data-testid={`toggle-banner-${banner.id}`}
                  >
                    {banner.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-colors"
                    data-testid={`edit-banner-${banner.id}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    data-testid={`delete-banner-${banner.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannersManager;
