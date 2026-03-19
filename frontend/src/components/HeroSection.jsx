import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Phone, Clock } from 'lucide-react';

const SLIDES = [
  {
    image: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Castrez',
    titleAccent: 'Autrans',
    subtitle: 'TALLER MEC\u00c1NICO DE ALTA GAMA',
    text: 'Precisi\u00f3n, excelencia y tecnolog\u00eda avanzada para el cuidado de tu veh\u00edculo. M\u00e1s de 20 a\u00f1os de experiencia en Terrassa.',
  },
  {
    image: 'https://images.unsplash.com/photo-1558678542-d52f29185251?auto=format&fit=crop&w=1920&q=80',
    title: 'Recambios',
    titleAccent: 'de Calidad',
    subtitle: 'VENTA DE RECAMBIOS',
    text: 'En Castrez Autrans no solo reparamos tu veh\u00edculo, tambi\u00e9n vendemos recambios de calidad.',
  },
  {
    image: 'https://images.unsplash.com/photo-1720929630231-8241e3e5bcca?auto=format&fit=crop&w=1920&q=80',
    title: 'Piezas al',
    titleAccent: 'Mejor Precio',
    subtitle: 'RECAMBIOS PARA TU COCHE',
    text: 'Encuentra piezas y recambios para tu coche al mejor precio.',
  },
  {
    image: 'https://images.unsplash.com/photo-1673153069612-3c4b591860ce?auto=format&fit=crop&w=1920&q=80',
    title: 'Llama',
    titleAccent: 'Ahora',
    subtitle: 'CONT\u00c1CTANOS',
    text: 'Llama ahora: 613 43 00 84 | Horario: 8:30 a 13:00 y 15:00 a 19:00',
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];

  const imageVariants = {
    enter: { opacity: 0, scale: 1.1 },
    center: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.8, ease: 'easeIn' } },
  };

  const textVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.3, ease: 'easeOut' } },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.4 } }),
  };

  return (
    <section className="hero-parallax" data-testid="hero-section">
      {/* Background Images with Parallax */}
      <div className="hero-parallax-bg">
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="hero-parallax-img"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        </AnimatePresence>
      </div>

      {/* Dark Overlay */}
      <div className="hero-parallax-overlay" />

      {/* Content */}
      <div className="hero-parallax-content">
        <div className="max-w-5xl w-full px-4 md:px-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center"
            >
              <motion.p
                className="text-[#D4AF37] text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 md:mb-4 font-medium"
              >
                {slide.subtitle}
              </motion.p>

              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 tracking-tighter font-['Syne'] leading-[0.95]">
                {slide.title}
                <span className="text-gold-gradient"> {slide.titleAccent}</span>
              </h1>

              <p className="text-[#c0c0c0] text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-10 leading-relaxed">
                {slide.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* CTA Buttons - always visible */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <motion.a
              href="/citas"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-gold px-7 py-3.5 md:px-8 md:py-4 rounded-full text-sm md:text-base font-semibold w-full sm:w-auto text-center"
              data-testid="hero-cta-primary"
            >
              Solicitar Cita
            </motion.a>
            <motion.a
              href="/#servicios"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-7 py-3.5 md:px-8 md:py-4 rounded-full text-sm md:text-base font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors w-full sm:w-auto text-center"
              data-testid="hero-cta-secondary"
            >
              Ver Servicios
            </motion.a>
          </div>

          {/* Info Pills */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-5 mt-8 md:mt-12">
            <a
              href="tel:+34613430084"
              className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white/80 hover:border-[#D4AF37]/50 transition-colors"
              data-testid="hero-phone-pill"
            >
              <Phone size={14} className="text-[#D4AF37]" />
              613 43 00 84
            </a>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white/80">
              <Clock size={14} className="text-[#D4AF37]" />
              8:30-13:00 / 15:00-19:00
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        <div className="absolute bottom-20 md:bottom-16 left-0 right-0 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-[#D4AF37] transition-all"
            data-testid="hero-prev-btn"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === current ? 'w-8 bg-[#D4AF37]' : 'w-3 bg-white/25 hover:bg-white/40'
                }`}
                data-testid={`hero-dot-${i}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-[#D4AF37] transition-all"
            data-testid="hero-next-btn"
            aria-label="Siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-4 md:bottom-6"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-white/30"
          >
            <ChevronDown size={28} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
