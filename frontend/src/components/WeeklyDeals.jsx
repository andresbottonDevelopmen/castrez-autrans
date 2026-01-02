import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Flame, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WeeklyDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get(`${API}/products/weekly-deals`);
        setDeals(response.data);
      } catch (error) {
        console.error('Error fetching weekly deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-6 md:px-12 bg-gradient-to-b from-[#050505] to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[280px] h-[350px] bg-[#1A1A1A] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (deals.length === 0) return null;

  return (
    <section className="py-16 px-6 md:px-12 bg-gradient-to-b from-[#050505] to-[#0A0A0A]" data-testid="weekly-deals-section">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Flame size={24} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white font-['Syne']">Ofertas de la Semana</h2>
              <p className="text-[#A3A3A3] text-sm">Recambios con descuentos especiales</p>
            </div>
          </div>
          <a
            href="#recambios"
            className="hidden md:flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors"
          >
            Ver todos
            <ArrowRight size={18} />
          </a>
        </motion.div>

        {/* Deals Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {deals.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[280px] md:min-w-[320px] glass-card rounded-2xl p-6 hover:border-[#D4AF37]/50 transition-all group flex-shrink-0"
              data-testid={`deal-${product.id}`}
            >
              {/* Discount Badge */}
              {product.discount_price && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                </div>
              )}

              {/* Image */}
              {product.image_url ? (
                <div className="aspect-square rounded-xl mb-4 overflow-hidden bg-[#1A1A1A]">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-xl mb-4 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] flex items-center justify-center">
                  <Tag size={48} className="text-[#333]" />
                </div>
              )}

              {/* Badges */}
              <div className="flex gap-2 mb-3">
                {product.is_weekly_deal && (
                  <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                    Oferta Semanal
                  </span>
                )}
                {product.is_reconditioned && (
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                    Reacondicionado
                  </span>
                )}
              </div>

              {/* Info */}
              <h4 className="text-white font-semibold mb-1 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                {product.name}
              </h4>
              <p className="text-[#666] text-xs mb-3">Ref: {product.reference}</p>

              {/* Price */}
              <div className="flex items-end gap-3">
                {product.discount_price ? (
                  <>
                    <span className="text-2xl font-bold text-[#D4AF37] font-mono">
                      {product.discount_price.toFixed(2)}€
                    </span>
                    <span className="text-[#666] line-through text-sm">
                      {product.price.toFixed(2)}€
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-white font-mono">
                    {product.price.toFixed(2)}€
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile view all link */}
        <div className="md:hidden mt-6 text-center">
          <a
            href="#recambios"
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors"
          >
            Ver todos los recambios
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default WeeklyDeals;
