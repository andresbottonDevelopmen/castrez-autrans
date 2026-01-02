import { motion } from 'framer-motion';
import { ChevronDown, Play } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="hero-section" data-testid="hero-section">
      {/* Video Background - High quality automotive video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="hero-video"
        poster="https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1920"
      >
        {/* Premium automotive workshop video */}
        <source
          src="https://videos.pexels.com/video-files/5512656/5512656-uhd_2560_1440_30fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="hero-overlay" />

      {/* Content */}
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#D4AF37] text-sm md:text-base tracking-[0.3em] uppercase mb-4 font-medium"
          >
            Taller Mecánico de Alta Gama
          </motion.p>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tighter font-['Syne']">
            Castrez
            <span className="text-gold-gradient"> Autrans</span>
          </h1>
          
          <p className="text-[#A3A3A3] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Precisión, excelencia y tecnología avanzada para el cuidado de tu vehículo.
            Más de 20 años de experiencia en Terrassa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="#citas"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-gold px-8 py-4 rounded-full text-base font-semibold"
              data-testid="hero-cta-primary"
            >
              Solicitar Cita
            </motion.a>
            <motion.a
              href="#servicios"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full text-base font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors"
              data-testid="hero-cta-secondary"
            >
              Ver Servicios
            </motion.a>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[#A3A3A3]"
          >
            <ChevronDown size={32} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
