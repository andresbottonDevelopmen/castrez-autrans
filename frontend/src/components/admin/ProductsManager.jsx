import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = [
  { value: 'frenos', label: 'Frenos' },
  { value: 'motor', label: 'Motor' },
  { value: 'suspension', label: 'Suspensión' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'filtros', label: 'Filtros' },
  { value: 'aceites', label: 'Aceites' },
];

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category: '',
    reference: '',
    image_url: '',
    is_reconditioned: false,
    is_featured: false,
  });

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, productData);
        toast.success('Producto actualizado');
      } else {
        await axios.post(`${API}/admin/products`, productData);
        toast.success('Producto creado');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar producto');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await axios.delete(`${API}/admin/products/${productId}`);
      toast.success('Producto eliminado');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount_price: product.discount_price?.toString() || '',
      category: product.category,
      reference: product.reference,
      image_url: product.image_url || '',
      is_reconditioned: product.is_reconditioned,
      is_featured: product.is_featured,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category: '',
      reference: '',
      image_url: '',
      is_reconditioned: false,
      is_featured: false,
    });
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div data-testid="products-manager">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Syne']">Productos</h1>
          <p className="text-[#A3A3A3]">Gestiona tu catálogo de recambios</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="btn-gold rounded-full" data-testid="add-product-btn">
              <Plus size={18} className="mr-2" />
              Añadir Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0F0F0F] border-[#262626] max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white font-['Syne']">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 w-full text-white"
                  required
                  data-testid="product-name-input"
                />
              </div>
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">Descripción *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 w-full text-white"
                  rows={3}
                  required
                  data-testid="product-description-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#A3A3A3] mb-1 block">Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 w-full text-white"
                    required
                    data-testid="product-price-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#A3A3A3] mb-1 block">Precio Descuento</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 w-full text-white"
                    data-testid="product-discount-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#A3A3A3] mb-1 block">Categoría *</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-[#1A1A1A] border-[#333] text-white" data-testid="product-category-select">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#333]">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-[#A3A3A3] mb-1 block">Referencia *</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 w-full text-white"
                    required
                    data-testid="product-reference-input"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#A3A3A3] mb-1 block">URL Imagen</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 w-full text-white"
                  placeholder="https://..."
                  data-testid="product-image-input"
                />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_reconditioned}
                    onChange={(e) => setFormData({ ...formData, is_reconditioned: e.target.checked })}
                    className="accent-[#D4AF37]"
                    data-testid="product-reconditioned-checkbox"
                  />
                  Reacondicionada
                </label>
                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="accent-[#D4AF37]"
                    data-testid="product-featured-checkbox"
                  />
                  Destacado
                </label>
              </div>
              <Button type="submit" className="w-full btn-gold rounded-lg" data-testid="save-product-btn">
                {editingProduct ? 'Actualizar' : 'Crear'} Producto
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
          placeholder="Buscar por nombre o referencia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0F0F0F] border border-[#262626] rounded-lg pl-12 pr-4 py-3 text-white"
          data-testid="search-products-input"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-12 text-[#A3A3A3]">Cargando...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-[#333] mb-4" />
          <p className="text-[#A3A3A3]">No hay productos</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table" data-testid="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                          <Package size={16} className="text-[#666]" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-[#666] text-xs">Ref: {product.reference}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-[#A3A3A3] capitalize">{product.category}</td>
                  <td>
                    {product.discount_price ? (
                      <div>
                        <span className="text-[#D4AF37] font-mono">{product.discount_price}€</span>
                        <span className="text-[#666] text-sm line-through ml-2">{product.price}€</span>
                      </div>
                    ) : (
                      <span className="text-white font-mono">{product.price}€</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {product.is_featured && (
                        <span className="px-2 py-1 text-xs bg-[#D4AF37]/20 text-[#D4AF37] rounded-full">Destacado</span>
                      )}
                      {product.is_reconditioned && (
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">Reacond.</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-colors"
                        data-testid={`edit-product-${product.id}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        data-testid={`delete-product-${product.id}`}
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

export default ProductsManager;
