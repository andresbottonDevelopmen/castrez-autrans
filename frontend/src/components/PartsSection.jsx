import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Recycle, Shield, Truck } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = [
  { id: 'frenos', label: 'Frenos', icon: '🛞' },
  { id: 'motor', label: 'Motor', icon: '⚙️' },
  { id: 'suspension', label: 'Suspensión', icon: '🔧' },
  { id: 'electronica', label: 'Electrónica', icon: '⚡' },
];

const features = [
  {
    icon: Recycle,
    title: 'Reacondicionadas',
    description: 'Piezas certificadas como nuevas',
  },
  {
    icon: Shield,
    title: 'Garantía 2 Años',
    description: 'Máxima tranquilidad',
  },
  {
    icon: Truck,
    title: 'Envío Express',
    description: 'Recibe en 24-48h',
  },
];

const PartsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (category = null, search = null) => {
    setLoading(true);
    try {
      let url = `${API}/products`;
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(selectedCategory, searchQuery);
  };

  const handleCategoryClick = (categoryId) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    fetchProducts(newCategory, searchQuery);
  };

  return (
    <section id="recambios" className="py-24 md:py-32 px-6 md:px-12 bg-[#0A0A0A]" data-testid="parts-section">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#D4AF37] text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            Recambios Premium
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-['Syne'] tracking-tight">
            Encuentra tu Pieza
          </h2>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto">
            Busca por matrícula o referencia. Piezas originales y reacondicionadas certificadas.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="search-input-container mb-12"
        >
          <Search className="search-icon" size={22} />
          <input
            type="text"
            placeholder="Buscar por matrícula, referencia o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            data-testid="parts-search-input"
          />
        </motion.form>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-[#1A1A1A] text-[#A3A3A3] hover:text-white hover:bg-[#262626]'
              }`}
              data-testid={`category-${cat.id}`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="aspect-square bg-[#1A1A1A] rounded-lg mb-4" />
                <div className="h-4 bg-[#1A1A1A] rounded mb-2" />
                <div className="h-3 bg-[#1A1A1A] rounded w-2/3" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.slice(0, 8).map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-xl p-4 hover:border-[#D4AF37]/50 transition-all group"
                data-testid={`product-${product.id}`}
              >
                {product.image_url ? (
                  <div className="aspect-square rounded-lg mb-4 overflow-hidden bg-[#1A1A1A]">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg mb-4 bg-[#1A1A1A] flex items-center justify-center">
                    <span className="text-4xl">🔧</span>
                  </div>
                )}
                
                {product.is_reconditioned && (
                  <span className="inline-block px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full mb-2">
                    Reacondicionada
                  </span>
                )}
                
                <h4 className="text-white font-medium mb-1 line-clamp-2">{product.name}</h4>
                <p className="text-[#666] text-xs mb-2">Ref: {product.reference}</p>
                
                <div className="flex items-center gap-2">
                  {product.discount_price ? (
                    <>
                      <span className="text-[#D4AF37] font-bold font-mono">{product.discount_price}€</span>
                      <span className="text-[#666] text-sm line-through">{product.price}€</span>
                    </>
                  ) : (
                    <span className="text-white font-bold font-mono">{product.price}€</span>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-[#666]">
              <p>No se encontraron productos. Prueba con otra búsqueda.</p>
            </div>
          )}
        </div>

        {/* Reconditioned Parts Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 font-['Syne']">
              Piezas Reacondicionadas Certificadas
            </h3>
            <p className="text-[#A3A3A3]">
              Calidad original a precio reducido. Todas nuestras piezas pasan un riguroso control de calidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon size={24} className="text-[#D4AF37]" />
                </div>
                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                <p className="text-[#666] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartsSection;
