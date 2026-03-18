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
      <section className="py-12 md:py-16 px-4 md:px-6 lg:px-12 bg-gradient-to-b from-[#050505] to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse grid grid-cols-2 md:flex md:gap-6 gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[280px] md:min-w-[280px] md:h-[350px] bg-[#1A1A1A] rounded-xl md:rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (deals.length === 0) return null;

  return (
    <section className="py-10 md:py-16 px-4 md:px-6 lg:px-12 bg-gradient-to-b from-[#050505] to-[#0A0A0A]" data-testid="weekly-deals-section">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-5 md:mb-8"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Flame size={20} className="text-red-500 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white font-['Syne']">Ofertas de la Semana</h2>
              <p className="text-[#A3A3A3] text-xs md:text-sm">Descuentos especiales</p>
            </div>
          </div>
          <a
            href="#recambios"
            className="hidden md:flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors text-sm"
          >
            Ver todos
            <ArrowRight size={16} />
          </a>
        </motion.div>

        {/* Deals Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-5"
        >
          {deals.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="relative glass-card rounded-xl md:rounded-2xl p-3 md:p-5 hover:border-[#D4AF37]/50 transition-all group"
              data-testid={`deal-${product.id}`}
            >
              {/* Discount Badge */}
              {product.discount_price && (
                <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full z-10">
                  -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                </div>
              )}

              {/* Image */}
              {product.image_url ? (
                <div className="aspect-square rounded-lg md:rounded-xl mb-2 md:mb-4 overflow-hidden bg-[#1A1A1A]">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg md:rounded-xl mb-2 md:mb-4 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] flex items-center justify-center">
                  <Tag size={32} className="text-[#333] md:w-12 md:h-12" />
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1 md:gap-2 mb-2">
                {product.is_weekly_deal && (
                  <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs bg-red-500/20 text-red-400 rounded-full">
                    Oferta
                  </span>
                )}
                {product.is_reconditioned && (
                  <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs bg-green-500/20 text-green-400 rounded-full">
                    Reacond.
                  </span>
                )}
              </div>

              {/* Info */}
              <h4 className="text-white font-medium md:font-semibold text-sm md:text-base mb-1 line-clamp-2 group-hover:text-[#D4AF37] transition-colors leading-tight">
                {product.name}
              </h4>
              <p className="text-[#666] text-[10px] md:text-xs mb-2 md:mb-3">Ref: {product.reference}</p>

              {/* Price */}
              <div className="flex items-end gap-2">
                {product.discount_price ? (
                  <>
                    <span className="text-lg md:text-xl font-bold text-[#D4AF37] font-mono">
                      {product.discount_price.toFixed(2)}€
                    </span>
                    <span className="text-[#666] line-through text-xs md:text-sm">
                      {product.price.toFixed(2)}€
                    </span>
                  </>
                ) : (
                  <span className="text-lg md:text-xl font-bold text-white font-mono">
                    {product.price.toFixed(2)}€
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile view all link */}
        <div className="md:hidden mt-5 text-center">
          <a
            href="#recambios"
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors text-sm font-medium"
          >
            Ver todos los recambios
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default WeeklyDeals;
