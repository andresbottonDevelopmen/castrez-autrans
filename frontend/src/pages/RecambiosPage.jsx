import Navbar from '@/components/Navbar';
import WeeklyDeals from '@/components/WeeklyDeals';
import PartsSection from '@/components/PartsSection';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { motion } from 'framer-motion';
import { Search, Wrench } from 'lucide-react';

const RecambiosPage = () => {
  return (
    <>
      <Navbar />

      {/* Page Header */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 px-4 md:px-12 bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                <Wrench size={22} className="text-[#D4AF37]" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-['Syne'] tracking-tight mb-4">
              Recambios y{' '}
              <span className="text-gold-gradient">Piezas</span>
            </h1>
            <p className="text-[#A3A3A3] text-sm md:text-base max-w-xl mx-auto">
              Encuentra piezas originales y reacondicionadas certificadas al mejor precio.
              Env&iacute;o express en 24-48h.
            </p>
          </motion.div>
        </div>
      </section>

      <WeeklyDeals />
      <PartsSection />
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default RecambiosPage;
