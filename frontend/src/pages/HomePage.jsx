import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Preloader from '@/components/Preloader';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import WeeklyDeals from '@/components/WeeklyDeals';
import ServicesSection from '@/components/ServicesSection';
import PartsSection from '@/components/PartsSection';
import AppointmentSection from '@/components/AppointmentSection';
import LocationSection from '@/components/LocationSection';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import PromoBanner from '@/components/PromoBanner';

const HomePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Preloader key="preloader" />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <Navbar />
        <PromoBanner />
        <HeroSection />
        <WeeklyDeals />
        <ServicesSection />
        <PartsSection />
        <AppointmentSection />
        <LocationSection />
        <Footer />
        <WhatsAppButton />
      </motion.div>
    </>
  );
};

export default HomePage;
