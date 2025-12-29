import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

const packages = [
  {
    id: 'essential',
    name: 'Pack Essential',
    price: '79,90€',
    description: 'Mantenimiento básico para el día a día',
    features: [
      'Cambio de aceite (máx. 5L semi-sintético)',
      'Filtro de aceite nuevo',
      'Revisión de 20 puntos de seguridad',
      'Informe técnico detallado',
    ],
    featured: false,
  },
  {
    id: 'advance',
    name: 'Pack Advance',
    price: '149,90€',
    description: 'El más popular entre nuestros clientes',
    features: [
      'Todo lo del Pack Essential',
      'Filtro de aire',
      'Filtro de habitáculo',
      'Revisión completa de frenos',
      'Rellenado de niveles de líquidos',
    ],
    featured: true,
  },
  {
    id: 'premium',
    name: 'Pack Premium',
    price: 'Desde 229,90€',
    description: 'Servicio completo de alta gama',
    features: [
      'Revisión completa del vehículo',
      'Todos los filtros incluidos',
      'Diagnosis computarizada',
      'Lavado de cortesía',
      'Recogida y entrega a domicilio',
    ],
    featured: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const ServicesSection = () => {
  return (
    <section id="servicios" className="py-24 md:py-32 px-6 md:px-12" data-testid="services-section">
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
            Nuestros Servicios
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-['Syne'] tracking-tight">
            Mantenimiento Inteligente
          </h2>
          <p className="text-[#A3A3A3] max-w-2xl mx-auto">
            Paquetes diseñados para mantener tu vehículo en perfectas condiciones
          </p>
        </motion.div>

        {/* Packages Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              className={`package-card ${pkg.featured ? 'featured' : ''}`}
              data-testid={`package-${pkg.id}`}
            >
              {pkg.featured && (
                <div className="flex items-center gap-2 text-[#D4AF37] text-sm mb-4">
                  <Star size={16} fill="currentColor" />
                  <span className="font-medium">Más Popular</span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2 font-['Syne']">{pkg.name}</h3>
              <p className="text-[#A3A3A3] text-sm mb-4">{pkg.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-white font-mono">{pkg.price}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-[#E5E5E5]">
                    <Check size={18} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#citas"
                className={`block text-center py-3 rounded-full font-semibold transition-all ${
                  pkg.featured
                    ? 'btn-gold'
                    : 'border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
                }`}
                data-testid={`package-${pkg.id}-cta`}
              >
                Reservar Ahora
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-[#666] text-xs mt-8"
        >
          * Precios sujetos a volumen de aceite y tipo de motor. Consulte condiciones.
        </motion.p>
      </div>
    </section>
  );
};

export default ServicesSection;
